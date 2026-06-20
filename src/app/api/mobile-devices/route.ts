import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const userId = searchParams.get('user_id');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (platform) where.platform = platform;
  if (userId) where.user_id = userId;

  const [devices, total] = await Promise.all([
    db.device.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { registered_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.device.count({ where }),
  ]);

  return NextResponse.json(success(devices, { total, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await request.json();
    const { device_uuid, device_name, platform, os_version, app_version, fcm_token, user_id, status } = body;

    if (!device_uuid || !platform) {
      return NextResponse.json(error('device_uuid and platform are required'), { status: 400 });
    }

    // Check UUID uniqueness
    const existing = await db.device.findUnique({ where: { device_uuid } });
    if (existing) {
      return NextResponse.json(error('Device with this UUID already exists'), { status: 409 });
    }

    const device = await db.device.create({
      data: {
        device_uuid,
        device_name: device_name || null,
        platform,
        os_version: os_version || null,
        app_version: app_version || null,
        fcm_token: fcm_token || null,
        user_id: user_id || null,
        status: status || 'active',
        registered_at: new Date(),
        last_active_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(success(device), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
