import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, REPORTS, success } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { reportId } = await params;
  const report = REPORTS.find(r => r.id === parseInt(reportId));
  if (!report) return NextResponse.json({ message: 'Report not found' }, { status: 404 });

  return NextResponse.json(success({
    download_url: `/storage/reports/${report.id}/${report.name.replace(/\s+/g, '_')}.pdf`,
  }));
}
