import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuth, PLOTS, success } from '@/lib/mock-data';
import { getPipelineRuns, getNextRunId, type PipelineRun, type PipelineStep } from '@/lib/pipeline-store';

// GET - List pipeline runs
export async function GET(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const plotId = searchParams.get('plot_id');

  const runs = getPipelineRuns();
  let filtered = [...runs];
  if (plotId) {
    filtered = filtered.filter((r) => r.plot_id === Number(plotId));
  }

  // Map step_details to steps for frontend compatibility
  const mapped = filtered.map((run) => ({
    ...run,
    steps: run.step_details,
  }));

  return NextResponse.json(success(mapped));
}

// POST - Start a new pipeline run
export async function POST(request: NextRequest) {
  const user = getUserFromAuth(request.headers.get('authorization'));
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 });

  try {
    const body = await request.json();
    const plotId = body.plot_id;
    const steps = body.steps || ['boundary', 'crown', 'species'];
    const options = body.options || {};

    // Find plot code
    const plot = PLOTS.find((p) => p.id === Number(plotId));
    const plotCode = plot?.plot_code || `Plot #${plotId}`;

    // Create step details with initial status
    const stepDetails: PipelineStep[] = steps.map((stepKey: string) => {
      const names: Record<string, string> = {
        boundary: 'Boundary Detection',
        crown: 'Crown Detection',
        species: 'Species Classification',
      };
      return {
        name: names[stepKey] || stepKey,
        key: stepKey,
        status: 'pending',
        progress: 0,
        started_at: null as string | null,
        completed_at: null as string | null,
      };
    });

    const now = new Date().toISOString();
    const newRun: PipelineRun = {
      id: getNextRunId(),
      plot_id: Number(plotId),
      plot_code: plotCode,
      steps,
      step_details: stepDetails,
      status: 'running',
      confidence: options.confidence || 80,
      override: options.override || false,
      started_at: now,
      completed_at: null,
      created_at: now,
    };

    // Mark first step as running
    if (newRun.step_details.length > 0) {
      newRun.step_details[0].status = 'running';
      newRun.step_details[0].started_at = now;
      newRun.step_details[0].progress = 10;
    }

    const runs = getPipelineRuns();
    runs.unshift(newRun);

    // Return with steps mapped for frontend
    const responseData = {
      ...newRun,
      steps: newRun.step_details,
    };

    return NextResponse.json(success(responseData), { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
}
