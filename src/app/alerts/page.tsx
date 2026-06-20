'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertTriangle, Filter, Eye, CheckCircle, ArrowUpRight, XCircle, User, Paperclip, Clock, ExternalLink, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ALERT_TYPES, ALERT_SEVERITY, ALERT_STATUSES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

interface AlertRecord {
  id: string;
  alert_type: string;
  severity: string;
  plot_id: string | null;
  message: string | null;
  status: string;
  detected_at: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  plot?: { id: string; plot_code: string; province?: { name_en: string } };
  acknowledged_user?: { id: string; name: string };
}

interface ForestPlot {
  id: string;
  plot_code: string;
}

const STATUS_FLOW = ['active', 'acknowledged', 'in_field', 'resolved'] as const;

const ACTION_TO_STATUS: Record<string, string> = {
  acknowledge: 'acknowledged',
  dispatch: 'in_field',
  resolve: 'resolved',
};

const ESCALATION_STEPS = [
  { step: 'Detection', desc: 'Automated detection via Sentinel-2 change analysis, SAR processing, or acoustic sensor' },
  { step: 'Verification', desc: 'Operations team confirms alert validity and cross-references with patrol reports' },
  { step: 'Reporting', desc: 'Incident reported to provincial forest authority and alert assigned to response team' },
  { step: 'Response', desc: 'Ranger team dispatched for ground verification, evidence collection, and containment' },
  { step: 'Control', desc: 'Incident resolved, evidence archived, and closure report filed to FRMS 4.0' },
];

