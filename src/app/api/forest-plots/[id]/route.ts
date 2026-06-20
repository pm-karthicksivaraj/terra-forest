import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized, notFound } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const plot = await db.forestPlot.findUnique({
    where: { id },
    include: {
      province: { select: { id: true, name_en: true, code: true } },
      metadata: true,
      carbon_records: { take: 5, orderBy: { year: 'desc' } },
      alerts: { take: 5, orderBy: { detected_at: 'desc' } },
    },
  });

  if (!plot) return NextResponse.json(notFound('Plot'), { status: 404 });
  return NextResponse.json(success(plot));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const plot = await db.forestPlot.findUnique({ where: { id } });
  if (!plot) return NextResponse.json(notFound('Plot'), { status: 404 });

  try {
    const body = await request.json();
    const { plot_code, province_id, area_ha, forest_type, status, centroid_lat, centroid_lng, fire_risk, tree_count, dominant_species, geometry_json } = body;

    const updateData: Record<string, any> = {};
    if (plot_code !== undefined) updateData.plot_code = plot_code;
    if (province_id !== undefined) updateData.province_id = province_id;
    if (area_ha !== undefined) updateData.area_ha = area_ha;
    if (forest_type !== undefined) updateData.forest_type = forest_type;
    if (status !== undefined) updateData.status = status;
    if (centroid_lat !== undefined) updateData.centroid_lat = centroid_lat;
    if (centroid_lng !== undefined) updateData.centroid_lng = centroid_lng;
    if (fire_risk !== undefined) updateData.fire_risk = fire_risk;
    if (tree_count !== undefined) updateData.tree_count = tree_count;
    if (dominant_species !== undefined) updateData.dominant_species = dominant_species;
    if (geometry_json !== undefined) updateData.geometry_json = geometry_json;

    const updated = await db.forestPlot.update({
      where: { id },
      data: updateData,
      include: {
        province: { select: { id: true, name_en: true, code: true } },
      },
    });

    return NextResponse.json(success(updated));
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const plot = await db.forestPlot.findUnique({ where: { id } });
  if (!plot) return NextResponse.json(notFound('Plot'), { status: 404 });

  await db.forestPlot.delete({ where: { id } });
  return NextResponse.json(success({ deleted: true }));
}
