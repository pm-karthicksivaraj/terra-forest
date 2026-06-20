import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized, notFound } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    const team = await db.rangerTeam.findUnique({
      where: { id },
      include: { leader: true, members: { include: { user: true } }, province: true, tasks: true },
    });
    if (!team) return NextResponse.json(notFound('Team'), { status: 404 });
    return NextResponse.json(success(team));
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
    const existing = await db.rangerTeam.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound('Team'), { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name;
    if (body.description) data.description = body.description;
    if (body.status) data.status = body.status;
    if (body.province_id) data.province_id = body.province_id;
    if (body.leader_id) data.leader_id = body.leader_id;

    const team = await db.rangerTeam.update({ where: { id }, data });
    return NextResponse.json(success(team));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    await db.rangerTeam.delete({ where: { id } });
    return NextResponse.json(success({ deleted: true }));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}
