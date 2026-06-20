import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/mock-data';
import { getPipelineRuns } from '@/lib/pipeline-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { runId } = await params;
  const runs = getPipelineRuns();
  const run = runs.find((r) => r.id === Number(runId));

  if (!run) {
    return NextResponse.json({ message: 'Pipeline run not found' }, { status: 404 });
  }

  if (run.status !== 'running' && run.status !== 'queued') {
    return NextResponse.json(
      { message: 'Cannot cancel a run that is not running or queued' },
      { status: 400 }
    );
  }

  run.status = 'cancelled';
  run.completed_at = new Date().toISOString();

  // Mark any running steps as cancelled/failed
  for (const step of run.step_details) {
    if (step.status === 'running') {
      step.status = 'failed';
      step.completed_at = new Date().toISOString();
    }
  }

  return NextResponse.json(success({ id: run.id, status: 'cancelled' }));
}
