import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, REPORTS, success } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  try {
    const body = await request.json();
    const newReport = {
      id: REPORTS.length + 1,
      name: `${(body.report_type || 'full').charAt(0).toUpperCase() + (body.report_type || 'full').slice(1)} Report - ${new Date().toLocaleDateString()}`,
      report_type: body.report_type || 'full',
      status: 'pending',
      size_mb: 0,
      created_by: { name: user.name },
      created_at: new Date().toISOString(),
    };
    REPORTS.push(newReport as any);
    return NextResponse.json(success(newReport), { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}
