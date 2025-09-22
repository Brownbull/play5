import { GoogleGenerativeAI } from '@google/generative-ai'

// Environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-1.5-flash'

// Initialize Google AI client
let genAI: GoogleGenerativeAI | null = null
if (GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
}

// TypeScript interfaces
export interface GoogleAIServiceStatus {
  connected: boolean
  apiKeyConfigured: boolean
  error?: string
}

export interface TagSuggestionResult {
  suggestedTags: string[]
  reasoning: string
}

// Google AI Service Class
export class GoogleAIService {
  private static instance: GoogleAIService
  private client: GoogleGenerativeAI | null

  private constructor() {
    if (!GOOGLE_API_KEY) {
      console.warn('⚠️  GOOGLE_API_KEY not configured. Google AI features will be disabled.')
    }
    this.client = genAI
  }

  public static getInstance(): GoogleAIService {
    if (!GoogleAIService.instance) {
      GoogleAIService.instance = new GoogleAIService()
    }
    return GoogleAIService.instance
  }

  // Test API connectivity
  async testConnection(): Promise<GoogleAIServiceStatus> {
    try {
      if (!GOOGLE_API_KEY || !this.client) {
        return {
          connected: false,
          apiKeyConfigured: false,
          error: 'GOOGLE_API_KEY not configured'
        }
      }

      // Test with a simple text generation
      const model = this.client.getGenerativeModel({ model: GOOGLE_MODEL })
      const result = await model.generateContent('Hello, test connection.')

      return {
        connected: true,
        apiKeyConfigured: true
      }
    } catch (error) {
      console.error('Google AI connection test failed:', error)
      return {
        connected: false,
        apiKeyConfigured: !!GOOGLE_API_KEY,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Suggest tags based on item content using Google AI
  async suggestTags(itemContent: string, availableTags: string[]): Promise<string[]> {
    try {
      if (!GOOGLE_API_KEY || !this.client) {
        throw new Error('GOOGLE_API_KEY not configured')
      }

      const model = this.client.getGenerativeModel({ model: GOOGLE_MODEL })

      const prompt = `Given the following text content, suggest the most relevant tags from the available options. Return only the tag names, separated by commas, with no additional text or explanation.

Content: "${itemContent}"

Available tags: ${availableTags.join(', ')}

Rules:
- Select maximum 3 most relevant tags
- Only use tags from the available list
- Consider the main topics, themes, and keywords in the content
- Return tag names only, separated by commas`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the response to extract tag names
      const suggestedTags = text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .filter(tag => availableTags.includes(tag))
        .slice(0, 3) // Ensure maximum 3 tags

      return suggestedTags
    } catch (error) {
      console.error('Google AI tag suggestion failed:', error)
      // Return empty array on error instead of throwing
      return []
    }
  }

  // Advanced tag suggestion with reasoning
  async suggestTagsWithReasoning(itemContent: string, availableTags: string[]): Promise<TagSuggestionResult> {
    try {
      if (!GOOGLE_API_KEY || !this.client) {
        throw new Error('GOOGLE_API_KEY not configured')
      }

      const model = this.client.getGenerativeModel({ model: GOOGLE_MODEL })

      const prompt = `Analyze the following text content and suggest the most relevant tags from the available options. Provide both the suggested tags and your reasoning.

Content: "${itemContent}"

Available tags: ${availableTags.join(', ')}

Please respond in this exact JSON format:
{
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "reasoning": "Brief explanation of why these tags were chosen"
}

Rules:
- Select maximum 3 most relevant tags
- Only use tags from the available list
- Consider the main topics, themes, and keywords in the content`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(text)
        return {
          suggestedTags: parsed.suggestedTags?.slice(0, 3) || [],
          reasoning: parsed.reasoning || 'No reasoning provided'
        }
      } catch (parseError) {
        // Fallback: extract tags manually if JSON parsing fails
        const tagMatches = availableTags.filter(tag =>
          text.toLowerCase().includes(tag.toLowerCase())
        ).slice(0, 3)

        return {
          suggestedTags: tagMatches,
          reasoning: 'Failed to parse structured response, extracted tags from text'
        }
      }
    } catch (error) {
      console.error('Google AI tag suggestion with reasoning failed:', error)
      return {
        suggestedTags: [],
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Parse note into multiple items using Google AI
  async parseNote(noteText: string): Promise<string[]> {
    try {
      if (!GOOGLE_API_KEY || !this.client) {
        throw new Error('GOOGLE_API_KEY not configured')
      }

      const model = this.client.getGenerativeModel({ model: GOOGLE_MODEL })

      const prompt = `Break down the following text into separate, meaningful items. Each item should be a complete thought or piece of information that can stand alone.

Text: "${noteText}"

Rules:
- Split into logical, meaningful segments
- Each item should be complete and understandable on its own
- Preserve the original meaning and context
- Return each item on a new line with no numbering or bullets
- If the text is already a single coherent item, return it as is

Items:`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Split by lines and clean up
      const items = text
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 10) // Filter out very short fragments
        .filter(item => /[a-zA-Z]/.test(item)) // Must contain letters
        .map(item => item.replace(/^[-•*\d\.]+\s*/, '')) // Remove bullets/numbers
        .filter(item => item.length > 0)

      // If no valid items found, return original text
      if (items.length === 0) {
        return [noteText.trim()]
      }

      return items
    } catch (error) {
      console.error('Google AI note parsing failed:', error)
      // Return original text as fallback
      return [noteText.trim()]
    }
  }

  // Generate content based on prompt
  async generateText(prompt: string, maxTokens: number = 150): Promise<string> {
    try {
      if (!GOOGLE_API_KEY || !this.client) {
        throw new Error('GOOGLE_API_KEY not configured')
      }

      const model = this.client.getGenerativeModel({
        model: GOOGLE_MODEL,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        }
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return text.trim()
    } catch (error) {
      console.error('Google AI text generation failed:', error)
      throw new Error(`Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Export singleton instance
export const googleAIService = GoogleAIService.getInstance()