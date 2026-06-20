import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, ALERTS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byTypeAndSeverity: Record<string, Record<string, number>> = {};

  ALERTS.forEach(a => {
    byType[a.alert_type] = (byType[a.alert_type] || 0) + 1;
    bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    if (!byTypeAndSeverity[a.alert_type]) byTypeAndSeverity[a.alert_type] = {};
    byTypeAndSeverity[a.alert_type][a.severity] = (byTypeAndSeverity[a.alert_type][a.severity] || 0) + 1;
  });

  return NextResponse.json(success({ by_type: byType, by_severity: bySeverity, by_status: byStatus, by_type_and_severity: byTypeAndSeverity }));
}
