'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import {
  Footprints,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Eye,
  Smartphone,
  Route,
  Radio,
  Camera,
  Video,
  Mic,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  Timer,
  Milestone,
  HardDrive,
  UserCircle,
  FileWarning,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

interface PatrolMember {
  name: string;
  role: string;
  device: string;
}

interface FieldObservation {
  id: number;
  type: string;
  desc: string;
  lat: number;
  lng: number;
  time: string;
  hasPhoto: boolean;
  observer: string;
  severity: string;
}

interface EvidenceItem {
  id: number;
  type: 'photo' | 'video' | 'voice_note';
  name: string;
  uploadedBy: string;
  time: string;
  lat: number | null;
  lng: number | null;
}

interface GeneratedAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
}

interface PatrolDetail {
  id: string;
  session: string;
  title: string;
  teamLead: string;
  plot: string;
  plotName: string;
  teamSize: number;
  status: string;
  team: string;
  start: string;
  end: string | null;
  route: string;
  mobileSync: string;
  distanceKm: number;
  durationHours: number;
  evidenceFiles: number;
  members: PatrolMember[];
  observations: FieldObservation[];
  evidence: EvidenceItem[];
  generatedAlerts: GeneratedAlert[];
}

// ─── Mock Data ──────────────────────────────────────────────────

