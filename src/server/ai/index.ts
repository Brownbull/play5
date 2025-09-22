import { HuggingFaceService, aiService as hfService } from './huggingface'
import { OpenAIService, openAIService } from './openai'

// Environment variable to select AI provider
const AI_PROVIDER = process.env.AI_PROVIDER || 'huggingface'

// Unified interfaces
export interface AIServiceStatus {
  connected: boolean
  apiKeyConfigured: boolean
  provider: string
  error?: string
}

export interface AIClassificationResult {
  label: string
  score: number
}

// Unified AI Service
export class UnifiedAIService {
  private static instance: UnifiedAIService
  private provider: string
  private hfService: HuggingFaceService
  private openaiService: OpenAIService

  private constructor() {
    this.provider = AI_PROVIDER
    this.hfService = hfService
    this.openaiService = openAIService
  }

  public static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService()
    }
    return UnifiedAIService.instance
  }

  // Get current provider
  getProvider(): string {
    return this.provider
  }

  // Set provider dynamically
  setProvider(provider: 'huggingface' | 'openai'): void {
    this.provider = provider
  }

  // Test connection with current provider
  async testConnection(): Promise<AIServiceStatus> {
    try {
      if (this.provider === 'openai') {
        const result = await this.openaiService.testConnection()
        return {
          ...result,
          provider: 'openai'
        }
      } else {
        const result = await this.hfService.testConnection()
        return {
          ...result,
          provider: 'huggingface'
        }
      }
    } catch (error) {
      return {
        connected: false,
        apiKeyConfigured: false,
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Test connection with specific provider
  async testConnectionWithProvider(provider: 'huggingface' | 'openai'): Promise<AIServiceStatus> {
    try {
      if (provider === 'openai') {
        const result = await this.openaiService.testConnection()
        return {
          ...result,
          provider: 'openai'
        }
      } else {
        const result = await this.hfService.testConnection()
        return {
          ...result,
          provider: 'huggingface'
        }
      }
    } catch (error) {
      return {
        connected: false,
        apiKeyConfigured: false,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Suggest tags using current provider
  async suggestTags(itemContent: string, availableTags: string[]): Promise<string[]> {
    try {
      if (this.provider === 'openai') {
        return await this.openaiService.suggestTags(itemContent, availableTags)
      } else {
        return await this.hfService.suggestTags(itemContent, availableTags)
      }
    } catch (error) {
      console.error(`Tag suggestion failed with ${this.provider}:`, error)
      return []
    }
  }

  // Suggest tags with specific provider
  async suggestTagsWithProvider(
    itemContent: string, 
    availableTags: string[], 
    provider: 'huggingface' | 'openai'
  ): Promise<{ tags: string[], provider: string, error?: string }> {
    try {
      let tags: string[]
      if (provider === 'openai') {
        tags = await this.openaiService.suggestTags(itemContent, availableTags)
      } else {
        tags = await this.hfService.suggestTags(itemContent, availableTags)
      }
      return { tags, provider }
    } catch (error) {
      console.error(`Tag suggestion failed with ${provider}:`, error)
      return { 
        tags: [], 
        provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Parse note using current provider
  async parseNote(noteText: string): Promise<string[]> {
    try {
      if (this.provider === 'openai') {
        return await this.openaiService.parseNote(noteText)
      } else {
        return await this.hfService.parseNote(noteText)
      }
    } catch (error) {
      console.error(`Note parsing failed with ${this.provider}:`, error)
      return [noteText.trim()]
    }
  }

  // Generate text using current provider
  async generateText(prompt: string, maxLength: number = 100): Promise<string> {
    try {
      if (this.provider === 'openai') {
        return await this.openaiService.generateText(prompt, maxLength)
      } else {
        return await this.hfService.generateText(prompt, maxLength)
      }
    } catch (error) {
      console.error(`Text generation failed with ${this.provider}:`, error)
      return ''
    }
  }
}

// Export singleton instance
export const aiService = UnifiedAIService.getInstance()

// Export individual services for direct access if needed
export { hfService, openAIService }