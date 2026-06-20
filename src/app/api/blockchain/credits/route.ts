import { NextResponse } from 'next/server'
import { CREDITS } from '@/lib/blockchain-store'

export async function GET() {
  return NextResponse.json({ data: CREDITS })
}
