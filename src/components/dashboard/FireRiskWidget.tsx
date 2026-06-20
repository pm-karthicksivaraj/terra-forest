'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { FIRE_RISK_LEVELS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';

const FIRE_ZONES_EN = [
  { name: 'Dak Lak - Plot DL_YT_001', risk: 'critical' as const, fwi: 42 },
  { name: 'Ca Mau - Plot CM_CM_001', risk: 'high' as const, fwi: 28 },
  { name: 'Dong Nai - Plot DN_BGM_003', risk: 'medium' as const, fwi: 18 },
  { name: 'Binh Phuoc - Plot BP_BP_001', risk: 'low' as const, fwi: 6 },
];

const FIRE_ZONES_VI = [
  { name: 'Đắk Lắk - Ô DL_YT_001', risk: 'critical' as const, fwi: 42 },
  { name: 'Cà Mau - Ô CM_CM_001', risk: 'high' as const, fwi: 28 },
  { name: 'Đồng Nai - Ô DN_BGM_003', risk: 'medium' as const, fwi: 18 },
  { name: 'Bình Phước - Ô BP_BP_001', risk: 'low' as const, fwi: 6 },
];

export default function FireRiskWidget() {
  const { lang, t } = useI18n();
  const FIRE_ZONES = lang === 'vi' ? FIRE_ZONES_VI : FIRE_ZONES_EN;

  const getRiskLabel = (level: typeof FIRE_RISK_LEVELS[number]) => {
    return lang === 'vi' ? level.labelVi : level.label;
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Flame className="w-4 h-4 text-fire-700" />
          {t.dashboard.fireRiskAssessment}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Fire risk gradient legend */}
        <div className="mb-3">
          <div className="fire-gradient h-2 rounded-full" />
          <div className="flex justify-between mt-1">
            {FIRE_RISK_LEVELS.map(level => (
              <span key={level.value} className="text-[10px] text-muted-foreground">{getRiskLabel(level)}</span>
            ))}
          </div>
        </div>
        {/* Zone list */}
        <div className="space-y-2">
          {FIRE_ZONES.map((zone, i) => {
            const level = FIRE_RISK_LEVELS.find(l => l.value === zone.risk)!;
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: level.color }} />
                  <span className="text-xs">{zone.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">FWI {zone.fwi}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: level.color, backgroundColor: `${level.color}15` }}>
                    {getRiskLabel(level)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
