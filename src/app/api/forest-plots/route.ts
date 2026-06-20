import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const forestType = searchParams.get('forest_type') || '';
  const status = searchParams.get('status') || '';
  const provinceId = searchParams.get('province_id') || '';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: Record<string, any> = {};
  if (forestType) where.forest_type = forestType;
  if (status) where.status = status;
  if (provinceId) where.province_id = provinceId;
  if (search) {
    where.OR = [
      { plot_code: { contains: search } },
      { dominant_species: { contains: search } },
    ];
  }

  const [plots, total] = await Promise.all([
    db.forestPlot.findMany({
      where,
      include: {
        province: { select: { id: true, name_en: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.forestPlot.count({ where }),
  ]);

  return NextResponse.json(success(plots, { total, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await request.json();
    const { plot_code, province_id, area_ha, forest_type, status, centroid_lat, centroid_lng, fire_risk, tree_count, dominant_species, geometry_json } = body;

    if (!plot_code || !province_id || !area_ha || !forest_type) {
      return NextResponse.json(error('plot_code, province_id, area_ha, and forest_type are required'), { status: 400 });
    }

    const existing = await db.forestPlot.findUnique({ where: { plot_code } });
    if (existing) {
      return NextResponse.json(error('Plot code already exists'), { status: 409 });
    }

    const plot = await db.forestPlot.create({
      data: {
        plot_code,
        province_id,
        area_ha,
        forest_type,
        status: status || 'active',
        centroid_lat: centroid_lat || null,
        centroid_lng: centroid_lng || null,
        fire_risk: fire_risk || 'low',
        tree_count: tree_count || null,
        dominant_species: dominant_species || null,
        geometry_json: geometry_json || null,
        created_by: user.id,
      },
      include: {
        province: { select: { id: true, name_en: true, code: true } },
      },
    });

    return NextResponse.json(success(plot), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
