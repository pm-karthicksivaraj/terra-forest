import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, AI_ASSESSMENTS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  let filtered = [...AI_ASSESSMENTS];
  if (status) filtered = filtered.filter(a => a.status === status);

  return NextResponse.json(success(filtered, { total: filtered.length }));
}
