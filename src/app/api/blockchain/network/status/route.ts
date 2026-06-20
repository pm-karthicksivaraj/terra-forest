import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    data: {
      isHealthy: true,
      blockHeight: 1247,
      transactionCount: 3842,
      channels: [
        { name: 'terra-forest-channel', status: 'active' },
      ],
      peers: [
        { name: 'peer0.org1.terraforest.vn', org: 'Org1MSP', status: 'running' },
        { name: 'peer0.org2.terraforest.vn', org: 'Org2MSP', status: 'running' },
        { name: 'peer1.org1.terraforest.vn', org: 'Org1MSP', status: 'running' },
        { name: 'peer1.org2.terraforest.vn', org: 'Org2MSP', status: 'running' },
      ],
      chaincodes: [
        { name: 'CarbonCredit', version: '1.0', status: 'installed' },
        { name: 'TimberPassport', version: '1.0', status: 'installed' },
      ],
    }
  })
}
