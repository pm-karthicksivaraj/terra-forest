import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, CARBON_RECORDS, success } from '@/lib/mock-data';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { recordId } = await params;
  const record = CARBON_RECORDS.find(r => r.id === parseInt(recordId));

  if (!record) {
    return NextResponse.json({ message: 'Carbon record not found' }, { status: 404 });
  }

  record.status = 'verified';
  record.verified_at = new Date().toISOString();

  return NextResponse.json(success(record));
}
