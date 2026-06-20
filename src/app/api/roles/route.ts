import { NextResponse } from 'next/server'

const MOCK_ROLES = [
  { id: 1, name: 'admin', description: 'Administrator - Full access', guard_name: 'web', permissions: ['plots.view','plots.create','plots.edit','plots.delete','metadata.edit','carbon.view','carbon.create','carbon.verify','alert.view','alerts.manage','report.generate','reports.export','dashboard.view','compliance.view','compliance.verify','blockchain.view','blockchain.mint','blockchain.issue','ai.view','ai.run','data_governance.view','data_governance.publish','users.view','users.create','users.edit','users.delete','roles.view','roles.manage','system.view','system.manage'], user_count: 1 },
  { id: 2, name: 'ranger', description: 'Field Ranger - View field data', guard_name: 'web', permissions: ['plots.view','carbon.view','alert.view','dashboard.view','report.generate','compliance.view'], user_count: 2 },
  { id: 3, name: 'nlu_academic', description: 'Academic Reviewer - Verify and analyze', guard_name: 'web', permissions: ['plots.view','carbon.view','carbon.create','carbon.verify','alert.view','dashboard.view','report.generate','reports.export','compliance.view','compliance.verify','ai.view'], user_count: 1 },
  { id: 4, name: 'gov_viewer', description: 'Government Viewer - View and export', guard_name: 'web', permissions: ['plots.view','carbon.view','alert.view','dashboard.view','reports.export','compliance.view'], user_count: 2 },
]

export async function GET() {
  return NextResponse.json({ data: MOCK_ROLES })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.name) return NextResponse.json({ message: 'Role name is required' }, { status: 400 })
  const newRole = {
    id: Math.max(...MOCK_ROLES.map(r => r.id)) + 1,
    name: body.name,
    description: body.description || '',
    guard_name: 'web',
    permissions: body.permissions || [],
    user_count: 0,
  }
  MOCK_ROLES.push(newRole)
  return NextResponse.json({ data: newRole }, { status: 201 })
}