const PATROLS_DETAIL: PatrolDetail[] = [
  {
    id: '1',
    session: 'PAT-2025-001',
    title: 'Bu Gia Map Sector A Patrol',
    teamLead: 'Team Lead Nguyen',
    plot: 'DN_BGM_001',
    plotName: 'Bu Gia Map Natural Forest',
    teamSize: 4,
    status: 'reviewed',
    team: 'Team Alpha',
    start: '2025-03-01 06:00',
    end: '2025-03-01 14:00',
    route: 'Bu Gia Map Sector A — River Trail Loop',
    mobileSync: 'synced',
    distanceKm: 12.5,
    durationHours: 8,
    evidenceFiles: 6,
    members: [
      { name: 'Team Lead Nguyen', role: 'leader', device: 'TF-DEV-001' },
      { name: 'Ranger Tran', role: 'member', device: 'TF-DEV-002' },
      { name: 'Ranger Pham', role: 'member', device: 'TF-DEV-003' },
      { name: 'Ranger Le', role: 'member', device: 'TF-DEV-004' },
    ],
    observations: [
      { id: 1, type: 'Illegal Logging', desc: 'Illegal timber harvesting — 3 trees felled, fresh cuts observed. Estimated 2.1 m³ of Dipterocarpus alatus removed.', lat: 11.52, lng: 107.36, time: '09:30', hasPhoto: true, observer: 'Ranger Tran', severity: 'high' },
      { id: 2, type: 'Wildlife', desc: 'Asian elephant tracks and dung piles found near stream. Fresh tracks indicate herd of 3-5 individuals moving NW.', lat: 11.51, lng: 107.35, time: '10:15', hasPhoto: true, observer: 'Ranger Tran', severity: 'info' },
      { id: 3, type: 'Fire Signs', desc: 'Charcoal burning remnants and ash deposits discovered. Evidence of illegal charcoal production within protection zone.', lat: 11.53, lng: 107.34, time: '11:00', hasPhoto: false, observer: 'Ranger Pham', severity: 'high' },
      { id: 4, type: 'Forest Health', desc: 'Natural regeneration of Dipterocarpus saplings observed in previously degraded sector. 15-20 saplings per 100m².', lat: 11.54, lng: 107.37, time: '12:30', hasPhoto: true, observer: 'Ranger Le', severity: 'info' },
      { id: 5, type: 'Boundary', desc: 'Boundary marker #8 intact and within GPS tolerance. No encroachment detected at this point.', lat: 11.56, lng: 107.39, time: '13:15', hasPhoto: true, observer: 'Ranger Tran', severity: 'info' },
    ],
    evidence: [
      { id: 1, type: 'photo', name: 'Illegal logging evidence IMG_1452', uploadedBy: 'Ranger Tran', time: '09:32', lat: 11.52, lng: 107.36 },
      { id: 2, type: 'photo', name: 'Elephant tracks IMG_1455', uploadedBy: 'Ranger Tran', time: '10:18', lat: 11.51, lng: 107.35 },
      { id: 3, type: 'photo', name: 'Regeneration area IMG_1460', uploadedBy: 'Ranger Le', time: '12:33', lat: 11.54, lng: 107.37 },
      { id: 4, type: 'video', name: 'Fire site scan VID_001', uploadedBy: 'Ranger Pham', time: '11:05', lat: 11.53, lng: 107.34 },
      { id: 5, type: 'voice_note', name: 'Patrol summary note VOICE_001', uploadedBy: 'Team Lead Nguyen', time: '13:50', lat: null, lng: null },
      { id: 6, type: 'photo', name: 'Boundary marker #8 IMG_1462', uploadedBy: 'Ranger Tran', time: '13:17', lat: 11.56, lng: 107.39 },
    ],
    generatedAlerts: [
      { id: '1', type: 'Illegal Logging', severity: 'high', status: 'acknowledged' },
    ],
  },
  {
    id: '2',
    session: 'PAT-2025-002',
    title: 'Cat Tien NP Boundary Patrol',
    teamLead: 'Team Lead Nguyen',
    plot: 'DN_CAT_001',
    plotName: 'Cat Tien National Park',
    teamSize: 3,
    status: 'in_progress',
    team: 'Team Alpha',
    start: '2025-03-04 07:00',
    end: null,
    route: 'Cat Tien NP Boundary — Southern Perimeter',
    mobileSync: 'live',
    distanceKm: 6.2,
    durationHours: 4,
    evidenceFiles: 2,
    members: [
      { name: 'Team Lead Nguyen', role: 'leader', device: 'TF-DEV-001' },
      { name: 'Ranger Pham', role: 'member', device: 'TF-DEV-003' },
      { name: 'Ranger Le', role: 'member', device: 'TF-DEV-004' },
    ],
    observations: [
      { id: 4, type: 'Forest Health', desc: 'Acacia mangium fungal infection spreading in Block 4. Ceratocystis wilt confirmed — approximately 15% of stand affected.', lat: 11.20, lng: 107.16, time: '08:45', hasPhoto: true, observer: 'Ranger Pham', severity: 'medium' },
      { id: 5, type: 'Boundary', desc: 'Boundary marker #12 displaced by approximately 2 meters from original GPS position. Possible land encroachment indicator.', lat: 11.21, lng: 107.14, time: '10:30', hasPhoto: false, observer: 'Ranger Le', severity: 'high' },
    ],
    evidence: [
      { id: 7, type: 'photo', name: 'Fungal infection IMG_1501', uploadedBy: 'Ranger Pham', time: '08:48', lat: 11.20, lng: 107.16 },
      { id: 8, type: 'photo', name: 'Displaced marker #12 IMG_1502', uploadedBy: 'Ranger Le', time: '10:32', lat: 11.21, lng: 107.14 },
    ],
    generatedAlerts: [],
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function getObservationTypeColor(type: string): string {
  switch (type) {
    case 'Illegal Logging': return '#D32F2F';
    case 'Wildlife': return '#0277BD';
    case 'Fire Signs': return '#E65100';
    case 'Forest Health': return '#2D6A4F';
    case 'Boundary': return '#795548';
    default: return '#4A6A54';
  }
}

function getSeverityStyle(severity: string): { bg: string; text: string } {
  switch (severity) {
    case 'high': return { bg: '#D32F2F15', text: '#D32F2F' };
    case 'medium': return { bg: '#E6510015', text: '#E65100' };
    case 'info': return { bg: '#0277BD15', text: '#0277BD' };
    default: return { bg: '#9E9E9E15', text: '#9E9E9E' };
  }
}

function getSyncBadge(sync: string) {
  switch (sync) {
    case 'synced':
      return (
        <Badge className="bg-forest-500 text-white text-[10px] h-5 gap-1">
          <CheckCircle className="w-3 h-3" />
          Synced
        </Badge>
      );
    case 'live':
      return (
        <Badge className="bg-water-700 text-white text-[10px] h-5 gap-1">
          <Radio className="w-3 h-3 animate-pulse" />
          Live
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] h-5">
          Pending
        </Badge>
      );
  }
}

function getEvidenceIcon(type: string) {
  switch (type) {
    case 'photo': return <Camera className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'voice_note': return <Mic className="w-4 h-4" />;
    default: return <Camera className="w-4 h-4" />;
  }
}

function getEvidenceColor(type: string): string {
  switch (type) {
    case 'photo': return '#2D6A4F';
    case 'video': return '#0277BD';
    case 'voice_note': return '#795548';
    default: return '#4A6A54';
  }
}

function getAlertSeverityBadge(severity: string) {
  switch (severity) {
    case 'high':
      return <Badge className="bg-red-600 text-white text-[9px] h-4">High</Badge>;
    case 'medium':
      return <Badge className="bg-fire-700 text-white text-[9px] h-4">Medium</Badge>;
    default:
      return <Badge variant="outline" className="text-[9px] h-4">Low</Badge>;
  }
}

function getAlertStatusBadge(status: string) {
  switch (status) {
    case 'acknowledged':
      return <Badge className="bg-fire-700 text-white text-[9px] h-4">Acknowledged</Badge>;
    case 'resolved':
      return <Badge className="bg-forest-500 text-white text-[9px] h-4">Resolved</Badge>;
    case 'new':
      return <Badge className="bg-red-600 text-white text-[9px] h-4">New</Badge>;
    default:
      return <Badge variant="outline" className="text-[9px] h-4">{status}</Badge>;
  }
}

// ─── Component ──────────────────────────────────────────────────

export default function PatrolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const patrol = PATROLS_DETAIL.find(p => p.id === id);
  const [currentStatus, setCurrentStatus] = useState(patrol?.status ?? 'planned');

  // Workflow integration
  const workflow = getWorkflow('patrol');
  const stateInfo = getStateInfo('patrol', currentStatus);

  if (!patrol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Footprints className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Patrol Not Found</h2>
        <p className="text-sm text-muted-foreground">
          No patrol session found with ID &quot;{id}&quot;
        </p>
        <Button variant="outline" onClick={() => router.push('/patrols')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patrols
        </Button>
      </div>
    );
  }

  // Calculate progress through workflow states
  const stateIndex = workflow.states.findIndex(s => s.value === currentStatus);
  // Exclude 'cancelled' from progress calculation
  const activeStates = workflow.states.filter(s => s.value !== 'cancelled');
  const activeIndex = activeStates.findIndex(s => s.value === currentStatus);
  const progressPercent = currentStatus === 'cancelled'
    ? 0
    : Math.round(((activeIndex + 1) / activeStates.length) * 100);

  const highSeverityObs = patrol.observations.filter(o => o.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* ─── Top Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => router.push('/patrols')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patrols
        </Button>
      </div>

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{patrol.title}</h1>
            <WorkflowStatusBadge entity="patrol" status={currentStatus} size="lg" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono font-semibold text-forest-700">{patrol.session}</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {patrol.team} &middot; {patrol.teamLead}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {patrol.plotName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getSyncBadge(patrol.mobileSync)}
          {highSeverityObs > 0 && (
            <Badge className="bg-red-600 text-white text-[10px] h-5 gap-1">
              <AlertTriangle className="w-3 h-3" />
              {highSeverityObs} High Severity
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Workflow Progress ───────────────────────────── */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Workflow Progress</span>
            <span className="text-xs font-semibold" style={{ color: stateInfo.color }}>
              {stateInfo.label} — {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {workflow.states.map((s, i) => {
              const isActive = i <= stateIndex && currentStatus !== 'cancelled';
              const isCurrent = s.value === currentStatus;
              return (
                <React.Fragment key={s.value}>
                  <div
                    className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                      isCurrent
                        ? 'ring-1'
                        : isActive
                          ? 'opacity-80'
                          : 'opacity-40'
                    }`}
                    style={{
                      backgroundColor: isActive ? `${s.color}15` : 'transparent',
                      color: isActive ? s.color : undefined,
                      borderColor: isCurrent ? s.color : undefined,
                      ...(isCurrent ? { ringColor: s.color } : {}),
                    }}
                  >
                    {s.label}
                  </div>
                  {i < workflow.states.length - 1 && (
                    <div className={`w-3 h-0.5 ${isActive ? 'bg-forest-400' : 'bg-muted'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Summary Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0">
              <Timer className="w-4.5 h-4.5 text-forest-700" />
            </div>
            <div>
              <p className="text-lg font-bold">{patrol.durationHours}h</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0">
              <Milestone className="w-4.5 h-4.5 text-forest-700" />
            </div>
            <div>
              <p className="text-lg font-bold">{patrol.distanceKm} km</p>
              <p className="text-[10px] text-muted-foreground">Distance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-water-400/15 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4.5 h-4.5 text-water-700" />
            </div>
            <div>
              <p className="text-lg font-bold">{patrol.observations.length}</p>
              <p className="text-[10px] text-muted-foreground">Observations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-earth-700/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-earth-700" />
            </div>
            <div>
              <p className="text-lg font-bold">{patrol.teamSize}</p>
              <p className="text-[10px] text-muted-foreground">Team Size</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-fire-700/10 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-4.5 h-4.5 text-fire-700" />
            </div>
            <div>
              <p className="text-lg font-bold">{patrol.evidenceFiles}</p>
              <p className="text-[10px] text-muted-foreground">Evidence Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4.5 h-4.5 text-forest-700" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold capitalize">{patrol.mobileSync}</p>
                {patrol.mobileSync === 'live' && (
                  <Radio className="w-3 h-3 text-water-700 animate-pulse" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Mobile Sync</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Layout: Left 2/3 + Right 1/3 ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Patrol Route Info */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Route className="w-4 h-4 text-forest-600" />
                Patrol Route & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Planned Route</p>
                    <p className="text-sm font-medium">{patrol.route}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Forest Plot</p>
                    <p className="text-sm">
                      <span className="font-mono text-forest-700">{patrol.plot}</span>
                      <span className="text-muted-foreground"> — {patrol.plotName}</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Start</p>
                      <p className="text-sm font-medium">{patrol.start}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">End</p>
                      <p className="text-sm font-medium">{patrol.end ?? '— In Progress'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patrol.members.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        member.role === 'leader'
                          ? 'bg-forest-500 text-white'
                          : 'bg-forest-100 text-forest-700'
                      }`}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium truncate">{member.name}</p>
                        {member.role === 'leader' && (
                          <Badge className="bg-forest-600 text-white text-[8px] h-3.5 px-1">
                            Lead
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground font-mono">{member.device}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Observations */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-water-700" />
                Field Observations
                <Badge variant="secondary" className="text-[9px] h-4 ml-1">
                  {patrol.observations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {patrol.observations.map((obs) => {
                  const typeColor = getObservationTypeColor(obs.type);
                  const sevStyle = getSeverityStyle(obs.severity);
                  return (
                    <div
                      key={obs.id}
                      className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 border-current font-medium"
                            style={{ color: typeColor, borderColor: typeColor, backgroundColor: `${typeColor}10` }}
                          >
                            {obs.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4"
                            style={{
                              color: sevStyle.text,
                              borderColor: sevStyle.text,
                              backgroundColor: sevStyle.bg,
                            }}
                          >
                            {obs.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {obs.time}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/90">{obs.desc}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="font-mono">{obs.lat}°N, {obs.lng}°E</span>
                        </span>
                        {obs.hasPhoto && (
                          <span className="flex items-center gap-1 text-[10px] text-forest-600 font-medium">
                            <Camera className="w-3 h-3" />
                            Photo
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <UserCircle className="w-3 h-3" />
                          {obs.observer}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Evidence Gallery */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-fire-700" />
                Evidence Gallery
                <Badge variant="secondary" className="text-[9px] h-4 ml-1">
                  {patrol.evidence.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patrol.evidence.map((ev) => {
                  const evColor = getEvidenceColor(ev.type);
                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg border hover:bg-muted/30 transition-colors flex items-start gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${evColor}15`, color: evColor }}
                      >
                        {getEvidenceIcon(ev.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{ev.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[8px] h-3.5 border-current capitalize"
                            style={{ color: evColor, borderColor: evColor }}
                          >
                            {ev.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">
                            by {ev.uploadedBy}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {ev.time}
                          </span>
                        </div>
                        {ev.lat !== null && ev.lng !== null && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-mono text-muted-foreground">
                              {ev.lat}°N, {ev.lng}°E
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Related Alerts */}
          {patrol.generatedAlerts.length > 0 && (
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Related Alerts
                  <Badge variant="secondary" className="text-[9px] h-4 ml-1">
                    {patrol.generatedAlerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patrol.generatedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <FileWarning className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium">{alert.type}</p>
                            {getAlertSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Alert ID: ALT-{alert.id.padStart(4, '0')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getAlertStatusBadge(alert.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right Column (1/3) ────────────────────────── */}
        <div className="space-y-6">
          {/* Workflow Actions */}
          <WorkflowActions
            entity="patrol"
            entityId={patrol.id}
            currentStatus={currentStatus}
            userRole="operations_manager"
            onTransition={(_from, to) => setCurrentStatus(to)}
          />

          {/* Workflow Timeline */}
          <WorkflowTimeline
            entity="patrol"
            entityId={patrol.id}
            currentStatus={currentStatus}
          />

          {/* Quick Stats Panel */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Patrol Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5" />
                  Total Observations
                </span>
                <span className="text-sm font-bold">{patrol.observations.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  High Severity
                </span>
                <span className="text-sm font-bold text-red-600">{highSeverityObs}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Photos
                </span>
                <span className="text-sm font-bold">
                  {patrol.evidence.filter(e => e.type === 'photo').length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  Videos
                </span>
                <span className="text-sm font-bold">
                  {patrol.evidence.filter(e => e.type === 'video').length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  Voice Notes
                </span>
                <span className="text-sm font-bold">
                  {patrol.evidence.filter(e => e.type === 'voice_note').length}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-fire-700" />
                  Generated Alerts
                </span>
                <span className="text-sm font-bold text-fire-700">
                  {patrol.generatedAlerts.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Observation Type Breakdown */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Observation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(() => {
                const typeCount: Record<string, number> = {};
                patrol.observations.forEach(o => {
                  typeCount[o.type] = (typeCount[o.type] || 0) + 1;
                });
                return Object.entries(typeCount).map(([type, count]) => {
                  const color = getObservationTypeColor(type);
                  const pct = Math.round((count / patrol.observations.length) * 100);
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color }}>{type}</span>
                        <span className="text-[10px] text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
