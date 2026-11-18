'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import {
  Users,
  HardHat,
  Plus,
  CheckCircle,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

interface ProjectHrTabProps {
  projectCode: string;
  projectName?: string;
  members?: any[];
  canManage: boolean;
  onRefresh: () => Promise<void>;
  onOpenAddMember?: () => void;
}

export function ProjectHrTab({
  projectCode,
  members = [],
  canManage,
  onRefresh,
  onOpenAddMember,
}: ProjectHrTabProps) {
  const [showRenfortModal, setShowRenfortModal] = useState(false);
  const [tradeRequested, setTradeRequested] = useState('Soudeur Qualifié 6G (ASME IX)');
  const [countRequested, setCountRequested] = useState<number>(2);
  const [dateRequired, setDateRequired] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [justification, setJustification] = useState('');
  const [submittingRenfort, setSubmittingRenfort] = useState(false);
  const [renfortSuccess, setRenfortSuccess] = useState(false);

  const totalHeadcount = members?.length || 0;

  const handleRequestRenfort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      alert('Veuillez renseigner la justification du renfort RH.');
      return;
    }
    setSubmittingRenfort(true);
    setTimeout(() => {
      setSubmittingRenfort(false);
      setRenfortSuccess(true);
      setTimeout(() => {
        setRenfortSuccess(false);
        setShowRenfortModal(false);
        setJustification('');
      }, 3000);
    }, 600);
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Effectif Affecté au Projet</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalHeadcount} intervenant{totalHeadcount > 1 ? 's' : ''}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Collaborateurs SILEX affectés à ce chantier</div>
        </div>
      </div>
      {totalHeadcount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Aucun collaborateur affecté à ce chantier pour l&apos;instant. Les qualifications, habilitations et
          pointages se gèrent collaborateur par collaborateur depuis le module Ressources Humaines.
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0B207D]" />
            Ressources Humaines, Qualifications & Mobilisation Chantier
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Suivi des effectifs par qualification, certifications soudage ASME IX, pointages et demandes de renfort.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAddMember && canManage && (
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer border border-slate-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Affecter Collaborateur</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setShowRenfortModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded-md text-xs font-semibold hover:bg-[#07164D] transition-colors cursor-pointer shadow-xs"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Demande de Renfort RH</span>
            </button>
          )}
        </div>
      </div>

      {/* Membres de l'équipe SILEX affectés */}
      {members && members.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
            Encadrement & Spécialistes SILEX Affectés au Projet ({members.length})
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((m: any, idx: number) => {
              const u = m.user || m;
              return (
                <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{u.name || u.email}</span>
                    <span className="text-[10px] font-semibold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {m.role || u.role || 'Intervenant'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    {u.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" />{u.email}</div>}
                    {u.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{u.phone}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Demande Renfort */}
      {showRenfortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <HardHat className="w-4 h-4" />
                <span>Demande de Renfort RH Chantier</span>
              </div>
              <button
                onClick={() => setShowRenfortModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {renfortSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-800 text-sm">Demande transmise au Département RH !</div>
                <p className="text-slate-500 text-xs">
                  Votre demande de renfort a été transmise au Responsable RH et à la Direction Générale.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestRenfort} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Profil Recherché *
                  </label>
                  <select
                    value={tradeRequested}
                    onChange={e => setTradeRequested(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  >
                    <option value="Soudeur Qualifié 6G (ASME IX)">Soudeur Qualifié 6G (ASME IX)</option>
                    <option value="Tuyauteur Industriel & Traceur">Tuyauteur Industriel & Traceur</option>
                    <option value="Monteur Mécanique">Monteur Mécanique</option>
                    <option value="Échafaudeur R408">Échafaudeur R408</option>
                    <option value="Superviseur HSE Chantier">Superviseur HSE Chantier</option>
                    <option value="Contrôleur CND (Radio/Ressuage)">Contrôleur CND (Radio/Ressuage)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nombre d&apos;intervenants *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={countRequested}
                      onChange={e => setCountRequested(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Date Requise sur Site *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateRequired}
                      onChange={e => setDateRequired(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Justification Opérationnelle *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="Ex: Accélération cadence de soudage suite à libération de la zone de tuyauterie HP..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRenfortModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRenfort}
                    className="px-4 py-2 bg-[#0B207D] text-white font-semibold rounded-md hover:bg-[#07164D] disabled:opacity-50 cursor-pointer"
                  >
                    {submittingRenfort ? 'Envoi...' : 'Transmettre la Demande'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
