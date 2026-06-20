'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, TreePine, CloudCog, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const SUMMARY = [
  { label: 'Total Biomass', value: '2,847,500 t', icon: TreePine, color: 'text-emerald-700' },
  { label: 'Carbon Stock', value: '1,423,750 tC', icon: Scale, color: 'text-emerald-600' },
  { label: 'CO₂ Equivalent', value: '5,225,163 tCO₂e', icon: CloudCog, color: 'text-emerald-500' },
  { label: 'Average tC/ha', value: '165.2 tC/ha', icon: TrendingUp, color: 'text-emerald-400' },
];

const STRATA_TABLE = [
  { stratum: 'Natural Forest — Lowland', area: 4250, biomassPerHa: 320, totalBiomass: 1360000, carbonPerHa: 160, totalCarbon: 680000, uncertainty: '±8.5%' },
  { stratum: 'Natural Forest — Montane', area: 1800, biomassPerHa: 280, totalBiomass: 504000, carbonPerHa: 140, totalCarbon: 252000, uncertainty: '±10.2%' },
  { stratum: 'Planted Forest — Acacia', area: 2100, biomassPerHa: 145, totalBiomass: 304500, carbonPerHa: 72.5, totalCarbon: 152250, uncertainty: '±6.3%' },
  { stratum: 'Planted Forest — Eucalyptus', area: 950, biomassPerHa: 120, totalBiomass: 114000, carbonPerHa: 60, totalCarbon: 57000, uncertainty: '±7.1%' },
  { stratum: 'Protection Forest — Dipterocarp', area: 1600, biomassPerHa: 250, totalBiomass: 400000, carbonPerHa: 125, totalCarbon: 200000, uncertainty: '±9.8%' },
  { stratum: 'Mangrove Forest — Rhizophora', area: 780, biomassPerHa: 210, totalBiomass: 163800, carbonPerHa: 105, totalCarbon: 81900, uncertainty: '±11.5%' },
];

const EMISSION_FACTORS = [
  { forestType: 'Natural Forest', efBiomass: '320 t/ha', efCarbon: '160 tC/ha', efCO2: '587 tCO₂e/ha', rootShoot: 0.24, woodDensity: '0.57 g/cm³', tier: 'Tier 2' },
  { forestType: 'Planted Forest', efBiomass: '135 t/ha', efCarbon: '67.5 tC/ha', efCO2: '248 tCO₂e/ha', rootShoot: 0.27, woodDensity: '0.48 g/cm³', tier: 'Tier 2' },
  { forestType: 'Protection Forest', efBiomass: '250 t/ha', efCarbon: '125 tC/ha', efCO2: '459 tCO₂e/ha', rootShoot: 0.22, woodDensity: '0.55 g/cm³', tier: 'Tier 2' },
  { forestType: 'Mangrove Forest', efBiomass: '210 t/ha', efCarbon: '105 tC/ha', efCO2: '385 tCO₂e/ha', rootShoot: 0.39, woodDensity: '0.72 g/cm³', tier: 'Tier 3' },
];

