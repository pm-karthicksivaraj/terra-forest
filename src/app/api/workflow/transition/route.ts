import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow, canPerformAction, addWorkflowHistory } from '@/lib/workflow';
import type { WorkflowEntity, UserRole } from '@/lib/workflow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, action, performedBy, performedByRole, comment } = body;

    if (!entityType || !entityId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, action' },
        { status: 400 }
      );
    }

    const validEntities: WorkflowEntity[] = [
      'alert', 'fire_incident', 'patrol', 'task',
      'carbon_record', 'timber_passport', 'biodiversity_record',
    ];

    if (!validEntities.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entity type: ${entityType}` },
        { status: 400 }
      );
    }

    const workflow = getWorkflow(entityType);
    // In production, current state would be fetched from the database
    // For now, we accept currentState from the request
    const currentState = body.currentState;
    if (!currentState) {
      return NextResponse.json(
        { error: 'Missing currentState' },
        { status: 400 }
      );
    }

    const role = (performedByRole || 'operations_manager') as UserRole;
    const allowed = canPerformAction(entityType, currentState, action, role);

    if (!allowed) {
      return NextResponse.json(
        { error: `Action "${action}" not allowed from state "${currentState}" for role "${role}"` },
        { status: 403 }
      );
    }

    const transition = workflow.transitions.find(
      t => t.from === currentState && t.action === action
    );

    if (!transition) {
      return NextResponse.json(
        { error: 'Transition not found' },
        { status: 404 }
      );
    }

    if (transition.requiresComment && !comment) {
      return NextResponse.json(
        { error: 'Comment is required for this transition' },
        { status: 400 }
      );
    }

    const historyEntry = addWorkflowHistory({
      entityType,
      entityId,
      fromState: currentState,
      toState: transition.to,
      action,
      performedBy: performedBy || 'System',
      performedByRole: role,
      comment,
    });

    return NextResponse.json({
      success: true,
      transition: {
        from: currentState,
        to: transition.to,
        action,
        label: transition.label,
      },
      historyEntry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
