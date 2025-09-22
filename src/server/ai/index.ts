import { HuggingFaceService, aiService as hfService } from './huggingface'
import { OpenAIService, openAIService } from './openai'
import { GoogleAIService, googleAIService } from './google'

// Environment variable to select AI provider
const AI_PROVIDER = process.env.AI_PROVIDER || 'google'

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
  private googleService: GoogleAIService

  private constructor() {
    this.provider = AI_PROVIDER
    this.hfService = hfService
    this.openaiService = openAIService
    this.googleService = googleAIService
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
  setProvider(provider: 'huggingface' | 'openai' | 'google'): void {
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
      } else if (this.provider === 'google') {
        const result = await this.googleService.testConnection()
        return {
          ...result,
          provider: 'google'
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
  async testConnectionWithProvider(provider: 'huggingface' | 'openai' | 'google'): Promise<AIServiceStatus> {
    try {
      if (provider === 'openai') {
        const result = await this.openaiService.testConnection()
        return {
          ...result,
          provider: 'openai'
        }
      } else if (provider === 'google') {
        const result = await this.googleService.testConnection()
        return {
          ...result,
          provider: 'google'
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
      } else if (this.provider === 'google') {
        return await this.googleService.suggestTags(itemContent, availableTags)
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
    provider: 'huggingface' | 'openai' | 'google'
  ): Promise<{ tags: string[], provider: string, error?: string }> {
    try {
      let tags: string[]
      if (provider === 'openai') {
        tags = await this.openaiService.suggestTags(itemContent, availableTags)
      } else if (provider === 'google') {
        tags = await this.googleService.suggestTags(itemContent, availableTags)
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
      } else if (this.provider === 'google') {
        return await this.googleService.parseNote(noteText)
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
      } else if (this.provider === 'google') {
        return await this.googleService.generateText(prompt, maxLength)
      } else {
        return await this.hfService.generateText(prompt, maxLength)
      }
    } catch (error) {
      console.error(`Text generation failed with ${this.provider}:`, error)
      return ''
    }
  }

  // Extract named entities using current provider (primarily HuggingFace)
  async extractNamedEntities(text: string): Promise<{
    entities: any[],
    locations: string[],
    persons: string[],
    organizations: string[]
  }> {
    try {
      // For now, only HuggingFace service has NER implementation
      return await this.hfService.extractNamedEntities(text)
    } catch (error) {
      console.error(`Named entity extraction failed:`, error)
      return { entities: [], locations: [], persons: [], organizations: [] }
    }
  }

  // Classify item intent using current provider
  async classifyItemIntent(itemText: string): Promise<{ category: string, confidence: number }> {
    try {
      // For now, only HuggingFace service has intent classification implementation
      return await this.hfService.classifyItemIntent(itemText)
    } catch (error) {
      console.error(`Intent classification failed:`, error)
      return { category: 'general', confidence: 0.1 }
    }
  }
}

// Export singleton instance
export const aiService = UnifiedAIService.getInstance()

// Export individual services for direct access if needed
export { hfService, openAIService, googleAIService }