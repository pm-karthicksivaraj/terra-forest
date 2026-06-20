import { NextResponse } from 'next/server'

const loadTestHistory = [
  {
    id: 1,
    date: '2024-12-15 09:30',
    users: 500,
    duration: '5m',
    avgResponseTime: 87,
    p95: 142,
    p99: 189,
    errorRate: 0.3,
    status: 'passed',
  },
  {
    id: 2,
    date: '2024-12-08 14:00',
    users: 500,
    duration: '5m',
    avgResponseTime: 124,
    p95: 198,
    p99: 245,
    errorRate: 0.8,
    status: 'passed',
  },
  {
    id: 3,
    date: '2024-11-30 10:15',
    users: 300,
    duration: '3m',
    avgResponseTime: 56,
    p95: 89,
    p99: 134,
    errorRate: 0.1,
    status: 'passed',
  },
  {
    id: 4,
    date: '2024-11-22 16:45',
    users: 1000,
    duration: '10m',
    avgResponseTime: 234,
    p95: 412,
    p99: 567,
    errorRate: 2.1,
    status: 'failed',
  },
  {
    id: 5,
    date: '2024-11-15 08:00',
    users: 500,
    duration: '5m',
    avgResponseTime: 95,
    p95: 156,
    p99: 198,
    errorRate: 0.5,
    status: 'passed',
  },
]

export async function GET() {
  return NextResponse.json({ data: loadTestHistory })
}
