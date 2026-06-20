import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, success, error } from '@/lib/auth';
import { compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(error('Email and password are required'), { status: 422 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        },
      },
    });

    if (!user || !user.is_active) {
      return NextResponse.json(error('Invalid credentials'), { status: 401 });
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(error('Invalid credentials'), { status: 401 });
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    const roles = user.roles.map(ur => ({
      name: ur.role.name,
      permissions: ur.role.permissions.map(rp => rp.permission.name),
    }));

    // Check if MFA is required
    if (user.mfa_enabled) {
      const mfaToken = generateToken(user.id, `mfa:${user.email}`);
      return NextResponse.json(success({
        mfa_required: true,
        mfa_token: mfaToken,
        user_id: user.id,
      }));
    }

    return NextResponse.json(success({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
      },
    }));
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
