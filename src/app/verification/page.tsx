'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, GitBranch, Lock, MessageSquare, CheckCircle2, Clock, AlertCircle, FileText, Eye } from 'lucide-react';

const DATA_LINEAGE = [
  { source: 'Sentinel-2 L2A Imagery', transform: 'NDVI Classification → Change Detection', output: 'Deforestation alerts', status: 'verified', version: 'v3.2' },
  { source: 'NFI Field Measurements', transform: 'Allometric Equations → Carbon Stock', output: 'Biomass estimates per stratum', status: 'verified', version: 'v2.1' },
  { source: 'Patrol GPS Tracks', transform: 'Route Validation → Activity Confirmation', output: 'Field verification records', status: 'verified', version: 'v1.8' },
  { source: 'AI Deforestation Model', transform: 'Inference → Classification → Review', output: 'Change type classification', status: 'partial', version: 'v1.3' },
  { source: 'Carbon Calculation Engine', transform: 'Stock-Difference Method → Emission Factors', output: 'GHG inventory tables', status: 'verified', version: 'v4.0' },
];

const EVIDENCE_LOCKER = [
  { id: 'EV-001', name: 'Sentinel-2 Composite Dec 2024', type: 'GeoTIFF', size: '842 MB', uploadedBy: 'System', uploadDate: '2024-12-28', hash: 'sha256:a1b2c3...f8e9', status: 'locked' },
  { id: 'EV-002', name: 'NFI Plot Measurement Campaign Q3', type: 'CSV + Photos', size: '156 MB', uploadedBy: 'FIPI Team', uploadDate: '2024-10-15', hash: 'sha256:d4e5f6...a2b3', status: 'locked' },
  { id: 'EV-003', name: 'Carbon Calculation Worksheet 2024', type: 'XLSX', size: '4.2 MB', uploadedBy: 'Dr. Nguyen T.A.', uploadDate: '2024-12-01', hash: 'sha256:g7h8i9...c4d5', status: 'locked' },
  { id: 'EV-004', name: 'SGS Audit Report Draft', type: 'PDF', size: '12.8 MB', uploadedBy: 'SGS Vietnam', uploadDate: '2024-12-20', hash: 'sha256:j0k1l2...e6f7', status: 'draft' },
  { id: 'EV-005', name: 'Field Verification Photos — Bu Gia Map', type: 'JPEG (124 files)', size: '2.1 GB', uploadedBy: 'Eagle Patrol', uploadDate: '2024-11-30', hash: 'sha256:m3n4o5...g8h9', status: 'locked' },
  { id: 'EV-006', name: 'FREL/FRL Technical Annex', type: 'PDF', size: '8.5 MB', uploadedBy: 'VNFOREST', uploadDate: '2023-06-15', hash: 'sha256:p6q7r8...i0j1', status: 'locked' },
];

const REVIEWER_COMMENTS = [
  { reviewer: 'Dr. Nguyen T.A.', role: 'Internal QA', date: '2024-12-22', comment: 'Carbon stock calculations verified. Uncertainty estimation follows IPCC Approach 1 correctly.', section: 'Carbon Stock', status: 'approved' },
  { reviewer: 'Ms. Tran L.P.', role: 'Data Analyst', date: '2024-12-20', comment: 'NDVI change detection results cross-referenced with field verification. 94% agreement rate.', section: 'NDVI Analysis', status: 'approved' },
  { reviewer: 'SGS Lead Auditor', role: 'Third-Party', date: '2024-12-18', comment: 'Request additional documentation for Ea Sup district deforestation event. Need higher-resolution imagery evidence.', section: 'Deforestation', status: 'query' },
  { reviewer: 'Mr. Le V.H.', role: 'Remote Sensing', date: '2024-12-15', comment: 'Landsat-8 classification accuracy assessment completed. Overall accuracy: 92.3%, Kappa: 0.89.', section: 'Classification', status: 'approved' },
  { reviewer: 'Dr. Nguyen T.A.', role: 'Internal QA', date: '2024-12-10', comment: 'Buffer pool calculation needs update — current withholding rate of 20% should be reassessed based on latest risk assessment.', section: 'Buffer Pool', status: 'revision' },
];

const QAQC_CHECKLIST = [
  { item: 'Data completeness — all required fields populated', status: 'passed' },
  { item: 'Temporal consistency — no gaps in time series', status: 'passed' },
  { item: 'Spatial consistency — no invalid coordinates', status: 'passed' },
  { item: 'Emission factor applicability — correct EFs used per stratum', status: 'passed' },
  { item: 'Allometric equation selection — validated against species list', status: 'passed' },
  { item: 'Uncertainty propagation — Approach 1 followed correctly', status: 'warning' },
  { item: 'Buffer pool adequacy — risk score updated', status: 'pending' },
  { item: 'Leakage assessment — no unaccounted displacement', status: 'pending' },
  { item: 'Cross-referencing — satellite vs field data alignment', status: 'passed' },
  { item: 'Metadata completeness — all datasets have proper metadata', status: 'warning' },
];

