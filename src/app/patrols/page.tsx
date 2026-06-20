'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Footprints, MapPin, Plus, Users, Clock, CheckCircle, Eye, Smartphone, Route, Radio, ExternalLink, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

interface PatrolRecord {
  id: string;
  title: string;
  description: string | null;
  leader_id: string;
  plot_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  route_geojson: string | null;
  created_at: string;
  leader?: { id: string; name: string };
  plot?: { id: string; plot_code: string };
  members?: { id: string; role: string; user: { id: string; name: string } }[];
  _count?: { observations: number };
}

interface ForestPlot {
  id: string;
  plot_code: string;
}

interface UserRecord {
  id: string;
  name: string;
}

export default function PatrolsPage() {
  const { t } = useI18n();
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPatrolId, setSelectedPatrolId] = useState<string | null>(null);
  const [editingPatrol, setEditingPatrol] = useState<PatrolRecord | null>(null);
  const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
  const [plots, setPlots] = useState<ForestPlot[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  // Create form state
  const [formTitle, setFormTitle] = useState('');
  const [formPlotId, setFormPlotId] = useState('');
  const [formLeaderId, setFormLeaderId] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editPlotId, setEditPlotId] = useState('');
  const [editLeaderId, setEditLeaderId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [patrolsRes, plotsRes, usersRes] = await Promise.all([
        fetch('/api/patrols', { headers }),
        fetch('/api/forest-plots?limit=100', { headers }),
        fetch('/api/users?limit=100', { headers }),
      ]);
      if (patrolsRes.ok) { const d = await patrolsRes.json(); setPatrols(d.data || []); }
      if (plotsRes.ok) { const d = await plotsRes.json(); setPlots(d.data || []); }
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetCreateForm = () => {
    setFormTitle(''); setFormPlotId(''); setFormLeaderId(''); setFormStartTime(''); setFormDescription('');
  };

  const handleCreatePatrol = async () => {
    if (!formTitle || !formLeaderId) {
      toast({ title: t.common.error, description: `${t.patrols.patrolTitle} & ${t.patrols.teamLead} là bắt buộc`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          leader_id: formLeaderId,
          plot_id: formPlotId === 'none' ? null : formPlotId || null,
          start_time: formStartTime || new Date().toISOString(),
          status: 'planned',
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.patrols.createPatrol });
        setShowNewForm(false);
        resetCreateForm();
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (patrol: PatrolRecord) => {
    setEditTitle(patrol.title);
    setEditPlotId(patrol.plot_id || 'none');
    setEditLeaderId(patrol.leader_id);
    // Convert ISO string to datetime-local format
    const dt = new Date(patrol.start_time);
    const localStr = dt.getFullYear() + '-' +
      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
      String(dt.getDate()).padStart(2, '0') + 'T' +
      String(dt.getHours()).padStart(2, '0') + ':' +
      String(dt.getMinutes()).padStart(2, '0');
    setEditStartTime(localStr);
    setEditDescription(patrol.description || '');
    setEditStatus(patrol.status);
    setEditingPatrol(patrol);
    setShowEditForm(true);
  };

  const handleEditPatrol = async () => {
    if (!editingPatrol) return;
    if (!editTitle || !editLeaderId) {
      toast({ title: t.common.error, description: `${t.patrols.patrolTitle} & ${t.patrols.teamLead} bắt buộc`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patrols/${editingPatrol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          plot_id: editPlotId === 'none' ? null : editPlotId || null,
          leader_id: editLeaderId,
          start_time: editStartTime ? new Date(editStartTime).toISOString() : undefined,
          status: editStatus,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.patrols.editPatrol });
        setShowEditForm(false);
        setEditingPatrol(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patrolId: string) => {
    try {
      const res = await fetch(`/api/patrols/${patrolId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.patrols.deletePatrol });
        if (selectedPatrolId === patrolId) setSelectedPatrolId(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.common.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-forest-500 text-white text-[10px]">{t.patrols.completed}</Badge>;
      case 'in_progress': return <Badge className="bg-fire-700 text-white text-[10px]">{t.patrols.inProgress}</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{t.patrols.planned}</Badge>;
    }
  };

  const selected = patrols.find(p => p.id === selectedPatrolId);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.patrols.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.patrols.subtitle}</p>
        </div>
        <Button className="bg-forest-600 hover:bg-forest-700" onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> {t.patrols.newPatrol}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold">{patrols.length}</p><p className="text-[10px] text-muted-foreground">{t.patrols.totalSessions}</p></CardContent></Card>
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-forest-600">{patrols.filter(p => p.status === 'completed').length}</p><p className="text-[10px] text-muted-foreground">{t.patrols.completed}</p></CardContent></Card>
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-fire-700">{patrols.filter(p => p.status === 'in_progress').length}</p><p className="text-[10px] text-muted-foreground">{t.patrols.inProgress}</p></CardContent></Card>
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-earth-700">{patrols.filter(p => p.status === 'planned').length}</p><p className="text-[10px] text-muted-foreground">{t.patrols.planned}</p></CardContent></Card>
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold">{patrols.reduce((s, p) => s + (p._count?.observations || 0), 0)}</p><p className="text-[10px] text-muted-foreground">{t.patrols.observations}</p></CardContent></Card>
        <Card className="shadow-sm border-0"><CardContent className="p-3 text-center"><p className="text-xl font-bold">{patrols.reduce((s, p) => s + (p.members?.length || 0), 0)}</p><p className="text-[10px] text-muted-foreground">{t.teams.members}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t.patrols.patrolTitle}</TableHead>
                    <TableHead className="text-xs">{t.patrols.teamLead}</TableHead>
                    <TableHead className="text-xs">{t.patrols.plot}</TableHead>
                    <TableHead className="text-xs">{t.teams.members}</TableHead>
                    <TableHead className="text-xs">{t.common.status}</TableHead>
                    <TableHead className="text-xs">{t.patrols.observations}</TableHead>
                    <TableHead className="text-xs">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patrols.map(p => (
                    <TableRow key={p.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedPatrolId(p.id)}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold">{p.title}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{new Date(p.start_time).toLocaleString()}</p>
                      </TableCell>
                      <TableCell className="text-xs">{p.leader?.name || 'N/A'}</TableCell>
                      <TableCell className="text-xs font-mono">{p.plot?.plot_code || 'N/A'}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {p.members?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-xs">{p._count?.observations || 0} obs</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(p)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.patrols.deletePatrolConfirm}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t.patrols.deletePatrolMessage}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-red-600 hover:bg-red-700">
                                  {t.common.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {t.common.details}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selected ? (
                <div className="space-y-2">
                  <div className="text-xs"><span className="text-muted-foreground">{t.patrols.patrolTitle}:</span> <span className="font-semibold">{selected.title}</span></div>
                  <div className="text-xs"><span className="text-muted-foreground">{t.patrols.teamLead}:</span> {selected.leader?.name}</div>
                  <div className="text-xs"><span className="text-muted-foreground">{t.patrols.plot}:</span> <span className="font-mono">{selected.plot?.plot_code || 'N/A'}</span></div>
                  <div className="text-xs"><span className="text-muted-foreground">{t.patrols.startDate}:</span> {new Date(selected.start_time).toLocaleString()}</div>
                  {selected.end_time && <div className="text-xs"><span className="text-muted-foreground">End:</span> {new Date(selected.end_time).toLocaleString()}</div>}
                  <div className="text-xs"><span className="text-muted-foreground">{t.patrols.notes}:</span> {selected.description || 'N/A'}</div>
                  <div className="text-xs"><span className="text-muted-foreground">{t.teams.members}:</span></div>
                  {selected.members?.map(m => (
                    <div key={m.id} className="text-[10px] pl-2 text-muted-foreground">{m.user.name} ({m.role})</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">{'Chọn tuần tra để xem chi tiết'}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Patrol Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.patrols.createPatrol}</DialogTitle>
            <DialogDescription>{t.patrols.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.patrols.patrolTitle} *</Label>
              <Input placeholder={t.patrols.patrolTitle} className="mt-1" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.patrols.forestPlot}</Label>
              <Select value={formPlotId} onValueChange={setFormPlotId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.patrols.forestPlot} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.patrols.noSpecificPlot}</SelectItem>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.patrols.teamLead} *</Label>
              <Select value={formLeaderId} onValueChange={setFormLeaderId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.patrols.selectTeamLead} /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.patrols.startDate}</Label>
              <Input type="datetime-local" className="mt-1" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.patrols.notes}</Label>
              <Input placeholder={t.patrols.notes} className="mt-1" value={formDescription} onChange={e => setFormDescription(e.target.value)} />
            </div>
            <Button className="w-full bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleCreatePatrol}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.patrols.creating}</> : t.patrols.createPatrol}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patrol Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.patrols.editPatrol}</DialogTitle>
            <DialogDescription>{t.patrols.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.patrols.patrolTitle} *</Label>
              <Input className="mt-1" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.patrols.forestPlot}</Label>
              <Select value={editPlotId} onValueChange={setEditPlotId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.patrols.noSpecificPlot}</SelectItem>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.patrols.teamLead} *</Label>
              <Select value={editLeaderId} onValueChange={setEditLeaderId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.patrols.selectTeamLead} /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.patrols.startDate}</Label>
              <Input type="datetime-local" className="mt-1" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.patrols.notes}</Label>
              <Input className="mt-1" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t.patrols.patrolStatus}</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">{t.patrols.planned}</SelectItem>
                  <SelectItem value="in_progress">{t.patrols.inProgress}</SelectItem>
                  <SelectItem value="completed">{t.patrols.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleEditPatrol}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.patrols.saving}</> : t.patrols.saveChanges}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
