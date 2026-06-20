import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, success } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id } = await params;
  const plot = PLOTS.find(p => p.id === parseInt(id));
  if (!plot) return NextResponse.json({ message: 'Plot not found' }, { status: 404 });

  // Return a mock GeoJSON polygon around the plot center
  const geo = {
    type: 'Polygon',
    coordinates: [[
      [plot.longitude - 0.01, plot.latitude - 0.01],
      [plot.longitude + 0.01, plot.latitude - 0.01],
      [plot.longitude + 0.01, plot.latitude + 0.01],
      [plot.longitude - 0.01, plot.latitude + 0.01],
      [plot.longitude - 0.01, plot.latitude - 0.01],
    ]],
  };

  return NextResponse.json(success(geo));
}
