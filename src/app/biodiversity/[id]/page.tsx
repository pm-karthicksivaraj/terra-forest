'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Leaf,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  TreePine,
  Fish,
  Flower2,
  Eye,
} from 'lucide-react';
import { CONSERVATION_STATUS_MAP, TREE_SPECIES, ANIMAL_SPECIES, MEDICINAL_PLANTS } from '@/lib/constants';
import { getWorkflow, getStateInfo } from '@/lib/workflow';
import WorkflowStatusBadge from '@/components/workflow/WorkflowStatusBadge';
import WorkflowTimeline from '@/components/workflow/WorkflowTimeline';
import WorkflowActions from '@/components/workflow/WorkflowActions';

// ─── Types ────────────────────────────────────────────────────────
interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
}

interface Observation {
  date: string;
  plot: string;
  count: number;
  method: string;
  observer: string;
  notes: string;
}

interface BiodiversityRecord {
  id: string;
  speciesName: string;
  speciesNameVi: string;
  commonName: string;
  category: 'animal' | 'tree' | 'medicinal';
  conservationStatus: string;
  count: number;
  plot: string;
  plotName: string;
  province: string;
  recordedDate: string;
  observer: string;
  method: string;
  status: string;
  citesAppendix: string | null;
  taxonomy: Taxonomy;
  habitat: string;
  distribution: string;
  threats: string;
  protection: string;
  observations: Observation[];
}

