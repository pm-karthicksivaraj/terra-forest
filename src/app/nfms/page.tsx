'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, ChevronRight, ChevronDown, Globe2, Map, Building2, Share2, GitBranch, Lock, Unlock } from 'lucide-react';

const JURISDICTION_TREE = [
  {
    name: 'Vietnam', level: 'National', code: 'VN', children: [
      {
        name: 'Dong Nai Province', level: 'Provincial', code: 'DN', children: [
          {
            name: 'Bu Gia Map District', level: 'District', code: 'DN-BGM', children: [
              { name: 'Bu Gia Map Commune', level: 'Commune', code: 'DN-BGM-01', children: [
                { name: 'Forest Block A1', level: 'Forest Block', code: 'DN-BGM-01-A1', children: [] },
                { name: 'Forest Block A2', level: 'Forest Block', code: 'DN-BGM-01-A2', children: [] },
              ]},
              { name: 'Dak Bla Commune', level: 'Commune', code: 'DN-BGM-02', children: [
                { name: 'Forest Block B1', level: 'Forest Block', code: 'DN-BGM-02-B1', children: [] },
              ]},
            ]
          },
          {
            name: 'Cat Tien District', level: 'District', code: 'DN-CT', children: [
              { name: 'Cat Tien Commune', level: 'Commune', code: 'DN-CT-01', children: [
                { name: 'Forest Block C1', level: 'Forest Block', code: 'DN-CT-01-C1', children: [] },
              ]},
            ]
          },
        ]
      },
      {
        name: 'Binh Phuoc Province', level: 'Provincial', code: 'BP', children: [
          {
            name: 'Phuoc Long District', level: 'District', code: 'BP-PL', children: [
              { name: 'Phuoc Long Commune', level: 'Commune', code: 'BP-PL-01', children: [
                { name: 'Forest Block D1', level: 'Forest Block', code: 'BP-PL-01-D1', children: [] },
              ]},
            ]
          },
        ]
      },
      {
        name: 'Dak Lak Province', level: 'Provincial', code: 'DL', children: [
          {
            name: 'Ea Sup District', level: 'District', code: 'DL-ES', children: [
              { name: 'Ea Sup Commune', level: 'Commune', code: 'DL-ES-01', children: [
                { name: 'Forest Block E1', level: 'Forest Block', code: 'DL-ES-01-E1', children: [] },
              ]},
            ]
          },
        ]
      },
    ]
  },
];

const FOREST_CLASSES = [
  { code: 'NF-01', name: 'Rich Natural Forest', definition: 'Dense tropical forest with canopy cover ≥70%, dominated by indigenous Dipterocarp species', carbonRate: '160 tC/ha', minCanopy: '70%', maxDBH: '≥30cm' },
  { code: 'NF-02', name: 'Medium Natural Forest', definition: 'Tropical forest with canopy cover 40-70%, mixed indigenous species', carbonRate: '125 tC/ha', minCanopy: '40%', maxDBH: '≥20cm' },
  { code: 'NF-03', name: 'Poor Natural Forest', definition: 'Degraded forest with canopy cover 10-40%, regenerating after disturbance', carbonRate: '85 tC/ha', minCanopy: '10%', maxDBH: '≥10cm' },
  { code: 'PF-01', name: 'Acacia Plantation', definition: 'Managed plantation of Acacia mangium, rotation period 6-8 years', carbonRate: '72.5 tC/ha', minCanopy: '60%', maxDBH: '≥8cm' },
  { code: 'PF-02', name: 'Eucalyptus Plantation', definition: 'Managed plantation of Eucalyptus urophylla, rotation period 5-7 years', carbonRate: '60 tC/ha', minCanopy: '50%', maxDBH: '≥8cm' },
  { code: 'MF-01', name: 'Rhizophora Mangrove', definition: 'Coastal mangrove dominated by Rhizophora apiculata, tidally inundated', carbonRate: '105 tC/ha', minCanopy: '40%', maxDBH: '≥5cm' },
  { code: 'BF-01', name: 'Bamboo Forest', definition: 'Forest dominated by bamboo species, transitional or degraded', carbonRate: '35 tC/ha', minCanopy: '30%', maxDBH: 'N/A' },
];

const MAP_VERSIONS = [
  { version: 'v3.2', date: '2024-12-01', description: 'Updated classification with Sentinel-2 2024 imagery', status: 'current', approvedBy: 'VNFOREST' },
  { version: 'v3.1', date: '2024-06-15', description: 'Mid-year update with corrected boundary data', status: 'archived', approvedBy: 'VNFOREST' },
  { version: 'v3.0', date: '2024-01-20', description: 'Annual baseline map — 2024 reference', status: 'archived', approvedBy: 'VNFOREST' },
  { version: 'v2.5', date: '2023-12-10', description: 'Previous annual baseline', status: 'archived', approvedBy: 'VNFOREST' },
];

const AGENCIES = [
  { name: 'VNFOREST', fullName: 'Vietnam Administration of Forestry', role: 'National authority, policy & oversight', contact: 'vnforest@mard.gov.vn', status: 'active' },
  { name: 'FIPI', fullName: 'Forest Inventory and Planning Institute', role: 'NFI implementation, data collection', contact: 'fipi@fipi.gov.vn', status: 'active' },
  { name: 'DN-DARD', fullName: 'Dong Nai Dept. of Agriculture & Rural Development', role: 'Provincial forest management', contact: 'dard@dongnai.gov.vn', status: 'active' },
  { name: 'BP-DARD', fullName: 'Binh Phuoc Dept. of Agriculture & Rural Development', role: 'Provincial forest management', contact: 'dard@binhphuoc.gov.vn', status: 'active' },
  { name: 'DL-DARD', fullName: 'Dak Lak Dept. of Agriculture & Rural Development', role: 'Provincial forest management', contact: 'dard@daklak.gov.vn', status: 'active' },
];

