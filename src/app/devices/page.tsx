'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Activity, XCircle, MapPin, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

interface DeviceRecord {
  id: string;
  device_uuid: string;
  device_name: string | null;
  platform: string;
  os_version: string | null;
  app_version: string | null;
  fcm_token: string | null;
  user_id: string | null;
  status: string;
  last_active_at: string | null;
  registered_at: string;
  user?: { id: string; name: string };
}

interface UserOption {
  id: string;
  name: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  // Register form state
  const [regForm, setRegForm] = useState({
    device_name: '',
    platform: '',
    os_version: '',
    fcm_token: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    device_name: '',
    platform: '',
    os_version: '',
    app_version: '',
    status: '',
    user_id: '',
  });

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/mobile-devices', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setDevices(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setUsers((d.data || []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }))); }
    } catch { /* ignore */ }
  }, [getAuthHeaders]);

  useEffect(() => { fetchDevices(); fetchUsers(); }, [fetchDevices, fetchUsers]);

  // ─── Register ───────────────────────────────────────────────
  const handleRegister = async () => {
    if (!regForm.platform) {
      toast({ title: t.common.error, description: `${t.devices.platform} *`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const deviceUuid = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const res = await fetch('/api/mobile-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          device_uuid: deviceUuid,
          device_name: regForm.device_name || null,
          platform: regForm.platform,
          os_version: regForm.os_version || null,
          fcm_token: regForm.fcm_token || null,
          status: 'active',
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.devices.registerSuccess });
        setShowRegisterDialog(false);
        setRegForm({ device_name: '', platform: '', os_version: '', fcm_token: '' });
        fetchDevices();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  // ─── Edit ───────────────────────────────────────────────────
  const openEditDialog = (device: DeviceRecord) => {
    setEditForm({
      device_name: device.device_name || '',
      platform: device.platform || '',
      os_version: device.os_version || '',
      app_version: device.app_version || '',
      status: device.status || 'active',
      user_id: device.user_id || '',
    });
    setSelectedDevice(device);
    setShowEditDialog(true);
  };

  const handleEdit = async () => {
    if (!selectedDevice) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mobile-devices/${selectedDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          device_name: editForm.device_name || null,
          os_version: editForm.os_version || null,
          app_version: editForm.app_version || null,
          status: editForm.status,
          user_id: editForm.user_id || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.devices.editSuccess });
        setShowEditDialog(false);
        setSelectedDevice(null);
        fetchDevices();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  // ─── Delete ─────────────────────────────────────────────────
  const handleDelete = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/mobile-devices/${deviceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.devices.deleteSuccess });
        fetchDevices();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: 'destructive' });
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────
  const SUMMARY = [
    { label: t.common.total, value: devices.length, icon: Smartphone, color: 'text-emerald-700' },
    { label: t.common.active, value: devices.filter(d => d.status === 'active').length, icon: Activity, color: 'text-emerald-500' },
    { label: t.common.inactive, value: devices.filter(d => d.status === 'disabled').length, icon: XCircle, color: 'text-muted-foreground' },
    { label: t.common.failed, value: devices.filter(d => d.status === 'lost').length, icon: MapPin, color: 'text-red-600' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.devices.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.devices.registerDevice}, {t.common.status} {t.common.update.toLowerCase()}, &amp; {t.devices.deleteDevice.toLowerCase()}
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowRegisterDialog(true)}>
          <Plus className="w-4 h-4" /> {t.devices.registerDevice}
        </Button>
      </div>

      {/* Summary Cards */}
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

      {/* Device Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{t.devices.deviceRegistry}</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-semibold">{t.devices.deviceName}</th>
                <th className="text-left py-2 px-2 font-semibold">UUID</th>
                <th className="text-left py-2 px-2 font-semibold">{t.devices.platform}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.devices.assignedTo}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.devices.osVersion}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.devices.appVersion}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.devices.lastActive}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.common.status}</th>
                <th className="text-left py-2 pl-2 font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 pr-2 font-mono font-medium">{d.device_name || 'Unnamed'}</td>
                  <td className="py-2 px-2 font-mono text-muted-foreground text-[10px]">{d.device_uuid.slice(0, 12)}...</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[10px]">{d.platform}</Badge>
                  </td>
                  <td className="py-2 px-2">{d.user?.name || t.devices.unassigned}</td>
                  <td className="py-2 px-2">{d.os_version || 'N/A'}</td>
                  <td className="py-2 px-2 font-mono">{d.app_version || 'N/A'}</td>
                  <td className="py-2 px-2 font-mono text-muted-foreground">{d.last_active_at ? new Date(d.last_active_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-2 px-2">
                    <Badge variant={d.status === 'active' ? 'default' : d.status === 'disabled' ? 'outline' : 'destructive'} className="text-[10px]">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-2 pl-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => openEditDialog(d)}
                        title={t.common.edit}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title={t.common.delete}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t.devices.deleteConfirmTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.devices.deleteConfirmDescription.replace('{name}', d.device_name || 'Unnamed')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(d.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t.common.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Register Device Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.devices.registerDevice}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t.devices.deviceName}</Label>
              <Input
                placeholder="TF-Android-014"
                value={regForm.device_name}
                onChange={e => setRegForm(f => ({ ...f, device_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.devices.platform} *</Label>
              <Select value={regForm.platform} onValueChange={v => setRegForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.devices.osVersion}</Label>
              <Input
                placeholder="Android 14"
                value={regForm.os_version}
                onChange={e => setRegForm(f => ({ ...f, os_version: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.devices.fcmToken}</Label>
              <Input
                placeholder="Firebase Cloud Messaging token"
                value={regForm.fcm_token}
                onChange={e => setRegForm(f => ({ ...f, fcm_token: e.target.value }))}
              />
            </div>
            <Button className="w-full" disabled={submitting} onClick={handleRegister}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.devices.registering}</> : t.devices.registerDevice}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedDevice(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.devices.editDevice}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t.devices.deviceName}</Label>
              <Input
                value={editForm.device_name}
                onChange={e => setEditForm(f => ({ ...f, device_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.devices.platform}</Label>
              <Select value={editForm.platform} onValueChange={v => setEditForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.devices.osVersion}</Label>
              <Input
                value={editForm.os_version}
                onChange={e => setEditForm(f => ({ ...f, os_version: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.devices.appVersion}</Label>
              <Input
                value={editForm.app_version}
                onChange={e => setEditForm(f => ({ ...f, app_version: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t.common.status}</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.common.active}</SelectItem>
                  <SelectItem value="disabled">{t.common.inactive}</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.devices.assignedTo}</Label>
              <Select value={editForm.user_id} onValueChange={v => setEditForm(f => ({ ...f, user_id: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t.devices.unassigned} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">({t.devices.unassigned})</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowEditDialog(false); setSelectedDevice(null); }}>
                {t.common.cancel}
              </Button>
              <Button className="flex-1" disabled={submitting} onClick={handleEdit}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.devices.saving}</> : t.common.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
