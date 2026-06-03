'use server'

import { streamText } from 'ai'
import { createMistral } from '@ai-sdk/mistral'
import { 
  LEARNING_ASSISTANT_SYSTEM_PROMPT, 
  quickActionPrompts,
  type QuickAction,
  type AIProvider 
} from '@/lib/ai-provider'

// Create provider instance based on selection
function getProvider(providerName: AIProvider = 'mistral') {
  switch (providerName) {
    case 'mistral':
      const mistral = createMistral({
        apiKey: process.env.MISTRAL_API_KEY,
      })
      return mistral('mistral-large-latest')
    
    case 'nvidia-nim':
      // NVIDIA NIM uses OpenAI-compatible API
      const { createOpenAI } = require('@ai-sdk/openai')
      const nvidia = createOpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      })
      return nvidia('meta/llama-3.1-70b-instruct')
    
    case 'openai':
    default:
      const { createOpenAI: createOAI } = require('@ai-sdk/openai')
      const openai = createOAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      return openai('gpt-4o')
  }
}

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  worksheetContext?: string,
  provider: AIProvider = 'mistral'
) {
  const systemMessage = worksheetContext 
    ? `${LEARNING_ASSISTANT_SYSTEM_PROMPT}\n\n---\n\nCurrent Study Material:\n${worksheetContext}`
    : LEARNING_ASSISTANT_SYSTEM_PROMPT

  const result = streamText({
    model: getProvider(provider),
    system: systemMessage,
    messages,
  })

  return result.toDataStreamResponse()
}

export async function quickAction(
  action: QuickAction,
  content: string,
  provider: AIProvider = 'mistral'
) {
  const prompt = quickActionPrompts[action](content)

  const result = streamText({
    model: getProvider(provider),
    system: LEARNING_ASSISTANT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return result.toDataStreamResponse()
}
