// Terra Forest — Workflow Engine
// Defines state machines, transitions, and role-based permissions for all entity workflows

export type WorkflowEntity =
  | 'alert'
  | 'fire_incident'
  | 'patrol'
  | 'task'
  | 'carbon_record'
  | 'timber_passport'
  | 'biodiversity_record';

export type UserRole =
  | 'system_admin'
  | 'operations_manager'
  | 'team_lead'
  | 'ranger'
  | 'auditor';

export interface WorkflowTransition {
  from: string;
  to: string;
  action: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  allowedRoles: UserRole[];
  requiresComment: boolean;
}

export interface WorkflowDefinition {
  entity: WorkflowEntity;
  label: string;
  states: { value: string; label: string; color: string; icon: string; description: string }[];
  transitions: WorkflowTransition[];
  initialState: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  entityType: WorkflowEntity;
  entityId: string;
  fromState: string;
  toState: string;
  action: string;
  performedBy: string;
  performedByRole: UserRole;
  comment?: string;
  timestamp: string;
}

// ─── ALERT WORKFLOW ─────────────────────────────────────────────
export const ALERT_WORKFLOW: WorkflowDefinition = {
  entity: 'alert',
  label: 'Alert & Incident',
  initialState: 'new',
  states: [
    { value: 'new', label: 'New', color: '#D32F2F', icon: 'AlertTriangle', description: 'Alert detected by automated system or manual report. Awaiting triage.' },
    { value: 'acknowledged', label: 'Acknowledged', color: '#E65100', icon: 'CheckCircle', description: 'Operations team has reviewed and confirmed the alert validity.' },
    { value: 'in_field', label: 'In Field', color: '#0277BD', icon: 'ArrowUpRight', description: 'Ranger team dispatched for ground verification and evidence collection.' },
    { value: 'resolved', label: 'Resolved', color: '#2D6A4F', icon: 'CircleCheck', description: 'Incident resolved, evidence archived, closure report filed.' },
    { value: 'escalated', label: 'Escalated', color: '#7B1FA2', icon: 'ArrowUp', description: 'Incident escalated to provincial authority for enforcement action.' },
    { value: 'false_alarm', label: 'False Alarm', color: '#9E9E9E', icon: 'XCircle', description: 'Alert determined to be a false positive after investigation.' },
  ],
  transitions: [
    { from: 'new', to: 'acknowledged', action: 'acknowledge', label: 'Acknowledge', description: 'Confirm alert validity and assign to response team', icon: 'CheckCircle', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: false },
    { from: 'new', to: 'false_alarm', action: 'dismiss', label: 'Dismiss as False Alarm', description: 'Mark alert as false positive after review', icon: 'XCircle', color: '#9E9E9E', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
    { from: 'acknowledged', to: 'in_field', action: 'dispatch', label: 'Dispatch to Field', description: 'Send ranger team for ground verification', icon: 'ArrowUpRight', color: '#0277BD', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: false },
    { from: 'acknowledged', to: 'escalated', action: 'escalate', label: 'Escalate', description: 'Escalate to provincial authority for enforcement', icon: 'ArrowUp', color: '#7B1FA2', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
    { from: 'acknowledged', to: 'false_alarm', action: 'dismiss', label: 'Dismiss as False Alarm', description: 'Alert determined to be false positive', icon: 'XCircle', color: '#9E9E9E', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
    { from: 'in_field', to: 'resolved', action: 'resolve', label: 'Resolve', description: 'Mark incident as resolved with closure report', icon: 'CircleCheck', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: false },
    { from: 'in_field', to: 'escalated', action: 'escalate', label: 'Escalate', description: 'Escalate for enforcement action', icon: 'ArrowUp', color: '#7B1FA2', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: true },
    { from: 'escalated', to: 'resolved', action: 'resolve', label: 'Resolve', description: 'Incident resolved after enforcement action', icon: 'CircleCheck', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: false },
    { from: 'resolved', to: 'in_field', action: 'reopen', label: 'Reopen', description: 'Reopen resolved incident for further investigation', icon: 'RotateCcw', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── FIRE INCIDENT WORKFLOW ─────────────────────────────────────
export const FIRE_INCIDENT_WORKFLOW: WorkflowDefinition = {
  entity: 'fire_incident',
  label: 'Fire Incident',
  initialState: 'detected',
  states: [
    { value: 'detected', label: 'Detected', color: '#D32F2F', icon: 'Flame', description: 'Fire detected by satellite thermal sensor (VIIRS) or ground report.' },
    { value: 'alerted', label: 'Alerted', color: '#E65100', icon: 'AlertTriangle', description: 'Alert dispatched to Operations Center and response team.' },
    { value: 'dispatched', label: 'Dispatched', color: '#FF8A65', icon: 'Truck', description: 'Fire suppression crew dispatched to incident location.' },
    { value: 'contained', label: 'Contained', color: '#FFD600', icon: 'Shield', description: 'Fire perimeter secured. Mop-up operations ongoing.' },
    { value: 'closed', label: 'Closed', color: '#2D6A4F', icon: 'CircleCheck', description: 'Fire fully extinguished. Damage assessment and report completed.' },
  ],
  transitions: [
    { from: 'detected', to: 'alerted', action: 'alert', label: 'Issue Alert', description: 'Dispatch fire alert to operations center and response teams', icon: 'AlertTriangle', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager', 'ranger'], requiresComment: false },
    { from: 'alerted', to: 'dispatched', action: 'dispatch', label: 'Dispatch Crew', description: 'Send fire suppression crew to incident location', icon: 'Truck', color: '#FF8A65', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: false },
    { from: 'dispatched', to: 'contained', action: 'contain', label: 'Mark Contained', description: 'Fire perimeter secured, containment achieved', icon: 'Shield', color: '#FFD600', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'ranger'], requiresComment: false },
    { from: 'contained', to: 'closed', action: 'close', label: 'Close Incident', description: 'Fire fully extinguished. File damage assessment report.', icon: 'CircleCheck', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: true },
    { from: 'alerted', to: 'detected', action: 'downgrade', label: 'Downgrade', description: 'Alert downgraded after verification — no active fire', icon: 'ArrowDown', color: '#9E9E9E', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── PATROL WORKFLOW ─────────────────────────────────────────────
export const PATROL_WORKFLOW: WorkflowDefinition = {
  entity: 'patrol',
  label: 'Patrol',
  initialState: 'planned',
  states: [
    { value: 'planned', label: 'Planned', color: '#795548', icon: 'Calendar', description: 'Patrol scheduled with assigned team, plot, and objectives.' },
    { value: 'in_progress', label: 'In Progress', color: '#E65100', icon: 'Footprints', description: 'Patrol team has checked in and is actively executing route.' },
    { value: 'completed', label: 'Completed', color: '#2D6A4F', icon: 'CheckCircle', description: 'Patrol finished. All observations and evidence uploaded.' },
    { value: 'reviewed', label: 'Reviewed', color: '#40916C', icon: 'ShieldCheck', description: 'Supervisor has reviewed patrol findings and evidence.' },
    { value: 'cancelled', label: 'Cancelled', color: '#9E9E9E', icon: 'XCircle', description: 'Patrol cancelled due to weather, safety, or operational reasons.' },
  ],
  transitions: [
    { from: 'planned', to: 'in_progress', action: 'start', label: 'Start Patrol', description: 'Team lead checks in and begins patrol', icon: 'Footprints', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: false },
    { from: 'planned', to: 'cancelled', action: 'cancel', label: 'Cancel Patrol', description: 'Cancel planned patrol', icon: 'XCircle', color: '#9E9E9E', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: true },
    { from: 'in_progress', to: 'completed', action: 'complete', label: 'Complete Patrol', description: 'Mark patrol as completed with all observations uploaded', icon: 'CheckCircle', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'ranger'], requiresComment: false },
    { from: 'completed', to: 'reviewed', action: 'review', label: 'Review & Approve', description: 'Supervisor reviews patrol findings and approves', icon: 'ShieldCheck', color: '#40916C', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: false },
    { from: 'reviewed', to: 'completed', action: 'request_revision', label: 'Request Revision', description: 'Send patrol back for additional evidence or clarification', icon: 'RotateCcw', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── TASK WORKFLOW ──────────────────────────────────────────────
export const TASK_WORKFLOW: WorkflowDefinition = {
  entity: 'task',
  label: 'Ranger Task',
  initialState: 'assigned',
  states: [
    { value: 'assigned', label: 'Assigned', color: '#0277BD', icon: 'UserCheck', description: 'Task created and assigned to ranger or team.' },
    { value: 'in_progress', label: 'In Progress', color: '#E65100', icon: 'Clock', description: 'Ranger has accepted and is working on the task.' },
    { value: 'completed', label: 'Completed', color: '#2D6A4F', icon: 'CheckCircle', description: 'Task completed with proof of evidence uploaded.' },
    { value: 'verified', label: 'Verified', color: '#40916C', icon: 'ShieldCheck', description: 'Task output verified by supervisor or auditor.' },
    { value: 'failed', label: 'Failed', color: '#D32F2F', icon: 'XCircle', description: 'Task could not be completed. Documented with reason.' },
    { value: 'cancelled', label: 'Cancelled', color: '#9E9E9E', icon: 'Ban', description: 'Task cancelled before completion.' },
  ],
  transitions: [
    { from: 'assigned', to: 'in_progress', action: 'start', label: 'Start Task', description: 'Ranger accepts and begins task execution', icon: 'Clock', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'ranger'], requiresComment: false },
    { from: 'assigned', to: 'cancelled', action: 'cancel', label: 'Cancel Task', description: 'Cancel task assignment', icon: 'Ban', color: '#9E9E9E', allowedRoles: ['system_admin', 'operations_manager', 'team_lead'], requiresComment: true },
    { from: 'in_progress', to: 'completed', action: 'complete', label: 'Complete Task', description: 'Mark task as completed with evidence', icon: 'CheckCircle', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'ranger'], requiresComment: false },
    { from: 'in_progress', to: 'failed', action: 'fail', label: 'Mark as Failed', description: 'Task cannot be completed — document reason', icon: 'XCircle', color: '#D32F2F', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'ranger'], requiresComment: true },
    { from: 'completed', to: 'verified', action: 'verify', label: 'Verify', description: 'Verify task output and evidence quality', icon: 'ShieldCheck', color: '#40916C', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'auditor'], requiresComment: false },
    { from: 'completed', to: 'in_progress', action: 'reopen', label: 'Reopen', description: 'Send task back for additional work', icon: 'RotateCcw', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'auditor'], requiresComment: true },
    { from: 'verified', to: 'completed', action: 'reject_verification', label: 'Reject Verification', description: 'Reject previously verified task', icon: 'XCircle', color: '#D32F2F', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── CARBON RECORD WORKFLOW ─────────────────────────────────────
export const CARBON_RECORD_WORKFLOW: WorkflowDefinition = {
  entity: 'carbon_record',
  label: 'Carbon Record',
  initialState: 'pending',
  states: [
    { value: 'pending', label: 'Pending', color: '#795548', icon: 'Clock', description: 'Carbon record created, awaiting internal review.' },
    { value: 'under_review', label: 'Under Review', color: '#0277BD', icon: 'Search', description: 'Internal QA/QC review in progress.' },
    { value: 'approved', label: 'Approved', color: '#2D6A4F', icon: 'CheckCircle', description: 'Record approved by internal review. Ready for third-party verification.' },
    { value: 'verified', label: 'Verified', color: '#40916C', icon: 'ShieldCheck', description: 'Third-party verification completed successfully.' },
    { value: 'rejected', label: 'Rejected', color: '#D32F2F', icon: 'XCircle', description: 'Record rejected due to data quality or compliance issues.' },
  ],
  transitions: [
    { from: 'pending', to: 'under_review', action: 'start_review', label: 'Start Review', description: 'Begin internal QA/QC review of carbon record', icon: 'Search', color: '#0277BD', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: false },
    { from: 'under_review', to: 'approved', action: 'approve', label: 'Approve', description: 'Approve record after internal review', icon: 'CheckCircle', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: false },
    { from: 'under_review', to: 'rejected', action: 'reject', label: 'Reject', description: 'Reject record due to data quality issues', icon: 'XCircle', color: '#D32F2F', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: true },
    { from: 'approved', to: 'verified', action: 'verify', label: 'Third-Party Verify', description: 'Third-party auditor verifies carbon record', icon: 'ShieldCheck', color: '#40916C', allowedRoles: ['system_admin', 'auditor'], requiresComment: false },
    { from: 'rejected', to: 'pending', action: 'resubmit', label: 'Resubmit', description: 'Resubmit corrected record for review', icon: 'RotateCcw', color: '#795548', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── TIMBER PASSPORT WORKFLOW ───────────────────────────────────
export const TIMBER_PASSPORT_WORKFLOW: WorkflowDefinition = {
  entity: 'timber_passport',
  label: 'Timber Passport',
  initialState: 'pending',
  states: [
    { value: 'pending', label: 'Pending Verification', color: '#795548', icon: 'Clock', description: 'Timber passport created, awaiting VPA/FLEGT due diligence.' },
    { value: 'verified', label: 'Verified', color: '#2D6A4F', icon: 'ShieldCheck', description: 'VPA/FLEGT due diligence passed. Passport verified.' },
    { value: 'rejected', label: 'Rejected', color: '#D32F2F', icon: 'XCircle', description: 'VPA/FLEGT verification failed. Timber batch not compliant.' },
    { value: 'in_transit', label: 'In Transit', color: '#0277BD', icon: 'Truck', description: 'Verified timber shipped with GPS tracking active.' },
    { value: 'delivered', label: 'Delivered', color: '#52B788', icon: 'PackageCheck', description: 'Shipment delivered. Chain of custody complete.' },
  ],
  transitions: [
    { from: 'pending', to: 'verified', action: 'verify', label: 'Verify Passport', description: 'Complete VPA/FLEGT due diligence and verify passport', icon: 'ShieldCheck', color: '#2D6A4F', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: false },
    { from: 'pending', to: 'rejected', action: 'reject', label: 'Reject Passport', description: 'VPA/FLEGT verification failed', icon: 'XCircle', color: '#D32F2F', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: true },
    { from: 'verified', to: 'in_transit', action: 'ship', label: 'Mark Shipped', description: 'Timber dispatched with GPS tracking', icon: 'Truck', color: '#0277BD', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: false },
    { from: 'in_transit', to: 'delivered', action: 'deliver', label: 'Confirm Delivery', description: 'Confirm delivery at destination', icon: 'PackageCheck', color: '#52B788', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: false },
    { from: 'rejected', to: 'pending', action: 'resubmit', label: 'Resubmit', description: 'Resubmit timber passport after corrective action', icon: 'RotateCcw', color: '#795548', allowedRoles: ['system_admin', 'operations_manager'], requiresComment: true },
  ],
};

// ─── WORKFLOW REGISTRY ──────────────────────────────────────────
export const WORKFLOW_REGISTRY: Record<WorkflowEntity, WorkflowDefinition> = {
  alert: ALERT_WORKFLOW,
  fire_incident: FIRE_INCIDENT_WORKFLOW,
  patrol: PATROL_WORKFLOW,
  task: TASK_WORKFLOW,
  carbon_record: CARBON_RECORD_WORKFLOW,
  timber_passport: TIMBER_PASSPORT_WORKFLOW,
  biodiversity_record: {
    entity: 'biodiversity_record',
    label: 'Biodiversity Record',
    initialState: 'recorded',
    states: [
      { value: 'recorded', label: 'Recorded', color: '#2D6A4F', icon: 'Leaf', description: 'Biodiversity observation recorded during field survey.' },
      { value: 'verified', label: 'Verified', color: '#40916C', icon: 'ShieldCheck', description: 'Species identification and count verified by expert.' },
      { value: 'flagged', label: 'Flagged', color: '#E65100', icon: 'AlertTriangle', description: 'Record flagged for review — possible misidentification.' },
    ],
    transitions: [
      { from: 'recorded', to: 'verified', action: 'verify', label: 'Verify Species', description: 'Expert confirms species identification and count', icon: 'ShieldCheck', color: '#40916C', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: false },
      { from: 'recorded', to: 'flagged', action: 'flag', label: 'Flag for Review', description: 'Flag record for potential misidentification', icon: 'AlertTriangle', color: '#E65100', allowedRoles: ['system_admin', 'operations_manager', 'team_lead', 'auditor'], requiresComment: true },
      { from: 'flagged', to: 'verified', action: 'verify', label: 'Verify After Review', description: 'Verify after correcting identification', icon: 'ShieldCheck', color: '#40916C', allowedRoles: ['system_admin', 'operations_manager', 'auditor'], requiresComment: false },
      { from: 'verified', to: 'flagged', action: 'flag', label: 'Flag for Re-review', description: 'Flag verified record for re-examination', icon: 'AlertTriangle', color: '#E65100', allowedRoles: ['system_admin', 'auditor'], requiresComment: true },
    ],
  },
};

// ─── HELPER FUNCTIONS ───────────────────────────────────────────

export function getWorkflow(entity: WorkflowEntity): WorkflowDefinition {
  return WORKFLOW_REGISTRY[entity];
}

export function getStateInfo(entity: WorkflowEntity, stateValue: string) {
  const workflow = WORKFLOW_REGISTRY[entity];
  return workflow.states.find(s => s.value === stateValue) || workflow.states[0];
}

export function getAvailableTransitions(
  entity: WorkflowEntity,
  currentState: string,
  userRole: UserRole
): WorkflowTransition[] {
  const workflow = WORKFLOW_REGISTRY[entity];
  return workflow.transitions.filter(
    t => t.from === currentState && t.allowedRoles.includes(userRole)
  );
}

export function canPerformAction(
  entity: WorkflowEntity,
  currentState: string,
  action: string,
  userRole: UserRole
): boolean {
  const workflow = WORKFLOW_REGISTRY[entity];
  const transition = workflow.transitions.find(
    t => t.from === currentState && t.action === action
  );
  return !!transition && transition.allowedRoles.includes(userRole);
}

export function getNextStates(
  entity: WorkflowEntity,
  currentState: string,
  userRole: UserRole
): string[] {
  return getAvailableTransitions(entity, currentState, userRole).map(t => t.to);
}

// Mock workflow history store (in production, this would be the AuditLog table)
const workflowHistoryStore: WorkflowHistoryEntry[] = [];

export function addWorkflowHistory(entry: Omit<WorkflowHistoryEntry, 'id' | 'timestamp'>): WorkflowHistoryEntry {
  const newEntry: WorkflowHistoryEntry = {
    ...entry,
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  workflowHistoryStore.push(newEntry);
  return newEntry;
}

export function getWorkflowHistory(entityType: WorkflowEntity, entityId: string): WorkflowHistoryEntry[] {
  return workflowHistoryStore.filter(
    h => h.entityType === entityType && h.entityId === entityId
  );
}

// Seed initial mock history for demo data
function seedWorkflowHistory() {
  const now = new Date();

  // Alert #1: new → acknowledged (still at acknowledged)
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '1',
    fromState: 'new',
    toState: 'acknowledged',
    action: 'acknowledge',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
    comment: 'Confirmed deforestation signal via Sentinel-2 analysis. Assigning to Team Alpha.',
  });

  // Alert #2: new → acknowledged → in_field
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '2',
    fromState: 'new',
    toState: 'acknowledged',
    action: 'acknowledge',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
  });
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '2',
    fromState: 'acknowledged',
    toState: 'in_field',
    action: 'dispatch',
    performedBy: 'Team Lead Nguyen',
    performedByRole: 'team_lead',
    comment: 'Team Bravo dispatched for ground verification. ETA 45 min.',
  });

  // Alert #7: full lifecycle new → acknowledged → in_field → resolved
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '7',
    fromState: 'new',
    toState: 'acknowledged',
    action: 'acknowledge',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
  });
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '7',
    fromState: 'acknowledged',
    toState: 'in_field',
    action: 'dispatch',
    performedBy: 'Team Lead Nguyen',
    performedByRole: 'team_lead',
  });
  addWorkflowHistory({
    entityType: 'alert',
    entityId: '7',
    fromState: 'in_field',
    toState: 'resolved',
    action: 'resolve',
    performedBy: 'Team Lead Nguyen',
    performedByRole: 'team_lead',
    comment: 'Erosion event stabilized. Recovery measures recommended for next planting season.',
  });

  // Patrol #1: planned → in_progress → completed → reviewed
  addWorkflowHistory({
    entityType: 'patrol',
    entityId: '1',
    fromState: 'planned',
    toState: 'in_progress',
    action: 'start',
    performedBy: 'Team Lead Nguyen',
    performedByRole: 'team_lead',
    comment: 'Team checked in at Bu Gia Map station. Devices validated. Starting patrol.',
  });
  addWorkflowHistory({
    entityType: 'patrol',
    entityId: '1',
    fromState: 'in_progress',
    toState: 'completed',
    action: 'complete',
    performedBy: 'Team Lead Nguyen',
    performedByRole: 'team_lead',
  });
  addWorkflowHistory({
    entityType: 'patrol',
    entityId: '1',
    fromState: 'completed',
    toState: 'reviewed',
    action: 'review',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
    comment: 'All observations verified. 3 illegal logging incidents escalated to Alerts module.',
  });

  // Fire #3: detected → alerted → dispatched → contained
  addWorkflowHistory({
    entityType: 'fire_incident',
    entityId: '3',
    fromState: 'detected',
    toState: 'alerted',
    action: 'alert',
    performedBy: 'AI Detection Pipeline',
    performedByRole: 'system_admin',
  });
  addWorkflowHistory({
    entityType: 'fire_incident',
    entityId: '3',
    fromState: 'alerted',
    toState: 'dispatched',
    action: 'dispatch',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
  });
  addWorkflowHistory({
    entityType: 'fire_incident',
    entityId: '3',
    fromState: 'dispatched',
    toState: 'contained',
    action: 'contain',
    performedBy: 'Team Lead Vo',
    performedByRole: 'team_lead',
    comment: 'Fire perimeter secured at 80% containment. Mop-up operations ongoing.',
  });

  // Carbon Record: pending → under_review → approved
  addWorkflowHistory({
    entityType: 'carbon_record',
    entityId: '1',
    fromState: 'pending',
    toState: 'under_review',
    action: 'start_review',
    performedBy: 'Auditor Le',
    performedByRole: 'auditor',
  });
  addWorkflowHistory({
    entityType: 'carbon_record',
    entityId: '1',
    fromState: 'under_review',
    toState: 'approved',
    action: 'approve',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
    comment: 'Internal review complete. Ready for SGS third-party verification.',
  });

  // Timber Passport WP-2025-001: pending → verified → in_transit → delivered
  addWorkflowHistory({
    entityType: 'timber_passport',
    entityId: 'WP-2025-001',
    fromState: 'pending',
    toState: 'verified',
    action: 'verify',
    performedBy: 'Auditor Pham',
    performedByRole: 'auditor',
    comment: 'VPA/FLEGT due diligence completed. VNTLAS check passed. Harvest permit valid.',
  });
  addWorkflowHistory({
    entityType: 'timber_passport',
    entityId: 'WP-2025-001',
    fromState: 'verified',
    toState: 'in_transit',
    action: 'ship',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
    comment: 'Shipment dispatched from Dong Nai depot. GPS tracking active.',
  });
  addWorkflowHistory({
    entityType: 'timber_passport',
    entityId: 'WP-2025-001',
    fromState: 'in_transit',
    toState: 'delivered',
    action: 'deliver',
    performedBy: 'Operations Manager Tran',
    performedByRole: 'operations_manager',
    comment: 'Delivery confirmed at HCMC processing plant. Volume verified: 15.5 m³.',
  });

  // Timber Passport WP-2025-004: pending → rejected
  addWorkflowHistory({
    entityType: 'timber_passport',
    entityId: 'WP-2025-004',
    fromState: 'pending',
    toState: 'rejected',
    action: 'reject',
    performedBy: 'Auditor Pham',
    performedByRole: 'auditor',
    comment: 'Harvest permit expired. VNTLAS due diligence failed. Mangrove harvesting restricted under Decision 28/2018/QD-TTg.',
  });
}

// Seed on module load
seedWorkflowHistory();
