'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TreePine,
  ArrowLeft,
  MapPin,
  Flame,
  AlertTriangle,
  Leaf,
  Footprints,
  QrCode,
  CloudCog,
  TrendingUp,
  Shield,
  Clock,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FOREST_TYPES,
  PLOT_STATUS,
  TREE_SPECIES,
  ALERT_TYPES,
  ALERT_SEVERITY,
  ALERT_STATUSES,
  CONSERVATION_STATUS_MAP,
  FIRE_RISK_LEVELS,
} from '@/lib/constants';

// ─── Types ──────────────────────────────────────────────────────
interface CarbonTrendPoint {
  year: number;
  stock: number;
}

interface NdviTrendPoint {
  month: string;
  ndvi: number;
}

interface PlotAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
  message: string;
}

interface PlotPatrol {
  id: string;
  session: string;
  date: string;
  observations: number;
  status: string;
}

interface PlotPassport {
  id: string;
  species: string;
  volume: number;
  status: string;
}

interface PlotMetadata {
  crs: string;
  citation: string;
  lineage: string;
  sourceImagery: string;
  updateFrequency: string;
  completeness: number;
  dataQuality: string;
}

interface ForestPlotDetail {
  id: string;
  plotCode: string;
  name: string;
  province: string;
  region: string;
  forestType: string;
  status: string;
  areaHa: number;
  centroidLat: number;
  centroidLng: number;
  fireRisk: string;
  treeCount: number;
  dominantSpecies: string;
  createdAt: string;
  carbonStock: number;
  ndviAvg: number;
  activeAlerts: number;
  biodiversityRecords: number;
  totalPatrols: number;
  timberPassports: number;
  carbonTrend: CarbonTrendPoint[];
  ndviTrend: NdviTrendPoint[];
  alerts: PlotAlert[];
  species: string[];
  patrols: PlotPatrol[];
  passports: PlotPassport[];
  metadata: PlotMetadata;
}

