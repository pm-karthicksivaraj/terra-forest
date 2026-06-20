'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Flame,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Wind,
  Thermometer,
  AlertTriangle,
  Truck,
  Shield,
} from 'lucide-react';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import { FIRE_RISK_LEVELS } from '@/lib/constants';

// ─── Types ─────────────────────────────────────────────────────────

interface WeatherAtSite {
  temp: number;
  humidity: number;
  wind: number;
  windDir: string;
}

interface FireIncidentDetail {
  id: string;
  location: string;
  lat: number;
  lng: number;
  area_ha: number;
  started: string;
  status: string;
  fwi: number;
  suppressCrew: string;
  containment: number;
  lifecycle: string[];
  weatherAtSite: WeatherAtSite;
  fuelType: string;
  terrainType: string;
}

interface TimelineEvent {
  time: string;
  step: string;
  detail: string;
}

interface IncidentTimeline {
  fireId: string;
  events: TimelineEvent[];
}

// ─── Mock Data ─────────────────────────────────────────────────────

const FIRE_INCIDENTS_DETAIL: FireIncidentDetail[] = [
  {
    id: '1',
    location: 'Cat Tien District, Dong Nai',
    lat: 11.22,
    lng: 107.18,
    area_ha: 5.2,
    started: '2025-03-04 14:30',
    status: 'alerted',
    fwi: 42,
    suppressCrew: 'Team Alpha (4 rangers)',
    containment: 30,
    lifecycle: ['detected', 'alerted'],
    weatherAtSite: { temp: 34, humidity: 55, wind: 18, windDir: 'NE' },
    fuelType: 'Mixed dipterocarp forest — moderate fuel load',
    terrainType: 'Gentle slope, 150m elevation',
  },
  {
    id: '2',
    location: 'Ea Sup District, Dak Lak',
    lat: 12.72,
    lng: 108.12,
    area_ha: 12.8,
    started: '2025-03-04 11:15',
    status: 'dispatched',
    fwi: 38,
    suppressCrew: 'Team Bravo (6 rangers)',
    containment: 10,
    lifecycle: ['detected', 'alerted', 'dispatched'],
    weatherAtSite: { temp: 36, humidity: 45, wind: 22, windDir: 'E' },
    fuelType: 'Degraded forest with grass understory — high fuel load',
    terrainType: 'Flat terrain, 520m elevation',
  },
  {
    id: '3',
    location: 'U Minh District, Ca Mau',
    lat: 9.22,
    lng: 105.18,
    area_ha: 3.1,
    started: '2025-03-03 16:45',
    status: 'contained',
    fwi: 32,
    suppressCrew: 'Team Delta (3 rangers)',
    containment: 80,
    lifecycle: ['detected', 'alerted', 'dispatched', 'contained'],
    weatherAtSite: { temp: 32, humidity: 72, wind: 8, windDir: 'SW' },
    fuelType: 'Peat swamp forest — extreme peat fire risk',
    terrainType: 'Flat, near sea level',
  },
];

const INCIDENT_TIMELINES: IncidentTimeline[] = [
  {
    fireId: '1',
    events: [
      {
        time: '14:30',
        step: 'Detected',
        detail:
          'Satellite thermal anomaly detected by VIIRS sensor (375m resolution)',
      },
      {
        time: '14:32',
        step: 'Alerted',
        detail:
          'Fire alert dispatched to Operations Center and Team Alpha',
      },
      {
        time: '14:45',
        step: 'Dispatched',
        detail:
          'Team Alpha en route from Bu Gia Map station (ETA 25 min)',
      },
    ],
  },
  {
    fireId: '2',
    events: [
      {
        time: '11:15',
        step: 'Detected',
        detail:
          'Ground patrol reported smoke column near Ea Sup protection forest',
      },
      {
        time: '11:18',
        step: 'Alerted',
        detail:
          'Fire alert escalated to provincial authority. FWI at critical level.',
      },
      {
        time: '11:30',
        step: 'Dispatched',
        detail:
          'Team Bravo dispatched with water pumps and hand tools',
      },
      {
        time: '12:45',
        step: 'In Field',
        detail:
          'Fire front measured at 2.1 km. Wind shift complicating containment.',
      },
    ],
  },
  {
    fireId: '3',
    events: [
      {
        time: '16:45',
        step: 'Detected',
        detail:
          'Mangrove fire spotted by Ca Mau station smoke detector',
      },
      {
        time: '16:48',
        step: 'Alerted',
        detail:
          'Alert issued. Peat fire risk assessment: moderate.',
      },
      {
        time: '17:00',
        step: 'Dispatched',
        detail:
          'Team Delta deployed via boat access channel',
      },
      {
        time: '18:30',
        step: 'Contained',
        detail:
          'Fire perimeter secured. 80% containment achieved. Mop-up operations ongoing.',
      },
    ],
  },
];

const FIRE_LIFECYCLE_STEPS = [
  'Detected',
  'Alerted',
  'Dispatched',
  'Contained',
  'Closed',
] as const;

