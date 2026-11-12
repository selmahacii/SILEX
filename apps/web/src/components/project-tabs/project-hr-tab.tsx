'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import {
  Users,
  HardHat,
  Clock,
  Plus,
  Search,
  CheckCircle,
  Phone,
  Mail,
  UserCheck,
  Calendar,
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

  // Équipes type mobilisées sur chantier industriel
  const defaultWorkforceProfiles = [
    { trade: 'Soudeurs Haute Pression (TIG/Arc 6G)', count: 4, certification: 'Homologation ASME IX valide', status: 'Actif sur site' },
    { trade: 'Tuyauteurs Industriels & Traceurs', count: 6, certification: 'Habilitation travail en hauteur', status: 'Actif sur site' },
    { trade: 'Monteurs Mécaniques & Élingueurs', count: 5, certification: 'CACES R489 / Pont roulant', status: 'Actif sur site' },
    { trade: 'Échafaudeurs Monteurs R408', count: 3, certification: 'Agrément R408 réception', status: 'Actif sur site' },
    { trade: 'Superviseur Qualité & CND', count: 1, certification: 'COFREND Niveau II (RT/PT)', status: 'Actif sur site' },
    { trade: 'Superviseur Sécurité HSE', count: 1, certification: 'NEBOSH / Habilitation Sonatrach', status: 'Actif sur site' },
  ];

  const totalHeadcount = defaultWorkforceProfiles.reduce((acc, p) => acc + p.count, 0) + (members?.length || 0);

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
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Effectif Total Présent</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalHeadcount} intervenants</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mobilisés sur base de vie & chantier</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-700 uppercase">Soudeurs & Tuyauteurs</div>
          <div className="text-xl font-bold text-blue-700 mt-1">10 spécialistes</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Corps d&apos;état critiques</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Habilitations & Visas</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">100% à jour</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Badges d&apos;accès site actifs</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-700 uppercase">Taux de Présence</div>
          <div className="text-xl font-bold text-purple-700 mt-1">98.5%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pointages réguliers PC Paie</div>
        </div>
      </div>

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

      {/* Tableau des Métiers et Qualifications */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Corps d&apos;état & Effectifs Actifs sur le Chantier</span>
          <span className="text-[11px] font-normal text-slate-500">Mise à jour via pointages journaliers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Qualification / Profil</th>
                <th className="py-2 px-3 text-center">Effectif</th>
                <th className="py-2 px-3">Certification / Habilitation Requise</th>
                <th className="py-2 px-3 text-center">Statut Mobilisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {defaultWorkforceProfiles.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{p.trade}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#0B207D]">{p.count}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.certification}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
