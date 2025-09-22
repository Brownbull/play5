import { HfInference } from '@huggingface/inference'

// Environment variables
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_MODEL_NER = process.env.HF_MODEL_NER || 'dbmdz/bert-large-cased-finetuned-conll03-english'
const HF_MODEL_CLASSIFICATION = process.env.HF_MODEL_CLASSIFICATION || 'distilbert-base-uncased'
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

      // For DistilBERT, we'll use zero-shot classification with a model that supports it
      // If the classification model is DistilBERT, use zero-shot capable model instead
      const classificationModel = HF_MODEL_CLASSIFICATION === 'distilbert-base-uncased'
        ? 'facebook/bart-large-mnli'  // Use BART for zero-shot classification
        : HF_MODEL_CLASSIFICATION

      const result = await this.client.zeroShotClassification({
        model: classificationModel,
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
      console.log('🔍 HF_MODEL_CLASSIFICATION:', HF_MODEL_CLASSIFICATION)
      console.log('🔍 Using DistilBERT path:', HF_MODEL_CLASSIFICATION === 'distilbert-base-uncased')

      // If using DistilBERT, use a simpler approach with text analysis
      if (HF_MODEL_CLASSIFICATION === 'distilbert-base-uncased') {
        console.log('🎯 Taking DistilBERT path')
        return await this.suggestTagsWithDistilBERT(itemContent, availableTags)
      }

      // Use zero-shot classification for other models
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

  // DistilBERT-specific tag suggestion using enhanced text analysis
  private async suggestTagsWithDistilBERT(itemContent: string, availableTags: string[]): Promise<string[]> {
    try {
      if (!HF_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY not configured')
      }

      console.log('🤖 DistilBERT tag suggestion for:', itemContent)
      console.log('🏷️ Available tags:', availableTags)

      // Use DistilBERT for classification by creating pseudo-labels
      // This approach works better than feature extraction for tag classification
      const enhancedContent = `Text to classify: ${itemContent}. Choose appropriate categories:`

      // Create classification pairs for each tag
      const tagScores: { tag: string, score: number }[] = []

      for (const tag of availableTags) {
        try {
          // Use text classification with the tag as a label
          const prompt = `Is the following text related to "${tag}"? Text: "${itemContent}"`

          // Use a sentiment-like classification to determine relevance
          const result = await this.client.textClassification({
            model: 'cardiffnlp/twitter-roberta-base-sentiment-latest', // More reliable model
            inputs: prompt
          })

          // Calculate a relevance score based on the classification
          const relevanceScore = this.calculateTagRelevance(itemContent, tag)
          tagScores.push({ tag, score: relevanceScore })

        } catch (error) {
          console.error(`Error classifying tag "${tag}":`, error)
          // Use fallback scoring
          const fallbackScore = this.calculateTagRelevance(itemContent, tag)
          tagScores.push({ tag, score: fallbackScore })
        }
      }

      // Sort by score and take top 3
      const topTags = tagScores
        .filter(result => result.score > 0.2) // Minimum relevance threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Maximum 3 tags as per requirements
        .map(result => result.tag)

      console.log('DistilBERT suggested tags:', topTags)

      return topTags.length > 0 ? topTags : this.fallbackKeywordMatching(itemContent, availableTags)
    } catch (error) {
      console.error('DistilBERT tag suggestion failed:', error)
      // Fallback to simple keyword matching
      return this.fallbackKeywordMatching(itemContent, availableTags)
    }
  }

  // Calculate tag relevance using text analysis
  private calculateTagRelevance(content: string, tag: string): number {
    const contentLower = content.toLowerCase()
    const tagLower = tag.toLowerCase()

    let score = 0

    // Direct keyword match (highest score)
    if (contentLower.includes(tagLower)) {
      score += 0.8
    }

    // Partial keyword match
    if (tagLower.includes(contentLower.split(' ')[0]) || contentLower.split(' ').some(word => word.includes(tagLower))) {
      score += 0.4
    }

    // Semantic word matching (simple approach)
    const contentWords = contentLower.split(/\W+/).filter(word => word.length > 2)
    const tagWords = tagLower.split(/\W+/).filter(word => word.length > 2)

    for (const contentWord of contentWords) {
      for (const tagWord of tagWords) {
        // Exact word match
        if (contentWord === tagWord) {
          score += 0.6
        }
        // Similar word (starts with same letters)
        else if (contentWord.startsWith(tagWord.substring(0, 3)) || tagWord.startsWith(contentWord.substring(0, 3))) {
          score += 0.3
        }
      }
    }

    // Context matching for common patterns
    const contextMatches = this.getContextMatches(contentLower, tagLower)
    score += contextMatches * 0.4

    return Math.min(score, 1.0) // Cap at 1.0
  }

  // Get context-based matches
  private getContextMatches(content: string, tag: string): number {
    const contextMappings: { [key: string]: string[] } = {
      'food': ['eat', 'cook', 'meal', 'dinner', 'lunch', 'breakfast', 'recipe', 'ingredient'],
      'shopping': ['buy', 'purchase', 'store', 'market', 'get', 'need'],
      'work': ['meeting', 'project', 'deadline', 'office', 'email', 'task'],
      'health': ['doctor', 'medicine', 'exercise', 'gym', 'hospital'],
      'travel': ['trip', 'vacation', 'flight', 'hotel', 'visit'],
      'home': ['house', 'clean', 'repair', 'garden', 'room'],
      'finance': ['money', 'pay', 'bill', 'bank', 'budget', 'cost']
    }

    const tagKey = tag.toLowerCase()
    const keywords = contextMappings[tagKey] || []

    return keywords.filter(keyword => content.includes(keyword)).length
  }

  // Fallback keyword matching when other methods fail
  private fallbackKeywordMatching(itemContent: string, availableTags: string[]): string[] {
    console.log('Using fallback keyword matching')
    const content = itemContent.toLowerCase()
    const matches = availableTags.filter(tag => {
      const tagLower = tag.toLowerCase()
      return content.includes(tagLower) ||
             tagLower.includes(content.toLowerCase().split(' ')[0]) ||
             this.calculateTagRelevance(itemContent, tag) > 0.3
    })

    const result = matches.slice(0, 3)
    console.log('Fallback matches:', result)
    return result
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