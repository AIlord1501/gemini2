# Free AI Service Setup Guide

This guide helps you set up free AI alternatives when Vertex AI is not available.

## Quick Setup Options

### Option 1: Ollama (Recommended - Completely Free & Local)

1. **Download Ollama** from https://ollama.ai
2. **Install Ollama** on your system
3. **Download a model**:
   ```bash
   ollama pull llama2
   # or try other models:
   ollama pull mistral
   ollama pull codellama
   ```
4. **Start Ollama** (usually starts automatically):
   ```bash
   ollama serve
   ```
5. **No API keys needed!** The application will automatically detect and use Ollama.

### Option 2: Hugging Face (Free Tier)

1. **Create account** at https://huggingface.co
2. **Get API key** from https://huggingface.co/settings/tokens
3. **Add to .env file**:
   ```bash
   HUGGINGFACE_API_KEY=your_api_key_here
   ```

### Option 3: OpenAI-Compatible Free APIs

Popular free alternatives:
- **Together AI**: https://api.together.xyz (free tier)
- **Groq**: https://groq.com (fast inference)
- **OpenRouter**: https://openrouter.ai (multiple models)

1. **Sign up** for any of these services
2. **Get API key**
3. **Add to .env file**:
   ```bash
   OPENAI_FREE_API_URL=https://api.together.xyz
   OPENAI_FREE_API_KEY=your_api_key_here
   ```

## How It Works

The AI service tries providers in this order:

1. **Vertex AI** (if configured)
2. **Ollama** (if running locally)
3. **Hugging Face** (if API key provided)
4. **OpenAI-compatible API** (if configured)
5. **Enhanced static responses** (always available)

## Benefits of Each Option

### Ollama
- ✅ Completely free
- ✅ No API limits
- ✅ Works offline
- ✅ Privacy (data stays local)
- ❌ Requires local installation

### Hugging Face
- ✅ Easy setup
- ✅ Good free tier
- ✅ No local installation
- ❌ API rate limits

### OpenAI-Compatible APIs
- ✅ High quality responses
- ✅ Fast inference
- ✅ Multiple model options
- ❌ May have usage limits

### Static Responses
- ✅ Always available
- ✅ Instant responses
- ✅ Tailored to user skills
- ❌ Less dynamic

## Testing Your Setup

1. **Start your application**
2. **Check the console** for initialization messages:
   ```
   🤖 AI Service initialized. Vertex AI: ❌
   📡 Available fallback AI services: ['ollama', 'huggingface']
   ```
3. **Try the career analysis** or chat features
4. **Look for success messages**:
   ```
   ✅ Generated content using Ollama (local AI)
   ```

## Troubleshooting

### Ollama Issues
- Ensure Ollama is running: `ollama serve`
- Check if model is downloaded: `ollama list`
- Verify port 11434 is accessible

### API Issues
- Check API key validity
- Verify internet connection
- Look for error messages in console

### Firestore Issues
- Firestore is optional for core functionality
- Career analysis works without database
- Mock tests are generated but not saved if Firestore unavailable

## Performance Tips

1. **Use Ollama** for best performance and privacy
2. **Combine multiple services** for redundancy
3. **Static responses** provide instant fallback
4. **All features work** regardless of AI availability

## Environment Variables Summary

Copy `.env.example` to `.env` and configure:

```bash
# Primary (optional)
GOOGLE_CLOUD_PROJECT=your-project-id

# Free alternatives (optional)
HUGGINGFACE_API_KEY=your-key
OPENAI_FREE_API_URL=https://api.provider.com
OPENAI_FREE_API_KEY=your-key

# Required for full functionality
JWT_SECRET_KEY=your-secret
```

**Note**: The application works even if no AI services are configured - it will use intelligent static responses that adapt to user skills!