import { NextResponse } from 'next/server'
import { addCredit, TRANSACTIONS } from '@/lib/blockchain-store'
import { CARBON_RECORDS } from '@/lib/mock-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carbon_record_id } = body

    if (!carbon_record_id) {
      return NextResponse.json(
        { message: 'carbon_record_id is required' },
        { status: 400 }
      )
    }

    // Find the carbon record
    const carbonRecord = CARBON_RECORDS.find(r => r.id === Number(carbon_record_id))
    if (!carbonRecord) {
      return NextResponse.json(
        { message: 'Carbon record not found' },
        { status: 404 }
      )
    }

    // Create the credit
    const credit = addCredit(
      carbonRecord.id,
      carbonRecord.plot_code,
      carbonRecord.carbon_stock_tonnes,
      carbonRecord.recorded_year,
    )

    // Add transaction
    TRANSACTIONS.unshift({
      id: TRANSACTIONS.length + 1,
      tx_hash: credit.tx_hash,
      type: 'credit',
      description: `Mint carbon credit ${credit.credit_id} for ${credit.plot_code}`,
      block_number: 1247 + TRANSACTIONS.length,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ data: credit }, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Failed to mint credit' },
      { status: 500 }
    )
  }
}
