import { NextResponse } from 'next/server';

export async function GET() {
  // Mock Keycloak redirect URL
  const redirectUrl = `https://keycloak.terraforest.vn/realms/terra-forest/protocol/openid-connect/auth?client_id=terra-forest-app&redirect_uri=${encodeURIComponent('https://terraforest.vn/auth/callback')}&response_type=code&scope=openid+profile+email`;

  return NextResponse.json({
    data: {
      redirect_url: redirectUrl,
    },
  });
}
