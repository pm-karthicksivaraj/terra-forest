import { NextResponse } from 'next/server'
import { addPassport, TRANSACTIONS } from '@/lib/blockchain-store'
import { PLOTS } from '@/lib/mock-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plot_id, vpa_flegt_verified } = body

    if (!plot_id) {
      return NextResponse.json(
        { message: 'plot_id is required' },
        { status: 400 }
      )
    }

    // Find the plot
    const plot = PLOTS.find(p => p.id === Number(plot_id))
    if (!plot) {
      return NextResponse.json(
        { message: 'Plot not found' },
        { status: 404 }
      )
    }

    // Create the passport
    const passport = addPassport(
      plot.id,
      plot.plot_code,
      vpa_flegt_verified || false,
    )

    // Add transaction
    TRANSACTIONS.unshift({
      id: TRANSACTIONS.length + 1,
      tx_hash: passport.passport_hash,
      type: 'passport',
      description: `Issue timber passport ${passport.passport_id} for ${passport.plot_code}`,
      block_number: 1247 + TRANSACTIONS.length,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ data: passport }, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Failed to issue passport' },
      { status: 500 }
    )
  }
}
