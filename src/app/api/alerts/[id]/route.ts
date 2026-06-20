import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized, notFound } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  try {
    const alert = await db.alert.findUnique({
      where: { id },
      include: { plot: true, acknowledged_user: { select: { id: true, name: true } } },
    });
    if (!alert) return NextResponse.json(notFound('Alert'), { status: 404 });
    return NextResponse.json(success(alert));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch alert';
    return NextResponse.json(error(msg), { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, message, message_vi, alert_type, severity, plot_id } = body;

    const existing = await db.alert.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound('Alert'), { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'acknowledged') {
        updateData.acknowledged_by = user.id;
        updateData.acknowledged_at = new Date();
      }
    }
    if (message !== undefined) updateData.message = message || null;
    if (message_vi !== undefined) updateData.message_vi = message_vi || null;
    if (alert_type) updateData.alert_type = alert_type;
    if (severity) updateData.severity = severity;
    if (plot_id !== undefined) updateData.plot_id = plot_id || null;

    const alert = await db.alert.update({ where: { id }, data: updateData });
    return NextResponse.json(success(alert));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update alert';
    return NextResponse.json(error(msg), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  try {
    const existing = await db.alert.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound('Alert'), { status: 404 });

    await db.alert.delete({ where: { id } });
    return NextResponse.json(success({ deleted: true }));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete alert';
    return NextResponse.json(error(msg), { status: 500 });
  }
}
