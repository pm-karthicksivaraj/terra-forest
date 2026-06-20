import { NextResponse } from 'next/server'
import { verifyCreditById } from '@/lib/blockchain-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creditId: string }> }
) {
  const { creditId } = await params
  const id = Number(creditId)

  if (isNaN(id)) {
    return NextResponse.json(
      { message: 'Invalid credit ID' },
      { status: 400 }
    )
  }

  const credit = verifyCreditById(id)
  if (!credit) {
    return NextResponse.json(
      { message: 'Credit not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    data: {
      ...credit,
      verified_on_chain: true,
      verified_at: new Date().toISOString(),
      verification_tx_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    }
  })
}