// ─── Mock Detail Data ─────────────────────────────────────────────
const BIODIVERSITY_DETAIL: BiodiversityRecord[] = [
  {
    id: '1',
    speciesName: 'Panthera tigris',
    speciesNameVi: 'Ho',
    commonName: 'Indochinese Tiger',
    category: 'animal',
    conservationStatus: 'CR',
    count: 3,
    plot: 'DN_BGM_001',
    plotName: 'Bu Gia Map Natural Forest',
    province: 'Dong Nai',
    recordedDate: '2025-02-28',
    observer: 'Dr. Nguyen Van Minh',
    method: 'Camera trap + track identification',
    status: 'verified',
    citesAppendix: 'I',
    taxonomy: {
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Mammalia',
      order: 'Carnivora',
      family: 'Felidae',
    },
    habitat:
      'Tropical evergreen and semi-evergreen forests. Prefers dense understory with water sources.',
    distribution:
      'Historically widespread across Vietnam. Now restricted to protected areas in central and southern regions.',
    threats:
      'Poaching for traditional medicine, habitat loss from deforestation, prey depletion, human-wildlife conflict.',
    protection:
      'Protected under Vietnam Law 64/2006/QH11. CITES Appendix I. National Conservation Action Plan for Tigers.',
    observations: [
      {
        date: '2025-02-28',
        plot: 'DN_BGM_001',
        count: 3,
        method: 'Camera trap',
        observer: 'Dr. Nguyen Van Minh',
        notes: 'Three individuals captured on camera trap CT-14. One adult male, one adult female, one sub-adult.',
      },
      {
        date: '2025-01-15',
        plot: 'DN_BGM_001',
        count: 1,
        method: 'Track identification',
        observer: 'Ranger Tran',
        notes: 'Pug marks found near stream crossing. 12cm x 10cm — adult male.',
      },
      {
        date: '2024-11-20',
        plot: 'DN_CAT_001',
        count: 2,
        method: 'Camera trap',
        observer: 'Dr. Nguyen Van Minh',
        notes: 'Female with cub captured on camera trap CT-07.',
      },
    ],
  },
  {
    id: '2',
    speciesName: 'Elephas maximus',
    speciesNameVi: 'Voi chau A',
    commonName: 'Asian Elephant',
    category: 'animal',
    conservationStatus: 'EN',
    count: 5,
    plot: 'DN_BGM_001',
    plotName: 'Bu Gia Map Natural Forest',
    province: 'Dong Nai',
    recordedDate: '2025-02-28',
    observer: 'Ranger Tran',
    method: 'Direct observation + dung survey',
    status: 'recorded',
    citesAppendix: 'I',
    taxonomy: {
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Mammalia',
      order: 'Proboscidea',
      family: 'Elephantidae',
    },
    habitat:
      'Tropical and subtropical forests, grasslands. Requires large home ranges with water access.',
    distribution:
      'Small populations in Dak Lak, Dong Nai, and Nghe An provinces. Estimated 100-130 wild individuals in Vietnam.',
    threats:
      'Habitat fragmentation, human-elephant conflict, poaching, railway accidents.',
    protection:
      'Protected under Vietnam Decree 64/2019/ND-CP. CITES Appendix I. Elephant Conservation Centre in Dak Lak.',
    observations: [
      {
        date: '2025-02-28',
        plot: 'DN_BGM_001',
        count: 5,
        method: 'Direct observation',
        observer: 'Ranger Tran',
        notes: 'Herd of 3-5 individuals moving NW near stream. Fresh dung piles and tracks confirmed.',
      },
      {
        date: '2025-01-05',
        plot: 'DN_BGM_001',
        count: 3,
        method: 'Dung survey',
        observer: 'Ranger Pham',
        notes: 'Dung piles found along elephant corridor. Boli diameter indicates 2 adults + 1 juvenile.',
      },
    ],
  },
  {
    id: '3',
    speciesName: 'Fokienia hodginsii',
    speciesNameVi: 'Po mu',
    commonName: 'Fujian Cypress',
    category: 'tree',
    conservationStatus: 'NT',
    count: 19000,
    plot: 'LD_DL_001',
    plotName: 'Lam Dong Protection Forest',
    province: 'Lam Dong',
    recordedDate: '2025-02-15',
    observer: 'Forester Vo',
    method: 'NFI systematic sampling',
    status: 'recorded',
    citesAppendix: 'II',
    taxonomy: {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Pinopsida',
      order: 'Cupressales',
      family: 'Cupressaceae',
    },
    habitat:
      'Montane evergreen forests at 600-1800m elevation. Thrives in moist, foggy conditions.',
    distribution:
      'Central highlands and northern mountains of Vietnam. Also found in China, Laos.',
    threats:
      'Illegal logging for valuable timber, habitat degradation, climate change impacting montane forests.',
    protection:
      'CITES Appendix II. Protected under Vietnam Decree 06/2019/ND-CP. Restricted harvest permits required.',
    observations: [
      {
        date: '2025-02-15',
        plot: 'LD_DL_001',
        count: 19000,
        method: 'NFI plot measurement',
        observer: 'Forester Vo',
        notes: 'Mean DBH: 38cm. Mean height: 22m. Regeneration moderate — 15 saplings per 100m\u00B2 in canopy gaps.',
      },
    ],
  },
  {
    id: '4',
    speciesName: 'Panax vietnamensis',
    speciesNameVi: 'Sam Viet Nam',
    commonName: 'Vietnamese Ginseng',
    category: 'medicinal',
    conservationStatus: 'VU',
    count: 45,
    plot: 'LD_DL_001',
    plotName: 'Lam Dong Protection Forest',
    province: 'Lam Dong',
    recordedDate: '2025-02-20',
    observer: 'Botanist Hoang',
    method: 'Transect survey',
    status: 'flagged',
    citesAppendix: null,
    taxonomy: {
      kingdom: 'Plantae',
      phylum: 'Tracheophyta',
      class: 'Magnoliopsida',
      order: 'Apiales',
      family: 'Araliaceae',
    },
    habitat:
      'Damp understory of montane forests at 1500-2000m. Requires shade and high humidity.',
    distribution:
      'Endemic to central highlands of Vietnam (Quang Nam, Kon Tum, Lam Dong). Very limited range.',
    threats:
      'Over-harvesting for medicinal use, habitat loss, climate change. Wild populations declining rapidly.',
    protection:
      'Listed in Vietnam Red Data Book. Protected under Decree 06/2019/ND-CP. Cultivation programs ongoing.',
    observations: [
      {
        date: '2025-02-20',
        plot: 'LD_DL_001',
        count: 45,
        method: 'Transect survey',
        observer: 'Botanist Hoang',
        notes: 'Population of 45 mature plants found along transect T-3. Flagged for review — possible misidentification with Panax stipuleanatus.',
      },
    ],
  },
];

