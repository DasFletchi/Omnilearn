import { NextRequest, NextResponse } from 'next/server'

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

    // Use Mistral REST API directly for vision analysis
    // Build data URL from base64
    const dataUrl = `data:image/png;base64,${imageBase64}`

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: dataUrl,
              },
              {
                type: 'text',
                text: 'Please analyze this document/image and convert ALL the content into clean, well-formatted Markdown. Structure it properly with headers (# ## ###), bullet points, numbered lists, checkboxes, tables, and any formatting that best suits the content type (worksheet, checklist, notes, quiz, etc.). Preserve ALL information accurately. Include every detail from the original document. Return ONLY the Markdown content, nothing else.',
              },
            ],
          },
        ],
        stream: true,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errData = await response.text()
      throw new Error(`Mistral API error: ${response.status} ${errData}`)
    }

    // Parse the SSE stream
    let markdownContent = ''
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body from Mistral API')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              markdownContent += delta
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
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