export default function BiomassPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biomass & Carbon Stock</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Forest biomass estimation, carbon stock calculation, and emission factor management
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">Calculation Methods</TabsTrigger>
          <TabsTrigger value="strata">Strata Breakdown</TabsTrigger>
          <TabsTrigger value="emission-factors">Emission Factors</TabsTrigger>
          <TabsTrigger value="uncertainty">Uncertainty Estimation</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" /> Stock-Difference Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">The stock-difference method calculates carbon stock changes as the difference between stocks at two points in time. Used when forest land remains in the same category but undergoes carbon stock changes.</p>
                <div className="bg-muted/50 p-3 rounded-lg text-xs font-mono mb-3">
                  ΔC = (C₂ - C₁) / (t₂ - t₁)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">ΔC</Badge>
                    <span className="text-muted-foreground">Annual carbon stock change (tC/yr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">C₁, C₂</Badge>
                    <span className="text-muted-foreground">Carbon stocks at time t₁ and t₂</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">t₂ - t₁</Badge>
                    <span className="text-muted-foreground">Time period between measurements (years)</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                  <p className="font-semibold text-emerald-700">Result: +8,200 tC/yr (net gain)</p>
                  <p className="text-emerald-600">Period: 2023-2024 | Confidence: 91%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" /> Gain-Loss Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">The gain-loss method calculates carbon stock changes as the difference between gains (biomass growth) and losses (harvest, disturbance). Used when activity data on gains and losses is available.</p>
                <div className="bg-muted/50 p-3 rounded-lg text-xs font-mono mb-3">
                  ΔC = ΔC_gain - ΔC_loss
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">ΔC_gain</Badge>
                    <span className="text-muted-foreground">Annual carbon gain from biomass growth (tC/yr)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">ΔC_loss</Badge>
                    <span className="text-muted-foreground">Annual carbon loss from harvest/disturbance (tC/yr)</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <p className="font-semibold text-orange-700">Gain: +42,800 tC/yr | Loss: -34,600 tC/yr</p>
                  <p className="text-orange-600">Net: +8,200 tC/yr | Period: 2023-2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strata" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Strata Breakdown</CardTitle></CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Stratum</th>
                    <th className="text-right py-2 px-2 font-semibold">Area (ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">Biomass (t/ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">Total Biomass (t)</th>
                    <th className="text-right py-2 px-2 font-semibold">Carbon (tC/ha)</th>
                    <th className="text-right py-2 px-2 font-semibold">Total Carbon (tC)</th>
                    <th className="text-right py-2 pl-2 font-semibold">Uncertainty</th>
                  </tr>
                </thead>
                <tbody>
                  {STRATA_TABLE.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2">{row.stratum}</td>
                      <td className="py-2 px-2 text-right">{row.area.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">{row.biomassPerHa}</td>
                      <td className="py-2 px-2 text-right">{row.totalBiomass.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">{row.carbonPerHa}</td>
                      <td className="py-2 px-2 text-right">{row.totalCarbon.toLocaleString()}</td>
                      <td className="py-2 pl-2 text-right">{row.uncertainty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold border-t-2">
                    <td className="py-2 pr-2">Total</td>
                    <td className="py-2 px-2 text-right">11,480</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 px-2 text-right">2,846,300</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 px-2 text-right">1,423,150</td>
                    <td className="py-2 pl-2 text-right">±8.9%</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emission-factors" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Emission Factors by Forest Type</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Forest Type</th>
                    <th className="text-right py-2 px-2 font-semibold">EF Biomass</th>
                    <th className="text-right py-2 px-2 font-semibold">EF Carbon</th>
                    <th className="text-right py-2 px-2 font-semibold">EF CO₂</th>
                    <th className="text-right py-2 px-2 font-semibold">Root:Shoot</th>
                    <th className="text-right py-2 px-2 font-semibold">Wood Density</th>
                    <th className="text-right py-2 pl-2 font-semibold">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {EMISSION_FACTORS.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2">{row.forestType}</td>
                      <td className="py-2 px-2 text-right">{row.efBiomass}</td>
                      <td className="py-2 px-2 text-right">{row.efCarbon}</td>
                      <td className="py-2 px-2 text-right">{row.efCO2}</td>
                      <td className="py-2 px-2 text-right">{row.rootShoot}</td>
                      <td className="py-2 px-2 text-right">{row.woodDensity}</td>
                      <td className="py-2 pl-2 text-right"><Badge variant="outline" className="text-[10px]">{row.tier}</Badge></td>
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
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Uncertainty Estimation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Combined uncertainty is calculated using error propagation (IPCC Approach 1). The total uncertainty combines uncertainties from activity data, emission factors, and allometric models.</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold text-emerald-700">±5.2%</p>
                    <p className="text-xs text-muted-foreground">Activity Data Uncertainty</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold text-orange-700">±8.9%</p>
                    <p className="text-xs text-muted-foreground">Emission Factor Uncertainty</p>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold text-yellow-700">±12.5%</p>
                    <p className="text-xs text-muted-foreground">Combined Uncertainty (95% CI)</p>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-xs font-mono">
                U_total = sqrt(U_AD² + U_EF²) = sqrt(5.2² + 8.9²) = sqrt(27.04 + 79.21) = ±10.3% → Adjusted for 95% CI: ±12.5%
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p>• Activity data uncertainty derived from land-cover classification accuracy (92% overall accuracy)</p>
                <p>• Emission factor uncertainty from plot-level measurement variance and allometric model error</p>
                <p>• Mangrove stratum has highest uncertainty (±11.5%) due to limited plot data and tidal influence</p>
                <p>• Planted forest has lowest uncertainty (±6.3%) due to known stand age and uniform structure</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
