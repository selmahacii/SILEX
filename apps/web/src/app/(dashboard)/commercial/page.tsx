'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Calculator,
  X,
  FileCheck,
  AlertCircle,
  Eye,
  Send,
  HelpCircle,
  Percent,
  GitCompare,
  History,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Filter,
  CheckSquare,
  Lock,
  Unlock,
  ChevronDown,
  Info,
  Award,
  Star,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, SystemRole, COMPANY_NAME } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';

// Configuration des 10 étapes du Pipeline Industriel SILEX
const PIPELINE_STAGES = [
  { key: 'NOUVELLE', label: '1. Nouvelle', fullName: '1. Nouvelle Opportunité', prob: 10, avgDays: 5, color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { key: 'QUALIFIEE', label: '2. Qualifiée', fullName: '2. Client & Besoin Qualifiés', prob: 20, avgDays: 7, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { key: 'VISITE_TECHNIQUE', label: '3. Visite Tech.', fullName: '3. Visite Technique sur Site', prob: 35, avgDays: 10, color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  { key: 'CHIFFRAGE', label: '4. Chiffrage', fullName: '4. Études & Chiffrage Collaboratif', prob: 50, avgDays: 12, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { key: 'VALIDATION_INTERNE', label: '5. Validation', fullName: '5. Validation Interne & DG', prob: 65, avgDays: 4, color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { key: 'OFFRE_SOUMISE', label: '6. Soumise', fullName: '6. Offre Commerciale Remise', prob: 75, avgDays: 15, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { key: 'NEGOCIATION', label: '7. Négociation', fullName: '7. Négociation & Alignement', prob: 85, avgDays: 20, color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { key: 'GAGNEE', label: '8. Gagnée', fullName: '8. Marché Gagné / Notifié', prob: 100, avgDays: 0, color: 'bg-emerald-100 text-emerald-950 border-emerald-400' },
  { key: 'PERDUE', label: '9. Perdue', fullName: '9. Dossier Non Retenu', prob: 0, avgDays: 0, color: 'bg-red-100 text-red-950 border-red-300' },
  { key: 'ANNULEE', label: '10. Annulée', fullName: '10. Appel d\'Offres Infructueux', prob: 0, avgDays: 0, color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

export default function CommercialModulePage() {
  const { user, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'costSheets' | 'pipeline' | 'opportunities' | 'quotes' | 'satisfaction'>('costSheets');

  // Données
  const [kpis, setKpis] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [costSheets, setCostSheets] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fiche active
  const [selectedCostSheet, setSelectedCostSheet] = useState<any | null>(null);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<any | null>(null);
  const [selectedSurveyForPrint, setSelectedSurveyForPrint] = useState<any | null>(null);

  // Enquête de satisfaction client (COM-12 / Cahier des Charges Page 5/14)
  const [showNewSurveyModal, setShowNewSurveyModal] = useState(false);
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const initialSurveyForm = {
    clientName: '',
    projectCode: '',
    projectName: '',
    contactName: '',
    contactEmail: '',
    surveyDate: new Date().toISOString().split('T')[0],
    qualityScore: 9,
    scheduleScore: 8,
    hseScore: 10,
    responsivenessScore: 9,
    recommendationScore: 9,
    comments: '',
    clientSignatory: '',
  };
  const [newSurveyForm, setNewSurveyForm] = useState(initialSurveyForm);

  // Modals
  const [showNewOppModal, setShowNewOppModal] = useState(false);
  const [showArbitrageModal, setShowArbitrageModal] = useState(false);
  const [arbitrageDecision, setArbitrageDecision] = useState<'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'>('APPROVED');
  const [arbitrageNotes, setArbitrageNotes] = useState('');

  // Versioning & Comparateur Modals
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState<number>(1);
  const [compareVersionB, setCompareVersionB] = useState<number>(2);

  // Contribution Edit Modal
  const [activeContributionModal, setActiveContributionModal] = useState<'PROJECT' | 'PROCUREMENT' | 'HR' | 'FINANCE' | null>(null);
  const [projectContribForm, setProjectContribForm] = useState<any>(null);
  const [procurementContribForm, setProcurementContribForm] = useState<any>(null);
  const [hrContribForm, setHrContribForm] = useState<any>(null);
  const [financeContribForm, setFinanceContribForm] = useState<any>(null);

  // Stage Transition Modal
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedOppForStage, setSelectedOppForStage] = useState<any | null>(null);
  const [targetStage, setTargetStage] = useState<string>('QUALIFIEE');
  const [stageLossReason, setStageLossReason] = useState('CONCURRENT_MOINS_DISANT');
  const [stageCancellationReason, setStageCancellationReason] = useState('APPEL_OFFRES_INFRUCTUEUX');
  const [stageSiteVisitDate, setStageSiteVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [stageTechnicalNotes, setStageTechnicalNotes] = useState('');
  const [stageNotes, setStageNotes] = useState('');

  // Notifications & Loadings
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulaire nouvelle opportunité
  const initialOppForm = {
    title: '',
    clientName: '',
    sector: 'OIL_AND_GAS',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedAmount: 0,
    submissionDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    priority: 'NORMALE',
    notes: '',
  };
  const [newOppForm, setNewOppForm] = useState(initialOppForm);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, oppsRes, sheetsRes, quotesRes, surveysRes] = await Promise.all([
        api.get<any>('/commercial/kpis').catch(() => null),
        api.get<any[]>('/commercial/opportunities').catch(() => []),
        api.get<any[]>('/commercial/cost-sheets').catch(() => []),
        api.get<any[]>('/commercial/quotes').catch(() => []),
        api.get<any[]>('/commercial/satisfaction').catch(() => []),
      ]);

      setKpis(kpisRes);
      setOpportunities(Array.isArray(oppsRes) ? oppsRes : []);
      setCostSheets(Array.isArray(sheetsRes) ? sheetsRes : []);
      setQuotes(Array.isArray(quotesRes) ? quotesRes : []);
      setSurveys(Array.isArray(surveysRes) ? surveysRes : []);

      if (selectedCostSheet) {
        const updated = (sheetsRes || []).find((s: any) => s.id === selectedCostSheet.id);
        if (updated) setSelectedCostSheet(updated);
        else setSelectedCostSheet(sheetsRes && sheetsRes.length > 0 ? sheetsRes[0] : null);
      } else if (sheetsRes && sheetsRes.length > 0) {
        setSelectedCostSheet(sheetsRes[0]);
      } else {
        setSelectedCostSheet(null);
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
      setTimeout(() => setErrorMessage(null), 6000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // --- ACTIONS FICHE DE COÛT ---

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

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCostSheet) return;
    try {
      setActionLoading(true);
      const res: any = await api.post(`/commercial/cost-sheets/${selectedCostSheet.id}/create-revision`, {
        reason: revisionReason,
      });
      setShowRevisionModal(false);
      setRevisionReason('');
      showNotification(`Nouvelle version V${res?.version || selectedCostSheet.version + 1}.0 créée avec succès ! Contributions déverrouillées.`);
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la création de la révision', true);
    } finally {
      setActionLoading(false);
    }
  };

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

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSurveySubmitting(true);
      await api.post('/commercial/satisfaction', newSurveyForm);
      showNotification('Enquête de satisfaction client enregistrée avec succès !');
      setShowNewSurveyModal(false);
      setNewSurveyForm(initialSurveyForm);
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de l’enregistrement de l’enquête', true);
    } finally {
      setSurveySubmitting(false);
    }
  };

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

  // --- ÉDITION DES CONTRIBUTIONS DÉPARTEMENTALES ---

  const openContributionEditor = (dept: 'PROJECT' | 'PROCUREMENT' | 'HR' | 'FINANCE') => {
    if (!selectedCostSheet) return;
    if (selectedCostSheet.status === 'VALIDEE') {
      showNotification(
        `Cette fiche est validée par la DG (V${selectedCostSheet.version}.0). Veuillez cliquer sur "Créer Révision" pour éditer une nouvelle version.`,
        true
      );
      return;
    }

    if (dept === 'PROJECT') {
      const pc = selectedCostSheet.projectContribution;
      setProjectContribForm({
        worksDescription: pc.worksDescription || '',
        durationDays: pc.durationDays || 45,
        technicalMeans: pc.technicalMeans || '',
        constraints: pc.constraints || '',
        lines: (pc.lines || []).map((l: any) => ({ ...l })),
      });
    } else if (dept === 'PROCUREMENT') {
      const prc = selectedCostSheet.procurementContribution;
      setProcurementContribForm({
        procurementNotes: prc.procurementNotes || '',
        equipmentRentalAmount: prc.equipmentRentalAmount || 0,
        subcontractingAmount: prc.subcontractingAmount || 0,
        lines: (prc.lines || []).map((l: any) => ({ ...l })),
      });
    } else if (dept === 'HR') {
      const hrc = selectedCostSheet.hrContribution;
      setHrContribForm({
        headcount: hrc.headcount || 10,
        mobilizationDays: hrc.mobilizationDays || 45,
        teamExpensesAmount: hrc.teamExpensesAmount || 0,
        lines: (hrc.lines || []).map((l: any) => ({ ...l })),
      });
    } else if (dept === 'FINANCE') {
      const fc = selectedCostSheet.financeContribution;
      setFinanceContribForm({
        targetMarginPercent: selectedCostSheet.targetMarginPercent || 25,
        financingNeedAmount: fc.financingNeedAmount || 0,
        paymentTermsEstimated: fc.paymentTermsEstimated || '',
        financialRiskRating: fc.financialRiskRating || 'MODERE',
        feasibilityOpinion: fc.feasibilityOpinion || 'FAVORABLE',
        financeNotes: fc.financeNotes || '',
      });
    }

    setActiveContributionModal(dept);
  };

  const handleSaveContribution = async (dept: 'PROJECT' | 'PROCUREMENT' | 'HR' | 'FINANCE') => {
    if (!selectedCostSheet) return;
    try {
      setActionLoading(true);
      let payload: any = {};
      if (dept === 'PROJECT') payload = projectContribForm;
      else if (dept === 'PROCUREMENT') payload = procurementContribForm;
      else if (dept === 'HR') payload = hrContribForm;
      else if (dept === 'FINANCE') payload = financeContribForm;

      await api.patch(`/commercial/cost-sheets/${selectedCostSheet.id}/${dept}`, payload);
      showNotification(`Contribution ${dept} enregistrée et recalculs financiers mis à jour !`);
      setActiveContributionModal(null);
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || `Erreur lors de l'enregistrement de la contribution ${dept}`, true);
    } finally {
      setActionLoading(false);
    }
  };

  // --- TRANSITION D'ÉTAPE DU PIPELINE ---

  const openStageModal = (opp: any) => {
    setSelectedOppForStage(opp);
    setTargetStage(opp.status === 'GAGNEE' || opp.status === 'PERDUE' ? 'NEGOCIATION' : opp.status);
    setStageLossReason(opp.lossReason || 'CONCURRENT_MOINS_DISANT');
    setStageCancellationReason(opp.cancellationReason || 'APPEL_OFFRES_INFRUCTUEUX');
    setStageSiteVisitDate(opp.siteVisitDate || new Date().toISOString().split('T')[0]);
    setStageTechnicalNotes(opp.technicalReportNotes || '');
    setStageNotes('');
    setShowStageModal(true);
  };

  const handleUpdateOpportunityStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppForStage) return;
    try {
      setActionLoading(true);
      const payload: any = {
        stage: targetStage,
        notes: stageNotes,
      };
      if (targetStage === 'PERDUE') {
        payload.lossReason = stageLossReason;
      }
      if (targetStage === 'ANNULEE') {
        payload.cancellationReason = stageCancellationReason;
      }
      if (targetStage === 'VISITE_TECHNIQUE') {
        payload.siteVisitDate = stageSiteVisitDate;
        payload.technicalReportNotes = stageTechnicalNotes;
      }

      await api.post(`/commercial/opportunities/${selectedOppForStage.id}/stage`, payload);
      showNotification(`Opportunité ${selectedOppForStage.code} transférée avec succès à l'étape "${targetStage}" !`);
      setShowStageModal(false);
      await loadData();
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la transition d\'étape', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const created: any = await api.post('/commercial/opportunities', newOppForm);
      showNotification(`Opportunité ${created?.code || ''} enregistrée avec succès !`);
      setNewOppForm(initialOppForm);
      setShowNewOppModal(false);
      await loadData();
      setActiveTab('pipeline');
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la création de l\'opportunité', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Opportunités filtrées pour la liste
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchSearch =
        !searchTerm ||
        opp.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSector = sectorFilter === 'ALL' || opp.sector === sectorFilter;
      const matchStatus = statusFilter === 'ALL' || opp.status === statusFilter;
      return matchSearch && matchSector && matchStatus;
    });
  }, [opportunities, searchTerm, sectorFilter, statusFilter]);

  // Données de comparaison de versions
  const comparisonView = useMemo(() => {
    if (!selectedCostSheet) return null;
    const revs = selectedCostSheet.revisions || [];
    const getVersion = (v: number) => {
      if (v === selectedCostSheet.version) return selectedCostSheet;
      return revs.find((r: any) => r.version === v) || null;
    };
    const vA = getVersion(compareVersionA);
    const vB = getVersion(compareVersionB);
    if (!vA || !vB) return null;

    return {
      vA,
      vB,
      deltaSellingPrice: (vB.proposedSellingPrice || 0) - (vA.proposedSellingPrice || 0),
      deltaSellingPricePct: vA.proposedSellingPrice > 0
        ? ((((vB.proposedSellingPrice || 0) - vA.proposedSellingPrice) / vA.proposedSellingPrice) * 100).toFixed(1)
        : '0',
      deltaDirectCost: (vB.totalDirectCost || 0) - (vA.totalDirectCost || 0),
      deltaIndirectCost: (vB.totalIndirectCost || 0) - (vA.totalIndirectCost || 0),
      deltaEstimatedCost: (vB.totalEstimatedCost || 0) - (vA.totalEstimatedCost || 0),
      deltaMarginValue: (vB.estimatedMarginValue || 0) - (vA.estimatedMarginValue || 0),
      deltaMarkupRate: ((vB.markupRate || 0) - (vA.markupRate || 0)).toFixed(2),
      deltaMarginRateOnCost: ((vB.marginRateOnCost || 0) - (vA.marginRateOnCost || 0)).toFixed(2),
    };
  }, [selectedCostSheet, compareVersionA, compareVersionB]);

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
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
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Institutionnel SILEX */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0B207D] font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#E51A1A]" />
            <span>Processus Amont • Module 01 Commercial & Chiffrage Industriel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Commercial, Pipeline CRM & Fiches de Coût Collaboratives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cycle commercial 10 étapes, chiffrage multipartite (Projet, Achats, RH, Finance), versionnage comparatif et arbitrage DG.
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opportunités</div>
          <div className="text-lg font-black text-slate-900 mt-1">{kpis?.totalOpportunities ?? opportunities.length}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
            {opportunities.filter(o => !['PERDUE', 'ANNULEE', 'GAGNEE'].includes(o.status)).length} actives
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Brut</div>
          <div className="text-base font-black text-[#0B207D] mt-1 truncate">
            {formatCurrencyDA(kpis?.pipelineValue ?? opportunities.reduce((acc, o) => acc + (o.estimatedAmount || 0), 0))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Affaires globales</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-2xs">
          <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Pipeline Pondéré</div>
          <div className="text-base font-black text-indigo-700 mt-1 truncate">
            {formatCurrencyDA(kpis?.weightedPipelineValue ?? 0)}
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Selon probabilités</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">En Attente DG</div>
          <div className="text-lg font-black text-amber-700 mt-1">
            {costSheets.filter(cs => cs.status === 'PRETE_POUR_VALIDATION' || cs.status === 'EN_ATTENTE_DG').length}
          </div>
          <div className="text-[10px] text-amber-800 font-semibold mt-0.5">Fiches à arbitrer</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Devis Émis</div>
          <div className="text-lg font-black text-slate-900 mt-1">{quotes.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Offres clients</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Contrats Gagnés</div>
          <div className="text-base font-black text-emerald-700 mt-1 truncate">
            {formatCurrencyDA(kpis?.totalWonValue ?? 0)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Marchés notifiés</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taux Conversion</div>
          <div className="text-lg font-black text-[#E51A1A] mt-1">
            {kpis?.conversionRate ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ratio d'adjudication</div>
        </div>
      </div>

      {/* Onglets de Navigation Principale */}
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
          <Calculator className="w-4 h-4 text-amber-600" />
          <span>Fiches de Coût Collaboratives</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#07164D] text-[10px]">
            {costSheets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'pipeline'
              ? 'text-[#07164D] border-b-2 border-[#07164D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Pipeline CRM (10 Étapes Kanban)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
            {opportunities.length}
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
          <Briefcase className="w-4 h-4 text-slate-500" />
          <span>Registre des Affaires</span>
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

        <button
          type="button"
          onClick={() => setActiveTab('satisfaction')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'satisfaction'
              ? 'text-[#07164D] border-b-2 border-[#07164D]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Satisfaction Client (COM-12)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {surveys.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ONGLET 1 : FICHES DE COÛT COLLABORATIVES */}
      {/* ======================================================== */}
      {activeTab === 'costSheets' && (
        costSheets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-[#07164D] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Aucune fiche de chiffrage active</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Créez une nouvelle opportunité pour démarrer un cycle d'estimation multi-départements (Projet, Achats, RH, Finance, DG).
            </p>
            <button
              type="button"
              onClick={() => setShowNewOppModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white rounded-lg text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une Opportunité</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sélecteur de fiche & Version Tag */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-600 uppercase">Fiche Active :</span>
                <select
                  value={selectedCostSheet?.id || ''}
                  onChange={(e) => {
                    const found = costSheets.find(cs => cs.id === e.target.value);
                    if (found) setSelectedCostSheet(found);
                  }}
                  className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#07164D]"
                >
                  {costSheets.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.reference} (V{cs.version}.0) — {cs.clientName} ({formatCurrencyDA(cs.proposedSellingPrice)})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Version {selectedCostSheet?.version}.0</span>
                  {selectedCostSheet?.revisions && selectedCostSheet.revisions.length > 0 && (
                    <span className="text-[10px] text-indigo-600">({selectedCostSheet.revisions.length} révision(s) archivée(s))</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Statut :</span>
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
                {/* Carte Entête & Actions de Cycle de Vie */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-5 bg-gradient-to-r from-[#07164D] to-[#0B207D] text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-200 mb-1">
                          <span>RÉFÉRENCE : {selectedCostSheet.reference}</span>
                          <span>•</span>
                          <span>OPPORTUNITÉ : {selectedCostSheet.opportunityCode || 'DIRECT'}</span>
                          <span>•</span>
                          <span>VERSION : V{selectedCostSheet.version}.0</span>
                          {selectedCostSheet.status === 'VALIDEE' && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Verrouillée DG
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                          {selectedCostSheet.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                          <span>Client : <strong className="text-white">{selectedCostSheet.clientName}</strong></span>
                          <span>•</span>
                          <span>Site : <strong className="text-white">{selectedCostSheet.siteLocation}</strong></span>
                          <span>•</span>
                          <span>Devise : <strong className="text-white">DZD (Dinar Algérien)</strong></span>
                        </div>
                      </div>

                      {/* Barre d'Actions & Gouvernance SoD */}
                      <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2.5 rounded-lg border border-white/20">
                        {/* Comparateur de versions si révisions existantes */}
                        {selectedCostSheet.revisions && selectedCostSheet.revisions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompareVersionA(1);
                              setCompareVersionB(selectedCostSheet.version);
                              setShowCompareModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>Comparer Versions</span>
                          </button>
                        )}

                        {/* Créer Nouvelle Révision V(n+1) */}
                        <button
                          type="button"
                          onClick={() => setShowRevisionModal(true)}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title="Créer une révision après négociation commerciale"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Créer Révision V{selectedCostSheet.version + 1}</span>
                        </button>

                        {/* Action Soumettre à la DG */}
                        {selectedCostSheet.status === 'PRETE_POUR_VALIDATION' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleSubmitToDG(selectedCostSheet.id)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Transmettre à la DG</span>
                          </button>
                        )}

                        {/* Arbitrage DG */}
                        {(selectedCostSheet.status === 'PRETE_POUR_VALIDATION' || selectedCostSheet.status === 'EN_ATTENTE_DG') && isDG && (
                          <button
                            type="button"
                            onClick={() => setShowArbitrageModal(true)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Arbitrage DG</span>
                          </button>
                        )}

                        {/* Émission du Devis Client */}
                        {(selectedCostSheet.status === 'VALIDEE' || selectedCostSheet.status === 'SOUMISE_CLIENT' || selectedCostSheet.status === 'GAGNEE') && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleCreateQuote(selectedCostSheet.id)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#07164D] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#E51A1A]" />
                            <span>{selectedCostSheet.quoteCreated ? 'Voir Devis' : 'Éditer Devis'}</span>
                          </button>
                        )}

                        {/* Conversion en Projet Chantier */}
                        {(selectedCostSheet.status === 'VALIDEE' || selectedCostSheet.status === 'SOUMISE_CLIENT' || selectedCostSheet.status === 'GAGNEE') && (
                          <button
                            type="button"
                            disabled={actionLoading || selectedCostSheet.projectCreated}
                            onClick={() => handleConvertToProject(selectedCostSheet.id)}
                            className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                              selectedCostSheet.projectCreated
                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                : 'bg-[#E51A1A] hover:bg-red-700 text-white cursor-pointer'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {selectedCostSheet.projectCreated
                                ? `Projet ${selectedCostSheet.projectCode}`
                                : 'Convertir en Projet'}
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
                      <div className="text-[9.5px] text-slate-400">Base vie + Encadrement (5%)</div>
                    </div>

                    <div className="bg-blue-50/50 p-3.5">
                      <div className="text-[10px] font-bold text-[#0B207D] uppercase tracking-wider">Coût Total Débours</div>
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
                      <div className="text-[9.5px] text-emerald-700 font-semibold">Offre finale HT</div>
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

                  {/* Liaison Projet Actif */}
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

                {/* LES 4 PANNEAUX DE CONTRIBUTION DÉPARTEMENTAUX (ÉDITABLES EN TEMPS RÉEL) */}
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {selectedCostSheet.projectContribution.completed ? 'Complétée' : 'En cours'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openContributionEditor('PROJECT')}
                          className="px-2.5 py-1 bg-[#07164D] hover:bg-[#0B207D] text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Éditer Métrés</span>
                        </button>
                      </div>
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
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Contraintes / ATEX</span>
                          <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
                            {selectedCostSheet.projectContribution.constraints || 'Standard'}
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
                              {(selectedCostSheet.projectContribution.lines || []).map((l: any, idx: number) => (
                                <tr key={l.id || idx}>
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {selectedCostSheet.procurementContribution.completed ? 'Complétée' : 'En cours'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openContributionEditor('PROCUREMENT')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Éditer Achats</span>
                        </button>
                      </div>
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
                              {(selectedCostSheet.procurementContribution.lines || []).map((l: any, idx: number) => (
                                <tr key={l.id || idx}>
                                  <td className="p-2">
                                    <div className="font-medium text-slate-900">{l.label}</div>
                                    {l.notes && <div className="text-[9.5px] text-slate-400">{l.notes}</div>}
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {selectedCostSheet.hrContribution.completed ? 'Complétée' : 'En cours'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openContributionEditor('HR')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Éditer MO RH</span>
                        </button>
                      </div>
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
                              {(selectedCostSheet.hrContribution.lines || []).map((l: any, idx: number) => (
                                <tr key={l.id || idx}>
                                  <td className="p-2">
                                    <div className="font-medium text-slate-900">{l.label}</div>
                                    {l.notes && <div className="text-[9.5px] text-slate-400">{l.notes}</div>}
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

                  {/* 4. CONTRIBUTION FINANCE & RENTABILITÉ */}
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {selectedCostSheet.financeContribution.completed ? 'Complétée' : 'En cours'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openContributionEditor('FINANCE')}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Éditer Finance</span>
                        </button>
                      </div>
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
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Risque Client</span>
                          <div className="text-sm font-black text-emerald-700 mt-0.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>{selectedCostSheet.financeContribution.financialRiskRating}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">Solvabilité vérifiée</div>
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

                {/* Journal d'Audit & Historique des Décisions */}
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
        )
      )}

      {/* ======================================================== */}
      {/* ONGLET 2 : PIPELINE COMMERCIAL CRM (10 ÉTAPES KANBAN) */}
      {/* ======================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Pipeline Commercial Industriel • 10 Étapes Normalisées
              </h2>
              <p className="text-xs text-slate-500">
                Chaque étape intègre une probabilité de clôture contractuelle, des critères de passage et des alertes de stagnation (&gt; 15 jours).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewOppModal(true)}
              className="px-3.5 py-1.5 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Opportunité</span>
            </button>
          </div>

          {/* Tableau Kanban Horizontal Scrollable */}
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-3 min-w-full">
              {PIPELINE_STAGES.map((stage) => {
                const stageOpps = opportunities.filter((o) => o.status === stage.key);
                const totalAmount = stageOpps.reduce((sum, o) => sum + (o.estimatedAmount || 0), 0);
                const weightedAmount = Math.round(totalAmount * (stage.prob / 100));

                return (
                  <div
                    key={stage.key}
                    className="w-72 shrink-0 bg-slate-50 rounded-xl border border-slate-200 flex flex-col max-h-[750px]"
                  >
                    {/* Colonne Entête */}
                    <div className="p-3 border-b border-slate-200 bg-white rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-900 tracking-tight truncate">
                          {stage.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stage.color}`}>
                          {stageOpps.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Pondération : <strong>{stage.prob}%</strong></span>
                        {stage.avgDays > 0 && <span>Durée max : ~{stage.avgDays}j</span>}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                        <span className="font-bold text-slate-700">{formatCurrencyDA(totalAmount)}</span>
                        <span className="text-indigo-600 font-semibold truncate">({formatCurrencyDA(weightedAmount)})</span>
                      </div>
                    </div>

                    {/* Liste des cartes opportunités */}
                    <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                      {stageOpps.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">
                          Aucune affaire à cette étape
                        </div>
                      ) : (
                        stageOpps.map((opp) => {
                          const daysInStage = Math.floor(
                            (Date.now() - new Date(opp.updatedAt || opp.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                          );
                          const isStagnant =
                            daysInStage > (stage.avgDays > 0 ? Math.max(stage.avgDays, 14) : 15) &&
                            !['GAGNEE', 'PERDUE', 'ANNULEE'].includes(opp.status);

                          return (
                            <div
                              key={opp.id}
                              className={`p-3 bg-white rounded-lg border transition-all shadow-2xs hover:shadow-sm ${
                                isStagnant ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[10.5px] font-bold text-[#07164D]">{opp.code}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase ${
                                  opp.priority === 'URGENTE' || opp.priority === 'HAUTE'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {opp.priority}
                                </span>
                              </div>

                              <div className="text-xs font-bold text-slate-900 line-clamp-1">{opp.clientName}</div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{opp.title}</p>

                              {/* Alerte Stagnation */}
                              {isStagnant && (
                                <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[9.5px] text-amber-900 font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Stagnation : {daysInStage} jours sans mise à jour</span>
                                </div>
                              )}

                              {/* Motif si perdue ou annulée */}
                              {opp.status === 'PERDUE' && opp.lossReason && (
                                <div className="mt-1.5 text-[9.5px] text-red-800 font-semibold bg-red-50 p-1 rounded border border-red-200">
                                  Motif perte : {opp.lossReason}
                                </div>
                              )}
                              {opp.status === 'ANNULEE' && opp.cancellationReason && (
                                <div className="mt-1.5 text-[9.5px] text-slate-700 font-semibold bg-slate-100 p-1 rounded border border-slate-200">
                                  Motif annulation : {opp.cancellationReason}
                                </div>
                              )}

                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900">
                                  {formatCurrencyDA(opp.estimatedAmount)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Échéance : {new Date(opp.submissionDeadline).toLocaleDateString('fr-DZ')}
                                </span>
                              </div>

                              <div className="mt-2.5 flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() => openStageModal(opp)}
                                  className="flex-1 py-1 px-2 bg-slate-100 hover:bg-[#07164D] hover:text-white rounded text-[10.5px] font-bold transition-colors text-center cursor-pointer"
                                >
                                  Changer Étape
                                </button>
                                {opp.costSheetId ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const found = costSheets.find(cs => cs.id === opp.costSheetId || cs.reference === opp.costSheetId);
                                      if (found) setSelectedCostSheet(found);
                                      setActiveTab('costSheets');
                                    }}
                                    className="py-1 px-2 bg-blue-50 hover:bg-blue-100 text-[#07164D] rounded text-[10.5px] font-bold transition-colors cursor-pointer"
                                  >
                                    Fiche Coût
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('costSheets');
                                    }}
                                    className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-[10.5px] font-bold transition-colors cursor-pointer"
                                  >
                                    + Chiffrer
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ONGLET 3 : REGISTRE DES AFFAIRES (VUE TABULAIRE) */}
      {/* ======================================================== */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par référence, client, objet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#07164D]"
                />
              </div>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-3 py-1.5"
              >
                <option value="ALL">Tous Secteurs</option>
                <option value="OIL_AND_GAS">Oil & Gas</option>
                <option value="ENERGIE">Énergie</option>
                <option value="AGROALIMENTAIRE">Agroalimentaire</option>
                <option value="CIMENTERIE">Cimenterie</option>
                <option value="AUTRE_INDUSTRIE">Autre</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-3 py-1.5"
              >
                <option value="ALL">Toutes Étapes (10)</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
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
                    <th className="p-3 text-right">Probabilité</th>
                    <th className="p-3">Échéance</th>
                    <th className="p-3">Étape Pipeline</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">Aucune opportunité correspondant aux filtres</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOpportunities.map((opp) => (
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
                        <td className="p-3 text-right font-bold text-indigo-700">
                          {opp.winProbability ?? 20}%
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
                            onClick={() => openStageModal(opp)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#07164D] hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
                          >
                            Étape
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ONGLET 4 : DEVIS CLIENTS & ÉDITIONS A4 NORMALISÉES */}
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
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">Aucun devis client émis</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Les devis officiels sont générés automatiquement suite à la validation d'une fiche de chiffrage par la Direction Générale.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    quotes.map((q) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ONGLET 5 : ENQUÊTES DE SATISFACTION CLIENT (COM-12) */}
      {/* ======================================================== */}
      {activeTab === 'satisfaction' && (
        <div className="space-y-6">
          {/* Header & KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Évaluations</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-[#07164D]">{surveys.length}</span>
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">Évaluations post-chantier</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Score Global Moyen</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-emerald-600">
                  {surveys.length > 0
                    ? `${(surveys.reduce((acc, s) => acc + (s.overallScore || 0), 0) / surveys.length).toFixed(1)}%`
                    : 'N/A'}
                </span>
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">Objectif qualité &gt; 85%</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Score HSE Moyen</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-indigo-700">
                  {surveys.length > 0
                    ? `${(surveys.reduce((acc, s) => acc + (s.hseScore || 0), 0) / surveys.length).toFixed(1)} / 10`
                    : 'N/A'}
                </span>
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">Sécurité & procédures ATEX</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Taux Recommandation</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-emerald-700">
                  {surveys.length > 0
                    ? `${(surveys.reduce((acc, s) => acc + (s.recommendationScore || 0), 0) / surveys.length * 10).toFixed(0)}%`
                    : 'N/A'}
                </span>
                <ThumbsUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">Fidélité & renouvellement</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Registre des Enquêtes de Satisfaction Client (COM-12)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Évaluation post-chantier formalisée sur 5 critères industriels selon le Cahier des Charges Page 5/14
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSurveyModal(true)}
                className="px-3.5 py-1.5 bg-[#07164D] hover:bg-[#0B207D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nouvelle Enquête Client</span>
              </button>
            </div>

            {surveys.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
                  <Award className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Aucune enquête enregistrée pour le moment</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Les enquêtes de satisfaction (COM-12) sont déclenchées lors des réceptions provisoires ou définitives de travaux
                  afin de mesurer la conformité technique, le respect des plannings et l’excellence HSE.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewSurveyModal(true)}
                  className="px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer une Première Évaluation</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07164D] text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Réf & Date</th>
                      <th className="p-3">Client & Contact</th>
                      <th className="p-3">Chantier / Projet</th>
                      <th className="p-3 text-center">Score Global</th>
                      <th className="p-3">Critères Détaillés (/10)</th>
                      <th className="p-3">Appréciation</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {surveys.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 align-top">
                          <span className="font-mono font-bold text-slate-900 block">{s.reference}</span>
                          <span className="text-[10px] text-slate-500">{new Date(s.surveyDate).toLocaleDateString('fr-FR')}</span>
                        </td>
                        <td className="p-3 align-top">
                          <strong className="text-slate-900 block">{s.clientName}</strong>
                          <span className="text-[10.5px] text-slate-600 block">{s.contactName}</span>
                          {s.contactEmail && <span className="text-[10px] text-slate-400 font-mono">{s.contactEmail}</span>}
                        </td>
                        <td className="p-3 align-top">
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {s.projectCode}
                          </span>
                          <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">{s.projectName}</p>
                        </td>
                        <td className="p-3 align-top text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-base font-black text-emerald-700">{s.overallScore}%</span>
                            <div className="flex gap-0.5 mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.round((s.overallScore || 0) / 20)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                            <span className="text-slate-600">Qualité : <strong className="text-slate-900">{s.qualityScore}/10</strong></span>
                            <span className="text-slate-600">Délais : <strong className="text-slate-900">{s.scheduleScore}/10</strong></span>
                            <span className="text-slate-600">HSE : <strong className="text-slate-900">{s.hseScore}/10</strong></span>
                            <span className="text-slate-600">Réactivité : <strong className="text-slate-900">{s.responsivenessScore}/10</strong></span>
                            <span className="text-slate-600 col-span-2">Recommandation : <strong className="text-slate-900">{s.recommendationScore}/10</strong></span>
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                              s.appreciation === 'EXCELLENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.appreciation === 'TRES_SATISFAISANT'
                                ? 'bg-blue-100 text-blue-800'
                                : s.appreciation === 'SATISFAISANT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {s.appreciation.replace(/_/g, ' ')}
                          </span>
                          {s.clientSignatory && (
                            <span className="block text-[9.5px] text-slate-500 mt-1 italic">
                              Signé par : {s.clientSignatory}
                            </span>
                          )}
                        </td>
                        <td className="p-3 align-top text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSurveyForPrint(s)}
                            className="px-2.5 py-1 bg-[#07164D] hover:bg-[#0B207D] text-white rounded text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Certificat A4</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL COMPARATEUR VISUEL DE VERSIONS DE CHIFFRAGE */}
      {/* ======================================================== */}
      {showCompareModal && selectedCostSheet && comparisonView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black">
                  Comparateur Analytique de Chiffrage • {selectedCostSheet.reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs">
              {/* Sélecteurs de version */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Version A (Base de référence) :</label>
                  <select
                    value={compareVersionA}
                    onChange={(e) => setCompareVersionA(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-bold"
                  >
                    {Array.from({ length: selectedCostSheet.version }, (_, i) => i + 1).map((v) => (
                      <option key={v} value={v}>
                        Version {v}.0 {v === selectedCostSheet.version ? '(Active)' : '(Archivée)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Version B (Version révisée) :</label>
                  <select
                    value={compareVersionB}
                    onChange={(e) => setCompareVersionB(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-bold"
                  >
                    {Array.from({ length: selectedCostSheet.version }, (_, i) => i + 1).map((v) => (
                      <option key={v} value={v}>
                        Version {v}.0 {v === selectedCostSheet.version ? '(Active)' : '(Archivée)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tableau comparatif des grandeurs financières */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07164D] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Indicateur Financier</th>
                      <th className="p-3 text-right">Version {compareVersionA}.0</th>
                      <th className="p-3 text-right">Version {compareVersionB}.0</th>
                      <th className="p-3 text-right">Évolution (Delta)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Prix de Vente HT Proposé</td>
                      <td className="p-3 text-right">{formatCurrencyDA(comparisonView.vA.proposedSellingPrice)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatCurrencyDA(comparisonView.vB.proposedSellingPrice)}</td>
                      <td className="p-3 text-right font-bold">
                        <span className={`inline-flex items-center gap-1 ${
                          comparisonView.deltaSellingPrice > 0 ? 'text-emerald-700' : comparisonView.deltaSellingPrice < 0 ? 'text-red-700' : 'text-slate-600'
                        }`}>
                          {comparisonView.deltaSellingPrice >= 0 ? '+' : ''}{formatCurrencyDA(comparisonView.deltaSellingPrice)} ({comparisonView.deltaSellingPricePct}%)
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-800">Coûts Directs (Matières + MO + Loc.)</td>
                      <td className="p-3 text-right">{formatCurrencyDA(comparisonView.vA.totalDirectCost)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatCurrencyDA(comparisonView.vB.totalDirectCost)}</td>
                      <td className="p-3 text-right font-bold">
                        {comparisonView.deltaDirectCost >= 0 ? '+' : ''}{formatCurrencyDA(comparisonView.deltaDirectCost)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-800">Frais Indirects</td>
                      <td className="p-3 text-right">{formatCurrencyDA(comparisonView.vA.totalIndirectCost)}</td>
                      <td className="p-3 text-right font-black text-slate-900">{formatCurrencyDA(comparisonView.vB.totalIndirectCost)}</td>
                      <td className="p-3 text-right font-bold">
                        {comparisonView.deltaIndirectCost >= 0 ? '+' : ''}{formatCurrencyDA(comparisonView.deltaIndirectCost)}
                      </td>
                    </tr>

                    <tr className="bg-slate-50 font-bold">
                      <td className="p-3 text-[#0B207D]">Coût Total Chantier (Débours)</td>
                      <td className="p-3 text-right">{formatCurrencyDA(comparisonView.vA.totalEstimatedCost)}</td>
                      <td className="p-3 text-right text-[#0B207D] font-black">{formatCurrencyDA(comparisonView.vB.totalEstimatedCost)}</td>
                      <td className="p-3 text-right font-bold">
                        {comparisonView.deltaEstimatedCost >= 0 ? '+' : ''}{formatCurrencyDA(comparisonView.deltaEstimatedCost)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-800">Marge Brute en Valeur</td>
                      <td className="p-3 text-right">{formatCurrencyDA(comparisonView.vA.estimatedMarginValue)}</td>
                      <td className="p-3 text-right font-black text-emerald-700">+{formatCurrencyDA(comparisonView.vB.estimatedMarginValue)}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        {comparisonView.deltaMarginValue >= 0 ? '+' : ''}{formatCurrencyDA(comparisonView.deltaMarginValue)}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-800">Taux de Marque (%)</td>
                      <td className="p-3 text-right">{comparisonView.vA.markupRate}%</td>
                      <td className="p-3 text-right font-black text-[#E51A1A]">{comparisonView.vB.markupRate}%</td>
                      <td className="p-3 text-right font-bold">
                        {Number(comparisonView.deltaMarkupRate) >= 0 ? '+' : ''}{comparisonView.deltaMarkupRate}%
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-bold text-slate-800">Marge sur Coût (%)</td>
                      <td className="p-3 text-right">{comparisonView.vA.marginRateOnCost}%</td>
                      <td className="p-3 text-right font-black text-[#07164D]">{comparisonView.vB.marginRateOnCost}%</td>
                      <td className="p-3 text-right font-bold">
                        {Number(comparisonView.deltaMarginRateOnCost) >= 0 ? '+' : ''}{comparisonView.deltaMarginRateOnCost}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Justification de la version B */}
              {comparisonView.vB.reason && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
                  <strong>Motif de la Révision V{compareVersionB}.0 :</strong> « {comparisonView.vB.reason} »
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-[#07164D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Fermer le Comparateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CRÉATION DE RÉVISION (VERSIONING V(n+1)) */}
      {/* ======================================================== */}
      {showRevisionModal && selectedCostSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">
                  Créer la Révision V{selectedCostSheet.version + 1}.0 • {selectedCostSheet.reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevision} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                L'état actuel <strong>V{selectedCostSheet.version}.0</strong> sera archivé dans l'historique immuable. Une nouvelle version <strong>V{selectedCostSheet.version + 1}.0</strong> sera initialisée pour permettre la révision des métrés, cotations ou marges.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motif formel de la Révision (Avenant, contre-proposition client, révision technique) :
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Motif de la révision technique ou commerciale..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#07164D]"
                />
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirmer la Création de V{selectedCostSheet.version + 1}.0
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ÉDITION CONTRIBUTION PROJET */}
      {/* ======================================================== */}
      {activeContributionModal === 'PROJECT' && projectContribForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black">Édition Contribution Service Projet • Métrés & Travaux</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description Technique des Travaux :</label>
                <textarea
                  rows={2}
                  value={projectContribForm.worksDescription}
                  onChange={(e) => setProjectContribForm({ ...projectContribForm, worksDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durée Estimée (Jours) :</label>
                  <input
                    type="number"
                    value={projectContribForm.durationDays}
                    onChange={(e) => setProjectContribForm({ ...projectContribForm, durationDays: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Contraintes Chantier / Zone ATEX :</label>
                  <input
                    type="text"
                    value={projectContribForm.constraints}
                    onChange={(e) => setProjectContribForm({ ...projectContribForm, constraints: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Moyens Techniques & Équipements :</label>
                <input
                  type="text"
                  value={projectContribForm.technicalMeans}
                  onChange={(e) => setProjectContribForm({ ...projectContribForm, technicalMeans: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>

              {/* Lignes de métrés */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Lignes de Métrés & Décomposition des Postes :</label>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectContribForm({
                        ...projectContribForm,
                        lines: [
                          ...projectContribForm.lines,
                          { id: `csl-prj-${Date.now()}`, category: 'TRAVAUX', label: '', quantity: 1, unit: 'U', unitPrice: 0, totalAmount: 0, notes: '' },
                        ],
                      });
                    }}
                    className="px-2 py-1 bg-blue-50 text-[#07164D] hover:bg-blue-100 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Ligne</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {projectContribForm.lines.map((line: any, idx: number) => (
                    <div key={line.id || idx} className="grid grid-cols-12 gap-2 p-2 bg-slate-50 rounded border border-slate-200 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={line.label}
                          placeholder="Désignation"
                          onChange={(e) => {
                            const newLines = [...projectContribForm.lines];
                            newLines[idx].label = e.target.value;
                            setProjectContribForm({ ...projectContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.quantity}
                          placeholder="Qté"
                          onChange={(e) => {
                            const newLines = [...projectContribForm.lines];
                            newLines[idx].quantity = Number(e.target.value);
                            newLines[idx].totalAmount = Number(e.target.value) * Number(newLines[idx].unitPrice || 0);
                            setProjectContribForm({ ...projectContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={line.unit}
                          placeholder="Unité (ml, m²...)"
                          onChange={(e) => {
                            const newLines = [...projectContribForm.lines];
                            newLines[idx].unit = e.target.value;
                            setProjectContribForm({ ...projectContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = projectContribForm.lines.filter((_: any, i: number) => i !== idx);
                            setProjectContribForm({ ...projectContribForm, lines: newLines });
                          }}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveContribution('PROJECT')}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enregistrer la Contribution Projet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ÉDITION CONTRIBUTION ACHATS */}
      {/* ======================================================== */}
      {activeContributionModal === 'PROCUREMENT' && procurementContribForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">Édition Contribution Service Achats • Matières & Cotations</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stratégie d'Approvisionnement :</label>
                <textarea
                  rows={2}
                  value={procurementContribForm.procurementNotes}
                  onChange={(e) => setProcurementContribForm({ ...procurementContribForm, procurementNotes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location Engins / Grues (DA) :</label>
                  <input
                    type="number"
                    value={procurementContribForm.equipmentRentalAmount}
                    onChange={(e) => setProcurementContribForm({ ...procurementContribForm, equipmentRentalAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sous-traitance CND / Spécialisée (DA) :</label>
                  <input
                    type="number"
                    value={procurementContribForm.subcontractingAmount}
                    onChange={(e) => setProcurementContribForm({ ...procurementContribForm, subcontractingAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Lignes d'achats */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Postes Matières & Fournitures Métallurgiques :</label>
                  <button
                    type="button"
                    onClick={() => {
                      setProcurementContribForm({
                        ...procurementContribForm,
                        lines: [
                          ...procurementContribForm.lines,
                          { id: `csl-ach-${Date.now()}`, category: 'MATIERES', label: '', quantity: 1, unit: 'U', unitPrice: 0, totalAmount: 0, notes: '' },
                        ],
                      });
                    }}
                    className="px-2 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Fourniture</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {procurementContribForm.lines.map((line: any, idx: number) => (
                    <div key={line.id || idx} className="grid grid-cols-12 gap-2 p-2 bg-slate-50 rounded border border-slate-200 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={line.label}
                          placeholder="Article"
                          onChange={(e) => {
                            const newLines = [...procurementContribForm.lines];
                            newLines[idx].label = e.target.value;
                            setProcurementContribForm({ ...procurementContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.quantity}
                          placeholder="Qté"
                          onChange={(e) => {
                            const newLines = [...procurementContribForm.lines];
                            newLines[idx].quantity = Number(e.target.value);
                            newLines[idx].totalAmount = Number(e.target.value) * Number(newLines[idx].unitPrice || 0);
                            setProcurementContribForm({ ...procurementContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.unitPrice}
                          placeholder="PU (DA)"
                          onChange={(e) => {
                            const newLines = [...procurementContribForm.lines];
                            newLines[idx].unitPrice = Number(e.target.value);
                            newLines[idx].totalAmount = Number(newLines[idx].quantity || 0) * Number(e.target.value);
                            setProcurementContribForm({ ...procurementContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2 text-right font-bold text-slate-900 truncate">
                        {formatCurrencyDA(line.totalAmount || 0)}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = procurementContribForm.lines.filter((_: any, i: number) => i !== idx);
                            setProcurementContribForm({ ...procurementContribForm, lines: newLines });
                          }}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveContribution('PROCUREMENT')}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enregistrer la Contribution Achats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ÉDITION CONTRIBUTION RH */}
      {/* ======================================================== */}
      {activeContributionModal === 'HR' && hrContribForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black">Édition Contribution Ressources Humaines • Débours Main-d'Œuvre</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Effectif Total (Salariés) :</label>
                  <input
                    type="number"
                    value={hrContribForm.headcount}
                    onChange={(e) => setHrContribForm({ ...hrContribForm, headcount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jours Mobilisation :</label>
                  <input
                    type="number"
                    value={hrContribForm.mobilizationDays}
                    onChange={(e) => setHrContribForm({ ...hrContribForm, mobilizationDays: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frais de Vie / Base de vie (DA) :</label>
                  <input
                    type="number"
                    value={hrContribForm.teamExpensesAmount}
                    onChange={(e) => setHrContribForm({ ...hrContribForm, teamExpensesAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Lignes MO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Effectifs Spécialisés & Corps d'État :</label>
                  <button
                    type="button"
                    onClick={() => {
                      setHrContribForm({
                        ...hrContribForm,
                        lines: [
                          ...hrContribForm.lines,
                          { id: `csl-rh-${Date.now()}`, category: 'MAIN_DOEUVRE', label: '', quantity: 1, unit: 'H/J', unitPrice: 0, totalAmount: 0, notes: '' },
                        ],
                      });
                    }}
                    className="px-2 py-1 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Profil MO</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {hrContribForm.lines.map((line: any, idx: number) => (
                    <div key={line.id || idx} className="grid grid-cols-12 gap-2 p-2 bg-slate-50 rounded border border-slate-200 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={line.label}
                          placeholder="Corps d'état / Profil"
                          onChange={(e) => {
                            const newLines = [...hrContribForm.lines];
                            newLines[idx].label = e.target.value;
                            setHrContribForm({ ...hrContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.quantity}
                          placeholder="Volume"
                          onChange={(e) => {
                            const newLines = [...hrContribForm.lines];
                            newLines[idx].quantity = Number(e.target.value);
                            newLines[idx].totalAmount = Number(e.target.value) * Number(newLines[idx].unitPrice || 0);
                            setHrContribForm({ ...hrContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={line.unitPrice}
                          placeholder="Taux (DA)"
                          onChange={(e) => {
                            const newLines = [...hrContribForm.lines];
                            newLines[idx].unitPrice = Number(e.target.value);
                            newLines[idx].totalAmount = Number(newLines[idx].quantity || 0) * Number(e.target.value);
                            setHrContribForm({ ...hrContribForm, lines: newLines });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2 text-right font-bold text-slate-900 truncate">
                        {formatCurrencyDA(line.totalAmount || 0)}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = hrContribForm.lines.filter((_: any, i: number) => i !== idx);
                            setHrContribForm({ ...hrContribForm, lines: newLines });
                          }}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveContribution('HR')}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enregistrer la Contribution RH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ÉDITION CONTRIBUTION FINANCE */}
      {/* ======================================================== */}
      {activeContributionModal === 'FINANCE' && financeContribForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black">Édition Paramètres Financiers & Rentabilité</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Taux de Marge Cible (%) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={financeContribForm.targetMarginPercent}
                    onChange={(e) => setFinanceContribForm({ ...financeContribForm, targetMarginPercent: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-black text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Besoin de Trésorerie (DA) :</label>
                  <input
                    type="number"
                    value={financeContribForm.financingNeedAmount}
                    onChange={(e) => setFinanceContribForm({ ...financeContribForm, financingNeedAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Risque Financier Client :</label>
                  <select
                    value={financeContribForm.financialRiskRating}
                    onChange={(e) => setFinanceContribForm({ ...financeContribForm, financialRiskRating: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  >
                    <option value="FAIBLE">FAIBLE (Client Solvable)</option>
                    <option value="MODERE">MODÉRÉ</option>
                    <option value="ELEVE">ÉLEVÉ</option>
                    <option value="CRITIQUE">CRITIQUE</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avis de Faisabilité :</label>
                  <select
                    value={financeContribForm.feasibilityOpinion}
                    onChange={(e) => setFinanceContribForm({ ...financeContribForm, feasibilityOpinion: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                  >
                    <option value="FAVORABLE">FAVORABLE</option>
                    <option value="RESERVE">RÉSERVE</option>
                    <option value="DEFAVORABLE">DÉFAVORABLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Modalités de Paiement Prévues :</label>
                <input
                  type="text"
                  value={financeContribForm.paymentTermsEstimated}
                  onChange={(e) => setFinanceContribForm({ ...financeContribForm, paymentTermsEstimated: e.target.value })}
                  placeholder="Ex : Acompte 30% commande, situations à 45 jours, retenue 5%"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes Financières & Clauses :</label>
                <textarea
                  rows={2}
                  value={financeContribForm.financeNotes}
                  onChange={(e) => setFinanceContribForm({ ...financeContribForm, financeNotes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveContributionModal(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveContribution('FINANCE')}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enregistrer la Contribution Finance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL TRANSITION D'ÉTAPE DU PIPELINE CRM */}
      {/* ======================================================== */}
      {showStageModal && selectedOppForStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-900">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black">
                  Transition d'Étape Pipeline • {selectedOppForStage.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStageModal(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOpportunityStage} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Affaire en cours :</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedOppForStage.title}</div>
                <div className="text-slate-600 mt-0.5">{selectedOppForStage.clientName} • Étape actuelle : <strong>{selectedOppForStage.status}</strong></div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nouvelle Étape Cible :</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.fullName} ({s.prob}% probabilité)
                    </option>
                  ))}
                </select>
              </div>

              {/* Critères obligatoires si PERDUE */}
              {targetStage === 'PERDUE' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-red-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Critère Obligatoire : Motif Formel de Perte</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Motif :</label>
                    <select
                      value={stageLossReason}
                      onChange={(e) => setStageLossReason(e.target.value)}
                      className="w-full p-2 bg-white border border-red-300 rounded text-xs font-bold text-red-900"
                    >
                      <option value="CONCURRENT_MOINS_DISANT">Concurrent Moins-Disant</option>
                      <option value="PRIX_TROP_ELEVE">Prix Jugé Trop Élevé par le Client</option>
                      <option value="DELAI_INCOMPATIBLE">Délai d'Exécution Incompatible</option>
                      <option value="CRITERES_TECHNIQUES">Critères Techniques Non Retenus</option>
                      <option value="ABANDON_CLIENT">Projet Abandonné par le Client</option>
                      <option value="AUTRE">Autre Motif Justifié</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Critères obligatoires si ANNULEE */}
              {targetStage === 'ANNULEE' && (
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-gray-600" />
                    <span>Critère Obligatoire : Motif d'Annulation</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Motif :</label>
                    <select
                      value={stageCancellationReason}
                      onChange={(e) => setStageCancellationReason(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-bold"
                    >
                      <option value="APPEL_OFFRES_INFRUCTUEUX">Appel d'Offres Déclaré Infructueux</option>
                      <option value="BUDGET_CLIENT_ANNULE">Budget Client Gelé / Annulé</option>
                      <option value="FORCE_MAJEURE">Cas de Force Majeure</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Critères obligatoires si VISITE_TECHNIQUE */}
              {targetStage === 'VISITE_TECHNIQUE' && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-900 font-bold">
                    <CheckSquare className="w-4 h-4 text-cyan-600" />
                    <span>Relevé Technique sur Site</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date de la Visite :</label>
                    <input
                      type="date"
                      value={stageSiteVisitDate}
                      onChange={(e) => setStageSiteVisitDate(e.target.value)}
                      className="w-full p-2 bg-white border border-cyan-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Conclusions / Cotes relevées :</label>
                    <input
                      type="text"
                      value={stageTechnicalNotes}
                      placeholder="Ex : Relevé de cotes contradictoire, piquage DN150 à remplacer..."
                      onChange={(e) => setStageTechnicalNotes(e.target.value)}
                      className="w-full p-2 bg-white border border-cyan-300 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes & Justification de passage :</label>
                <textarea
                  rows={2}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Justification de la transition d'étape..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Valider la Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ARBITRAGE DIRECTION GÉNÉRALE */}
      {/* ======================================================== */}
      {showArbitrageModal && selectedCostSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
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
                Vous examinez la fiche <strong>{selectedCostSheet.reference}</strong> (Version V{selectedCostSheet.version}.0) pour le client{' '}
                <strong>{selectedCostSheet.clientName}</strong>.
                <div className="mt-1">
                  Coût prévisionnel : <strong>{formatCurrencyDA(selectedCostSheet.totalEstimatedCost)}</strong> • Prix de vente proposé :{' '}
                  <strong className="text-emerald-700">{formatCurrencyDA(selectedCostSheet.proposedSellingPrice)}</strong> (Marge cible :{' '}
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
                  placeholder="Observations, conditions suspensives ou motifs de l'arbitrage Direction Générale..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#07164D]"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowArbitrageModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArbitrateDG}
                className="px-5 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
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
                  placeholder="Ex : Sonatrach, Fertial, Cosider..."
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

      {/* ======================================================== */}
      {/* MODAL APERÇU A4 DU DEVIS CLIENT IMPRIMABLE */}
      {/* ======================================================== */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden text-slate-900 my-8">
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

            <div className="p-8 space-y-6 text-xs bg-white border border-slate-200">
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

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Destinataire :</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{selectedQuoteForPrint.clientName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>Objet :</strong> {selectedQuoteForPrint.object}
                </div>
              </div>

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
      {/* MODAL NOUVELLE ENQUÊTE DE SATISFACTION (COM-12) */}
      {/* ======================================================== */}
      {showNewSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black">
                  Nouvelle Enquête de Satisfaction Client • Processus COM-12
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSurveyModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Raison Sociale Client *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sonatrach / Sonelgaz..."
                    value={newSurveyForm.clientName}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, clientName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date d'Évaluation *</label>
                  <input
                    type="date"
                    required
                    value={newSurveyForm.surveyDate}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, surveyDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Code Projet / Marché *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 0102 ou PRJ-2026-..."
                    value={newSurveyForm.projectCode}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, projectCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Intitulé du Chantier / Objet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rénovation tuyauterie HP..."
                    value={newSurveyForm.projectName}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, projectName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Contact Client *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Bouzid (Chef de Département)"
                    value={newSurveyForm.contactName}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, contactName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Contact</label>
                  <input
                    type="email"
                    placeholder="contact.technique@client.dz"
                    value={newSurveyForm.contactEmail}
                    onChange={(e) => setNewSurveyForm({ ...newSurveyForm, contactEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              {/* 5 Critères Réglementaires */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                  <span>Évaluation des 5 Critères Métier (Échelle 1 à 10)</span>
                  <span className="text-emerald-700 font-black text-xs">
                    Score Global Calculé : {Math.round(
                      ((newSurveyForm.qualityScore +
                        newSurveyForm.scheduleScore +
                        newSurveyForm.hseScore +
                        newSurveyForm.responsivenessScore +
                        newSurveyForm.recommendationScore) /
                        50) *
                        100
                    )}%
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>1. Qualité & Conformité technique :</span>
                      <span className="text-indigo-700">{newSurveyForm.qualityScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSurveyForm.qualityScore}
                      onChange={(e) => setNewSurveyForm({ ...newSurveyForm, qualityScore: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[#07164D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>2. Respect des délais & jalons :</span>
                      <span className="text-indigo-700">{newSurveyForm.scheduleScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSurveyForm.scheduleScore}
                      onChange={(e) => setNewSurveyForm({ ...newSurveyForm, scheduleScore: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[#07164D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>3. Sécurité & Protocoles HSE :</span>
                      <span className="text-indigo-700">{newSurveyForm.hseScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSurveyForm.hseScore}
                      onChange={(e) => setNewSurveyForm({ ...newSurveyForm, hseScore: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[#07164D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>4. Réactivité & Capacité d'arbitrage :</span>
                      <span className="text-indigo-700">{newSurveyForm.responsivenessScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSurveyForm.responsivenessScore}
                      onChange={(e) => setNewSurveyForm({ ...newSurveyForm, responsivenessScore: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[#07164D]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>5. Taux de Recommandation globale :</span>
                      <span className="text-indigo-700">{newSurveyForm.recommendationScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSurveyForm.recommendationScore}
                      onChange={(e) => setNewSurveyForm({ ...newSurveyForm, recommendationScore: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-[#07164D]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Signataire Client (Nom & Fonction)</label>
                <input
                  type="text"
                  placeholder="Ex: Ingénieur Superviseur Client..."
                  value={newSurveyForm.clientSignatory}
                  onChange={(e) => setNewSurveyForm({ ...newSurveyForm, clientSignatory: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Commentaires & Remarques du Client</label>
                <textarea
                  rows={2}
                  placeholder="Appréciation générale du client, points forts constatés ou axes d'amélioration..."
                  value={newSurveyForm.comments}
                  onChange={(e) => setNewSurveyForm({ ...newSurveyForm, comments: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewSurveyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={surveySubmitting}
                  className="px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white rounded text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {surveySubmitting ? 'Enregistrement...' : 'Valider & Enregistrer l’Enquête'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CERTIFICAT A4 SATISFACTION CLIENT IMPRIMABLE */}
      {/* ======================================================== */}
      {selectedSurveyForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden text-slate-900 my-8">
            <div className="bg-[#07164D] p-3 text-white flex items-center justify-between px-6">
              <span className="text-xs font-bold tracking-wide">
                CERTIFICAT DE SATISFACTION CLIENT • {selectedSurveyForPrint.reference}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSurveyForPrint(null)}
                  className="text-white/80 hover:text-white cursor-pointer ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-xs bg-white" id="printable-survey">
              {/* En-tête officiel */}
              <div className="flex justify-between items-start border-b-2 border-[#07164D] pb-4">
                <div>
                  <h1 className="text-xl font-black text-[#07164D] tracking-tight">{COMPANY_NAME}</h1>
                  <p className="text-[10px] text-slate-600 font-medium">Maintenance & Construction Industrielle</p>
                  <p className="text-[10px] text-slate-500">Réf. Normative : ISO 9001:2015 • Processus COM-12</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">FICHE D'ÉVALUATION POST-CHANTIER</span>
                  <strong className="text-sm font-mono text-[#07164D] block">{selectedSurveyForPrint.reference}</strong>
                  <span className="text-[10px] text-slate-500">
                    Date : {new Date(selectedSurveyForPrint.surveyDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Bloc Coordonnées Client & Projet */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[9.5px] font-black uppercase text-slate-500 block mb-1">Client Évaluateur</span>
                  <p className="text-sm font-bold text-slate-900">{selectedSurveyForPrint.clientName}</p>
                  <p className="text-xs text-slate-700 mt-0.5">Contact : {selectedSurveyForPrint.contactName}</p>
                  {selectedSurveyForPrint.contactEmail && (
                    <p className="text-[10px] text-slate-500 font-mono">{selectedSurveyForPrint.contactEmail}</p>
                  )}
                </div>
                <div>
                  <span className="text-[9.5px] font-black uppercase text-slate-500 block mb-1">Chantier / Projet Évalué</span>
                  <p className="text-xs font-mono font-bold text-indigo-700">{selectedSurveyForPrint.projectCode}</p>
                  <p className="text-xs font-medium text-slate-800 mt-0.5">{selectedSurveyForPrint.projectName}</p>
                </div>
              </div>

              {/* Grille d'Évaluation des 5 Critères */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07164D] text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Axe d'Évaluation Industriel</th>
                      <th className="p-2.5 text-center w-28">Note Attribuée</th>
                      <th className="p-2.5 text-center w-28">Pondération</th>
                      <th className="p-2.5 text-right w-28">Appréciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-900">1. Qualité Technique & Conformité des Travaux</strong>
                        <span className="text-[10px] text-slate-500">Respect des spécifications, PV d'épreuves, contrôles CND et traçabilité Weld Book.</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{selectedSurveyForPrint.qualityScore} / 10</td>
                      <td className="p-2.5 text-center text-slate-600">20%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{selectedSurveyForPrint.qualityScore >= 8 ? 'Très Satisfaisant' : 'Satisfaisant'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-900">2. Respect des Délais & Jalons Contractuels</strong>
                        <span className="text-[10px] text-slate-500">Ponctualité des mobilisations, respect des plannings d'arrêts et des jalons ODS.</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{selectedSurveyForPrint.scheduleScore} / 10</td>
                      <td className="p-2.5 text-center text-slate-600">20%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{selectedSurveyForPrint.scheduleScore >= 8 ? 'Très Satisfaisant' : 'Satisfaisant'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-900">3. Sécurité, Environnement & Procédures HSE</strong>
                        <span className="text-[10px] text-slate-500">Conformité réglementaire ATEX, port des EPI, causeries sécurité et zéro accident.</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{selectedSurveyForPrint.hseScore} / 10</td>
                      <td className="p-2.5 text-center text-slate-600">20%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{selectedSurveyForPrint.hseScore >= 8 ? 'Exemplaire' : 'Conforme'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-900">4. Réactivité & Capacité d'Arbitrage des Équipes</strong>
                        <span className="text-[10px] text-slate-500">Disponibilité de l'encadrement, communication de chantier et gestion des imprévus.</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{selectedSurveyForPrint.responsivenessScore} / 10</td>
                      <td className="p-2.5 text-center text-slate-600">20%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{selectedSurveyForPrint.responsivenessScore >= 8 ? 'Très Réactif' : 'Satisfaisant'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-900">5. Taux de Recommandation & Renouvellement</strong>
                        <span className="text-[10px] text-slate-500">Propension à reconduire l'entreprise pour de futurs projets ou arrêts majeurs.</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{selectedSurveyForPrint.recommendationScore} / 10</td>
                      <td className="p-2.5 text-center text-slate-600">20%</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{selectedSurveyForPrint.recommendationScore >= 8 ? 'Hautement Recommandé' : 'Favorable'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Synthèse finale du score */}
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-300">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Appréciation Globale Attribuée</span>
                  <span className="text-sm font-black text-[#07164D] uppercase">
                    {selectedSurveyForPrint.appreciation.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Score Global Pondéré</span>
                  <span className="text-2xl font-black text-emerald-700">{selectedSurveyForPrint.overallScore}%</span>
                </div>
              </div>

              {selectedSurveyForPrint.comments && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] font-black uppercase text-slate-600 block mb-1">Commentaires et Observations du Client :</span>
                  <p className="text-xs text-slate-700 italic">« {selectedSurveyForPrint.comments} »</p>
                </div>
              )}

              {/* Cadre de validation contradictoire */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-[10px]">
                <div className="text-center border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <span className="font-bold text-slate-800 block uppercase mb-1">
                    Pour SARL SILEX SERVICES
                  </span>
                  <span className="text-slate-500 block text-[9.5px]">Département Commercial & Direction Qualité</span>
                  <div className="h-16 flex items-center justify-center font-mono text-emerald-700 font-bold text-xs">
                    [VISA CONTRÔLE QUALITÉ & DIRECTION]
                  </div>
                  <span className="text-[8.5px] text-slate-400">Signature Électronique Certifiée</span>
                </div>

                <div className="text-center border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <span className="font-bold text-slate-800 block uppercase mb-1">
                    Pour le Client Évaluateur
                  </span>
                  <span className="text-slate-500 block text-[9.5px]">
                    {selectedSurveyForPrint.clientSignatory || selectedSurveyForPrint.contactName || 'Représentant Mandaté'}
                  </span>
                  <div className="h-16 flex items-center justify-center font-mono text-slate-600 font-bold text-xs">
                    [CACHE ET SIGNATURE DU CLIENT]
                  </div>
                  <span className="text-[8.5px] text-slate-400">Mention manuscrite "Bon pour acceptation"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
