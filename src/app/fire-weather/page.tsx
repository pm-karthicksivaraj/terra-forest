'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Flame, Thermometer, Droplets, Wind, CloudRain, Sun, AlertTriangle, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FIRE_RISK_LEVELS } from '@/lib/constants';

const WEATHER_STATIONS = [
  { name: 'Bu Gia Map Station', code: 'STN_BGM_01', temp: 32, humidity: 78, wind: 12, rain: 2.5, fwi: 15, status: 'active', lastUpdate: '14:30', elevation: 150 },
  { name: 'Cat Tien Gate', code: 'STN_CAT_01', temp: 34, humidity: 65, wind: 8, rain: 0, fwi: 28, status: 'active', lastUpdate: '14:25', elevation: 95 },
  { name: 'Dong Nai River', code: 'STN_DN_01', temp: 30, humidity: 82, wind: 15, rain: 5.2, fwi: 8, status: 'active', lastUpdate: '14:20', elevation: 30 },
  { name: 'Dak Lak Lake', code: 'STN_DL_01', temp: 28, humidity: 85, wind: 10, rain: 12, fwi: 6, status: 'active', lastUpdate: '14:15', elevation: 520 },
];

const ACTIVE_FIRES = [
  {
    id: 1, location: 'Cat Tien District, Dong Nai', lat: 11.22, lng: 107.18,
    area_ha: 5.2, started: '2025-03-04 14:30', status: 'alerted',
    fwi: 42, suppressCrew: 'Team Alpha (4 rangers)', containment: 30,
    lifecycle: ['detected', 'alerted'],
  },
  {
    id: 2, location: 'Ea Sup District, Dak Lak', lat: 12.72, lng: 108.12,
    area_ha: 12.8, started: '2025-03-04 11:15', status: 'dispatched',
    fwi: 38, suppressCrew: 'Team Bravo (6 rangers)', containment: 10,
    lifecycle: ['detected', 'alerted', 'dispatched'],
  },
  {
    id: 3, location: 'U Minh District, Ca Mau', lat: 9.22, lng: 105.18,
    area_ha: 3.1, started: '2025-03-03 16:45', status: 'contained',
    fwi: 32, suppressCrew: 'Team Delta (3 rangers)', containment: 80,
    lifecycle: ['detected', 'alerted', 'dispatched', 'contained'],
  },
];

const FIRE_LIFECYCLE_STEPS = ['Detected', 'Alerted', 'Dispatched', 'Contained', 'Closed'];

const FWI_HISTORY = [
  { day: 'Mon', 'Bu Gia Map': 12, 'Cat Tien': 22, 'Dong Nai River': 8, 'Dak Lak Lake': 5 },
  { day: 'Tue', 'Bu Gia Map': 15, 'Cat Tien': 28, 'Dong Nai River': 10, 'Dak Lak Lake': 6 },
  { day: 'Wed', 'Bu Gia Map': 18, 'Cat Tien': 32, 'Dong Nai River': 9, 'Dak Lak Lake': 5 },
  { day: 'Thu', 'Bu Gia Map': 22, 'Cat Tien': 38, 'Dong Nai River': 12, 'Dak Lak Lake': 8 },
  { day: 'Fri', 'Bu Gia Map': 15, 'Cat Tien': 28, 'Dong Nai River': 8, 'Dak Lak Lake': 6 },
  { day: 'Sat', 'Bu Gia Map': 12, 'Cat Tien': 22, 'Dong Nai River': 6, 'Dak Lak Lake': 4 },
  { day: 'Sun', 'Bu Gia Map': 15, 'Cat Tien': 28, 'Dong Nai River': 8, 'Dak Lak Lake': 5 },
];

const FORECAST = [
  { day: 'Today', temp: 34, rain: 10, wind: 12, fwi: 25 },
  { day: 'Tomorrow', temp: 33, rain: 30, wind: 10, fwi: 20 },
  { day: 'Day 3', temp: 31, rain: 60, wind: 8, fwi: 12 },
  { day: 'Day 4', temp: 30, rain: 45, wind: 14, fwi: 15 },
  { day: 'Day 5', temp: 32, rain: 15, wind: 11, fwi: 22 },
];

