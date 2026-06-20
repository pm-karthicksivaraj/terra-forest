'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Flame, TreePine, GitCompare, Bug } from 'lucide-react';
import { ALERT_SEVERITY } from '@/lib/constants';
import { useI18n } from '@/lib/i18n/context';

const MOCK_ALERTS_EN = [
  { id: 1, type: 'fire_risk', severity: 'critical', message: 'Critical fire risk at plot DN_CAT_001', plot: 'DN_CAT_001', time: '5 min ago', icon: Flame },
  { id: 2, type: 'deforestation', severity: 'critical', message: 'Large-scale deforestation detected in Dak Lak', plot: 'DL_YT_001', time: '12 min ago', icon: TreePine },
  { id: 3, type: 'fire_risk', severity: 'high', message: 'Fire warning at Ca Mau mangrove forest', plot: 'CM_CM_001', time: '28 min ago', icon: Flame },
  { id: 4, type: 'forest_change', severity: 'medium', message: 'Forest cover change in Binh Phuoc', plot: 'BP_BP_001', time: '1 hour ago', icon: GitCompare },
  { id: 5, type: 'disease', severity: 'low', message: 'Disease detected in acacia plantation', plot: 'BP_BP_002', time: '2 hours ago', icon: Bug },
  { id: 6, type: 'deforestation', severity: 'high', message: 'Illegal encroachment at Cat Tien NP buffer zone', plot: 'DN_CAT_001', time: '3 hours ago', icon: TreePine },
];

const MOCK_ALERTS_VI = [
  { id: 1, type: 'fire_risk', severity: 'critical', message: 'Nguy cơ cháy nghiêm trọng tại ô DN_CAT_001', plot: 'DN_CAT_001', time: '5 phút trước', icon: Flame },
  { id: 2, type: 'deforestation', severity: 'critical', message: 'Phát hiện phá rừng quy mô lớn tại Đắk Lắk', plot: 'DL_YT_001', time: '12 phút trước', icon: TreePine },
  { id: 3, type: 'fire_risk', severity: 'high', message: 'Cảnh báo cháy tại rừng ngập mặn Cà Mau', plot: 'CM_CM_001', time: '28 phút trước', icon: Flame },
  { id: 4, type: 'forest_change', severity: 'medium', message: 'Thay đổi lớp phủ rừng tại Bình Phước', plot: 'BP_BP_001', time: '1 giờ trước', icon: GitCompare },
  { id: 5, type: 'disease', severity: 'low', message: 'Phát hiện dịch bệnh tại rừng keo', plot: 'BP_BP_002', time: '2 giờ trước', icon: Bug },
  { id: 6, type: 'deforestation', severity: 'high', message: 'Xâm lấn trái phép tại vùng đệm VQG Cát Tiên', plot: 'DN_CAT_001', time: '3 giờ trước', icon: TreePine },
];

export default function AlertFeed() {
  const { lang, t } = useI18n();
  const MOCK_ALERTS = lang === 'vi' ? MOCK_ALERTS_VI : MOCK_ALERTS_EN;

  const getSeverityStyle = (severity: string) => {
    const s = ALERT_SEVERITY.find(s => s.value === severity);
    return s || ALERT_SEVERITY[3];
  };

  const getSeverityLabel = (s: typeof ALERT_SEVERITY[number]) => {
    return lang === 'vi' ? s.labelVi : s.label;
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-fire-700" />
            {t.dashboard.recentAlerts}
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-fire-700/10 text-fire-700">
            {MOCK_ALERTS.filter(a => a.severity === 'critical' || a.severity === 'high').length} {t.common.urgent}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {MOCK_ALERTS.map((alert, index) => {
            const sev = getSeverityStyle(alert.severity);
            const AlertIcon = alert.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${sev.color}15` }}>
                  <AlertIcon className="w-4 h-4" style={{ color: sev.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.plot}</span>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0" style={{ color: sev.color, borderColor: sev.color }}>
                  {getSeverityLabel(sev)}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
