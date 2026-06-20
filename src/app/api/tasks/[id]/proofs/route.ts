import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized, notFound } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const task = await db.rangerTask.findUnique({ where: { id } });
  if (!task) return NextResponse.json(notFound('Task'), { status: 404 });

  const proofs = await db.taskProof.findMany({
    where: { task_id: id },
    include: { uploader: { select: { id: true, name: true } } },
    orderBy: { recorded_at: 'desc' },
  });

  return NextResponse.json(success(proofs));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const task = await db.rangerTask.findUnique({ where: { id } });
  if (!task) return NextResponse.json(notFound('Task'), { status: 404 });

  try {
    const body = await request.json();
    const { proof_type, file_path, file_url, file_size, mime_type, description, latitude, longitude } = body;

    if (!proof_type || !file_path) {
      return NextResponse.json(error('proof_type and file_path are required'), { status: 400 });
    }

    const proof = await db.taskProof.create({
      data: {
        task_id: id,
        uploaded_by: user.id,
        proof_type,
        file_path,
        file_url: file_url || null,
        file_size: file_size || null,
        mime_type: mime_type || null,
        description: description || null,
        latitude: latitude || null,
        longitude: longitude || null,
        recorded_at: new Date(),
      },
      include: { uploader: { select: { id: true, name: true } } },
    });

    return NextResponse.json(success(proof), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
