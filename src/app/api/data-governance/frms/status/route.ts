import { NextResponse } from 'next/server'
import { syncStatus } from '@/lib/data-governance-store'

export async function GET() {
  return NextResponse.json({ data: syncStatus })
}
