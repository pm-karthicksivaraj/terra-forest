import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, AI_ASSESSMENTS } from '@/lib/mock-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { id } = await params;
  const assessment = AI_ASSESSMENTS.find(a => a.id === parseInt(id));
  if (!assessment) return NextResponse.json({ message: 'Assessment not found' }, { status: 404 });

  assessment.status = 'rejected';
  return NextResponse.json({ success: true });
}
