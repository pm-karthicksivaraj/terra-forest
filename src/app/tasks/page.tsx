'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ListTodo, UserCheck, Activity, CheckCircle2, ShieldCheck, AlertTriangle, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';
import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants';

interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  team_id: string | null;
  assigned_to: string | null;
  plot_id: string | null;
  task_type: string;
  priority: string;
  status: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  assignee?: { id: string; name: string };
  team?: { id: string; name: string; code: string };
  plot?: { id: string; plot_code: string };
  creator?: { id: string; name: string };
  _count?: { proofs: number };
}

interface TeamRecord { id: string; name: string; code: string }
interface UserRecord { id: string; name: string }
interface PlotRecord { id: string; plot_code: string }

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
  verified: 'bg-emerald-200 text-emerald-900',
  overdue: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const EMPTY_FORM = { title: '', description: '', task_type: '', priority: 'medium', assigned_to: '', team_id: '', plot_id: '', due_date: '' };

export default function TasksPage() {
  const { t } = useI18n();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [plots, setPlots] = useState<PlotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  // Create form
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  // Edit form
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [tasksRes, teamsRes, usersRes, plotsRes] = await Promise.all([
        fetch('/api/tasks', { headers }),
        fetch('/api/teams', { headers }),
        fetch('/api/users?limit=100', { headers }),
        fetch('/api/forest-plots?limit=100', { headers }),
      ]);
      if (tasksRes.ok) { const d = await tasksRes.json(); setTasks(d.data || []); }
      if (teamsRes.ok) { const d = await teamsRes.json(); setTeams(d.data || []); }
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.data || []); }
      if (plotsRes.ok) { const d = await plotsRes.json(); setPlots(d.data || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!createForm.title || !createForm.task_type) {
      toast({ title: t.common.error, description: t.tasks.titleRequired, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...createForm,
          assigned_to: createForm.assigned_to || null,
          team_id: createForm.team_id || null,
          plot_id: createForm.plot_id || null,
          due_date: createForm.due_date || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.tasks.taskCreated });
        setShowCreateDialog(false);
        setCreateForm({ ...EMPTY_FORM });
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.tasks.createFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.tasks.connectionError, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const openEditDialog = (task: TaskRecord) => {
    setEditForm({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type,
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      team_id: task.team_id || '',
      plot_id: task.plot_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const handleEdit = async () => {
    if (!selectedTask) return;
    if (!editForm.title || !editForm.task_type) {
      toast({ title: t.common.error, description: t.tasks.titleRequired, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          task_type: editForm.task_type,
          priority: editForm.priority,
          assigned_to: editForm.assigned_to || null,
          team_id: editForm.team_id || null,
          plot_id: editForm.plot_id || null,
          due_date: editForm.due_date || null,
        }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.tasks.taskUpdated });
        setShowEditDialog(false);
        setSelectedTask(null);
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.tasks.updateFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.tasks.connectionError, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.tasks.taskDeleted });
        setTaskToDelete(null);
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: t.common.error, description: data.error?.message || t.tasks.deleteFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.tasks.connectionError, variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    setActionLoading(taskId + newStatus);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: t.common.success, description: t.tasks.taskUpdated });
        fetchData();
        if (selectedTask?.id === taskId) {
          const detail = await (await fetch(`/api/tasks/${taskId}`, { headers: getAuthHeaders() })).json();
          if (detail.data) setSelectedTask(detail.data);
        }
      } else {
        toast({ title: t.common.error, description: t.tasks.updateFailed, variant: 'destructive' });
      }
    } catch {
      toast({ title: t.common.error, description: t.tasks.connectionError, variant: 'destructive' });
    } finally { setActionLoading(null); }
  };

  const SUMMARY = [
    { label: t.common.total, value: tasks.length, icon: ListTodo, color: 'text-emerald-700' },
    { label: t.common.assigned, value: tasks.filter(t => t.status === 'assigned').length, icon: UserCheck, color: 'text-blue-600' },
    { label: t.common.inProgress, value: tasks.filter(t => t.status === 'in_progress').length, icon: Activity, color: 'text-orange-600' },
    { label: t.common.completed, value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: t.common.verified, value: tasks.filter(t => t.status === 'verified').length, icon: ShieldCheck, color: 'text-emerald-600' },
    { label: t.common.failed, value: tasks.filter(t => t.status === 'failed').length, icon: AlertTriangle, color: 'text-red-600' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.tasks.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.tasks.subtitle}</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" /> {t.tasks.createTask}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t.tasks.taskRegistry}</CardTitle></CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 pr-2 font-semibold">{t.tasks.taskTitle}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.taskType}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.priority}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.assignTo}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.team}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.plot}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.tasks.dueDate}</th>
                <th className="text-left py-2 px-2 font-semibold">{t.common.status}</th>
                <th className="text-left py-2 pl-2 font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 pr-2 font-medium">{task.title}</td>
                  <td className="py-2 px-2">{task.task_type}</td>
                  <td className="py-2 px-2"><Badge className={`text-[10px] ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</Badge></td>
                  <td className="py-2 px-2">{task.assignee?.name || t.tasks.unassigned}</td>
                  <td className="py-2 px-2 font-mono">{task.team?.code || t.tasks.noTeam}</td>
                  <td className="py-2 px-2 font-mono">{task.plot?.plot_code || t.tasks.noPlot}</td>
                  <td className="py-2 px-2 font-mono">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-2 px-2"><Badge className={`text-[10px] ${STATUS_COLORS[task.status] || ''}`}>{task.status.replace('_', ' ')}</Badge></td>
                  <td className="py-2 pl-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditDialog(task)} title={t.common.edit}>
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
                            <AlertDialogTitle>{t.tasks.deleteTask}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.tasks.deleteConfirm.replace('{title}', task.title)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(task.id)} className="bg-red-600 hover:bg-red-700">
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

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask && !showEditDialog} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t.common.details}</DialogTitle></DialogHeader>
          {selectedTask && (
            <div className="space-y-4 mt-4 text-sm">
              <div><span className="text-xs text-muted-foreground">{t.tasks.taskTitle}</span><p className="font-semibold">{selectedTask.title}</p></div>
              <div><span className="text-xs text-muted-foreground">{t.common.description}</span><p className="text-xs">{selectedTask.description || 'N/A'}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-xs text-muted-foreground">{t.tasks.taskType}</span><p>{selectedTask.task_type}</p></div>
                <div><span className="text-xs text-muted-foreground">{t.tasks.priority}</span><p><Badge className={`text-[10px] ${PRIORITY_COLORS[selectedTask.priority]}`}>{selectedTask.priority}</Badge></p></div>
                <div><span className="text-xs text-muted-foreground">{t.tasks.assignTo}</span><p>{selectedTask.assignee?.name || t.tasks.unassigned}</p></div>
                <div><span className="text-xs text-muted-foreground">{t.tasks.plot}</span><p className="font-mono">{selectedTask.plot?.plot_code || t.tasks.noPlot}</p></div>
                <div><span className="text-xs text-muted-foreground">{t.tasks.dueDate}</span><p className="font-mono">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'N/A'}</p></div>
                <div><span className="text-xs text-muted-foreground">{t.common.status}</span><p><Badge className={`text-[10px] ${STATUS_COLORS[selectedTask.status]}`}>{selectedTask.status.replace('_', ' ')}</Badge></p></div>
              </div>
              <div className="border-t pt-3 flex gap-2">
                {selectedTask.status === 'assigned' && (
                  <Button className="flex-1 text-xs" disabled={!!actionLoading} onClick={() => handleStatusUpdate(selectedTask.id, 'in_progress')}>
                    {actionLoading === selectedTask.id + 'in_progress' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.tasks.startTask}
                  </Button>
                )}
                {selectedTask.status === 'in_progress' && (
                  <Button className="flex-1 text-xs" disabled={!!actionLoading} onClick={() => handleStatusUpdate(selectedTask.id, 'completed')}>
                    {actionLoading === selectedTask.id + 'completed' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.tasks.completeTask}
                  </Button>
                )}
                {selectedTask.status === 'completed' && (
                  <Button className="flex-1 text-xs" disabled={!!actionLoading} onClick={() => handleStatusUpdate(selectedTask.id, 'verified')}>
                    {actionLoading === selectedTask.id + 'verified' ? <Loader2 className="w-3 h-3 animate-spin" /> : t.tasks.verifyTask}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.tasks.createTask}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t.tasks.taskTitle} *</Label>
              <Input placeholder={t.tasks.taskTitle} value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>{t.tasks.taskDescription}</Label>
              <Textarea placeholder={t.tasks.taskDescription} value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.taskType} *</Label>
                <Select value={createForm.task_type} onValueChange={v => setCreateForm(f => ({ ...f, task_type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectType} /></SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(tp => <SelectItem key={tp.value} value={tp.value}>{tp.labelVi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.tasks.priority}</Label>
                <Select value={createForm.priority} onValueChange={v => setCreateForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.labelVi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.assignTo}</Label>
                <Select value={createForm.assigned_to} onValueChange={v => setCreateForm(f => ({ ...f, assigned_to: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectPerson} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.unassigned}</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.tasks.team}</Label>
                <Select value={createForm.team_id} onValueChange={v => setCreateForm(f => ({ ...f, team_id: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectTeam} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.noTeam}</SelectItem>
                    {teams.map(tm => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.dueDate}</Label>
                <Input type="date" value={createForm.due_date} onChange={e => setCreateForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <Label>{t.tasks.plot}</Label>
                <Select value={createForm.plot_id} onValueChange={v => setCreateForm(f => ({ ...f, plot_id: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectPlot} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.noPlot}</SelectItem>
                    {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" disabled={submitting} onClick={handleCreate}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.tasks.creating}</> : t.tasks.createTask}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedTask(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.tasks.editTask}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t.tasks.taskTitle} *</Label>
              <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>{t.tasks.taskDescription}</Label>
              <Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.taskType} *</Label>
                <Select value={editForm.task_type} onValueChange={v => setEditForm(f => ({ ...f, task_type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectType} /></SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(tp => <SelectItem key={tp.value} value={tp.value}>{tp.labelVi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.tasks.priority}</Label>
                <Select value={editForm.priority} onValueChange={v => setEditForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.labelVi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.assignTo}</Label>
                <Select value={editForm.assigned_to} onValueChange={v => setEditForm(f => ({ ...f, assigned_to: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectPerson} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.unassigned}</SelectItem>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.tasks.team}</Label>
                <Select value={editForm.team_id} onValueChange={v => setEditForm(f => ({ ...f, team_id: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectTeam} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.noTeam}</SelectItem>
                    {teams.map(tm => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.tasks.dueDate}</Label>
                <Input type="date" value={editForm.due_date} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <Label>{t.tasks.plot}</Label>
                <Select value={editForm.plot_id} onValueChange={v => setEditForm(f => ({ ...f, plot_id: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t.tasks.selectPlot} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.tasks.noPlot}</SelectItem>
                    {plots.map(p => <SelectItem key={p.id} value={p.id}>{p.plot_code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" disabled={submitting} onClick={handleEdit}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t.tasks.saving}</> : t.tasks.saveChanges}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