// ─── Mock Data ──────────────────────────────────────────────────
const PLOTS_DETAIL: ForestPlotDetail[] = [
  {
    id: 'DN_BGM_001',
    plotCode: 'DN_BGM_001',
    name: 'Bu Gia Map Natural Forest',
    province: 'Dong Nai',
    region: 'Southeast',
    forestType: 'natural',
    status: 'active',
    areaHa: 1250.5,
    centroidLat: 11.55,
    centroidLng: 107.38,
    fireRisk: 'medium',
    treeCount: 28500,
    dominantSpecies: 'Dipterocarpus alatus',
    createdAt: '2024-01-15',
    carbonStock: 31262,
    ndviAvg: 0.78,
    activeAlerts: 3,
    biodiversityRecords: 24,
    totalPatrols: 8,
    timberPassports: 1,
    carbonTrend: [
      { year: 2020, stock: 28500 },
      { year: 2021, stock: 29200 },
      { year: 2022, stock: 30100 },
      { year: 2023, stock: 30800 },
      { year: 2024, stock: 31262 },
    ],
    ndviTrend: [
      { month: 'Jan', ndvi: 0.72 },
      { month: 'Feb', ndvi: 0.74 },
      { month: 'Mar', ndvi: 0.71 },
      { month: 'Apr', ndvi: 0.75 },
      { month: 'May', ndvi: 0.78 },
      { month: 'Jun', ndvi: 0.82 },
      { month: 'Jul', ndvi: 0.84 },
      { month: 'Aug', ndvi: 0.80 },
      { month: 'Sep', ndvi: 0.79 },
      { month: 'Oct', ndvi: 0.76 },
      { month: 'Nov', ndvi: 0.74 },
      { month: 'Dec', ndvi: 0.78 },
    ],
    alerts: [
      { id: '1', type: 'fire_risk', severity: 'critical', status: 'acknowledged', message: 'Critical fire risk — FWI exceeds threshold' },
      { id: '6', type: 'deforestation', severity: 'high', status: 'in_field', message: 'Illegal encroachment at buffer zone' },
      { id: '7', type: 'forest_change', severity: 'medium', status: 'resolved', message: 'Protection forest degradation after rainfall' },
    ],
    species: ['Dipterocarpus alatus', 'Shorea siamensis', 'Hopea odorata', 'Fokienia hodginsii'],
    patrols: [
      { id: '1', session: 'PAT-2025-001', date: '2025-03-01', observations: 5, status: 'reviewed' },
      { id: '2', session: 'PAT-2025-002', date: '2025-03-04', observations: 2, status: 'in_progress' },
    ],
    passports: [
      { id: 'WP-2025-001', species: 'Dipterocarpus alatus', volume: 15.5, status: 'delivered' },
    ],
    metadata: {
      crs: 'EPSG:3408 (VN-2000 / UTM zone 48N)',
      citation: 'Terra Forest MRV System — Bu Gia Map Forest Plot, Dong Nai Province',
      lineage: 'Derived from Sentinel-2 L2A imagery (10m), FRMS 4.0 field records, and NFI ground truth data',
      sourceImagery: 'Sentinel-2 L2A, Landsat 8/9 OLI',
      updateFrequency: 'Monthly (satellite), Real-time (field)',
      completeness: 92,
      dataQuality: 'RMSE: 0.8 ha positional accuracy, 15% carbon stock uncertainty (95% CI)',
    },
  },
  {
    id: 'DL_YT_001',
    plotCode: 'DL_YT_001',
    name: 'Ea Sup Natural Forest',
    province: 'Dak Lak',
    region: 'Central Highlands',
    forestType: 'natural',
    status: 'degraded',
    areaHa: 890.2,
    centroidLat: 12.72,
    centroidLng: 108.12,
    fireRisk: 'critical',
    treeCount: 15600,
    dominantSpecies: 'Dipterocarpus tuberculatus',
    createdAt: '2024-01-20',
    carbonStock: 22255,
    ndviAvg: 0.65,
    activeAlerts: 2,
    biodiversityRecords: 18,
    totalPatrols: 5,
    timberPassports: 0,
    carbonTrend: [
      { year: 2020, stock: 24000 },
      { year: 2021, stock: 23500 },
      { year: 2022, stock: 23100 },
      { year: 2023, stock: 22600 },
      { year: 2024, stock: 22255 },
    ],
    ndviTrend: [
      { month: 'Jan', ndvi: 0.68 },
      { month: 'Feb', ndvi: 0.66 },
      { month: 'Mar', ndvi: 0.63 },
      { month: 'Apr', ndvi: 0.60 },
      { month: 'May', ndvi: 0.64 },
      { month: 'Jun', ndvi: 0.68 },
      { month: 'Jul', ndvi: 0.72 },
      { month: 'Aug', ndvi: 0.70 },
      { month: 'Sep', ndvi: 0.67 },
      { month: 'Oct', ndvi: 0.65 },
      { month: 'Nov', ndvi: 0.64 },
      { month: 'Dec', ndvi: 0.65 },
    ],
    alerts: [
      { id: '2', type: 'deforestation', severity: 'critical', status: 'in_field', message: 'Large-scale deforestation detected' },
      { id: '14', type: 'fire_risk', severity: 'critical', status: 'in_field', message: 'Active wildfire spreading' },
    ],
    species: ['Dipterocarpus tuberculatus', 'Shorea siamensis'],
    patrols: [
      { id: '5', session: 'PAT-2025-005', date: '2025-02-25', observations: 8, status: 'completed' },
    ],
    passports: [],
    metadata: {
      crs: 'EPSG:3408 (VN-2000 / UTM zone 48N)',
      citation: 'Terra Forest MRV System — Ea Sup Forest Plot, Dak Lak Province',
      lineage: 'Derived from Sentinel-2 and SAR analysis, with FRMS 4.0 field verification',
      sourceImagery: 'Sentinel-2 L2A, Sentinel-1 SAR',
      updateFrequency: 'Monthly (satellite), Real-time (field)',
      completeness: 78,
      dataQuality: 'RMSE: 1.2 ha positional accuracy, 18% carbon stock uncertainty (95% CI)',
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────────
function getForestTypeLabel(value: string): string {
  return FOREST_TYPES.find((ft) => ft.value === value)?.label ?? value;
}

function getForestTypeColor(value: string): string {
  return FOREST_TYPES.find((ft) => ft.value === value)?.color ?? '#795548';
}

function getPlotStatusLabel(value: string): string {
  return PLOT_STATUS.find((ps) => ps.value === value)?.label ?? value;
}

function getPlotStatusColor(value: string): string {
  return PLOT_STATUS.find((ps) => ps.value === value)?.color ?? '#795548';
}

function getAlertTypeLabel(value: string): string {
  return ALERT_TYPES.find((at) => at.value === value)?.label ?? value;
}

function getAlertTypeColor(value: string): string {
  return ALERT_TYPES.find((at) => at.value === value)?.color ?? '#795548';
}

function getAlertSeverityLabel(value: string): string {
  return ALERT_SEVERITY.find((as) => as.value === value)?.label ?? value;
}

function getAlertSeverityColor(value: string): string {
  return ALERT_SEVERITY.find((as) => as.value === value)?.color ?? '#795548';
}

function getAlertSeverityBg(value: string): string {
  return ALERT_SEVERITY.find((as) => as.value === value)?.bg ?? '#F5F5F5';
}

function getAlertStatusLabel(value: string): string {
  return ALERT_STATUSES.find((as) => as.value === value)?.label ?? value;
}

function getAlertStatusColor(value: string): string {
  return ALERT_STATUSES.find((as) => as.value === value)?.color ?? '#795548';
}

function getFireRiskLabel(value: string): string {
  return FIRE_RISK_LEVELS.find((fr) => fr.value === value)?.label ?? value;
}

function getFireRiskColor(value: string): string {
  return FIRE_RISK_LEVELS.find((fr) => fr.value === value)?.color ?? '#795548';
}

function getSpeciesInfo(name: string) {
  return TREE_SPECIES.find((ts) => ts.name === name);
}

function getConservationBadge(status?: string) {
  if (!status) return null;
  const info = CONSERVATION_STATUS_MAP[status];
  if (!info) return null;
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1 py-0 h-4 font-mono"
      style={{ color: info.color, borderColor: info.color }}
    >
      {status} — {info.label}
    </Badge>
  );
}

function getPassportStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending Verification',
    verified: 'Verified',
    rejected: 'Rejected',
    in_transit: 'In Transit',
    delivered: 'Delivered',
  };
  return labels[value] ?? value;
}

