import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic is required' },
        { status: 400 }
      )
    }

    const validTopics = [
      'terra-forest.alerts',
      'terra-forest.pipeline',
      'terra-forest.carbon',
      'terra-forest.compliance',
    ]

    if (!validTopics.includes(topic)) {
      return NextResponse.json(
        { message: `Invalid topic: ${topic}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        topic,
        subscribed: true,
        subscribedAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString() },
    })
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
