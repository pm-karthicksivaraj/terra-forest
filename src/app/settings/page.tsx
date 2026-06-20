'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Settings, Link2, Brain, Database, Shield, Globe2, CheckCircle2, XCircle, Clock, Server } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'FRMS 4.0', description: 'Forest Resource Management System — field data and patrol records', status: 'connected', lastSync: '2024-12-28 10:30', endpoint: 'https://frms.terraforest.vn/api/v4', recordsSynced: 3420 },
  { name: 'GeoNetwork', description: 'Metadata catalog and geospatial data publishing', status: 'connected', lastSync: '2024-12-28 06:00', endpoint: 'https://geonetwork.terraforest.vn/srv', recordsSynced: 980 },
  { name: 'Sentinel Hub', description: 'Copernicus Sentinel satellite imagery access', status: 'connected', lastSync: '2024-12-28 05:00', endpoint: 'https://services.sentinel-hub.com', recordsSynced: 1240 },
  { name: 'Verra VCS Registry', description: 'Verified Carbon Standard credit registry', status: 'disconnected', lastSync: '2024-12-15 14:00', endpoint: 'https://registry.verra.org/api', recordsSynced: 5 },
  { name: 'GFW Alerts API', description: 'Global Forest Watch deforestation alert feed', status: 'connected', lastSync: '2024-12-28 10:00', endpoint: 'https://data-api.globalforestwatch.org', recordsSynced: 5680 },
  { name: 'Vietnam Weather Service', description: 'Real-time weather and fire risk data', status: 'partial', lastSync: '2024-12-28 09:00', endpoint: 'https://weather.kttv.gov.vn/api', recordsSynced: 890 },
];

const AI_MODELS = [
  { name: 'Deforestation Detection v3', version: 'v3.2.1', framework: 'PyTorch', accuracy: '94.2%', lastTrained: '2024-11-15', status: 'production' },
  { name: 'Forest Type Classifier', version: 'v2.1.0', framework: 'TensorFlow', accuracy: '91.8%', lastTrained: '2024-09-20', status: 'production' },
  { name: 'Fire Risk Predictor', version: 'v1.4.0', framework: 'XGBoost', accuracy: '87.5%', lastTrained: '2024-10-05', status: 'production' },
  { name: 'Species Identifier (Beta)', version: 'v0.3.0-beta', framework: 'PyTorch', accuracy: '72.1%', lastTrained: '2024-12-01', status: 'testing' },
];

const DATA_RETENTION = [
  { dataType: 'Satellite imagery', retention: '5 years', compressed: 'Yes', storage: '2.4 TB', policy: 'Archived after 1 year, deleted after 5 years' },
  { dataType: 'Patrol GPS tracks', retention: '3 years', compressed: 'Yes', storage: '450 MB', policy: 'Archived after 1 year, deleted after 3 years' },
  { dataType: 'Evidence media (photos/videos)', retention: '7 years', compressed: 'Yes', storage: '18.5 TB', policy: 'Compressed after 6 months, archived after 2 years, deleted after 7 years' },
  { dataType: 'Carbon calculation data', retention: '10 years', compressed: 'No', storage: '120 MB', policy: 'Permanent archive — VCS requirement for credit verification' },
  { dataType: 'NDVI time series', retention: '10 years', compressed: 'Yes', storage: '890 MB', policy: 'Required for FREL/FRL reference period' },
  { dataType: 'Audit logs', retention: '7 years', compressed: 'Yes', storage: '230 MB', policy: 'Compliance requirement — tamper-proof storage' },
  { dataType: 'User activity logs', retention: '2 years', compressed: 'Yes', storage: '85 MB', policy: 'Anonymized after 2 years, deleted after 3 years' },
];

const SECURITY_SETTINGS = [
  { setting: 'Two-Factor Authentication (2FA)', description: 'Require 2FA for all admin and operations manager accounts', enabled: true },
  { setting: 'Session Timeout', description: 'Auto-logout after 30 minutes of inactivity', enabled: true },
  { setting: 'IP Whitelisting', description: 'Restrict access to approved IP ranges for auditor accounts', enabled: false },
  { setting: 'API Rate Limiting', description: 'Limit API requests to 1000/minute per user', enabled: true },
  { setting: 'Data Encryption at Rest', description: 'AES-256 encryption for all stored data', enabled: true },
  { setting: 'Audit Log Immutability', description: 'Prevent modification or deletion of audit trail records', enabled: true },
  { setting: 'MFA for Mobile App', description: 'Require biometric/PIN for mobile app access', enabled: true },
  { setting: 'Geofence Alerts', description: 'Alert when ranger devices leave assigned patrol areas', enabled: false },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration, integration management, and system preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Settings className="w-4 h-4" /> General Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Platform Name</Label>
                  <Input defaultValue="Terra Forest Digital MRV" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Organization</Label>
                  <Input defaultValue="VNFOREST — Vietnam Administration of Forestry" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Default Map Center (Lat, Lng)</Label>
                  <Input defaultValue="11.05, 107.35" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Default Map Zoom Level</Label>
                  <Input defaultValue="7" type="number" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Time Zone</Label>
                  <Input defaultValue="Asia/Ho_Chi_Minh (UTC+7)" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Language</Label>
                  <Input defaultValue="English" className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode" className="text-xs">Dark Mode</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="auto-refresh" defaultChecked />
                <Label htmlFor="auto-refresh" className="text-xs">Auto-refresh dashboard data (30s interval)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications" className="text-xs">Enable push notifications for alerts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Link2 className="w-4 h-4" /> Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {INTEGRATIONS.map(int => (
                <div key={int.name} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${int.status === 'connected' ? 'bg-emerald-500' : int.status === 'partial' ? 'bg-yellow-500' : 'bg-red-400'}`} />
                      <h3 className="text-sm font-semibold">{int.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={int.status === 'connected' ? 'default' : int.status === 'partial' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {int.status === 'connected' ? 'Connected' : int.status === 'partial' ? 'Partial' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{int.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Last sync: {int.lastSync}</span>
                    <span>Records: {int.recordsSynced.toLocaleString()}</span>
                    <span className="font-mono">{int.endpoint}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Brain className="w-4 h-4" /> AI Model Registry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AI_MODELS.map(model => (
                <div key={model.name} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold">{model.name}</h3>
                    <Badge variant={model.status === 'production' ? 'default' : 'secondary'} className="text-[10px]">
                      {model.status === 'production' ? 'Production' : 'Testing'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Version: {model.version}</span>
                    <span>Framework: {model.framework}</span>
                    <span>Accuracy: {model.accuracy}</span>
                    <span>Last trained: {model.lastTrained}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4" /> Data Retention Policies</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Data Type</th>
                    <th className="text-left py-2 px-2 font-semibold">Retention</th>
                    <th className="text-left py-2 px-2 font-semibold">Compressed</th>
                    <th className="text-right py-2 px-2 font-semibold">Storage</th>
                    <th className="text-left py-2 pl-2 font-semibold">Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_RETENTION.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2 font-medium">{row.dataType}</td>
                      <td className="py-2 px-2">{row.retention}</td>
                      <td className="py-2 px-2">{row.compressed ? 'Yes' : 'No'}</td>
                      <td className="py-2 px-2 text-right">{row.storage}</td>
                      <td className="py-2 pl-2 text-muted-foreground">{row.policy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs">
                <p>Total storage used: <span className="font-semibold">22.7 TB</span> of 50 TB available (45.4%)</p>
                <p>Next archival cycle: 2025-01-15</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SECURITY_SETTINGS.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{s.setting}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <Switch checked={s.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
