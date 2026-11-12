'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  User,
  Users,
  Briefcase,
  ShoppingCart,
  Coins,
  ChevronRight,
  Printer,
  Sparkles,
  X,
  FileCheck,
  AlertCircle,
  Eye,
  Send,
  HelpCircle,
  Percent,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, SystemRole, COMPANY_NAME } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';

export default function CommercialModulePage() {
  const { user, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'costSheets' | 'quotes'>('costSheets');

  // Données
  const [kpis, setKpis] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [costSheets, setCostSheets] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Vues détaillées
  const [selectedCostSheet, setSelectedCostSheet] = useState<any | null>(null);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<any | null>(null);
  const [showNewOppModal, setShowNewOppModal] = useState(false);
  const [showNewCostSheetModal, setShowNewCostSheetModal] = useState(false);
  const [showArbitrageModal, setShowArbitrageModal] = useState(false);
  const [arbitrageDecision, setArbitrageDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'>('APPROVED');
  const [arbitrageNotes, setArbitrageNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulaire nouvelle opportunité
  const [newOppForm, setNewOppForm] = useState({
    title: '',
    clientName: 'Client Industrie Démo (Sonatrach Raffinerie Skikda)',
    sector: 'OIL_AND_GAS',
    location: 'Zone Industrielle Skikda RA1K',
    contactName: 'M. Mustapha Larbi',
    contactEmail: 'm.larbi@sonatrach-skikda.dz',
    contactPhone: '+213 (0) 38 75 22 10',
    estimatedAmount: 35000000,
    submissionDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    priority: 'HAUTE',
    notes: 'Travaux neufs et maintenance de tuyauterie haute pression.',
  });

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, oppsRes, sheetsRes, quotesRes] = await Promise.all([
        api.get<any>('/commercial/kpis').catch(() => null),
        api.get<any[]>('/commercial/opportunities').catch(() => []),
        api.get<any[]>('/commercial/cost-sheets').catch(() => []),
        api.get<any[]>('/commercial/quotes').catch(() => []),
      ]);

      setKpis(kpisRes);
      setOpportunities(Array.isArray(oppsRes) ? oppsRes : []);
      setCostSheets(Array.isArray(sheetsRes) ? sheetsRes : []);
      setQuotes(Array.isArray(quotesRes) ? quotesRes : []);

      // Si une fiche était sélectionnée, rafraîchir son état
      if (selectedCostSheet) {
        const updated = (sheetsRes || []).find((s: any) => s.id === selectedCostSheet.id);
        if (updated) setSelectedCostSheet(updated);
      } else if (sheetsRes && sheetsRes.length > 0) {
        // Sélectionner par défaut la première fiche de démonstration
        setSelectedCostSheet(sheetsRes[0]);
      }
    } catch (err) {
      console.error('Erreur chargement commercial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Soumission à la DG
  const handleSubmitToDG = async (sheetId: string) => {
    try {
      setActionLoading(true);
      await api.post(`/commercial/cost-sheets/${sheetId}/submit-dg`, {});
      showNotification('Fiche de coût soumise avec succès à la Direction Générale !');
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la soumission à la DG', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Arbitrage DG
  const handleArbitrateDG = async () => {
    if (!selectedCostSheet) return;
    try {
      setActionLoading(true);
      await api.post(`/commercial/cost-sheets/${selectedCostSheet.id}/arbitrate`, {
        decision: arbitrageDecision,
        notes: arbitrageNotes || `Arbitrage DG : ${arbitrageDecision}`,
      });
      setShowArbitrageModal(false);
      setArbitrageNotes('');
      showNotification(
        arbitrageDecision === 'APPROVED'
          ? 'Fiche de coût validée avec succès par la Direction Générale ! Devis client prêt à être émis.'
          : 'Décision d\'arbitrage enregistrée.'
      );
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de l\'arbitrage DG', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Création du Devis Client
  const handleCreateQuote = async (sheetId: string) => {
    try {
      setActionLoading(true);
      const res: any = await api.post(`/commercial/cost-sheets/${sheetId}/create-quote`, {});
      showNotification(`Devis officiel ${res?.quoteNumber || ''} généré avec succès !`);
      await loadData();
      if (res) setSelectedQuoteForPrint(res);
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la génération du devis', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Conversion en Projet
  const handleConvertToProject = async (sheetId: string) => {
    try {
      setActionLoading(true);
      const res: any = await api.post(`/commercial/cost-sheets/${sheetId}/convert-project`, {});
      showNotification(
        `Contrat gagné ! Projet ${res?.code || ''} créé avec succès avec transfert du budget et des jalons !`
      );
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la conversion en projet', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Création d'opportunité
  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const created: any = await api.post('/commercial/opportunities', newOppForm);
      showNotification(`Opportunité ${created?.code || ''} enregistrée avec succès !`);
      setShowNewOppModal(false);
      await loadData();
      setActiveTab('opportunities');
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la création de l\'opportunité', true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Titre Institutionnel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0B207D] font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#E51A1A]" />
            <span>Processus de Réalisation • Module 01 Commercial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial, Chiffrage & Fiches de Coût Collaboratives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilotage du cycle amont : Opportunités, chiffrage multipartite (Projet, Achats, RH, Finance), arbitrage DG et conversion en projets industriels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewOppModal(true)}
            className="px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Opportunité</span>
          </button>
        </div>
      </div>

      {/* KPIs Commerciaux Stratégiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Opportunités</div>
          <div className="text-xl font-black text-slate-900 mt-1">{kpis?.totalOpportunities ?? opportunities.length}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            {kpis?.activeOpportunities ?? opportunities.filter(o => o.status !== 'PERDUE').length} actives
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Estimé</div>
          <div className="text-lg font-black text-[#0B207D] mt-1 truncate">
            {formatCurrencyDA(kpis?.pipelineValue ?? 74500000)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Affaires en vue</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">En Attente DG</div>
          <div className="text-xl font-black text-amber-700 mt-1">
            {kpis?.pendingCostSheetsCount ?? costSheets.filter(cs => cs.status === 'PRETE_POUR_VALIDATION' || cs.status === 'EN_ATTENTE_DG').length}
          </div>
          <div className="text-[10px] text-amber-800 font-semibold mt-1">Fiches à arbitrer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Devis Émis</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {kpis?.quotesSentCount ?? quotes.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Offres clients</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Contrats Gagnés</div>
          <div className="text-lg font-black text-emerald-700 mt-1 truncate">
            {formatCurrencyDA(kpis?.totalWonValue ?? 38700000)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">Projets convertis</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taux Conversion</div>
          <div className="text-xl font-black text-[#E51A1A] mt-1">
            {kpis?.conversionRate ?? 50.0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ratio d'adjudication</div>
        </div>
      </div>

      {/* Onglets de Navigation Métier */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('costSheets')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'costSheets'
              ? 'text-[#07164D] border-b-2 border-[#07164D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Fiches de Coût Collaboratives (Priorité Absolue)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#07164D] text-[10px]">
            {costSheets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'opportunities'
              ? 'text-[#07164D] border-b-2 border-[#07164D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Prospection & Appels d'Offres</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {opportunities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'quotes'
              ? 'text-[#07164D] border-b-2 border-[#07164D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-slate-500" />
          <span>Devis & Éditions A4</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {quotes.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ONGLET 1 : FICHES DE COÛT COLLABORATIVES (PRIORITÉ N°1) */}
      {/* ======================================================== */}
      {activeTab === 'costSheets' && (
        <div className="space-y-6">
          {/* Sélecteur de fiche si plusieurs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Fiche Active :</span>
              <select
                value={selectedCostSheet?.id || ''}
                onChange={(e) => {
                  const found = costSheets.find(cs => cs.id === e.target.value);
                  if (found) setSelectedCostSheet(found);
                }}
                className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#07164D] focus:outline-none"
              >
                {costSheets.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.reference} — {cs.clientName} ({formatCurrencyDA(cs.proposedSellingPrice)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Statut actuel :</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                selectedCostSheet?.status === 'VALIDEE' || selectedCostSheet?.status === 'GAGNEE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : selectedCostSheet?.status === 'PRETE_POUR_VALIDATION' || selectedCostSheet?.status === 'EN_ATTENTE_DG'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {selectedCostSheet?.status || 'BROUILLON'}
              </span>
            </div>
          </div>

          {selectedCostSheet && (
            <div className="space-y-6">
              {/* Carte Entête & Arbitrage DG */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-5 bg-gradient-to-r from-[#07164D] to-[#0B207D] text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-200 mb-1">
                        <span>RÉFÉRENCE : {selectedCostSheet.reference}</span>
                        <span>•</span>
                        <span>OPPORTUNITÉ : {selectedCostSheet.opportunityCode || 'DIRECT'}</span>
                        <span>•</span>
                        <span>VERSION {selectedCostSheet.version}.0</span>
                      </div>
                      <h2 className="text-xl font-black text-white tracking-tight">
                        {selectedCostSheet.title}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                        <span>Client : <strong className="text-white">{selectedCostSheet.clientName}</strong></span>
                        <span>•</span>
                        <span>Site : <strong className="text-white">{selectedCostSheet.siteLocation}</strong></span>
                        <span>•</span>
                        <span>Devise : <strong className="text-white">DZD (Dinar Algérien)</strong></span>
                      </div>
                    </div>

                    {/* Bloc d'arbitrage et Actions */}
                    <div className="flex flex-wrap items-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20 backdrop-blur-xs">
                      {/* Action Soumettre à la DG */}
                      {selectedCostSheet.status === 'PRETE_POUR_VALIDATION' && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleSubmitToDG(selectedCostSheet.id)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Transmettre à la DG</span>
                        </button>
                      )}

                      {/* Arbitrage DG (Approuver / Rejeter) */}
                      {(selectedCostSheet.status === 'PRETE_POUR_VALIDATION' || selectedCostSheet.status === 'EN_ATTENTE_DG') && isDG && (
                        <button
                          type="button"
                          onClick={() => setShowArbitrageModal(true)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-md cursor-pointer animate-pulse"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Arbitrage DG</span>
                        </button>
                      )}

                      {/* Émission du Devis Client */}
                      {(selectedCostSheet.status === 'VALIDEE' || selectedCostSheet.status === 'SOUMISE_CLIENT' || selectedCostSheet.status === 'GAGNEE') && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleCreateQuote(selectedCostSheet.id)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#07164D] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-[#E51A1A]" />
                          <span>{selectedCostSheet.quoteCreated ? 'Voir Devis Client' : 'Éditer Devis Client'}</span>
                        </button>
                      )}

                      {/* Conversion en Projet */}
                      {(selectedCostSheet.status === 'VALIDEE' || selectedCostSheet.status === 'SOUMISE_CLIENT' || selectedCostSheet.status === 'GAGNEE') && (
                        <button
                          type="button"
                          disabled={actionLoading || selectedCostSheet.projectCreated}
                          onClick={() => handleConvertToProject(selectedCostSheet.id)}
                          className={`px-4 py-2 text-xs font-black rounded-lg transition-colors flex items-center gap-2 shadow-xs ${
                            selectedCostSheet.projectCreated
                              ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                              : 'bg-[#E51A1A] hover:bg-red-700 text-white cursor-pointer'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {selectedCostSheet.projectCreated
                              ? `Projet ${selectedCostSheet.projectCode} Créé`
                              : 'Convertir en Projet Chantier'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Synthèse Financière Consolidée en Direct */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
                  <div className="bg-slate-50 p-3.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coûts Directs</div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {formatCurrencyDA(selectedCostSheet.totalDirectCost)}
                    </div>
                    <div className="text-[9.5px] text-slate-400">Matières + MO + Loc.</div>
                  </div>

                  <div className="bg-slate-50 p-3.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frais Indirects</div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {formatCurrencyDA(selectedCostSheet.totalIndirectCost)}
                    </div>
                    <div className="text-[9.5px] text-slate-400">Base vie + Encadrement</div>
                  </div>

                  <div className="bg-blue-50/50 p-3.5">
                    <div className="text-[10px] font-bold text-[#0B207D] uppercase tracking-wider">Coût Total Prévisionnel</div>
                    <div className="text-sm font-black text-[#0B207D] mt-1">
                      {formatCurrencyDA(selectedCostSheet.totalEstimatedCost)}
                    </div>
                    <div className="text-[9.5px] text-blue-600 font-semibold">Base de débours</div>
                  </div>

                  <div className="bg-emerald-50/60 p-3.5">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Prix de Vente HT</div>
                    <div className="text-sm font-black text-emerald-700 mt-1">
                      {formatCurrencyDA(selectedCostSheet.proposedSellingPrice)}
                    </div>
                    <div className="text-[9.5px] text-emerald-700 font-semibold">Offre proposée</div>
                  </div>

                  <div className="bg-emerald-50/40 p-3.5">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Marge en Valeur</div>
                    <div className="text-sm font-black text-emerald-700 mt-1">
                      +{formatCurrencyDA(selectedCostSheet.estimatedMarginValue)}
                    </div>
                    <div className="text-[9.5px] text-emerald-600 font-semibold">Marge brute DZD</div>
                  </div>

                  <div className="bg-white p-3.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marge sur Coût</div>
                    <div className="text-sm font-black text-[#07164D] mt-1">
                      {selectedCostSheet.marginRateOnCost}%
                    </div>
                    <div className="text-[9.5px] text-slate-400">Marge / Coût Total</div>
                  </div>

                  <div className="bg-white p-3.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taux de Marque</div>
                    <div className="text-sm font-black text-[#E51A1A] mt-1">
                      {selectedCostSheet.markupRate}%
                    </div>
                    <div className="text-[9.5px] text-slate-400">Marge / Prix Vente</div>
                  </div>
                </div>

                {/* Si projet créé, bandeau de liaison directe */}
                {selectedCostSheet.projectCreated && selectedCostSheet.projectCode && (
                  <div className="p-3 bg-emerald-50 border-b border-emerald-200 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Chantier rattaché actif : <strong>{selectedCostSheet.projectCode}</strong> ({selectedCostSheet.title})
                      </span>
                    </div>
                    <Link
                      href={`/projects/${selectedCostSheet.projectCode}`}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Ouvrir l'Espace Chantier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Les 4 Panneaux de Contribution Départementaux */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. CONTRIBUTION PROJET */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#07164D] flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Contribution Service Projet
                        </h3>
                        <p className="text-[10px] text-slate-500">Métrés, durées techniques et moyens matériels</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {selectedCostSheet.projectContribution.completed ? 'Complétée' : 'En cours'}
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Responsable :</span>{' '}
                      <span className="text-slate-900">{selectedCostSheet.projectContribution.responsibleName}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Description des Travaux :</span>
                      <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 mt-1 border border-slate-200 text-[11px] leading-relaxed">
                        {selectedCostSheet.projectContribution.worksDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Durée estimée</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {selectedCostSheet.projectContribution.durationDays} Jours
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Zone de travail</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
                          Zone ATEX 1 / Skikda
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Moyens Techniques :</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {selectedCostSheet.projectContribution.technicalMeans}
                      </p>
                    </div>

                    {/* Lignes techniques */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1.5">Décomposition des Postes Travaux :</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <tr>
                              <th className="p-2">Désignation</th>
                              <th className="p-2 text-right">Qté</th>
                              <th className="p-2 text-right">Total HT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedCostSheet.projectContribution.lines.map((l: any) => (
                              <tr key={l.id}>
                                <td className="p-2 font-medium text-slate-900">{l.label}</td>
                                <td className="p-2 text-right text-slate-600">{l.quantity} {l.unit}</td>
                                <td className="p-2 text-right font-bold text-slate-900">{formatCurrencyDA(l.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CONTRIBUTION ACHATS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Contribution Service Achats & Appro
                        </h3>
                        <p className="text-[10px] text-slate-500">Matières premières, tuyauterie et sous-traitance</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {selectedCostSheet.procurementContribution.completed ? 'Complétée' : 'En cours'}
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Responsable :</span>{' '}
                      <span className="text-slate-900">{selectedCostSheet.procurementContribution.responsibleName}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Stratégie d'Approvisionnement :</span>
                      <p className="p-2.5 bg-slate-50 rounded-lg text-slate-800 mt-1 border border-slate-200 text-[11px] leading-relaxed">
                        {selectedCostSheet.procurementContribution.procurementNotes}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Location Engins / Grues</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {formatCurrencyDA(selectedCostSheet.procurementContribution.equipmentRentalAmount)}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sous-traitance CND</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {formatCurrencyDA(selectedCostSheet.procurementContribution.subcontractingAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Lignes d'achats */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1.5">Fournitures & Cotations Fournisseurs :</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <tr>
                              <th className="p-2">Article</th>
                              <th className="p-2 text-right">Qté</th>
                              <th className="p-2 text-right">PU Estimé</th>
                              <th className="p-2 text-right">Total HT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedCostSheet.procurementContribution.lines.map((l: any) => (
                              <tr key={l.id}>
                                <td className="p-2">
                                  <div className="font-medium text-slate-900">{l.label}</div>
                                  <div className="text-[9.5px] text-slate-400">{l.notes}</div>
                                </td>
                                <td className="p-2 text-right text-slate-600">{l.quantity} {l.unit}</td>
                                <td className="p-2 text-right text-slate-600">{formatCurrencyDA(l.unitPrice)}</td>
                                <td className="p-2 text-right font-bold text-slate-900">{formatCurrencyDA(l.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CONTRIBUTION RH */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Contribution Ressources Humaines
                        </h3>
                        <p className="text-[10px] text-slate-500">Qualifications soudeurs/tuyauteurs et débours MO</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {selectedCostSheet.hrContribution.completed ? 'Complétée' : 'En cours'}
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Responsable :</span>{' '}
                      <span className="text-slate-900">{selectedCostSheet.hrContribution.responsibleName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase">Effectif</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {selectedCostSheet.hrContribution.headcount} Salariés
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase">Mobilisation</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {selectedCostSheet.hrContribution.mobilizationDays} Jours
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase">Frais de Vie</span>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {formatCurrencyDA(selectedCostSheet.hrContribution.teamExpensesAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Lignes MO */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1.5">Effectifs Spécialisés & Taux Journaliers :</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <tr>
                              <th className="p-2">Profil / Qualification</th>
                              <th className="p-2 text-right">Volume</th>
                              <th className="p-2 text-right">Taux J/H</th>
                              <th className="p-2 text-right">Total MO</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedCostSheet.hrContribution.lines.map((l: any) => (
                              <tr key={l.id}>
                                <td className="p-2">
                                  <div className="font-medium text-slate-900">{l.label}</div>
                                  <div className="text-[9.5px] text-slate-400">{l.notes}</div>
                                </td>
                                <td className="p-2 text-right text-slate-600">{l.quantity} {l.unit}</td>
                                <td className="p-2 text-right text-slate-600">{formatCurrencyDA(l.unitPrice)}</td>
                                <td className="p-2 text-right font-bold text-slate-900">{formatCurrencyDA(l.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CONTRIBUTION FINANCE */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Contribution Finance & Trésorerie
                        </h3>
                        <p className="text-[10px] text-slate-500">Rentabilité, trésorerie requise et délais de paiement</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {selectedCostSheet.financeContribution.completed ? 'Complétée' : 'En cours'}
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Responsable :</span>{' '}
                      <span className="text-slate-900">{selectedCostSheet.financeContribution.responsibleName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Besoin Trésorerie</span>
                        <div className="text-sm font-black text-purple-800 mt-0.5">
                          {formatCurrencyDA(selectedCostSheet.financeContribution.financingNeedAmount)}
                        </div>
                        <div className="text-[9.5px] text-slate-400 mt-0.5">Avance matières</div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Risque Financier</span>
                        <div className="text-sm font-black text-emerald-700 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>{selectedCostSheet.financeContribution.financialRiskRating}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 mt-0.5">Client solvable</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Modalités d'Encaissement :</span>
                      <p className="p-2 bg-slate-50 rounded text-slate-800 mt-1 border border-slate-200 text-[11px]">
                        {selectedCostSheet.financeContribution.paymentTermsEstimated}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Avis de Faisabilité & Trésorerie :</span>
                      <p className="p-2 bg-slate-50 rounded text-slate-800 mt-1 border border-slate-200 text-[11px] leading-relaxed">
                        {selectedCostSheet.financeContribution.financeNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal d'Audit & Historique Chronologique */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Traçabilité & Historique des Décisions</span>
                </h3>

                <div className="space-y-2.5">
                  {(selectedCostSheet.history || []).map((h: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="w-2 h-2 rounded-full bg-[#0B207D] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{h.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.timestamp).toLocaleString('fr-DZ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Par <strong className="text-slate-800">{h.actor}</strong> ({h.role})
                        </div>
                        {h.notes && (
                          <div className="text-[11px] text-slate-700 italic mt-1 bg-white p-2 rounded border border-slate-200">
                            « {h.notes} »
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ONGLET 2 : PROSPECTION & OPPORTUNITÉS D'AFFAIRES */}
      {/* ======================================================== */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par client, objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#07164D]"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowNewOppModal(true)}
              className="px-3.5 py-1.5 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Opportunité</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07164D] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Réf</th>
                    <th className="p-3">Client & Contact</th>
                    <th className="p-3">Objet & Secteur</th>
                    <th className="p-3">Localisation</th>
                    <th className="p-3 text-right">Budget Estimé</th>
                    <th className="p-3">Échéance</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-[#07164D]">{opp.code}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{opp.clientName}</div>
                        <div className="text-[10px] text-slate-500">{opp.contactName} • {opp.contactPhone}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{opp.title}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#07164D]">
                          {opp.sector}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{opp.location}</td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {formatCurrencyDA(opp.estimatedAmount)}
                      </td>
                      <td className="p-3 text-slate-600">
                        {new Date(opp.submissionDeadline).toLocaleDateString('fr-DZ')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {opp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('costSheets');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#07164D] hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
                        >
                          Fiche Coût
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ONGLET 3 : DEVIS CLIENTS & ÉDITIONS A4 NORMALISÉES */}
      {/* ======================================================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Registre des Devis Clients Émis
              </h3>
              <span className="text-xs text-slate-500">{quotes.length} devis enregistrés</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07164D] text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">N° Devis</th>
                    <th className="p-3">Fiche Origine</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Objet</th>
                    <th className="p-3 text-right">Montant HT</th>
                    <th className="p-3 text-right">TVA 19%</th>
                    <th className="p-3 text-right">Total TTC</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Imprimer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#07164D]">{q.quoteNumber}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{q.costSheetRef}</td>
                      <td className="p-3 font-bold text-slate-900">{q.clientName}</td>
                      <td className="p-3 max-w-xs truncate text-slate-800">{q.object}</td>
                      <td className="p-3 text-right font-medium text-slate-900">{formatCurrencyDA(q.totalHT)}</td>
                      <td className="p-3 text-right text-slate-600">{formatCurrencyDA(q.vatAmount)}</td>
                      <td className="p-3 text-right font-black text-emerald-700">{formatCurrencyDA(q.totalTTC)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteForPrint(q)}
                          className="px-2.5 py-1 bg-[#07164D] hover:bg-[#0B207D] text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Aperçu A4</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL APERÇU A4 DU DEVIS CLIENT IMPRIMABLE */}
      {/* ======================================================== */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden text-slate-900 my-8">
            {/* Barre d'action d'impression */}
            <div className="bg-[#07164D] p-3 text-white flex items-center justify-between px-6">
              <span className="text-xs font-bold tracking-wide">
                Édition Documentaire Normalisée • DEVIS COMMERCIAL SARL SILEX SERVICES
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white text-[#07164D] text-xs font-black rounded flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPrint(null)}
                  className="p-1 rounded text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document A4 formaté */}
            <div className="p-8 space-y-6 text-xs bg-white border border-slate-200">
              {/* En-tête officiel SILEX */}
              <div className="flex items-start justify-between border-b-2 border-[#07164D] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded border border-slate-300 p-1 flex items-center justify-center shadow-xs">
                    <img src="/logo-silex.png" alt="SILEX" className="max-h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#07164D] tracking-wide">SARL SILEX SERVICES</h2>
                    <p className="text-[10px] text-slate-600 font-semibold">
                      Travaux Neufs • Tuyauterie Industrielle • HVAC • Maintenance • Chaudronnerie
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Zone Industrielle, Rouiba, Alger • Tél : +213 (0) 23 85 40 12 • Email : contact@silex-services.dz
                    </p>
                    <p className="text-[9px] text-slate-400">
                      RC : 16/00-0987654B15 • NIF : 001516098765432 • NIS : 0015160900123
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-[#07164D] text-white font-black text-xs px-3 py-1 rounded">
                    DEVIS COMMERCIAL
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">{selectedQuoteForPrint.quoteNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Date : {new Date(selectedQuoteForPrint.issueDate).toLocaleDateString('fr-DZ')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Validité : {new Date(selectedQuoteForPrint.validUntil).toLocaleDateString('fr-DZ')} (60 jours)
                  </div>
                </div>
              </div>

              {/* Destinataire Client */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Destinataire :</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedQuoteForPrint.clientName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>Objet :</strong> {selectedQuoteForPrint.object}
                </div>
              </div>

              {/* Tableau Chiffré */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07164D] text-white font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Poste / Description Technique des Prestations</th>
                      <th className="p-2.5 text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 text-slate-800">
                        <div className="font-bold text-slate-900">{selectedQuoteForPrint.object}</div>
                        <p className="text-[10.5px] text-slate-600 mt-1">
                          Préfabrication, montage, épreuves hydrauliques contradictoires et contrôles CND selon règles de l'art et cahier des charges client.
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Délai d'exécution : {selectedQuoteForPrint.deliveryLeadTime}
                        </p>
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 text-sm align-top">
                        {formatCurrencyDA(selectedQuoteForPrint.totalHT)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totaux & Ventilation TVA */}
              <div className="flex justify-end">
                <div className="w-72 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Total Net Hors Taxes (HT) :</span>
                    <strong className="text-slate-900">{formatCurrencyDA(selectedQuoteForPrint.totalHT)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>TVA Légale Algérienne ({selectedQuoteForPrint.vatRate}%) :</span>
                    <strong className="text-slate-900">+{formatCurrencyDA(selectedQuoteForPrint.vatAmount)}</strong>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-black text-[#07164D]">
                    <span>Total Net TTC :</span>
                    <span>{formatCurrencyDA(selectedQuoteForPrint.totalTTC)}</span>
                  </div>
                </div>
              </div>

              {/* Conditions & Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[10.5px]">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Conditions de Règlement :</h4>
                  <p className="text-slate-600">{selectedQuoteForPrint.paymentTerms}</p>
                  <p className="text-slate-600 mt-1">Garantie contractuelle : {selectedQuoteForPrint.warrantyTerms}</p>
                </div>

                <div className="text-center border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">
                    Pour SARL SILEX SERVICES • Direction Générale
                  </span>
                  <div className="h-14 flex items-center justify-center text-xs font-mono text-emerald-700 font-bold">
                    [VISA NUMÉRIQUE DG VALIDÉ]
                  </div>
                  <span className="text-[9px] text-slate-400">Cachet & Signature Électronique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ARBITRAGE DIRECTION GÉNÉRALE */}
      {/* ======================================================== */}
      {showArbitrageModal && selectedCostSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black">Arbitrage Direction Générale SILEX</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowArbitrageModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                Vous examinez la fiche <strong>{selectedCostSheet.reference}</strong> pour le client{' '}
                <strong>{selectedCostSheet.clientName}</strong>.
                <div className="mt-1">
                  Coût prévisionnel : <strong>{formatCurrencyDA(selectedCostSheet.totalEstimatedCost)}</strong> • Prix de vente proposé :{' '}
                  <strong className="text-emerald-700">{formatCurrencyDA(selectedCostSheet.proposedSellingPrice)}</strong> (Marge :{' '}
                  <strong>{selectedCostSheet.targetMarginPercent}%</strong>).
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Décision DG :</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setArbitrageDecision('APPROVED')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      arbitrageDecision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Valider l'Offre
                  </button>

                  <button
                    type="button"
                    onClick={() => setArbitrageDecision('REVISION_REQUESTED')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      arbitrageDecision === 'REVISION_REQUESTED'
                        ? 'bg-amber-500 text-slate-900 border-amber-600 ring-2 ring-amber-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Demander Révision
                  </button>

                  <button
                    type="button"
                    onClick={() => setArbitrageDecision('REJECTED')}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      arbitrageDecision === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Rejeter
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motifs & Instructions de la DG :</label>
                <textarea
                  rows={3}
                  value={arbitrageNotes}
                  onChange={(e) => setArbitrageNotes(e.target.value)}
                  placeholder="Ex : Offre validée, respect strict du délai de 45 jours et mobilisation des soudeurs 6G agréés..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07164D]"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowArbitrageModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArbitrateDG}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirmer l'Arbitrage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CRÉATION OPPORTUNITÉ COMMERCIALE */}
      {/* ======================================================== */}
      {showNewOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E51A1A]" />
                <h3 className="text-sm font-black">Nouvelle Opportunité Commerciale</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOppModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Client Industriel :</label>
                <input
                  type="text"
                  required
                  value={newOppForm.clientName}
                  onChange={(e) => setNewOppForm({ ...newOppForm, clientName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé du Projet / Consultation :</label>
                <input
                  type="text"
                  required
                  value={newOppForm.title}
                  placeholder="Ex : Révision de 4 lignes tuyauteries haute pression"
                  onChange={(e) => setNewOppForm({ ...newOppForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secteur Industriel :</label>
                  <select
                    value={newOppForm.sector}
                    onChange={(e) => setNewOppForm({ ...newOppForm, sector: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="OIL_AND_GAS">Oil & Gas (Pétrole & Gaz)</option>
                    <option value="ENERGIE">Énergie</option>
                    <option value="AGROALIMENTAIRE">Agroalimentaire</option>
                    <option value="SIDERURGIE">Sidérurgie</option>
                    <option value="CIMENTERIE">Cimenterie</option>
                    <option value="AUTRE_INDUSTRIE">Autre Industrie</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Estimé (DA) :</label>
                  <input
                    type="number"
                    value={newOppForm.estimatedAmount}
                    onChange={(e) => setNewOppForm({ ...newOppForm, estimatedAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Localisation Chantier :</label>
                  <input
                    type="text"
                    value={newOppForm.location}
                    onChange={(e) => setNewOppForm({ ...newOppForm, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Limite de Remise :</label>
                  <input
                    type="date"
                    value={newOppForm.submissionDeadline}
                    onChange={(e) => setNewOppForm({ ...newOppForm, submissionDeadline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Client :</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nom contact"
                    value={newOppForm.contactName}
                    onChange={(e) => setNewOppForm({ ...newOppForm, contactName: e.target.value })}
                    className="p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newOppForm.contactEmail}
                    onChange={(e) => setNewOppForm({ ...newOppForm, contactEmail: e.target.value })}
                    className="p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Téléphone"
                    value={newOppForm.contactPhone}
                    onChange={(e) => setNewOppForm({ ...newOppForm, contactPhone: e.target.value })}
                    className="p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewOppModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Enregistrer l'Opportunité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
