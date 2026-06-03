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

    const response = await model.invoke({
      document: {
        type: 'image',
        source: imageUrl 
          ? { type: 'url', url: imageUrl }
          : { type: 'base64', data: base64Image }
      },
      parseLanguage: true
    })

    return NextResponse.json({ 
      text: response.content,
      model: 'mistral-ocr-latest'
    })
  } catch (error) {
    console.error('[v0] OCR API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process OCR request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}