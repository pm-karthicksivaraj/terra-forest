import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success, error, unauthorized } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const taskType = searchParams.get('task_type');
  const priority = searchParams.get('priority');
  const assignedTo = searchParams.get('assigned_to');
  const teamId = searchParams.get('team_id');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (taskType) where.task_type = taskType;
  if (priority) where.priority = priority;
  if (assignedTo) where.assigned_to = assignedTo;
  if (teamId) where.team_id = teamId;

  const [tasks, total] = await Promise.all([
    db.rangerTask.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, code: true } },
        plot: { select: { id: true, plot_code: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { proofs: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.rangerTask.count({ where }),
  ]);

  return NextResponse.json(success(tasks, { total, limit, offset }));
}

export async function POST(request: NextRequest) {
  const user = await getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json(unauthorized(), { status: 401 });

  try {
    const body = await request.json();
    const { title, description, team_id, assigned_to, plot_id, task_type, priority, due_date } = body;

    if (!title || !task_type) {
      return NextResponse.json(error('title and task_type are required'), { status: 400 });
    }

    const task = await db.rangerTask.create({
      data: {
        title,
        description: description || null,
        team_id: team_id || null,
        assigned_to: assigned_to || null,
        plot_id: plot_id || null,
        task_type,
        priority: priority || 'medium',
        status: 'assigned',
        due_date: due_date ? new Date(due_date) : null,
        created_by: user.id,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, code: true } },
        plot: { select: { id: true, plot_code: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(success(task), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(error(e.message || 'Invalid request body'), { status: 400 });
  }
}
