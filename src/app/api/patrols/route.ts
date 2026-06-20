import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  try {
    const patrols = await db.patrol.findMany({
      where,
      include: {
        leader: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        observations: { take: 10, orderBy: { recorded_at: 'desc' } },
      },
      orderBy: { start_time: 'desc' },
      take: 50,
    });
    return NextResponse.json(success(patrols));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch patrols';
    return NextResponse.json(error(msg), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await req.json();
    const { title, description, plot_id, start_time } = body;

    if (!title) return NextResponse.json(error('title is required'), { status: 400 });

    const patrol = await db.patrol.create({
      data: {
        title,
        description: description || null,
        leader_id: user.id,
        plot_id: plot_id || null,
        start_time: start_time ? new Date(start_time) : new Date(),
        status: 'planned',
      },
    });

    return NextResponse.json(success(patrol), { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create patrol';
    return NextResponse.json(error(msg), { status: 500 });
  }
}
