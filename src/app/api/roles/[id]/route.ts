import { NextResponse } from 'next/server'

const MOCK_ROLES = [
  { id: 1, name: 'admin', description: 'Administrator', permissions: ['plots.view','plots.create','plots.edit','plots.delete','metadata.edit','carbon.view','carbon.create','carbon.verify','alert.view','alerts.manage','report.generate','reports.export','dashboard.view','compliance.view','compliance.verify','blockchain.view','blockchain.mint','blockchain.issue','ai.view','ai.run','data_governance.view','data_governance.publish','users.view','users.create','users.edit','users.delete','roles.view','roles.manage','system.view','system.manage'] },
  { id: 2, name: 'ranger', description: 'Field Ranger', permissions: ['plots.view','carbon.view','alert.view','dashboard.view','report.generate','compliance.view'] },
  { id: 3, name: 'nlu_academic', description: 'Academic Reviewer', permissions: ['plots.view','carbon.view','carbon.create','carbon.verify','alert.view','dashboard.view','report.generate','reports.export','compliance.view','compliance.verify','ai.view'] },
  { id: 4, name: 'gov_viewer', description: 'Government Viewer', permissions: ['plots.view','carbon.view','alert.view','dashboard.view','reports.export','compliance.view'] },
]

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = MOCK_ROLES.find(r => r.id === parseInt(id))
  if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 })
  return NextResponse.json({ data: role })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const role = MOCK_ROLES.find(r => r.id === parseInt(id))
  if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 })
  if (body.name) role.name = body.name
  if (body.description !== undefined) role.description = body.description
  return NextResponse.json({ data: role })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = MOCK_ROLES.find(r => r.id === parseInt(id))
  if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 })
  if (role.name === 'admin') return NextResponse.json({ message: 'Cannot delete admin role' }, { status: 403 })
  return NextResponse.json({ data: {} })
}
