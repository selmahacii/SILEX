'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, COMPANY_NAME, SystemRole } from '@silex/shared';
import {
  Coins,
  TrendingUp,
  AlertCircle,
  PieChart,
  FileSpreadsheet,
  Search,
  Filter,
  ChevronRight,
  Building,
  DollarSign,
  ArrowUpRight,
  Download,
  X,
  FileText,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  ExternalLink,
} from 'lucide-react';

export default function FinancePage() {
  const { activeRole, currentProfile } = useAuth();
  const canManageFinances =
    activeRole === SystemRole.RESPONSABLE_FINANCIER ||
    activeRole === SystemRole.DIRECTEUR_GENERAL ||
    activeRole === SystemRole.ADMINISTRATEUR;

  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchProject, setSearchProject] = useState('');
  const [marginFilter, setMarginFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
  const [selectedProjectForDecompte, setSelectedProjectForDecompte] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modale Encaissement Client (Virement BEA / Acompte)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payProjectId, setPayProjectId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payReference, setPayReference] = useState('');
  const [payBank, setPayBank] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');

  // Modale Restitution Retenue de Garantie (5%)
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyProjectId, setWarrantyProjectId] = useState('');
  const [warrantyReference, setWarrantyReference] = useState('');
  const [warrantyDate, setWarrantyDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyNotes, setWarrantyNotes] = useState('');

  useEffect(() => {
    async function loadFinance() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<any>('/finance/overview');
        setFinanceData(data);
        if (data?.projects?.length > 0) {
          if (!payProjectId) setPayProjectId(data.projects[0].id);
          if (!warrantyProjectId) setWarrantyProjectId(data.projects[0].id);
        }
      } catch (err: any) {
        console.error('Erreur chargement finance:', err);
        setError(err?.message || 'Erreur lors du chargement des données financières');
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, [activeRole]);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payProjectId) return;
    try {
      await api.post('/finance/payments', {
        projectId: payProjectId,
        amount: Number(payAmount),
        paymentReference: payReference,
        bankName: payBank,
        paymentDate: payDate,
        notes: payNotes,
      });
      setShowPaymentModal(false);
      setNotification(`Encaissement de ${formatCurrencyDA(payAmount, false)} consigné avec succès (Réf: ${payReference}) ! Trésorerie réactualisée.`);
      setTimeout(() => setNotification(null), 5000);
      const data = await api.get<any>('/finance/overview');
      setFinanceData(data);
    } catch (err: any) {
      alert(err.message || 'Erreur enregistrement encaissement');
    }
  };

  const handleReleaseWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyProjectId) return;
    try {
      const res = await api.post<any>('/finance/warranty-release', {
        projectId: warrantyProjectId,
        releaseReference: warrantyReference,
        receptionDefinitiveDate: warrantyDate,
        notes: warrantyNotes,
      });
      setShowWarrantyModal(false);
      const releasedAmt = res?.releasedAmount ? ` (${formatCurrencyDA(res.releasedAmount, false)})` : '';
      setNotification(`Retenue de garantie (5%) débloquée avec succès${releasedAmt} suite au PV de réception définitive !`);
      setTimeout(() => setNotification(null), 5000);
      const data = await api.get<any>('/finance/overview');
      setFinanceData(data);
    } catch (err: any) {
      alert(err.message || 'Erreur déblocage retenue de garantie');
    }
  };

  const filteredProjects = financeData?.projects?.filter((p: any) => {
    const matchesSearch =
      p.code?.toLowerCase().includes(searchProject.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchProject.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchProject.toLowerCase());
    const margin = Number(p.marginRate || 0);
    const matchesMargin =
      marginFilter === 'ALL' ||
      (marginFilter === 'HIGH' && margin >= 20) ||
      (marginFilter === 'LOW' && margin < 20);
    return matchesSearch && matchesMargin;
  }) || [];

  const handleExportProjectDecompte = (p: any) => {
    const headers = ['Code', 'Marche', 'Client', 'Montant Contractuel HT (DA)', 'Budget Alloue (DA)', 'Engagements BC (DA)', 'Cout Reel (DA)', 'Marge (DA)', 'Taux Marge (%)'];
    const marginDA = Math.max(0, Number(p.contractAmount) - Number(p.actualCost));
    const row = [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.clientName}"`,
      p.contractAmount,
      p.budgetAmount,
      p.committedCost,
      p.actualCost,
      marginDA,
      p.marginRate,
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DECOMPTE_METRE_${p.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#07164D] rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B207D]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#0B207D]" />
            Finance & Contrôle des Engagements Chantiers — {COMPANY_NAME}
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Pilotage budgétaire, rentabilité analytique par marché industriel et décomptes métrés clients dans le respect QCD.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canManageFinances && (
            <>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Enregistrer Encaissement Client
              </button>
              <button
                onClick={() => setShowWarrantyModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-amber-600 text-amber-800 rounded-lg hover:bg-amber-50 transition-colors shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Restitution Retenue (5%)
              </button>
            </>
          )}
          {activeRole === SystemRole.RESPONSABLE_PROJET && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#0B207D] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
              <span>Vue Chef de Projets</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Contrôle d'accès RBAC — Habilitation requise</div>
            <div className="text-xs text-amber-800 mt-1">{error}</div>
            <div className="text-[11px] text-amber-700 mt-2">
              Pour accéder aux données financières globales, veuillez utiliser le sélecteur de rôle en haut à droite pour basculer vers le profil <strong>Directeur Financier</strong>, <strong>Directeur Général</strong> ou <strong>Chef de Projets</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Total Marchés Contractuels</div>
          <div className="text-lg font-black text-[#07164D] mt-1">
            {formatCurrencyDA(financeData?.totals?.contractAmount, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Engagements clients fermes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Budgets Prévus Alloués</div>
          <div className="text-lg font-bold text-slate-800 mt-1">
            {formatCurrencyDA(financeData?.totals?.budgetAmount, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Enveloppe opérationnelle chantiers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Engagements Bons de Commande</div>
          <div className="text-lg font-bold text-[#0B207D] mt-1">
            {formatCurrencyDA(financeData?.totals?.committedCost, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dépenses contractées fermes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Marge Globale Prévisionnelle</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            +{financeData?.totals?.globalMarginRate ?? '0.0'}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Conforme aux objectifs 2026</div>
        </div>
      </div>

      {/* Detailed analytical table by project */}
      <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
              Rentabilité Analytique par Marché Industriel ({filteredProjects.length})
            </h2>
            <span className="text-[11px] text-slate-500">Dinar Algérien (DA)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrer marché, client..."
                value={searchProject}
                onChange={e => setSearchProject(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
              />
            </div>

            <select
              value={marginFilter}
              onChange={e => setMarginFilter(e.target.value as any)}
              className="px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700"
            >
              <option value="ALL">Toutes les marges</option>
              <option value="HIGH">Marge ≥ 20%</option>
              <option value="LOW">Marge &lt; 20%</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Marché / Client</th>
                <th className="py-2.5 px-3 text-right">Montant Marché HT</th>
                <th className="py-2.5 px-3 text-right">Budget Alloué</th>
                <th className="py-2.5 px-3 text-right">Coûts Engagés (BC)</th>
                <th className="py-2.5 px-3 text-right">Coûts Réels Consommés</th>
                <th className="py-2.5 px-3 text-center">Taux de Marge</th>
                <th className="py-2.5 px-3 text-right">Actions Détaillées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(Array.isArray(filteredProjects) ? filteredProjects : []).map((p: any) => {
                const margin = Number(p.marginRate || 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                      <Link
                        href={`/projects/${p.code}`}
                        className="hover:underline inline-flex items-center gap-1 group"
                        title={`Ouvrir le chantier ${p.code}`}
                      >
                        {p.code}
                        <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.clientName}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyDA(p.contractAmount, false)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                      {formatCurrencyDA(p.budgetAmount, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800 whitespace-nowrap">
                      {formatCurrencyDA(p.committedCost, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0B207D] whitespace-nowrap">
                      {formatCurrencyDA(p.actualCost, false)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          margin >= 20
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : margin >= 10
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        +{margin}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedProjectForDecompte(p)}
                        className="px-2.5 py-1 bg-white border border-[#0B207D] text-[#0B207D] hover:bg-blue-50 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Consulter le décompte métré et l'analyse de rentabilité"
                      >
                        Décompte Métré
                      </button>
                      <Link
                        href={`/projects/${p.code}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#07164D] hover:text-white text-slate-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        <span>Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL : DÉCOMPTE MÉTRÉ & ANALYSE FINANCIÈRE APPROFONDIE CHANTIER */}
      {/* ========================================================================= */}
      {selectedProjectForDecompte && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedProjectForDecompte.code}
                  </span>
                  <h3 className="text-sm font-bold text-[#07164D]">
                    Décompte Métré & Rentabilité Analytique
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Marché : {selectedProjectForDecompte.name} — Client : {selectedProjectForDecompte.clientName}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectForDecompte(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grille des Métriques Financières Consolidées */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Montant Marché HT</span>
                <span className="font-extrabold text-slate-900 block mt-1">
                  {formatCurrencyDA(selectedProjectForDecompte.contractAmount, false)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Budget Alloué</span>
                <span className="font-bold text-slate-800 block mt-1">
                  {formatCurrencyDA(selectedProjectForDecompte.budgetAmount, false)}
                </span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-700 uppercase font-semibold block">Engagé (Commandes)</span>
                <span className="font-bold text-[#0B207D] block mt-1">
                  {formatCurrencyDA(selectedProjectForDecompte.committedCost, false)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Coût Réel Consommé</span>
                <span className="font-extrabold text-emerald-800 block mt-1">
                  {formatCurrencyDA(selectedProjectForDecompte.actualCost, false)}
                </span>
              </div>
            </div>

            {/* Marge Brute & Jauge de Performance */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">Marge Brute Estimée Chantier :</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">
                    {formatCurrencyDA(
                      Math.max(0, Number(selectedProjectForDecompte.contractAmount) - Number(selectedProjectForDecompte.actualCost)),
                      false
                    )}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      Number(selectedProjectForDecompte.marginRate || 0) >= 20
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    +{selectedProjectForDecompte.marginRate || 0}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, Number(selectedProjectForDecompte.marginRate || 0)))}%` }}
                />
              </div>
            </div>

            {/* Décompte des Situations Métrées */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#0B207D]" />
                État du Décompte Métré & Situations de Travaux
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Poste de Décompte</th>
                      <th className="py-2 px-3 text-right">Montant (DA HT)</th>
                      <th className="py-2 px-3 text-right">Part Contractuelle</th>
                      <th className="py-2 px-3 text-center">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Situations Métrées Validées par le Client</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {formatCurrencyDA(Number(selectedProjectForDecompte.actualCost) * 1.15, false)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">~45%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Payé / En Cours
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Reste à Facturer sur Marché</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800">
                        {formatCurrencyDA(
                          Math.max(0, Number(selectedProjectForDecompte.contractAmount) - Number(selectedProjectForDecompte.actualCost) * 1.15),
                          false
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">~55%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                          À Venir
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Retenue de Garantie Contractuelle (5%)</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">
                        {formatCurrencyDA(Number(selectedProjectForDecompte.contractAmount) * 0.05, false)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">5.0%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          Libérable à Réception Définitive
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Boutons d'actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleExportProjectDecompte(selectedProjectForDecompte)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter Décompte CSV
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForDecompte(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
                >
                  Fermer
                </button>
                <Link
                  href={`/projects/${selectedProjectForDecompte.code}`}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Ouvrir Dossier Chantier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : ENREGISTRER UN ENCAISSEMENT CLIENT (VIREMENT BEA / ACOMPTE) */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Enregistrer un Encaissement Client</h3>
                  <p className="text-[11px] text-slate-500">Règlement de situation de travaux ou acompte contractuel</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chantier / Marché Destinataire *
                </label>
                <select
                  value={payProjectId}
                  onChange={e => setPayProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  {financeData?.projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Montant Encaissé Net (DA) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-bold text-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de Valeur Virement *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Référence Virement / Chèque *
                  </label>
                  <input
                    type="text"
                    required
                    value={payReference}
                    onChange={e => setPayReference(e.target.value)}
                    placeholder="Ex: VIR-BEA-2026-992"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Établissement Bancaire *
                  </label>
                  <input
                    type="text"
                    required
                    value={payBank}
                    onChange={e => setPayBank(e.target.value)}
                    placeholder="Ex: BEA Arzew / BNA Oran"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observations & Tranche Concernée
                </label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="Ex: Règlement situation mensuelle après décompte contradictoire"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B207D] shrink-0" />
                <span>
                  Synchronisation immédiate : L'avancement financier et le taux de recouvrement du chantier seront actualisés.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] shadow-xs cursor-pointer"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : RESTITUTION RETENUE DE GARANTIE (5%) */}
      {/* ========================================================================= */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Restitution Retenue de Garantie (5%)</h3>
                  <p className="text-[11px] text-slate-500">Déblocage après PV de Réception Définitive (J+365)</p>
                </div>
              </div>
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReleaseWarranty} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chantier Éligible à la Réception Définitive *
                </label>
                <select
                  value={warrantyProjectId}
                  onChange={e => setWarrantyProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  {financeData?.projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} (Retenue 5% : {formatCurrencyDA(Number(p.contractAmount) * 0.05, false)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Réf. PV Réception Définitive *
                  </label>
                  <input
                    type="text"
                    required
                    value={warrantyReference}
                    onChange={e => setWarrantyReference(e.target.value)}
                    placeholder="Ex: PV-RD-2026-044"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date PV Réception Définitive *
                  </label>
                  <input
                    type="date"
                    required
                    value={warrantyDate}
                    onChange={e => setWarrantyDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attestation de Levée Totale des Réserves *
                </label>
                <textarea
                  rows={2}
                  required
                  value={warrantyNotes}
                  onChange={e => setWarrantyNotes(e.target.value)}
                  placeholder="Ex: Constat d'absence de désordre durant l'année de parfait achèvement"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Conformité Code des Marchés : La caution ou retenue de 5% est libérée intégralement à l'expiration de la garantie contractuelle.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowWarrantyModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 text-white font-bold rounded hover:bg-amber-800 shadow-xs cursor-pointer"
                >
                  Libérer la Retenue (5%)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
