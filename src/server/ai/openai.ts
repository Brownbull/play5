import OpenAI from 'openai'

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL_CHAT = process.env.OPENAI_MODEL_CHAT || 'gpt-3.5-turbo'
const OPENAI_MODEL_EMBEDDING = process.env.OPENAI_MODEL_EMBEDDING || 'text-embedding-ada-002'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

// TypeScript interfaces for responses
export interface OpenAIClassificationResult {
  label: string
  score: number
}

export interface OpenAIServiceStatus {
  connected: boolean
  apiKeyConfigured: boolean
  error?: string
}

// OpenAI Service Class
export class OpenAIService {
  private static instance: OpenAIService
  private client: OpenAI
  
  private constructor() {
    if (!OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY not configured. OpenAI features will be disabled.')
    }
    this.client = openai
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  // Test API connectivity
  async testConnection(): Promise<OpenAIServiceStatus> {
    try {
      if (!OPENAI_API_KEY) {
        return {
          connected: false,
          apiKeyConfigured: false,
          error: 'OPENAI_API_KEY not configured'
        }
      }

      // Test with a simple chat completion
      const response = await this.client.chat.completions.create({
        model: OPENAI_MODEL_CHAT,
        messages: [{ role: 'user', content: 'Hello, this is a test.' }],
        max_tokens: 5
      })

      return {
        connected: true,
        apiKeyConfigured: true
      }
    } catch (error) {
      console.error('OpenAI connection test failed:', error)
      return {
        connected: false,
        apiKeyConfigured: !!OPENAI_API_KEY,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Text Classification using chat completion
  async classifyText(text: string, candidateLabels: string[]): Promise<OpenAIClassificationResult[]> {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured')
      }

      const prompt = `Classify the following text into one or more of these categories: ${candidateLabels.join(', ')}.
Return a JSON array of objects with "label" and "score" (0-1 confidence) properties.
Only include categories that are relevant to the text.

Text: "${text}"

Response (JSON only):`

      const response = await this.client.chat.completions.create({
        model: OPENAI_MODEL_CHAT,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      try {
        const results = JSON.parse(content) as OpenAIClassificationResult[]
        return results.filter(result => 
          candidateLabels.includes(result.label) && 
          typeof result.score === 'number' && 
          result.score > 0
        )
      } catch (parseError) {
        console.error('Failed to parse OpenAI classification response:', content)
        return []
      }
    } catch (error) {
      console.error('OpenAI text classification failed:', error)
      throw new Error(`OpenAI text classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate text using chat completion
  async generateText(prompt: string, maxTokens: number = 100): Promise<string> {
    try {
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured')
      }

      const response = await this.client.chat.completions.create({
        model: OPENAI_MODEL_CHAT,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI text generation failed:', error)
      throw new Error(`OpenAI text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Suggest tags based on item content
  async suggestTags(itemContent: string, availableTags: string[]): Promise<string[]> {
    try {
      // Use classification to match content with available tags
      const classification = await this.classifyText(itemContent, availableTags)
      
      // Sort by confidence and take top 3
      const topTags = classification
        .filter(result => result.score > 0.1) // Minimum confidence threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Maximum 3 tags as per requirements
        .map(result => result.label)
      
      return topTags
    } catch (error) {
      console.error('OpenAI tag suggestion failed:', error)
      // Return empty array on error instead of throwing
      return []
    }
  }

  // Parse note into multiple items using AI
  async parseNote(noteText: string): Promise<string[]> {
    try {
      const prompt = `Parse the following note and extract separate actionable items or tasks.
Return a JSON array of strings, where each string is a distinct item or task.
If the note contains only one item, return an array with that single item.

Note: "${noteText}"

Response (JSON array only):`

      const response = await this.client.chat.completions.create({
        model: OPENAI_MODEL_CHAT,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        return [noteText.trim()]
      }

      try {
        const items = JSON.parse(content) as string[]
        return Array.isArray(items) && items.length > 0 
          ? items.filter(item => typeof item === 'string' && item.trim().length > 0)
          : [noteText.trim()]
      } catch (parseError) {
        console.error('Failed to parse OpenAI note parsing response:', content)
        return [noteText.trim()]
      }
    } catch (error) {
      console.error('OpenAI note parsing failed:', error)
      // Return original text as fallback
      return [noteText.trim()]
    }
  }
}

// Export singleton instance
export const openAIService = OpenAIService.getInstance()