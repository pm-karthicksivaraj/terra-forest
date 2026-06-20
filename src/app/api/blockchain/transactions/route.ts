import { NextResponse } from 'next/server'
import { TRANSACTIONS } from '@/lib/blockchain-store'

export async function GET() {
  return NextResponse.json({ data: TRANSACTIONS })
}
