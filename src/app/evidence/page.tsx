'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Video, Mic, FileText, MapPin, Clock, Shield, CheckCircle2, XCircle, Eye, Hash } from 'lucide-react';

const SUMMARY = [
  { label: 'Total Evidence', value: '342', icon: Camera, color: 'text-emerald-700' },
  { label: 'Pending Review', value: '28', icon: Eye, color: 'text-orange-600' },
  { label: 'Approved', value: '298', icon: CheckCircle2, color: 'text-emerald-500' },
  { label: 'Rejected', value: '16', icon: XCircle, color: 'text-red-600' },
];

const TYPE_ICONS: Record<string, any> = { photo: Camera, video: Video, voice_note: Mic, document: FileText, gps_track: MapPin };
const TYPE_COLORS: Record<string, string> = { photo: 'bg-blue-100 text-blue-800', video: 'bg-purple-100 text-purple-800', voice_note: 'bg-amber-100 text-amber-800', document: 'bg-gray-100 text-gray-800', gps_track: 'bg-emerald-100 text-emerald-800' };

const EVIDENCE = [
  { id: 'EV-101', type: 'photo', uploader: 'Mr. Nguyen Van Minh', task: 'Boundary survey — Sector A', plot: 'DN_BGM_001', gpsLat: 11.5201, gpsLng: 107.3503, captureTime: '2024-12-28 09:15', syncTime: '2024-12-28 09:18', fileHash: 'sha256:e3b0c442...98fc1c14', reviewStatus: 'pending', device: 'TF-Android-014' },
  { id: 'EV-102', type: 'photo', uploader: 'Mr. Nguyen Van Minh', task: 'Boundary survey — Sector A', plot: 'DN_BGM_001', gpsLat: 11.5205, gpsLng: 107.3508, captureTime: '2024-12-28 09:22', syncTime: '2024-12-28 09:24', fileHash: 'sha256:89e6c98d...a1b2c3d4', reviewStatus: 'pending', device: 'TF-Android-014' },
  { id: 'EV-103', type: 'video', uploader: 'Mr. Tran Hoang Long', task: 'Boundary survey — Sector A', plot: 'DN_BGM_001', gpsLat: 11.5210, gpsLng: 107.3512, captureTime: '2024-12-28 09:30', syncTime: '2024-12-28 09:35', fileHash: 'sha256:7d2f1a8c...e5f6a7b8', reviewStatus: 'pending', device: 'TF-iOS-008' },
  { id: 'EV-104', type: 'photo', uploader: 'Mr. Le Thanh Tung', task: 'Fire risk assessment — Sector C', plot: 'DN_CAT_001', gpsLat: 11.1998, gpsLng: 107.1505, captureTime: '2024-12-27 14:20', syncTime: '2024-12-27 14:23', fileHash: 'sha256:4a5b6c7d...8e9f0a1b', reviewStatus: 'approved', device: 'TF-Android-022' },
  { id: 'EV-105', type: 'voice_note', uploader: 'Mr. Le Thanh Tung', task: 'Fire risk assessment — Sector C', plot: 'DN_CAT_001', gpsLat: 11.1995, gpsLng: 107.1508, captureTime: '2024-12-27 14:45', syncTime: '2024-12-27 14:47', fileHash: 'sha256:2c3d4e5f...6a7b8c9d', reviewStatus: 'approved', device: 'TF-Android-022' },
  { id: 'EV-106', type: 'gps_track', uploader: 'Eagle Patrol', task: 'Patrol — Northern boundary', plot: 'DN_BGM_002', gpsLat: null, gpsLng: null, captureTime: '2024-12-25 06:00', syncTime: '2024-12-25 14:00', fileHash: 'sha256:0e1f2a3b...4c5d6e7f', reviewStatus: 'approved', device: 'Multiple' },
  { id: 'EV-107', type: 'document', uploader: 'Dr. Nguyen T.A.', task: 'Carbon verification report', plot: 'All', gpsLat: null, gpsLng: null, captureTime: '2024-12-22 10:00', syncTime: '2024-12-22 10:05', fileHash: 'sha256:8a9b0c1d...2e3f4a5b', reviewStatus: 'approved', device: 'Web Portal' },
  { id: 'EV-108', type: 'photo', uploader: 'Mr. Pham Duc Huy', task: 'Deforestation verification', plot: 'BP_BP_001', gpsLat: 11.8002, gpsLng: 106.9005, captureTime: '2024-12-26 08:30', syncTime: '2024-12-26 08:45', fileHash: 'sha256:6c7d8e9f...0a1b2c3d', reviewStatus: 'pending', device: 'TF-Android-031' },
  { id: 'EV-109', type: 'photo', uploader: 'Ms. Vo Thi Hong', task: 'Camera trap retrieval', plot: 'DN_BGM_003', gpsLat: 11.4810, gpsLng: 107.3005, captureTime: '2024-12-22 11:20', syncTime: '2024-12-22 11:22', fileHash: 'sha256:4e5f6a7b...8c9d0e1f', reviewStatus: 'approved', device: 'TF-Android-018' },
  { id: 'EV-110', type: 'video', uploader: 'Mr. Dang Van Son', task: 'Patrol — Dak Lak route', plot: 'DL_YT_001', gpsLat: 12.6998, gpsLng: 108.1002, captureTime: '2024-12-18 09:00', syncTime: '2024-12-18 09:10', fileHash: 'sha256:2a3b4c5d...6e7f8a9b', reviewStatus: 'rejected', device: 'TF-Android-025' },
];

