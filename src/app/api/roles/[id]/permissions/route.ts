import { NextResponse } from 'next/server'

const MOCK_ROLES: Record<number, string[]> = {
  1: ['plots.view','plots.create','plots.edit','plots.delete','metadata.edit','carbon.view','carbon.create','carbon.verify','alert.view','alerts.manage','report.generate','reports.export','dashboard.view','compliance.view','compliance.verify','blockchain.view','blockchain.mint','blockchain.issue','ai.view','ai.run','data_governance.view','data_governance.publish','users.view','users.create','users.edit','users.delete','roles.view','roles.manage','system.view','system.manage'],
  2: ['plots.view','carbon.view','alert.view','dashboard.view','report.generate','compliance.view'],
  3: ['plots.view','carbon.view','carbon.create','carbon.verify','alert.view','dashboard.view','report.generate','reports.export','compliance.view','compliance.verify','ai.view'],
  4: ['plots.view','carbon.view','alert.view','dashboard.view','reports.export','compliance.view'],
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const permissions = MOCK_ROLES[parseInt(id)] || []
  return NextResponse.json({ data: permissions })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  if (parseInt(id) === 1) return NextResponse.json({ message: 'Cannot modify admin role permissions' }, { status: 403 })
  MOCK_ROLES[parseInt(id)] = Array.isArray(body.permissions) ? body.permissions : []
  return NextResponse.json({ data: MOCK_ROLES[parseInt(id)] })
}
