import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    const observations = await db.fieldObservation.findMany({
      where: { patrol_id: id },
      orderBy: { recorded_at: 'desc' },
    });
    return NextResponse.json(success(observations));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const { obs_type, description, photo_url, latitude, longitude } = body;

    if (!obs_type) return NextResponse.json(error('obs_type is required'), { status: 400 });

    const observation = await db.fieldObservation.create({
      data: {
        patrol_id: id,
        obs_type,
        description: description || null,
        photo_url: photo_url || null,
        latitude: latitude ? parseFloat(String(latitude)) : null,
        longitude: longitude ? parseFloat(String(longitude)) : null,
      },
    });
    return NextResponse.json(success(observation), { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}
