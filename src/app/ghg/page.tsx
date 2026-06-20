'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CloudCog, AlertTriangle, CheckCircle2, ArrowDownUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AD_TABLE = [
  { stratum: 'Natural Forest — Lowland', area2022: 4320, area2023: 4280, area2024: 4250, changeRate: -0.7 },
  { stratum: 'Natural Forest — Montane', area2022: 1820, area2023: 1810, area2024: 1800, changeRate: -0.6 },
  { stratum: 'Planted Forest — Acacia', area2022: 2050, area2023: 2080, area2024: 2100, changeRate: 1.0 },
  { stratum: 'Planted Forest — Eucalyptus', area2022: 940, area2023: 945, area2024: 950, changeRate: 0.5 },
  { stratum: 'Protection Forest — Dipterocarp', area2022: 1610, area2023: 1605, area2024: 1600, changeRate: -0.3 },
  { stratum: 'Mangrove Forest', area2022: 760, area2023: 770, area2024: 780, changeRate: 1.3 },
];

const EF_LIBRARY = [
  { forestType: 'Natural Forest — Lowland', efCO2: '587 tCO₂e/ha', efCarbon: '160 tC/ha', source: 'IPCC 2006 + VN NFI', tier: 'Tier 2', uncertainty: '±8.5%' },
  { forestType: 'Natural Forest — Montane', efCO2: '513 tCO₂e/ha', efCarbon: '140 tC/ha', source: 'IPCC 2006 + VN NFI', tier: 'Tier 2', uncertainty: '±10.2%' },
  { forestType: 'Planted Forest — Acacia', efCO2: '248 tCO₂e/ha', efCarbon: '67.5 tC/ha', source: 'IPCC 2006 Default', tier: 'Tier 1', uncertainty: '±6.3%' },
  { forestType: 'Planted Forest — Eucalyptus', efCO2: '220 tCO₂e/ha', efCarbon: '60 tC/ha', source: 'IPCC 2006 Default', tier: 'Tier 1', uncertainty: '±7.1%' },
  { forestType: 'Protection Forest — Dipterocarp', efCO2: '459 tCO₂e/ha', efCarbon: '125 tC/ha', source: 'VNFOREST Technical Guide', tier: 'Tier 2', uncertainty: '±9.8%' },
  { forestType: 'Mangrove Forest', efCO2: '385 tCO₂e/ha', efCarbon: '105 tC/ha', source: 'Komiyama et al. 2005', tier: 'Tier 3', uncertainty: '±11.5%' },
];

const EMISSIONS_REMOVALS = [
  { category: 'Deforestation', emissions: 22.4, removals: 0 },
  { category: 'Degradation', emissions: 10.8, removals: 0 },
  { category: 'Forest Growth', emissions: 0, removals: 35.2 },
  { category: 'Afforestation', emissions: 0, removals: 8.3 },
  { category: 'Mangrove Restoration', emissions: 0, removals: 4.2 },
  { category: 'Harvested Wood Products', emissions: 4.9, removals: 0 },
];

const TIER_DESCRIPTIONS = {
  tier1: { label: 'Tier 1 — IPCC Default', description: 'Uses IPCC default emission factors and globally averaged activity data. Lowest accuracy, simplest approach.' },
  tier2: { label: 'Tier 2 — Country-Specific', description: 'Uses country-specific emission factors from national forest inventory and nationally derived activity data. Moderate accuracy.' },
  tier3: { label: 'Tier 3 — High Resolution', description: 'Uses high-resolution activity data, process models, and measurement-based approaches. Highest accuracy, most complex.' },
};

const UNCERTAINTY_DATA = [
  { source: 'Land-cover classification', tier1: '±15%', tier2: '±8%', tier3: '±3%' },
  { source: 'Emission factors', tier1: '±30%', tier2: '±12%', tier3: '±5%' },
  { source: 'Allometric models', tier1: '±25%', tier2: '±10%', tier3: '±4%' },
  { source: 'Area estimation', tier1: '±10%', tier2: '±5%', tier3: '±2%' },
  { source: 'Combined uncertainty', tier1: '±42%', tier2: '±12.5%', tier3: '±7%' },
];

