import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, success } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const bounds = {
    north: Math.max(...PLOTS.map(p => p.latitude)) + 0.05,
    south: Math.min(...PLOTS.map(p => p.latitude)) - 0.05,
    east: Math.max(...PLOTS.map(p => p.longitude)) + 0.05,
    west: Math.min(...PLOTS.map(p => p.longitude)) - 0.05,
  };

  return NextResponse.json(success(bounds));
}
