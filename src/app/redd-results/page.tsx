'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Award, TrendingDown, Shield, Heart, FileText, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RESULTS_BY_ACTIVITY = [
  { activity: 'Reduced Deforestation', emissions: 8.2, color: '#D32F2F' },
  { activity: 'Reduced Degradation', emissions: 3.4, color: '#FF8A65' },
  { activity: 'Conservation', emissions: 2.8, color: '#2D6A4F' },
  { activity: 'Sustainable Management (SMFM)', emissions: 1.5, color: '#40916C' },
  { activity: 'Carbon Stock Enhancement', emissions: 1.2, color: '#52B788' },
];

const SIS_STATUS = [
  { safeguard: 'Consistency with national forest policy', status: 'compliant', evidence: 3 },
  { safeguard: 'Transparent & effective national forest governance', status: 'compliant', evidence: 5 },
  { safeguard: 'Respect for indigenous peoples\' knowledge & rights', status: 'partial', evidence: 2 },
  { safeguard: 'Full & effective participation of stakeholders', status: 'compliant', evidence: 4 },
  { safeguard: 'Actions consistent with conservation of natural forests', status: 'compliant', evidence: 6 },
  { safeguard: 'Actions to address risk of reversals', status: 'compliant', evidence: 3 },
  { safeguard: 'Actions to reduce displacement of emissions', status: 'in_progress', evidence: 1 },
];

const NON_CARBON_BENEFITS = [
  { benefit: 'Biodiversity conservation — 12 endangered species protected', category: 'Biodiversity', status: 'achieved', evidence: 8 },
  { benefit: 'Watershed protection — 3 major rivers maintained', category: 'Water', status: 'achieved', evidence: 4 },
  { benefit: 'Livelihood improvement — 2,400 households benefited', category: 'Social', status: 'achieved', evidence: 12 },
  { benefit: 'Traditional knowledge preservation — 5 indigenous communities', category: 'Cultural', status: 'in_progress', evidence: 3 },
  { benefit: 'Ecosystem services — soil erosion reduced by 35%', category: 'Environmental', status: 'achieved', evidence: 6 },
];

const SUBMISSION_PACKAGE = [
  { component: 'Technical Annex — FREL/FRL', status: 'ready', format: 'PDF' },
  { component: 'Emission Reductions Summary Table', status: 'ready', format: 'XLSX' },
  { component: 'Safeguards Information System (SIS) Summary', status: 'in_progress', format: 'PDF' },
  { component: 'National Forest Monitoring Data Package', status: 'ready', format: 'GeoPackage' },
  { component: 'Verification Report (SGS)', status: 'pending', format: 'PDF' },
  { component: 'Non-Carbon Benefits Report', status: 'in_progress', format: 'PDF' },
  { component: 'Stakeholder Consultation Records', status: 'ready', format: 'PDF' },
];

export default function ReddResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">REDD+ Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Emission reductions reporting, safeguards tracking, and UNFCCC submission management
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <TrendingDown className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-700">7.1 MtCO₂</p>
            <p className="text-xs text-muted-foreground">Emission Reductions vs FREL</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Award className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">17.1 MtCO₂</p>
            <p className="text-xs text-muted-foreground">Total by All Activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Shield className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-amber-600">6/7</p>
            <p className="text-xs text-muted-foreground">Safeguards Compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">2/7</p>
            <p className="text-xs text-muted-foreground">Submission Package Pending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Results by Activity</TabsTrigger>
          <TabsTrigger value="safeguards">SIS Status</TabsTrigger>
          <TabsTrigger value="non-carbon">Non-Carbon Benefits</TabsTrigger>
          <TabsTrigger value="submission">UNFCCC Submission</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Emission Reductions by REDD+ Activity Type (MtCO₂)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={RESULTS_BY_ACTIVITY} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="activity" type="category" tick={{ fontSize: 10 }} width={200} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="emissions" fill="#2D6A4F" name="Emission Reductions (MtCO₂)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">45.2</p>
                    <p className="text-[10px] text-muted-foreground">FREL (MtCO₂/yr)</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-orange-700">38.1</p>
                    <p className="text-[10px] text-muted-foreground">2024 Actual (MtCO₂)</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">7.1</p>
                    <p className="text-[10px] text-muted-foreground">Net Reductions</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safeguards" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Safeguards Information System (SIS)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SIS_STATUS.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {s.status === 'compliant' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : s.status === 'partial' ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    <p className="text-sm">{s.safeguard}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.evidence} evidence</span>
                    <Badge variant={s.status === 'compliant' ? 'default' : s.status === 'partial' ? 'secondary' : 'outline'} className="text-[10px]">
                      {s.status === 'compliant' ? 'Compliant' : s.status === 'partial' ? 'Partial' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-carbon" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Heart className="w-4 h-4" /> Non-Carbon Benefits Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {NON_CARBON_BENEFITS.map((b, i) => (
                <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{b.benefit}</p>
                    <Badge variant={b.status === 'achieved' ? 'default' : 'secondary'} className="text-[10px]">
                      {b.status === 'achieved' ? 'Achieved' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Category: {b.category}</span>
                    <span>·</span>
                    <span>{b.evidence} evidence documents</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> UNFCCC Submission Package Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUBMISSION_PACKAGE.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === 'ready' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : item.status === 'in_progress' ? <Clock className="w-4 h-4 text-yellow-500" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm">{item.component}</p>
                      <p className="text-xs text-muted-foreground">Format: {item.format}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'ready' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'} className="text-[10px]">
                    {item.status === 'ready' ? 'Ready' : item.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>
              ))}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p>Overall package readiness: <span className="font-semibold text-emerald-600">5/7 components ready</span></p>
                <p>Target submission: 2025-Q1 to UNFCCC Lima Hub</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
