'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CloudCog,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Calculator,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';

// ─── Types ────────────────────────────────────────────────────────

interface CalculationStep {
  label: string;
  value: string;
  detail: string;
}

interface CalculationBreakdown {
  formula: string;
  steps: CalculationStep[];
}

interface TrendPoint {
  year: number;
  stock: number;
}

interface VerificationCheck {
  check: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
}

interface CarbonDetailRecord {
  id: string;
  plotId: string;
  plotName: string;
  year: number;
  carbonStock: number;
  areaHa: number;
  method: string;
  methodLabel: string;
  confidence: number;
  status: string;
  emissionFactor: number;
  co2e: number;
  tier: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  calculation: CalculationBreakdown;
  trend: TrendPoint[];
  verificationChecks: VerificationCheck[];
}

// ─── Mock Data ────────────────────────────────────────────────────

const CARBON_DETAIL_DATA: CarbonDetailRecord[] = [
  {
    id: '1',
    plotId: 'DN_BGM_001',
    plotName: 'Bu Gia Map Natural Forest',
    year: 2024,
    carbonStock: 312.6,
    areaHa: 1250.5,
    method: 'field_measurement',
    methodLabel: 'Field Measurement + Remote Sensing',
    confidence: 0.87,
    status: 'approved',
    emissionFactor: 250,
    co2e: 312.6 * 3.67,
    tier: 'Tier 2',
    verifiedBy: 'SGS Vietnam',
    verifiedAt: null,
    calculation: {
      formula: 'Carbon Stock = Area × Emission Factor × Confidence Adjustment',
      steps: [
        { label: 'Area', value: '1,250.5 ha', detail: 'From Sentinel-2 classified polygon' },
        { label: 'Emission Factor', value: '250 tC/ha', detail: 'IPCC Tier 2, Vietnam-specific for natural dipterocarp forest' },
        { label: 'Confidence Adjustment', value: '0.87', detail: 'Combined uncertainty from field sampling and remote sensing' },
        { label: 'Carbon Stock', value: '312,625 tC', detail: '1,250.5 × 250 = 312,625 tC' },
        { label: 'Adjusted Stock', value: '312,625 × 0.87 = 271,984 tC', detail: 'After applying confidence adjustment' },
        { label: 'CO2 Equivalent', value: '998,381 tCO2e', detail: '271,984 × 3.67 (molecular weight ratio)' },
      ],
    },
    trend: [
      { year: 2020, stock: 285000 },
      { year: 2021, stock: 292000 },
      { year: 2022, stock: 301000 },
      { year: 2023, stock: 308000 },
      { year: 2024, stock: 312625 },
    ],
    verificationChecks: [
      { check: 'Data completeness validation', status: 'passed' },
      { check: 'Satellite imagery cross-reference', status: 'passed' },
      { check: 'Field measurement consistency', status: 'passed' },
      { check: 'Emission factor applicability (Tier 2)', status: 'passed' },
      { check: 'Uncertainty quantification', status: 'warning' },
      { check: 'Buffer pool adequacy', status: 'pending' },
    ],
  },
  {
    id: '2',
    plotId: 'DL_YT_001',
    plotName: 'Ea Sup Natural Forest',
    year: 2024,
    carbonStock: 222.6,
    areaHa: 890.2,
    method: 'remote_sensing',
    methodLabel: 'Remote Sensing + AI Estimation',
    confidence: 0.72,
    status: 'under_review',
    emissionFactor: 250,
    co2e: 222.6 * 3.67,
    tier: 'Tier 2',
    verifiedBy: null,
    verifiedAt: null,
    calculation: {
      formula: 'Carbon Stock = Area × Emission Factor × Confidence Adjustment',
      steps: [
        { label: 'Area', value: '890.2 ha', detail: 'From Sentinel-2 + SAR classified polygon' },
        { label: 'Emission Factor', value: '250 tC/ha', detail: 'IPCC Tier 2, Vietnam-specific for natural forest' },
        { label: 'Confidence Adjustment', value: '0.72', detail: 'Lower confidence due to degradation and limited ground truth' },
        { label: 'Carbon Stock', value: '222,550 tC', detail: '890.2 × 250 = 222,550 tC' },
        { label: 'Adjusted Stock', value: '160,236 tC', detail: 'After applying confidence adjustment' },
        { label: 'CO2 Equivalent', value: '588,066 tCO2e', detail: '160,236 × 3.67' },
      ],
    },
    trend: [
      { year: 2020, stock: 240000 },
      { year: 2021, stock: 235000 },
      { year: 2022, stock: 231000 },
      { year: 2023, stock: 226000 },
      { year: 2024, stock: 222550 },
    ],
    verificationChecks: [
      { check: 'Data completeness validation', status: 'passed' },
      { check: 'Satellite imagery cross-reference', status: 'passed' },
      { check: 'Field measurement consistency', status: 'warning' },
      { check: 'Emission factor applicability', status: 'warning' },
      { check: 'Uncertainty quantification', status: 'failed' },
      { check: 'Buffer pool adequacy', status: 'pending' },
    ],
  },
  {
    id: '3',
    plotId: 'CM_CM_001',
    plotName: 'Ca Mau Mangrove Forest',
    year: 2024,
    carbonStock: 140.4,
    areaHa: 780.0,
    method: 'field_measurement',
    methodLabel: 'Field Measurement',
    confidence: 0.91,
    status: 'pending',
    emissionFactor: 180,
    co2e: 140.4 * 3.67,
    tier: 'Tier 2',
    verifiedBy: null,
    verifiedAt: null,
    calculation: {
      formula: 'Carbon Stock = Area × Emission Factor × Confidence Adjustment',
      steps: [
        { label: 'Area', value: '780.0 ha', detail: 'From mangrove-specific classification' },
        { label: 'Emission Factor', value: '180 tC/ha', detail: 'IPCC Tier 2, Vietnam mangrove-specific' },
        { label: 'Confidence Adjustment', value: '0.91', detail: 'High confidence from extensive field plots' },
        { label: 'Carbon Stock', value: '140,400 tC', detail: '780.0 × 180 = 140,400 tC' },
        { label: 'Adjusted Stock', value: '127,764 tC', detail: '140,400 × 0.91' },
        { label: 'CO2 Equivalent', value: '468,914 tCO2e', detail: '127,764 × 3.67' },
      ],
    },
    trend: [
      { year: 2020, stock: 128000 },
      { year: 2021, stock: 131000 },
      { year: 2022, stock: 134500 },
      { year: 2023, stock: 137800 },
      { year: 2024, stock: 140400 },
    ],
    verificationChecks: [
      { check: 'Data completeness validation', status: 'passed' },
      { check: 'Satellite imagery cross-reference', status: 'pending' },
      { check: 'Field measurement consistency', status: 'pending' },
      { check: 'Emission factor applicability', status: 'pending' },
      { check: 'Uncertainty quantification', status: 'pending' },
      { check: 'Buffer pool adequacy', status: 'pending' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return '#2D6A4F';
    case 'under_review':
      return '#0277BD';
    case 'verified':
      return '#40916C';
    case 'rejected':
      return '#D32F2F';
    case 'pending':
    default:
      return '#795548';
  }
}

function getCheckIcon(status: VerificationCheck['status']) {
  switch (status) {
    case 'passed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
      return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
}

function getCheckBadge(status: VerificationCheck['status']) {
  switch (status) {
    case 'passed':
      return <Badge className="text-[10px] bg-emerald-600 text-white hover:bg-emerald-600">Passed</Badge>;
    case 'warning':
      return <Badge className="text-[10px] bg-yellow-500 text-white hover:bg-yellow-500">Warning</Badge>;
    case 'failed':
      return <Badge className="text-[10px] bg-red-600 text-white hover:bg-red-600">Failed</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
  }
}

function getVerificationProgress(checks: VerificationCheck[]): number {
  const passed = checks.filter(c => c.status === 'passed').length;
  const total = checks.length;
  return Math.round((passed / total) * 100);
}

// ─── MRV Pipeline Stage ──────────────────────────────────────────

function getMrvStage(status: string): { stage: number; label: string; description: string } {
  switch (status) {
    case 'pending':
      return { stage: 1, label: 'Monitoring', description: 'Data collection and satellite analysis in progress' };
    case 'under_review':
      return { stage: 2, label: 'Internal Review', description: 'Internal QA/QC review of carbon calculations' };
    case 'approved':
      return { stage: 3, label: 'Approved', description: 'Approved internally — awaiting third-party verification' };
    case 'verified':
      return { stage: 4, label: 'Verified', description: 'Third-party verification complete' };
    case 'rejected':
      return { stage: 0, label: 'Rejected', description: 'Record rejected — requires correction and resubmission' };
    default:
      return { stage: 1, label: 'Monitoring', description: 'Initial data collection phase' };
  }
}

const MRV_STAGES = [
  { label: 'Monitoring', description: 'Data Collection' },
  { label: 'Internal Review', description: 'QA/QC Process' },
  { label: 'Approved', description: 'Ready for Verification' },
  { label: 'Verified', description: 'Third-Party Verified' },
];

// ─── Not Found State ──────────────────────────────────────────────

function CarbonRecordNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <CloudCog className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Carbon Record Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The carbon record you are looking for does not exist or has been removed.
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
        Back to REDD+/dMRV
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

export default function CarbonRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const recordData = useMemo(
    () => CARBON_DETAIL_DATA.find(r => r.id === recordId) ?? null,
    [recordId]
  );

  // Track current status so workflow actions can update it
  const [currentStatus, setCurrentStatus] = useState<string>(
    recordData?.status ?? 'pending'
  );

  const handleBack = () => router.push('/carbon');

  const handleTransition = (_fromState: string, toState: string, _action: string) => {
    setCurrentStatus(toState);
  };

  // ─── Not Found ───────────────────────────────────────────────────
  if (!recordData) {
    return (
      <div className="p-6">
        <CarbonRecordNotFound onBack={handleBack} />
      </div>
    );
  }

  // ─── Resolve display info ────────────────────────────────────────
  const workflow = getWorkflow('carbon_record');
  const stateInfo = getStateInfo('carbon_record', currentStatus);
  const mrvStage = getMrvStage(currentStatus);
  const verificationProgress = getVerificationProgress(recordData.verificationChecks);
  const passedChecks = recordData.verificationChecks.filter(c => c.status === 'passed').length;
  const totalChecks = recordData.verificationChecks.length;

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
          Back to REDD+/dMRV
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-xs text-muted-foreground">
          Carbon Records
        </span>
      </div>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${getStatusColor(currentStatus)}15`,
            color: getStatusColor(currentStatus),
          }}
        >
          <CloudCog className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">
              {recordData.plotName}
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] h-5 font-mono"
            >
              {recordData.plotId}
            </Badge>
            <WorkflowStatusBadge entity="carbon_record" status={currentStatus} size="md" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Carbon stock record for {recordData.plotName} ({recordData.plotId}) — {recordData.year} assessment using {recordData.methodLabel}.
          </p>
        </div>
      </div>

      <Separator />

      {/* ─── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <CloudCog className="w-4 h-4 text-emerald-600 mb-1.5" />
            <p className="text-lg font-bold text-emerald-700">
              {recordData.carbonStock.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Carbon Stock (tC)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <TrendingUp className="w-4 h-4 text-emerald-500 mb-1.5" />
            <p className="text-lg font-bold text-emerald-600">
              {recordData.co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </p>
            <p className="text-[10px] text-muted-foreground">CO₂ Equivalent (tCO₂e)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <Calculator className="w-4 h-4 text-amber-600 mb-1.5" />
            <p className="text-sm font-bold text-amber-700">
              {recordData.methodLabel}
            </p>
            <p className="text-[10px] text-muted-foreground">Method</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <FileCheck className="w-4 h-4 text-blue-600 mb-1.5" />
            <p className="text-lg font-bold text-blue-600">
              {(recordData.confidence * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Confidence</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <ShieldCheck className="w-4 h-4 mb-1.5" style={{ color: getStatusColor(currentStatus) }} />
            <p className="text-sm font-bold" style={{ color: getStatusColor(currentStatus) }}>
              {recordData.verifiedBy ?? 'Pending'}
            </p>
            <p className="text-[10px] text-muted-foreground">Verification</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <Badge variant="outline" className="text-[10px] h-5 mb-1.5">{recordData.tier}</Badge>
            <p className="text-sm font-bold">{recordData.emissionFactor} tC/ha</p>
            <p className="text-[10px] text-muted-foreground">Emission Factor</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Layout: Left (2/3) + Right (1/3) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Carbon Details */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CloudCog className="w-4 h-4" />
                Carbon Record Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <MetadataItem
                  icon={<CloudCog className="w-4 h-4" />}
                  label="Assessment Year"
                >
                  <span className="font-medium">{recordData.year}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Forest Plot"
                >
                  <span className="font-mono font-medium">{recordData.plotId}</span>
                  <span className="text-muted-foreground text-xs ml-1">({recordData.plotName})</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Calculator className="w-4 h-4" />}
                  label="Method"
                >
                  <span className="font-medium">{recordData.methodLabel}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<FileCheck className="w-4 h-4" />}
                  label="Emission Factor"
                >
                  <span className="font-medium">{recordData.emissionFactor} tC/ha</span>
                </MetadataItem>

                <MetadataItem
                  icon={<CloudCog className="w-4 h-4" />}
                  label="Area"
                >
                  <span className="font-medium">{recordData.areaHa.toLocaleString()} ha</span>
                </MetadataItem>

                <MetadataItem
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Verification"
                >
                  {recordData.verifiedBy ? (
                    <span className="font-medium">{recordData.verifiedBy}</span>
                  ) : (
                    <span className="text-muted-foreground">Awaiting third-party verification</span>
                  )}
                </MetadataItem>

                <MetadataItem
                  icon={<FileCheck className="w-4 h-4" />}
                  label="IPCC Tier"
                >
                  <Badge variant="outline" className="text-[10px] h-5">{recordData.tier}</Badge>
                </MetadataItem>

                <MetadataItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Confidence Level"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{(recordData.confidence * 100).toFixed(0)}%</span>
                    <Progress
                      value={recordData.confidence * 100}
                      className="h-1.5 w-20"
                    />
                  </div>
                </MetadataItem>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status / MRV Pipeline */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                MRV Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                The MRV cycle follows: Monitoring → Internal Review → Approval → Third-Party Verification.
                Current stage: <span className="font-medium" style={{ color: getStatusColor(currentStatus) }}>{mrvStage.label}</span>
              </p>
              <div className="space-y-4">
                {MRV_STAGES.map((stage, i) => {
                  const stageNum = i + 1;
                  const isCompleted = stageNum < mrvStage.stage;
                  const isCurrent = stageNum === mrvStage.stage;
                  const isPending = stageNum > mrvStage.stage;
                  // Special case for rejected
                  const isRejected = mrvStage.stage === 0;

                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isRejected
                            ? 'bg-red-500 text-white'
                            : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isRejected && i === 0 ? '✗' : isCompleted ? '✓' : isCurrent ? '⏳' : stageNum}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{stage.label}</p>
                            <p className="text-xs text-muted-foreground">{stage.description}</p>
                          </div>
                          <Badge
                            variant={
                              isRejected
                                ? 'destructive'
                                : isCompleted
                                  ? 'default'
                                  : isCurrent
                                    ? 'secondary'
                                    : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {isRejected ? 'Rejected' : isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            isRejected ? 0 : isCompleted ? 100 : isCurrent ? 50 : 0
                          }
                          className="h-1.5 mt-2"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Calculation Breakdown */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculation Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-semibold text-emerald-800 mb-1">Formula</p>
                <p className="text-sm font-mono text-emerald-700">{recordData.calculation.formula}</p>
              </div>
              <div className="space-y-3">
                {recordData.calculation.steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{step.label}</p>
                        <p className="text-xs font-mono font-medium text-emerald-700">{step.value}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historical Trend */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Historical Carbon Stock Trend — {recordData.plotId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={recordData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11 }}
                    stroke="#4A6A54"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#4A6A54"
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #C8E6C9',
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} tC`,
                      'Carbon Stock',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#2D6A4F"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2D6A4F', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#2D6A4F', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>
                  {recordData.trend[0]?.year}–{recordData.trend[recordData.trend.length - 1]?.year} trend
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  {recordData.trend[recordData.trend.length - 1]?.stock > recordData.trend[0]?.stock
                    ? 'Increasing'
                    : 'Decreasing'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Verification Checklist
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {passedChecks}/{totalChecks}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Verification Progress</span>
                  <span className="font-medium">{verificationProgress}%</span>
                </div>
                <Progress value={verificationProgress} className="h-2" />
              </div>
              <div className="space-y-3">
                {recordData.verificationChecks.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {getCheckIcon(item.status)}
                    <span className="text-sm flex-1">{item.check}</span>
                    {getCheckBadge(item.status)}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold">
                  Third-Party Auditor: {recordData.verifiedBy ?? 'Not yet assigned'}
                </p>
                <p>
                  Audit cycle: {recordData.year}-Q4 | Status:{' '}
                  {currentStatus === 'verified'
                    ? 'Completed'
                    : currentStatus === 'approved'
                      ? 'Ready for third-party review'
                      : currentStatus === 'under_review'
                        ? 'Internal review in progress'
                        : 'Pending internal review'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <WorkflowTimeline
            entity="carbon_record"
            entityId={recordData.id}
            currentStatus={currentStatus}
          />
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
                <WorkflowStatusBadge entity="carbon_record" status={currentStatus} size="lg" />
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
                    Record ID
                  </p>
                  <p className="font-mono mt-0.5">#{recordData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          <WorkflowActions
            entity="carbon_record"
            entityId={recordData.id}
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
                <span className="font-mono font-medium">{recordData.plotId}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Plot Name</span>
                <span className="font-medium text-right max-w-[160px] truncate">{recordData.plotName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium">{recordData.year}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Area</span>
                <span className="font-medium">{recordData.areaHa.toLocaleString()} ha</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carbon Stock</span>
                <span className="font-medium">{recordData.carbonStock.toLocaleString()} tC</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CO₂ Equivalent</span>
                <span className="font-medium">{recordData.co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO₂e</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{(recordData.confidence * 100).toFixed(0)}%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-right max-w-[140px] truncate">{recordData.methodLabel}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Verified By</span>
                <span className="font-medium">{recordData.verifiedBy ?? '—'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">IPCC Tier</span>
                <Badge variant="outline" className="text-[10px] h-4">{recordData.tier}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
