'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine,
} from 'recharts';
import { SatelliteDish, TrendingDown, TrendingUp, AlertTriangle, Layers, ChevronLeft, ChevronRight, Cloud, Shield, Calendar } from 'lucide-react';
import SafeMapLibre from '@/components/map/SafeMapLibre';

const NDVI_DATA_2024 = [
  { month: 'Jan', value: 0.72, min: 0.65, max: 0.78 },
  { month: 'Feb', value: 0.68, min: 0.61, max: 0.74 },
  { month: 'Mar', value: 0.74, min: 0.67, max: 0.80 },
  { month: 'Apr', value: 0.78, min: 0.71, max: 0.84 },
  { month: 'May', value: 0.82, min: 0.75, max: 0.88 },
  { month: 'Jun', value: 0.76, min: 0.69, max: 0.82 },
  { month: 'Jul', value: 0.71, min: 0.64, max: 0.77 },
  { month: 'Aug', value: 0.69, min: 0.62, max: 0.75 },
  { month: 'Sep', value: 0.73, min: 0.66, max: 0.79 },
  { month: 'Oct', value: 0.79, min: 0.72, max: 0.85 },
  { month: 'Nov', value: 0.83, min: 0.76, max: 0.89 },
  { month: 'Dec', value: 0.85, min: 0.78, max: 0.91 },
];

const NDVI_DATA_2023 = [
  { month: 'Jan', value: 0.70 }, { month: 'Feb', value: 0.66 },
  { month: 'Mar', value: 0.71 }, { month: 'Apr', value: 0.75 },
  { month: 'May', value: 0.79 }, { month: 'Jun', value: 0.73 },
  { month: 'Jul', value: 0.68 }, { month: 'Aug', value: 0.66 },
  { month: 'Sep', value: 0.70 }, { month: 'Oct', value: 0.76 },
  { month: 'Nov', value: 0.80 }, { month: 'Dec', value: 0.82 },
];

const PLOT_NDVI = [
  { code: 'DN_BGM_001', name: 'Bu Gia Map Natural Forest', lat: 11.52, lng: 107.35, ndvi: 0.82, change: +0.04, area: 1250.5, before: 0.78, after: 0.82 },
  { code: 'DN_BGM_002', name: 'Bu Gia Map Plantation', lat: 11.55, lng: 107.38, ndvi: 0.75, change: -0.02, area: 340.2, before: 0.77, after: 0.75 },
  { code: 'DN_BGM_003', name: 'Bu Gia Map Protection Forest', lat: 11.48, lng: 107.30, ndvi: 0.79, change: +0.01, area: 890.0, before: 0.78, after: 0.79 },
  { code: 'DN_CAT_001', name: 'Cat Tien National Park', lat: 11.20, lng: 107.15, ndvi: 0.58, change: -0.08, area: 2100.3, before: 0.66, after: 0.58 },
  { code: 'DN_TB_001', name: 'Tam Hiep Mangrove Forest', lat: 10.95, lng: 107.00, ndvi: 0.71, change: +0.03, area: 560.8, before: 0.68, after: 0.71 },
  { code: 'BP_BP_001', name: 'Binh Phuoc Natural Forest', lat: 11.80, lng: 106.90, ndvi: 0.84, change: +0.02, area: 1800.0, before: 0.82, after: 0.84 },
  { code: 'BP_BP_002', name: 'Binh Phuoc Plantation', lat: 11.85, lng: 106.95, ndvi: 0.68, change: -0.01, area: 420.5, before: 0.69, after: 0.68 },
  { code: 'DL_YT_001', name: 'Ea Sup Natural Forest', lat: 12.70, lng: 108.10, ndvi: 0.45, change: -0.15, area: 3200.0, before: 0.60, after: 0.45 },
  { code: 'LD_DL_001', name: 'Lam Dong Protection Forest', lat: 11.95, lng: 108.40, ndvi: 0.81, change: +0.03, area: 950.0, before: 0.78, after: 0.81 },
  { code: 'CM_CM_001', name: 'Ca Mau Mangrove Forest', lat: 9.20, lng: 105.20, ndvi: 0.73, change: -0.05, area: 780.3, before: 0.78, after: 0.73 },
];

