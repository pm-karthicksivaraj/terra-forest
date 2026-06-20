'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, ShieldCheck, Users, Eye, Lock } from 'lucide-react';

const ROLES = [
  { value: 'system_admin', label: 'System Admin', description: 'Full platform access, user management, device management, OTA releases, system configuration', permissions: 42, color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
  { value: 'operations_manager', label: 'Operations Manager', description: 'Create teams, assign tasks, monitor live sessions, review evidence, approve closures', permissions: 28, color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🟠' },
  { value: 'team_lead', label: 'Team Lead', description: 'Start team patrols, confirm attendance, assign field subtasks, validate submissions', permissions: 18, color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵' },
  { value: 'ranger', label: 'Ranger', description: 'Use mobile app for check-in, task navigation, photo/video/voice capture, submit observations', permissions: 10, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🟢' },
  { value: 'auditor', label: 'Auditor / Verifier', description: 'Review evidence history, media metadata, timestamps, route logs, task completion trails', permissions: 14, color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🟣' },
];

const PERMISSION_MATRIX = [
  { permission: 'Dashboard — View Overview', system_admin: true, operations_manager: true, team_lead: true, ranger: true, auditor: true },
  { permission: 'Dashboard — View Live Operations', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: false },
  { permission: 'NDVI — View Maps & Charts', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: true },
  { permission: 'NDVI — Configure Alert Thresholds', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: false },
  { permission: 'Carbon — View Carbon Stock Data', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: true },
  { permission: 'Carbon — Run Carbon Calculator', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: false },
  { permission: 'Patrols — Start/End Patrol Shift', system_admin: false, operations_manager: true, team_lead: true, ranger: true, auditor: false },
  { permission: 'Tasks — Create Tasks', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: false },
  { permission: 'Tasks — Assign Tasks to Team', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: false },
  { permission: 'Tasks — Complete Tasks', system_admin: false, operations_manager: false, team_lead: true, ranger: true, auditor: false },
  { permission: 'Evidence — Submit Evidence', system_admin: false, operations_manager: false, team_lead: true, ranger: true, auditor: false },
  { permission: 'Evidence — Review & Approve Evidence', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: true },
  { permission: 'Users — Create/Edit Users', system_admin: true, operations_manager: false, team_lead: false, ranger: false, auditor: false },
  { permission: 'Users — View User List', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: false },
  { permission: 'Teams — Create/Edit Teams', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: false },
  { permission: 'Devices — Register/Manage Devices', system_admin: true, operations_manager: false, team_lead: false, ranger: false, auditor: false },
  { permission: 'Devices — View Own Device Info', system_admin: false, operations_manager: false, team_lead: false, ranger: true, auditor: false },
  { permission: 'OTA — Create/Manage Releases', system_admin: true, operations_manager: false, team_lead: false, ranger: false, auditor: false },
  { permission: 'Settings — System Configuration', system_admin: true, operations_manager: false, team_lead: false, ranger: false, auditor: false },
  { permission: 'Verification — View Audit Trails', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: true },
  { permission: 'GHG Inventory — Edit Data', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: false },
  { permission: 'GHG Inventory — View Reports', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: true },
  { permission: 'REDD+ Results — View', system_admin: true, operations_manager: true, team_lead: false, ranger: false, auditor: true },
  { permission: 'REDD+ Results — Submit to UNFCCC', system_admin: true, operations_manager: false, team_lead: false, ranger: false, auditor: false },
  { permission: 'SOS — Trigger Emergency Alert', system_admin: false, operations_manager: true, team_lead: true, ranger: true, auditor: false },
  { permission: 'SOS — Acknowledge & Respond', system_admin: true, operations_manager: true, team_lead: true, ranger: false, auditor: false },
];

const PROVINCE_ISOLATION = [
  { rule: 'Patrol data is scoped to assigned province', description: 'Rangers and team leads can only view data for their assigned province', appliesTo: ['team_lead', 'ranger'] },
  { rule: 'Operations managers can view assigned province + aggregate', description: 'OMs see detailed data for their province and aggregated national data', appliesTo: ['operations_manager'] },
  { rule: 'Auditors have read-only cross-province access', description: 'Auditors can view all provinces but cannot modify data', appliesTo: ['auditor'] },
  { rule: 'System admins have unrestricted access', description: 'Full access to all provinces and all data types', appliesTo: ['system_admin'] },
  { rule: 'Cross-province queries require elevated permissions', description: 'Any query spanning multiple provinces requires operations_manager or higher role', appliesTo: ['operations_manager', 'system_admin'] },
];

function Checkmark({ value }: { value: boolean }) {
  return value ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground/30">—</span>;
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Role-based access control with granular permission management</p>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Role Cards</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="isolation">Province Data Isolation</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(role => (
              <Card key={role.value} className={`border ${role.color.split(' ').find(c => c.startsWith('border-')) || ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{role.icon}</span>
                    <h3 className="text-sm font-bold">{role.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Key className="w-3 h-3" /> {role.permissions} permissions
                    </Badge>
                    <Badge className={`text-[10px] ${role.color}`}>{role.value}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold min-w-64">Permission</th>
                    <th className="text-center py-2 px-2 font-semibold">Admin</th>
                    <th className="text-center py-2 px-2 font-semibold">Ops Mgr</th>
                    <th className="text-center py-2 px-2 font-semibold">Team Lead</th>
                    <th className="text-center py-2 px-2 font-semibold">Ranger</th>
                    <th className="text-center py-2 px-2 font-semibold">Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MATRIX.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-1.5 pr-4">{row.permission}</td>
                      <td className="py-1.5 px-2 text-center"><Checkmark value={row.system_admin} /></td>
                      <td className="py-1.5 px-2 text-center"><Checkmark value={row.operations_manager} /></td>
                      <td className="py-1.5 px-2 text-center"><Checkmark value={row.team_lead} /></td>
                      <td className="py-1.5 px-2 text-center"><Checkmark value={row.ranger} /></td>
                      <td className="py-1.5 px-2 text-center"><Checkmark value={row.auditor} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isolation" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Province-Level Data Isolation Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PROVINCE_ISOLATION.map((rule, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium mb-1">{rule.rule}</p>
                  <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Applies to:</span>
                    {rule.appliesTo.map(r => (
                      <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
