import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const user = await getUserFromAuth(authHeader);

  if (!user) {
    return NextResponse.json(
      { message: 'Unauthenticated.' },
      { status: 401 }
    );
  }

  return NextResponse.json(success(user));
}