const FIRE_RISK_SUMMARY = { low: 4, medium: 3, high: 2, critical: 1 };

const INCIDENT_TIMELINE = [
  { fire: 1, events: [
    { time: '14:30', step: 'Detected', detail: 'Satellite thermal anomaly detected by VIIRS sensor (375m resolution)' },
    { time: '14:32', step: 'Alerted', detail: 'Fire alert dispatched to Operations Center and Team Alpha' },
    { time: '14:45', step: 'Dispatched', detail: 'Team Alpha en route from Bu Gia Map station (ETA 25 min)' },
  ]},
  { fire: 2, events: [
    { time: '11:15', step: 'Detected', detail: 'Ground patrol reported smoke column near Ea Sup protection forest' },
    { time: '11:18', step: 'Alerted', detail: 'Fire alert escalated to provincial authority. FWI at critical level.' },
    { time: '11:30', step: 'Dispatched', detail: 'Team Bravo dispatched with water pumps and hand tools' },
    { time: '12:45', step: 'In Field', detail: 'Fire front measured at 2.1 km. Wind shift complicating containment.' },
  ]},
  { fire: 3, events: [
    { time: '16:45', step: 'Detected', detail: 'Mangrove fire spotted by Ca Mau station smoke detector' },
    { time: '16:48', step: 'Alerted', detail: 'Alert issued. Peat fire risk assessment: moderate.' },
    { time: '17:00', step: 'Dispatched', detail: 'Team Delta deployed via boat access channel' },
    { time: '18:30', step: 'Contained', detail: 'Fire perimeter secured. 80% containment achieved. Mop-up operations ongoing.' },
  ]},
];

