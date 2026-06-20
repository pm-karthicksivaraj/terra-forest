'use client';

import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import SafeMapLibre from '@/components/map/SafeMapLibre';
import { Radio, MapPin, Battery, Wifi, BatteryLow, BatteryMedium, BatteryFull, Clock, Users, AlertTriangle, Smartphone, Signal, ChevronRight } from 'lucide-react';

const ACTIVE_RANGERS = [
  { id: 'R-001', name: 'Nguyen Van Minh', team: 'Eagle Patrol', device: 'TF-Android-014', shiftStart: '06:00', duration: '4h 32m', lat: 11.52, lng: 107.35, battery: 87, gps: 'strong', connectivity: 'online', role: 'Team Lead' },
  { id: 'R-002', name: 'Tran Hoang Long', team: 'Eagle Patrol', device: 'TF-iOS-008', shiftStart: '06:00', duration: '4h 32m', lat: 11.54, lng: 107.38, battery: 64, gps: 'strong', connectivity: 'online', role: 'Ranger' },
  { id: 'R-003', name: 'Le Thanh Tung', team: 'Tiger Patrol', device: 'TF-Android-022', shiftStart: '07:30', duration: '3h 02m', lat: 11.48, lng: 107.30, battery: 42, gps: 'medium', connectivity: 'online', role: 'Ranger' },
  { id: 'R-004', name: 'Pham Duc Huy', team: 'Hawk Patrol', device: 'TF-Android-031', shiftStart: '05:30', duration: '5h 02m', lat: 11.50, lng: 107.42, battery: 23, gps: 'weak', connectivity: 'intermittent', role: 'Ranger' },
];

const ACTIVE_TEAMS = [
  { name: 'Eagle Patrol', code: 'EAG', members: 4, status: 'active', province: 'Dong Nai', task: 'Boundary survey — Bu Gia Map Sector A' },
  { name: 'Tiger Patrol', code: 'TGR', members: 3, status: 'active', province: 'Dong Nai', task: 'Fire risk assessment — Sector C' },
  { name: 'Hawk Patrol', code: 'HWK', members: 3, status: 'active', province: 'Binh Phuoc', task: 'Deforestation verification — Plot BP-BP-001' },
  { name: 'Falcon Patrol', code: 'FLC', members: 4, status: 'standby', province: 'Dak Lak', task: 'Standby — awaiting assignment' },
];

const SOS_ALERTS = [
  { id: 'SOS-004', ranger: 'Pham Duc Huy', team: 'Hawk Patrol', time: '10:15', message: 'Low battery warning — GPS signal weak', severity: 'warning', lat: 11.50, lng: 107.42 },
];

const RECENT_PINGS = [
  { ranger: 'Nguyen Van Minh', time: '10:32:15', lat: 11.5201, lng: 107.3503, accuracy: 5 },
  { ranger: 'Tran Hoang Long', time: '10:31:48', lat: 11.5398, lng: 107.3802, accuracy: 8 },
  { ranger: 'Le Thanh Tung', time: '10:30:22', lat: 11.4805, lng: 107.3001, accuracy: 12 },
  { ranger: 'Pham Duc Huy', time: '10:28:55', lat: 11.4999, lng: 107.4198, accuracy: 25 },
  { ranger: 'Nguyen Van Minh', time: '10:25:10', lat: 11.5198, lng: 107.3498, accuracy: 6 },
  { ranger: 'Tran Hoang Long', time: '10:24:33', lat: 11.5395, lng: 107.3799, accuracy: 7 },
];

function BatteryIcon({ level }: { level: number }) {
  if (level > 75) return <BatteryFull className="w-4 h-4 text-emerald-500" />;
  if (level > 50) return <BatteryMedium className="w-4 h-4 text-yellow-500" />;
  if (level > 25) return <BatteryMedium className="w-4 h-4 text-orange-500" />;
  return <BatteryLow className="w-4 h-4 text-red-500" />;
}

