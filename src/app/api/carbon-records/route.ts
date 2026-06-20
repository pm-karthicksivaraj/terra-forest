import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const plotId = searchParams.get('plot_id') || '';

  let filtered = [...CARBON_RECORDS];
  if (status) filtered = filtered.filter(r => r.status === status);
  if (plotId) filtered = filtered.filter(r => r.plot_id === parseInt(plotId));

  return NextResponse.json(success(filtered));
}
