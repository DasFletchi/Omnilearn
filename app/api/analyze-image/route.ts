import { NextRequest, NextResponse } from 'next/server'
import { createMistral } from '@ai-sdk/mistral'

export const maxDuration = 60

type AnalyzeRequestBody = {
  imageBase64: string
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = (await request.json()) as AnalyzeRequestBody

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const mistral = createMistral({ apiKey })
    const model = mistral('mistral-large-latest')

    // Use vision to analyze the image and convert to Markdown
    const result = await model.doStream({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: imageBase64,
            },
            {
              type: 'text',
              text: 'Please analyze this document/image and convert ALL the content into clean, well-formatted Markdown. Structure it properly with headers (# ## ###), bullet points, numbered lists, checkboxes, tables, and any formatting that best suits the content type (worksheet, checklist, notes, quiz, etc.). Preserve ALL information accurately. Include every detail from the original document. Return ONLY the Markdown content, nothing else.',
            },
          ],
        },
      ],
    })

    // Collect the response
    let markdownContent = ''
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'text-delta') {
        markdownContent += chunk.textDelta
      }
    }

    return NextResponse.json({
      markdown: markdownContent,
      success: true,
    })
  } catch (error) {
    console.error('[Analyze Image] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}