function ConnectivityBadge({ status }: { status: string }) {
  if (status === 'online') return <Badge variant="default" className="text-[10px] gap-1"><Wifi className="w-3 h-3" /> Online</Badge>;
  if (status === 'intermittent') return <Badge variant="secondary" className="text-[10px] gap-1"><Signal className="w-3 h-3" /> Intermittent</Badge>;
  return <Badge variant="outline" className="text-[10px] gap-1"><Signal className="w-3 h-3" /> Offline</Badge>;
}

export default function LiveOpsPage() {
  const handleMapReady = useCallback((map: any) => {
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: ACTIVE_RANGERS.map(r => ({
        type: 'Feature',
        properties: { id: r.id, name: r.name, team: r.team, battery: r.battery, role: r.role },
        geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      })),
    };
    map.addSource('ranger-positions', { type: 'geojson', data: geojson });
    map.addLayer({
      id: 'ranger-circles',
      type: 'circle',
      source: 'ranger-positions',
      paint: {
        'circle-radius': 10,
        'circle-color': '#2D6A4F',
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Add SOS marker
    const sosGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: SOS_ALERTS.map(a => ({
        type: 'Feature',
        properties: { id: a.id, ranger: a.ranger, severity: a.severity },
        geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
      })),
    };
    map.addSource('sos-positions', { type: 'geojson', data: sosGeojson });
    map.addLayer({
      id: 'sos-circles',
      type: 'circle',
      source: 'sos-positions',
      paint: {
        'circle-radius': 14,
        'circle-color': '#D32F2F',
        'circle-opacity': 0.9,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#FFD600',
      },
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time ranger tracking, active shift monitoring, and field operation status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500" /> Live Ranger Map
                </CardTitle>
                <Badge variant="default" className="text-[10px] gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border" style={{ height: 450 }}>
                <SafeMapLibre
                  onMapReady={handleMapReady}
                  className="w-full h-full"
                  center={[107.35, 11.50]}
                  zoom={10}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" /> Active Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {ACTIVE_RANGERS.map(r => (
                <div key={r.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{r.name}</span>
                    <ConnectivityBadge status={r.connectivity} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-[10px]">{r.role}</Badge>
                    <span>{r.team}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      <span>{r.device}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{r.shiftStart} · {r.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <BatteryIcon level={r.battery} />
                      <span>{r.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>GPS: {r.gps}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {SOS_ALERTS.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" /> SOS Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SOS_ALERTS.map(a => (
                  <div key={a.id} className="p-2 rounded border border-red-200 bg-red-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-red-700">{a.id}</span>
                      <Badge variant="destructive" className="text-[10px]">SOS</Badge>
                    </div>
                    <p className="text-xs text-red-800">{a.ranger} — {a.team}</p>
                    <p className="text-xs text-red-600">{a.message}</p>
                    <p className="text-[10px] text-red-500 mt-1">{a.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Active Teams Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACTIVE_TEAMS.map(t => (
              <div key={t.code} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{t.name} <span className="text-xs text-muted-foreground">({t.code})</span></p>
                    <p className="text-xs text-muted-foreground">{t.members} members · {t.province}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={t.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                    {t.status === 'active' ? 'Active' : 'Standby'}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-48 truncate">{t.task}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Location Pings</CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-2 font-semibold">Ranger</th>
                  <th className="text-left py-2 px-2 font-semibold">Time</th>
                  <th className="text-right py-2 px-2 font-semibold">Lat</th>
                  <th className="text-right py-2 px-2 font-semibold">Lng</th>
                  <th className="text-right py-2 pl-2 font-semibold">Acc (m)</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_PINGS.map((p, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-2">{p.ranger.split(' ').slice(-1)[0]}</td>
                    <td className="py-2 px-2 font-mono">{p.time}</td>
                    <td className="py-2 px-2 text-right font-mono">{p.lat.toFixed(4)}</td>
                    <td className="py-2 px-2 text-right font-mono">{p.lng.toFixed(4)}</td>
                    <td className="py-2 pl-2 text-right">{p.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
