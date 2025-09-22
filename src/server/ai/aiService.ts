import { HuggingFaceService, aiService as hfService } from './huggingface'
import { GoogleAIService, googleAIService } from './google'

export type AIProvider = 'huggingface' | 'google'

export interface UnifiedAIServiceStatus {
  provider: AIProvider
  connected: boolean
  apiKeyConfigured: boolean
  error?: string
}

export interface ProviderComparison {
  huggingface: UnifiedAIServiceStatus
  google: UnifiedAIServiceStatus
  recommended: AIProvider | null
}

// Unified AI Service that can use multiple providers
export class UnifiedAIService {
  private static instance: UnifiedAIService
  private hfService: HuggingFaceService
  private googleService: GoogleAIService
  private defaultProvider: AIProvider

  private constructor() {
    this.hfService = hfService
    this.googleService = googleAIService
    this.defaultProvider = 'google' // Default to Google as it's generally more capable for text understanding
  }

  public static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService()
    }
    return UnifiedAIService.instance
  }

  // Test connections for all providers
  async testAllProviders(): Promise<ProviderComparison> {
    const [hfStatus, googleStatus] = await Promise.all([
      this.hfService.testConnection(),
      this.googleService.testConnection()
    ])

    // Determine recommended provider
    let recommended: AIProvider | null = null
    if (googleStatus.connected) {
      recommended = 'google'
    } else if (hfStatus.connected) {
      recommended = 'huggingface'
    }

    return {
      huggingface: {
        provider: 'huggingface',
        ...hfStatus
      },
      google: {
        provider: 'google',
        ...googleStatus
      },
      recommended
    }
  }

  // Test specific provider
  async testProvider(provider: AIProvider): Promise<UnifiedAIServiceStatus> {
    let status
    if (provider === 'huggingface') {
      status = await this.hfService.testConnection()
    } else {
      status = await this.googleService.testConnection()
    }

    return {
      provider,
      ...status
    }
  }

  // Get the best available provider
  async getBestProvider(): Promise<AIProvider | null> {
    const comparison = await this.testAllProviders()
    return comparison.recommended
  }

  // Suggest tags using specified provider
  async suggestTags(
    itemContent: string,
    availableTags: string[],
    provider?: AIProvider
  ): Promise<string[]> {
    const useProvider = provider || this.defaultProvider

    try {
      if (useProvider === 'google') {
        // Check if Google is available
        const googleStatus = await this.googleService.testConnection()
        if (googleStatus.connected) {
          return await this.googleService.suggestTags(itemContent, availableTags)
        }
        // Fallback to HuggingFace if Google fails
        console.log('Google AI not available, falling back to HuggingFace')
      }

      // Use HuggingFace (either as primary choice or fallback)
      const hfStatus = await this.hfService.testConnection()
      if (hfStatus.connected) {
        return await this.hfService.suggestTags(itemContent, availableTags)
      }

      console.error('No AI providers available for tag suggestion')
      return []
    } catch (error) {
      console.error(`Tag suggestion failed with ${useProvider}:`, error)

      // Try the other provider as fallback
      const fallbackProvider = useProvider === 'google' ? 'huggingface' : 'google'
      try {
        console.log(`Attempting fallback to ${fallbackProvider}`)
        return await this.suggestTags(itemContent, availableTags, fallbackProvider)
      } catch (fallbackError) {
        console.error(`Fallback to ${fallbackProvider} also failed:`, fallbackError)
        return []
      }
    }
  }

  // Advanced tag suggestion with reasoning (Google only for now)
  async suggestTagsWithReasoning(
    itemContent: string,
    availableTags: string[]
  ): Promise<{ suggestedTags: string[], reasoning: string }> {
    try {
      const googleStatus = await this.googleService.testConnection()
      if (googleStatus.connected) {
        return await this.googleService.suggestTagsWithReasoning(itemContent, availableTags)
      }

      // Fallback to basic suggestion without reasoning
      const tags = await this.suggestTags(itemContent, availableTags, 'huggingface')
      return {
        suggestedTags: tags,
        reasoning: 'Used HuggingFace provider - reasoning not available'
      }
    } catch (error) {
      console.error('Tag suggestion with reasoning failed:', error)
      return {
        suggestedTags: [],
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Parse note using specified provider
  async parseNote(noteText: string, provider?: AIProvider): Promise<string[]> {
    const useProvider = provider || this.defaultProvider

    try {
      if (useProvider === 'google') {
        const googleStatus = await this.googleService.testConnection()
        if (googleStatus.connected) {
          return await this.googleService.parseNote(noteText)
        }
        console.log('Google AI not available, falling back to HuggingFace')
      }

      // Use HuggingFace (either as primary choice or fallback)
      const hfStatus = await this.hfService.testConnection()
      if (hfStatus.connected) {
        return await this.hfService.parseNote(noteText)
      }

      console.error('No AI providers available for note parsing')
      return [noteText.trim()]
    } catch (error) {
      console.error(`Note parsing failed with ${useProvider}:`, error)

      // Try the other provider as fallback
      const fallbackProvider = useProvider === 'google' ? 'huggingface' : 'google'
      try {
        console.log(`Attempting fallback to ${fallbackProvider}`)
        return await this.parseNote(noteText, fallbackProvider)
      } catch (fallbackError) {
        console.error(`Fallback to ${fallbackProvider} also failed:`, fallbackError)
        return [noteText.trim()]
      }
    }
  }

  // Set default provider
  setDefaultProvider(provider: AIProvider): void {
    this.defaultProvider = provider
  }

  // Get current default provider
  getDefaultProvider(): AIProvider {
    return this.defaultProvider
  }
}

// Export singleton instance
export const unifiedAIService = UnifiedAIService.getInstance()