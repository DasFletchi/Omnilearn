import { NextRequest } from 'next/server'
import { convertToModelMessages, streamText, type UIMessage, type ModelMessage } from 'ai'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import {
  LEARNING_ASSISTANT_SYSTEM_PROMPT,
  quickActionPrompts,
  type QuickAction,
  type AIProvider,
} from '@/lib/ai-provider'

export const maxDuration = 30

type ChatRequestBody = {
  messages?: UIMessage[]
  worksheetContext?: string
  provider?: AIProvider
  quickAction?: QuickAction
}

function assertApiKey(providerName: AIProvider) {
  const requiredKey = {
    mistral: process.env.MISTRAL_API_KEY,
    'nvidia-nim': process.env.NVIDIA_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  }[providerName]

  if (!requiredKey) {
    throw new Error(
      `Missing API key for ${providerName}. Please configure the matching environment variable.`,
    )
  }
}

// Create provider instance based on selection.
function getProvider(providerName: AIProvider = 'mistral') {
  assertApiKey(providerName)

  switch (providerName) {
    case 'mistral': {
      const mistral = createMistral({
        apiKey: process.env.MISTRAL_API_KEY,
      })
      return mistral('mistral-large-latest')
    }

    case 'nvidia-nim': {
      // NVIDIA NIM uses an OpenAI-compatible API.
      const nvidia = createOpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      })
      return nvidia('meta/llama-3.1-70b-instruct')
    }

    case 'openai':
    default: {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      return openai('gpt-4o')
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      messages = [],
      worksheetContext = '',
      provider = 'mistral',
      quickAction,
    } = (await request.json()) as ChatRequestBody

    const modelMessages: ModelMessage[] = quickAction && worksheetContext
      ? [{ role: 'user', content: quickActionPrompts[quickAction](worksheetContext) }]
      : await convertToModelMessages(messages)

    const systemMessage = worksheetContext
      ? `${LEARNING_ASSISTANT_SYSTEM_PROMPT}\n\n---\n\nCurrent Study Material:\n${worksheetContext}`
      : LEARNING_ASSISTANT_SYSTEM_PROMPT

    const result = streamText({
      model: getProvider(provider),
      system: systemMessage,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process chat request'

    return Response.json({ error: message }, { status: 500 })
  }
}