const DATA_SHARING = [
  { rule: 'Satellite imagery (Sentinel-2)', scope: 'All provinces', access: 'Read-only', frequency: 'Real-time', restriction: 'None — public data' },
  { rule: 'NFI plot measurements', scope: 'National', access: 'Restricted — FIPI & VNFOREST', frequency: 'Annual', restriction: 'Internal use only — approval required' },
  { rule: 'Patrol & evidence data', scope: 'Provincial', access: 'Province-level only', frequency: 'Real-time', restriction: 'Data isolation by province' },
  { rule: 'Carbon stock calculations', scope: 'National', access: 'Read — verified parties', frequency: 'Quarterly', restriction: 'Pre-verification embargo' },
  { rule: 'GHG inventory reports', scope: 'National', access: 'Public (post-submission)', frequency: 'Annual', restriction: 'Pre-submission restricted' },
];

function TreeNode({ node, depth = 0 }: { node: typeof JURISDICTION_TREE[0]; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors: Record<string, string> = {
    'National': 'bg-emerald-700 text-white',
    'Provincial': 'bg-emerald-500 text-white',
    'District': 'bg-emerald-400 text-white',
    'Commune': 'bg-emerald-300 text-emerald-900',
    'Forest Block': 'bg-emerald-200 text-emerald-800',
  };

  return (
    <div style={{ paddingLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => hasChildren && setExpanded(!expanded)}>
        {hasChildren ? (expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />) : <div className="w-4" />}
        <Badge className={`text-[10px] ${levelColors[node.level] || 'bg-muted'}`}>{node.level}</Badge>
        <span className="text-sm font-mono text-muted-foreground">{node.code}</span>
        <span className="text-sm">{node.name}</span>
      </div>
      {expanded && hasChildren && node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function NfmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">NFMS Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          National Forest Monitoring System — jurisdiction hierarchy, forest definitions, and reference configuration
        </p>
      </div>

      <Tabs defaultValue="jurisdiction">
        <TabsList>
          <TabsTrigger value="jurisdiction">Jurisdiction Tree</TabsTrigger>
          <TabsTrigger value="forest-classes">Forest Class Definitions</TabsTrigger>
          <TabsTrigger value="map-versions">Map Version Control</TabsTrigger>
          <TabsTrigger value="agencies">Agency Registry</TabsTrigger>
          <TabsTrigger value="data-sharing">Data Sharing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="jurisdiction" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe2 className="w-4 h-4" /> Jurisdiction Hierarchy</CardTitle>
              <CardDescription className="text-xs">National → Provincial → District → Commune → Forest Block. Click to expand/collapse.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {JURISDICTION_TREE.map((node, i) => (
                <TreeNode key={i} node={node} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forest-classes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Forest Class Definitions</CardTitle></CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Code</th>
                    <th className="text-left py-2 px-2 font-semibold">Name</th>
                    <th className="text-left py-2 px-2 font-semibold">Definition</th>
                    <th className="text-right py-2 px-2 font-semibold">Carbon Rate</th>
                    <th className="text-right py-2 px-2 font-semibold">Min Canopy</th>
                    <th className="text-right py-2 pl-2 font-semibold">Max DBH</th>
                  </tr>
                </thead>
                <tbody>
                  {FOREST_CLASSES.map(fc => (
                    <tr key={fc.code} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2 font-mono">{fc.code}</td>
                      <td className="py-2 px-2 font-medium">{fc.name}</td>
                      <td className="py-2 px-2 text-muted-foreground max-w-xs">{fc.definition}</td>
                      <td className="py-2 px-2 text-right">{fc.carbonRate}</td>
                      <td className="py-2 px-2 text-right">{fc.minCanopy}</td>
                      <td className="py-2 pl-2 text-right">{fc.maxDBH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map-versions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><GitBranch className="w-4 h-4" /> Reference Map Version Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MAP_VERSIONS.map(v => (
                <div key={v.version} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${v.status === 'current' ? 'bg-emerald-500' : 'bg-muted'}`} />
                    <div>
                      <p className="text-sm font-medium">{v.version}</p>
                      <p className="text-xs text-muted-foreground">{v.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{v.date}</span>
                    <span className="text-xs text-muted-foreground">Approved by: {v.approvedBy}</span>
                    <Badge variant={v.status === 'current' ? 'default' : 'outline'} className="text-[10px]">
                      {v.status === 'current' ? 'Current' : 'Archived'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Agency Registry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AGENCIES.map(a => (
                <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: {a.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{a.contact}</span>
                    <Badge variant="default" className="text-[10px]">{a.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-sharing" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Share2 className="w-4 h-4" /> Data Sharing Rules</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 font-semibold">Data Type</th>
                    <th className="text-left py-2 px-2 font-semibold">Scope</th>
                    <th className="text-left py-2 px-2 font-semibold">Access Level</th>
                    <th className="text-left py-2 px-2 font-semibold">Frequency</th>
                    <th className="text-left py-2 pl-2 font-semibold">Restriction</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_SHARING.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-2 font-medium">{row.rule}</td>
                      <td className="py-2 px-2">{row.scope}</td>
                      <td className="py-2 px-2">{row.access}</td>
                      <td className="py-2 px-2">{row.frequency}</td>
                      <td className="py-2 pl-2 text-muted-foreground">{row.restriction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