const VERSION_DIFFS = [
  { from: 'v3.1', to: 'v3.2', date: '2024-12-01', changes: 'Updated NDVI classification with December 2024 imagery', impact: '3 new deforestation alerts added', reviewer: 'Dr. Nguyen T.A.' },
  { from: 'v3.0', to: 'v3.1', date: '2024-06-15', changes: 'Corrected boundary data for Bu Gia Map district', impact: 'Carbon stock adjusted by +0.8%', reviewer: 'Ms. Tran L.P.' },
  { from: 'v2.5', to: 'v3.0', date: '2024-01-20', changes: 'Annual baseline update — new reference map', impact: 'Major revision: activity data updated for all strata', reviewer: 'Dr. Nguyen T.A.' },
];

const VERIFICATION_CYCLE = [
  { step: 'Data Collection Complete', status: 'completed', pct: 100 },
  { step: 'Internal QA/QC Review', status: 'completed', pct: 100 },
  { step: 'Data Package Submission to Auditor', status: 'completed', pct: 100 },
  { step: 'Third-Party Desk Review', status: 'in_progress', pct: 65 },
  { step: 'Site Visit & Field Verification', status: 'pending', pct: 0 },
  { step: 'Audit Report Finalization', status: 'pending', pct: 0 },
  { step: 'Verification Statement Issued', status: 'pending', pct: 0 },
];

export default function VerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification & Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digital MRV verification, evidence locker, QA/QC management, and third-party audit trails
        </p>
      </div>

      <Tabs defaultValue="lineage">
        <TabsList>
          <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Locker</TabsTrigger>
          <TabsTrigger value="comments">Reviewer Comments</TabsTrigger>
          <TabsTrigger value="qaqc">QA/QC Checklist</TabsTrigger>
          <TabsTrigger value="versions">Version Diffs</TabsTrigger>
          <TabsTrigger value="cycle">Verification Cycle</TabsTrigger>
        </TabsList>

        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4" /> Data Lineage Viewer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DATA_LINEAGE.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">Source</span>
                      <span className="text-sm font-medium">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.version}</Badge>
                      <Badge variant={item.status === 'verified' ? 'default' : 'secondary'} className="text-[10px]">
                        {item.status === 'verified' ? 'Verified' : 'Partial'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.transform}</span>
                    <span>→</span>
                    <span className="font-medium text-foreground">{item.output}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Evidence Locker</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
              {EVIDENCE_LOCKER.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{e.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{e.type}</span>
                        <span>·</span>
                        <span>{e.size}</span>
                        <span>·</span>
                        <span>{e.uploadDate}</span>
                        <span>·</span>
                        <span className="font-mono text-[10px]">{e.hash}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{e.uploadedBy}</span>
                    <Badge variant={e.status === 'locked' ? 'default' : 'secondary'} className="text-[10px]">
                      {e.status === 'locked' ? <Lock className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                      {e.status === 'locked' ? 'Locked' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Reviewer Comments Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REVIEWER_COMMENTS.map((c, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.reviewer}</span>
                      <Badge variant="outline" className="text-[10px]">{c.role}</Badge>
                    </div>
                    <Badge variant={c.status === 'approved' ? 'default' : c.status === 'revision' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {c.status === 'approved' ? 'Approved' : c.status === 'revision' ? 'Revision Needed' : 'Query'}
                    </Badge>
                  </div>
                  <p className="text-xs">{c.comment}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                    <span>{c.date}</span>
                    <span>·</span>
                    <span>Section: {c.section}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qaqc" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> QA/QC Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QAQC_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  {item.status === 'passed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : item.status === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm flex-1">{item.item}</span>
                  <Badge variant={item.status === 'passed' ? 'default' : item.status === 'warning' ? 'secondary' : 'outline'} className="text-[10px]">
                    {item.status === 'passed' ? 'Passed' : item.status === 'warning' ? 'Warning' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4" /> Version Diff Indicator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {VERSION_DIFFS.map((v, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-mono">{v.from}</Badge>
                    <span className="text-xs">→</span>
                    <Badge variant="default" className="text-[10px] font-mono">{v.to}</Badge>
                    <span className="text-xs text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-sm">{v.changes}</p>
                  <p className="text-xs text-muted-foreground mt-1">Impact: {v.impact} | Reviewed by: {v.reviewer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cycle" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Verification Cycle Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {VERIFICATION_CYCLE.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.status === 'completed' ? 'bg-emerald-500 text-white' : step.status === 'in_progress' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {step.status === 'completed' ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.step}</p>
                      <Progress value={step.pct} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{step.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p>Third-Party Auditor: <span className="font-semibold">SGS Vietnam</span></p>
                <p>Access Status: <Badge variant="default" className="text-[10px] ml-1">Active</Badge></p>
                <p>Audit Reference: SGS-VN-REDD-2024-003</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