// ─── Helper ────────────────────────────────────────────────────────

function getFwiRisk(fwi: number) {
  if (fwi >= 38) return FIRE_RISK_LEVELS[3]; // critical
  if (fwi >= 25) return FIRE_RISK_LEVELS[2]; // high
  if (fwi >= 12) return FIRE_RISK_LEVELS[1]; // medium
  return FIRE_RISK_LEVELS[0]; // low
}

// ─── Page Component ────────────────────────────────────────────────

export default function FireIncidentDetailPage() {
  const params = useParams();
  const router = useRouter();

  const incident = useMemo(() => {
    const id = params.id as string;
    return FIRE_INCIDENTS_DETAIL.find((f) => f.id === id) ?? null;
  }, [params.id]);

  const timeline = useMemo(() => {
    if (!incident) return [];
    return (
      INCIDENT_TIMELINES.find((t) => t.fireId === incident.id)?.events ?? []
    );
  }, [incident]);

  const [currentStatus, setCurrentStatus] = useState<string>(
    () => incident?.status ?? 'detected'
  );

  const workflow = getWorkflow('fire_incident');
  const stateInfo = getStateInfo('fire_incident', currentStatus);

  const handleTransition = (
    _fromState: string,
    toState: string,
    _action: string
  ) => {
    setCurrentStatus(toState);
  };

  // ─── Not Found ─────────────────────────────────────────────────

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Flame className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-muted-foreground">
          Fire Incident Not Found
        </h2>
        <p className="text-sm text-muted-foreground">
          No fire incident matches ID &quot;{params.id}&quot;.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push('/fire-weather')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fire &amp; Weather
        </Button>
      </div>
    );
  }

  const fwiRisk = getFwiRisk(incident.fwi);

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 mb-2"
          onClick={() => router.push('/fire-weather')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fire &amp; Weather
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stateInfo.color}15` }}
            >
              <Flame className="w-5 h-5" style={{ color: stateInfo.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                Fire Incident #{incident.id}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {incident.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <WorkflowStatusBadge
              entity="fire_incident"
              status={currentStatus}
              size="lg"
            />
            <Badge
              variant="outline"
              className="text-[10px] h-6 px-2 font-medium"
              style={{
                color: fwiRisk.color,
                borderColor: fwiRisk.color,
                backgroundColor: `${fwiRisk.color}10`,
              }}
            >
              FWI {incident.fwi} — {fwiRisk.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 2/3 + 1/3 ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column (2/3) ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details Grid */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: stateInfo.color }} />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-xs font-medium">{incident.location}</p>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Coordinates
                    </p>
                    <p className="text-xs font-mono font-medium">
                      {incident.lat}&deg;N, {incident.lng}&deg;E
                    </p>
                  </div>
                </div>

                {/* Burned Area */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Flame className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#E65100' }} />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Burned Area
                    </p>
                    <p className="text-xs font-medium">
                      {incident.area_ha} ha
                    </p>
                  </div>
                </div>

                {/* Start Time */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Start Time
                    </p>
                    <p className="text-xs font-medium">{incident.started}</p>
                  </div>
                </div>

                {/* FWI */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Thermometer
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: fwiRisk.color }}
                  />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Fire Weather Index
                    </p>
                    <p className="text-xs font-medium" style={{ color: fwiRisk.color }}>
                      {incident.fwi} ({fwiRisk.label})
                    </p>
                  </div>
                </div>

                {/* Containment */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Containment
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={incident.containment}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs font-medium">
                        {incident.containment}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fuel & Terrain info */}
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Fuel Type
                  </p>
                  <p className="text-xs font-medium">{incident.fuelType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Terrain
                  </p>
                  <p className="text-xs font-medium">{incident.terrainType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppression Crew */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Suppression Crew
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stateInfo.color}15` }}
                >
                  <Truck className="w-4 h-4" style={{ color: stateInfo.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {incident.suppressCrew}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Currently assigned to this incident
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fire Lifecycle Progress Indicator */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: stateInfo.color }} />
                Fire Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {FIRE_LIFECYCLE_STEPS.map((step, i) => {
                  const stepKey = step.toLowerCase();
                  const isActive = currentStatus === stepKey;
                  const isCompleted =
                    workflow.states.findIndex((s) => s.value === currentStatus) >
                    workflow.states.findIndex((s) => s.value === stepKey);
                  const stepStateInfo = getStateInfo('fire_incident', stepKey);

                  return (
                    <React.Fragment key={step}>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                          isCompleted
                            ? 'bg-forest-500 text-white'
                            : isActive
                              ? 'font-semibold'
                              : 'bg-muted text-muted-foreground'
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: `${stepStateInfo.color}15`,
                                color: stepStateInfo.color,
                                boxShadow: `0 0 0 2px ${stepStateInfo.color}`,
                              }
                            : undefined
                        }
                      >
                        {isCompleted && (
                          <Shield className="w-3 h-3" />
                        )}
                        {isActive && (
                          <Flame className="w-3 h-3" />
                        )}
                        {step}
                      </div>
                      {i < FIRE_LIFECYCLE_STEPS.length - 1 && (
                        <div
                          className={`w-4 sm:w-6 h-0.5 ${
                            isCompleted ? 'bg-forest-500' : 'bg-border'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Current state:{' '}
                <span className="font-medium" style={{ color: stateInfo.color }}>
                  {stateInfo.label}
                </span>{' '}
                — {stateInfo.description}
              </p>
            </CardContent>
          </Card>

          {/* Incident Timeline */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Incident Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((event, i) => {
                    const eventStateInfo = getStateInfo(
                      'fire_incident',
                      event.step.toLowerCase()
                    );
                    const isLast = i === timeline.length - 1;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        {/* Vertical line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{
                              backgroundColor: `${eventStateInfo.color}20`,
                              color: eventStateInfo.color,
                            }}
                          >
                            {i + 1}
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-8 bg-border" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">
                              {event.step}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1.5"
                              style={{
                                color: eventStateInfo.color,
                                borderColor: eventStateInfo.color,
                              }}
                            >
                              {event.time}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {event.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No incident timeline events recorded
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workflow Timeline (from component) */}
          <WorkflowTimeline
            entity="fire_incident"
            entityId={incident.id}
            currentStatus={currentStatus}
          />
        </div>

        {/* ── Right Column (1/3) ────────────────────────────────── */}
        <div className="space-y-6">
          {/* Workflow Actions */}
          <WorkflowActions
            entity="fire_incident"
            entityId={incident.id}
            currentStatus={currentStatus}
            userRole="operations_manager"
            onTransition={handleTransition}
          />

          {/* Weather Conditions at Site */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Weather at Incident Site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Temperature */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#E65100]/10">
                  <Thermometer className="w-4 h-4 text-[#E65100]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">
                    Temperature
                  </p>
                  <p className="text-sm font-bold">
                    {incident.weatherAtSite.temp}&deg;C
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4"
                  style={{
                    color:
                      incident.weatherAtSite.temp >= 35
                        ? '#E65100'
                        : incident.weatherAtSite.temp >= 30
                          ? '#FF8A65'
                          : '#52B788',
                  }}
                >
                  {incident.weatherAtSite.temp >= 35
                    ? 'Extreme'
                    : incident.weatherAtSite.temp >= 30
                      ? 'High'
                      : 'Moderate'}
                </Badge>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#0277BD]/10">
                  <Wind className="w-4 h-4 text-[#0277BD]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">
                    Relative Humidity
                  </p>
                  <p className="text-sm font-bold">
                    {incident.weatherAtSite.humidity}%
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4"
                  style={{
                    color:
                      incident.weatherAtSite.humidity < 50
                        ? '#E65100'
                        : incident.weatherAtSite.humidity < 70
                          ? '#FF8A65'
                          : '#52B788',
                  }}
                >
                  {incident.weatherAtSite.humidity < 50
                    ? 'Very Dry'
                    : incident.weatherAtSite.humidity < 70
                      ? 'Dry'
                      : 'Moderate'}
                </Badge>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#795548]/10">
                  <Wind className="w-4 h-4 text-[#795548]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">
                    Wind Speed / Direction
                  </p>
                  <p className="text-sm font-bold">
                    {incident.weatherAtSite.wind} km/h{' '}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({incident.weatherAtSite.windDir})
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4"
                  style={{
                    color:
                      incident.weatherAtSite.wind >= 20
                        ? '#E65100'
                        : incident.weatherAtSite.wind >= 12
                          ? '#FF8A65'
                          : '#52B788',
                  }}
                >
                  {incident.weatherAtSite.wind >= 20
                    ? 'Strong'
                    : incident.weatherAtSite.wind >= 12
                      ? 'Moderate'
                      : 'Light'}
                </Badge>
              </div>

              <Separator />

              {/* FWI Summary */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  borderColor: `${fwiRisk.color}30`,
                  backgroundColor: `${fwiRisk.color}08`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame
                    className="w-4 h-4"
                    style={{ color: fwiRisk.color }}
                  />
                  <span className="text-xs font-semibold">
                    Fire Weather Index
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: fwiRisk.color }}
                  >
                    {incident.fwi}
                  </span>
                  <Badge
                    className="text-[9px] h-5 mb-0.5"
                    style={{
                      backgroundColor: fwiRisk.color,
                      color: 'white',
                    }}
                  >
                    {fwiRisk.label} Risk
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  FWI &ge; 38 indicates critical fire danger. Immediate suppression
                  response required.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Summary */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incident ID</span>
                  <span className="font-mono font-medium">
                    #{incident.id}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <WorkflowStatusBadge
                    entity="fire_incident"
                    status={currentStatus}
                    size="sm"
                  />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Burned Area</span>
                  <span className="font-medium">{incident.area_ha} ha</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Containment</span>
                  <span className="font-medium">{incident.containment}%</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crew</span>
                  <span className="font-medium text-right">
                    {incident.suppressCrew}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
