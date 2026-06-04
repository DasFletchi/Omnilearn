import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

type WorksheetUpdateRequest = {
  action: 'update' | 'append' | 'replace'
  content?: string
  search?: string
  replacement?: string
  index?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorksheetUpdateRequest

    // For now, we just acknowledge the request
    // The actual worksheet state is managed client-side
    // This endpoint can be used for persistence later

    const { action, content } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Return success with the action acknowledged
    // The client will handle the actual state update
    return NextResponse.json({
      success: true,
      action,
      content: content || null,
      message: `Worksheet ${action} action acknowledged`
    })
  } catch (error) {
    console.error('[v0] Worksheet API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process worksheet request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}