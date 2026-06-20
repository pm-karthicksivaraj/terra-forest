import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowHistory, getWorkflow, type WorkflowEntity } from '@/lib/workflow';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as WorkflowEntity;
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required parameters: entityType, entityId' },
        { status: 400 }
      );
    }

    const history = getWorkflowHistory(entityType, entityId);
    const workflow = getWorkflow(entityType);

    // Enrich history with state labels
    const enriched = history.map(entry => ({
      ...entry,
      fromStateLabel: workflow.states.find(s => s.value === entry.fromState)?.label || entry.fromState,
      toStateLabel: workflow.states.find(s => s.value === entry.toState)?.label || entry.toState,
    }));

    return NextResponse.json({
      entityType,
      entityId,
      workflow: workflow.label,
      totalTransitions: enriched.length,
      history: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
