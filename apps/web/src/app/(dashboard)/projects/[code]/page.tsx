'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatCurrencyDA, formatDateDZ, ServiceOrderType } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Coins,
  Boxes,
  FileText,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export default function ProjectDetailsPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showOdsModal, setShowOdsModal] = useState(false);
  const [showSituationModal, setShowSituationModal] = useState(false);

  // Formulaire ODS
  const [odsType, setOdsType] = useState<ServiceOrderType>(ServiceOrderType.DEMARRAGE);
  const [odsDate, setOdsDate] = useState(new Date().toISOString().split('T')[0]);
  const [odsDescription, setOdsDescription] = useState('');
  const [odsDelay, setOdsDelay] = useState(0);

  // Formulaire Situation
  const [sitPeriodStart, setSitPeriodStart] = useState('2026-03-01');
  const [sitPeriodEnd, setSitPeriodEnd] = useState('2026-03-31');
  const [sitAmountHT, setSitAmountHT] = useState(2400000);
  const [sitNotes, setSitNotes] = useState('Situation mensuelle métrés tuyauterie et épreuves');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/projects/${resolvedParams.code}`);
      setProject(data);
    } catch (err: any) {
      alert(err.message || 'Erreur chargement projet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [resolvedParams.code]);

  const handleCreateOds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${project.id}/service-orders`, {
        type: odsType,
        issueDate: odsDate,
        description: odsDescription,
        delayImpactDays: Number(odsDelay),
      });
      setShowOdsModal(false);
      setOdsDescription('');
      await fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${project.id}/work-situations`, {
        periodStart: sitPeriodStart,
        periodEnd: sitPeriodEnd,
        amountHT: Number(sitAmountHT),
        notes: sitNotes,
      });
      setShowSituationModal(false);
      await fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !project) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Chargement des données du projet {resolvedParams.code}...
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d’ensemble' },
    { id: 'planning', label: `Planning & Jalons (${project.milestones?.length || 0})` },
    { id: 'budget', label: 'Budget & Coûts' },
    { id: 'materials', label: `Matériel consommé (${project.allocations?.length || 0})` },
    { id: 'procurement', label: `Achats liés (${project.purchaseOrders?.length || 0})` },
    { id: 'ods', label: `Ordres de Service (${project.serviceOrders?.length || 0})` },
    { id: 'situations', label: `Situations de travaux (${project.workSituations?.length || 0})` },
    { id: 'quality', label: `Qualité & CND (${project.nonConformities?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#142B45]">{project.code}</span>
            <StatusBadge status={project.status} type="project" />
            <StatusBadge status={project.riskLevel} type="risk" />
          </div>
          <h1 className="text-lg font-bold text-[#182433]">{project.name}</h1>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-[11px] text-slate-500">Client Contractuel</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">{project.clientName}</div>
          <div className="text-[10px] text-slate-400">{project.siteLocation}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">Montant Contractuel HT</div>
          <div className="text-xs font-bold text-[#142B45] mt-0.5">{formatCurrencyDA(project.contractAmount, false)}</div>
          <div className="text-[10px] text-slate-500">Budget alloué : {formatCurrencyDA(project.budgetAmount, false)}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">Coûts Réels Imputés</div>
          <div className="text-xs font-bold text-[#0A7F7C] mt-0.5">{formatCurrencyDA(project.actualCost, false)}</div>
          <div className="text-[10px] text-slate-500">Engagé : {formatCurrencyDA(project.committedCost, false)}</div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500">Avancement Physique</div>
          <div className="text-xs font-bold text-emerald-700 mt-0.5">{project.physicalProgress}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.physicalProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-medium">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'border-[#0A7F7C] text-[#0A7F7C] font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">Descriptif Technique</h2>
              <p className="text-xs text-slate-700 leading-relaxed">{project.description}</p>
              {project.objectives && (
                <div className="p-3 bg-slate-50 border-l-4 border-[#0A7F7C] text-xs text-slate-700 rounded-r">
                  <strong>Objectifs stratégiques :</strong> {project.objectives}
                </div>
              )}
            </div>

            {/* Distinction des 4 avancements */}
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                Indicateurs Opérationnels Découplés (Exigences SILEX)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">1. Avanc. Physique</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{project.physicalProgress}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Métrés & Soudures</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">2. Avanc. Dépenses</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{project.financialProgress}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Coûts / Budget</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">3. Facturation</div>
                  <div className="text-base font-bold text-slate-900 mt-1">35.0%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Situations validées</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">4. Encaissement</div>
                  <div className="text-base font-bold text-slate-900 mt-1">20.0%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Règlements reçus</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">Responsable & Équipe</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#142B45] text-white flex items-center justify-center font-bold text-xs">
                  {project.manager?.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{project.manager?.name}</div>
                  <div className="text-[11px] text-[#0A7F7C]">{project.manager?.title}</div>
                  <div className="text-[10px] text-slate-500">{project.manager?.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">Dates Contractuelles</h2>
              <div className="text-xs flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date de notification :</span>
                <strong className="text-slate-800">{formatDateDZ(project.startDate)}</strong>
              </div>
              <div className="text-xs flex justify-between py-1">
                <span className="text-slate-500">Fin contractuelle :</span>
                <strong className="text-slate-800">{formatDateDZ(project.contractEndDate)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Ordres de Service (ODS) */}
      {activeTab === 'ods' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                Ordres de Service (ODS) Officiels
              </h2>
              <p className="text-[11px] text-slate-500">Traçabilité juridique : Démarrage, Arrêt, Reprise, Périmètre</p>
            </div>
            <button
              onClick={() => setShowOdsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A7F7C] text-white text-xs font-semibold rounded hover:bg-[#086a67]"
            >
              <Plus className="w-3.5 h-3.5" />
              Émettre un ODS
            </button>
          </div>

          <div className="space-y-3">
            {project.serviceOrders?.map((ods: any) => (
              <div key={ods.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#142B45]">{ods.orderNumber}</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                      {ods.type}
                    </span>
                    <span className="text-[11px] text-slate-500">Notifié le {formatDateDZ(ods.issueDate)}</span>
                  </div>
                  <div className="text-xs text-slate-800 mt-1">{ods.description}</div>
                  {ods.delayImpactDays > 0 && (
                    <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                      Impact délai : +{ods.delayImpactDays} jours
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {ods.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Situations de Travaux */}
      {activeTab === 'situations' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                Situations Périodiques de Travaux
              </h2>
              <p className="text-[11px] text-slate-500">Métrés contradictoires soumis à vérification et facturation client</p>
            </div>
            <button
              onClick={() => setShowSituationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#142B45] text-white text-xs font-semibold rounded hover:bg-[#203D5A]"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer une Situation
            </button>
          </div>

          <div className="space-y-3">
            {project.workSituations?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Aucune situation périodique enregistrée.</div>
            ) : (
              project.workSituations?.map((sit: any) => (
                <div key={sit.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#142B45]">{sit.situationNumber}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        {sit.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 mt-1">
                      Période du {formatDateDZ(sit.periodStart)} au {formatDateDZ(sit.periodEnd)} • {sit.notes}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#142B45]">{formatCurrencyDA(sit.amountHT)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Cumul : {formatCurrencyDA(sit.cumulativeAmountHT)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Matériaux Consommés */}
      {activeTab === 'materials' && (
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Consommations & Sorties Magasins Affectées au Chantier
            </h2>
            <p className="text-[11px] text-slate-500">Matériel imputé directement depuis le ledger de stock</p>
          </div>

          <div className="space-y-2">
            {project.allocations?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Aucune sortie de matériel enregistrée pour ce chantier.</div>
            ) : (
              project.allocations?.map((al: any) => (
                <div key={al.id} className="p-3 border border-slate-200 rounded bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#142B45]">{al.item?.code}</span> — {al.item?.name}
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Magasin source : {al.warehouse?.name} • Zone : {al.workZone || 'Chantier'} • Date : {formatDateDZ(al.allocatedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0A7F7C]">{al.quantity} {al.item?.unit}</div>
                    <div className="text-[11px] text-slate-600 font-semibold">{formatCurrencyDA(al.totalCost)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALE ÉMISSION ODS */}
      {showOdsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#182433]">Émettre un Ordre de Service (ODS)</h3>
            <form onSubmit={handleCreateOds} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Type d’ODS</label>
                <select
                  value={odsType}
                  onChange={e => setOdsType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                >
                  <option value={ServiceOrderType.DEMARRAGE}>Démarrage des travaux</option>
                  <option value={ServiceOrderType.ARRET}>Arrêt technique / Suspension</option>
                  <option value={ServiceOrderType.REPRISE}>Reprise des travaux</option>
                  <option value={ServiceOrderType.MODIFICATION_PERIMETRE}>Modification du périmètre</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Date d’effet</label>
                <input
                  type="date"
                  value={odsDate}
                  onChange={e => setOdsDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description / Motif officiel</label>
                <textarea
                  value={odsDescription}
                  onChange={e => setOdsDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded"
                  placeholder="Notification d'arrêt pour attente consignation..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Impact sur le délai (en jours)</label>
                <input
                  type="number"
                  value={odsDelay}
                  onChange={e => setOdsDelay(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOdsModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#086a67]"
                >
                  Valider et Notifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE SITUATION DE TRAVAUX */}
      {showSituationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#182433]">Créer une Situation de Travaux Périodique</h3>
            <form onSubmit={handleCreateSituation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Début de période</label>
                  <input
                    type="date"
                    value={sitPeriodStart}
                    onChange={e => setSitPeriodStart(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fin de période</label>
                  <input
                    type="date"
                    value={sitPeriodEnd}
                    onChange={e => setSitPeriodEnd(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Montant de la situation HT (DA)</label>
                <input
                  type="number"
                  value={sitAmountHT}
                  onChange={e => setSitAmountHT(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Observations / Métrés</label>
                <textarea
                  value={sitNotes}
                  onChange={e => setSitNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSituationModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#142B45] text-white font-semibold rounded hover:bg-[#203D5A]"
                >
                  Soumettre pour Vérification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
