import { NextResponse } from 'next/server'
import { metadataRecords } from '@/lib/data-governance-store'

export async function GET() {
  return NextResponse.json({ data: metadataRecords })
}
