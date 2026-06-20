import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const users = body.users || 500
  const duration = body.duration || '5m'

  // Return a new load test entry
  const avgResponse = Math.floor(50 + Math.random() * 150)
  const p95 = Math.floor(avgResponse * 1.6 + Math.random() * 30)
  const p99 = Math.floor(avgResponse * 2.0 + Math.random() * 50)
  const errorRate = parseFloat((Math.random() * 2).toFixed(1))

  const newTest = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    users,
    duration,
    avgResponseTime: avgResponse,
    p95,
    p99,
    errorRate,
    status: avgResponse < 200 && errorRate < 1 ? 'passed' : 'failed',
  }

  return NextResponse.json({ data: newTest })
}
