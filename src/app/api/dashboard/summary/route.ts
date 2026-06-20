import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, CARBON_RECORDS, ALERTS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  return NextResponse.json(success({
    total_plots: PLOTS.length,
    active_plots: PLOTS.filter(p => p.status === 'active').length,
    total_carbon_stock: CARBON_RECORDS.reduce((s, r) => s + r.carbon_stock_tonnes, 0),
    active_alerts: ALERTS.filter(a => a.status === 'active').length,
    degraded_plots: PLOTS.filter(p => p.status === 'degraded').length,
  }));
}
