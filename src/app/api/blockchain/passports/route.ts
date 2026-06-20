import { NextResponse } from 'next/server'
import { PASSPORTS } from '@/lib/blockchain-store'

export async function GET() {
  return NextResponse.json({ data: PASSPORTS })
}