export default function GhgPage() {
  const [selectedTier, setSelectedTier] = useState('tier2');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">GHG Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Greenhouse gas inventory engine aligned with IPCC AFOLU guidelines
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <CloudCog className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-700">38.1 MtCO₂</p>
            <p className="text-xs text-muted-foreground">Total Emissions (2024)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ArrowDownUp className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">47.7 MtCO₂</p>
            <p className="text-xs text-muted-foreground">Total Removals (2024)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-emerald-500">-9.6 MtCO₂</p>
            <p className="text-xs text-muted-foreground">Net (Removals - Emissions)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">±12.5%</p>
            <p className="text-xs text-muted-foreground">Combined Uncertainty (95% CI)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ad-ef">
        <TabsList>
          <TabsTrigger value="ad-ef">Activity Data × Emission Factors</TabsTrigger>
          <TabsTrigger value="ad-table">AD by Strata & Year</TabsTrigger>
          <TabsTrigger value="ef-library">EF Library</TabsTrigger>
          <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
          <TabsTrigger value="breakdown">Emissions vs Removals</TabsTrigger>
        </TabsList>

        <TabsContent value="ad-ef" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Tier Selection</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="flex gap-4">
                {Object.entries(TIER_DESCRIPTIONS).map(([key, tier]) => (
                  <div key={key} className="flex items-start gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer flex-1">
                    <RadioGroupItem value={key} id={key} className="mt-0.5" />
                    <div>
                      <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{tier.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Activity Data × Emission Factors Summary</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Stratum</th>
                    <th className="text-right py-2 px-2 font-semibold">Area (ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">EF (tC/ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">Stock (tC)</th>
                    <th className="text-right py-2 px-2 font-semibold">CO₂e (t)</th>
                    <th className="text-right py-2 pl-2 font-semibold">Change Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {AD_TABLE.map((row, i) => {
                    const ef = EF_LIBRARY[i];
                    const efVal = parseFloat(ef.efCarbon);
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-2">{row.stratum}</td>
                        <td className="py-2 px-2 text-right">{row.area2024.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right">{ef.efCarbon}</td>
                        <td className="py-2 px-2 text-right">{(row.area2024 * efVal).toLocaleString()}</td>
                        <td className="py-2 px-2 text-right">{(row.area2024 * efVal * 3.67).toLocaleString()}</td>
                        <td className={`py-2 pl-2 text-right ${row.changeRate < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {row.changeRate > 0 ? '+' : ''}{row.changeRate.toFixed(1)}%/yr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad-table" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Activity Data by Strata & Year (ha)</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Stratum</th>
                    <th className="text-right py-2 px-2 font-semibold">2022</th>
                    <th className="text-right py-2 px-2 font-semibold">2023</th>
                    <th className="text-right py-2 px-2 font-semibold">2024</th>
                    <th className="text-right py-2 pl-2 font-semibold">Change Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {AD_TABLE.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2">{row.stratum}</td>
                      <td className="py-2 px-2 text-right">{row.area2022.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">{row.area2023.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">{row.area2024.toLocaleString()}</td>
                      <td className={`py-2 pl-2 text-right ${row.changeRate < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {row.changeRate > 0 ? '+' : ''}{row.changeRate.toFixed(1)}%/yr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ef-library" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Emission Factor Library by Forest Type</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Forest Type</th>
                    <th className="text-right py-2 px-2 font-semibold">EF CO₂</th>
                    <th className="text-right py-2 px-2 font-semibold">EF Carbon</th>
                    <th className="text-left py-2 px-2 font-semibold">Source</th>
                    <th className="text-right py-2 px-2 font-semibold">Tier</th>
                    <th className="text-right py-2 pl-2 font-semibold">Uncertainty</th>
                  </tr>
                </thead>
                <tbody>
                  {EF_LIBRARY.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2">{row.forestType}</td>
                      <td className="py-2 px-2 text-right">{row.efCO2}</td>
                      <td className="py-2 px-2 text-right">{row.efCarbon}</td>
                      <td className="py-2 px-2 text-muted-foreground">{row.source}</td>
                      <td className="py-2 px-2 text-right"><Badge variant="outline" className="text-[10px]">{row.tier}</Badge></td>
                      <td className="py-2 pl-2 text-right">{row.uncertainty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uncertainty" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Uncertainty Estimation by Tier</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Source</th>
                    <th className="text-right py-2 px-2 font-semibold">Tier 1</th>
                    <th className="text-right py-2 px-2 font-semibold">Tier 2</th>
                    <th className="text-right py-2 pl-2 font-semibold">Tier 3</th>
                  </tr>
                </thead>
                <tbody>
                  {UNCERTAINTY_DATA.map((row, i) => (
                    <tr key={i} className={`border-b last:border-0 hover:bg-muted/50 ${row.source === 'Combined uncertainty' ? 'font-semibold' : ''}`}>
                      <td className="py-2 pr-2">{row.source}</td>
                      <td className="py-2 px-2 text-right">{row.tier1}</td>
                      <td className="py-2 px-2 text-right">{row.tier2}</td>
                      <td className="py-2 pl-2 text-right">{row.tier3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Removals vs Emissions Breakdown (MtCO₂)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={EMISSIONS_REMOVALS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#D32F2F" name="Emissions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="removals" fill="#2D6A4F" name="Removals" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <p className="font-semibold text-emerald-700">AFOLU Compliance: Aligned with IPCC 2006 Guidelines (Vol. 4 — AFOLU)</p>
                <p className="text-emerald-600 mt-1">Net result: -9.6 MtCO₂ (net sink) — consistent with national communications reporting</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
