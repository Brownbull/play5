import { HfInference } from '@huggingface/inference'

// Environment variables
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_MODEL_NER = process.env.HF_MODEL_NER || 'dbmdz/bert-large-cased-finetuned-conll03-english'
const HF_MODEL_CLASSIFICATION = process.env.HF_MODEL_CLASSIFICATION || 'microsoft/DialoGPT-medium'
const HF_MODEL_TEXT_GENERATION = process.env.HF_MODEL_TEXT_GENERATION || 'gpt2'

// Initialize Hugging Face client
const hf = new HfInference(HF_API_KEY)

// TypeScript interfaces for model responses
export interface NEREntity {
  entity_group: string
  confidence: number
  word: string
  start: number
  end: number
}

export interface ClassificationResult {
  label: string
  score: number
}

export interface GeneratedText {
  generated_text: string
}

export interface AIServiceStatus {
  connected: boolean
  apiKeyConfigured: boolean
  error?: string
}

// AI Service Class
export class HuggingFaceService {
  private static instance: HuggingFaceService
  private client: HfInference
  
  private constructor() {
    if (!HF_API_KEY) {
      console.warn('⚠️  HUGGINGFACE_API_KEY not configured. AI features will be disabled.')
    }
    this.client = hf
  }

  public static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService()
    }
    return HuggingFaceService.instance
  }

  // Test API connectivity
  async testConnection(): Promise<AIServiceStatus> {
    try {
      if (!HF_API_KEY) {
        return {
          connected: false,
          apiKeyConfigured: false,
          error: 'HUGGINGFACE_API_KEY not configured'
        }
      }

      // Test with a simple text classification
      const result = await this.client.textClassification({
        model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        inputs: 'Hello world, this is a test.'
      })

      return {
        connected: true,
        apiKeyConfigured: true
      }
    } catch (error) {
      console.error('HuggingFace connection test failed:', error)
      return {
        connected: false,
        apiKeyConfigured: !!HF_API_KEY,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Named Entity Recognition - Extract entities from text
  async extractEntities(text: string): Promise<NEREntity[]> {
    try {
      if (!HF_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY not configured')
      }

      const result = await this.client.tokenClassification({
        model: HF_MODEL_NER,
        inputs: text
      })

      // Transform the result to match our interface
      return (result as any[]).map((item: any) => ({
        entity_group: item.entity_group || item.entity,
        confidence: item.confidence || item.score || 0,
        word: item.word,
        start: item.start,
        end: item.end
      }))
    } catch (error) {
      console.error('NER extraction failed:', error)
      throw new Error(`NER extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Text Classification - Classify intent or category
  async classifyText(text: string, candidateLabels: string[]): Promise<ClassificationResult[]> {
    try {
      if (!HF_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY not configured')
      }

      const result = await this.client.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text,
        parameters: {
          candidate_labels: candidateLabels
        }
      })

      // Transform result to our interface
      const resultAny = result as any
      const scores = resultAny.scores || []
      const labels = resultAny.labels || []
      
      return labels.map((label: string, index: number) => ({
        label,
        score: scores[index] || 0
      }))
    } catch (error) {
      console.error('Text classification failed:', error)
      throw new Error(`Text classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Text Generation - Generate text based on prompt
  async generateText(prompt: string, maxLength: number = 100): Promise<string> {
    try {
      if (!HF_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY not configured')
      }

      const result = await this.client.textGeneration({
        model: HF_MODEL_TEXT_GENERATION,
        inputs: prompt,
        parameters: {
          max_length: maxLength,
          temperature: 0.7,
          do_sample: true
        }
      })

      return result.generated_text || ''
    } catch (error) {
      console.error('Text generation failed:', error)
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Suggest tags based on item content
  async suggestTags(itemContent: string, availableTags: string[]): Promise<string[]> {
    try {
      // Use zero-shot classification to match content with available tags
      const classification = await this.classifyText(itemContent, availableTags)
      
      // Sort by confidence and take top 3
      const topTags = classification
        .filter(result => result.score > 0.1) // Minimum confidence threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Maximum 3 tags as per requirements
        .map(result => result.label)
      
      return topTags
    } catch (error) {
      console.error('Tag suggestion failed:', error)
      // Return empty array on error instead of throwing
      return []
    }
  }

  // Parse note into multiple items
  async parseNote(noteText: string): Promise<string[]> {
    try {
      // Extract entities to identify separate items
      const entities = await this.extractEntities(noteText)
      
      // Simple heuristic: split by sentences and filter meaningful ones
      const sentences = noteText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10) // Filter out very short fragments
        .filter(s => /[a-zA-Z]/.test(s)) // Must contain letters
      
      // If we have multiple sentences, return them as separate items
      if (sentences.length > 1) {
        return sentences
      }
      
      // Otherwise, return the original text as a single item
      return [noteText.trim()]
    } catch (error) {
      console.error('Note parsing failed:', error)
      // Return original text as fallback
      return [noteText.trim()]
    }
  }
}

// Export singleton instance
export const aiService = HuggingFaceService.getInstance()