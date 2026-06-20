import { NextResponse } from 'next/server'
import { syncLog } from '@/lib/data-governance-store'

export async function GET() {
  return NextResponse.json({ data: syncLog })
}
