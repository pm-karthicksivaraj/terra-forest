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
  const task = await db.rangerTask.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, code: true } },
      plot: { select: { id: true, plot_code: true } },
      creator: { select: { id: true, name: true } },
      verifier: { select: { id: true, name: true } },
      proofs: { include: { uploader: { select: { id: true, name: true } } } },
    },
  });

  if (!task) return NextResponse.json(notFound('Task'), { status: 404 });
  return NextResponse.json(success(task));
}

export async function PUT(
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
    const { title, description, status, priority, assigned_to, team_id, due_date } = body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (team_id !== undefined) updateData.team_id = team_id;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;

    // Handle status transitions
    if (status === 'in_progress') {
      updateData.status = 'in_progress';
      updateData.started_at = new Date();
    } else if (status === 'completed') {
      updateData.status = 'completed';
      updateData.completed_at = new Date();
    } else if (status === 'verified') {
      updateData.status = 'verified';
      updateData.verified_by = user.id;
      updateData.verified_at = new Date();
    } else if (status) {
      updateData.status = status;
    }

    const updated = await db.rangerTask.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, code: true } },
        plot: { select: { id: true, plot_code: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(success(updated));
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { id } = await params;
  const task = await db.rangerTask.findUnique({ where: { id } });
  if (!task) return NextResponse.json(notFound('Task'), { status: 404 });

  await db.rangerTask.delete({ where: { id } });
  return NextResponse.json(success({ deleted: true }));
}
