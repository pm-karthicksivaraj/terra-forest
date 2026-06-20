'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TreePine, CheckCircle2, Clock, FlaskConical, ShieldCheck, AlertCircle } from 'lucide-react';

const SUMMARY = [
  { label: 'Total Sample Plots', value: '156', icon: TreePine, color: 'text-emerald-700' },
  { label: 'Measured', value: '132', icon: CheckCircle2, color: 'text-emerald-500' },
  { label: 'Pending', value: '24', icon: Clock, color: 'text-orange-500' },
  { label: 'Last Campaign', value: '2024-Q3', icon: Clock, color: 'text-muted-foreground' },
];

const SAMPLE_PLOTS = [
  { id: 'NFI-DN-001', province: 'Dong Nai', forestType: 'Natural Forest', area: 0.5, lastMeasured: '2024-08-15', dbhMean: 28.4, biomass: 185.2, status: 'measured' },
  { id: 'NFI-DN-002', province: 'Dong Nai', forestType: 'Planted Forest', area: 0.5, lastMeasured: '2024-08-16', dbhMean: 18.7, biomass: 98.5, status: 'measured' },
  { id: 'NFI-DN-003', province: 'Dong Nai', forestType: 'Protection Forest', area: 1.0, lastMeasured: '2024-08-18', dbhMean: 32.1, biomass: 210.8, status: 'measured' },
  { id: 'NFI-BP-001', province: 'Binh Phuoc', forestType: 'Natural Forest', area: 0.5, lastMeasured: '2024-09-02', dbhMean: 25.6, biomass: 165.3, status: 'measured' },
  { id: 'NFI-BP-002', province: 'Binh Phuoc', forestType: 'Planted Forest', area: 0.5, lastMeasured: '2024-09-03', dbhMean: 15.2, biomass: 78.9, status: 'measured' },
  { id: 'NFI-DL-001', province: 'Dak Lak', forestType: 'Natural Forest', area: 1.0, lastMeasured: '2024-09-20', dbhMean: 30.8, biomass: 198.7, status: 'measured' },
  { id: 'NFI-DL-002', province: 'Dak Lak', forestType: 'Natural Forest', area: 1.0, lastMeasured: null, dbhMean: null, biomass: null, status: 'pending' },
  { id: 'NFI-LD-001', province: 'Lam Dong', forestType: 'Protection Forest', area: 0.5, lastMeasured: '2024-10-05', dbhMean: 35.4, biomass: 245.1, status: 'measured' },
  { id: 'NFI-CM-001', province: 'Ca Mau', forestType: 'Mangrove Forest', area: 0.25, lastMeasured: null, dbhMean: null, biomass: null, status: 'pending' },
  { id: 'NFI-CM-002', province: 'Ca Mau', forestType: 'Mangrove Forest', area: 0.25, lastMeasured: '2024-10-12', dbhMean: 12.3, biomass: 125.8, status: 'measured' },
];

const ALLOMETRIC_EQUATIONS = [
  { id: 'EQ-001', name: 'Chave et al. (2014) — Tropical Moist', application: 'Natural Forest', equation: 'AGB = 0.0673 × (ρD²H)^0.976', reference: 'Chave et al., Global Change Biology 2014' },
  { id: 'EQ-002', name: 'IPCC (2006) — Default Tropical', application: 'Planted Forest', equation: 'AGB = exp(-1.499 + 2.148 × ln(D))', reference: 'IPCC 2006 Guidelines Vol. 4' },
  { id: 'EQ-003', name: 'Komiyama et al. (2005) — Mangrove', application: 'Mangrove Forest', equation: 'AGB = 0.251 × ρ × D^2.46', reference: 'Komiyama et al., J. Trop. Ecol. 2005' },
  { id: 'EQ-004', name: 'Vietnam National — Dipterocarp', application: 'Protection Forest', equation: 'AGB = 0.0552 × ρ × D^1.862 × H^0.845', reference: 'VNFOREST Technical Guide 2018' },
];

const QA_QC_STEPS = [
  { step: 'Field Protocol Compliance', status: 'completed', pct: 100 },
  { step: 'Data Entry Verification', status: 'completed', pct: 100 },
  { step: 'Outlier Detection (DBH, Height)', status: 'completed', pct: 100 },
  { step: 'Species Identification Review', status: 'in_progress', pct: 75 },
  { step: 'Allometric Equation Validation', status: 'in_progress', pct: 60 },
  { step: 'Carbon Stock Uncertainty Check', status: 'pending', pct: 20 },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'measured') return <Badge variant="default" className="text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Measured</Badge>;
  return <Badge variant="outline" className="text-[10px] gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
}

export default function NfiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">NFI Field Plots</h1>
        <p className="text-sm text-muted-foreground mt-1">
          National Forest Inventory — sampling design, field measurements, and biomass estimation
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

      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">Sample Plot Registry</TabsTrigger>
          <TabsTrigger value="allometric">Allometric Equations</TabsTrigger>
          <TabsTrigger value="qaqc">QA/QC Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Sample Plot Registry</CardTitle></CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Plot ID</th>
                    <th className="text-left py-2 px-2 font-semibold">Province</th>
                    <th className="text-left py-2 px-2 font-semibold">Forest Type</th>
                    <th className="text-right py-2 px-2 font-semibold">Area (ha)</th>
                    <th className="text-left py-2 px-2 font-semibold">Last Measured</th>
                    <th className="text-right py-2 px-2 font-semibold">DBH Mean (cm)</th>
                    <th className="text-right py-2 px-2 font-semibold">Biomass (tC/ha)</th>
                    <th className="text-left py-2 pl-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_PLOTS.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2 font-mono">{p.id}</td>
                      <td className="py-2 px-2">{p.province}</td>
                      <td className="py-2 px-2">{p.forestType}</td>
                      <td className="py-2 px-2 text-right">{p.area.toFixed(2)}</td>
                      <td className="py-2 px-2">{p.lastMeasured || '—'}</td>
                      <td className="py-2 px-2 text-right">{p.dbhMean?.toFixed(1) || '—'}</td>
                      <td className="py-2 px-2 text-right">{p.biomass?.toFixed(1) || '—'}</td>
                      <td className="py-2 pl-2"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allometric" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Allometric Equation Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALLOMETRIC_EQUATIONS.map(eq => (
                <div key={eq.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold">{eq.id}</span>
                    <Badge variant="outline" className="text-[10px]">{eq.application}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{eq.name}</p>
                  <p className="text-xs font-mono bg-muted/50 p-2 rounded mb-2">{eq.equation}</p>
                  <p className="text-[10px] text-muted-foreground">Reference: {eq.reference}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qaqc" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> QA/QC Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Quality assurance and quality control workflow for NFI field measurements. Each step validates data integrity before carbon stock calculations.</p>
              <div className="space-y-4">
                {QA_QC_STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.status === 'completed' ? 'bg-emerald-500 text-white' : step.status === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {step.status === 'completed' ? '✓' : step.status === 'in_progress' ? '⏳' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.step}</p>
                      <Progress value={step.pct} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{step.pct}%</span>
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
