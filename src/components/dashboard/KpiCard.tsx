'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  color: string;
  decimals?: number;
  source?: string;
  lastUpdated?: string;
}

export default function KpiCard({ title, value, suffix, prefix, trend, trendLabel, icon: Icon, color, decimals = 0, source, lastUpdated }: KpiCardProps) {
  const { t } = useI18n();
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const trendColor = trend && trend > 0 ? 'text-forest-500' : trend && trend < 0 ? 'text-fire-700' : 'text-muted-foreground';
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-sm border-0 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">{title}</p>
              <p className="text-2xl font-bold" style={{ color }}>
                {prefix}{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toLocaleString()}{suffix}
              </p>
              {trend !== undefined && (
                <div className={cn('flex items-center gap-1 mt-1', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">{Math.abs(trend)}%</span>
                  {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
                </div>
              )}
              {lastUpdated && (
                <p className="text-[10px] text-muted-foreground mt-1">{t.common.updated}: {lastUpdated}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
          {source && (
            <p className="text-[9px] text-muted-foreground mt-2 pt-1 border-t border-border/50">{t.common.source}: {source}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
