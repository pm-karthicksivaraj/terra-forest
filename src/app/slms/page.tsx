'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe2, TreePine, AlertTriangle, TrendingUp, Eye, CheckCircle2, Clock, XCircle, BarChart3 } from 'lucide-react';

const SUMMARY = [
  { label: 'Total Changes Detected', value: '47', icon: Globe2, color: 'text-emerald-700' },
  { label: 'Deforestation Alerts', value: '12', icon: AlertTriangle, color: 'text-red-600' },
  { label: 'Degradation Alerts', value: '18', icon: TreePine, color: 'text-orange-600' },
  { label: 'Regeneration', value: '17', icon: TrendingUp, color: 'text-emerald-500' },
];

const CHANGE_RECORDS = [
  { id: 'CHG-001', date: '2024-12-22', plot: 'DN_BGM_001', type: 'Deforestation', area: 5.2, confidence: 0.94, source: 'Sentinel-2', status: 'confirmed', reviewer: 'Dr. Nguyen T.A.' },
  { id: 'CHG-002', date: '2024-12-20', plot: 'DL_YT_001', type: 'Deforestation', area: 12.8, confidence: 0.97, source: 'Sentinel-2', status: 'confirmed', reviewer: 'Dr. Nguyen T.A.' },
  { id: 'CHG-003', date: '2024-12-18', plot: 'DN_CAT_001', type: 'Degradation', area: 8.5, confidence: 0.88, source: 'Landsat-8', status: 'under_review', reviewer: 'Ms. Tran L.P.' },
  { id: 'CHG-004', date: '2024-12-15', plot: 'CM_CM_001', type: 'Degradation', area: 3.2, confidence: 0.82, source: 'Sentinel-2', status: 'confirmed', reviewer: 'Mr. Le V.H.' },
  { id: 'CHG-005', date: '2024-12-12', plot: 'BP_BP_001', type: 'Regeneration', area: 6.1, confidence: 0.91, source: 'Sentinel-2', status: 'verified', reviewer: 'Dr. Nguyen T.A.' },
  { id: 'CHG-006', date: '2024-12-10', plot: 'LD_DL_001', type: 'Regeneration', area: 4.8, confidence: 0.87, source: 'Landsat-9', status: 'verified', reviewer: 'Ms. Tran L.P.' },
  { id: 'CHG-007', date: '2024-12-08', plot: 'DN_BGM_003', type: 'Degradation', area: 2.1, confidence: 0.76, source: 'Sentinel-2', status: 'under_review', reviewer: 'Mr. Le V.H.' },
  { id: 'CHG-008', date: '2024-12-05', plot: 'BP_BP_002', type: 'Deforestation', area: 1.9, confidence: 0.93, source: 'Sentinel-2', status: 'confirmed', reviewer: 'Dr. Nguyen T.A.' },
  { id: 'CHG-009', date: '2024-12-02', plot: 'DN_TB_001', type: 'Regeneration', area: 3.5, confidence: 0.85, source: 'Landsat-8', status: 'verified', reviewer: 'Ms. Tran L.P.' },
  { id: 'CHG-010', date: '2024-11-28', plot: 'DL_YT_001', type: 'Degradation', area: 7.3, confidence: 0.90, source: 'Sentinel-2', status: 'dismissed', reviewer: 'Mr. Le V.H.' },
];

const AREA_BY_TYPE = [
  { forestType: 'Natural Forest', deforestation: 18.0, degradation: 10.6, regeneration: 10.9 },
  { forestType: 'Planted Forest', deforestation: 1.9, degradation: 2.1, regeneration: 3.5 },
  { forestType: 'Protection Forest', deforestation: 0, degradation: 2.1, regeneration: 4.8 },
  { forestType: 'Mangrove Forest', deforestation: 0, degradation: 3.2, regeneration: 0 },
];

