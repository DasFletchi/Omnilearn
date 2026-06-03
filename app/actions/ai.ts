'use server'

import { streamText, type ModelMessage } from 'ai'
import { createMistral } from '@ai-sdk/mistral'
import {
  LEARNING_ASSISTANT_SYSTEM_PROMPT,
  quickActionPrompts,
  type QuickAction,
} from '@/lib/ai-provider'

function assertApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error('Missing MISTRAL_API_KEY. Please configure the environment variable.')
  }
  return apiKey
}

function getMistralProvider() {
  const apiKey = assertApiKey()
  const mistral = createMistral({ apiKey })
  return mistral('mistral-large-latest')
}

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  worksheetContext?: string,
) {
  const systemMessage = worksheetContext
    ? `${LEARNING_ASSISTANT_SYSTEM_PROMPT}\n\n---\n\nCurrent Study Material:\n${worksheetContext}`
    : LEARNING_ASSISTANT_SYSTEM_PROMPT

  const result = streamText({
    model: getMistralProvider(),
    system: systemMessage,
    messages: messages satisfies ModelMessage[],
  })

  return result.toTextStreamResponse()
}

export async function quickAction(
  action: QuickAction,
  content: string,
) {
  const prompt = quickActionPrompts[action](content)

  const result = streamText({
    model: getMistralProvider(),
    system: LEARNING_ASSISTANT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return result.toTextStreamResponse()
}
