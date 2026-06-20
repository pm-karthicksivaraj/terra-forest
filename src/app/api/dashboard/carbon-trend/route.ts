import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  return NextResponse.json(success({
    labels: ['2020', '2021', '2022', '2023', '2024'],
    data: [68000, 72500, 78200, 85600, 92700],
  }));
}
