'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStateInfo, type WorkflowEntity } from '@/lib/workflow';

interface WorkflowStatusBadgeProps {
  entity: WorkflowEntity;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function WorkflowStatusBadge({
  entity,
  status,
  size = 'md',
  showIcon = true,
}: WorkflowStatusBadgeProps) {
  const stateInfo = getStateInfo(entity, status);

  const sizeClasses = {
    sm: 'text-[9px] h-4 px-1.5',
    md: 'text-[10px] h-5 px-2',
    lg: 'text-xs h-6 px-3',
  };

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} font-medium border-current`}
      style={{
        color: stateInfo.color,
        borderColor: stateInfo.color,
        backgroundColor: `${stateInfo.color}10`,
      }}
    >
      {stateInfo.label}
    </Badge>
  );
}
