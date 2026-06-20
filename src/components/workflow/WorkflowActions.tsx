'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, ArrowUpRight, XCircle, ShieldCheck, AlertTriangle,
  Truck, Flame, Clock, RotateCcw, ArrowUp, Search, PackageCheck, Ban,
} from 'lucide-react';
import {
  getAvailableTransitions,
  addWorkflowHistory,
  type WorkflowEntity,
  type UserRole,
  type WorkflowTransition,
} from '@/lib/workflow';

interface WorkflowActionsProps {
  entity: WorkflowEntity;
  entityId: string;
  currentStatus: string;
  userRole?: UserRole;
  onTransition?: (fromState: string, toState: string, action: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  ArrowUpRight: <ArrowUpRight className="w-4 h-4" />,
  XCircle: <XCircle className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  RotateCcw: <RotateCcw className="w-4 h-4" />,
  ArrowUp: <ArrowUp className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  PackageCheck: <PackageCheck className="w-4 h-4" />,
  Ban: <Ban className="w-4 h-4" />,
};

export default function WorkflowActions({
  entity,
  entityId,
  currentStatus,
  userRole = 'operations_manager',
  onTransition,
}: WorkflowActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<WorkflowTransition | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableTransitions = getAvailableTransitions(entity, currentStatus, userRole);

  const handleTransition = (transition: WorkflowTransition) => {
    if (transition.requiresComment && !comment.trim()) return;

    setIsProcessing(true);

    // Record the transition in workflow history
    addWorkflowHistory({
      entityType: entity,
      entityId,
      fromState: transition.from,
      toState: transition.to,
      action: transition.action,
      performedBy: 'Operations Manager Tran', // In production, use actual user
      performedByRole: userRole,
      comment: comment.trim() || undefined,
    });

    // Notify parent
    onTransition?.(transition.from, transition.to, transition.action);

    // Close dialog
    setConfirmDialog(null);
    setComment('');
    setIsProcessing(false);
  };

  if (availableTransitions.length === 0) {
    return (
      <Card className="shadow-sm border-0">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No workflow actions available for current state
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableTransitions.map(transition => (
            <Button
              key={transition.action}
              variant="outline"
              className="w-full justify-start text-xs h-9 gap-2 hover:bg-muted/80"
              style={{
                borderColor: transition.color,
                color: transition.color,
              }}
              onClick={() => {
                if (transition.requiresComment) {
                  setConfirmDialog(transition);
                } else {
                  setConfirmDialog(transition);
                }
              }}
            >
              {ICON_MAP[transition.icon] || <CheckCircle className="w-4 h-4" />}
              <div className="text-left">
                <span className="font-medium">{transition.label}</span>
                <span className="block text-[9px] text-muted-foreground font-normal">
                  {transition.description}
                </span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Transition Confirmation Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => { setConfirmDialog(null); setComment(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              {confirmDialog && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${confirmDialog.color}20` }}
                >
                  <span style={{ color: confirmDialog.color }}>
                    {ICON_MAP[confirmDialog.icon]}
                  </span>
                </div>
              )}
              {confirmDialog?.label}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {confirmDialog?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-[9px] h-4">
                {confirmDialog?.from}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge
                variant="outline"
                className="text-[9px] h-4"
                style={{ color: confirmDialog?.color, borderColor: confirmDialog?.color }}
              >
                {confirmDialog?.to}
              </Badge>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Comment {confirmDialog?.requiresComment ? '(required)' : '(optional)'}
              </label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={
                  confirmDialog?.requiresComment
                    ? 'Please provide a reason for this action...'
                    : 'Add optional notes...'
                }
                className="mt-1 text-xs"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => { setConfirmDialog(null); setComment(''); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              style={{
                backgroundColor: confirmDialog?.color,
                color: 'white',
              }}
              disabled={confirmDialog?.requiresComment ? !comment.trim() : false || isProcessing}
              onClick={() => confirmDialog && handleTransition(confirmDialog)}
            >
              {isProcessing ? 'Processing...' : `Confirm: ${confirmDialog?.label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
