'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageSquare } from 'lucide-react';
import { getWorkflow, getWorkflowHistory, type WorkflowEntity } from '@/lib/workflow';

interface WorkflowTimelineProps {
  entity: WorkflowEntity;
  entityId: string;
  currentStatus?: string;
}

export default function WorkflowTimeline({ entity, entityId, currentStatus }: WorkflowTimelineProps) {
  const workflow = getWorkflow(entity);
  const history = getWorkflowHistory(entity, entityId);

  // Build a complete timeline including state progression and history events
  const stateProgression = workflow.states.map((state, index) => {
    const currentIndex = workflow.states.findIndex(s => s.value === currentStatus);
    const isCompleted = currentIndex > index;
    const isCurrent = currentIndex === index;
    const isPending = currentIndex < index;

    return {
      ...state,
      isCompleted,
      isCurrent,
      isPending,
      index,
    };
  });

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Workflow Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* State Progression Bar */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {stateProgression.map((state, i) => (
            <React.Fragment key={state.value}>
              <div
                className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${
                  state.isCompleted
                    ? 'bg-forest-500 text-white'
                    : state.isCurrent
                    ? 'bg-forest-500/20 text-forest-700 ring-1 ring-forest-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {state.label}
              </div>
              {i < stateProgression.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    state.isCompleted ? 'bg-forest-500' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Detailed History */}
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry, i) => {
              const fromState = workflow.states.find(s => s.value === entry.fromState);
              const toState = workflow.states.find(s => s.value === entry.toState);
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                      style={{
                        backgroundColor: toState ? `${toState.color}20` : '#f5f5f5',
                        color: toState?.color || '#999',
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < history.length - 1 && (
                      <div className="w-0.5 h-6 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium">{toState?.label || entry.toState}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {fromState?.label || entry.fromState} → {toState?.label || entry.toState}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {entry.performedBy} ({entry.performedByRole.replace(/_/g, ' ')})
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        • {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.comment && (
                      <div className="flex items-start gap-1 mt-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-muted-foreground italic">
                          {entry.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No workflow transitions recorded yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