const AREA_BY_PROVINCE = [
  { province: 'Dong Nai', total: 20.9, deforestation: 5.2, degradation: 10.6, regeneration: 5.1 },
  { province: 'Binh Phuoc', total: 8.0, deforestation: 1.9, degradation: 0, regeneration: 6.1 },
  { province: 'Dak Lak', total: 20.1, deforestation: 12.8, degradation: 7.3, regeneration: 0 },
  { province: 'Lam Dong', total: 4.8, deforestation: 0, degradation: 0, regeneration: 4.8 },
  { province: 'Ca Mau', total: 3.2, deforestation: 0, degradation: 3.2, regeneration: 0 },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed': return <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</Badge>;
    case 'verified': return <Badge variant="default" className="text-[10px] gap-1 bg-emerald-600"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>;
    case 'under_review': return <Badge variant="secondary" className="text-[10px] gap-1"><Eye className="w-3 h-3" /> Under Review</Badge>;
    case 'dismissed': return <Badge variant="outline" className="text-[10px] gap-1"><XCircle className="w-3 h-3" /> Dismissed</Badge>;
    default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function TypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'Deforestation': return <Badge variant="destructive" className="text-[10px]">{type}</Badge>;
    case 'Degradation': return <Badge className="text-[10px] bg-orange-500">{type}</Badge>;
    case 'Regeneration': return <Badge className="text-[10px] bg-emerald-600">{type}</Badge>;
    default: return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
  }
}

export default function SlmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Satellite Land Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Land-cover change detection, deforestation/degradation classification, and area statistics
        </p>
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

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Change Detection Table</TabsTrigger>
          <TabsTrigger value="statistics">Area Statistics</TabsTrigger>
          <TabsTrigger value="archive">Historical Map Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Change Detection Records</CardTitle></CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Date</th>
                    <th className="text-left py-2 px-2 font-semibold">Plot</th>
                    <th className="text-left py-2 px-2 font-semibold">Change Type</th>
                    <th className="text-right py-2 px-2 font-semibold">Area (ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">Confidence</th>
                    <th className="text-left py-2 px-2 font-semibold">Source</th>
                    <th className="text-left py-2 px-2 font-semibold">Status</th>
                    <th className="text-left py-2 pl-2 font-semibold">Reviewer</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANGE_RECORDS.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2 font-mono">{r.date}</td>
                      <td className="py-2 px-2 font-mono">{r.plot}</td>
                      <td className="py-2 px-2"><TypeBadge type={r.type} /></td>
                      <td className="py-2 px-2 text-right">{r.area.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right">{(r.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2 px-2">{r.source}</td>
                      <td className="py-2 px-2"><StatusBadge status={r.status} /></td>
                      <td className="py-2 pl-2">{r.reviewer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Area by Forest Type (ha)</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-2 font-semibold">Forest Type</th>
                      <th className="text-right py-2 px-2 font-semibold text-red-600">Deforestation</th>
                      <th className="text-right py-2 px-2 font-semibold text-orange-600">Degradation</th>
                      <th className="text-right py-2 pl-2 font-semibold text-emerald-600">Regeneration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AREA_BY_TYPE.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-2">{row.forestType}</td>
                        <td className="py-2 px-2 text-right text-red-600">{row.deforestation > 0 ? row.deforestation.toFixed(1) : '—'}</td>
                        <td className="py-2 px-2 text-right text-orange-600">{row.degradation > 0 ? row.degradation.toFixed(1) : '—'}</td>
                        <td className="py-2 pl-2 text-right text-emerald-600">{row.regeneration > 0 ? row.regeneration.toFixed(1) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Area by Province (ha)</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-2 font-semibold">Province</th>
                      <th className="text-right py-2 px-2 font-semibold">Total</th>
                      <th className="text-right py-2 px-2 font-semibold text-red-600">Defor.</th>
                      <th className="text-right py-2 px-2 font-semibold text-orange-600">Degrad.</th>
                      <th className="text-right py-2 pl-2 font-semibold text-emerald-600">Regen.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AREA_BY_PROVINCE.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-2">{row.province}</td>
                        <td className="py-2 px-2 text-right font-semibold">{row.total.toFixed(1)}</td>
                        <td className="py-2 px-2 text-right text-red-600">{row.deforestation > 0 ? row.deforestation.toFixed(1) : '—'}</td>
                        <td className="py-2 px-2 text-right text-orange-600">{row.degradation > 0 ? row.degradation.toFixed(1) : '—'}</td>
                        <td className="py-2 pl-2 text-right text-emerald-600">{row.regeneration > 0 ? row.regeneration.toFixed(1) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Historical Map Archive</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {['2024-Q4', '2024-Q3', '2024-Q2', '2024-Q1', '2023-Q4', '2023-Q3', '2023-Q2', '2023-Q1'].map((period) => (
                  <div key={period} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-full h-20 bg-muted rounded mb-2 flex items-center justify-center text-xs text-muted-foreground">Map Preview</div>
                    <p className="text-xs font-semibold">{period}</p>
                    <p className="text-[10px] text-muted-foreground">Sentinel-2 Composite</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
