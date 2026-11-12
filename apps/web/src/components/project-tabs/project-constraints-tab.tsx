'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ, formatCurrencyDA } from '@silex/shared';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export interface ConstraintItem {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: 'CRITIQUE' | 'BLOQUANTE' | 'MAJEURE' | 'MINEURE';
  type: 'CLIENT' | 'METEO' | 'TECHNIQUE' | 'APPROVISIONNEMENT' | 'HSE' | 'SOUS_TRAITANT';
  impactScheduleDays?: number;
  impactCostDA?: number;
  correctiveAction?: string;
  responsibleName?: string;
  deadline?: string;
  status: 'OUVERTE' | 'EN_COURS' | 'RESOLUE' | 'CLOTUREE';
  resolvedAt?: string;
  resolutionComment?: string;
  createdAt: string;
}

interface ProjectConstraintsTabProps {
  projectCode: string;
  constraints?: ConstraintItem[];
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}

export function ProjectConstraintsTab({
  projectCode,
  constraints = [],
  canEdit,
  onRefresh,
}: ProjectConstraintsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal Création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'CRITIQUE' | 'BLOQUANTE' | 'MAJEURE' | 'MINEURE'>('MAJEURE');
  const [type, setType] = useState<'CLIENT' | 'METEO' | 'TECHNIQUE' | 'APPROVISIONNEMENT' | 'HSE' | 'SOUS_TRAITANT'>('TECHNIQUE');
  const [impactScheduleDays, setImpactScheduleDays] = useState<number>(0);
  const [impactCostDA, setImpactCostDA] = useState<number>(0);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Modal Résolution
  const [resolvingConstraint, setResolvingConstraint] = useState<ConstraintItem | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  // Filtres
  const filteredConstraints = constraints.filter(c => {
    if (severityFilter !== 'ALL' && c.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchResp = (c.responsibleName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchResp) return false;
    }
    return true;
  });

  // Indicateurs
  const totalConstraints = constraints.length;
  const criticalCount = constraints.filter(c => c.severity === 'CRITIQUE' || c.severity === 'BLOQUANTE').length;
  const openCount = constraints.filter(c => c.status === 'OUVERTE' || c.status === 'EN_COURS').length;
  const resolvedCount = constraints.filter(c => c.status === 'RESOLUE' || c.status === 'CLOTUREE').length;
  const totalScheduleImpact = constraints
    .filter(c => c.status !== 'RESOLUE' && c.status !== 'CLOTUREE')
    .reduce((acc, c) => acc + (c.impactScheduleDays || 0), 0);

  const handleCreateConstraint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Veuillez renseigner le titre et la description de la contrainte.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/projects/${projectCode}/constraints`, {
        title,
        description,
        severity,
        type,
        impactScheduleDays: Number(impactScheduleDays || 0),
        impactCostDA: Number(impactCostDA || 0),
        correctiveAction,
        responsibleName,
        deadline,
        status: 'OUVERTE',
      });
      setShowCreateModal(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveConstraint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingConstraint) return;
    try {
      setResolvingLoading(true);
      await api.patch(`/projects/${projectCode}/constraints/${resolvingConstraint.id}`, {
        status: 'RESOLUE',
        resolvedAt: new Date().toISOString(),
        resolutionComment: resolutionComment || 'Contrainte levée avec succès.',
      });
      setResolvingConstraint(null);
      setResolutionComment('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la résolution');
    } finally {
      setResolvingLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('MAJEURE');
    setType('TECHNIQUE');
    setImpactScheduleDays(0);
    setImpactCostDA(0);
    setCorrectiveAction('');
    setResponsibleName('');
  };

  const getSeverityBadge = (sev: ConstraintItem['severity']) => {
    switch (sev) {
      case 'CRITIQUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-700 text-white animate-pulse">CRITIQUE</span>;
      case 'BLOQUANTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">BLOQUANTE</span>;
      case 'MAJEURE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">MAJEURE</span>;
      case 'MINEURE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">MINEURE</span>;
    }
  };

  const getStatusBadge = (st: ConstraintItem['status']) => {
    switch (st) {
      case 'OUVERTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Ouverte</span>;
      case 'EN_COURS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">En traitement</span>;
      case 'RESOLUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Résolue</span>;
      case 'CLOTUREE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 line-through">Clôturée</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Contraintes</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalConstraints}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Identifiées au registre</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Critiques / Bloquantes
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Nécessitent arbitrage DG</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">En Cours / Ouvertes</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{openCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Actions engagées</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Résolues & Clôturées</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalConstraints > 0 ? Math.round((resolvedCount / totalConstraints) * 100) : 0}% taux de levée
          </div>
        </div>
      </div>

      {/* Header & Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher contrainte, impact, responsable..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Toutes sévérités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="BLOQUANTE">Bloquante</option>
            <option value="MAJEURE">Majeure</option>
            <option value="MINEURE">Mineure</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OUVERTE">Ouverte</option>
            <option value="EN_COURS">En traitement</option>
            <option value="RESOLUE">Résolue</option>
            <option value="CLOTUREE">Clôturée</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#0B207D]"
          >
            <option value="ALL">Tous les types</option>
            <option value="CLIENT">Client / Accès</option>
            <option value="METEO">Météo / Intempéries</option>
            <option value="TECHNIQUE">Technique / Études</option>
            <option value="APPROVISIONNEMENT">Approvisionnement</option>
            <option value="HSE">HSE / Sécurité</option>
            <option value="SOUS_TRAITANT">Sous-traitant</option>
          </select>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 text-white rounded-md text-xs font-semibold hover:bg-rose-800 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Signaler une Contrainte</span>
          </button>
        )}
      </div>

      {/* Constraints Table */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Code</th>
                <th className="py-2.5 px-3 text-center">Sévérité</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 min-w-[240px]">Contrainte & Description</th>
                <th className="py-2.5 px-3">Impact Délais / Coûts</th>
                <th className="py-2.5 px-3 min-w-[200px]">Action Corrective & Porteur</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                {canEdit && <th className="py-2.5 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredConstraints.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-8 text-center text-slate-400">
                    Aucune contrainte signalée correspondant aux filtres.
                  </td>
                </tr>
              ) : (
                filteredConstraints.map(c => {
                  const isResolved = c.status === 'RESOLUE' || c.status === 'CLOTUREE';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-500 text-[11px]">
                        {c.code}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {getSeverityBadge(c.severity)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{c.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{c.description}</div>
                        {isResolved && c.resolutionComment && (
                          <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1.5">
                            Levée : {c.resolutionComment}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {c.impactScheduleDays ? (
                          <div className="font-bold text-rose-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            +{c.impactScheduleDays}j d&apos;arrêt
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px]">Sans impact jalon</div>
                        )}
                        {c.impactCostDA ? (
                          <div className="text-[11px] text-slate-700 mt-0.5">
                            {formatCurrencyDA(c.impactCostDA, false)}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{c.correctiveAction || 'En attente d’arbitrage'}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {c.responsibleName && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                              {c.responsibleName}
                            </span>
                          )}
                          {c.deadline && (
                            <span>Échéance : {formatDateDZ(c.deadline)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {getStatusBadge(c.status)}
                      </td>
                      {canEdit && (
                        <td className="py-2.5 px-3 text-right">
                          {!isResolved ? (
                            <button
                              onClick={() => {
                                setResolvingConstraint(c);
                                setResolutionComment('');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                            >
                              Lever la contrainte
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Clôturé</span>
                          )}
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

      {/* Modal Résolution */}
      {resolvingConstraint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Lever la Contrainte {resolvingConstraint.code}</span>
              </div>
              <button
                onClick={() => setResolvingConstraint(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveConstraint} className="p-5 space-y-4 text-xs">
              <div>
                <div className="font-semibold text-slate-900 mb-1">{resolvingConstraint.title}</div>
                <div className="text-slate-500 bg-slate-50 p-2 rounded text-[11px]">
                  {resolvingConstraint.description}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Commentaire de Levée & Justificatif *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionComment}
                  onChange={e => setResolutionComment(e.target.value)}
                  placeholder="Ex: Permis de travail signé par le client à 14h00. Reprise immédiate des soudures..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingConstraint(null)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resolvingLoading}
                  className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-md hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
                >
                  {resolvingLoading ? 'Validation...' : 'Valider la Levée'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Création Contrainte */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Signaler une Contrainte ou un Point de Blocage</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConstraint} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Intitulé de la Contrainte *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Refus délivrance permis travail chaud Zone 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Sévérité *
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                  >
                    <option value="CRITIQUE">Critique (Arrêt immédiat)</option>
                    <option value="BLOQUANTE">Bloquante (Jalon menacé)</option>
                    <option value="MAJEURE">Majeure (Ralentissement)</option>
                    <option value="MINEURE">Mineure (Simple gène)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Typologie *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                  >
                    <option value="CLIENT">Client / Accès</option>
                    <option value="METEO">Météo / Intempéries</option>
                    <option value="TECHNIQUE">Technique / Plans</option>
                    <option value="APPROVISIONNEMENT">Approvisionnement</option>
                    <option value="HSE">HSE / Sécurité</option>
                    <option value="SOUS_TRAITANT">Sous-traitant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description détaillée des faits *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Circonstances, zone exacte, intervenants impliqués..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Impact Planning Estimé (jours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={impactScheduleDays}
                    onChange={e => setImpactScheduleDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Impact Coût Estimé (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={impactCostDA}
                    onChange={e => setImpactCostDA(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Action Corrective Proposée
                </label>
                <input
                  type="text"
                  value={correctiveAction}
                  onChange={e => setCorrectiveAction(e.target.value)}
                  placeholder="Ex: Réunion de coordination d'urgence avec le chef de secteur Sonatrach"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Porteur de l&apos;action
                  </label>
                  <input
                    type="text"
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    placeholder="Ex: Conducteur de Travaux"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Échéance de Résolution
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-rose-700"
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
                  className="px-4 py-2 bg-rose-700 text-white font-semibold rounded-md hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer la Contrainte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
