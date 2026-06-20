import { NextResponse } from 'next/server'

const ALL_PERMISSIONS = [
  { id: 1, name: 'dashboard.view', description: 'View Dashboard', group: 'dashboard' },
  { id: 2, name: 'plots.view', description: 'View Forest Plots', group: 'plots' },
  { id: 3, name: 'plots.create', description: 'Create Forest Plots', group: 'plots' },
  { id: 4, name: 'plots.edit', description: 'Edit Forest Plots', group: 'plots' },
  { id: 5, name: 'plots.delete', description: 'Delete Forest Plots', group: 'plots' },
  { id: 6, name: 'metadata.edit', description: 'Edit Metadata', group: 'metadata' },
  { id: 7, name: 'carbon.view', description: 'View Carbon Records', group: 'carbon' },
  { id: 8, name: 'carbon.create', description: 'Create Carbon Records', group: 'carbon' },
  { id: 9, name: 'carbon.verify', description: 'Verify Carbon', group: 'carbon' },
  { id: 10, name: 'alert.view', description: 'View Alerts', group: 'alert' },
  { id: 11, name: 'alerts.manage', description: 'Manage Alerts', group: 'alert' },
  { id: 12, name: 'report.generate', description: 'Generate Reports', group: 'reports' },
  { id: 13, name: 'reports.export', description: 'Export Reports', group: 'reports' },
  { id: 14, name: 'compliance.view', description: 'View Compliance', group: 'compliance' },
  { id: 15, name: 'compliance.verify', description: 'Verify Compliance', group: 'compliance' },
  { id: 16, name: 'blockchain.view', description: 'View Blockchain', group: 'blockchain' },
  { id: 17, name: 'blockchain.mint', description: 'Mint Credits', group: 'blockchain' },
  { id: 18, name: 'blockchain.issue', description: 'Issue Passport', group: 'blockchain' },
  { id: 19, name: 'ai.view', description: 'View AI Pipeline', group: 'ai' },
  { id: 20, name: 'ai.run', description: 'Run AI Analysis', group: 'ai' },
  { id: 21, name: 'data_governance.view', description: 'View Data Governance', group: 'data_governance' },
  { id: 22, name: 'data_governance.publish', description: 'Publish Metadata', group: 'data_governance' },
  { id: 23, name: 'users.view', description: 'View Users', group: 'users' },
  { id: 24, name: 'users.create', description: 'Create Users', group: 'users' },
  { id: 25, name: 'users.edit', description: 'Edit Users', group: 'users' },
  { id: 26, name: 'users.delete', description: 'Delete Users', group: 'users' },
  { id: 27, name: 'roles.view', description: 'View Roles', group: 'roles' },
  { id: 28, name: 'roles.manage', description: 'Manage Roles', group: 'roles' },
  { id: 29, name: 'system.view', description: 'View System', group: 'system' },
  { id: 30, name: 'system.manage', description: 'Manage System', group: 'system' },
]

export async function GET() {
  return NextResponse.json({ data: ALL_PERMISSIONS })
}
