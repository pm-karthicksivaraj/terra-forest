'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { CloudCog, TrendingUp, Shield, Calculator, FileCheck, Database, TrendingDown, Award, ShieldCheck, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const CARBON_TREND = [
  { year: 2019, stock: 68000, credits: 0 },
  { year: 2020, stock: 71500, credits: 12000 },
  { year: 2021, stock: 74800, credits: 18500 },
  { year: 2022, stock: 79200, credits: 26000 },
  { year: 2023, stock: 83500, credits: 34000 },
  { year: 2024, stock: 88200, credits: 42000 },
];

const CARBON_BY_TYPE = [
  { name: 'Natural Forest', value: 42500, color: '#2D6A4F' },
  { name: 'Planted Forest', value: 18200, color: '#52B788' },
  { name: 'Protection Forest', value: 15800, color: '#40916C' },
  { name: 'Mangrove Forest', value: 11700, color: '#0277BD' },
];

const CARBON_BY_PROVINCE = [
  { province: 'Dong Nai', stock: 28500, verified: 22000 },
  { province: 'Binh Phuoc', stock: 18900, verified: 15000 },
  { province: 'Dak Lak', stock: 22100, verified: 12000 },
  { province: 'Lam Dong', stock: 12400, verified: 10000 },
  { province: 'Ca Mau', stock: 6300, verified: 4000 },
];

const MRV_STEPS = [
  { step: 'Monitoring (M)', label: 'Data Collection & Satellite Analysis', status: 'completed', pct: 100 },
  { step: 'Reporting (R)', label: 'Carbon Stock Calculation & Reporting', status: 'completed', pct: 100 },
  { step: 'Internal Verification', label: 'QA/QC & Internal Audit', status: 'completed', pct: 100 },
  { step: 'Third-Party Verification', label: 'Independent Auditor Review (SGS)', status: 'in_progress', pct: 65 },
  { step: 'Credit Issuance', label: 'Registry Approval & Credit Minting', status: 'pending', pct: 0 },
];

const REDD_COMPLIANCE = [
  { item: 'National Forest Monitoring System (NFMS)', status: 'completed', pct: 100 },
  { item: 'Forest Reference Emission Level (FREL)', status: 'completed', pct: 100 },
  { item: 'Measurement & Monitoring Framework', status: 'completed', pct: 100 },
  { item: 'Safeguards Information System (SIS)', status: 'in_progress', pct: 75 },
  { item: 'Institutional Arrangements', status: 'in_progress', pct: 50 },
  { item: 'Independent Verification & Validation', status: 'pending', pct: 10 },
];

const NFMS_INTEGRATION = [
  { source: 'Sentinel-2 L2A', type: 'Satellite Imagery', frequency: '5-day revisit', status: 'connected', records: 1240 },
  { source: 'Landsat 8/9', type: 'Satellite Imagery', frequency: '16-day revisit', status: 'connected', records: 856 },
  { source: 'FRMS 4.0', type: 'Field Records', frequency: 'Real-time', status: 'connected', records: 3420 },
  { source: 'GeoNetwork', type: 'Metadata Catalog', frequency: 'Weekly sync', status: 'connected', records: 980 },
  { source: 'Vietnam Forestry DB', type: 'Official Statistics', frequency: 'Annual', status: 'partial', records: 210 },
  { source: 'GFW Alerts', type: 'Deforestation Alerts', frequency: 'Daily', status: 'connected', records: 5680 },
];

const FREL_DATA = [
  { year: 2015, emissions: 45.2, removals: -32.1 },
  { year: 2016, emissions: 48.7, removals: -30.5 },
  { year: 2017, emissions: 52.1, removals: -28.9 },
  { year: 2018, emissions: 49.3, removals: -31.2 },
  { year: 2019, emissions: 51.8, removals: -29.7 },
  { year: 2020, emissions: 46.5, removals: -33.4 },
  { year: 2021, emissions: 44.2, removals: -35.1 },
  { year: 2022, emissions: 42.8, removals: -36.2 },
  { year: 2023, emissions: 40.5, removals: -37.8 },
  { year: 2024, emissions: 38.1, removals: -39.5 },
];

const GHG_INVENTORY_DATA = [
  { category: 'Deforestation', emissions: 22.4, removals: 0, net: 22.4 },
  { category: 'Degradation', emissions: 10.8, removals: 0, net: 10.8 },
  { category: 'Forest Growth', emissions: 0, removals: -35.2, net: -35.2 },
  { category: 'Afforestation', emissions: 0, removals: -8.3, net: -8.3 },
  { category: 'Mangrove Restoration', emissions: 0, removals: -4.2, net: -4.2 },
];

