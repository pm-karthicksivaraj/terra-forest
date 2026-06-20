import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized, notFound } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    const patrol = await db.patrol.findUnique({
      where: { id },
      include: { leader: true, members: { include: { user: true } }, observations: true, task_links: true },
    });
    if (!patrol) return NextResponse.json(notFound('Patrol'), { status: 404 });
    return NextResponse.json(success(patrol));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const existing = await db.patrol.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound('Patrol'), { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.title) data.title = body.title;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.plot_id !== undefined) data.plot_id = body.plot_id || null;
    if (body.leader_id) data.leader_id = body.leader_id;
    if (body.start_time) data.start_time = new Date(body.start_time);
    if (body.status) data.status = body.status;
    if (body.route_geojson) data.route_geojson = body.route_geojson;
    if (body.status === 'completed') data.end_time = new Date();

    const patrol = await db.patrol.update({ where: { id }, data });
    return NextResponse.json(success(patrol));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    await db.patrol.delete({ where: { id } });
    return NextResponse.json(success({ deleted: true }));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}
