'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCheck, UserX, Wifi, Plus, Pencil, Eye, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login_at: string | null;
  province?: { id: string; name_en: string };
  organization?: { id: string; name: string };
  roles: { name: string; permissions: string[] }[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'System Admin',
  analyst: 'Analyst',
  gov_viewer: 'Gov Viewer',
  field_officer: 'Field Officer',
  system_admin: 'System Admin',
  operations_manager: 'Operations Manager',
  team_lead: 'Team Lead',
  ranger: 'Ranger',
  auditor: 'Auditor / Verifier',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  analyst: 'bg-amber-100 text-amber-800',
  gov_viewer: 'bg-blue-100 text-blue-800',
  field_officer: 'bg-emerald-100 text-emerald-800',
  system_admin: 'bg-red-100 text-red-800',
  operations_manager: 'bg-amber-100 text-amber-800',
  team_lead: 'bg-blue-100 text-blue-800',
  ranger: 'bg-emerald-100 text-emerald-800',
  auditor: 'bg-purple-100 text-purple-800',
};

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  // Create form state
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: '', province_id: '', organization: '' });
  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', is_active: true });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setUsers(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast({ title: 'Lỗi', description: 'Tên, email và mật khẩu là bắt buộc', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã tạo người dùng mới' });
        setShowCreateDialog(false);
        setCreateForm({ name: '', email: '', password: '', role: '', province_id: '', organization: '' });
        fetchUsers();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Tạo thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role || undefined,
          is_active: editForm.is_active,
        }),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã cập nhật người dùng' });
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Cập nhật thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: 'Thành công', description: 'Đã xóa người dùng' });
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast({ title: 'Lỗi', description: data.error?.message || 'Xóa thất bại', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Lỗi kết nối', variant: 'destructive' });
    }
  };

  const openEditDialog = (u: UserRecord) => {
    const roleName = u.roles?.[0]?.name || '';
    setEditForm({ name: u.name, email: u.email, role: roleName, is_active: u.is_active });
    setSelectedUser(u);
  };

  const SUMMARY = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-emerald-700' },
    { label: 'Active', value: users.filter(u => u.is_active).length, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Inactive', value: users.filter(u => !u.is_active).length, icon: UserX, color: 'text-muted-foreground' },
    { label: 'MFA Enabled', value: users.filter(u => u.mfa_enabled).length, icon: Wifi, color: 'text-emerald-400' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage platform users, assign roles, and track activity</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" /> Create User
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">User Registry</CardTitle></CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-semibold">Name</th>
                <th className="text-left py-2 px-2 font-semibold">Email</th>
                <th className="text-left py-2 px-2 font-semibold">Role</th>
                <th className="text-left py-2 px-2 font-semibold">Organization</th>
                <th className="text-left py-2 px-2 font-semibold">Province</th>
                <th className="text-left py-2 px-2 font-semibold">Status</th>
                <th className="text-left py-2 pl-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleName = u.roles?.[0]?.name || 'N/A';
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 pr-2 font-medium">{u.name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                    <td className="py-2 px-2">
                      <Badge className={`text-[10px] ${ROLE_COLORS[roleName] || ''}`}>{ROLE_LABELS[roleName] || roleName}</Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{u.organization?.name || 'N/A'}</td>
                    <td className="py-2 px-2">{u.province?.name_en || 'N/A'}</td>
                    <td className="py-2 px-2">
                      <Badge variant={u.is_active ? 'default' : 'outline'} className="text-[10px]">
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-2 pl-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(u)}><Pencil className="w-3 h-3" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
                              <AlertDialogDescription>Bạn có chắc chắn muốn xóa người dùng "{u.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Full Name *</Label><Input placeholder="Enter full name" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input type="email" placeholder="email@terraforest.vn" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Password *</Label><Input type="password" placeholder="••••••••" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div>
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">System Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="gov_viewer">Gov Viewer</SelectItem>
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Organization</Label><Input placeholder="Organization name" value={createForm.organization} onChange={e => setCreateForm(f => ({ ...f, organization: e.target.value }))} /></div>
            <Button className="w-full" disabled={submitting} onClick={handleCreate}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Creating...</> : 'Create User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Full Name</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div>
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">System Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="gov_viewer">Gov Viewer</SelectItem>
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.is_active ? 'active' : 'inactive'} onValueChange={v => setEditForm(f => ({ ...f, is_active: v === 'active' }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={submitting} onClick={handleEdit}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
