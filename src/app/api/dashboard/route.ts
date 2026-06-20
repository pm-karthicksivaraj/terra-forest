import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, CARBON_RECORDS, ALERTS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const activePlots = PLOTS.filter(p => p.status === 'active').length;
  const totalCarbon = CARBON_RECORDS.reduce((sum, r) => sum + r.carbon_stock_tonnes, 0);
  const activeAlerts = ALERTS.filter(a => a.status === 'active').length;
  const degradedPlots = PLOTS.filter(p => p.status === 'degraded').length;

  const carbonTrend = [
    { year: 2020, total_stock: 68000 },
    { year: 2021, total_stock: 72500 },
    { year: 2022, total_stock: 78200 },
    { year: 2023, total_stock: 85600 },
    { year: 2024, total_stock: 92700 },
  ];

  const alertsByType: Record<string, number> = {};
  const alertsBySeverity: Record<string, number> = {};
  ALERTS.forEach(a => {
    alertsByType[a.alert_type] = (alertsByType[a.alert_type] || 0) + 1;
    alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] || 0) + 1;
  });

  return NextResponse.json(success({
    summary: {
      total_plots: PLOTS.length,
      active_plots: activePlots,
      total_carbon_stock: totalCarbon,
      active_alerts: activeAlerts,
      degraded_plots: degradedPlots,
    },
    carbon_trend: carbonTrend,
    alerts: {
      by_type: alertsByType,
      by_severity: alertsBySeverity,
    },
    recent_alerts: {
      count: ALERTS.filter(a => a.status === 'active').length,
      items: ALERTS.filter(a => a.status === 'active').slice(0, 5),
    },
  }));
}
