'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Leaf, TreePine, Fish, Droplets, Flower2, ShieldAlert, Eye, MapPin, Clock, User, ExternalLink, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TREE_SPECIES, ANIMAL_SPECIES, MEDICINAL_PLANTS, WATER_SOURCES, CONSERVATION_STATUS_MAP } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

interface BiodiversityRecord {
  id: string;
  plot_id: string;
  category: string;
  species_name: string;
  species_name_vi: string | null;
  common_name: string | null;
  count: number;
  conservation_status: string | null;
  notes: string | null;
  recorded_date: string;
  plot?: { id: string; plot_code: string };
}

interface ForestPlot {
  id: string;
  plot_code: string;
}

const SHANNON_WIENER = 3.42;
const SIMPSON = 0.89;

const BIODIVERSITY_RADAR = [
  { subject: 'Trees', A: 85 },
  { subject: 'Mammals', A: 45 },
  { subject: 'Plants', A: 72 },
  { subject: 'Aquatic', A: 60 },
  { subject: 'Birds', A: 55 },
  { subject: 'Insects', A: 68 },
];

const CITES_SPECIES = [
  { name: 'Panthera tigris', nameEn: 'Indochinese Tiger', appendix: 'I' },
  { name: 'Elephas maximus', nameEn: 'Asian Elephant', appendix: 'I' },
  { name: 'Pygathrix nigripes', nameEn: 'Black-shanked Douc', appendix: 'I' },
  { name: 'Hylobates gabriellae', nameEn: 'Buff-cheeked Gibbon', appendix: 'I' },
  { name: 'Crocodylus siamensis', nameEn: 'Siamese Crocodile', appendix: 'I' },
  { name: 'Fokienia hodginsii', nameEn: 'Fujian Cypress', appendix: 'II' },
];

