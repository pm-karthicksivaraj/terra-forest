'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, ShieldCheck, Ship, Link2, FileCheck, Globe, MapPin, TreePine, ClipboardCheck, ExternalLink } from 'lucide-react';
import { TIMBER_STATUS_MAP } from '@/lib/constants';
import { useRouter } from 'next/navigation';

const TIMBER_PASSPORTS = [
  { id: 'WP-2025-001', species: 'Dipterocarpus alatus (Resin Dipterocarp)', volume: 15.5, plot: 'DN_BGM_001', vpaStatus: 'verified' as const, hash: '0xabc123...def456', issued: '2025-01-15', origin: 'Bu Gia Map Natural Forest, Dong Nai' },
  { id: 'WP-2025-002', species: 'Acacia mangium (Brown Salwood)', volume: 22.0, plot: 'BP_BP_002', vpaStatus: 'verified' as const, hash: '0x789ghi...jkl012', issued: '2025-01-20', origin: 'Binh Phuoc Plantation, Binh Phuoc' },
  { id: 'WP-2025-003', species: 'Fokienia hodginsii (Fujian Cypress)', volume: 8.3, plot: 'LD_DL_001', vpaStatus: 'pending' as const, hash: '0xmno345...pqr678', issued: '2025-02-01', origin: 'Lam Dong Protection Forest, Lam Dong' },
  { id: 'WP-2025-004', species: 'Rhizophora apiculata (Stilt Mangrove)', volume: 30.0, plot: 'CM_CM_001', vpaStatus: 'rejected' as const, hash: null, issued: '2025-02-05', origin: 'Ca Mau Mangrove Forest, Ca Mau', rejectionReason: 'Harvest permit expired — VNTLAS due diligence failed. Mangrove harvesting restricted under Decision 28/2018/QD-TTg.' },
];

const SHIPMENTS = [
  { id: 'S-001', passport: 'WP-2025-001', origin: 'Dong Nai', destination: 'Ho Chi Minh City', mode: 'truck', status: 'delivered' as const, shipped: '2025-01-16', delivered: '2025-01-16' },
  { id: 'S-002', passport: 'WP-2025-002', origin: 'Binh Phuoc', destination: 'Binh Duong', mode: 'truck', status: 'in_transit' as const, shipped: '2025-01-21', delivered: null },
  { id: 'S-003', passport: 'WP-2025-003', origin: 'Lam Dong', destination: 'Da Nang', mode: 'rail', status: 'pending' as const, shipped: null, delivered: null },
];

const SUPPLY_CHAIN = [
  { step: 'Harvest Planning', location: 'Plot DN_BGM_001, Dong Nai', time: '2025-01-05', status: 'done', detail: 'Annual allowable cut approved by Provincial Forest Authority' },
  { step: 'Tree Felling & Extraction', location: 'Bu Gia Map Natural Forest', time: '2025-01-10', status: 'done', detail: 'Reduced-impact logging techniques applied. GPS-tagged stumps.' },
  { step: 'VPA/FLEGT Due Diligence', location: 'Dong Nai Forest Ranger Station', time: '2025-01-12', status: 'done', detail: 'VNTLAS legality verification completed. Harvest permit valid.' },
  { step: 'Wood Passport Issued', location: 'Terra Forest System', time: '2025-01-15', status: 'done', detail: 'Digital passport with blockchain hash generated and verified.' },
  { step: 'Warehouse Exit Inspection', location: 'Dong Nai Depot', time: '2025-01-15', status: 'done', detail: 'Physical verification against passport. Volume confirmed 15.5 m³.' },
  { step: 'Transport', location: 'Dong Nai → HCMC', time: '2025-01-16', status: 'done', detail: 'GPS-tracked truck transport. Estimated arrival 14:30.' },
  { step: 'Destination Received', location: 'HCMC Processing Plant', time: '2025-01-16', status: 'done', detail: 'Receiver confirmed delivery. Chain of custody complete.' },
];

const EUDR_CHECKLIST = [
  { item: 'Geolocation of Production Plot', status: 'compliant' as const, detail: 'GPS coordinates verified within plot boundary DN_BGM_001. Polygon area: 1,250.5 ha.' },
  { item: 'Product Description & HS Code', status: 'compliant' as const, detail: 'Species: Dipterocarpus alatus. HS Code: 4403.49. Volume: 15.5 m³ roundwood.' },
  { item: 'Legality Assurance (VNTLAS)', status: 'compliant' as const, detail: 'Valid harvest permit issued under VNTLAS. Forest land use right verified at provincial level.' },
  { item: 'Date & Area of Harvest', status: 'in_progress' as const, detail: 'Detailed harvest date per block required. Currently aggregated at plot level — block-level data pending.' },
  { item: 'Supply Chain Traceability', status: 'compliant' as const, detail: 'Blockchain audit trail complete from harvest to delivery. All handover points digitally recorded.' },
  { item: 'Deforestation-Free Declaration', status: 'compliant' as const, detail: 'Satellite analysis confirms no deforestation on production plot after Dec 31, 2020 (EUDR cutoff).' },
];

