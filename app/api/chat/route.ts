import { NextRequest } from 'next/server'
import { convertToModelMessages, streamText, type UIMessage, type ModelMessage, tool, type Message } from 'ai'
import { createMistral } from '@ai-sdk/mistral'
import { z } from 'zod'
import {
  LEARNING_ASSISTANT_SYSTEM_PROMPT,
  quickActionPrompts,
  type QuickAction,
  type AIProvider,
} from '@/lib/ai-provider'

export const maxDuration = 60

type ChatRequestBody = {
  messages?: UIMessage[]
  worksheetContext?: string
  provider?: AIProvider
  quickAction?: QuickAction
  worksheetAction?: 'update' | 'append'
  newWorksheetContent?: string
  uploadedImageBase64?: string
}

function assertApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error('Missing MISTRAL_API_KEY. Please configure the environment variable.')
  }
  return apiKey
}

// Create Mistral provider instance
function getProvider() {
  const apiKey = assertApiKey()
  const mistral = createMistral({ apiKey })
  return mistral('mistral-large-latest')
}

// Define tools for worksheet manipulation
const updateWorksheet = tool({
  description: 'Update or replace the study material content. Use this when the user wants to modify, improve, or replace the current worksheet content.',
  parameters: z.object({
    content: z.string().describe('The new complete worksheet content in Markdown format'),
    reason: z.string().describe('Brief explanation of why this change is being made'),
  }),
  execute: async ({ content, reason }) => {
    // This will be processed by the client to update the worksheet
    return { success: true, content, reason }
  },
})

const appendToWorksheet = tool({
  description: 'Add new content to the existing worksheet. Use this to append study material, summaries, or additional notes.',
  parameters: z.object({
    content: z.string().describe('The content to append to the worksheet'),
    section: z.string().describe('The section header for this content'),
  }),
  execute: async ({ content, section }) => {
    return { success: true, content, section }
  },
})

export async function POST(request: NextRequest) {
  try {
    const {
      messages = [],
      worksheetContext = '',
      provider = 'mistral',
      quickAction,
      worksheetAction,
      newWorksheetContent,
      uploadedImageBase64,
    } = (await request.json()) as ChatRequestBody

    // Handle worksheet update requests
    if (worksheetAction === 'update' && newWorksheetContent) {
      return Response.json({ 
        success: true, 
        action: 'update', 
        content: newWorksheetContent 
      })
    }

    // Build messages with optional image
    let modelMessages: ModelMessage[]

    if (uploadedImageBase64) {
      // If user uploaded an image, add it as context
      const imageMessage: ModelMessage = {
        role: 'user',
        content: [
          {
            type: 'image',
            image: uploadedImageBase64,
          },
          {
            type: 'text',
            text: 'This is my study material document. Please analyze it, extract the content, and then convert it into clean, well-formatted Markdown that I can use as study material. Structure it properly with headers, lists, and any formatting that makes sense for the content type (checklist, worksheet, notes, etc.).',
          },
        ],
      }

      if (quickAction && worksheetContext) {
        modelMessages = [imageMessage, { role: 'user', content: quickActionPrompts[quickAction](worksheetContext) }]
      } else {
        // Include previous messages for context
        const convertedMessages = await convertToModelMessages(messages)
        modelMessages = [imageMessage, ...convertedMessages]
      }
    } else {
      modelMessages = quickAction && worksheetContext
        ? [{ role: 'user', content: quickActionPrompts[quickAction](worksheetContext) }]
        : await convertToModelMessages(messages)
    }

    const systemMessage = worksheetContext
      ? `${LEARNING_ASSISTANT_SYSTEM_PROMPT}\n\n---\n\nCurrent Study Material:\n${worksheetContext}\n\nIMPORTANT: You have access to the worksheet content above. You can:\n1. Answer questions about it\n2. Ask if the user wants to modify or improve it\n3. Offer to add study guides, summaries, or practice questions to it\n\nWhen appropriate, suggest using the update_worksheet tool to add helpful study materials directly to the worksheet.`
      : `${LEARNING_ASSISTANT_SYSTEM_PROMPT}\n\nYou have access to worksheet tools that can add or modify study material. When the user asks to add content (like summaries, study guides, practice questions, or additional notes), use the appropriate tool to incorporate this directly into their study workspace.`

    const result = streamText({
      model: getProvider(),
      system: systemMessage,
      messages: modelMessages,
      tools: {
        update_worksheet: updateWorksheet,
        append_to_worksheet: appendToWorksheet,
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process chat request'

    return Response.json({ error: message }, { status: 500 })
  }
}
