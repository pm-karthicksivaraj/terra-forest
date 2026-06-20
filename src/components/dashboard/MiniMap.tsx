'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const PLOT_MARKERS = [
  { code: 'DN_BGM_001', lat: 11.52, lng: 107.35, type: 'natural', risk: 'low' },
  { code: 'DN_BGM_002', lat: 11.55, lng: 107.38, type: 'planted', risk: 'low' },
  { code: 'DN_BGM_003', lat: 11.48, lng: 107.30, type: 'protection', risk: 'medium' },
  { code: 'DN_CAT_001', lat: 11.20, lng: 107.15, type: 'natural', risk: 'high' },
  { code: 'DN_TB_001', lat: 10.95, lng: 107.00, type: 'mangrove', risk: 'medium' },
  { code: 'BP_BP_001', lat: 11.80, lng: 106.90, type: 'natural', risk: 'low' },
  { code: 'BP_BP_002', lat: 11.85, lng: 106.95, type: 'planted', risk: 'low' },
  { code: 'DL_YT_001', lat: 12.70, lng: 108.10, type: 'natural', risk: 'critical' },
  { code: 'LD_DL_001', lat: 11.95, lng: 108.40, type: 'protection', risk: 'low' },
  { code: 'CM_CM_001', lat: 9.20, lng: 105.20, type: 'mangrove', risk: 'high' },
];

const RISK_COLORS: Record<string, string> = {
  low: '#52B788',
  medium: '#FFD600',
  high: '#FF8A65',
  critical: '#E65100',
};

const RISK_LABELS_EN: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const RISK_LABELS_VI: Record<string, string> = {
  low: 'Thấp',
  medium: 'TB',
  high: 'Cao',
  critical: 'Nghiêm trọng',
};

const PROVINCES_EN = [
  { name: 'Dak Lak', lat: 12.66, lng: 108.04 },
  { name: 'Lam Dong', lat: 11.94, lng: 108.44 },
  { name: 'Dong Nai', lat: 11.05, lng: 107.25 },
  { name: 'Binh Phuoc', lat: 11.75, lng: 106.95 },
  { name: 'Ca Mau', lat: 9.18, lng: 105.15 },
];

const PROVINCES_VI = [
  { name: 'Đắk Lắk', lat: 12.66, lng: 108.04 },
  { name: 'Lâm Đồng', lat: 11.94, lng: 108.44 },
  { name: 'Đồng Nai', lat: 11.05, lng: 107.25 },
  { name: 'Bình Phước', lat: 11.75, lng: 106.95 },
  { name: 'Cà Mau', lat: 9.18, lng: 105.15 },
];

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lang, t } = useI18n();
  const provinces = lang === 'vi' ? PROVINCES_VI : PROVINCES_EN;
  const riskLabels = lang === 'vi' ? RISK_LABELS_VI : RISK_LABELS_EN;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#E8F5EC';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#C8E6C9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.05);
    ctx.lineTo(w * 0.15, h * 0.15);
    ctx.lineTo(w * 0.2, h * 0.35);
    ctx.lineTo(w * 0.15, h * 0.5);
    ctx.lineTo(w * 0.2, h * 0.65);
    ctx.lineTo(w * 0.3, h * 0.8);
    ctx.lineTo(w * 0.25, h * 0.95);
    ctx.stroke();

    const minLng = 104.5, maxLng = 109.5;
    const minLat = 8.5, maxLat = 13.5;
    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLat)) * w * 0.8 + w * 0.1;
    const toY = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * h * 0.85 + h * 0.05;

    provinces.forEach(p => {
      const x = toX(p.lng);
      const y = toY(p.lat);
      ctx.fillStyle = '#C8E6C9';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4A6A54';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x, y + 35);
    });

    PLOT_MARKERS.forEach(plot => {
      const x = toX(plot.lng);
      const y = toY(plot.lat);
      const color = RISK_COLORS[plot.risk] || '#52B788';
      ctx.fillStyle = `${color}30`;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [lang, provinces]);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-forest-600" />
          {t.dashboard.overviewMap}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 240 }} />
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {Object.entries(RISK_COLORS).map(([risk, color]) => (
            <div key={risk} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground">{riskLabels[risk]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
