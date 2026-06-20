'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Calendar, RefreshCw, Clock, CheckCircle, Loader2, Globe } from 'lucide-react';
import { PROVINCES } from '@/lib/constants';

const REPORT_TEMPLATES = [
  { id: 1, name: 'Comprehensive Forest Report', type: 'full', desc: 'Full forest status report with area, health, and risk assessment across all provinces. Includes NDVI analysis, alert summaries, and carbon stock calculations.', icon: '📊' },
  { id: 2, name: 'Annual Carbon Report', type: 'carbon', desc: 'Carbon stock, credits, and REDD+ emission reductions aligned with UNFCCC reporting format. Follows IPCC 2006 Guidelines for national GHG inventories.', icon: '🌿' },
  { id: 3, name: 'Alert Summary Report', type: 'alerts', desc: 'Consolidated alert statistics, response times, and resolution outcomes. Includes severity breakdown, response time analysis, and incident trends.', icon: '🚨' },
  { id: 4, name: 'NDVI Analysis Report', type: 'ndvi', desc: 'Vegetation index trends, anomaly detection, and seasonal analysis from Sentinel-2 L2A imagery. Includes change detection maps.', icon: '🛰️' },
  { id: 5, name: 'Patrol Activity Report', type: 'patrol', desc: 'Ranger patrol coverage, observation summaries, and team performance metrics. Includes route maps and evidence quality assessment.', icon: '🥾' },
  { id: 6, name: 'Biodiversity Assessment', type: 'biodiversity', desc: 'Species inventory, diversity indices, and conservation status assessment. Includes IUCN classification and CITES compliance review.', icon: '🦋' },
  { id: 7, name: 'UNFCCC Biennial Update Report', type: 'unfccc', desc: 'Biennial update report aligned with UNFCCC BUR format. Covers REDD+ results, FREL/FRL comparison, MRV methodology, and safeguards summary per Decision 14/CP.19.', icon: '🌐' },
];

const RECENT_REPORTS = [
  { id: 1, name: 'Dong Nai Forest Report Q4/2024', type: 'full', status: 'completed', date: '2024-12-15', size: '2.4 MB', generatedBy: 'System' },
  { id: 2, name: 'Carbon Report 2024', type: 'carbon', status: 'completed', date: '2024-12-10', size: '1.8 MB', generatedBy: 'Dr. Nguyen' },
  { id: 3, name: 'Alert Summary December 2024', type: 'alerts', status: 'completed', date: '2024-12-08', size: '950 KB', generatedBy: 'System' },
  { id: 4, name: 'NDVI Analysis Q4/2024', type: 'ndvi', status: 'processing', date: '2025-03-04', size: '-', generatedBy: 'System' },
  { id: 5, name: 'Patrol Report Ea Sup District', type: 'patrol', status: 'processing', date: '2025-03-04', size: '-', generatedBy: 'Ops Manager' },
  { id: 6, name: 'Biodiversity Annual 2024', type: 'biodiversity', status: 'queued', date: '2025-03-04', size: '-', generatedBy: 'System' },
  { id: 7, name: 'Binh Phuoc Forest Report', type: 'full', status: 'completed', date: '2024-11-30', size: '2.1 MB', generatedBy: 'System' },
  { id: 8, name: 'Carbon Quarter 3/2024', type: 'carbon', status: 'completed', date: '2024-09-30', size: '1.5 MB', generatedBy: 'Dr. Nguyen' },
];

const SCHEDULED_REPORTS = [
  { name: 'Monthly Forest Status Report', frequency: 'Monthly', nextRun: '2025-04-01', type: 'full', active: true, recipients: 'Operations, Provincial Authority' },
  { name: 'Quarterly Carbon Report', frequency: 'Quarterly', nextRun: '2025-04-01', type: 'carbon', active: true, recipients: 'REDD+ Office, UNFCCC Focal Point' },
  { name: 'Weekly Alert Summary', frequency: 'Weekly', nextRun: '2025-03-10', type: 'alerts', active: true, recipients: 'Operations, Ranger Teams' },
  { name: 'Monthly NDVI Report', frequency: 'Monthly', nextRun: '2025-04-01', type: 'ndvi', active: false, recipients: 'GIS Team' },
];