// ─── Related Species (other species observed in same plot) ────────
const RELATED_SPECIES = [
  { id: '1', speciesName: 'Panthera tigris', commonName: 'Indochinese Tiger', category: 'animal' as const, status: 'CR', plot: 'DN_BGM_001' },
  { id: '2', speciesName: 'Elephas maximus', commonName: 'Asian Elephant', category: 'animal' as const, status: 'EN', plot: 'DN_BGM_001' },
  { id: '3', speciesName: 'Fokienia hodginsii', commonName: 'Fujian Cypress', category: 'tree' as const, status: 'NT', plot: 'LD_DL_001' },
  { id: '4', speciesName: 'Panax vietnamensis', commonName: 'Vietnamese Ginseng', category: 'medicinal' as const, status: 'VU', plot: 'LD_DL_001' },
];

// ─── Helpers ──────────────────────────────────────────────────────

function getCategoryIcon(category: BiodiversityRecord['category']) {
  switch (category) {
    case 'animal':
      return <Fish className="w-5 h-5" />;
    case 'tree':
      return <TreePine className="w-5 h-5" />;
    case 'medicinal':
      return <Flower2 className="w-5 h-5" />;
    default:
      return <Leaf className="w-5 h-5" />;
  }
}

function getCategoryLabel(category: BiodiversityRecord['category']) {
  switch (category) {
    case 'animal':
      return 'Wildlife';
    case 'tree':
      return 'Tree Species';
    case 'medicinal':
      return 'Medicinal Plant';
    default:
      return 'Species';
  }
}

function getCategoryColor(category: BiodiversityRecord['category']) {
  switch (category) {
    case 'animal':
      return '#0277BD';
    case 'tree':
      return '#2D6A4F';
    case 'medicinal':
      return '#795548';
    default:
      return '#6B7280';
  }
}

function getConservationProgress(status: string) {
  switch (status) {
    case 'CR':
      return 95;
    case 'EN':
      return 75;
    case 'VU':
      return 55;
    case 'NT':
      return 35;
    case 'LC':
      return 10;
    default:
      return 50;
  }
}

// ─── Not Found State ──────────────────────────────────────────────

function RecordNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Leaf className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Record Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The biodiversity record you are looking for does not exist or has been removed.
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
        Back to Biodiversity
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

