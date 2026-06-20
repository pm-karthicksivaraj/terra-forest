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
  const device = await db.device.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!device) return NextResponse.json(notFound('Device'), { status: 404 });
  return NextResponse.json(success(device));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const device = await db.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json(notFound('Device'), { status: 404 });

  try {
    const body = await request.json();
    const { device_name, os_version, app_version, fcm_token, user_id, status } = body;

    const updateData: Record<string, any> = {};
    if (device_name !== undefined) updateData.device_name = device_name;
    if (os_version !== undefined) updateData.os_version = os_version;
    if (app_version !== undefined) updateData.app_version = app_version;
    if (fcm_token !== undefined) updateData.fcm_token = fcm_token;
    if (user_id !== undefined) updateData.user_id = user_id;
    if (status !== undefined) updateData.status = status;

    const updated = await db.device.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true } },
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
  const device = await db.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json(notFound('Device'), { status: 404 });

  await db.device.delete({ where: { id } });
  return NextResponse.json(success({ deleted: true }));
}
