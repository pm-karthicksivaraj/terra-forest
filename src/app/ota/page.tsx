'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Smartphone, Activity, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const SUMMARY = [
  { label: 'Current Version', value: '2.4.1', icon: Upload, color: 'text-emerald-700' },
  { label: 'Devices on Latest', value: '24', icon: Smartphone, color: 'text-emerald-500' },
  { label: 'Adoption Rate', value: '68.6%', icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Pending Updates', value: '11', icon: Clock, color: 'text-orange-500' },
];

const RELEASES = [
  {
    version: '2.4.1', platform: 'Android + iOS', releaseNotes: '• Fixed GPS accuracy reporting\n• Improved offline sync reliability\n• Added SOS alert confirmation dialog\n• Updated map tile caching', status: 'released', rollout: 100, releasedDate: '2024-12-15', installed: 24, total: 35,
  },
  {
    version: '2.4.0', platform: 'Android + iOS', releaseNotes: '• New NDVI overlay support\n• Carbon calculator widget\n• Battery optimization for GPS tracking\n• Bug fixes for camera on Android 14', status: 'released', rollout: 100, releasedDate: '2024-11-20', installed: 35, total: 35,
  },
  {
    version: '2.3.8', platform: 'Android + iOS', releaseNotes: '• Hotfix: Crash on iOS 17.2\n• Fixed evidence upload timeout\n• Improved map rendering performance', status: 'released', rollout: 100, releasedDate: '2024-10-10', installed: 35, total: 35,
  },
  {
    version: '2.5.0-beta', platform: 'Android', releaseNotes: '• New offline AI deforestation detection\n• Enhanced voice note recording\n• Push notification improvements\n• BETA: Limited to test devices', status: 'testing', rollout: 10, releasedDate: '2024-12-20', installed: 3, total: 30,
  },
  {
    version: '2.3.5', platform: 'Android', releaseNotes: '• Legacy release for Android 12 devices\n• No longer actively supported', status: 'revoked', rollout: 0, releasedDate: '2024-08-01', installed: 1, total: 35,
  },
];

const DEVICE_INSTALL_STATUS = [
  { device: 'TF-Android-014', assignedTo: 'Mr. Le Van Hung', currentVersion: '2.4.1', status: 'up_to_date' },
  { device: 'TF-iOS-008', assignedTo: 'Mr. Tran Hoang Long', currentVersion: '2.4.1', status: 'up_to_date' },
  { device: 'TF-Android-022', assignedTo: 'Mr. Le Thanh Tung', currentVersion: '2.4.0', status: 'update_available' },
  { device: 'TF-Android-031', assignedTo: 'Mr. Pham Duc Huy', currentVersion: '2.4.1', status: 'up_to_date' },
  { device: 'TF-iOS-012', assignedTo: 'Ms. Hoang Thi Mai', currentVersion: '2.4.1', status: 'up_to_date' },
  { device: 'TF-Android-018', assignedTo: 'Ms. Vo Thi Hong', currentVersion: '2.3.8', status: 'update_available' },
  { device: 'TF-Android-025', assignedTo: 'Mr. Dang Van Son', currentVersion: '2.4.1', status: 'up_to_date' },
  { device: 'TF-Android-040', assignedTo: 'Mr. Ngo Duc Anh', currentVersion: '2.4.0', status: 'update_available' },
  { device: 'TF-iOS-050', assignedTo: 'Ms. Tran Thi Bich', currentVersion: '2.3.8', status: 'update_available' },
  { device: 'TF-Android-060', assignedTo: 'Unassigned', currentVersion: '2.3.5', status: 'update_available' },
];

function ReleaseStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'released': return <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Released</Badge>;
    case 'testing': return <Badge variant="secondary" className="text-[10px] gap-1"><Activity className="w-3 h-3" /> Testing</Badge>;
    case 'rolling_out': return <Badge className="text-[10px] gap-1 bg-orange-100 text-orange-800"><Clock className="w-3 h-3" /> Rolling Out</Badge>;
    case 'revoked': return <Badge variant="destructive" className="text-[10px] gap-1"><AlertCircle className="w-3 h-3" /> Revoked</Badge>;
    default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

export default function OtaPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">OTA Releases</h1>
          <p className="text-sm text-muted-foreground mt-1">Over-the-air app update management, staged rollout, and adoption monitoring</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Upload className="w-4 h-4" /> Create Release</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Release</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Version</Label><Input placeholder="e.g., 2.5.0" /></div>
              <div><Label>Platform</Label>
                <Select><SelectTrigger className="w-full"><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="both">Android + iOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Release Notes</Label><Textarea placeholder="Enter release notes..." rows={5} /></div>
              <div><Label>Rollout Percentage</Label><Input type="number" placeholder="10" min={1} max={100} /></div>
              <Button className="w-full" onClick={() => setShowCreateDialog(false)}>Create Release</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Release History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {RELEASES.map(r => (
            <div key={r.version} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono">{r.version}</span>
                  <Badge variant="outline" className="text-[10px]">{r.platform}</Badge>
                  <ReleaseStatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{r.releasedDate}</span>
                  <span>Rollout: {r.rollout}%</span>
                  <span>Installed: {r.installed}/{r.total}</span>
                </div>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans mt-2">{r.releaseNotes}</pre>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Installation Status per Device</CardTitle></CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-semibold">Device</th>
                <th className="text-left py-2 px-2 font-semibold">Assigned To</th>
                <th className="text-left py-2 px-2 font-semibold">Current Version</th>
                <th className="text-left py-2 pl-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEVICE_INSTALL_STATUS.map(d => (
                <tr key={d.device} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 pr-2 font-mono">{d.device}</td>
                  <td className="py-2 px-2">{d.assignedTo}</td>
                  <td className="py-2 px-2 font-mono">{d.currentVersion}</td>
                  <td className="py-2 pl-2">
                    {d.status === 'up_to_date' ? (
                      <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Up to date</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] gap-1"><Clock className="w-3 h-3" /> Update available</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
