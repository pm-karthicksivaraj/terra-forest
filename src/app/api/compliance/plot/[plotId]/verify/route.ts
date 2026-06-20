import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, success } from '@/lib/mock-data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ plotId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { plotId } = await params;
  const plot = PLOTS.find(p => p.id === parseInt(plotId));
  if (!plot) return NextResponse.json({ message: 'Plot not found' }, { status: 404 });

  return NextResponse.json(success({
    plot_code: plot.plot_code,
    verified_by: user.name,
    verified_at: new Date().toISOString(),
    status: 'compliant',
  }));
}