const NDVI_ALERTS = [
  { plot: 'DL_YT_001', message: 'Severe NDVI drop (-0.15) — suspected deforestation in Ea Sup district', severity: 'critical', date: '2024-12-15', cloudCover: 4.2, confidence: 0.95 },
  { plot: 'DN_CAT_001', message: 'Significant NDVI decline (-0.08) — forest degradation at Cat Tien NP', severity: 'high', date: '2024-12-12', cloudCover: 8.7, confidence: 0.89 },
  { plot: 'CM_CM_001', message: 'Moderate NDVI decrease (-0.05) — monitoring required for Ca Mau mangroves', severity: 'medium', date: '2024-12-10', cloudCover: 12.3, confidence: 0.82 },
  { plot: 'DN_BGM_002', message: 'Minor NDVI decline (-0.02) — likely seasonal variation in plantation', severity: 'low', date: '2024-12-08', cloudCover: 6.1, confidence: 0.91 },
];

const NDVI_COLOR_SCALE = [
  { range: '< 0.1', color: '#FF0000', label: 'Barren' },
  { range: '0.1-0.2', color: '#FF6600', label: 'Very Sparse' },
  { range: '0.2-0.3', color: '#FFCC00', label: 'Sparse' },
  { range: '0.3-0.4', color: '#FFFF00', label: 'Moderate' },
  { range: '0.4-0.5', color: '#CCFF33', label: 'Fair' },
  { range: '0.5-0.6', color: '#66FF33', label: 'Good' },
  { range: '0.6-0.7', color: '#00CC00', label: 'Healthy Forest' },
  { range: '0.7-0.8', color: '#009900', label: 'Very Healthy' },
  { range: '0.8-0.9', color: '#006600', label: 'Dense Forest' },
  { range: '> 0.9', color: '#003300', label: 'Very Dense' },
];

function ndviToColor(val: number): string {
  if (val < 0.1) return '#FF0000';
  if (val < 0.2) return '#FF6600';
  if (val < 0.3) return '#FFCC00';
  if (val < 0.4) return '#FFFF00';
  if (val < 0.5) return '#CCFF33';
  if (val < 0.6) return '#66FF33';
  if (val < 0.7) return '#00CC00';
  if (val < 0.8) return '#009900';
  if (val < 0.9) return '#006600';
  return '#003300';
}