export default function AlertsPage() {
  const { t } = useI18n();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [plots, setPlots] = useState<ForestPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAlert, setEditAlert] = useState<AlertRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  // Create form state
  const [formAlertType, setFormAlertType] = useState('');
  const [formSeverity, setFormSeverity] = useState('');
  const [formPlotId, setFormPlotId] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Edit form state
  const [editFormAlertType, setEditFormAlertType] = useState('');
  const [editFormSeverity, setEditFormSeverity] = useState('');
  const [editFormPlotId, setEditFormPlotId] = useState('');
  const [editFormMessage, setEditFormMessage] = useState('');
  const [editFormStatus, setEditFormStatus] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.data || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchPlots = useCallback(async () => {
    try {
      const res = await fetch('/api/forest-plots?limit=100', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPlots(data.data || []);
      }
    } catch { /* ignore */ }
  }, [getAuthHeaders]);

  useEffect(() => { fetchAlerts(); fetchPlots(); }, [fetchAlerts, fetchPlots]);

  const filtered = alerts.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && a.alert_type !== typeFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const getSeverityStyle = (s: string) => ALERT_SEVERITY.find(x => x.value === s) || ALERT_SEVERITY[3];
  const getTypeLabel = (tVal: string) => ALERT_TYPES.find(x => x.value === tVal)?.label || tVal;
  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = { active: t.alerts['new'], acknowledged: t.alerts.acknowledged, in_field: t.alerts.inField, resolved: t.alerts.resolved };
    return map[s] || s;
  };
  const getStatusColor = (s: string) => {
    const map: Record<string, string> = { active: '#D32F2F', acknowledged: '#E65100', in_field: '#0277BD', resolved: '#2D6A4F' };
    return map[s] || '#795548';
  };

  const getStatusIcon = (s: string) => {
    if (s === 'active') return <AlertTriangle className="w-3 h-3" style={{ color: getStatusColor(s) }} />;
    if (s === 'acknowledged') return <CheckCircle className="w-3 h-3" style={{ color: getStatusColor(s) }} />;
    if (s === 'in_field') return <ArrowUpRight className="w-3 h-3" style={{ color: getStatusColor(s) }} />;
    return <XCircle className="w-3 h-3" style={{ color: getStatusColor(s) }} />;
  };

  const getStatusBg = (s: string) => {
    if (s === 'active') return 'bg-red-100 text-red-700';
    if (s === 'acknowledged') return 'bg-orange-100 text-orange-700';
    if (s === 'in_field') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getEscalationStatus = (stepIndex: number, alert: AlertRecord) => {
    const statusOrder: Record<string, number> = { active: 0, acknowledged: 1, in_field: 2, resolved: 3 };
    const currentIdx = statusOrder[alert.status] ?? 0;
    if (stepIndex < currentIdx) return 'done';
    if (stepIndex === currentIdx) return 'active';
    return 'pending';
  };

  const handleCreateAlert = async () => {
    if (!formAlertType || !formSeverity) {
      toast({ title: t.common.error, description: `${t.alerts.alertType} & ${t.alerts.severity} ${t.common.confirm}`, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          alert_type: formAlertType,
          severity: formSeverity,
          plot_id: formPlotId || null,
          message: formMessage || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.alerts.alertCreated });
        setShowCreateDialog(false);
        setFormAlertType(''); setFormSeverity(''); setFormPlotId(''); setFormMessage('');
        fetchAlerts();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.alerts.updateFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.alerts.updateFailed, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // BUG FIX: Send { status: 'acknowledged' } etc. instead of { action: 'acknowledge' }
  const handleAlertAction = async (alertId: string, action: string) => {
    const newStatus = ACTION_TO_STATUS[action];
    if (!newStatus) return;

    setActionLoading(alertId + action);
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.alerts.statusUpdated });
        fetchAlerts();
        // Refresh selected alert
        if (selectedAlert?.id === alertId) {
          const detail = await (await fetch(`/api/alerts/${alertId}`, { headers: getAuthHeaders() })).json();
          if (detail.data) setSelectedAlert(detail.data);
        }
      } else {
        toast({ title: t.common.error, description: t.alerts.updateFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.alerts.updateFailed, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (alert: AlertRecord) => {
    setEditAlert(alert);
    setEditFormAlertType(alert.alert_type);
    setEditFormSeverity(alert.severity);
    setEditFormPlotId(alert.plot_id || '');
    setEditFormMessage(alert.message || '');
    setEditFormStatus(alert.status);
    setShowEditDialog(true);
  };

  const handleEditAlert = async () => {
    if (!editAlert) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/alerts/${editAlert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          alert_type: editFormAlertType,
          severity: editFormSeverity,
          plot_id: editFormPlotId || null,
          message: editFormMessage || null,
          status: editFormStatus,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.alerts.alertUpdated });
        setShowEditDialog(false);
        setEditAlert(null);
        fetchAlerts();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.alerts.updateFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.alerts.updateFailed, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.alerts.alertDeleted });
        setSelectedAlert(null);
        fetchAlerts();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.alerts.deleteFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.alerts.deleteFailed, variant: 'destructive' });
    }
  };

  const SEVERITY_PIE = ALERT_SEVERITY.map(s => ({
    name: s.label,
    value: alerts.filter(a => a.severity === s.value).length,
    color: s.color,
  }));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.alerts.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.alerts.subtitle}
          </p>
        </div>
        <Button className="bg-forest-600 hover:bg-forest-700" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> {t.alerts.createAlert}
        </Button>
      </div>

      {/* Severity dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ALERT_SEVERITY.map(sev => {
            const count = alerts.filter(a => a.severity === sev.value).length;
            return (
              <Card key={sev.value} className="shadow-sm border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: sev.color }}>{count}</p>
                  <p className="text-[10px] text-muted-foreground">{sev.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="shadow-sm border-0">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold">{t.alerts.severityDistribution}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={SEVERITY_PIE} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                  {SEVERITY_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #C8E6C9', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-0">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-semibold">{t.alerts.statusSummary}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {ALERT_STATUSES.map(s => {
                const statusMap: Record<string, string> = { new: 'active', acknowledged: 'acknowledged', in_field: 'in_field', resolved: 'resolved' };
                const count = alerts.filter(a => a.status === statusMap[s.value]).length;
                return (
                  <div key={s.value}>
                    <p className="text-lg font-bold" style={{ color: s.color }}>{count}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {STATUS_FLOW.map((s, i) => (
                <React.Fragment key={s}>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: getStatusColor(s), backgroundColor: `${getStatusColor(s)}15` }}>
                    {getStatusLabel(s)}
                  </span>
                  {i < STATUS_FLOW.length - 1 && <span className="text-[9px] text-muted-foreground">→</span>}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-3 flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t.alerts.severity} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.alerts.allSeverities}</SelectItem>
              {ALERT_SEVERITY.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t.common.type} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.alerts.allTypes}</SelectItem>
              {ALERT_TYPES.map(tVal => <SelectItem key={tVal.value} value={tVal.value}>{tVal.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t.common.status} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.alerts.allStatuses}</SelectItem>
              <SelectItem value="active">{t.alerts['new']}</SelectItem>
              <SelectItem value="acknowledged">{t.alerts.acknowledged}</SelectItem>
              <SelectItem value="in_field">{t.alerts.inField}</SelectItem>
              <SelectItem value="resolved">{t.alerts.resolved}</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} {t.common.results}</span>
        </CardContent>
      </Card>

      {/* Alert table */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t.alerts.severity}</TableHead>
                <TableHead className="text-xs">{t.common.type}</TableHead>
                <TableHead className="text-xs">{t.alerts.plot}</TableHead>
                <TableHead className="text-xs">{t.alerts.description}</TableHead>
                <TableHead className="text-xs">{t.alerts.province}</TableHead>
                <TableHead className="text-xs">{t.common.status}</TableHead>
                <TableHead className="text-xs">{t.common.time}</TableHead>
                <TableHead className="text-xs">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(alert => {
                const sev = getSeverityStyle(alert.severity);
                return (
                  <TableRow key={alert.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] h-5" style={{ color: sev.color, borderColor: sev.color }}>{sev.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{getTypeLabel(alert.alert_type)}</TableCell>
                    <TableCell className="text-xs font-mono">{alert.plot?.plot_code || 'N/A'}</TableCell>
                    <TableCell className="text-xs max-w-48 truncate">{alert.message || t.common.noData}</TableCell>
                    <TableCell className="text-xs">{alert.plot?.province?.name_en || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusBg(alert.status)}`}>{getStatusLabel(alert.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(alert.detected_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {alert.status === 'active' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled={!!actionLoading} onClick={() => handleAlertAction(alert.id, 'acknowledge')}>
                            {actionLoading === alert.id + 'acknowledge' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.alerts.acknowledgeAlert}
                          </Button>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled={!!actionLoading} onClick={() => handleAlertAction(alert.id, 'dispatch')}>
                            {actionLoading === alert.id + 'dispatch' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.alerts.dispatchTeam}
                          </Button>
                        )}
                        {alert.status === 'in_field' && (
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled={!!actionLoading} onClick={() => handleAlertAction(alert.id, 'resolve')}>
                            {actionLoading === alert.id + 'resolve' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.alerts.resolveAlert}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedAlert(alert)} title={t.common.view}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditDialog(alert)} title={t.common.edit}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" title={t.common.delete}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.alerts.deleteConfirmTitle}</AlertDialogTitle>
                              <AlertDialogDescription>{t.alerts.deleteConfirmDescription}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAlert(alert.id)} className="bg-red-600 hover:bg-red-700">{t.common.delete}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedAlert && !showEditDialog} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.common.details}</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">{t.common.type}:</span> {getTypeLabel(selectedAlert.alert_type)}</div>
                <div><span className="text-muted-foreground">{t.alerts.severity}:</span> <Badge variant="outline" style={{ color: getSeverityStyle(selectedAlert.severity).color, borderColor: getSeverityStyle(selectedAlert.severity).color }}>{getSeverityStyle(selectedAlert.severity).label}</Badge></div>
                <div><span className="text-muted-foreground">{t.alerts.plot}:</span> <span className="font-mono">{selectedAlert.plot?.plot_code || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">{t.alerts.province}:</span> {selectedAlert.plot?.province?.name_en || 'N/A'}</div>
                <div><span className="text-muted-foreground">Ack. By:</span> {selectedAlert.acknowledged_user?.name || <span className="italic text-muted-foreground">N/A</span>}</div>
                <div><span className="text-muted-foreground">{t.common.status}:</span> {getStatusLabel(selectedAlert.status)}</div>
              </div>
              <div className="text-xs"><span className="text-muted-foreground">{t.alerts.description}:</span> {selectedAlert.message || t.common.noData}</div>

              {/* Escalation timeline */}
              <div>
                <p className="text-xs font-semibold mb-2">{t.alerts.escalationTimeline}</p>
                <div className="space-y-2">
                  {ESCALATION_STEPS.map((step, i) => {
                    const escStatus = getEscalationStatus(i, selectedAlert);
                    const stepLabels = [t.alerts.detection, t.alerts.verification, t.alerts.reporting, t.alerts.response, t.alerts.control];
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                          escStatus === 'done' ? 'bg-forest-500 text-white' : escStatus === 'active' ? 'bg-fire-700 text-white animate-pulse' : 'bg-muted text-muted-foreground'
                        }`}>
                          {escStatus === 'done' ? '✓' : i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{stepLabels[i]} {escStatus === 'active' && <span className="text-fire-700">({t.alerts.current})</span>}</p>
                          <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {selectedAlert.status === 'active' && (
                  <Button className="flex-1 bg-forest-600 hover:bg-forest-700 text-xs" disabled={!!actionLoading} onClick={() => handleAlertAction(selectedAlert.id, 'acknowledge')}>
                    {t.alerts.acknowledgeAlert}
                  </Button>
                )}
                {selectedAlert.status === 'acknowledged' && (
                  <Button className="flex-1 bg-forest-600 hover:bg-forest-700 text-xs" disabled={!!actionLoading} onClick={() => handleAlertAction(selectedAlert.id, 'dispatch')}>
                    {t.alerts.dispatchTeam}
                  </Button>
                )}
                {selectedAlert.status === 'in_field' && (
                  <Button className="flex-1 bg-forest-600 hover:bg-forest-700 text-xs" disabled={!!actionLoading} onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}>
                    {t.alerts.resolveAlert}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.alerts.createAlert}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{t.alerts.subtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.alerts.alertType} *</Label>
              <Select value={formAlertType} onValueChange={setFormAlertType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.alerts.selectAlertType} /></SelectTrigger>
                <SelectContent>
                  {ALERT_TYPES.map(tVal => <SelectItem key={tVal.value} value={tVal.value}>{tVal.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.severity} *</Label>
              <Select value={formSeverity} onValueChange={setFormSeverity}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.alerts.selectSeverity} /></SelectTrigger>
                <SelectContent>
                  {ALERT_SEVERITY.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.plot}</Label>
              <Select value={formPlotId} onValueChange={setFormPlotId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.alerts.selectPlot} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.alerts.noPlot}</SelectItem>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.alertMessage}</Label>
              <Textarea className="mt-1" value={formMessage} onChange={e => setFormMessage(e.target.value)} placeholder={t.alerts.alertDescription} rows={3} />
            </div>
            <Button className="w-full bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleCreateAlert}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.alerts.creating}</> : t.alerts.createAlert}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Alert Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditAlert(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{t.alerts.editAlert}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{t.alerts.alertType}, {t.alerts.severity}, {t.alerts.alertMessage}, {t.alerts.plot}, {t.common.status}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.alerts.alertType}</Label>
              <Select value={editFormAlertType} onValueChange={setEditFormAlertType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALERT_TYPES.map(tVal => <SelectItem key={tVal.value} value={tVal.value}>{tVal.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.severity}</Label>
              <Select value={editFormSeverity} onValueChange={setEditFormSeverity}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALERT_SEVERITY.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.plot}</Label>
              <Select value={editFormPlotId || 'none'} onValueChange={setEditFormPlotId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.alerts.noPlot}</SelectItem>
                  {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.alerts.alertMessage}</Label>
              <Textarea className="mt-1" value={editFormMessage} onChange={e => setEditFormMessage(e.target.value)} placeholder={t.alerts.alertDescription} rows={3} />
            </div>
            <div>
              <Label className="text-xs">{t.common.status}</Label>
              <Select value={editFormStatus} onValueChange={setEditFormStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.alerts['new']}</SelectItem>
                  <SelectItem value="acknowledged">{t.alerts.acknowledged}</SelectItem>
                  <SelectItem value="in_field">{t.alerts.inField}</SelectItem>
                  <SelectItem value="resolved">{t.alerts.resolved}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditAlert(null); }}>{t.common.cancel}</Button>
              <Button className="bg-forest-600 hover:bg-forest-700" disabled={submitting} onClick={handleEditAlert}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.alerts.saving}</> : t.alerts.saveChanges}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
