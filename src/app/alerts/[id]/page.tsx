'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Paperclip,
  Flame,
  TreePine,
  GitCompare,
  Bug,
  Brain,
  ShieldCheck,
  Eye,
  FileText,
  Crosshair,
} from 'lucide-react';
import { ALERT_TYPES, ALERT_SEVERITY, ALERT_STATUSES } from '@/lib/constants';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';

// ─── Types ────────────────────────────────────────────────────────
interface AlertDetailRecord {
  id: string;
  type: string;
  severity: string;
  plot: string;
  message: string;
  status: string;
  time: string;
  detectedAt: string;
  province: string;
  assignee: string;
  evidence: number;
  lat: number;
  lng: number;
}

// ─── Mock Detail Data ─────────────────────────────────────────────
const ALERTS_DETAIL_DATA: AlertDetailRecord[] = [
  {
    id: '1',
    type: 'fire_risk',
    severity: 'critical',
    plot: 'DN_CAT_001',
    message: 'Critical fire risk — FWI exceeds threshold 40 at Cat Tien National Park perimeter. Strong NE winds at 25 km/h accelerating spread potential.',
    status: 'acknowledged',
    time: '5 min ago',
    detectedAt: '2025-03-04 14:55',
    province: 'Dong Nai',
    assignee: 'Team Alpha',
    evidence: 3,
    lat: 11.22,
    lng: 107.18,
  },
  {
    id: '2',
    type: 'deforestation',
    severity: 'critical',
    plot: 'DL_YT_001',
    message: 'Large-scale deforestation detected via Sentinel-2 change analysis in Ea Sup district. SAR confirms canopy removal over 8 hectares.',
    status: 'in_field',
    time: '12 min ago',
    detectedAt: '2025-03-04 14:48',
    province: 'Dak Lak',
    assignee: 'Team Bravo',
    evidence: 5,
    lat: 12.72,
    lng: 108.12,
  },
  {
    id: '3',
    type: 'fire_risk',
    severity: 'high',
    plot: 'CM_CM_001',
    message: 'Fire warning for Ca Mau mangrove forest — prolonged dry conditions persist. Water table below seasonal average by 0.4 m.',
    status: 'in_field',
    time: '28 min ago',
    detectedAt: '2025-03-04 14:32',
    province: 'Ca Mau',
    assignee: 'Team Delta',
    evidence: 1,
    lat: 9.22,
    lng: 105.18,
  },
  {
    id: '14',
    type: 'fire_risk',
    severity: 'critical',
    plot: 'DL_YT_001',
    message: 'Active wildfire spreading — 12.8 ha burned, strong winds 25 km/h from NE. Fire front advancing toward protection forest boundary at 0.5 km/h.',
    status: 'in_field',
    time: '30 min ago',
    detectedAt: '2025-03-04 14:30',
    province: 'Dak Lak',
    assignee: 'Team Bravo',
    evidence: 7,
    lat: 12.71,
    lng: 108.11,
  },
  {
    id: '7',
    type: 'forest_change',
    severity: 'medium',
    plot: 'DN_BGM_003',
    message: 'Protection forest degradation following heavy rainfall and soil erosion event. Landslide risk elevated for downstream communities.',
    status: 'resolved',
    time: '1 day ago',
    detectedAt: '2025-03-03 10:15',
    province: 'Dong Nai',
    assignee: 'Team Alpha',
    evidence: 4,
    lat: 11.55,
    lng: 107.38,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

function getTypeInfo(type: string) {
  return ALERT_TYPES.find(t => t.value === type) ?? ALERT_TYPES[0];
}

function getSeverityInfo(severity: string) {
  return ALERT_SEVERITY.find(s => s.value === severity) ?? ALERT_SEVERITY[3];
}

function getStatusInfo(status: string) {
  return ALERT_STATUSES.find(s => s.value === status) ?? ALERT_STATUSES[0];
}

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  fire_risk: <Flame className="w-4 h-4" />,
  deforestation: <TreePine className="w-4 h-4" />,
  forest_change: <GitCompare className="w-4 h-4" />,
  disease: <Bug className="w-4 h-4" />,
  ai_detection: <Brain className="w-4 h-4" />,
};

// ─── Not Found State ──────────────────────────────────────────────

function AlertNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Alert Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The alert you are looking for does not exist or has been removed.
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
        Back to Alerts
      </Button>
    </div>
  );
}

// ─── Metadata Item ────────────────────────────────────────────────

function MetadataItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <div className="text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;

  const alertData = useMemo(
    () => ALERTS_DETAIL_DATA.find(a => a.id === alertId) ?? null,
    [alertId]
  );

  // Track current status so workflow actions can update it
  const [currentStatus, setCurrentStatus] = useState<string>(
    alertData?.status ?? 'new'
  );

  // Related alerts: same plot, different id
  const relatedAlerts = useMemo(
    () =>
      alertData
        ? ALERTS_DETAIL_DATA.filter(a => a.plot === alertData.plot && a.id !== alertData.id)
        : [],
    [alertData]
  );

  const handleBack = () => router.push('/alerts');

  const handleTransition = (fromState: string, toState: string, action: string) => {
    setCurrentStatus(toState);
  };

  // ─── Not Found ───────────────────────────────────────────────────
  if (!alertData) {
    return (
      <div className="p-6">
        <AlertNotFound onBack={handleBack} />
      </div>
    );
  }

  // ─── Resolve display info ────────────────────────────────────────
  const typeInfo = getTypeInfo(alertData.type);
  const severityInfo = getSeverityInfo(alertData.severity);
  const workflow = getWorkflow('alert');
  const stateInfo = getStateInfo('alert', currentStatus);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-8"
          onClick={handleBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Alerts
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-xs text-muted-foreground">
          Alerts & Incidents
        </span>
      </div>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${severityInfo.color}15`,
            color: severityInfo.color,
          }}
        >
          {TYPE_ICON_MAP[alertData.type] ?? <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">
              {typeInfo.label} — {alertData.plot}
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-5 font-medium"
              style={{
                color: severityInfo.color,
                borderColor: severityInfo.color,
                backgroundColor: `${severityInfo.color}10`,
              }}
            >
              {severityInfo.label}
            </Badge>
            <WorkflowStatusBadge entity="alert" status={currentStatus} size="md" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {alertData.message}
          </p>
        </div>
      </div>

      <Separator />

      {/* ─── Main Layout: Left (2/3) + Right (1/3) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metadata */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Alert Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <MetadataItem
                  icon={<AlertTriangle className="w-4 h-4" />}
                  label="Alert Type"
                >
                  <span className="font-medium">{typeInfo.label}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Severity"
                >
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: severityInfo.color,
                      borderColor: severityInfo.color,
                      backgroundColor: `${severityInfo.color}10`,
                    }}
                  >
                    {severityInfo.label}
                  </Badge>
                </MetadataItem>

                <MetadataItem
                  icon={<TreePine className="w-4 h-4" />}
                  label="Forest Plot"
                >
                  <span className="font-mono font-medium">{alertData.plot}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Province"
                >
                  <span>{alertData.province}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<User className="w-4 h-4" />}
                  label="Assignee"
                >
                  <span className="font-medium">{alertData.assignee}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Paperclip className="w-4 h-4" />}
                  label="Evidence Files"
                >
                  <span className="font-medium">{alertData.evidence}</span>
                  <span className="text-muted-foreground text-xs ml-1">attached</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Detected At"
                >
                  <span className="font-medium">{alertData.detectedAt}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Eye className="w-4 h-4" />}
                  label="Current Status"
                >
                  <WorkflowStatusBadge entity="alert" status={currentStatus} size="sm" />
                </MetadataItem>
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Plot Coordinates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Latitude
                      </p>
                      <p className="text-sm font-mono font-medium mt-0.5">
                        {alertData.lat.toFixed(4)}° N
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Longitude
                      </p>
                      <p className="text-sm font-mono font-medium mt-0.5">
                        {alertData.lng.toFixed(4)}° E
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Full Coordinates
                    </p>
                    <p className="text-xs font-mono mt-0.5">
                      {alertData.lat.toFixed(6)}, {alertData.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <WorkflowTimeline
            entity="alert"
            entityId={alertData.id}
            currentStatus={currentStatus}
          />

          {/* Related Alerts */}
          {relatedAlerts.length > 0 && (
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Related Alerts
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {relatedAlerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {relatedAlerts.map(related => {
                    const relType = getTypeInfo(related.type);
                    const relSeverity = getSeverityInfo(related.severity);
                    return (
                      <div
                        key={related.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/alerts/${related.id}`)}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${relSeverity.color}15`,
                            color: relSeverity.color,
                          }}
                        >
                          {TYPE_ICON_MAP[related.type] ?? (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium">
                              {relType.label}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4"
                              style={{
                                color: relSeverity.color,
                                borderColor: relSeverity.color,
                              }}
                            >
                              {relSeverity.label}
                            </Badge>
                            <WorkflowStatusBadge
                              entity="alert"
                              status={related.status}
                              size="sm"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {related.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {related.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {related.evidence} files
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right Column ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Current State Summary */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Current State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <WorkflowStatusBadge entity="alert" status={currentStatus} size="lg" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stateInfo.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Entity
                  </p>
                  <p className="font-medium mt-0.5">{workflow.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Alert ID
                  </p>
                  <p className="font-mono mt-0.5">#{alertData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          <WorkflowActions
            entity="alert"
            entityId={alertData.id}
            currentStatus={currentStatus}
            onTransition={handleTransition}
          />

          {/* Quick Info */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Forest Plot</span>
                <span className="font-mono font-medium">{alertData.plot}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Province</span>
                <span className="font-medium">{alertData.province}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Assignee</span>
                <span className="font-medium">{alertData.assignee}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Evidence</span>
                <span className="font-medium">{alertData.evidence} files</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Detected</span>
                <span className="font-medium">{alertData.time}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Coordinates</span>
                <span className="font-mono text-[11px]">
                  {alertData.lat.toFixed(4)}, {alertData.lng.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
