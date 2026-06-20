'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UsersRound, Activity, Clock, XCircle, MapPin, Truck, CalendarDays, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface TeamRecord {
  id: string;
  name: string;
  code: string;
  description: string | null;
  province_id: string | null;
  status: string;
  leader_id: string;
  created_at: string;
  leader?: { id: string; name: string };
  province?: { id: string; name_en: string; code: string };
  members?: { id: string; role: string; user: { id: string; name: string } }[];
  _count?: { tasks: number };
}

interface UserRecord {
  id: string;
  name: string;
}

interface ProvinceRecord {
  id: string;
  name_en: string;
  code: string;
}

export default function TeamsPage() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [provinces, setProvinces] = useState<ProvinceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamRecord | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<TeamRecord | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({ name: '', code: '', leader_id: '', province_id: '', status: 'active', description: '' });
  // Edit form
  const [editForm, setEditForm] = useState({ name: '', code: '', leader_id: '', province_id: '', status: 'active', description: '' });

  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [teamsRes, usersRes, provRes] = await Promise.all([
        fetch('/api/teams', { headers }),
        fetch('/api/users?limit=100', { headers }),
        fetch('/api/provinces', { headers }),
      ]);
      if (teamsRes.ok) { const d = await teamsRes.json(); setTeams(d.data || []); }
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.data || []); }
      if (provRes.ok) { const d = await provRes.json(); setProvinces(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.code || !createForm.leader_id) {
      toast({ title: 'Lỗi', description: 'Tên, mã đội và trưởng đội là bắt buộc', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã tạo đội mới' });
        setShowCreateDialog(false);
        setCreateForm({ name: '', code: '', leader_id: '', province_id: '', status: 'active', description: '' });
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Tạo thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!editTeam) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${editTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          province_id: editForm.province_id || null,
          leader_id: editForm.leader_id,
          status: editForm.status,
        }),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã cập nhật đội' });
        setEditTeam(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Cập nhật thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã xóa đội' });
        setDeleteTeam(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Xóa thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    }
  };

  const openEditDialog = (team: TeamRecord) => {
    setEditForm({
      name: team.name,
      code: team.code,
      leader_id: team.leader_id,
      province_id: team.province_id || '',
      status: team.status,
      description: team.description || '',
    });
    setEditTeam(team);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ranger Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">Scouting team formation, member assignment, and patrol area management</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" /> Tạo đội mới
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Teams', value: teams.length, icon: UsersRound, color: 'text-emerald-700' },
          { label: 'Active', value: teams.filter(t => t.status === 'active').length, icon: Activity, color: 'text-emerald-500' },
          { label: 'Standby', value: teams.filter(t => t.status === 'standby').length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Disbanded', value: teams.filter(t => t.status === 'disbanded').length, icon: XCircle, color: 'text-muted-foreground' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <Card key={team.code} className="cursor-pointer" onClick={() => setExpandedTeam(expandedTeam === team.code ? null : team.code)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">{team.name}</h3>
                <div className="flex items-center gap-1">
                  <Badge variant={team.status === 'active' ? 'default' : team.status === 'standby' ? 'secondary' : 'outline'} className="text-[10px]">
                    {team.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={e => { e.stopPropagation(); openEditDialog(team); }}><Pencil className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Code:</span> {team.code}</p>
                <p><span className="font-medium text-foreground">Leader:</span> {team.leader?.name || 'N/A'}</p>
                <p><span className="font-medium text-foreground">Members:</span> {team.members?.length || 0}</p>
                <p><span className="font-medium text-foreground">Province:</span> {team.province?.name_en || 'N/A'}</p>
              </div>

              {expandedTeam === team.code && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div>
                    <p className="text-xs font-semibold mb-1">Member List</p>
                    {team.members?.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-xs">
                        <span>{m.user.name}</span>
                        <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                      </div>
                    ))}
                  </div>
                  {team.description && <p className="text-xs text-muted-foreground">{team.description}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo đội mới</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Tên đội *</Label><Input placeholder="Eagle Patrol" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Mã đội *</Label><Input placeholder="EAG" value={createForm.code} onChange={e => setCreateForm(f => ({ ...f, code: e.target.value }))} /></div>
            <div>
              <Label>Trưởng đội *</Label>
              <Select value={createForm.leader_id} onValueChange={v => setCreateForm(f => ({ ...f, leader_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn trưởng đội" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tỉnh</Label>
              <Select value={createForm.province_id} onValueChange={v => setCreateForm(f => ({ ...f, province_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn tỉnh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="standby">Standby</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Mô tả</Label><Input placeholder="Team description" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} /></div>
            <Button className="w-full" disabled={submitting} onClick={handleCreate}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang tạo...</> : 'Tạo đội'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editTeam} onOpenChange={() => setEditTeam(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa đội</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Tên đội</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Trưởng đội</Label>
              <Select value={editForm.leader_id} onValueChange={v => setEditForm(f => ({ ...f, leader_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tỉnh</Label>
              <Select value={editForm.province_id} onValueChange={v => setEditForm(f => ({ ...f, province_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {provinces.map(p => <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="standby">Standby</SelectItem>
                  <SelectItem value="disbanded">Disbanded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Mô tả</Label><Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={submitting} onClick={handleEdit}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving...</> : 'Lưu thay đổi'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={submitting}><Trash2 className="w-4 h-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa đội?</AlertDialogTitle>
                    <AlertDialogDescription>Bạn có chắc chắn muốn xóa đội "{editTeam?.name}"?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={() => editTeam && handleDelete(editTeam.id)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
