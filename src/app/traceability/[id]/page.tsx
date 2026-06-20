'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  QrCode,
  ArrowLeft,
  ShieldCheck,
  Ship,
  Link2,
  FileCheck,
  Globe,
  MapPin,
  TreePine,
  ClipboardCheck,
  Truck,
  PackageCheck,
} from 'lucide-react';
import { TIMBER_STATUS_MAP } from '@/lib/constants';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';

// ─── Types ────────────────────────────────────────────────────────

interface EudrComplianceItem {
  item: string;
  status: 'compliant' | 'in_progress' | 'pending' | 'failed';
  detail: string;
}

interface SupplyChainStep {
  step: string;
  location: string;
  time: string;
  status: 'done' | 'pending' | 'failed';
  detail: string;
}

interface ShipmentRecord {
  id: string;
  origin: string;
  destination: string;
  mode: string;
  status: 'delivered' | 'in_transit' | 'pending';
  shipped: string;
  delivered: string | null;
}

interface BlockchainAuditRecord {
  txHash: string;
  action: string;
  time: string;
  block: number;
  detail: string;
}

interface TimberPassportDetail {
  id: string;
  species: string;
  speciesName: string;
  speciesCommon: string;
  volume: number;
  plot: string;
  plotName: string;
  vpaStatus: string;
  hash: string | null;
  qrCodeUrl: string | null;
  pdfPath: string | null;
  issuedAt: string;
  origin: string;
  province: string;
  harvestPermit: string;
  harvestPermitValid: boolean;
  harvestDate: string | null;
  blockLevelData: boolean;
  citesStatus: string;
  rejectionReason?: string;
  eudrCompliance: EudrComplianceItem[];
  supplyChain: SupplyChainStep[];
  shipments: ShipmentRecord[];
  blockchainAudits: BlockchainAuditRecord[];
}

// ─── Mock Data ────────────────────────────────────────────────────