const FRMS_SYNC = [
  { type: 'Nightly Sync', status: 'success', records: 1245, time: '2025-03-04 02:00', duration: '45s', details: 'Forest inventory, carbon records, alert data synchronized' },
  { type: 'Manual Sync', status: 'success', records: 89, time: '2025-03-03 14:30', duration: '12s', details: 'Triggered by Operations Manager for updated patrol data' },
  { type: 'Nightly Sync', status: 'success', records: 1198, time: '2025-03-03 02:00', duration: '42s', details: 'Forest inventory, carbon records, alert data synchronized' },
  { type: 'Nightly Sync', status: 'failed', records: 0, time: '2025-03-02 02:00', duration: '-', details: 'Connection timeout to FRMS 4.0 API endpoint. Retry at 03:00 succeeded.' },
];

export default function ReportsPage() {
  const [showGenerate, setShowGenerate] = useState(false);

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-forest-500" />;
    if (status === 'processing') return <Loader2 className="w-3.5 h-3.5 text-fire-700 animate-spin" />;
    return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Completed';
    if (status === 'processing') return 'Processing';
    return 'Queued';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, schedule, and manage forestry reports for compliance and operations. Reports use
            UNFCCC-aligned templates and integrate with FRMS 4.0 for data synchronization. Export
            formats include PDF and Excel for official submissions to provincial authorities and
            international reporting frameworks.
          </p>
        </div>
        <Button className="bg-forest-600 hover:bg-forest-700" onClick={() => setShowGenerate(true)}>
          <FileText className="w-4 h-4 mr-1" /> Generate Report
        </Button>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="frms">FRMS 4.0 Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map(tpl => (
              <Card key={tpl.id} className="shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{tpl.icon}</div>
                  <h3 className="text-sm font-semibold">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.desc}</p>
                  {tpl.type === 'unfccc' && (
                    <Badge variant="outline" className="mt-2 text-[9px] border-forest-500 text-forest-600">UNFCCC Aligned</Badge>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => setShowGenerate(true)}>Generate</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-0">
              <div className="divide-y">
                {RECENT_REPORTS.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <p className="text-xs font-medium">{report.name}</p>
                        <p className="text-[10px] text-muted-foreground">{report.date} | {report.size} | Generated by: {report.generatedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5">{report.type}</Badge>
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">{getStatusLabel(report.status)}</Badge>
                      {report.status === 'completed' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" /> Download</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-0">
              <div className="divide-y">
                {SCHEDULED_REPORTS.map((sr, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-forest-600" />
                      <div>
                        <p className="text-xs font-medium">{sr.name}</p>
                        <p className="text-[10px] text-muted-foreground">{sr.frequency} | Next run: {sr.nextRun} | Recipients: {sr.recipients}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5">{sr.type}</Badge>
                      <Badge className={sr.active ? 'bg-forest-500 text-white' : 'bg-muted text-muted-foreground'} style={{ fontSize: 10 }}>
                        {sr.active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frms" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><RefreshCw className="w-4 h-4 text-forest-600" /> FRMS 4.0 Synchronization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 mb-4 text-xs">
                <p className="font-semibold mb-1">Forest Resource Management System (FRMS) 4.0</p>
                <p>FRMS 4.0 is Vietnam&apos;s national forest management platform maintained by the Vietnam Administration of Forestry. Data synchronization between Terra Forest and FRMS ensures consistency of forest inventory, carbon stock, and alert data across government systems. Nightly syncs are scheduled at 02:00 ICT (UTC+7).</p>
              </div>
              <div className="space-y-2">
                {FRMS_SYNC.map((sync, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs font-medium">{sync.type}</p>
                        <p className="text-[10px] text-muted-foreground">{sync.time} | Duration: {sync.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{sync.records} records</span>
                        <Badge className={sync.status === 'success' ? 'bg-forest-500 text-white' : 'bg-red-500 text-white'} style={{ fontSize: 10 }}>{sync.status === 'success' ? 'Success' : 'Failed'}</Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{sync.details}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs"><RefreshCw className="w-3 h-3 mr-1" /> Sync Now</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Generate New Report</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Report Type</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Comprehensive Forest Report</SelectItem>
                  <SelectItem value="carbon">Annual Carbon Report</SelectItem>
                  <SelectItem value="alerts">Alert Summary Report</SelectItem>
                  <SelectItem value="ndvi">NDVI Analysis Report</SelectItem>
                  <SelectItem value="patrol">Patrol Activity Report</SelectItem>
                  <SelectItem value="biodiversity">Biodiversity Assessment</SelectItem>
                  <SelectItem value="unfccc">UNFCCC Biennial Update Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From Date</Label>
                <Input type="date" className="mt-1" defaultValue="2025-01-01" />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input type="date" className="mt-1" defaultValue="2025-03-04" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Province</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All Provinces" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {PROVINCES.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Export Format</Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="both">Both PDF + Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-forest-600 hover:bg-forest-700">Generate Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
