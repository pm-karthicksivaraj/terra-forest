'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, GitBranch, Calendar, BarChart3, ArrowDownUp, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const FREL_SUMMARY = {
  value: '45.2 MtCO₂/yr',
  referencePeriod: '2015–2019',
  submissionDate: '2023-06-15',
  methodology: 'Average historical emissions',
  status: 'Submitted to UNFCCC',
  scope: 'CO₂ from deforestation & degradation',
  provinces: 5,
  totalArea: '2.4M ha',
};

const BASELINE_DATA = [
  { year: 2015, deforestation: 32.1, degradation: 13.1, total: 45.2 },
  { year: 2016, deforestation: 34.8, degradation: 13.9, total: 48.7 },
  { year: 2017, deforestation: 37.2, degradation: 14.9, total: 52.1 },
  { year: 2018, deforestation: 35.1, degradation: 14.2, total: 49.3 },
  { year: 2019, deforestation: 36.9, degradation: 14.9, total: 51.8 },
];

const SCENARIO_ASSUMPTIONS = [
  { assumption: 'Historical deforestation rate continues unchanged', category: 'Baseline', value: '45.2 MtCO₂/yr', confidence: 'High' },
  { assumption: 'No major policy changes during monitoring period', category: 'Policy', value: 'Assumed', confidence: 'Medium' },
  { assumption: 'Forest cover remains at 2020 levels without intervention', category: 'Land Use', value: '42.1% forest cover', confidence: 'Medium' },
  { assumption: 'Emission factors remain constant (no technology shift)', category: 'EF', value: 'Tier 2 defaults', confidence: 'High' },
  { assumption: 'Climate variability within historical range', category: 'Climate', value: '±5% adjustment', confidence: 'Low' },
  { assumption: 'No major natural disturbances (volcanic, earthquake)', category: 'Force Majeure', value: 'Excluded', confidence: 'N/A' },
];

const CALCULATION_SNAPSHOTS = [
  { version: 'v2.0', date: '2024-12-01', fRelValue: '45.2', method: 'Historical average (2015-2019)', status: 'current', change: '+0.0' },
  { version: 'v1.2', date: '2024-06-15', fRelValue: '45.2', method: 'Historical average (2015-2019)', status: 'archived', change: '+0.0' },
  { version: 'v1.1', date: '2023-12-01', fRelValue: '44.8', method: 'Historical average (2015-2019, updated AD)', status: 'archived', change: '-0.4' },
  { version: 'v1.0', date: '2023-06-15', fRelValue: '45.2', method: 'Initial submission', status: 'archived', change: 'Baseline' },
];

const DEVIATION_DATA = [
  { year: 2020, frel: 45.2, actual: 46.5, deviation: 1.3 },
  { year: 2021, frel: 45.2, actual: 44.2, deviation: -1.0 },
  { year: 2022, frel: 45.2, actual: 42.8, deviation: -2.4 },
  { year: 2023, frel: 45.2, actual: 40.5, deviation: -4.7 },
  { year: 2024, frel: 45.2, actual: 38.1, deviation: -7.1 },
];

export default function FrelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FREL / FRL Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Forest Reference Emission Level development for REDD+ results reporting
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">FREL Value</p>
              <p className="text-2xl font-bold text-emerald-700">{FREL_SUMMARY.value}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reference Period</p>
              <p className="text-sm font-semibold">{FREL_SUMMARY.referencePeriod}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submission Date</p>
              <p className="text-sm font-semibold">{FREL_SUMMARY.submissionDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="default" className="text-xs">{FREL_SUMMARY.status}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-3 pt-3 border-t">
            <div><p className="text-xs text-muted-foreground">Methodology</p><p className="text-xs">{FREL_SUMMARY.methodology}</p></div>
            <div><p className="text-xs text-muted-foreground">Scope</p><p className="text-xs">{FREL_SUMMARY.scope}</p></div>
            <div><p className="text-xs text-muted-foreground">Coverage</p><p className="text-xs">{FREL_SUMMARY.provinces} provinces · {FREL_SUMMARY.totalArea}</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="baseline">
        <TabsList>
          <TabsTrigger value="baseline">Reference Period & Baseline</TabsTrigger>
          <TabsTrigger value="assumptions">Scenario Assumptions</TabsTrigger>
          <TabsTrigger value="snapshots">Calculation Snapshots</TabsTrigger>
          <TabsTrigger value="deviation">Deviation Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="baseline" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Historical Reference Period (2015-2019)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={BASELINE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="deforestation" fill="#D32F2F" name="Deforestation (MtCO₂)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="degradation" fill="#FF8A65" name="Degradation (MtCO₂)" radius={[4, 4, 0, 0]} />
                  <ReferenceLine y={45.2} stroke="#2D6A4F" strokeDasharray="5 5" label={{ value: 'FREL: 45.2', position: 'right', fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
                <p className="font-semibold mb-1">Calculation:</p>
                <p>FREL = Average annual emissions during reference period = (45.2 + 48.7 + 52.1 + 49.3 + 51.8) / 5 = 49.4 MtCO₂/yr</p>
                <p>Adjusted FREL (conservative) = 45.2 MtCO₂/yr (after applying national circumstances adjustment factor of 0.915)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assumptions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Scenario Assumptions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {SCENARIO_ASSUMPTIONS.map((a, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{a.assumption}</p>
                    <Badge variant={a.confidence === 'High' ? 'default' : a.confidence === 'Medium' ? 'secondary' : 'outline'} className="text-[10px]">
                      {a.confidence}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Category: {a.category}</span>
                    <span>·</span>
                    <span>Value: {a.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshots" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4" /> FREL Calculation Snapshots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CALCULATION_SNAPSHOTS.map(s => (
                <div key={s.version} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${s.status === 'current' ? 'bg-emerald-500' : 'bg-muted'}`} />
                    <div>
                      <p className="text-sm font-medium">{s.version}</p>
                      <p className="text-xs text-muted-foreground">{s.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono">{s.date}</span>
                    <span className="text-sm font-bold">{s.fRelValue} MtCO₂/yr</span>
                    <Badge variant={s.status === 'current' ? 'default' : 'outline'} className="text-[10px]">
                      {s.status === 'current' ? 'Current' : 'Archived'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Δ {s.change}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deviation" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowDownUp className="w-4 h-4" /> Deviation Analysis vs Monitoring Period</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={DEVIATION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="frel" fill="#9E9E9E" name="FREL (MtCO₂)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="#2D6A4F" name="Actual Emissions (MtCO₂)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-2 font-semibold">Year</th>
                      <th className="text-right py-2 px-2 font-semibold">FREL</th>
                      <th className="text-right py-2 px-2 font-semibold">Actual</th>
                      <th className="text-right py-2 px-2 font-semibold">Deviation</th>
                      <th className="text-left py-2 pl-2 font-semibold">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEVIATION_DATA.map(d => (
                      <tr key={d.year} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-2">{d.year}</td>
                        <td className="py-2 px-2 text-right">{d.frel}</td>
                        <td className="py-2 px-2 text-right">{d.actual}</td>
                        <td className={`py-2 px-2 text-right font-semibold ${d.deviation < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {d.deviation > 0 ? '+' : ''}{d.deviation.toFixed(1)}
                        </td>
                        <td className="py-2 pl-2 text-muted-foreground">
                          {d.deviation < 0 ? `Emission reduction of ${Math.abs(d.deviation).toFixed(1)} MtCO₂` : `Exceeded FREL by ${d.deviation.toFixed(1)} MtCO₂`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