export default function FireWeatherPage() {
  const [selectedFire, setSelectedFire] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fire & Weather</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fire risk monitoring, weather station data, and incident lifecycle management. The Fire Weather Index (FWI)
          system calculates risk based on temperature, humidity, wind speed, and precipitation data from ground stations.
          Fire incidents follow a structured lifecycle: Detected → Alerted → Dispatched → Contained → Closed.
          Each active fire is tracked with suppression status, crew assignment, and containment percentage.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fires">Active Fires</TabsTrigger>
          <TabsTrigger value="stations">Weather Stations</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Fire risk summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FIRE_RISK_LEVELS.map(level => (
              <Card key={level.value} className="shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${level.color}20` }}>
                      <Flame className="w-5 h-5" style={{ color: level.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{level.label} Risk</p>
                      <p className="text-xl font-bold" style={{ color: level.color }}>{FIRE_RISK_SUMMARY[level.value as keyof typeof FIRE_RISK_SUMMARY]}</p>
                      <p className="text-[10px] text-muted-foreground">forest plots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FWI Chart */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">FWI History — Last 7 Days</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={FWI_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Bu Gia Map" stroke="#2D6A4F" strokeWidth={2} />
                  <Line type="monotone" dataKey="Cat Tien" stroke="#E65100" strokeWidth={2} />
                  <Line type="monotone" dataKey="Dong Nai River" stroke="#0277BD" strokeWidth={2} />
                  <Line type="monotone" dataKey="Dak Lak Lake" stroke="#52B788" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Fires summary */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-fire-700" />
                Active Fires ({ACTIVE_FIRES.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ACTIVE_FIRES.map(fire => (
                  <div key={fire.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedFire(fire.id)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold">{fire.location}</p>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => { e.stopPropagation(); router.push(`/fire-weather/${fire.id}`); }}>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Started: {fire.started} | Area: {fire.area_ha} ha | FWI: {fire.fwi} | Crew: {fire.suppressCrew}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <p className="text-[9px] text-muted-foreground">Containment</p>
                        <Progress value={fire.containment} className="h-1.5" />
                      </div>
                      <Badge className={fire.status === 'dispatched' ? 'bg-fire-700 text-white' : fire.status === 'alerted' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}>
                        {fire.status.charAt(0).toUpperCase() + fire.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fires" className="space-y-4">
          {ACTIVE_FIRES.map(fire => (
            <Card key={fire.id} className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">Fire Incident #{fire.id}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{fire.location}</p>
                  </div>
                  <Badge className={fire.status === 'dispatched' ? 'bg-fire-700 text-white' : fire.status === 'alerted' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}>
                    {fire.status.charAt(0).toUpperCase() + fire.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Started:</span><br /><span className="font-medium">{fire.started}</span></div>
                  <div><span className="text-muted-foreground">Burned Area:</span><br /><span className="font-medium">{fire.area_ha} ha</span></div>
                  <div><span className="text-muted-foreground">FWI:</span><br /><span className="font-medium text-fire-700">{fire.fwi}</span></div>
                  <div><span className="text-muted-foreground">Coordinates:</span><br /><span className="font-mono">{fire.lat}°N, {fire.lng}°E</span></div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Containment Progress</p>
                  <Progress value={fire.containment} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{fire.containment}% contained | Crew: {fire.suppressCrew}</p>
                </div>
                {/* Fire lifecycle */}
                <div className="mt-3 flex items-center gap-1 text-[9px] flex-wrap">
                  {FIRE_LIFECYCLE_STEPS.map((step, i) => {
                    const stepKey = step.toLowerCase();
                    const isActive = fire.lifecycle.includes(stepKey as any);
                    return (
                      <React.Fragment key={step}>
                        <span className={`px-1.5 py-0.5 rounded ${isActive ? 'bg-fire-700/10 text-fire-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>{step}</span>
                        {i < FIRE_LIFECYCLE_STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Incident timeline */}
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Incident Timeline</p>
                  <div className="space-y-2">
                    {(INCIDENT_TIMELINE.find(t => t.fire === fire.id)?.events || []).map((event, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-fire-700/20 flex items-center justify-center flex-shrink-0 text-[9px] text-fire-700 font-bold">{i + 1}</div>
                        <div>
                          <p className="text-[10px] font-medium">{event.step} <span className="text-muted-foreground">at {event.time}</span></p>
                          <p className="text-[10px] text-muted-foreground">{event.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          {WEATHER_STATIONS.map((st, i) => (
            <Card key={i} className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">{st.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{st.code} | Elevation: {st.elevation} m | Last update: {st.lastUpdate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]" style={{ color: st.fwi > 20 ? '#E65100' : '#2D6A4F' }}>FWI: {st.fwi}</Badge>
                    <Badge className="bg-forest-500 text-white text-[10px]">Active</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Thermometer className="w-4 h-4 text-fire-700" />
                    <div><p className="text-[10px] text-muted-foreground">Temperature</p><p className="text-sm font-bold">{st.temp}°C</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Droplets className="w-4 h-4 text-water-700" />
                    <div><p className="text-[10px] text-muted-foreground">Humidity</p><p className="text-sm font-bold">{st.humidity}%</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Wind className="w-4 h-4 text-earth-700" />
                    <div><p className="text-[10px] text-muted-foreground">Wind</p><p className="text-sm font-bold">{st.wind} km/h</p></div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <CloudRain className="w-4 h-4 text-water-400" />
                    <div><p className="text-[10px] text-muted-foreground">Rainfall</p><p className="text-sm font-bold">{st.rain} mm</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                5-Day Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {FORECAST.map((d, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold mb-2">{d.day}</p>
                    <div className="space-y-2">
                      <div><Thermometer className="w-4 h-4 mx-auto text-fire-700" /><p className="text-sm font-bold">{d.temp}°C</p></div>
                      <div><CloudRain className="w-4 h-4 mx-auto text-water-400" /><p className="text-xs">{d.rain}% rain</p></div>
                      <div><Wind className="w-4 h-4 mx-auto text-earth-700" /><p className="text-xs">{d.wind} km/h</p></div>
                      <div>
                        <Flame className="w-4 h-4 mx-auto" style={{ color: d.fwi > 20 ? '#E65100' : '#52B788' }} />
                        <Badge variant="outline" className="text-[10px] h-4 mt-1" style={{ color: d.fwi > 20 ? '#E65100' : '#2D6A4F' }}>FWI {d.fwi}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">FWI Forecast Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={FORECAST}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#4A6A54" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <Bar dataKey="fwi" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="FWI" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
