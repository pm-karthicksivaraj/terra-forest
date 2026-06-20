import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, generateToken, success, error } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Get user from the MFA token in Authorization header
    const user = await getUserFromAuth(request.headers.get('authorization'));
    if (!user) {
      return NextResponse.json(error('Invalid MFA token'), { status: 401 });
    }

    // Mock: accept any 6-digit code as valid
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(error('Invalid MFA code — must be 6 digits'), { status: 422 });
    }

    // Generate the real JWT token
    const token = generateToken(user.id, user.email);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return NextResponse.json(success({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    }));
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
