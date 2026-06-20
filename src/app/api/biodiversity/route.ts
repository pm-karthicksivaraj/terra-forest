import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const plot_id = url.searchParams.get('plot_id');

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (plot_id) where.plot_id = plot_id;

  try {
    const records = await db.biodiversityRecord.findMany({
      where,
      include: { plot: { select: { plot_code: true } } },
      orderBy: { recorded_date: 'desc' },
      take: 100,
    });
    return NextResponse.json(success(records));
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromAuth(req.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });
  try {
    const body = await req.json();
    const { plot_id, category, species_name, species_name_vi, common_name, count, conservation_status, notes } = body;
    if (!plot_id || !category || !species_name) {
      return NextResponse.json(error('plot_id, category, and species_name are required'), { status: 400 });
    }

    const record = await db.biodiversityRecord.create({
      data: {
        plot_id,
        category,
        species_name,
        species_name_vi: species_name_vi || null,
        common_name: common_name || null,
        count: count || 0,
        conservation_status: conservation_status || null,
        notes: notes || null,
      },
    });
    return NextResponse.json(success(record), { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(error(e instanceof Error ? e.message : 'Error'), { status: 500 });
  }
}
