import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id } = await params;
  const records = CARBON_RECORDS.filter(r => r.plot_id === parseInt(id));

  return NextResponse.json(success(records));
}