export default function NdviPage() {
  const [selectedPlot, setSelectedPlot] = useState('all');
  const [sliderPos, setSliderPos] = useState(50);

  const handleMapReady = useCallback((map: any) => {
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: PLOT_NDVI.map(p => ({
        type: 'Feature',
        properties: { code: p.code, name: p.name, ndvi: p.ndvi, change: p.change, area: p.area },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    };
    map.addSource('ndvi-plots', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'ndvi-circles',
      type: 'circle',
      source: 'ndvi-plots',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 8, 12, 20],
        'circle-color': ['to-color', ['concat', '#', ['slice', ['to-string', ['get', 'ndvi']], 0, 0]]],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
    // Override circle-color with actual NDVI colors using step expressions
    map.setPaintProperty('ndvi-circles', 'circle-color', [
      'step', ['get', 'ndvi'],
      '#FF0000', 0.1, '#FF6600', 0.2, '#FFCC00', 0.3, '#FFFF00', 0.4,
      '#CCFF33', 0.5, '#66FF33', 0.6, '#00CC00', 0.7, '#009900', 0.8, '#006600', 0.9, '#003300',
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">NDVI Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vegetation index monitoring via Sentinel-2 satellite with change detection and alert thresholds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs gap-1.5">
            <SatelliteDish className="w-3 h-3" /> Sentinel-2 L2A
          </Badge>
          <Badge variant="outline" className="text-xs gap-1.5">
            <Calendar className="w-3 h-3" /> Acquired: 2024-12-28
          </Badge>
          <Badge variant="outline" className="text-xs gap-1.5">
            <Cloud className="w-3 h-3" /> Cloud: 6.2%
          </Badge>
          <Badge variant="outline" className="text-xs gap-1.5">
            <Shield className="w-3 h-3" /> Confidence: 92%
          </Badge>
          <Select value={selectedPlot} onValueChange={setSelectedPlot}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select plot" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forest Plots</SelectItem>
              {PLOT_NDVI.map(p => <SelectItem key={p.code} value={p.code}>{p.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="colormap">
        <TabsList>
          <TabsTrigger value="colormap">NDVI Color Map</TabsTrigger>
          <TabsTrigger value="comparison">Before/After Comparison</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          <TabsTrigger value="alerts">NDVI Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="colormap" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">NDVI Color Map — Sentinel-2 L2A</CardTitle>
              <CardDescription className="text-xs">10m resolution | 5-day revisit | Cloud threshold &lt;20%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border" style={{ height: 450 }}>
                <SafeMapLibre
                  onMapReady={handleMapReady}
                  className="w-full h-full"
                  center={[107.35, 11.05]}
                  zoom={7}
                />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2">NDVI Color Scale Legend</p>
                <div className="grid grid-cols-5 lg:grid-cols-10 gap-1">
                  {NDVI_COLOR_SCALE.map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 rounded-md" style={{ backgroundColor: item.color }} />
                      <p className="text-[9px] mt-1 text-muted-foreground">{item.range}</p>
                      <p className="text-[8px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">NDVI Distribution by Forest Plot</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {PLOT_NDVI.map(p => (
                  <button key={p.code} onClick={() => setSelectedPlot(p.code)} className={`p-2 rounded-lg text-center transition-colors hover:bg-muted/80 ${selectedPlot === p.code ? 'bg-muted ring-2 ring-emerald-400' : 'bg-muted/50'}`}>
                    <p className="text-[10px] font-mono text-muted-foreground">{p.code}</p>
                    <div className="w-12 h-12 rounded-full mx-auto my-1 flex items-center justify-center" style={{ backgroundColor: ndviToColor(p.ndvi) }}>
                      <span className="text-white text-xs font-bold">{p.ndvi.toFixed(2)}</span>
                    </div>
                    <div className={`flex items-center justify-center gap-0.5 text-[10px] ${p.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {p.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {p.change > 0 ? '+' : ''}{p.change.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4" /> Before/After NDVI Comparison
              </CardTitle>
              <CardDescription className="text-xs">Drag the slider to compare NDVI before and after the monitoring period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg overflow-hidden border relative" style={{ height: 350 }}>
                  <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-semibold">Before (2023-12)</div>
                  <SafeMapLibre
                    onMapReady={(map) => {
                      const geojson: GeoJSON.FeatureCollection = {
                        type: 'FeatureCollection',
                        features: PLOT_NDVI.map(p => ({
                          type: 'Feature',
                          properties: { code: p.code, name: p.name, ndvi: p.before, change: p.change, area: p.area },
                          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
                        })),
                      };
                      map.addSource('ndvi-before', { type: 'geojson', data: geojson });
                      map.addLayer({
                        id: 'ndvi-before-circles',
                        type: 'circle',
                        source: 'ndvi-before',
                        paint: {
                          'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 8, 12, 20],
                          'circle-opacity': 0.7,
                          'circle-stroke-width': 2,
                          'circle-stroke-color': '#ffffff',
                        },
                      });
                      map.setPaintProperty('ndvi-before-circles', 'circle-color', [
                        'step', ['get', 'ndvi'],
                        '#FF0000', 0.1, '#FF6600', 0.2, '#FFCC00', 0.3, '#FFFF00', 0.4,
                        '#CCFF33', 0.5, '#66FF33', 0.6, '#00CC00', 0.7, '#009900', 0.8, '#006600', 0.9, '#003300',
                      ]);
                    }}
                    className="w-full h-full"
                    center={[107.35, 11.05]}
                    zoom={7}
                  />
                </div>
                <div className="rounded-lg overflow-hidden border relative" style={{ height: 350 }}>
                  <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-semibold">After (2024-12)</div>
                  <SafeMapLibre
                    onMapReady={(map) => {
                      const geojson: GeoJSON.FeatureCollection = {
                        type: 'FeatureCollection',
                        features: PLOT_NDVI.map(p => ({
                          type: 'Feature',
                          properties: { code: p.code, name: p.name, ndvi: p.after, change: p.change, area: p.area },
                          geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
                        })),
                      };
                      map.addSource('ndvi-after', { type: 'geojson', data: geojson });
                      map.addLayer({
                        id: 'ndvi-after-circles',
                        type: 'circle',
                        source: 'ndvi-after',
                        paint: {
                          'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 8, 12, 20],
                          'circle-opacity': 0.7,
                          'circle-stroke-width': 2,
                          'circle-stroke-color': '#ffffff',
                        },
                      });
                      map.setPaintProperty('ndvi-after-circles', 'circle-color', [
                        'step', ['get', 'ndvi'],
                        '#FF0000', 0.1, '#FF6600', 0.2, '#FFCC00', 0.3, '#FFFF00', 0.4,
                        '#CCFF33', 0.5, '#66FF33', 0.6, '#00CC00', 0.7, '#009900', 0.8, '#006600', 0.9, '#003300',
                      ]);
                    }}
                    className="w-full h-full"
                    center={[107.35, 11.05]}
                    zoom={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Before (2023)</span>
                  <span>After (2024)</span>
                </div>
                <Slider value={[sliderPos]} onValueChange={([v]) => setSliderPos(v)} max={100} step={1} />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold">Plot</th>
                      <th className="text-right py-2 px-2 font-semibold">Before</th>
                      <th className="text-right py-2 px-2 font-semibold">After</th>
                      <th className="text-right py-2 px-2 font-semibold">Change</th>
                      <th className="text-right py-2 pl-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLOT_NDVI.map(p => (
                      <tr key={p.code} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-4 font-mono">{p.code}</td>
                        <td className="py-2 px-2 text-right">{p.before.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">{p.after.toFixed(2)}</td>
                        <td className={`py-2 px-2 text-right font-semibold ${p.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {p.change > 0 ? '+' : ''}{p.change.toFixed(2)}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <Badge variant={p.change < -0.05 ? 'destructive' : p.change < 0 ? 'secondary' : 'default'} className="text-[10px]">
                            {p.change < -0.1 ? 'Critical' : p.change < -0.05 ? 'Alert' : p.change < 0 ? 'Decline' : 'Stable'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeseries" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">12-Month NDVI Trend — 2024 vs 2023</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={NDVI_DATA_2024}>
                  <defs>
                    <linearGradient id="ndviAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52B788" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <YAxis domain={[0.4, 1.0]} tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <ReferenceLine y={0.5} stroke="#FFD600" strokeDasharray="5 5" label={{ value: 'Degradation threshold', position: 'right', fontSize: 10 }} />
                  <Area type="monotone" dataKey="max" stroke="none" fill="#95D5B2" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="min" stroke="none" fill="#FFFFFF" fillOpacity={0.8} />
                  <Line type="monotone" dataKey="value" stroke="#2D6A4F" strokeWidth={2.5} dot={{ r: 4, fill: '#2D6A4F' }} name="2024 NDVI" />
                  <Line type="monotone" dataKey="value" data={NDVI_DATA_2023} stroke="#95D5B2" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="2023 NDVI" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-emerald-800" /> 2024</div>
                <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 border-dashed" style={{ borderTop: '2px dashed #95D5B2' }} /> 2023</div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Source: Sentinel-2 L2A | Acquisition: Every 5 days | Resolution: 10m | Cloud threshold: &lt;20%</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" /> NDVI Change Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {NDVI_ALERTS.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-600' : alert.severity === 'high' ? 'bg-orange-600' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold">{alert.plot}</span>
                        <Badge variant="outline" className="text-[10px] h-4">
                          {alert.severity === 'critical' ? 'Critical' : alert.severity === 'high' ? 'High' : alert.severity === 'medium' ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                      <p className="text-xs">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{alert.date}</span>
                        <span>Cloud: {alert.cloudCover}%</span>
                        <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                        <span>Threshold: -0.05 (High), -0.10 (Critical)</span>
                      </div>
                    </div>
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
