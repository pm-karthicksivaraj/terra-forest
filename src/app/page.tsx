'use client';

import React from 'react';
import KpiCard from '@/components/dashboard/KpiCard';
import AlertFeed from '@/components/dashboard/AlertFeed';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import FireRiskWidget from '@/components/dashboard/FireRiskWidget';
import MiniMap from '@/components/dashboard/MiniMap';
import { Trees, AlertTriangle, CloudCog, SatelliteDish, Activity, Users, Flame, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useI18n } from '@/lib/i18n/context';

const CARBON_TREND_EN = [
  { month: 'Jan 2025', value: 83500 },
  { month: 'Feb 2025', value: 84100 },
  { month: 'Mar 2025', value: 84800 },
  { month: 'Apr 2025', value: 85200 },
  { month: 'May 2025', value: 86000 },
  { month: 'Jun 2025', value: 86500 },
  { month: 'Jul 2025', value: 87100 },
  { month: 'Aug 2025', value: 87400 },
  { month: 'Sep 2025', value: 87800 },
  { month: 'Oct 2025', value: 88200 },
  { month: 'Nov 2025', value: 88600 },
  { month: 'Dec 2025', value: 89100 },
];

const CARBON_TREND_VI = [
  { month: 'T1 2025', value: 83500 },
  { month: 'T2 2025', value: 84100 },
  { month: 'T3 2025', value: 84800 },
  { month: 'T4 2025', value: 85200 },
  { month: 'T5 2025', value: 86000 },
  { month: 'T6 2025', value: 86500 },
  { month: 'T7 2025', value: 87100 },
  { month: 'T8 2025', value: 87400 },
  { month: 'T9 2025', value: 87800 },
  { month: 'T10 2025', value: 88200 },
  { month: 'T11 2025', value: 88600 },
  { month: 'T12 2025', value: 89100 },
];

const NDVI_TREND_EN = [
  { month: 'Jan', value: 0.72 },
  { month: 'Feb', value: 0.68 },
  { month: 'Mar', value: 0.74 },
  { month: 'Apr', value: 0.78 },
  { month: 'May', value: 0.76 },
  { month: 'Jun', value: 0.73 },
  { month: 'Jul', value: 0.71 },
  { month: 'Aug', value: 0.69 },
  { month: 'Sep', value: 0.73 },
  { month: 'Oct', value: 0.76 },
  { month: 'Nov', value: 0.77 },
  { month: 'Dec', value: 0.78 },
];

const NDVI_TREND_VI = [
  { month: 'T1', value: 0.72 },
  { month: 'T2', value: 0.68 },
  { month: 'T3', value: 0.74 },
  { month: 'T4', value: 0.78 },
  { month: 'T5', value: 0.76 },
  { month: 'T6', value: 0.73 },
  { month: 'T7', value: 0.71 },
  { month: 'T8', value: 0.69 },
  { month: 'T9', value: 0.73 },
  { month: 'T10', value: 0.76 },
  { month: 'T11', value: 0.77 },
  { month: 'T12', value: 0.78 },
];

const ALERTS_BY_TYPE_EN = [
  { type: 'Fire Risk', count: 5 },
  { type: 'Deforestation', count: 3 },
  { type: 'Forest Change', count: 4 },
  { type: 'Disease', count: 2 },
  { type: 'AI Detection', count: 1 },
];

const ALERTS_BY_TYPE_VI = [
  { type: 'Nguy cơ cháy', count: 5 },
  { type: 'Phá rừng', count: 3 },
  { type: 'Thay đổi rừng', count: 4 },
  { type: 'Bệnh', count: 2 },
  { type: 'Phát hiện AI', count: 1 },
];

export default function DashboardPage() {
  const { lang, t } = useI18n();

  const CARBON_TREND = lang === 'vi' ? CARBON_TREND_VI : CARBON_TREND_EN;
  const NDVI_TREND = lang === 'vi' ? NDVI_TREND_VI : NDVI_TREND_EN;
  const ALERTS_BY_TYPE = lang === 'vi' ? ALERTS_BY_TYPE_VI : ALERTS_BY_TYPE_EN;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t.dashboard.totalForestArea}
          value={70241}
          suffix=" ha"
          trend={2.3}
          trendLabel={t.dashboard.vsLastYear}
          icon={Trees}
          color="#2D6A4F"
          source={lang === 'vi' ? 'Cơ sở dữ liệu NFMS' : 'NFMS Database'}
          lastUpdated={lang === 'vi' ? '2 phút trước' : '2 min ago'}
        />
        <KpiCard
          title={t.dashboard.activeAlerts}
          value={15}
          trend={-12}
          trendLabel={t.dashboard.vsLastWeek}
          icon={AlertTriangle}
          color="#E65100"
          source={lang === 'vi' ? 'Pipeline phát hiện AI' : 'AI Detection Pipeline'}
          lastUpdated={lang === 'vi' ? '5 phút trước' : '5 min ago'}
        />
        <KpiCard
          title={t.dashboard.carbonStock}
          value={88200}
          suffix=" tC"
          trend={5.6}
          trendLabel={t.dashboard.vsLastYear}
          icon={CloudCog}
          color="#40916C"
          source={lang === 'vi' ? 'Công cụ MRV Cacbon' : 'Carbon MRV Engine'}
          lastUpdated={lang === 'vi' ? '1 giờ trước' : '1 hour ago'}
        />
        <KpiCard
          title={t.dashboard.averageNdvi}
          value={0.78}
          suffix=""
          decimals={2}
          trend={3.2}
          trendLabel={t.dashboard.vsLastMonth}
          icon={SatelliteDish}
          color="#52B788"
          source="Sentinel-2"
          lastUpdated={lang === 'vi' ? '6 giờ trước' : '6 hours ago'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t.dashboard.carbonTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CARBON_TREND}>
                <defs>
                  <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#4A6A54" interval={1} />
                <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#2D6A4F" fill="url(#carbonGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t.dashboard.ndviTrend}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={NDVI_TREND}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52B788" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                <YAxis domain={[0.5, 1]} tick={{ fontSize: 11 }} stroke="#4A6A54" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#52B788" fill="url(#ndviGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Map + Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1"><AlertFeed /></div>
        <div className="lg:col-span-1"><MiniMap /></div>
        <div className="lg:col-span-1 space-y-4">
          <WeatherWidget />
          <FireRiskWidget />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-forest-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.dashboard.activePlots}</p>
              <p className="text-lg font-bold text-forest-800">8 / 10</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-fire-400/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-fire-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.dashboard.fireRiskZones}</p>
              <p className="text-lg font-bold text-fire-700">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-water-400/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-water-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.dashboard.onlineRangers}</p>
              <p className="text-lg font-bold text-water-700">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-earth-600/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-earth-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.dashboard.monitoringStations}</p>
              <p className="text-lg font-bold text-earth-700">4</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert by Type Bar Chart */}
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{t.dashboard.alertsByType}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ALERTS_BY_TYPE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="#4A6A54" />
              <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
              <Bar dataKey="count" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
