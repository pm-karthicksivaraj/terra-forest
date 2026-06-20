import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  const role = searchParams.get('role');
  const provinceId = searchParams.get('province_id');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: Record<string, any> = {};
  if (status) where.is_active = status === 'active';
  if (provinceId) where.province_id = provinceId;
  if (role) where.roles = { some: { role: { name: role } } };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        mfa_enabled: true,
        last_login_at: true,
        created_at: true,
        province: { select: { id: true, name_en: true } },
        organization: { select: { id: true, name: true } },
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.user.count({ where }),
  ]);

  const formatted = users.map(u => ({
    ...u,
    roles: u.roles.map(ur => ({
      name: ur.role.name,
      permissions: ur.role.permissions.map(rp => rp.permission.name),
    })),
  }));

  return NextResponse.json(success(formatted, { total, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await request.json();
    const { name, email, password, organization_id, province_id, mfa_enabled, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(error('name, email, and password are required'), { status: 400 });
    }

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(error('Email already exists'), { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organization_id: organization_id || null,
        province_id: province_id || null,
        mfa_enabled: mfa_enabled || false,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        mfa_enabled: true,
        created_at: true,
        province: { select: { id: true, name_en: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    // Assign role if provided
    if (role) {
      const roleRecord = await db.role.findUnique({ where: { name: role } });
      if (roleRecord) {
        await db.userRole.create({
          data: { user_id: newUser.id, role_id: roleRecord.id },
        });
      }
    }

    return NextResponse.json(success(newUser), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
