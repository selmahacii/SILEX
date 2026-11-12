'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ } from '@silex/shared';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Plus,
  Flame,
  HardHat,
  Search,
  Eye,
} from 'lucide-react';

export interface HseIncidentItem {
  id: string;
  code: string;
  incidentDate: string;
  type: 'PREMIER_SOIN' | 'PRESQU_ACCIDENT' | 'ARRET_TRAVAIL' | 'ENVIRONNEMENTAL' | 'DEVIATION_QUALITE';
  severity: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  description: string;
  immediateActionTaken?: string;
  correctiveAction?: string;
  investigatorName?: string;
  status: 'OUVERT' | 'EN_INVESTIGATION' | 'ACTION_REQUISE' | 'CLOTURE';
  closedAt?: string;
  createdAt: string;
}

interface ProjectHseTabProps {
  projectCode: string;
  incidents?: HseIncidentItem[];
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}

export function ProjectHseTab({
  projectCode,
  incidents = [],
  canEdit,
  onRefresh,
}: ProjectHseTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [type, setType] = useState<HseIncidentItem['type']>('PRESQU_ACCIDENT');
  const [severity, setSeverity] = useState<HseIncidentItem['severity']>('FAIBLE');
  const [description, setDescription] = useState('');
  const [immediateActionTaken, setImmediateActionTaken] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [investigatorName, setInvestigatorName] = useState('Superviseur HSE Chantier');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const totalIncidents = incidents.length;
  const lostTimeIncidents = incidents.filter(i => i.type === 'ARRET_TRAVAIL').length;
  const nearMisses = incidents.filter(i => i.type === 'PRESQU_ACCIDENT').length;
  const closedIncidents = incidents.filter(i => i.status === 'CLOTURE').length;

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Veuillez renseigner la description de l’événement HSE.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/projects/${projectCode}/hse-incidents`, {
        type,
        severity,
        incidentDate,
        description,
        immediateActionTaken,
        correctiveAction,
        investigatorName,
        status: 'OUVERT',
      });
      setShowCreateModal(false);
      setDescription('');
      setImmediateActionTaken('');
      setCorrectiveAction('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la déclaration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseIncident = async (incidentId: string) => {
    try {
      setClosingId(incidentId);
      await api.patch(`/projects/${projectCode}/hse-incidents/${incidentId}`, {
        status: 'CLOTURE',
        closedAt: new Date().toISOString(),
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la clôture');
    } finally {
      setClosingId(null);
    }
  };

  const getTypeBadge = (t: HseIncidentItem['type']) => {
    switch (t) {
      case 'PRESQU_ACCIDENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Presqu&apos;accident (Near-Miss)</span>;
      case 'ARRET_TRAVAIL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-700 text-white animate-pulse">Accident avec Arrêt</span>;
      case 'PREMIER_SOIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Premier Soin</span>;
      case 'ENVIRONNEMENTAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Environnemental</span>;
      case 'DEVIATION_QUALITE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">Déviation Qualité CND</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards HSE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Accidents avec Arrêt (LTI)
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{lostTimeIncidents}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Objectif Zéro Accident</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">Presqu&apos;accidents / Near-Miss</div>
          <div className="text-xl font-bold text-amber-700 mt-1">{nearMisses}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Culture de prévention proactive</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">Tirs Radio & Contrôles CND</div>
          <div className="text-xl font-bold text-blue-700 mt-1">100%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Contrôles contradictoires agréés</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-600 uppercase">Taux de Clôture HSE</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {totalIncidents > 0 ? Math.round((closedIncidents / totalIncidents) * 100) : 100}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{closedIncidents} / {totalIncidents} actions soldées</div>
        </div>
      </div>

      {/* Header bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#0B207D]" />
            Sécurité Chantier, Hygiène, Environnement (HSE) & Contrôles CND
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Consignation des presque-accidents, audits de sécurité, conformités soudage et tirs radiographiques.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded-md text-xs font-semibold hover:bg-[#07164D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Déclarer Événement HSE</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Code</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type & Sévérité</th>
                <th className="py-2.5 px-3 min-w-[250px]">Description des faits</th>
                <th className="py-2.5 px-3">Mesure Immédiate / Action Corrective</th>
                <th className="py-2.5 px-3">Superviseur</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                {canEdit && <th className="py-2.5 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="py-8 text-center text-slate-400">
                    Aucun événement HSE ou incident signalé sur ce chantier.
                  </td>
                </tr>
              ) : (
                incidents.map(inc => {
                  const isClosed = inc.status === 'CLOTURE';

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-500 text-[11px]">
                        {inc.code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {formatDateDZ(inc.incidentDate)}
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        <div>{getTypeBadge(inc.type)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Sévérité : {inc.severity}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{inc.description}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{inc.correctiveAction || inc.immediateActionTaken || 'RAS'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {inc.investigatorName || 'HSE SILEX'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isClosed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isClosed ? '✓ Clôturé' : 'En cours'}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-2.5 px-3 text-right">
                          {!isClosed && (
                            <button
                              onClick={() => handleCloseIncident(inc.id)}
                              disabled={closingId === inc.id}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer disabled:opacity-50"
                            >
                              Clôturer
                            </button>
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

      {/* Modal Déclaration HSE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Déclaration d&apos;Événement HSE ou Contrôle Qualité</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date de l&apos;Événement *
                  </label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={e => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Typologie *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="PRESQU_ACCIDENT">Presqu&apos;accident (Near-Miss)</option>
                    <option value="PREMIER_SOIN">Premier Soin</option>
                    <option value="ARRET_TRAVAIL">Accident avec Arrêt</option>
                    <option value="DEVIATION_QUALITE">Déviation Qualité CND</option>
                    <option value="ENVIRONNEMENTAL">Environnemental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Sévérité *
                </label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                >
                  <option value="FAIBLE">Faible (Aucun dommage)</option>
                  <option value="MOYENNE">Moyenne (Arrêt temporaire)</option>
                  <option value="ELEVEE">Élevée (Intervention requise)</option>
                  <option value="CRITIQUE">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description circonstanciée des faits *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Circonstances, zone exacte, équipement concerné..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Action Immédiate Conservatoire
                </label>
                <input
                  type="text"
                  value={immediateActionTaken}
                  onChange={e => setImmediateActionTaken(e.target.value)}
                  placeholder="Ex: Évacuation zone et balisage de sécurité"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Action Corrective & Préventive
                </label>
                <input
                  type="text"
                  value={correctiveAction}
                  onChange={e => setCorrectiveAction(e.target.value)}
                  placeholder="Ex: Sensibilisation de l'équipe et vérification des harnais"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
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
                  {submitting ? 'Enregistrement...' : 'Enregistrer la Déclaration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
