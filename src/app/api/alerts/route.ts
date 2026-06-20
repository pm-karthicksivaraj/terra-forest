import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const url = new URL(req.url);
  const severity = url.searchParams.get('severity');
  const alertType = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const where: Record<string, unknown> = {};
  if (severity) where.severity = severity;
  if (alertType) where.alert_type = alertType;
  if (status) where.status = status;

  try {
    const [alerts, total] = await Promise.all([
      db.alert.findMany({
        where,
        include: { plot: { select: { plot_code: true, centroid_lat: true, centroid_lng: true } } },
        orderBy: { detected_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.alert.count({ where }),
    ]);
    return NextResponse.json(success(alerts, { total, page, limit }));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch alerts';
    return NextResponse.json(error(msg), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await req.json();
    const { plot_id, alert_type, severity, message, message_vi } = body;

    if (!alert_type || !severity) {
      return NextResponse.json(error('alert_type and severity are required'), { status: 400 });
    }

    const alert = await db.alert.create({
      data: {
        plot_id: plot_id || null,
        alert_type,
        severity,
        status: 'new',
        message: message || '',
        message_vi: message_vi || message || '',
      },
    });

    return NextResponse.json(success(alert), { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create alert';
    return NextResponse.json(error(msg), { status: 500 });
  }
}
