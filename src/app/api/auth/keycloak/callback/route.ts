import { NextRequest, NextResponse } from 'next/server';
import { USERS, tokenStore, generateToken, success } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code is required' },
        { status: 422 }
      );
    }

    // Mock: treat any Keycloak code as a government viewer login
    const entry = USERS['viewer@terraforest.vn'];
    if (!entry) {
      return NextResponse.json(
        { message: 'SSO authentication failed' },
        { status: 401 }
      );
    }

    // Check if MFA is required for this user
    const roleName = entry.user.roles?.[0]?.name;
    if (roleName === 'admin' || roleName === 'gov_viewer') {
      const mfaToken = 'mock_mfa_token_sso_' + Date.now();
      return NextResponse.json(success({
        mfa_required: true,
        mfa_token: mfaToken,
        sso: true,
      }));
    }

    const token = generateToken();
    tokenStore[token] = entry.user;

    return NextResponse.json(success({
      token,
      user: entry.user,
      sso: true,
    }));
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