export default function BiodiversityPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [records, setRecords] = useState<BiodiversityRecord[]>([]);
  const [plots, setPlots] = useState<ForestPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [selectedRecord, setSelectedRecord] = useState<BiodiversityRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Create form state
  const [formPlotId, setFormPlotId] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSpeciesName, setFormSpeciesName] = useState('');
  const [formCount, setFormCount] = useState('');
  const [formConservationStatus, setFormConservationStatus] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Edit form state
  const [editPlotId, setEditPlotId] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSpeciesName, setEditSpeciesName] = useState('');
  const [editCount, setEditCount] = useState('');
  const [editConservationStatus, setEditConservationStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [recRes, plotsRes] = await Promise.all([
        fetch('/api/biodiversity', { headers }),
        fetch('/api/forest-plots?limit=100', { headers }),
      ]);
      if (recRes.ok) { const d = await recRes.json(); setRecords(d.data || []); }
      if (plotsRes.ok) { const d = await plotsRes.json(); setPlots(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!formPlotId || !formSpeciesName || !formCategory) {
      toast({ title: t.common.error, description: `${t.biodiversity.plotId}, ${t.biodiversity.speciesName}, ${t.biodiversity.category}`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/biodiversity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          plot_id: formPlotId,
          category: formCategory,
          species_name: formSpeciesName,
          count: parseInt(formCount) || 0,
          conservation_status: formConservationStatus || null,
          notes: formNotes || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.biodiversity.addObservation });
        setShowCreateDialog(false);
        setFormPlotId(''); setFormCategory(''); setFormSpeciesName(''); setFormCount(''); setFormConservationStatus(''); setFormNotes('');
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.failed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const openEditDialog = (record: BiodiversityRecord) => {
    setEditPlotId(record.plot_id);
    setEditCategory(record.category);
    setEditSpeciesName(record.species_name);
    setEditCount(String(record.count));
    setEditConservationStatus(record.conservation_status || '');
    setEditNotes(record.notes || '');
    setSelectedRecord(record);
    setShowEditDialog(true);
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;
    if (!editSpeciesName || !editCategory) {
      toast({ title: t.common.error, description: `${t.biodiversity.speciesName}, ${t.biodiversity.category}`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/biodiversity/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          plot_id: editPlotId || undefined,
          category: editCategory,
          species_name: editSpeciesName,
          count: parseInt(editCount) || 0,
          conservation_status: editConservationStatus || null,
          notes: editNotes || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.common.update });
        setShowEditDialog(false);
        setSelectedRecord(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.failed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (recordId: string) => {
    try {
      const res = await fetch(`/api/biodiversity/${recordId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.common.delete });
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.failed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    }
  };

  const SPECIES_DISTRIBUTION = [
    { name: 'Resin Dipterocarp', count: 28500, type: 'natural' },
    { name: 'Brown Salwood', count: 85000, type: 'planted' },
    { name: 'White Meranti', count: 15000, type: 'natural' },
    { name: 'Siamese Sal', count: 42000, type: 'natural' },
    { name: 'Stilt Mangrove', count: 120000, type: 'mangrove' },
    { name: 'Mountain Dipterocarp', count: 36000, type: 'natural' },
    { name: 'Timor Mountain Gum', count: 105000, type: 'planted' },
    { name: 'Fujian Cypress', count: 19000, type: 'protection' },
    { name: 'Grey Mangrove', count: 156000, type: 'mangrove' },
    { name: 'Teak', count: 25000, type: 'planted' },
    { name: 'Indian Mahogany', count: 12000, type: 'natural' },
    { name: 'Java Almond', count: 18000, type: 'natural' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.biodiversity.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Species monitoring, conservation status tracking, and habitat assessment.
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" /> {t.biodiversity.addObservation}
        </Button>
      </div>

      {/* Index cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <TreePine className="w-6 h-6 mx-auto text-forest-600 mb-2" />
            <p className="text-2xl font-bold text-forest-700">{TREE_SPECIES.length}</p>
            <p className="text-xs text-muted-foreground">Tree Species</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Fish className="w-6 h-6 mx-auto text-water-700 mb-2" />
            <p className="text-2xl font-bold text-water-700">{ANIMAL_SPECIES.length}</p>
            <p className="text-xs text-muted-foreground">Animal Species</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Flower2 className="w-6 h-6 mx-auto text-earth-700 mb-2" />
            <p className="text-2xl font-bold text-earth-700">{MEDICINAL_PLANTS.length}</p>
            <p className="text-xs text-muted-foreground">Medicinal Plants</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-4 text-center">
            <Leaf className="w-6 h-6 mx-auto text-forest-500 mb-2" />
            <p className="text-xl font-bold text-forest-600">H&apos; = {SHANNON_WIENER}</p>
            <p className="text-xs text-muted-foreground">Shannon-Wiener Index</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent records from DB */}
      {records.length > 0 && (
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t.biodiversity.recentObservations} ({records.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="text-left py-1 pr-2 font-semibold">{t.biodiversity.speciesName}</th>
                    <th className="text-left py-1 px-2 font-semibold">{t.biodiversity.category}</th>
                    <th className="text-left py-1 px-2 font-semibold">{t.biodiversity.count}</th>
                    <th className="text-left py-1 px-2 font-semibold">{t.biodiversity.conservationStatus}</th>
                    <th className="text-left py-1 px-2 font-semibold">{t.biodiversity.plotId}</th>
                    <th className="text-left py-1 px-2 font-semibold">{t.biodiversity.recordedDate}</th>
                    <th className="text-left py-1 pl-2 font-semibold">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-1 pr-2 font-medium">{r.species_name}</td>
                      <td className="py-1 px-2">{r.category}</td>
                      <td className="py-1 px-2">{r.count}</td>
                      <td className="py-1 px-2">
                        {r.conservation_status && <Badge variant="outline" className="text-[10px]">{r.conservation_status}</Badge>}
                      </td>
                      <td className="py-1 px-2 font-mono">{r.plot?.plot_code || 'N/A'}</td>
                      <td className="py-1 px-2 text-muted-foreground">{new Date(r.recorded_date).toLocaleDateString()}</td>
                      <td className="py-1 pl-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(r)} title={t.common.edit}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" title={t.common.delete}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.biodiversity.deleteObservation}?</AlertDialogTitle>
                                <AlertDialogDescription>{t.biodiversity.deleteConfirmMessage}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-700">{t.common.delete}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="trees">
        <TabsList>
          <TabsTrigger value="trees">Tree Species</TabsTrigger>
          <TabsTrigger value="animals">Wildlife</TabsTrigger>
          <TabsTrigger value="medicinal">Medicinal Plants</TabsTrigger>
          <TabsTrigger value="cites">CITES Listed</TabsTrigger>
          <TabsTrigger value="water">Water Sources</TabsTrigger>
          <TabsTrigger value="index">Diversity Index</TabsTrigger>
        </TabsList>

        <TabsContent value="trees" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Tree Species Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SPECIES_DISTRIBUTION} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EC" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#4A6A54" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#4A6A54" width={110} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
                  <Bar dataKey="count" fill="#2D6A4F" radius={[0, 4, 4, 0]} name="Tree Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {TREE_SPECIES.map((sp, i) => (
              <Card key={i} className="shadow-sm border-0">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold">{sp.nameEn}</p>
                      <p className="text-[10px] text-muted-foreground italic">{sp.name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {sp.type === 'natural' ? 'Natural' : sp.type === 'planted' ? 'Planted' : sp.type === 'protection' ? 'Protection' : 'Mangrove'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="animals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ANIMAL_SPECIES.map((sp, i) => {
              const status = CONSERVATION_STATUS_MAP[sp.status];
              return (
                <Card key={i} className="shadow-sm border-0 cursor-pointer hover:ring-1 hover:ring-forest-300 transition-all" onClick={() => router.push(`/biodiversity/${i + 1}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold">{sp.nameEn}</p>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground italic">{sp.name}</p>
                      </div>
                      <Badge style={{ backgroundColor: status?.color, color: 'white' }} className="text-[10px]">
                        {sp.status} — {status?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="medicinal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MEDICINAL_PLANTS.map((sp, i) => {
              const status = CONSERVATION_STATUS_MAP[sp.status];
              return (
                <Card key={i} className="shadow-sm border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{sp.nameEn}</p>
                        <p className="text-xs text-muted-foreground italic">{sp.name}</p>
                      </div>
                      <Badge style={{ backgroundColor: status?.color, color: 'white' }} className="text-[10px]">
                        {sp.status} — {status?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="cites" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-600" /> CITES-Listed Species
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CITES_SPECIES.map((sp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-xs font-semibold">{sp.nameEn}</p>
                      <p className="text-[10px] text-muted-foreground italic">{sp.name}</p>
                    </div>
                    <Badge className={sp.appendix === 'I' ? 'bg-red-600 text-white text-[10px]' : 'bg-yellow-600 text-white text-[10px]'}>
                      CITES Appendix {sp.appendix}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-water-700" /> Water Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WATER_SOURCES.map((ws, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-water-400/10 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-water-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ws.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ws.type === 'river' ? 'River' : ws.type === 'lake' ? 'Reservoir' : 'Stream'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="index" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Shannon-Wiener Diversity Index</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-forest-600">H&apos; = {SHANNON_WIENER}</p>
                  <p className="text-sm text-muted-foreground mt-2">High biodiversity (H&apos; &gt; 3.0)</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Simpson Index: D = {SIMPSON}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Biodiversity Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={BIODIVERSITY_RADAR}>
                    <PolarGrid stroke="#C8E6C9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} tick={{ fontSize: 9 }} />
                    <Radar name="Index" dataKey="A" stroke="#2D6A4F" fill="#2D6A4F" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Biodiversity Record Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.biodiversity.addObservation}</DialogTitle>
            <DialogDescription>{t.biodiversity.addObservation}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.biodiversity.plotId} *</Label>
              <Select value={formPlotId} onValueChange={setFormPlotId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.category} *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Cây</SelectItem>
                  <SelectItem value="animal">Động vật</SelectItem>
                  <SelectItem value="plant">Thực vật</SelectItem>
                  <SelectItem value="bird">Chim</SelectItem>
                  <SelectItem value="insect">Côn trùng</SelectItem>
                  <SelectItem value="aquatic">Thủy sinh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.speciesName} *</Label>
              <Input placeholder="Dipterocarpus alatus" className="mt-1" value={formSpeciesName} onChange={e => setFormSpeciesName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.count}</Label>
              <Input type="number" placeholder="0" className="mt-1" value={formCount} onChange={e => setFormCount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.conservationStatus}</Label>
              <Select value={formConservationStatus} onValueChange={setFormConservationStatus}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CR">CR — {t.biodiversity.criticallyEndangered}</SelectItem>
                  <SelectItem value="EN">EN — {t.biodiversity.endangered}</SelectItem>
                  <SelectItem value="VU">VU — {t.biodiversity.vulnerable}</SelectItem>
                  <SelectItem value="NT">NT — {t.biodiversity.nearThreatened}</SelectItem>
                  <SelectItem value="LC">LC — {t.biodiversity.leastConcern}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.notes}</Label>
              <Textarea className="mt-1" rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder={t.biodiversity.notes} />
            </div>
            <DialogFooter>
              <Button className="w-full bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleCreate}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.biodiversity.saving}</> : t.biodiversity.addObservation}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Biodiversity Record Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedRecord(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.biodiversity.editObservation}</DialogTitle>
            <DialogDescription>{t.biodiversity.editObservation}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.biodiversity.plotId}</Label>
              <Select value={editPlotId} onValueChange={setEditPlotId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.category} *</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Cây</SelectItem>
                  <SelectItem value="animal">Động vật</SelectItem>
                  <SelectItem value="plant">Thực vật</SelectItem>
                  <SelectItem value="bird">Chim</SelectItem>
                  <SelectItem value="insect">Côn trùng</SelectItem>
                  <SelectItem value="aquatic">Thủy sinh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.speciesName} *</Label>
              <Input className="mt-1" value={editSpeciesName} onChange={e => setEditSpeciesName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.count}</Label>
              <Input type="number" className="mt-1" value={editCount} onChange={e => setEditCount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.conservationStatus}</Label>
              <Select value={editConservationStatus} onValueChange={setEditConservationStatus}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.common.select} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CR">CR — {t.biodiversity.criticallyEndangered}</SelectItem>
                  <SelectItem value="EN">EN — {t.biodiversity.endangered}</SelectItem>
                  <SelectItem value="VU">VU — {t.biodiversity.vulnerable}</SelectItem>
                  <SelectItem value="NT">NT — {t.biodiversity.nearThreatened}</SelectItem>
                  <SelectItem value="LC">LC — {t.biodiversity.leastConcern}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.biodiversity.notes}</Label>
              <Textarea className="mt-1" rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder={t.biodiversity.notes} />
            </div>
            <DialogFooter>
              <Button className="w-full bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleEdit}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.biodiversity.saving}</> : t.common.save}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