export default function BiodiversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const recordData = useMemo(
    () => BIODIVERSITY_DETAIL.find(r => r.id === recordId) ?? null,
    [recordId]
  );

  // Track current status so workflow actions can update it
  const [currentStatus, setCurrentStatus] = useState<string>(
    recordData?.status ?? 'recorded'
  );

  // Related records: same plot, different id
  const relatedRecords = useMemo(
    () =>
      recordData
        ? RELATED_SPECIES.filter(r => r.plot === recordData.plot && r.id !== recordData.id)
        : [],
    [recordData]
  );

  const handleBack = () => router.push('/biodiversity');

  const handleTransition = (_fromState: string, toState: string, _action: string) => {
    setCurrentStatus(toState);
  };

  // ─── Not Found ───────────────────────────────────────────────────
  if (!recordData) {
    return (
      <div className="p-6">
        <RecordNotFound onBack={handleBack} />
      </div>
    );
  }

  // ─── Resolve display info ────────────────────────────────────────
  const conservationInfo = CONSERVATION_STATUS_MAP[recordData.conservationStatus];
  const workflow = getWorkflow('biodiversity_record');
  const stateInfo = getStateInfo('biodiversity_record', currentStatus);
  const categoryColor = getCategoryColor(recordData.category);

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
          Back to Biodiversity
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-xs text-muted-foreground">
          Biodiversity Surveys
        </span>
      </div>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
          }}
        >
          {getCategoryIcon(recordData.category)}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold italic">{recordData.speciesName}</h1>
            <Badge variant="secondary" className="text-[10px] h-5">
              {recordData.speciesNameVi}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] h-5 font-medium"
              style={{
                color: conservationInfo?.color ?? '#6B7280',
                borderColor: conservationInfo?.color ?? '#6B7280',
                backgroundColor: `${conservationInfo?.color ?? '#6B7280'}10`,
              }}
            >
              {recordData.conservationStatus} — {conservationInfo?.label ?? 'Unknown'}
            </Badge>
            <WorkflowStatusBadge
              entity="biodiversity_record"
              status={currentStatus}
              size="md"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {recordData.commonName} · {getCategoryLabel(recordData.category)}
          </p>
        </div>
      </div>

      <Separator />

      {/* ─── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-xl font-bold">
              {recordData.count.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Count Observed</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <ShieldAlert
              className="w-5 h-5 mx-auto mb-1.5"
              style={{ color: conservationInfo?.color }}
            />
            <p className="text-sm font-bold" style={{ color: conservationInfo?.color }}>
              {recordData.conservationStatus}
            </p>
            <p className="text-[10px] text-muted-foreground">Conservation Status</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <MapPin className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-xs font-bold truncate" title={recordData.plotName}>
              {recordData.plot}
            </p>
            <p className="text-[10px] text-muted-foreground">Forest Plot</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <User className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-xs font-bold truncate" title={recordData.observer}>
              {recordData.observer}
            </p>
            <p className="text-[10px] text-muted-foreground">Observer</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-xs font-bold">{recordData.recordedDate}</p>
            <p className="text-[10px] text-muted-foreground">Last Survey</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Leaf className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-sm font-bold">
              {recordData.citesAppendix
                ? `App. ${recordData.citesAppendix}`
                : 'N/A'}
            </p>
            <p className="text-[10px] text-muted-foreground">CITES Status</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Layout: Left (2/3) + Right (1/3) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Species Details */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Species Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Taxonomy */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Taxonomy
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(recordData.taxonomy).map(([rank, value]) => (
                    <div key={rank} className="bg-muted/50 rounded-md p-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {rank}
                      </p>
                      <p className="text-xs font-medium mt-0.5 italic">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Habitat */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Habitat
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {recordData.habitat}
                </p>
              </div>

              <Separator />

              {/* Distribution in Vietnam */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Distribution in Vietnam
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {recordData.distribution}
                </p>
              </div>

              <Separator />

              {/* Threats */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Threats
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {recordData.threats}
                </p>
              </div>

              <Separator />

              {/* Conservation Status Progress */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Conservation Risk Level
                </p>
                <div className="flex items-center gap-3">
                  <Progress
                    value={getConservationProgress(recordData.conservationStatus)}
                    className="h-2 flex-1"
                  />
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 font-medium flex-shrink-0"
                    style={{
                      color: conservationInfo?.color,
                      borderColor: conservationInfo?.color,
                      backgroundColor: `${conservationInfo?.color}10`,
                    }}
                  >
                    {conservationInfo?.label ?? 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">LC (Low Risk)</span>
                  <span className="text-[9px] text-muted-foreground">CR (Highest Risk)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observation History */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Observation History
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {recordData.observations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recordData.observations.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] h-8">Date</TableHead>
                        <TableHead className="text-[10px] h-8">Plot</TableHead>
                        <TableHead className="text-[10px] h-8 text-right">Count</TableHead>
                        <TableHead className="text-[10px] h-8">Method</TableHead>
                        <TableHead className="text-[10px] h-8">Observer</TableHead>
                        <TableHead className="text-[10px] h-8">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recordData.observations.map((obs, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            {obs.date}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {obs.plot}
                          </TableCell>
                          <TableCell className="text-xs text-right font-semibold">
                            {obs.count.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs">
                            {obs.method}
                          </TableCell>
                          <TableCell className="text-xs">
                            {obs.observer}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[280px]">
                            <p className="line-clamp-2">{obs.notes}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No observations recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Records */}
          {relatedRecords.length > 0 && (
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Related Species
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {relatedRecords.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {relatedRecords.map(related => {
                    const relConservation = CONSERVATION_STATUS_MAP[related.status];
                    const relColor = getCategoryColor(related.category);
                    return (
                      <div
                        key={related.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/biodiversity/${related.id}`)}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${relColor}15`,
                            color: relColor,
                          }}
                        >
                          {getCategoryIcon(related.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold italic">
                              {related.speciesName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4"
                              style={{
                                color: relConservation?.color,
                                borderColor: relConservation?.color,
                              }}
                            >
                              {related.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {related.commonName} · {getCategoryLabel(related.category)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conservation Notes */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Conservation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Protection Measures */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Protection Measures
                </p>
                <div className="bg-forest-50 border border-forest-200 rounded-lg p-3 text-xs text-forest-800 leading-relaxed">
                  {recordData.protection}
                </div>
              </div>

              {/* Legal Framework */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Legal Framework
                </p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {recordData.citesAppendix && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        className={
                          recordData.citesAppendix === 'I'
                            ? 'bg-red-600 text-white text-[9px] h-4'
                            : 'bg-yellow-600 text-white text-[9px] h-4'
                        }
                      >
                        CITES Appendix {recordData.citesAppendix}
                      </Badge>
                      <span className="text-muted-foreground">
                        {recordData.citesAppendix === 'I'
                          ? 'Trade permitted only in exceptional circumstances'
                          : 'Trade must be controlled to avoid over-exploitation'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4"
                      style={{
                        color: conservationInfo?.color,
                        borderColor: conservationInfo?.color,
                      }}
                    >
                      IUCN {recordData.conservationStatus}
                    </Badge>
                    <span className="text-muted-foreground">
                      {conservationInfo?.label ?? 'Unknown conservation status'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[9px] h-4">
                      VN Red Book
                    </Badge>
                    <span className="text-muted-foreground">
                      Species listed in Vietnam Red Data Book
                    </span>
                  </div>
                </div>
              </div>

              {/* Survey Method */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Survey Method
                </p>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-foreground leading-relaxed">
                  {recordData.method}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Current State Summary */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Record Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <WorkflowStatusBadge
                  entity="biodiversity_record"
                  status={currentStatus}
                  size="lg"
                />
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
            entity="biodiversity_record"
            entityId={recordData.id}
            currentStatus={currentStatus}
            onTransition={handleTransition}
          />

          {/* Workflow Timeline */}
          <WorkflowTimeline
            entity="biodiversity_record"
            entityId={recordData.id}
            currentStatus={currentStatus}
          />

          {/* Quick Info */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Species</span>
                <span className="font-medium italic">{recordData.speciesName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Common Name</span>
                <span className="font-medium">{recordData.commonName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{getCategoryLabel(recordData.category)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Forest Plot</span>
                <span className="font-mono font-medium">{recordData.plot}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Province</span>
                <span className="font-medium">{recordData.province}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Observer</span>
                <span className="font-medium">{recordData.observer}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Survey Date</span>
                <span className="font-medium">{recordData.recordedDate}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Observations</span>
                <span className="font-medium">{recordData.observations.length} surveys</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CITES</span>
                <span className="font-medium">
                  {recordData.citesAppendix
                    ? `Appendix ${recordData.citesAppendix}`
                    : 'Not listed'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
