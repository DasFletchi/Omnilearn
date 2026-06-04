import { NextRequest, NextResponse } from 'next/server'
import { createMistral } from '@ai-sdk/mistral'

export const maxDuration = 60 // 60 seconds for OCR processing

type OCRRequestBody = {
  imageUrl?: string
  base64Image?: string
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, base64Image } = (await request.json()) as OCRRequestBody

    if (!imageUrl && !base64Image) {
      return NextResponse.json(
        { error: 'Either imageUrl or base64Image is required' },
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

    // Use mistral-ocr-latest model for document scanning
    const model = mistral.ocr('mistral-ocr-latest')

    let documentInput
    if (imageUrl) {
      documentInput = {
        type: 'document' as const,
        source: {
          type: 'url' as const,
          url: imageUrl
        }
      }
    } else {
      documentInput = {
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          data: base64Image
        }
      }
    }

    const response = await model.invoke({
      document: documentInput,
      parseLanguage: true
    })

    // Extract text from response - handle different possible structures
    let extractedText = ''
    if (typeof response.content === 'string') {
      extractedText = response.content
    } else if (Array.isArray(response.content)) {
      extractedText = response.content.map(part => 
        part.type === 'text' ? part.text : ''
      ).join('\n\n')
    } else if (response.content && typeof response.content === 'object' && 'text' in response.content) {
      extractedText = (response.content as { text: string }).text
    }

    return NextResponse.json({ 
      text: extractedText,
      model: 'mistral-ocr-latest'
    })
  } catch (error) {
    console.error('[OCR] API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process OCR request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}