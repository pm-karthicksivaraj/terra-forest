import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  try {
    const teams = await db.rangerTeam.findMany({
      include: {
        leader: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true } } } },
        province: { select: { name_vi: true, name_en: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(success(teams));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  try {
    const body = await req.json();
    const { name, code, description, province_id, leader_id } = body;
    if (!name || !code) return NextResponse.json(error('name and code are required'), { status: 400 });

    const team = await db.rangerTeam.create({
      data: {
        name,
        code,
        description: description || null,
        province_id: province_id || null,
        leader_id: leader_id || user.id,
        status: 'active',
      },
    });
    return NextResponse.json(success(team), { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}