function getPassportStatusColor(value: string): string {
  const colors: Record<string, string> = {
    pending: '#795548',
    verified: '#2D6A4F',
    rejected: '#D32F2F',
    in_transit: '#0277BD',
    delivered: '#52B788',
  };
  return colors[value] ?? '#795548';
}

function getPatrolStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In Progress',
    reviewed: 'Reviewed',
    scheduled: 'Scheduled',
  };
  return labels[value] ?? value;
}

function getPatrolStatusColor(value: string): string {
  const colors: Record<string, string> = {
    completed: '#2D6A4F',
    in_progress: '#E65100',
    reviewed: '#0277BD',
    scheduled: '#795548',
  };
  return colors[value] ?? '#795548';
}

// ─── Chart Tooltip Styles ───────────────────────────────────────
const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
};

// ─── Page Component ─────────────────────────────────────────────
export default function ForestPlotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const plot = PLOTS_DETAIL.find((p) => p.id === id || p.plotCode === id);

  if (!plot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <TreePine className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold text-muted-foreground">Plot Not Found</h2>
        <p className="text-sm text-muted-foreground">
          No forest plot matches the identifier &quot;{id}&quot;.
        </p>
        <Button variant="outline" onClick={() => router.push('/map')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ─── Top Navigation ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/map')}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </Button>
      </div>

      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{plot.name}</h1>
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: getForestTypeColor(plot.forestType),
                color: '#fff',
              }}
            >
              <TreePine className="w-3 h-3 mr-1" />
              {getForestTypeLabel(plot.forestType)}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-medium"
              style={{
                color: getPlotStatusColor(plot.status),
                borderColor: getPlotStatusColor(plot.status),
              }}
            >
              <Shield className="w-3 h-3 mr-1" />
              {getPlotStatusLabel(plot.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono font-medium text-foreground">{plot.plotCode}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {plot.province}, {plot.region}
            </span>
            <span className="flex items-center gap-1">
              <TreePine className="w-3.5 h-3.5" />
              {plot.areaHa.toLocaleString()} ha
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" style={{ color: getFireRiskColor(plot.fireRisk) }} />
              <span style={{ color: getFireRiskColor(plot.fireRisk) }}>
                {getFireRiskLabel(plot.fireRisk)} Fire Risk
              </span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Coordinates: {plot.centroidLat}°N, {plot.centroidLng}°E · Created {plot.createdAt} ·{' '}
            {plot.treeCount.toLocaleString()} trees · Dominant: <em>{plot.dominantSpecies}</em>
          </p>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard
          icon={<MapPin className="w-4 h-4" />}
          label="Area"
          value={`${plot.areaHa.toLocaleString()}`}
          unit="ha"
          accent="#2D6A4F"
        />
        <SummaryCard
          icon={<CloudCog className="w-4 h-4" />}
          label="Carbon Stock"
          value={`${plot.carbonStock.toLocaleString()}`}
          unit="tC"
          accent="#40916C"
        />
        <SummaryCard
          icon={<Flame className="w-4 h-4" />}
          label="Fire Risk"
          value={getFireRiskLabel(plot.fireRisk)}
          unit=""
          accent={getFireRiskColor(plot.fireRisk)}
        />
        <SummaryCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="NDVI Avg"
          value={plot.ndviAvg.toFixed(2)}
          unit=""
          accent="#52B788"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Active Alerts"
          value={`${plot.activeAlerts}`}
          unit=""
          accent="#E65100"
        />
        <SummaryCard
          icon={<Leaf className="w-4 h-4" />}
          label="Biodiversity"
          value={`${plot.biodiversityRecords}`}
          unit="records"
          accent="#0277BD"
        />
      </div>

      {/* ─── Tabbed Detail Sections ─────────────────────────── */}
      <Tabs defaultValue="carbon" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="carbon" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <CloudCog className="w-3.5 h-3.5" />
            Carbon History
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <AlertTriangle className="w-3.5 h-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="biodiversity" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <Leaf className="w-3.5 h-3.5" />
            Biodiversity
          </TabsTrigger>
          <TabsTrigger value="ndvi" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <TrendingUp className="w-3.5 h-3.5" />
            NDVI Trend
          </TabsTrigger>
          <TabsTrigger value="patrols" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <Footprints className="w-3.5 h-3.5" />
            Patrols
          </TabsTrigger>
          <TabsTrigger value="passports" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <QrCode className="w-3.5 h-3.5" />
            Timber Passports
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <Shield className="w-3.5 h-3.5" />
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* ── Carbon History ────────────────────────────────── */}
        <TabsContent value="carbon" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CloudCog className="w-5 h-5 text-[#40916C]" />
                Carbon Stock History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plot.carbonTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value: number) => [`${value.toLocaleString()} tC`, 'Carbon Stock']}
                      labelFormatter={(label: number) => `Year ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="stock"
                      stroke="#40916C"
                      strokeWidth={2.5}
                      dot={{ fill: '#40916C', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#40916C', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  {plot.carbonTrend[0].stock.toLocaleString()} tC in {plot.carbonTrend[0].year}
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#40916C]" />
                  {plot.carbonTrend[plot.carbonTrend.length - 1].stock.toLocaleString()} tC in{' '}
                  {plot.carbonTrend[plot.carbonTrend.length - 1].year}
                </span>
                <span className="flex items-center gap-1.5">
                  {plot.carbonTrend[plot.carbonTrend.length - 1].stock >= plot.carbonTrend[0].stock ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-[#D32F2F]" />
                  )}
                  {plot.carbonTrend[plot.carbonTrend.length - 1].stock >= plot.carbonTrend[0].stock ? '+' : ''}
                  {(
                    ((plot.carbonTrend[plot.carbonTrend.length - 1].stock - plot.carbonTrend[0].stock) /
                      plot.carbonTrend[0].stock) *
                    100
                  ).toFixed(1)}
                  % change
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Active Alerts ─────────────────────────────────── */}
        <TabsContent value="alerts" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#E65100]" />
                Active Alerts
                <Badge variant="secondary" className="ml-1 text-xs">
                  {plot.alerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plot.alerts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Shield className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No active alerts for this plot.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plot.alerts.map((alert) => (
                    <a
                      key={alert.id}
                      href={`/alerts/${alert.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      style={{ borderLeftColor: getAlertSeverityColor(alert.severity), borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className="text-[10px] font-medium"
                              style={{
                                backgroundColor: getAlertTypeColor(alert.type),
                                color: '#fff',
                              }}
                            >
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                            <Badge
                              className="text-[10px] font-medium"
                              style={{
                                backgroundColor: getAlertSeverityColor(alert.severity),
                                color: '#fff',
                              }}
                            >
                              {getAlertSeverityLabel(alert.severity)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium"
                              style={{
                                color: getAlertStatusColor(alert.status),
                                borderColor: getAlertStatusColor(alert.status),
                              }}
                            >
                              {getAlertStatusLabel(alert.status)}
                            </Badge>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">#{alert.id}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Biodiversity ──────────────────────────────────── */}
        <TabsContent value="biodiversity" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#0277BD]" />
                Biodiversity — Species List
                <Badge variant="secondary" className="ml-1 text-xs">
                  {plot.species.length} species
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plot.species.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Leaf className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No species recorded for this plot.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Scientific Name</TableHead>
                      <TableHead>Common Name (EN)</TableHead>
                      <TableHead>Common Name (VI)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Conservation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plot.species.map((sp, idx) => {
                      const info = getSpeciesInfo(sp);
                      // Derive a conservation status from ANIMAL_SPECIES or other sources
                      // For tree species, we use a simplified mapping
                      const conservationStatus = info
                        ? info.type === 'protection'
                          ? 'VU'
                          : info.type === 'mangrove'
                            ? 'NT'
                            : undefined
                        : undefined;
                      return (
                        <TableRow key={sp}>
                          <TableCell className="font-mono text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium italic">{sp}</TableCell>
                          <TableCell className="text-sm">{info?.nameEn ?? '—'}</TableCell>
                          <TableCell className="text-sm">{info?.nameVi ?? '—'}</TableCell>
                          <TableCell>
                            {info && (
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                                style={{
                                  color: getForestTypeColor(info.type),
                                  borderColor: getForestTypeColor(info.type),
                                }}
                              >
                                {getForestTypeLabel(info.type)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {getConservationBadge(conservationStatus) ?? (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NDVI Trend ────────────────────────────────────── */}
        <TabsContent value="ndvi" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#52B788]" />
                Monthly NDVI Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plot.ndviTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      domain={[0.4, 1.0]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(v: number) => v.toFixed(1)}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value: number) => [value.toFixed(2), 'NDVI']}
                    />
                    <Line
                      type="monotone"
                      dataKey="ndvi"
                      stroke="#52B788"
                      strokeWidth={2.5}
                      dot={{ fill: '#52B788', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#52B788', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <span>Average NDVI: <strong className="text-foreground">{plot.ndviAvg.toFixed(2)}</strong></span>
                <span>
                  Peak:{' '}
                  <strong className="text-foreground">
                    {Math.max(...plot.ndviTrend.map((d) => d.ndvi)).toFixed(2)} (
                    {plot.ndviTrend.reduce((max, d) => (d.ndvi > max.ndvi ? d : max), plot.ndviTrend[0]).month})
                  </strong>
                </span>
                <span>
                  Low:{' '}
                  <strong className="text-foreground">
                    {Math.min(...plot.ndviTrend.map((d) => d.ndvi)).toFixed(2)} (
                    {plot.ndviTrend.reduce((min, d) => (d.ndvi < min.ndvi ? d : min), plot.ndviTrend[0]).month})
                  </strong>
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Patrol History ────────────────────────────────── */}
        <TabsContent value="patrols" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Footprints className="w-5 h-5 text-[#0277BD]" />
                Patrol History
                <Badge variant="secondary" className="ml-1 text-xs">
                  {plot.patrols.length} patrols
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plot.patrols.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <Footprints className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No patrol records for this plot.</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Observations</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plot.patrols.map((patrol) => (
                        <TableRow key={patrol.id}>
                          <TableCell>
                            <a
                              href={`/patrols/${patrol.id}`}
                              className="font-mono text-sm font-medium text-primary hover:underline"
                            >
                              {patrol.session}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {patrol.date}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              {patrol.observations}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium"
                              style={{
                                color: getPatrolStatusColor(patrol.status),
                                borderColor: getPatrolStatusColor(patrol.status),
                              }}
                            >
                              {getPatrolStatusLabel(patrol.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Timber Passports ──────────────────────────────── */}
        <TabsContent value="passports" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#795548]" />
                Timber Passports
                <Badge variant="secondary" className="ml-1 text-xs">
                  {plot.passports.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plot.passports.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground">
                  <QrCode className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No timber passports issued for this plot.</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Passport ID</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead className="text-right">Volume (m³)</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plot.passports.map((passport) => (
                        <TableRow key={passport.id}>
                          <TableCell>
                            <a
                              href={`/traceability/${passport.id}`}
                              className="font-mono text-sm font-medium text-primary hover:underline"
                            >
                              {passport.id}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm italic">{passport.species}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {passport.volume.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium"
                              style={{
                                color: getPassportStatusColor(passport.status),
                                borderColor: getPassportStatusColor(passport.status),
                              }}
                            >
                              {getPassportStatusLabel(passport.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Metadata ──────────────────────────────────────── */}
        <TabsContent value="metadata" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2D6A4F]" />
                Plot Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <MetadataField icon={<MapPin className="w-4 h-4" />} label="Coordinate Reference System" value={plot.metadata.crs} />
                <MetadataField icon={<Clock className="w-4 h-4" />} label="Update Frequency" value={plot.metadata.updateFrequency} />
                <MetadataField icon={<TrendingUp className="w-4 h-4" />} label="Source Imagery" value={plot.metadata.sourceImagery} />
                <MetadataField icon={<Users className="w-4 h-4" />} label="Data Quality" value={plot.metadata.dataQuality} />
              </div>

              <Separator />

              <div className="space-y-3">
                <MetadataField icon={<CloudCog className="w-4 h-4" />} label="Citation" value={plot.metadata.citation} />
                <MetadataField icon={<TreePine className="w-4 h-4" />} label="Lineage" value={plot.metadata.lineage} />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Data Completeness
                  </span>
                  <span className="text-sm font-mono font-semibold">{plot.metadata.completeness}%</span>
                </div>
                <Progress
                  value={plot.metadata.completeness}
                  className="h-2.5"
                />
                <p className="text-xs text-muted-foreground">
                  {plot.metadata.completeness >= 90
                    ? 'High-quality dataset with comprehensive coverage.'
                    : plot.metadata.completeness >= 75
                      ? 'Moderate quality — some gaps in coverage may affect analysis.'
                      : 'Limited coverage — interpret results with caution.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  accent: string;
}

function SummaryCard({ icon, label, value, unit, accent }: SummaryCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
            {value}
          </span>
          {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetadataFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetadataField({ icon, label, value }: MetadataFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
