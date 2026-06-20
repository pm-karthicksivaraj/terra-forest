import { NextResponse } from 'next/server'
import { updateMetadataRecord } from '@/lib/data-governance-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const recordId = body.record_id

    if (!recordId) {
      return NextResponse.json({ error: 'record_id is required' }, { status: 400 })
    }

    const updated = updateMetadataRecord(Number(recordId), {
      status: 'published',
      geo_network_url: `https://geonetwork.terraforest.vn/srv/vnm/catalog.search#/metadata/MD-${recordId}`,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: updated,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
