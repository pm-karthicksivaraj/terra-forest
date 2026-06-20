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
  const found = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      is_active: true,
      mfa_enabled: true,
      avatar_url: true,
      last_login_at: true,
      created_at: true,
      updated_at: true,
      province: { select: { id: true, name_en: true } },
      organization: { select: { id: true, name: true } },
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
    },
  });

  if (!found) return NextResponse.json(notFound('User'), { status: 404 });

  const formatted = {
    ...found,
    roles: found.roles.map(ur => ({
      name: ur.role.name,
      permissions: ur.role.permissions.map(rp => rp.permission.name),
    })),
  };

  return NextResponse.json(success(formatted));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const found = await db.user.findUnique({ where: { id } });
  if (!found) return NextResponse.json(notFound('User'), { status: 404 });

  try {
    const body = await request.json();
    const { name, email, organization_id, province_id, mfa_enabled, is_active, role } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (organization_id !== undefined) updateData.organization_id = organization_id;
    if (province_id !== undefined) updateData.province_id = province_id;
    if (mfa_enabled !== undefined) updateData.mfa_enabled = mfa_enabled;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        mfa_enabled: true,
        province: { select: { id: true, name_en: true } },
        organization: { select: { id: true, name: true } },
        roles: { include: { role: { select: { name: true } } } },
      },
    });

    // Update role if provided
    if (role) {
      const roleRecord = await db.role.findUnique({ where: { name: role } });
      if (roleRecord) {
        // Remove existing roles
        await db.userRole.deleteMany({ where: { user_id: id } });
        // Assign new role
        await db.userRole.create({
          data: { user_id: id, role_id: roleRecord.id },
        });
      }
    }

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
  const found = await db.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } } },
  });
  if (!found) return NextResponse.json(notFound('User'), { status: 404 });

  // Prevent deleting admin users
  const isAdmin = found.roles.some(ur => ur.role.name === 'admin');
  if (isAdmin) {
    return NextResponse.json(error('Cannot delete admin user'), { status: 403 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json(success({ deleted: true }));
}
