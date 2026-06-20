import { NextResponse } from 'next/server'

export async function GET() {
  const metrics = {
    cpu: 30 + Math.random() * 40,
    memory: 45 + Math.random() * 30,
    diskUsage: 52 + Math.random() * 15,
    activeConnections: Math.floor(20 + Math.random() * 80),
    requestsPerSec: 50 + Math.random() * 200,
    avgResponseTime: 30 + Math.random() * 170,
  }

  return NextResponse.json({ data: metrics })
}