export default function EvidencePage() {
  const [filterType, setFilterType] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const filtered = filterType === 'all' ? EVIDENCE : EVIDENCE.filter(e => e.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evidence Review</h1>
          <p className="text-sm text-muted-foreground mt-1">Review field evidence — photos, videos, voice notes — with metadata verification and integrity checking</p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="voice_note">Voice Note</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="gps_track">GPS Track</SelectItem>
          </SelectContent>
        </Select>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {filtered.map(ev => {
          const Icon = TYPE_ICONS[ev.type] || FileText;
          return (
            <Card key={ev.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEvidence(ev.id)}>
              <CardContent className="p-3">
                <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <Icon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <Badge className={`text-[10px] ${TYPE_COLORS[ev.type]}`}>{ev.type.replace('_', ' ')}</Badge>
                  <Badge variant={ev.reviewStatus === 'approved' ? 'default' : ev.reviewStatus === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {ev.reviewStatus}
                  </Badge>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{ev.id}</p>
                <p className="text-xs font-medium truncate">{ev.uploader}</p>
                <p className="text-[10px] text-muted-foreground truncate">{ev.task}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Evidence Detail</DialogTitle></DialogHeader>
          {selectedEvidence && (() => {
            const ev = EVIDENCE.find(x => x.id === selectedEvidence);
            if (!ev) return null;
            const Icon = TYPE_ICONS[ev.type] || FileText;
            return (
              <div className="space-y-4 mt-4 text-sm">
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <Icon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-xs text-muted-foreground">ID</span><p className="font-mono">{ev.id}</p></div>
                  <div><span className="text-xs text-muted-foreground">Type</span><p><Badge className={`text-[10px] ${TYPE_COLORS[ev.type]}`}>{ev.type.replace('_', ' ')}</Badge></p></div>
                  <div><span className="text-xs text-muted-foreground">Uploader</span><p>{ev.uploader}</p></div>
                  <div><span className="text-xs text-muted-foreground">Device</span><p className="font-mono text-xs">{ev.device}</p></div>
                  <div><span className="text-xs text-muted-foreground">Task</span><p className="text-xs">{ev.task}</p></div>
                  <div><span className="text-xs text-muted-foreground">Plot</span><p className="font-mono">{ev.plot}</p></div>
                  <div><span className="text-xs text-muted-foreground">GPS</span><p className="font-mono text-xs">{ev.gpsLat && ev.gpsLng ? `${ev.gpsLat.toFixed(4)}, ${ev.gpsLng.toFixed(4)}` : 'N/A'}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p><Badge variant={ev.reviewStatus === 'approved' ? 'default' : ev.reviewStatus === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px]">{ev.reviewStatus}</Badge></p></div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs"><Clock className="w-3 h-3 text-muted-foreground" /><span>Capture: {ev.captureTime}</span></div>
                  <div className="flex items-center gap-2 text-xs"><Clock className="w-3 h-3 text-muted-foreground" /><span>Sync: {ev.syncTime}</span></div>
                  <div className="flex items-center gap-2 text-xs"><Hash className="w-3 h-3 text-muted-foreground" /><span className="font-mono text-[10px]">{ev.fileHash}</span></div>
                  <div className="flex items-center gap-2 text-xs"><Shield className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Hash verified — file integrity confirmed</span></div>
                </div>
                <div className="border-t pt-3">
                  <Label className="text-xs">Review Comment</Label>
                  <Textarea placeholder="Enter review comments..." className="mt-1 text-xs" rows={3} />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" className="flex-1 gap-1"><CheckCircle2 className="w-4 h-4" /> Approve</Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-1"><XCircle className="w-4 h-4" /> Reject</Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
