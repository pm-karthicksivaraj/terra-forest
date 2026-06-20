'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const STATIONS_EN = [
  { name: 'Bu Gia Map Station', temp: 32, humidity: 78, wind: 12, rain: 2.5, elevation: 150 },
  { name: 'Cat Tien Station', temp: 34, humidity: 65, wind: 8, rain: 0, elevation: 95 },
  { name: 'Ho Lac Station', temp: 28, humidity: 82, wind: 15, rain: 5.2, elevation: 520 },
];

const STATIONS_VI = [
  { name: 'Trạm Bù Gia Mập', temp: 32, humidity: 78, wind: 12, rain: 2.5, elevation: 150 },
  { name: 'Trạm Cát Tiên', temp: 34, humidity: 65, wind: 8, rain: 0, elevation: 95 },
  { name: 'Trạm Hồ Lác', temp: 28, humidity: 82, wind: 15, rain: 5.2, elevation: 520 },
];

export default function WeatherWidget() {
  const { lang, t } = useI18n();
  const STATIONS = lang === 'vi' ? STATIONS_VI : STATIONS_EN;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-water-700" />
          {t.dashboard.weatherStations}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {STATIONS.map((st, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-semibold mb-2">{st.name}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-fire-700" />
                  <span className="text-xs">{st.temp}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-water-700" />
                  <span className="text-xs">{st.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-earth-700" />
                  <span className="text-xs">{st.wind} km/h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-water-400" />
                  <span className="text-xs">{st.rain} mm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
