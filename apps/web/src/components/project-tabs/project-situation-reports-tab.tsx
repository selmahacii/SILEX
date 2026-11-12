'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateDZ, formatCurrencyDA } from '@silex/shared';
import {
  FileBarChart,
  Calendar,
  TrendingUp,
  Coins,
  Truck,
  Users,
  AlertTriangle,
  Plus,
  Printer,
  CheckCircle,
  Eye,
  Layers,
  ArrowRight,
} from 'lucide-react';

export interface SituationReportItem {
  id: string;
  reportNumber: string;
  periodStart: string;
  periodEnd: string;
  physicalProgress: number;
  financialProgress: number;
  costVarianceDA?: number;
  scheduleVarianceDays?: number;
  executiveSummary: string;
  keyAchievements?: string[];
  criticalIssues?: string[];
  logisticsStatus?: string;
  hrStatus?: string;
  recommendations?: string[];
  createdByRole?: string;
  createdAt: string;
}

interface ProjectSituationReportsTabProps {
  projectCode: string;
  projectName?: string;
  reports?: SituationReportItem[];
  currentPhysicalProgress: number;
  currentFinancialProgress: number;
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}

export function ProjectSituationReportsTab({
  projectCode,
  projectName = 'Chantier Industriel',
  reports = [],
  currentPhysicalProgress,
  currentFinancialProgress,
  canEdit,
  onRefresh,
}: ProjectSituationReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState<SituationReportItem | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulaire
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [periodStart, setPeriodStart] = useState(thirtyDaysAgoStr);
  const [periodEnd, setPeriodEnd] = useState(todayStr);
  const [physicalProgress, setPhysicalProgress] = useState<number>(currentPhysicalProgress || 45);
  const [financialProgress, setFinancialProgress] = useState<number>(currentFinancialProgress || 40);
  const [costVarianceDA, setCostVarianceDA] = useState<number>(0);
  const [scheduleVarianceDays, setScheduleVarianceDays] = useState<number>(0);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [logisticsStatus, setLogisticsStatus] = useState('Approvisionnements sous contrôle. Commandes critiques émises.');
  const [hrStatus, setHrStatus] = useState('Mobilisation complète. Productivité conforme aux objectifs.');
  const [keyAchievementsText, setKeyAchievementsText] = useState('');
  const [criticalIssuesText, setCriticalIssuesText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveSummary.trim()) {
      alert('Veuillez saisir la synthèse exécutive du rapport.');
      return;
    }
    try {
      setSubmitting(true);
      const achievements = keyAchievementsText.split('\n').map(s => s.trim()).filter(Boolean);
      const issues = criticalIssuesText.split('\n').map(s => s.trim()).filter(Boolean);

      await api.post(`/projects/${projectCode}/situation-reports`, {
        periodStart,
        periodEnd,
        physicalProgress: Number(physicalProgress),
        financialProgress: Number(financialProgress),
        costVarianceDA: Number(costVarianceDA),
        scheduleVarianceDays: Number(scheduleVarianceDays),
        executiveSummary,
        keyAchievements: achievements,
        criticalIssues: issues,
        logisticsStatus,
        hrStatus,
        recommendations: ['Maintenir la cadence', 'Surveiller les approvisionnements'],
      });

      setShowCreateModal(false);
      setExecutiveSummary('');
      setKeyAchievementsText('');
      setCriticalIssuesText('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création du rapport');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (r: SituationReportItem) => {
    setSelectedReport(r);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
            <FileBarChart className="w-4 h-4 text-[#0B207D]" />
            Rapports Périodiques de Situation & Synthèses Opérationnelles
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Évaluations multi-axes transmises à la Direction Générale : avancement croisé physique vs financier, logistique, RH et risques.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded-md text-xs font-semibold hover:bg-[#07164D] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Rapport Périodique</span>
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
            Aucun rapport de situation périodique enregistré pour ce projet.
          </div>
        ) : (
          reports.map(rep => {
            const hasDelay = (rep.scheduleVarianceDays || 0) > 0;
            const hasOverrun = (rep.costVarianceDA || 0) > 0;

            return (
              <div
                key={rep.id}
                className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs p-4 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rep.reportNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Période du {formatDateDZ(rep.periodStart)} au {formatDateDZ(rep.periodEnd)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(rep)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Fiche A4 Synthèse</span>
                    </button>
                  </div>
                </div>

                {/* Synthèse exécutive */}
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 mb-1">Synthèse Exécutive du Chantier :</div>
                  <p className="text-slate-600 bg-slate-50/70 p-3 rounded border border-slate-100 leading-relaxed">
                    {rep.executiveSummary}
                  </p>
                </div>

                {/* Indicateurs croisés */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Avancement Physique</div>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                      {rep.physicalProgress}%
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${rep.physicalProgress}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Avancement Financier</div>
                    <div className="text-base font-extrabold text-blue-700 mt-0.5">
                      {rep.financialProgress}%
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rep.financialProgress}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Écart Planning</div>
                    <div className={`text-base font-extrabold mt-0.5 ${hasDelay ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {rep.scheduleVarianceDays || 0} jours
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {hasDelay ? 'Glissement constaté' : 'Conforme au jalonnement'}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Écart Coûts (DA)</div>
                    <div className={`text-base font-extrabold mt-0.5 ${hasOverrun ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatCurrencyDA(rep.costVarianceDA || 0, false)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {hasOverrun ? 'Dépassement analytique' : 'Sous budget alloué'}
                    </div>
                  </div>
                </div>

                {/* Grille Logistique / RH / Réalisations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {rep.keyAchievements && rep.keyAchievements.length > 0 && (
                    <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">
                      <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Réalisations Majeures de la Période
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {rep.keyAchievements.map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rep.criticalIssues && rep.criticalIssues.length > 0 && (
                    <div className="bg-rose-50/50 p-3 rounded border border-rose-100">
                      <div className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Points Critiques & Contraintes
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {rep.criticalIssues.map((iss, idx) => (
                          <li key={idx}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Fiche A4 Imprimable */}
      {showPrintModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 text-slate-900 border border-slate-300 print:border-none print:shadow-none print:p-0 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
              <div className="text-xs font-bold text-slate-700 uppercase">
                Rapport de Situation Périodique (Aperçu A4)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0B207D] text-white rounded text-xs font-semibold hover:bg-[#07164D] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Rapport</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="border-2 border-slate-800 p-3 rounded flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-[#0B207D]">SARL SILEX SERVICES</div>
                  <div className="text-[10px] text-slate-600">Direction des Opérations & Projets Industriels</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900 uppercase">RAPPORT PÉRIODIQUE D&apos;AVANCEMENT</div>
                  <div className="font-mono text-xs font-bold text-[#0B207D]">{selectedReport.reportNumber}</div>
                  <div className="text-[10px] text-slate-600">
                    Du {formatDateDZ(selectedReport.periodStart)} au {formatDateDZ(selectedReport.periodEnd)}
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 p-2.5 rounded bg-slate-50 text-[11px]">
                <span className="font-bold text-slate-700">Projet : </span>
                <span className="font-semibold text-[#0B207D]">{projectCode} - {projectName}</span>
              </div>

              <div>
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                  1. SYNTHÈSE EXÉCUTIVE
                </div>
                <p className="p-2 border border-slate-300 rounded leading-relaxed text-[11px]">
                  {selectedReport.executiveSummary}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                  2. INDICATEURS DE PERFORMANCE CROISÉS
                </div>
                <div className="grid grid-cols-4 gap-2 border border-slate-300 p-2 rounded text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Physique Réalisé</div>
                    <div className="text-sm font-bold text-emerald-700">{selectedReport.physicalProgress}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Financier Facturé</div>
                    <div className="text-sm font-bold text-blue-700">{selectedReport.financialProgress}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Écart Planning</div>
                    <div className="text-sm font-bold">{selectedReport.scheduleVarianceDays || 0} jours</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Écart Budgétaire</div>
                    <div className="text-sm font-bold">{formatCurrencyDA(selectedReport.costVarianceDA || 0, false)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                    3. STATUT LOGISTIQUE & ACHATS
                  </div>
                  <div className="p-2 border border-slate-300 rounded text-[10px]">
                    {selectedReport.logisticsStatus || 'Approvisionnements conformes.'}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1 bg-slate-200 px-2 py-0.5">
                    4. RESSOURCES HUMAINES & HSE
                  </div>
                  <div className="p-2 border border-slate-300 rounded text-[10px]">
                    {selectedReport.hrStatus || 'Effectifs mobilisés stables.'}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between text-[10px] border-t border-slate-300">
                <div>Visa Émetteur : Responsable Projet</div>
                <div>Visa Destinataire : Direction Générale SILEX Services</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Rapport */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0B207D] text-white flex items-center justify-between">
              <div className="font-bold text-sm flex items-center gap-2">
                <FileBarChart className="w-4 h-4" />
                <span>Générer un Rapport de Situation Périodique</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date Début Période *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date Fin Période *
                  </label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Synthèse Exécutive Générale *
                </label>
                <textarea
                  rows={3}
                  required
                  value={executiveSummary}
                  onChange={e => setExecutiveSummary(e.target.value)}
                  placeholder="Appréciation globale de l'avancement, conformité au planning contractuel, points d'attention..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Avancement Physique (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={physicalProgress}
                    onChange={e => setPhysicalProgress(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Avancement Financier (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={financialProgress}
                    onChange={e => setFinancialProgress(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Réalisations Majeures (1 par ligne)
                  </label>
                  <textarea
                    rows={2}
                    value={keyAchievementsText}
                    onChange={e => setKeyAchievementsText(e.target.value)}
                    placeholder="Pose des collecteurs terminées&#10;Contrôles radio 100% validés"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Contraintes & Alertes (1 par ligne)
                  </label>
                  <textarea
                    rows={2}
                    value={criticalIssuesText}
                    onChange={e => setCriticalIssuesText(e.target.value)}
                    placeholder="Retard livraison coudes inox&#10;Arrêt météo intempéries 2j"
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
                  {submitting ? 'Génération...' : 'Enregistrer le Rapport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