const BLOCKCHAIN_AUDITS = [
  { txHash: '0xabc1...def1', action: 'ISSUE_PASSPORT', entity: 'WP-2025-001', time: '2025-01-15 10:30', block: 19423456, detail: 'Wood Passport issued for 15.5 m³ Dipterocarpus alatus' },
  { txHash: '0xabc2...def2', action: 'VERIFY_VPA', entity: 'WP-2025-001', time: '2025-01-12 14:15', block: 19421234, detail: 'VPA/FLEGT legality verification passed' },
  { txHash: '0xabc3...def3', action: 'SHIPMENT_DISPATCH', entity: 'S-001', time: '2025-01-16 06:00', block: 19425678, detail: 'Shipment dispatched from Dong Nai depot' },
  { txHash: '0xabc4...def4', action: 'SHIPMENT_DELIVER', entity: 'S-001', time: '2025-01-16 14:30', block: 19427890, detail: 'Shipment delivered to HCMC processing plant' },
  { txHash: '0xabc5...def5', action: 'EUDR_CHECK', entity: 'WP-2025-001', time: '2025-01-14 09:00', block: 19422000, detail: 'EUDR deforestation-free check completed via satellite analysis' },
];

export default function TraceabilityPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timber Traceability</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Wood passport management, VPA/FLEGT compliance, EUDR due diligence, and supply chain tracking.
          Each timber batch receives a digital Wood Passport with blockchain-anchored verification.
          The system enforces VPA/FLEGT due diligence requirements under the Vietnam-EU Voluntary
          Partnership Agreement and EUDR (EU Deforestation Regulation) compliance. Chain-of-custody
          is tracked through every supply chain step with immutable audit records.
        </p>
      </div>

      <Tabs defaultValue="passports">
        <TabsList>
          <TabsTrigger value="passports">Wood Passports</TabsTrigger>
          <TabsTrigger value="vpa">VPA/FLEGT</TabsTrigger>
          <TabsTrigger value="eudr">EUDR Compliance</TabsTrigger>
          <TabsTrigger value="supply">Supply Chain</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="passports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {TIMBER_PASSPORTS.map((tp, i) => {
              const statusInfo = TIMBER_STATUS_MAP[tp.vpaStatus];
              return (
                <Card key={i} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-forest-600" />
                          <span className="text-sm font-semibold">{tp.id}</span>
                          <button onClick={() => router.push(`/traceability/${tp.id}`)} className="text-muted-foreground hover:text-forest-600 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{tp.species} | {tp.volume} m³</p>
                      </div>
                      <Badge style={{ backgroundColor: statusInfo.color, color: 'white' }} className="text-[10px]">{statusInfo.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Forest Plot:</span> <span className="font-mono">{tp.plot}</span></div>
                      <div><span className="text-muted-foreground">Issued:</span> {tp.issued}</div>
                      <div className="col-span-2"><span className="text-muted-foreground">Origin:</span> {tp.origin}</div>
                    </div>
                    {'rejectionReason' in tp && (tp as any).rejectionReason && (
                      <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">{(tp as any).rejectionReason}</div>
                    )}
                    {tp.hash && (
                      <div className="mt-2 p-2 rounded bg-muted/50"><p className="text-[10px] font-mono text-muted-foreground break-all">TX: {tp.hash}</p></div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="vpa" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-forest-600" /> VPA/FLEGT — Voluntary Partnership Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 mb-4 text-xs space-y-2">
                <p className="font-semibold">What is VPA/FLEGT?</p>
                <p>The Voluntary Partnership Agreement (VPA) is a legally binding trade agreement between the EU and a timber-exporting country. Vietnam signed its VPA with the EU in 2019, committing to the Forest Law Enforcement, Governance and Trade (FLEGT) framework.</p>
                <p className="font-semibold mt-2">Vietnam Timber Legality Assurance System (VNTLAS)</p>
                <p>VNTLAS is the national system established under the VPA to ensure all timber and timber products exported to the EU are legally harvested and fully traceable. It covers:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Harvest permit verification and forest land use rights</li>
                  <li>Chain of custody from forest to export point</li>
                  <li>Imported timber due diligence (for re-exported products)</li>
                  <li>Annual auditing and independent monitoring</li>
                </ul>
              </div>
              <div className="space-y-3">
                {TIMBER_PASSPORTS.map((tp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tp.vpaStatus === 'verified' ? 'bg-forest-500/10' : tp.vpaStatus === 'pending' ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                        <ShieldCheck className={`w-4 h-4 ${tp.vpaStatus === 'verified' ? 'text-forest-500' : tp.vpaStatus === 'pending' ? 'text-yellow-500' : 'text-red-500'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{tp.id} — {tp.species.split('(')[0].trim()}</p>
                        <p className="text-[10px] text-muted-foreground">{tp.volume} m³ from {tp.plot}</p>
                      </div>
                    </div>
                    <Badge style={{ backgroundColor: TIMBER_STATUS_MAP[tp.vpaStatus].color, color: 'white' }} className="text-[10px]">{TIMBER_STATUS_MAP[tp.vpaStatus].label}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eudr" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-forest-600" /> EUDR Compliance — EU Deforestation Regulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 mb-4 text-xs space-y-2">
                <p className="font-semibold">EU Deforestation Regulation (EUDR)</p>
                <p>Regulation (EU) 2023/1115 requires operators placing timber products on the EU market or exporting from the EU to demonstrate that products are:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Deforestation-free</strong> — No deforestation or forest degradation after December 31, 2020</li>
                  <li><strong>Legally produced</strong> — Compliant with laws of the country of production</li>
                  <li><strong>Covered by due diligence</strong> — Geolocation, product description, harvest data, and risk assessment</li>
                </ul>
              </div>
              <p className="text-xs font-semibold mb-2">Compliance Checklist — WP-2025-001</p>
              <div className="space-y-3">
                {EUDR_CHECKLIST.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === 'compliant' ? 'bg-forest-500 text-white' : 'bg-yellow-500 text-white'}`}>
                      {item.status === 'compliant' ? '✓' : '!'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{item.item}</p>
                      <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                    </div>
                    <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.status === 'compliant' ? 'Compliant' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supply" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Chain of Custody — WP-2025-001</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-0">
                {SUPPLY_CHAIN.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step.status === 'done' ? 'bg-forest-500/10' : 'bg-muted'}`}>
                        {i === 0 ? <TreePine className="w-4 h-4 text-forest-600" /> :
                         i === 2 ? <ShieldCheck className="w-4 h-4 text-forest-600" /> :
                         i === 3 ? <QrCode className="w-4 h-4 text-forest-600" /> :
                         i === 5 ? <Ship className="w-4 h-4 text-forest-600" /> :
                         <ClipboardCheck className="w-4 h-4 text-forest-600" />}
                      </div>
                      {i < SUPPLY_CHAIN.length - 1 && <div className="w-0.5 h-8 bg-forest-300" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold">{step.step}</p>
                      <p className="text-[10px] text-muted-foreground">{step.location}</p>
                      <p className="text-[10px] text-muted-foreground">{step.time}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Ship className="w-4 h-4" /> Shipment Tracking</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SHIPMENTS.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-xs font-semibold">{s.id} — {s.passport}</p>
                      <p className="text-[10px] text-muted-foreground">{s.origin} → {s.destination} ({s.mode === 'truck' ? '🚛 Truck' : '🚂 Rail'})</p>
                      {s.shipped && <p className="text-[10px] text-muted-foreground">Shipped: {s.shipped}{s.delivered ? ` | Delivered: ${s.delivered}` : ''}</p>}
                    </div>
                    <Badge className={`${s.status === 'delivered' ? 'bg-forest-500' : s.status === 'in_transit' ? 'bg-water-700' : 'bg-earth-700'} text-white text-[10px]`}>
                      {s.status === 'delivered' ? 'Delivered' : s.status === 'in_transit' ? 'In Transit' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Link2 className="w-4 h-4" /> Blockchain Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/50 mb-4 text-xs text-muted-foreground">
                All timber passport operations are anchored to a permissioned blockchain for immutability.
                Each transaction includes a cryptographic hash, block number, and timestamp. This ensures
                that no retroactive modifications can be made to the chain of custody record.
              </div>
              <div className="space-y-2">
                {BLOCKCHAIN_AUDITS.map((audit, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px] h-5 font-mono">{audit.action}</Badge>
                      <span className="text-[10px] text-muted-foreground">Block #{audit.block.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground break-all">TX: {audit.txHash}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Entity: {audit.entity} | {audit.time}</p>
                    <p className="text-[10px] text-muted-foreground">{audit.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