const VERIFICATION_CHECKS = [
  { check: 'Data completeness validation', status: 'passed' },
  { check: 'Satellite imagery cross-reference', status: 'passed' },
  { check: 'Field measurement consistency', status: 'passed' },
  { check: 'Emission factor applicability', status: 'passed' },
  { check: 'Uncertainty quantification', status: 'warning' },
  { check: 'Buffer pool adequacy', status: 'pending' },
  { check: 'Leakage assessment', status: 'pending' },
  { check: 'Permanence risk evaluation', status: 'pending' },
];

export default function CarbonPage() {
  const [calcArea, setCalcArea] = useState(1000);
  const [calcType, setCalcType] = useState('natural');

  const getCarbonPerHa = (type: string) => {
    switch (type) {
      case 'natural': return 250;
      case 'planted': return 120;
      case 'protection': return 200;
      case 'mangrove': return 180;
      default: return 150;
    }
  };

  const estimatedCarbon = calcArea * getCarbonPerHa(calcType);
  const estimatedCO2 = estimatedCarbon * 3.67;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">REDD+ / dMRV</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digital Measurement, Reporting, and Verification for REDD+ carbon accounting and compliance
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mrv">MRV Process</TabsTrigger>
          <TabsTrigger value="calculator">Carbon Calculator</TabsTrigger>
          <TabsTrigger value="compliance">REDD+ Compliance</TabsTrigger>
          <TabsTrigger value="nfms">NFMS Integration</TabsTrigger>
          <TabsTrigger value="frel">FREL/FRL</TabsTrigger>
          <TabsTrigger value="ghg">GHG Inventory</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <CloudCog className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-700">88,200</p>
                <p className="text-xs text-muted-foreground">Total Carbon Stock (tC)</p>
                <p className="text-[9px] text-muted-foreground mt-1">Source: Field + Remote Sensing | Updated: 2024-12-31</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-emerald-600">42,000</p>
                <p className="text-xs text-muted-foreground">Carbon Credits (tCO₂e)</p>
                <p className="text-[9px] text-muted-foreground mt-1">Methodology: VCS VM0048 | Method: Stock-Difference</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Shield className="w-5 h-5 text-amber-700 mb-2" />
                <p className="text-2xl font-bold text-amber-700">63,000</p>
                <p className="text-xs text-muted-foreground">Verified Carbon (tC)</p>
                <p className="text-[9px] text-muted-foreground mt-1">Third-Party Verifier: SGS | Audit date: 2024-11-15</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <FileCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-emerald-500">5</p>
                <p className="text-xs text-muted-foreground">Credits Issued</p>
                <p className="text-[9px] text-muted-foreground mt-1">Registry: Verra VCS | Last issuance: 2024-Q3</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Carbon Stock & Credit Trend (2019-2024)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={CARBON_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="stock" stroke="#2D6A4F" strokeWidth={2.5} name="Carbon Stock (tC)" />
                  <Line type="monotone" dataKey="credits" stroke="#52B788" strokeWidth={2} strokeDasharray="5 5" name="Credits (tCO₂e)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Carbon by Forest Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={CARBON_BY_TYPE} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value.toLocaleString()}`}>
                      {CARBON_BY_TYPE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Carbon by Province</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={CARBON_BY_PROVINCE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                    <XAxis dataKey="province" tick={{ fontSize: 10 }} stroke="#4A6A54" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#4A6A54" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="stock" fill="#2D6A4F" name="Total (tC)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="verified" fill="#52B788" name="Verified (tC)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-1">Methodology Version</p>
                <p className="text-sm">VCS VM0048 v2.1</p>
                <p className="text-[10px] text-muted-foreground mt-1">Verified Carbon Standard — Reduced Deforestation methodology</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-1">Uncertainty Range</p>
                <p className="text-sm">±12.5% (95% CI)</p>
                <p className="text-[10px] text-muted-foreground mt-1">Combined uncertainty from all sources per IPCC guidelines</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold mb-1">Buffer Pool</p>
                <p className="text-sm">8,400 tCO₂e (20% withholding)</p>
                <p className="text-[10px] text-muted-foreground mt-1">Non-permanence risk buffer maintained in VCS registry</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mrv" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">MRV Process Status</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">The MRV cycle follows: Monitoring (satellite & field data collection) → Reporting (carbon calculations per IPCC Tier 2) → Internal Verification (QA/QC) → Third-Party Verification (independent audit) → Credit Issuance (registry approval). Current cycle: 2024 annual verification.</p>
              <div className="space-y-4">
                {MRV_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${step.status === 'completed' ? 'bg-emerald-500 text-white' : step.status === 'in_progress' ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {step.status === 'completed' ? '✓' : step.status === 'in_progress' ? '⏳' : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{step.step}</p>
                          <p className="text-xs text-muted-foreground">{step.label}</p>
                        </div>
                        <Badge variant={step.status === 'completed' ? 'default' : step.status === 'in_progress' ? 'secondary' : 'outline'} className="text-[10px]">
                          {step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <Progress value={step.pct} className="h-1.5 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Calculator className="w-4 h-4" /> Carbon Stock Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Estimate carbon stock and CO₂ equivalent using IPCC default emission factors by forest type. This is a simplified Tier 1 calculation — actual MRV uses Tier 2/3 with plot-level measurements and allometric equations.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Area (ha)</label>
                  <input type="number" value={calcArea} onChange={(e) => setCalcArea(Number(e.target.value))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Forest Type</label>
                  <select value={calcType} onChange={(e) => setCalcType(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-background">
                    <option value="natural">Natural Forest (250 tC/ha)</option>
                    <option value="planted">Planted Forest (120 tC/ha)</option>
                    <option value="protection">Protection Forest (200 tC/ha)</option>
                    <option value="mangrove">Mangrove Forest (180 tC/ha)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">{estimatedCarbon.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Carbon Stock (tC)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{estimatedCO2.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">CO₂ Equivalent (tCO₂e)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-500">{getCarbonPerHa(calcType)}</p>
                  <p className="text-xs text-muted-foreground">Emission Factor (tC/ha)</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold mb-1">Formula:</p>
                <p>Carbon Stock = Area (ha) × Emission Factor (tC/ha)</p>
                <p>CO₂ Equivalent = Carbon Stock × 3.67 (molecular weight ratio)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Award className="w-4 h-4" /> REDD+ Compliance Checklist</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">REDD+ requires adherence to the Warsaw Framework: NFMS, FREL/FRL, SIS, and results-based reporting. Track compliance with each component for UNFCCC submission and results-based payments.</p>
              <div className="space-y-4">
                {REDD_COMPLIANCE.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${item.status === 'completed' ? 'bg-emerald-500 text-white' : item.status === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {item.status === 'completed' ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{item.item}</p>
                      <Progress value={item.pct} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfms" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4" /> NFMS Data Source Integration</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {NFMS_INTEGRATION.map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${src.status === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{src.source}</p>
                        <p className="text-xs text-muted-foreground">{src.type} · {src.frequency}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{src.records.toLocaleString()} records</span>
                      <Badge variant={src.status === 'connected' ? 'default' : 'secondary'} className="text-[10px]">
                        {src.status === 'connected' ? 'Connected' : 'Partial'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frel" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Forest Reference Emission Level (FREL/FRL)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">The FREL establishes the benchmark for emission reductions. Calculated from historical rates (2015-2019), adjusted for national circumstances. Submitted to UNFCCC in 2023.</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={FREL_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#E65100" name="Emissions (MtCO₂)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="removals" fill="#2D6A4F" name="Removals (MtCO₂)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">45.2</p>
                    <p className="text-[10px] text-muted-foreground">FREL (MtCO₂/yr)</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-orange-700">38.1</p>
                    <p className="text-[10px] text-muted-foreground">2024 Actual Emissions</p>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">7.1</p>
                    <p className="text-[10px] text-muted-foreground">Emission Reductions</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ghg" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">GHG Inventory Summary (MtCO₂e)</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold">Category</th>
                      <th className="text-right py-2 px-2 font-semibold">Emissions</th>
                      <th className="text-right py-2 px-2 font-semibold">Removals</th>
                      <th className="text-right py-2 pl-2 font-semibold">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GHG_INVENTORY_DATA.map((row, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-4">{row.category}</td>
                        <td className="py-2 px-2 text-right text-red-600">{row.emissions > 0 ? row.emissions.toFixed(1) : '—'}</td>
                        <td className="py-2 px-2 text-right text-emerald-600">{row.removals < 0 ? row.removals.toFixed(1) : '—'}</td>
                        <td className={`py-2 pl-2 text-right font-semibold ${row.net < 0 ? 'text-emerald-600' : 'text-red-600'}`}>{row.net > 0 ? '+' : ''}{row.net.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verification Checklist</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {VERIFICATION_CHECKS.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    {item.status === 'passed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : item.status === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-sm flex-1">{item.check}</span>
                    <Badge variant={item.status === 'passed' ? 'default' : item.status === 'warning' ? 'secondary' : 'outline'} className="text-[10px]">
                      {item.status === 'passed' ? 'Passed' : item.status === 'warning' ? 'Warning' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold">Third-Party Auditor: SGS Vietnam</p>
                <p>Audit cycle: 2024-Q4 | Status: In progress (65% complete)</p>
                <p>Expected completion: 2025-02-15</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
