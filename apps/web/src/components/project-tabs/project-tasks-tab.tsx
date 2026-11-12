'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Sliders,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  milestoneId?: string;
  assigneeName?: string;
  trade?: string;
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  status: 'A_FAIRE' | 'EN_COURS' | 'EN_ATTENTE' | 'BLOQUEE' | 'TERMINEE' | 'ANNULEE';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plannedHours?: number;
  actualHours?: number;
  progressPercent: number;
  weightPercent?: number;
}

interface ProjectTasksTabProps {
  projectCode: string;
  tasks?: TaskItem[];
  canEdit: boolean;
  onRefresh: () => Promise<void>;
  onOpenNewTaskModal?: () => void;
}

const TRADES = [
  'Tuyauterie industrielle',
  'Soudage & Assemblage',
  'Montage mécanique',
  'Échafaudage & Calorifugeage',
  'HVAC & Froid industriel',
  'Contrôles CND & Métrologie',
  'Supervision HSE',
  'Électricité & Instrumentation',
  'Peinture & Sablage',
];

export function ProjectTasksTab({
  projectCode,
  tasks = [],
  canEdit,
  onRefresh,
}: ProjectTasksTabProps) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [tradeFilter, setTradeFilter] = useState('ALL');

  // Modal création tâche
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trade, setTrade] = useState('Tuyauterie industrielle');
  const [assigneeName, setAssigneeName] = useState('');
  const [priority, setPriority] = useState<'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'>('NORMALE');
  const [status, setStatus] = useState<'A_FAIRE' | 'EN_COURS' | 'EN_ATTENTE' | 'BLOQUEE' | 'TERMINEE' | 'ANNULEE'>('A_FAIRE');
  const [plannedStartDate, setPlannedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedEndDate, setPlannedEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [plannedHours, setPlannedHours] = useState<number>(40);
  const [weightPercent, setWeightPercent] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (tradeFilter !== 'ALL' && t.trade !== tradeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchAssignee = (t.assigneeName || '').toLowerCase().includes(q);
      const matchTrade = (t.trade || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee && !matchTrade) return false;
    }
    return true;
  });

  // Indicateurs statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'TERMINEE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'EN_COURS').length;
  const blockedTasks = tasks.filter(t => t.status === 'BLOQUEE').length;
  const delayedTasks = tasks.filter(
    t => t.status !== 'TERMINEE' && t.status !== 'ANNULEE' && t.plannedEndDate && t.plannedEndDate.split('T')[0] < todayStr
  ).length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Veuillez renseigner le libellé de la tâche.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/projects/${projectCode}/tasks`, {
        title,
        description,
        trade,
        assigneeName,
        priority,
        status,
        plannedStartDate,
        plannedEndDate,
        plannedHours: Number(plannedHours || 0),
        weightPercent: Number(weightPercent || 0),
        progressPercent: status === 'TERMINEE' ? 100 : 0,
      });
      setShowCreateModal(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      setActionLoading(taskId);
      const updates: any = { status: newStatus };
      if (newStatus === 'TERMINEE') {
        updates.progressPercent = 100;
        updates.actualEndDate = new Date().toISOString();
      } else if (newStatus === 'EN_COURS' && (!updates.actualStartDate)) {
        updates.actualStartDate = new Date().toISOString();
      }
      await api.patch(`/projects/${projectCode}/tasks/${taskId}`, updates);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProgress = async (taskId: string, newProgress: number) => {
    try {
      setActionLoading(taskId);
      const updates: any = { progressPercent: newProgress };
      if (newProgress === 100) {
        updates.status = 'TERMINEE';
        updates.actualEndDate = new Date().toISOString();
      } else if (newProgress > 0 && updates.status === 'A_FAIRE') {
        updates.status = 'EN_COURS';
      }
      await api.patch(`/projects/${projectCode}/tasks/${taskId}`, updates);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTrade('Tuyauterie industrielle');
    setAssigneeName('');
    setPriority('NORMALE');
    setStatus('A_FAIRE');
    setPlannedStartDate(todayStr);
    setPlannedEndDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setPlannedHours(40);
    setWeightPercent(10);
  };

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'URGENTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">URGENTE</span>;
      case 'HAUTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">HAUTE</span>;
      case 'NORMALE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">NORMALE</span>;
      case 'BASSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">BASSE</span>;
    }
  };

  const getStatusBadge = (s: TaskItem['status']) => {
    switch (s) {
      case 'A_FAIRE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">À faire</span>;
      case 'EN_COURS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">En cours</span>;
      case 'EN_ATTENTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">En attente</span>;
      case 'BLOQUEE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">Bloquée</span>;
      case 'TERMINEE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Terminée</span>;
      case 'ANNULEE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 line-through">Annulée</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Tâches</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalTasks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Périmètre opérationnel</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Terminées</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{completedTasks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% du total
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">En Cours</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{inProgressTasks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sur chantier</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">Bloquées</div>
          <div className="text-xl font-bold text-amber-700 mt-1">{blockedTasks}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Point d&apos;arrêt</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            En Retard
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">{delayedTasks}</div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">Échéance dépassée</div>
        </div>
      </div>

      {/* Actions and Filters Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher tâche, intervenant, corps d'état..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="A_FAIRE">À faire</option>
            <option value="EN_COURS">En cours</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="BLOQUEE">Bloquée</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="URGENTE">Urgente</option>
            <option value="HAUTE">Haute</option>
            <option value="NORMALE">Normale</option>
            <option value="BASSE">Basse</option>
          </select>

          <select
            value={tradeFilter}
            onChange={e => setTradeFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Tous les corps d&apos;état</option>
            {TRADES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                viewMode === 'table' ? 'bg-[#0B207D] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tableau
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#0B207D] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban
            </button>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded-md text-xs font-semibold hover:bg-[#07164D] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Tâche</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-16">Code</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Tâche & Périmètre</th>
                  <th className="py-2.5 px-3">Corps d&apos;état / Métier</th>
                  <th className="py-2.5 px-3">Assigné à</th>
                  <th className="py-2.5 px-3 text-center">Priorité</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3">Échéance</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Avancement</th>
                  {canEdit && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 9 : 8} className="py-8 text-center text-slate-400">
                      Aucune tâche correspondant aux filtres.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(t => {
                    const isDelayed =
                      t.status !== 'TERMINEE' &&
                      t.status !== 'ANNULEE' &&
                      t.plannedEndDate &&
                      t.plannedEndDate.split('T')[0] < todayStr;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500 text-[11px]">
                          {t.code}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{t.title}</div>
                          {t.description && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {t.description}
                            </div>
                          )}
                          {isDelayed && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded mt-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              En retard sur planning
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {t.trade || 'Général'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {t.assigneeName ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-800">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{t.assigneeName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Non assigné</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {getPriorityBadge(t.priority)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {getStatusBadge(t.status)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className={`text-[11px] font-medium ${isDelayed ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                            {t.plannedEndDate ? t.plannedEndDate.split('T')[0] : 'N/A'}
                          </div>
                          {t.plannedHours && (
                            <div className="text-[10px] text-slate-400">
                              {t.plannedHours}h prévues
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{t.progressPercent || 0}%</span>
                            {t.weightPercent ? (
                              <span className="text-[10px] text-slate-400 font-normal">Poids: {t.weightPercent}%</span>
                            ) : null}
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                t.status === 'TERMINEE'
                                  ? 'bg-emerald-600'
                                  : t.status === 'BLOQUEE'
                                  ? 'bg-rose-500'
                                  : 'bg-[#0B207D]'
                              }`}
                              style={{ width: `${t.progressPercent || 0}%` }}
                            />
                          </div>
                        </td>
                        {canEdit && (
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {t.status !== 'TERMINEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'TERMINEE')}
                                  disabled={actionLoading === t.id}
                                  title="Marquer terminée (100%)"
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {t.status !== 'EN_COURS' && t.status !== 'TERMINEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'EN_COURS')}
                                  disabled={actionLoading === t.id}
                                  title="Passer en cours"
                                  className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                              {t.status !== 'BLOQUEE' && t.status !== 'TERMINEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'BLOQUEE')}
                                  disabled={actionLoading === t.id}
                                  title="Signaler bloquée"
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['A_FAIRE', 'EN_COURS', 'BLOQUEE', 'TERMINEE'] as const).map(colStatus => {
            const colTasks = filteredTasks.filter(t => t.status === colStatus);
            const colTitles: Record<string, { label: string; color: string; countColor: string }> = {
              A_FAIRE: { label: 'À Faire', color: 'border-slate-300 text-slate-800', countColor: 'bg-slate-200 text-slate-800' },
              EN_COURS: { label: 'En Cours', color: 'border-blue-400 text-blue-900', countColor: 'bg-blue-100 text-blue-800' },
              BLOQUEE: { label: 'Bloquées / Arrêt', color: 'border-rose-400 text-rose-900', countColor: 'bg-rose-100 text-rose-800' },
              TERMINEE: { label: 'Terminées', color: 'border-emerald-400 text-emerald-900', countColor: 'bg-emerald-100 text-emerald-800' },
            };
            const cfg = colTitles[colStatus];

            return (
              <div key={colStatus} className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.countColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      Aucune tâche
                    </div>
                  ) : (
                    colTasks.map(t => {
                      const isDelayed =
                        t.status !== 'TERMINEE' &&
                        t.status !== 'ANNULEE' &&
                        t.plannedEndDate &&
                        t.plannedEndDate.split('T')[0] < todayStr;

                      return (
                        <div
                          key={t.id}
                          className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              {t.code}
                            </span>
                            {getPriorityBadge(t.priority)}
                          </div>

                          <div className="font-semibold text-slate-900 line-clamp-2">
                            {t.title}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{t.trade || 'Général'}</span>
                            {t.assigneeName && (
                              <span className="font-medium text-slate-700">{t.assigneeName}</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                              <span>Avancement</span>
                              <span>{t.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  t.status === 'TERMINEE' ? 'bg-emerald-600' : 'bg-[#0B207D]'
                                }`}
                                style={{ width: `${t.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {isDelayed && (
                            <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Échéance : {t.plannedEndDate.split('T')[0]}
                            </div>
                          )}

                          {canEdit && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              {colStatus !== 'TERMINEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'TERMINEE')}
                                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                                >
                                  Terminer
                                </button>
                              )}
                              {colStatus === 'A_FAIRE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'EN_COURS')}
                                  className="text-blue-700 font-semibold hover:underline cursor-pointer"
                                >
                                  Démarrer
                                </button>
                              )}
                              {colStatus !== 'BLOQUEE' && colStatus !== 'TERMINEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'BLOQUEE')}
                                  className="text-rose-700 font-semibold hover:underline cursor-pointer"
                                >
                                  Bloquer
                                </button>
                              )}
                              {colStatus === 'BLOQUEE' && (
                                <button
                                  onClick={() => handleUpdateStatus(t.id, 'EN_COURS')}
                                  className="text-blue-700 font-semibold hover:underline cursor-pointer"
                                >
                                  Débloquer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Création Tâche */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Créer une Tâche Opérationnelle Chantier</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Intitulé de la Tâche *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Préfabrication des manchettes DN150 ISO 01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description technique / Instructions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Spécifications, procédures de soudage WPS, contraintes d'accès..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Corps d&apos;état / Métier *
                  </label>
                  <select
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    {TRADES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Intervenant / Assigné
                  </label>
                  <input
                    type="text"
                    value={assigneeName}
                    onChange={e => setAssigneeName(e.target.value)}
                    placeholder="Ex: Mourad Zitouni (Chef d'équipe)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Priorité
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="NORMALE">Normale</option>
                    <option value="HAUTE">Haute</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Statut Initial
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="BLOQUEE">Bloquée</option>
                    <option value="TERMINEE">Terminée</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date Début Prévue *
                  </label>
                  <input
                    type="date"
                    required
                    value={plannedStartDate}
                    onChange={e => setPlannedStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date Fin Prévue *
                  </label>
                  <input
                    type="date"
                    required
                    value={plannedEndDate}
                    onChange={e => setPlannedEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Heures Prévues (h)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={plannedHours}
                    onChange={e => setPlannedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Pondération / Poids (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weightPercent}
                    onChange={e => setWeightPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Création en cours...' : 'Créer la Tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
