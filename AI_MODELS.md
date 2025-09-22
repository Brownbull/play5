# AI Models Configuration

This document explains the AI model configurations available in the Smart Notes application.

## Available AI Providers

### 1. Google AI (Gemini) - Default
- **Model**: `gemini-1.5-flash`
- **Capabilities**: Best natural language understanding, fast responses, reasoning explanations
- **Setup**: Add `GOOGLE_API_KEY` to `.env.server`
- **Get API Key**: https://aistudio.google.com/app/apikey (Free tier available)

### 2. HuggingFace - Updated with DistilBERT
- **Classification Model**: `distilbert-base-uncased` (NEW!)
- **NER Model**: `dbmdz/bert-large-cased-finetuned-conll03-english`
- **Text Generation**: `gpt2`
- **Capabilities**: Semantic embeddings for tag matching, free usage
- **Setup**: Add `HUGGINGFACE_API_KEY` to `.env.server`
- **Get API Key**: https://huggingface.co/settings/tokens (Free tier available)

### 3. OpenAI
- **Model**: Configurable (default: GPT-3.5/4)
- **Capabilities**: High-quality responses, comprehensive understanding
- **Setup**: Add `OPENAI_API_KEY` to `.env.server`
- **Get API Key**: https://platform.openai.com/api-keys (Paid service)

## HuggingFace DistilBERT Implementation

The HuggingFace service now uses **DistilBERT** (`distilbert-base-uncased`) for tag suggestions with an advanced semantic similarity approach:

### How It Works
1. **Feature Extraction**: Uses DistilBERT to generate embeddings for both the input text and available tags
2. **Semantic Similarity**: Calculates cosine similarity between text and tag embeddings
3. **Smart Ranking**: Returns the top 3 most semantically similar tags
4. **Fallback**: If embedding fails, falls back to keyword matching

### Benefits of DistilBERT
- **Faster**: 60% smaller than BERT, 95% of BERT's performance
- **Semantic Understanding**: Better at understanding context and meaning
- **Robust**: Works well with short texts and tag names
- **Free**: No API costs beyond HuggingFace's free tier

## Environment Variables

Add these to your `.env.server` file:

```bash
# Google AI (recommended)
GOOGLE_API_KEY=your_google_api_key_here

# HuggingFace with DistilBERT
HUGGINGFACE_API_KEY=your_huggingface_key_here
HF_MODEL_CLASSIFICATION=distilbert-base-uncased

# OpenAI (optional)
OPENAI_API_KEY=your_openai_key_here

# Set default provider (optional)
AI_PROVIDER=google  # Options: google, huggingface, openai
```

## Custom Model Configuration

You can override the HuggingFace models by setting these environment variables:

```bash
# Custom models (advanced users)
HF_MODEL_CLASSIFICATION=distilbert-base-uncased
HF_MODEL_NER=dbmdz/bert-large-cased-finetuned-conll03-english
HF_MODEL_TEXT_GENERATION=gpt2
GOOGLE_MODEL=gemini-1.5-flash
```

## Performance Comparison

| Provider | Speed | Quality | Cost | Best For |
|----------|--------|---------|------|----------|
| Google AI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Free* | General use, reasoning |
| HuggingFace (DistilBERT) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Free | Semantic matching, embeddings |
| OpenAI | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Paid | High-quality text generation |

*Free tiers have usage limits

## Testing Your Configuration

Use the Operations Test Panel in the dashboard to:
1. Test individual providers
2. Compare all providers simultaneously
3. Switch default providers
4. Monitor performance and accuracy

The DistilBERT implementation will automatically detect when it's configured and use semantic embeddings instead of zero-shot classification for better tag matching performance.