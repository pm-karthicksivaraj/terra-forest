import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: {
      url: 'https://geonetwork.terraforest.vn',
      isHealthy: true,
      totalRecords: 247,
      lastHarvest: '2025-03-04T06:00:00Z',
    },
  })
}