const PASSPORTS_DETAIL: TimberPassportDetail[] = [
  {
    id: 'WP-2025-001',
    species: 'Dipterocarpus alatus (Resin Dipterocarp)',
    speciesName: 'Dipterocarpus alatus',
    speciesCommon: 'Resin Dipterocarp',
    volume: 15.5,
    plot: 'DN_BGM_001',
    plotName: 'Bu Gia Map Natural Forest',
    vpaStatus: 'delivered',
    hash: '0xabc123def456789012345678901234abcd',
    qrCodeUrl: null,
    pdfPath: null,
    issuedAt: '2025-01-15',
    origin: 'Bu Gia Map Natural Forest, Dong Nai',
    province: 'Dong Nai',
    harvestPermit: 'HP-DN-2025-0012',
    harvestPermitValid: true,
    harvestDate: '2025-01-10',
    blockLevelData: true,
    citesStatus: 'Not listed',
    eudrCompliance: [
      { item: 'Geolocation of Production Plot', status: 'compliant', detail: 'GPS coordinates verified within plot boundary DN_BGM_001. Polygon area: 1,250.5 ha.' },
      { item: 'Product Description & HS Code', status: 'compliant', detail: 'Species: Dipterocarpus alatus. HS Code: 4403.49. Volume: 15.5 m³ roundwood.' },
      { item: 'Legality Assurance (VNTLAS)', status: 'compliant', detail: 'Valid harvest permit issued under VNTLAS. Forest land use right verified.' },
      { item: 'Date & Area of Harvest', status: 'in_progress', detail: 'Block-level harvest date available. Aggregated at plot level for reporting.' },
      { item: 'Supply Chain Traceability', status: 'compliant', detail: 'Blockchain audit trail complete from harvest to delivery.' },
      { item: 'Deforestation-Free Declaration', status: 'compliant', detail: 'Satellite analysis confirms no deforestation after Dec 31, 2020.' },
    ],
    supplyChain: [
      { step: 'Harvest Planning', location: 'Plot DN_BGM_001, Dong Nai', time: '2025-01-05', status: 'done', detail: 'Annual allowable cut approved by Provincial Forest Authority' },
      { step: 'Tree Felling & Extraction', location: 'Bu Gia Map Natural Forest', time: '2025-01-10', status: 'done', detail: 'Reduced-impact logging. GPS-tagged stumps.' },
      { step: 'VPA/FLEGT Due Diligence', location: 'Dong Nai Forest Ranger Station', time: '2025-01-12', status: 'done', detail: 'VNTLAS legality verification completed.' },
      { step: 'Wood Passport Issued', location: 'Terra Forest System', time: '2025-01-15', status: 'done', detail: 'Digital passport with blockchain hash generated.' },
      { step: 'Warehouse Exit Inspection', location: 'Dong Nai Depot', time: '2025-01-15', status: 'done', detail: 'Physical verification against passport. Volume confirmed.' },
      { step: 'Transport', location: 'Dong Nai → HCMC', time: '2025-01-16', status: 'done', detail: 'GPS-tracked truck transport.' },
      { step: 'Destination Received', location: 'HCMC Processing Plant', time: '2025-01-16', status: 'done', detail: 'Chain of custody complete.' },
    ],
    shipments: [
      { id: 'S-001', origin: 'Dong Nai', destination: 'Ho Chi Minh City', mode: 'truck', status: 'delivered', shipped: '2025-01-16', delivered: '2025-01-16' },
    ],
    blockchainAudits: [
      { txHash: '0xabc1...def1', action: 'ISSUE_PASSPORT', time: '2025-01-15 10:30', block: 19423456, detail: 'Passport issued for 15.5 m³ Dipterocarpus alatus' },
      { txHash: '0xabc2...def2', action: 'VERIFY_VPA', time: '2025-01-12 14:15', block: 19421234, detail: 'VPA/FLEGT verification passed' },
      { txHash: '0xabc3...def3', action: 'SHIPMENT_DISPATCH', time: '2025-01-16 06:00', block: 19425678, detail: 'Shipment dispatched from Dong Nai depot' },
      { txHash: '0xabc4...def4', action: 'SHIPMENT_DELIVER', time: '2025-01-16 14:30', block: 19427890, detail: 'Delivery confirmed at HCMC' },
      { txHash: '0xabc5...def5', action: 'EUDR_CHECK', time: '2025-01-14 09:00', block: 19422000, detail: 'EUDR deforestation-free check completed' },
    ],
  },
  {
    id: 'WP-2025-003',
    species: 'Fokienia hodginsii (Fujian Cypress)',
    speciesName: 'Fokienia hodginsii',
    speciesCommon: 'Fujian Cypress',
    volume: 8.3,
    plot: 'LD_DL_001',
    plotName: 'Lam Dong Protection Forest',
    vpaStatus: 'pending',
    hash: null,
    qrCodeUrl: null,
    pdfPath: null,
    issuedAt: '2025-02-01',
    origin: 'Lam Dong Protection Forest, Lam Dong',
    province: 'Lam Dong',
    harvestPermit: 'HP-LD-2025-0003',
    harvestPermitValid: true,
    harvestDate: '2025-01-28',
    blockLevelData: false,
    citesStatus: 'CITES Appendix II',
    eudrCompliance: [
      { item: 'Geolocation of Production Plot', status: 'compliant', detail: 'GPS coordinates verified within LD_DL_001.' },
      { item: 'Product Description & HS Code', status: 'compliant', detail: 'Species: Fokienia hodginsii. HS Code: 4403.49. Volume: 8.3 m³.' },
      { item: 'Legality Assurance (VNTLAS)', status: 'in_progress', detail: 'VNTLAS verification pending. Protection forest harvest requires additional authorization.' },
      { item: 'Date & Area of Harvest', status: 'pending', detail: 'Block-level data not yet available.' },
      { item: 'Supply Chain Traceability', status: 'pending', detail: 'Awaiting VPA verification.' },
      { item: 'Deforestation-Free Declaration', status: 'compliant', detail: 'Satellite confirms no deforestation after Dec 31, 2020.' },
    ],
    supplyChain: [
      { step: 'Harvest Planning', location: 'Plot LD_DL_001, Lam Dong', time: '2025-01-25', status: 'done', detail: 'Protection forest harvest permit applied for.' },
      { step: 'Tree Felling & Extraction', location: 'Lam Dong Protection Forest', time: '2025-01-28', status: 'done', detail: 'Selective felling of mature Fokienia trees. Reduced-impact extraction.' },
      { step: 'VPA/FLEGT Due Diligence', location: 'Lam Dong Forest Authority', time: '—', status: 'pending', detail: 'VNTLAS verification in progress. Additional documentation required for CITES Appendix II species.' },
      { step: 'Wood Passport Issued', location: '—', time: '—', status: 'pending', detail: 'Awaiting VPA clearance.' },
    ],
    shipments: [],
    blockchainAudits: [
      { txHash: '0xmno3...pqr1', action: 'HARVEST_PERMIT', time: '2025-01-25 08:00', block: 19430001, detail: 'Harvest permit HP-LD-2025-0003 registered' },
    ],
  },
  {
    id: 'WP-2025-004',
    species: 'Rhizophora apiculata (Stilt Mangrove)',
    speciesName: 'Rhizophora apiculata',
    speciesCommon: 'Stilt Mangrove',
    volume: 30.0,
    plot: 'CM_CM_001',
    plotName: 'Ca Mau Mangrove Forest',
    vpaStatus: 'rejected',
    hash: null,
    qrCodeUrl: null,
    pdfPath: null,
    issuedAt: '2025-02-05',
    origin: 'Ca Mau Mangrove Forest, Ca Mau',
    province: 'Ca Mau',
    harvestPermit: 'HP-CM-2025-0007',
    harvestPermitValid: false,
    harvestDate: null,
    blockLevelData: false,
    citesStatus: 'Not listed',
    rejectionReason: 'Harvest permit expired — VNTLAS due diligence failed. Mangrove harvesting restricted under Decision 28/2018/QD-TTg.',
    eudrCompliance: [
      { item: 'Geolocation of Production Plot', status: 'compliant', detail: 'GPS coordinates within CM_CM_001.' },
      { item: 'Product Description & HS Code', status: 'compliant', detail: 'Species: Rhizophora apiculata. Volume: 30.0 m³.' },
      { item: 'Legality Assurance (VNTLAS)', status: 'failed', detail: 'Harvest permit expired. Mangrove harvesting restricted under Decision 28/2018/QD-TTg.' },
      { item: 'Date & Area of Harvest', status: 'failed', detail: 'No valid harvest date — permit expired.' },
      { item: 'Supply Chain Traceability', status: 'failed', detail: 'Cannot proceed without valid VPA.' },
      { item: 'Deforestation-Free Declaration', status: 'compliant', detail: 'No deforestation detected by satellite.' },
    ],
    supplyChain: [
      { step: 'Harvest Planning', location: 'Ca Mau', time: '2025-02-01', status: 'done', detail: 'Harvest planned for mangrove area.' },
      { step: 'VPA/FLEGT Due Diligence', location: 'Ca Mau Forest Authority', time: '2025-02-05', status: 'failed', detail: 'VNTLAS check failed. Harvest permit expired. Mangrove restrictions apply.' },
    ],
    shipments: [],
    blockchainAudits: [
      { txHash: '0xmno5...pqr3', action: 'REJECT_PASSPORT', time: '2025-02-05 16:00', block: 19432000, detail: 'VPA verification failed. Harvest permit expired. Mangrove restrictions apply.' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

function getEudrStatusConfig(status: string) {
  switch (status) {
    case 'compliant':
      return { label: 'Compliant', color: '#2D6A4F', bgColor: '#D8F3DC', icon: '✓' };
    case 'in_progress':
      return { label: 'In Progress', color: '#E65100', bgColor: '#FFF3E0', icon: '⟳' };
    case 'pending':
      return { label: 'Pending', color: '#795548', bgColor: '#EFEBE9', icon: '○' };
    case 'failed':
      return { label: 'Failed', color: '#D32F2F', bgColor: '#FFEBEE', icon: '✗' };
    default:
      return { label: 'Unknown', color: '#9E9E9E', bgColor: '#F5F5F5', icon: '?' };
  }
}

function getSupplyChainStepIcon(index: number, stepName: string): React.ReactNode {
  if (stepName.includes('Harvest')) return <TreePine className="w-4 h-4" />;
  if (stepName.includes('Felling') || stepName.includes('Extraction')) return <TreePine className="w-4 h-4" />;
  if (stepName.includes('VPA') || stepName.includes('FLEGT')) return <ShieldCheck className="w-4 h-4" />;
  if (stepName.includes('Passport')) return <QrCode className="w-4 h-4" />;
  if (stepName.includes('Inspection')) return <ClipboardCheck className="w-4 h-4" />;
  if (stepName.includes('Transport')) return <Truck className="w-4 h-4" />;
  if (stepName.includes('Received') || stepName.includes('Destination')) return <PackageCheck className="w-4 h-4" />;
  return <FileCheck className="w-4 h-4" />;
}

function getShipmentModeLabel(mode: string) {
  switch (mode) {
    case 'truck': return 'Truck';
    case 'rail': return 'Rail';
    case 'ship': return 'Ship';
    default: return mode;
  }
}

function getShipmentStatusConfig(status: string) {
  switch (status) {
    case 'delivered':
      return { label: 'Delivered', color: '#52B788', bgColor: '#D8F3DC' };
    case 'in_transit':
      return { label: 'In Transit', color: '#0277BD', bgColor: '#E1F5FE' };
    case 'pending':
      return { label: 'Pending', color: '#795548', bgColor: '#EFEBE9' };
    default:
      return { label: status, color: '#9E9E9E', bgColor: '#F5F5F5' };
  }
}

function getActionBadgeColor(action: string) {
  if (action.includes('ISSUE') || action.includes('HARVEST_PERMIT')) return { bg: '#D8F3DC', text: '#2D6A4F' };
  if (action.includes('VERIFY') || action.includes('CHECK')) return { bg: '#E1F5FE', text: '#0277BD' };
  if (action.includes('SHIPMENT_DISPATCH')) return { bg: '#FFF3E0', text: '#E65100' };
  if (action.includes('SHIPMENT_DELIVER')) return { bg: '#D8F3DC', text: '#52B788' };
  if (action.includes('REJECT')) return { bg: '#FFEBEE', text: '#D32F2F' };
  return { bg: '#F5F5F5', text: '#795548' };
}

// ─── Not Found State ──────────────────────────────────────────────

function PassportNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <QrCode className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Passport Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The timber passport you are looking for does not exist or has been removed.
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
        Back to Timber Traceability
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

// ─── Summary Card ─────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-lg border-0 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold truncate">{value}</p>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground truncate">{sublabel}</p>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────

export default function TimberPassportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passportId = params.id as string;

  const passportData = useMemo(
    () => PASSPORTS_DETAIL.find(p => p.id === passportId) ?? null,
    [passportId]
  );

  // Track current workflow status
  const [currentStatus, setCurrentStatus] = useState<string>(
    passportData?.vpaStatus ?? 'pending'
  );

  const handleBack = () => router.push('/traceability');

  const handleTransition = (fromState: string, toState: string, _action: string) => {
    setCurrentStatus(toState);
  };

  // ─── Not Found ───────────────────────────────────────────────────
  if (!passportData) {
    return (
      <div className="p-6">
        <PassportNotFound onBack={handleBack} />
      </div>
    );
  }

  // ─── Resolve display info ────────────────────────────────────────
  const workflow = getWorkflow('timber_passport');
  const stateInfo = getStateInfo('timber_passport', currentStatus);
  const statusMap = TIMBER_STATUS_MAP[currentStatus] ?? TIMBER_STATUS_MAP.pending;

  // Compute EUDR compliance progress
  const eudrCompliant = passportData.eudrCompliance.filter(e => e.status === 'compliant').length;
  const eudrTotal = passportData.eudrCompliance.length;
  const eudrProgress = Math.round((eudrCompliant / eudrTotal) * 100);

  // Compute supply chain progress
  const scDone = passportData.supplyChain.filter(s => s.status === 'done').length;
  const scTotal = passportData.supplyChain.length;
  const scProgress = Math.round((scDone / scTotal) * 100);

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
          Back to Timber Traceability
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-xs text-muted-foreground">
          Timber Traceability
        </span>
      </div>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${statusMap.color}15`,
            color: statusMap.color,
          }}
        >
          <QrCode className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{passportData.id}</h1>
            <WorkflowStatusBadge entity="timber_passport" status={currentStatus} size="md" />
            {passportData.citesStatus !== 'Not listed' && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 border-amber-500 text-amber-600"
              >
                {passportData.citesStatus}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] h-5 text-forest-600 border-forest-300">
              <TreePine className="w-3 h-3 mr-1" />
              {passportData.speciesCommon}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {passportData.species} — {passportData.volume} m³ from {passportData.origin}
          </p>
          {passportData.rejectionReason && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
              <span className="font-semibold">Rejection Reason:</span>{' '}
              {passportData.rejectionReason}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-8 flex-shrink-0">
          <QrCode className="w-3.5 h-3.5" />
          QR Code
        </Button>
      </div>

      <Separator />

      {/* ─── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          icon={<TreePine className="w-3.5 h-3.5" />}
          label="Volume"
          value={`${passportData.volume} m³`}
          color="#2D6A4F"
        />
        <SummaryCard
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="VPA Status"
          value={statusMap.label}
          color={statusMap.color}
        />
        <SummaryCard
          icon={<Globe className="w-3.5 h-3.5" />}
          label="EUDR"
          value={`${eudrCompliant}/${eudrTotal}`}
          sublabel={`${eudrProgress}% compliant`}
          color={eudrProgress === 100 ? '#2D6A4F' : eudrProgress >= 50 ? '#E65100' : '#D32F2F'}
        />
        <SummaryCard
          icon={<FileCheck className="w-3.5 h-3.5" />}
          label="CITES"
          value={passportData.citesStatus === 'Not listed' ? 'Not Listed' : passportData.citesStatus}
          color={passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100'}
        />
        <SummaryCard
          icon={<Link2 className="w-3.5 h-3.5" />}
          label="Blockchain Hash"
          value={passportData.hash ? passportData.hash.slice(0, 10) + '...' : 'Not issued'}
          sublabel={passportData.hash ? 'Anchored' : 'Pending'}
          color={passportData.hash ? '#2D6A4F' : '#795548'}
        />
        <SummaryCard
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Origin Plot"
          value={passportData.plot}
          sublabel={passportData.plotName}
          color="#0277BD"
        />
      </div>

      {/* ─── Main Layout: Left (2/3) + Right (1/3) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Passport Details */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Passport Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <MetadataItem
                  icon={<TreePine className="w-4 h-4" />}
                  label="Species"
                >
                  <span className="font-medium">{passportData.speciesName}</span>
                  <span className="text-muted-foreground text-xs ml-1">({passportData.speciesCommon})</span>
                </MetadataItem>

                <MetadataItem
                  icon={<QrCode className="w-4 h-4" />}
                  label="Volume"
                >
                  <span className="font-semibold">{passportData.volume} m³</span>
                </MetadataItem>

                <MetadataItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Forest Plot"
                >
                  <span className="font-mono font-medium">{passportData.plot}</span>
                  <span className="text-muted-foreground text-xs ml-1">— {passportData.plotName}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Globe className="w-4 h-4" />}
                  label="Origin"
                >
                  <span>{passportData.origin}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<ClipboardCheck className="w-4 h-4" />}
                  label="Issuance Date"
                >
                  <span className="font-medium">{passportData.issuedAt}</span>
                </MetadataItem>

                <MetadataItem
                  icon={<Link2 className="w-4 h-4" />}
                  label="Blockchain Hash"
                >
                  {passportData.hash ? (
                    <span className="font-mono text-xs break-all">{passportData.hash}</span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Not yet issued</span>
                  )}
                </MetadataItem>

                <MetadataItem
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Harvest Permit"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-xs">{passportData.harvestPermit}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4"
                      style={{
                        color: passportData.harvestPermitValid ? '#2D6A4F' : '#D32F2F',
                        borderColor: passportData.harvestPermitValid ? '#2D6A4F' : '#D32F2F',
                        backgroundColor: passportData.harvestPermitValid ? '#D8F3DC' : '#FFEBEE',
                      }}
                    >
                      {passportData.harvestPermitValid ? 'Valid' : 'Expired'}
                    </Badge>
                  </div>
                </MetadataItem>

                <MetadataItem
                  icon={<TreePine className="w-4 h-4" />}
                  label="Harvest Date"
                >
                  <span className="font-medium">
                    {passportData.harvestDate ?? '—'}
                  </span>
                </MetadataItem>

                <MetadataItem
                  icon={<FileCheck className="w-4 h-4" />}
                  label="Block-Level Data"
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4"
                    style={{
                      color: passportData.blockLevelData ? '#2D6A4F' : '#795548',
                      borderColor: passportData.blockLevelData ? '#2D6A4F' : '#795548',
                      backgroundColor: passportData.blockLevelData ? '#D8F3DC' : '#EFEBE9',
                    }}
                  >
                    {passportData.blockLevelData ? 'Available' : 'Not Available'}
                  </Badge>
                </MetadataItem>

                <MetadataItem
                  icon={<Globe className="w-4 h-4" />}
                  label="CITES Status"
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4"
                    style={{
                      color: passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100',
                      borderColor: passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100',
                      backgroundColor: passportData.citesStatus === 'Not listed' ? '#D8F3DC' : '#FFF3E0',
                    }}
                  >
                    {passportData.citesStatus}
                  </Badge>
                </MetadataItem>
              </div>
            </CardContent>
          </Card>

          {/* VPA/FLEGT Compliance */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                VPA/FLEGT Due Diligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 mb-4 text-xs space-y-2">
                <p className="font-semibold">Vietnam Timber Legality Assurance System (VNTLAS)</p>
                <p className="text-muted-foreground">
                  Under the Vietnam-EU VPA, all timber must pass VNTLAS due diligence before export.
                  This includes harvest permit verification, chain of custody, and legality of origin.
                </p>
              </div>
              <div className="space-y-3">
                {/* VPA checklist items derived from passport data */}
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: passportData.harvestPermitValid ? '#D8F3DC' : '#FFEBEE',
                      color: passportData.harvestPermitValid ? '#2D6A4F' : '#D32F2F',
                    }}
                  >
                    {passportData.harvestPermitValid ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Harvest Permit Valid</p>
                    <p className="text-[10px] text-muted-foreground">
                      Permit {passportData.harvestPermit} is {passportData.harvestPermitValid ? 'valid' : 'expired'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: passportData.harvestPermitValid ? '#2D6A4F' : '#D32F2F',
                      borderColor: passportData.harvestPermitValid ? '#2D6A4F' : '#D32F2F',
                      backgroundColor: passportData.harvestPermitValid ? '#D8F3DC' : '#FFEBEE',
                    }}
                  >
                    {passportData.harvestPermitValid ? 'Pass' : 'Fail'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: passportData.blockLevelData ? '#D8F3DC' : '#FFF3E0',
                      color: passportData.blockLevelData ? '#2D6A4F' : '#E65100',
                    }}
                  >
                    {passportData.blockLevelData ? '✓' : '!'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Block-Level Harvest Data</p>
                    <p className="text-[10px] text-muted-foreground">
                      {passportData.blockLevelData
                        ? 'Block-level harvest date and location recorded'
                        : 'Block-level data not yet available — aggregated at plot level'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: passportData.blockLevelData ? '#2D6A4F' : '#E65100',
                      borderColor: passportData.blockLevelData ? '#2D6A4F' : '#E65100',
                      backgroundColor: passportData.blockLevelData ? '#D8F3DC' : '#FFF3E0',
                    }}
                  >
                    {passportData.blockLevelData ? 'Pass' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: passportData.hash ? '#D8F3DC' : '#EFEBE9',
                      color: passportData.hash ? '#2D6A4F' : '#795548',
                    }}
                  >
                    {passportData.hash ? '✓' : '○'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Blockchain Verification</p>
                    <p className="text-[10px] text-muted-foreground">
                      {passportData.hash
                        ? 'Digital passport anchored to blockchain with immutable hash'
                        : 'No blockchain hash — passport not yet issued'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: passportData.hash ? '#2D6A4F' : '#795548',
                      borderColor: passportData.hash ? '#2D6A4F' : '#795548',
                      backgroundColor: passportData.hash ? '#D8F3DC' : '#EFEBE9',
                    }}
                  >
                    {passportData.hash ? 'Pass' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor:
                        passportData.citesStatus === 'Not listed' ? '#D8F3DC' : '#FFF3E0',
                      color:
                        passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100',
                    }}
                  >
                    {passportData.citesStatus === 'Not listed' ? '✓' : '!'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">CITES Compliance</p>
                    <p className="text-[10px] text-muted-foreground">
                      {passportData.citesStatus === 'Not listed'
                        ? 'Species not listed under CITES — no additional permits required'
                        : `${passportData.citesStatus} — additional CITES export permit required`}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100',
                      borderColor: passportData.citesStatus === 'Not listed' ? '#2D6A4F' : '#E65100',
                      backgroundColor: passportData.citesStatus === 'Not listed' ? '#D8F3DC' : '#FFF3E0',
                    }}
                  >
                    {passportData.citesStatus === 'Not listed' ? 'Pass' : 'Action Needed'}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: passportData.harvestDate ? '#D8F3DC' : '#FFEBEE',
                      color: passportData.harvestDate ? '#2D6A4F' : '#D32F2F',
                    }}
                  >
                    {passportData.harvestDate ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Harvest Date Recorded</p>
                    <p className="text-[10px] text-muted-foreground">
                      {passportData.harvestDate
                        ? `Harvest date: ${passportData.harvestDate}`
                        : 'No valid harvest date on record'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={{
                      color: passportData.harvestDate ? '#2D6A4F' : '#D32F2F',
                      borderColor: passportData.harvestDate ? '#2D6A4F' : '#D32F2F',
                      backgroundColor: passportData.harvestDate ? '#D8F3DC' : '#FFEBEE',
                    }}
                  >
                    {passportData.harvestDate ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EUDR Compliance */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-forest-600" />
                EUDR Compliance — EU Deforestation Regulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 mb-4 text-xs space-y-2">
                <p className="font-semibold">Regulation (EU) 2023/1115</p>
                <p className="text-muted-foreground">
                  Requires operators to demonstrate timber products are deforestation-free,
                  legally produced, and covered by due diligence including geolocation,
                  product description, and risk assessment.
                </p>
              </div>

              {/* EUDR Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">EUDR Compliance Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {eudrCompliant} of {eudrTotal} items compliant ({eudrProgress}%)
                  </span>
                </div>
                <Progress value={eudrProgress} className="h-2" />
              </div>

              <div className="space-y-3">
                {passportData.eudrCompliance.map((item, i) => {
                  const config = getEudrStatusConfig(item.status);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                        }}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{item.item}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 flex-shrink-0"
                        style={{
                          color: config.color,
                          borderColor: config.color,
                          backgroundColor: config.bgColor,
                        }}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain / Chain of Custody */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Ship className="w-4 h-4 text-forest-600" />
                Supply Chain / Chain of Custody
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
                  {scDone}/{scTotal} complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Supply Chain Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">Chain of Custody Progress</span>
                  <span className="text-xs text-muted-foreground">{scProgress}%</span>
                </div>
                <Progress value={scProgress} className="h-2" />
              </div>

              <div className="space-y-0">
                {passportData.supplyChain.map((step, i) => {
                  const stepIcon = getSupplyChainStepIcon(i, step.step);
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            step.status === 'done'
                              ? 'bg-forest-500/10 text-forest-600'
                              : step.status === 'failed'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {stepIcon}
                        </div>
                        {i < passportData.supplyChain.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              step.status === 'done' ? 'bg-forest-300' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold">{step.step}</p>
                          {step.status === 'done' && (
                            <Badge className="bg-forest-500 text-white text-[9px] h-4 px-1.5">
                              Done
                            </Badge>
                          )}
                          {step.status === 'pending' && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-earth-700 border-earth-700">
                              Pending
                            </Badge>
                          )}
                          {step.status === 'failed' && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-red-600 border-red-300 bg-red-50">
                              Failed
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.location}</p>
                        <p className="text-[10px] text-muted-foreground">{step.time}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipments */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipments
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
                  {passportData.shipments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passportData.shipments.length === 0 ? (
                <div className="text-center py-6">
                  <Truck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No shipments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passportData.shipments.map((shipment, i) => {
                    const shipConfig = getShipmentStatusConfig(shipment.status);
                    return (
                      <div key={i} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5 font-mono">
                              {shipment.id}
                            </Badge>
                            <span className="text-xs font-medium">
                              {shipment.origin} → {shipment.destination}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              color: shipConfig.color,
                              borderColor: shipConfig.color,
                              backgroundColor: shipConfig.bgColor,
                            }}
                          >
                            {shipConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {getShipmentModeLabel(shipment.mode)}
                          </span>
                          {shipment.shipped && (
                            <span>Shipped: {shipment.shipped}</span>
                          )}
                          {shipment.delivered && (
                            <span>Delivered: {shipment.delivered}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Audit */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Blockchain Audit
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
                  {passportData.blockchainAudits.length} records
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/50 mb-4 text-xs text-muted-foreground">
                All timber passport operations are anchored to a permissioned blockchain for
                immutability. Each transaction includes a cryptographic hash, block number,
                and timestamp.
              </div>
              {passportData.blockchainAudits.length === 0 ? (
                <div className="text-center py-6">
                  <Link2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No blockchain records yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {passportData.blockchainAudits.map((audit, i) => {
                    const actionColor = getActionBadgeColor(audit.action);
                    return (
                      <div key={i} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 font-mono"
                            style={{
                              color: actionColor.text,
                              borderColor: actionColor.text,
                              backgroundColor: actionColor.bg,
                            }}
                          >
                            {audit.action}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Block #{audit.block.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground break-all">
                          TX: {audit.txHash}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {audit.time} — {audit.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <WorkflowTimeline
            entity="timber_passport"
            entityId={passportData.id}
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
                <WorkflowStatusBadge entity="timber_passport" status={currentStatus} size="lg" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stateInfo.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Workflow
                  </p>
                  <p className="font-medium mt-0.5">{workflow.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Passport ID
                  </p>
                  <p className="font-mono mt-0.5">{passportData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          <WorkflowActions
            entity="timber_passport"
            entityId={passportData.id}
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
                <span className="text-muted-foreground">Species</span>
                <span className="font-medium text-right max-w-[60%] truncate">{passportData.speciesCommon}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-semibold">{passportData.volume} m³</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Forest Plot</span>
                <span className="font-mono font-medium">{passportData.plot}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Province</span>
                <span className="font-medium">{passportData.province}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Harvest Permit</span>
                <span className={`font-mono text-[11px] ${passportData.harvestPermitValid ? 'text-forest-600' : 'text-red-600'}`}>
                  {passportData.harvestPermit}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CITES</span>
                <span className={`font-medium ${passportData.citesStatus === 'Not listed' ? 'text-forest-600' : 'text-amber-600'}`}>
                  {passportData.citesStatus}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">EUDR Progress</span>
                <span className="font-semibold">{eudrProgress}%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Supply Chain</span>
                <span className="font-medium">{scDone}/{scTotal} steps</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-medium">{passportData.issuedAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
