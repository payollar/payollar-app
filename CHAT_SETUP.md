# AI Chat Feature Setup

This project uses Groq's Llama models for the AI chat feature.

## Prerequisites

1. A Groq API key from [console.groq.com](https://console.groq.com)
2. Node.js and pnpm installed

## Installation

The required packages are already installed:
- `@ai-sdk/groq` - Groq SDK for Llama models
- `ai` - Vercel AI SDK
- `react-markdown` - For rendering markdown in chat messages

## Environment Variables

Add the following to your `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Getting a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Features

- **Llama 3.3 70B Model**: Uses Groq's fast Llama 3.3 70B model for intelligent responses
- **Streaming Responses**: Real-time streaming of AI responses
- **Markdown Support**: AI responses support markdown formatting
- **Copy to Clipboard**: Copy any message with one click
- **Suggested Questions**: Quick-start questions for common marketing topics
- **Error Handling**: Graceful error handling with user-friendly messages
- **Auto-scroll**: Automatically scrolls to latest messages
- **Mobile Responsive**: Works seamlessly on all devices

## Usage

1. Navigate to `/chat` in your application
2. Start chatting with the AI marketing expert
3. Use suggested questions or type your own
4. Copy messages by hovering over them and clicking the copy icon

## Model Configuration

The chat uses `llama-3.3-70b-versatile` model with the following settings:
- Temperature: 0.7 (balanced creativity)
- Max Tokens: 2000
- System Prompt: Configured for marketing and advertising expertise

## Troubleshooting

### "GROQ_API_KEY is not configured" Error

Make sure you've:
1. Added `GROQ_API_KEY` to your `.env` file
2. Restarted your development server after adding the key
3. The key is valid and has proper permissions

### Chat Not Responding

1. Check your internet connection
2. Verify your API key is valid
3. Check the browser console for errors
4. Ensure the API route is accessible at `/api/chat`

## API Route

The chat API route is located at `app/api/chat/route.js` and handles:
- Message processing
- Groq model integration
- Streaming responses
- Error handling
