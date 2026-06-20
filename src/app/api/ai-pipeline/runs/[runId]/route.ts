import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, success } from '@/lib/mock-data';
import { getPipelineRuns } from '@/lib/pipeline-store';

// Simulate pipeline progress based on elapsed time since started_at
function simulateProgress(run: NonNullable<ReturnType<typeof getPipelineRuns>[number]>) {
  if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
    return; // Don't modify final states
  }

  const startTime = new Date(run.started_at).getTime();
  const elapsed = Date.now() - startTime;

  // Each step takes ~8 seconds in simulation
  const stepDuration = 8000;
  const totalSteps = run.step_details.length;

  let currentStepIndex = -1;
  for (let i = 0; i < totalSteps; i++) {
    const stepStartTime = startTime + i * stepDuration;
    const stepElapsed = Date.now() - stepStartTime;

    if (stepElapsed < 0) {
      // Step hasn't started yet
      run.step_details[i].status = 'pending';
      run.step_details[i].progress = 0;
    } else if (stepElapsed < stepDuration) {
      // Step is in progress
      run.step_details[i].status = 'running';
      run.step_details[i].progress = Math.min(Math.round((stepElapsed / stepDuration) * 100), 99);
      run.step_details[i].started_at = new Date(stepStartTime).toISOString();
      currentStepIndex = i;
    } else {
      // Step is completed
      run.step_details[i].status = 'completed';
      run.step_details[i].progress = 100;
      run.step_details[i].started_at = new Date(stepStartTime).toISOString();
      run.step_details[i].completed_at = new Date(stepStartTime + stepDuration).toISOString();
    }
  }

  // Update overall run status
  if (currentStepIndex === -1 && elapsed > totalSteps * stepDuration) {
    run.status = 'completed';
    run.completed_at = new Date(startTime + totalSteps * stepDuration).toISOString();
  } else {
    run.status = 'running';
  }
}

export async function GET(
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

  // Simulate progress for active runs
  simulateProgress(run);

  // Return the run with step details mapped to `steps` for the frontend
  const responseData = {
    ...run,
    steps: run.step_details,
  };

  return NextResponse.json(success(responseData));
}
