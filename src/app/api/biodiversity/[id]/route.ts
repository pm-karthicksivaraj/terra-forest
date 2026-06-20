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
  const record = await db.biodiversityRecord.findUnique({
    where: { id },
    include: {
      plot: { select: { id: true, plot_code: true } },
    },
  });

  if (!record) return NextResponse.json(notFound('Biodiversity record'), { status: 404 });
  return NextResponse.json(success(record));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const record = await db.biodiversityRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json(notFound('Biodiversity record'), { status: 404 });

  try {
    const body = await request.json();
    const { species_name, species_name_vi, common_name, count, conservation_status, notes, category } = body;

    const updateData: Record<string, any> = {};
    if (species_name !== undefined) updateData.species_name = species_name;
    if (species_name_vi !== undefined) updateData.species_name_vi = species_name_vi;
    if (common_name !== undefined) updateData.common_name = common_name;
    if (count !== undefined) updateData.count = count;
    if (conservation_status !== undefined) updateData.conservation_status = conservation_status;
    if (notes !== undefined) updateData.notes = notes;
    if (category !== undefined) updateData.category = category;

    const updated = await db.biodiversityRecord.update({
      where: { id },
      data: updateData,
      include: {
        plot: { select: { id: true, plot_code: true } },
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
  const record = await db.biodiversityRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json(notFound('Biodiversity record'), { status: 404 });

  await db.biodiversityRecord.delete({ where: { id } });
  return NextResponse.json(success({ deleted: true }));
}
