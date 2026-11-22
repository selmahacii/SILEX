'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { downloadXLSX, XlsxColumn } from '@/lib/xlsx-export';
import { ComplianceModal } from '@/components/compliance-modal';
import {
  formatCurrencyDA,
  formatDateDZ,
  COMPANY_NAME,
  COMPANY_ESTABLISHED,
  IndustrialSector,
  ProjectStatus,
  ProjectRiskLevel,
} from '@silex/shared';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  Coins,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Layers,
  MapPin,
  HardHat,
  AlertTriangle,
  Percent,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ProjectReportItem {
  id: string;
  code: string;
  name: string;
  clientName: string;
  siteLocation: string;
  wilaya?: string;
  sector: string;
  pole?: string;
  managerName?: string;
  status: string;
  riskLevel?: string;
  startDate?: string;
  contractEndDate?: string;
  contractAmount: number;
  budgetAmount: number;
  revisedBudget?: number;
  committedCost?: number;
  committedBudget?: number;
  actualCost?: number;
  spentBudget?: number;
  eacCost?: number;
  physicalProgress: number;
  financialProgress: number;
  contractType?: string;
  isDemo?: boolean;
}

function resolveWilaya(p: any): string {
  if (p.wilaya && p.wilaya !== 'Alger') return p.wilaya;
  const loc = `${p.siteLocation || ''} ${p.name || ''}`.toLowerCase();
  if (loc.includes('kais') || loc.includes('khenchela')) return 'Khenchela';
  if (loc.includes('skikda')) return 'Skikda';
  if (loc.includes('arzew') || loc.includes('oran')) return 'Oran';
  if (loc.includes('annaba') || loc.includes('hadjar')) return 'Annaba';
  if (loc.includes('batna')) return 'Batna';
  if (loc.includes('ouargla') || loc.includes('hassi')) return 'Ouargla';
  if (loc.includes('alger')) return 'Alger';
  return 'Khenchela';
}

export default function ReportsPage() {
  const { activeRole } = useAuth();
  const [projects, setProjects] = useState<ProjectReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  // -------------------------------------------------------------------------
  // 3.1. FILTRES MULTI-CRITÈRES
  // -------------------------------------------------------------------------
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fiscalYear, setFiscalYear] = useState<'ALL' | '2025' | '2026'>('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [poleFilter, setPoleFilter] = useState('ALL');
  const [managerFilter, setManagerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wilayaFilter, setWilayaFilter] = useState('ALL');
  const [contractTypeFilter, setContractTypeFilter] = useState('ALL');
  const [dataSourceFilter, setDataSourceFilter] = useState<'ALL' | 'PERSISTED' | 'DEMO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFiscalYear('ALL');
    setClientFilter('ALL');
    setProjectFilter('ALL');
    setSectorFilter('ALL');
    setPoleFilter('ALL');
    setManagerFilter('ALL');
    setStatusFilter('ALL');
    setWilayaFilter('ALL');
    setContractTypeFilter('ALL');
    setDataSourceFilter('ALL');
    setSearchQuery('');
  };

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await api.get<any[]>('/projects');
        setProjects(data || []);
      } catch (err) {
        console.error('Erreur chargement projets pour rapports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [activeRole]);

  // Extraction dynamique des options de filtres uniques
  const uniqueClients = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => { if (p.clientName) set.add(p.clientName); });
    return Array.from(set).sort();
  }, [projects]);

  const uniqueSectors = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => { if (p.sector) set.add(p.sector); });
    return Array.from(set).sort();
  }, [projects]);

  const uniquePoles = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      const pole = p.pole || (p.sector === 'OIL_AND_GAS' || p.sector === 'ENERGIE' ? 'Tuyauterie & Chaudronnerie' : p.sector === 'CHIMIE' ? 'HVAC & Climatisation Industrielle' : 'Maintenance Industrielle & Mécanique');
      set.add(pole);
    });
    return Array.from(set).sort();
  }, [projects]);

  const uniqueManagers = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => { if (p.managerName) set.add(p.managerName); });
    return Array.from(set).sort();
  }, [projects]);

  const uniqueWilayas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      set.add(resolveWilaya(p));
    });
    return Array.from(set).sort();
  }, [projects]);

  // -------------------------------------------------------------------------
  // APPLICATION DES FILTRES SUR LA LISTE DES CHANTIERS
  // -------------------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // 1. Recherche textuelle libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.code?.toLowerCase().includes(q) ||
          p.name?.toLowerCase().includes(q) ||
          p.clientName?.toLowerCase().includes(q) ||
          p.siteLocation?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Dates & Exercice comptable
      if (startDate && p.startDate && p.startDate < startDate) return false;
      if (endDate && p.contractEndDate && p.contractEndDate > endDate) return false;
      if (fiscalYear !== 'ALL') {
        const startY = p.startDate ? new Date(p.startDate).getFullYear().toString() : '';
        const endY = p.contractEndDate ? new Date(p.contractEndDate).getFullYear().toString() : '';
        if (startY !== fiscalYear && endY !== fiscalYear) return false;
      }

      // 3. Client
      if (clientFilter !== 'ALL' && p.clientName !== clientFilter) return false;

      // 4. Projet
      if (projectFilter !== 'ALL' && p.code !== projectFilter) return false;

      // 5. Secteur
      if (sectorFilter !== 'ALL' && p.sector !== sectorFilter) return false;

      // 6. Pôle métier
      if (poleFilter !== 'ALL') {
        const pole = p.pole || (p.sector === 'OIL_AND_GAS' || p.sector === 'ENERGIE' ? 'Tuyauterie & Chaudronnerie' : p.sector === 'CHIMIE' ? 'HVAC & Climatisation Industrielle' : 'Maintenance Industrielle & Mécanique');
        if (pole !== poleFilter) return false;
      }

      // 7. Responsable
      if (managerFilter !== 'ALL' && p.managerName !== managerFilter) return false;

      // 8. Statut
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // 9. Wilaya
      if (wilayaFilter !== 'ALL') {
        const w = resolveWilaya(p);
        if (w !== wilayaFilter) return false;
      }

      // 10. Type de contrat
      if (contractTypeFilter !== 'ALL') {
        const ct = p.contractType || 'FORFAITAIRE';
        if (ct !== contractTypeFilter) return false;
      }

      // 11. Données Persistées (Exclusion stricte des flags démo)
      if (p.isDemo) return false;

      return true;
    });
  }, [
    projects,
    searchQuery,
    startDate,
    endDate,
    fiscalYear,
    clientFilter,
    projectFilter,
    sectorFilter,
    poleFilter,
    managerFilter,
    statusFilter,
    wilayaFilter,
    contractTypeFilter,
    dataSourceFilter,
  ]);

  const activeFiltersCount = [
    startDate,
    endDate,
    fiscalYear !== 'ALL',
    clientFilter !== 'ALL',
    projectFilter !== 'ALL',
    sectorFilter !== 'ALL',
    poleFilter !== 'ALL',
    managerFilter !== 'ALL',
    statusFilter !== 'ALL',
    wilayaFilter !== 'ALL',
    contractTypeFilter !== 'ALL',
    dataSourceFilter !== 'ALL',
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  // -------------------------------------------------------------------------
  // 3.2. CALCULS DES INDICATEURS CONSOLIDÉS & RENTABILITÉ RÉCONCILIÉE
  // -------------------------------------------------------------------------
  const kpis = useMemo(() => {
    const list = filteredProjects;
    const totalProjects = list.length;
    const activeProjects = list.filter(p => p.status === 'IN_PROGRESS' || p.status === ProjectStatus.IN_PROGRESS).length;
    const closedProjects = list.filter(p => p.status === 'COMPLETED' || p.status === 'CLOTURE' || p.status === ProjectStatus.COMPLETED).length;

    // Indicateurs contractuels
    const totalContractHT = list.reduce((acc, p) => acc + Number(p.contractAmount || 0), 0);
    const totalContractTTC = Math.round(totalContractHT * 1.19);

    // Indicateurs budgétaires
    const totalBudgetInit = list.reduce((acc, p) => acc + Number(p.budgetAmount || 0), 0);
    const totalBudgetRev = list.reduce((acc, p) => acc + Number(p.revisedBudget || p.budgetAmount || 0), 0);
    const totalCommitted = list.reduce((acc, p) => acc + Number(p.committedCost || p.committedBudget || 0), 0);
    const totalActual = list.reduce((acc, p) => acc + Number(p.actualCost || p.spentBudget || 0), 0);

    const budgetBalance = totalBudgetRev - totalActual;
    const budgetConsumptionRate = totalBudgetRev > 0 ? ((totalActual / totalBudgetRev) * 100).toFixed(1) : '0.0';

    // Coût prévisionnel final à terminaison (EAC)
    // EAC par projet : si des coûts réels et un budget révisé existent, EAC = budget révisé ajusté ou somme des engagés
    const totalEAC = list.reduce((acc, p) => {
      const bRev = Number(p.revisedBudget || p.budgetAmount || 0);
      const act = Number(p.actualCost || p.spentBudget || 0);
      const com = Number(p.committedCost || p.committedBudget || 0);
      const eac = p.eacCost || Math.max(bRev, act + Math.max(0, com - act));
      return acc + eac;
    }, 0);

    const costRemainingToCommit = Math.max(0, totalEAC - totalCommitted);

    // Marges prévisionnelle et réalisée (RÉSOLUTION DE L'ANOMALIE DU RAPPORT À 94.4%)
    // Si pas de marché contractuel ou projet en démarrage sans engagements, la marge est "Non calculable".
    // totalEAC retombe sur le budget révisé quand aucun coût réel/engagé n'existe encore : ce n'est pas un
    // coût prévisionnel à terminaison réel, donc on exige au moins un engagement ou une dépense réelle.
    const isForecastCalculable = totalContractHT > 0 && totalEAC > 0 && (totalActual > 0 || totalCommitted > 0);
    const forecastMarginDA = isForecastCalculable ? totalContractHT - totalEAC : 0;
    const forecastMarginPct = isForecastCalculable ? ((forecastMarginDA / totalContractHT) * 100).toFixed(1) : null;

    // Marge réalisée sur travaux exécutés/métrés (uniquement pour les chantiers ayant des coûts réels > 0)
    const projectsWithActuals = list.filter(p => Number(p.actualCost || p.spentBudget || 0) > 0);
    const earnedValue = projectsWithActuals.reduce((acc, p) => {
      const contract = Number(p.contractAmount || 0);
      const progress = Number(p.physicalProgress || 0);
      return acc + (contract * (progress / 100));
    }, 0);
    const actualCostOfEarned = projectsWithActuals.reduce((acc, p) => acc + Number(p.actualCost || p.spentBudget || 0), 0);

    const isRealizedCalculable = projectsWithActuals.length > 0 && earnedValue > 0 && actualCostOfEarned > 0;
    const realizedMarginDA = isRealizedCalculable ? earnedValue - actualCostOfEarned : 0;
    const realizedMarginPct = isRealizedCalculable ? ((realizedMarginDA / earnedValue) * 100).toFixed(1) : null;

    const marginVarianceDA = (isForecastCalculable && isRealizedCalculable) ? realizedMarginDA - forecastMarginDA : 0;

    const avgPhysicalProgress = totalProjects > 0
      ? (list.reduce((acc, p) => acc + Number(p.physicalProgress || 0), 0) / totalProjects).toFixed(1)
      : '0.0';
    const avgFinancialProgress = totalProjects > 0
      ? (list.reduce((acc, p) => acc + Number(p.financialProgress || 0), 0) / totalProjects).toFixed(1)
      : '0.0';

    return {
      totalProjects,
      activeProjects,
      closedProjects,
      totalContractHT,
      totalContractTTC,
      totalBudgetInit,
      totalBudgetRev,
      totalCommitted,
      totalActual,
      totalEAC,
      budgetBalance,
      budgetConsumptionRate,
      costRemainingToCommit,
      isForecastCalculable,
      forecastMarginDA,
      forecastMarginPct,
      isRealizedCalculable,
      realizedMarginDA,
      realizedMarginPct,
      marginVarianceDA,
      avgPhysicalProgress,
      avgFinancialProgress,
    };
  }, [filteredProjects]);

  // -------------------------------------------------------------------------
  // 3.5. EXPORT CSV CONFORME AVEC ENCODAGE UTF-8 BOM ET MÉTADONNÉES
  // -------------------------------------------------------------------------
  const handleExportCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const metadataLines = [
      `# ${COMPANY_NAME} — RAPPORT ANALYTIQUE CONSOLIDÉ DES CHANTIERS`,
      `# Date d'export : ${dateStr} | Édité par : Direction Contrôle de Gestion`,
      `# Périmetre : ${filteredProjects.length} chantier(s) | Exercice : ${fiscalYear} | Devise : Dinar Algérien (DZD)`,
      `# Filtres appliqués : Client=${clientFilter} | Secteur=${sectorFilter} | Wilaya=${wilayaFilter} | Statut=${statusFilter}`,
      `# CA Total HT : ${kpis.totalContractHT} DA | Budget Révisé : ${kpis.totalBudgetRev} DA | Réalisé : ${kpis.totalActual} DA | Marge Prév. : ${kpis.forecastMarginPct ? kpis.forecastMarginPct + '%' : 'Non calculable'}`,
      '',
    ];

    const headers = [
      'Code Chantier',
      'Intitulé du Projet',
      'Client Contractuel',
      'Site d\'Exécution',
      'Wilaya',
      'Secteur Industriel',
      'Pôle Métier',
      'Responsable Projet',
      'Statut',
      'Date Début',
      'Date Fin',
      'Marché HT (DA)',
      'Budget Initial (DA)',
      'Budget Révisé (DA)',
      'Engagements BC (DA)',
      'Réalisé Comptabilisé (DA)',
      'Coût EAC Final (DA)',
      'Avancement Physique (%)',
      'Avancement Financier (%)',
      'Marge Prévisionnelle (DA)',
      'Taux Marge Prév. (%)',
      'Niveau de Risque',
    ];

    const rows = filteredProjects.map(p => {
      const contract = Number(p.contractAmount || 0);
      const bInit = Number(p.budgetAmount || 0);
      const bRev = Number(p.revisedBudget || bInit);
      const comm = Number(p.committedCost || p.committedBudget || 0);
      const act = Number(p.actualCost || p.spentBudget || 0);
      const eac = p.eacCost || Math.max(bRev, act + Math.max(0, comm - act));
      const hasActivity = comm > 0 || act > 0;
      const marginDA = hasActivity ? contract - eac : 0;
      const marginPct = (hasActivity && contract > 0) ? ((marginDA / contract) * 100).toFixed(1) : 'Non calculable';
      const wilaya = resolveWilaya(p);
      const pole = p.pole || (p.sector === 'OIL_AND_GAS' || p.sector === 'ENERGIE' ? 'Tuyauterie & Chaudronnerie' : p.sector === 'CHIMIE' ? 'HVAC & Climatisation Industrielle' : 'Maintenance Industrielle & Mécanique');

      return [
        p.code,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.clientName || '').replace(/"/g, '""')}"`,
        `"${(p.siteLocation || '').replace(/"/g, '""')}"`,
        wilaya,
        p.sector,
        `"${pole}"`,
        `"${(p.managerName || 'Non assigné').replace(/"/g, '""')}"`,
        p.status,
        p.startDate || '',
        p.contractEndDate || '',
        contract,
        bInit,
        bRev,
        comm,
        act,
        eac,
        p.physicalProgress || 0,
        p.financialProgress || 0,
        marginDA,
        marginPct,
        p.riskLevel || 'LOW',
      ];
    });

    const csvContent = '\uFEFF' + metadataLines.join('\n') + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SILEX_SERVICES_RAPPORT_CONSOLIDE_CHANTIERS_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const columns: XlsxColumn[] = [
      { key: 'code', label: 'Code Marché' },
      { key: 'name', label: 'Intitulé Chantier' },
      { key: 'clientName', label: 'Client Contractuel' },
      { key: 'siteLocation', label: 'Site d\'Exécution' },
      { key: 'wilaya', label: 'Wilaya' },
      { key: 'sector', label: 'Secteur Industriel' },
      { key: 'managerName', label: 'Responsable Projet' },
      { key: 'status', label: 'Statut' },
      { key: 'contractAmount', label: 'Marché HT', type: 'currency' },
      { key: 'revisedBudget', label: 'Budget Révisé', type: 'currency' },
      { key: 'committedCost', label: 'Engagements BC', type: 'currency' },
      { key: 'actualCost', label: 'Coûts Réels', type: 'currency' },
      { key: 'eacCost', label: 'EAC Final', type: 'currency' },
      { key: 'physicalProgress', label: 'Avancement (%)', type: 'percent' },
      { key: 'forecastMargin', label: 'Marge Prév.', type: 'currency' },
    ];

    const rows = filteredProjects.map(p => {
      const contract = Number(p.contractAmount || 0);
      const bRev = Number(p.revisedBudget || p.budgetAmount || 0);
      const comm = Number(p.committedCost || p.committedBudget || 0);
      const act = Number(p.actualCost || p.spentBudget || 0);
      const eac = p.eacCost || Math.max(bRev, act + Math.max(0, comm - act));
      const hasActivity = comm > 0 || act > 0;
      const margin = hasActivity ? contract - eac : 0;
      const progress = Number(p.physicalProgress || 0) / 100;

      return {
        code: p.code,
        name: p.name,
        clientName: p.clientName,
        siteLocation: p.siteLocation,
        wilaya: resolveWilaya(p),
        sector: p.sector,
        managerName: p.managerName || 'Non assigné',
        status: p.status,
        contractAmount: contract,
        revisedBudget: bRev,
        committedCost: comm,
        actualCost: act,
        eacCost: eac,
        physicalProgress: progress,
        forecastMargin: margin,
      };
    });

    downloadXLSX(`SILEX_RAPPORT_CHANTIERS_${dateStr}.xlsx`, {
      sheetName: 'Chantiers SILEX',
      columns,
      rows,
      companyName: COMPANY_NAME,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0B207D]" />
            Rapports Consolidés & Contrôle de Gestion SILEX SERVICES
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Analyses multidimensionnelles des marges, coûts réels, prévisions EAC et indicateurs contractuels chantiers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors shadow-2xs cursor-pointer ${
              showFilters ? 'bg-blue-50 border-blue-200 text-[#0B207D]' : 'bg-white border-[#E1E6ED] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres ({activeFiltersCount})</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1E6ED] text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Export CSV structuré avec BOM UTF-8 conforme Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer"
            title="Export classeur natif Excel (.xlsx) avec styles et formats monétaires DZD"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded-md hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
            title="Générer un PDF officiel prêt pour impression et visa"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
          <button
            onClick={() => setShowComplianceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
            title="Consulter et générer la Fiche de Conformité aux 5 modules du Cahier des Charges Silex"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Fiche de Conformité (5 Modules)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3.1. PANNEAU DE FILTRES MULTI-CRITÈRES ÉTENDU */}
      {/* ========================================================================= */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-3 no-print">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0B207D]" />
              <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Filtres Analytiques & Périmètre de Consolidation
              </span>
              {activeFiltersCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0B207D]">
                  {activeFiltersCount} actif(s)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser les filtres</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {/* Recherche textuelle */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Recherche libre :
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Code, intitulé, client, site..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D]"
                />
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Client Maître d'Ouvrage :
              </label>
              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les clients ({uniqueClients.length})</option>
                {uniqueClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Wilaya */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Wilaya d'Exécution :
              </label>
              <select
                value={wilayaFilter}
                onChange={e => setWilayaFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Toutes les wilayas</option>
                {uniqueWilayas.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Secteur Industriel */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Secteur Industriel :
              </label>
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les secteurs</option>
                {uniqueSectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Pôle Métier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Pôle Métier SILEX :
              </label>
              <select
                value={poleFilter}
                onChange={e => setPoleFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les pôles métier</option>
                {uniquePoles.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Statut Chantier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Statut du Chantier :
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PLANNING">Planification</option>
                <option value="IN_PROGRESS">En cours d'exécution</option>
                <option value="ON_HOLD">Suspendu / En attente</option>
                <option value="COMPLETED">Clôturé / Réceptionné</option>
              </select>
            </div>

            {/* Responsable Projet */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Responsable Projet :
              </label>
              <select
                value={managerFilter}
                onChange={e => setManagerFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les chefs de projet</option>
                {uniqueManagers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Exercice Comptable */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Exercice Comptable :
              </label>
              <select
                value={fiscalYear}
                onChange={e => setFiscalYear(e.target.value as any)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les exercices</option>
                <option value="2026">Exercice 2026</option>
                <option value="2025">Exercice 2025</option>
              </select>
            </div>

            {/* Période Début */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Période de Début :
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              />
            </div>

            {/* Période Fin */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Période de Fin :
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              />
            </div>

            {/* Type de Contrat */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Type de Contrat :
              </label>
              <select
                value={contractTypeFilter}
                onChange={e => setContractTypeFilter(e.target.value)}
                className="w-full p-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-[#0B207D] bg-white"
              >
                <option value="ALL">Tous les types</option>
                <option value="FORFAITAIRE">Marché Forfaitaire</option>
                <option value="BORDEREAU_PRIX">Bordereau de Prix Unitaires (BPU)</option>
                <option value="REGIE">Régie Contrôlée</option>
              </select>
            </div>

            {/* Source de Données */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Source de Données :
              </label>
              <div className="flex items-center gap-1.5 p-1.5 rounded border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Données Réelles Persistées (Neon DB)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.2. INDICATEURS STRUCTURÉS PAR CATÉGORIES (FINANCE, BUDGET, COÛTS, RENTABILITÉ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. INDICATEURS CONTRACTUELS */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697789] uppercase tracking-wider">
              1. Volume Contractuel
            </span>
            <Building className="w-4 h-4 text-[#0B207D]" />
          </div>
          <div className="text-xl font-black text-[#07164D]">
            {formatCurrencyDA(kpis.totalContractHT, false)} HT
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
            <div>TTC (TVA 19%) : <strong className="font-mono text-slate-800">{formatCurrencyDA(kpis.totalContractTTC, false)}</strong></div>
            <div>Chantiers actifs : <strong className="text-[#0B207D]">{kpis.activeProjects}</strong> / {kpis.totalProjects} total ({kpis.closedProjects} clôturé(s))</div>
          </div>
        </div>

        {/* 2. INDICATEURS BUDGÉTAIRES */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697789] uppercase tracking-wider">
              2. Budget & Engagements
            </span>
            <Coins className="w-4 h-4 text-[#0A7F7C]" />
          </div>
          <div className="text-xl font-black text-[#0B207D]">
            {formatCurrencyDA(kpis.totalBudgetRev, false)}
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
            <div>Engagements BC validés : <strong className="font-mono text-amber-700">{formatCurrencyDA(kpis.totalCommitted, false)}</strong></div>
            <div>Solde disponible : <strong className="font-mono text-emerald-700">{formatCurrencyDA(Math.max(0, kpis.budgetBalance), false)}</strong></div>
            <div>Taux conso. budget : <strong className="text-slate-800">{kpis.budgetConsumptionRate}%</strong></div>
          </div>
        </div>

        {/* 3. INDICATEURS DE COÛTS & EAC */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697789] uppercase tracking-wider">
              3. Coûts Réels & EAC
            </span>
            <Layers className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCurrencyDA(kpis.totalActual, false)}
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
            <div>Coût final à terminaison (EAC) : <strong className="font-mono text-slate-900">{formatCurrencyDA(kpis.totalEAC, false)}</strong></div>
            <div>Reste à engager : <strong className="font-mono text-slate-700">{formatCurrencyDA(kpis.costRemainingToCommit, false)}</strong></div>
            <div>Avancement physique moy. : <strong className="text-emerald-700">{kpis.avgPhysicalProgress}%</strong> (Financier: {kpis.avgFinancialProgress}%)</div>
          </div>
        </div>

        {/* 4. INDICATEURS DE RENTABILITÉ (FIX ANOMALIE 94.4%) */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697789] uppercase tracking-wider">
              4. Rentabilité & Marges
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-emerald-700">
            {kpis.isForecastCalculable ? `+${kpis.forecastMarginPct}%` : 'Non calculable'}
          </div>
          <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
            {kpis.isForecastCalculable ? (
              <>
                <div>Marge prévisionnelle : <strong className="font-mono text-emerald-800">+{formatCurrencyDA(kpis.forecastMarginDA, false)}</strong></div>
                <div>Marge réalisée (métrés) : <strong className="font-mono text-slate-800">{kpis.isRealizedCalculable ? `+${kpis.realizedMarginPct}%` : 'Données insuffisantes'}</strong></div>
                <div className="text-[10px] text-emerald-700 font-semibold">Calculée selon CA - EAC (non faussée)</div>
              </>
            ) : (
              <div className="text-amber-700 font-medium">
                Données insuffisantes : aucun coût ou budget prévisionnel engagé.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3.3 & 3.4. TABLEAU ANALYTIQUE DES CHANTIERS CONFORME AUX SPÉCIFICATIONS */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-6 print:border-none print:p-0">
        {/* Document Header for Official Audit / Print */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b-2 border-slate-200 gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs shrink-0">
              <img
                src="/logo-silex.png"
                alt="SILEX SERVICES"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-black text-[#07164D] tracking-wide">
                {COMPANY_NAME}
              </div>
              <div className="text-xs font-extrabold text-[#0B207D] uppercase tracking-wider mt-0.5">
                ÉTAT ANALYTIQUE CONSOLIDÉ DES CHANTIERS & PROJETS INDUSTRIELS
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Contrôle de Gestion • Engagements Financiers, Coûts Réels & Analyse de Rentabilité
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Services & Maintenance Industrielle • Depuis {COMPANY_ESTABLISHED} • Siège social Algérie
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 shrink-0 space-y-0.5">
            <div>Réf Audit : <strong className="font-mono text-[#0B207D]">RAP-2026-CONSOLIDE-01</strong></div>
            <div>Édité le : <strong>{formatDateDZ(new Date())}</strong></div>
            <div>Devise : <strong className="text-[#0B207D]">Dinar Algérien (DA)</strong></div>
            <div>Périmètre : <strong className="text-slate-800">{filteredProjects.length} chantier(s) sélectionné(s)</strong></div>
          </div>
        </div>

        {/* Filtres appliqués affichés dans le rapport d'impression */}
        {activeFiltersCount > 0 && (
          <div className="p-2.5 bg-blue-50/50 rounded border border-blue-200 text-[11px] text-[#07164D] flex flex-wrap items-center gap-3">
            <span className="font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#0B207D]" />
              Filtres actifs :
            </span>
            {clientFilter !== 'ALL' && <span>Client : <strong>{clientFilter}</strong></span>}
            {wilayaFilter !== 'ALL' && <span>Wilaya : <strong>{wilayaFilter}</strong></span>}
            {sectorFilter !== 'ALL' && <span>Secteur : <strong>{sectorFilter}</strong></span>}
            {poleFilter !== 'ALL' && <span>Pôle : <strong>{poleFilter}</strong></span>}
            {statusFilter !== 'ALL' && <span>Statut : <strong>{statusFilter}</strong></span>}
            {fiscalYear !== 'ALL' && <span>Exercice : <strong>{fiscalYear}</strong></span>}
            {searchQuery && <span>Mot-clé : <strong>« {searchQuery} »</strong></span>}
          </div>
        )}

        {/* Tableau analytique 21 colonnes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#07164D] text-white font-semibold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-2">Code</th>
                <th className="py-2.5 px-2.5">Intitulé du Projet</th>
                <th className="py-2.5 px-2">Client Contractuel</th>
                <th className="py-2.5 px-2">Site</th>
                <th className="py-2.5 px-1.5">Wilaya</th>
                <th className="py-2.5 px-1.5">Secteur</th>
                <th className="py-2.5 px-2">Pôle Métier</th>
                <th className="py-2.5 px-2">Responsable</th>
                <th className="py-2.5 px-1.5 text-center">Statut</th>
                <th className="py-2.5 px-2 text-right">Marché HT</th>
                <th className="py-2.5 px-2 text-right">Budget Rév.</th>
                <th className="py-2.5 px-2 text-right">Engagements</th>
                <th className="py-2.5 px-2 text-right">Réalisé</th>
                <th className="py-2.5 px-2 text-right">EAC</th>
                <th className="py-2.5 px-1.5 text-center">Physique</th>
                <th className="py-2.5 px-1.5 text-center">Financier</th>
                <th className="py-2.5 px-2 text-right">Marge Prév.</th>
                <th className="py-2.5 px-1.5 text-center">Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    Chargement et consolidation analytique des chantiers...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    Aucun chantier ne correspond aux critères de filtre sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, idx) => {
                  const contract = Number(p.contractAmount || 0);
                  const bInit = Number(p.budgetAmount || 0);
                  const bRev = Number(p.revisedBudget || bInit);
                  const comm = Number(p.committedCost || p.committedBudget || 0);
                  const act = Number(p.actualCost || p.spentBudget || 0);
                  const eac = p.eacCost || Math.max(bRev, act + Math.max(0, comm - act));
                  const hasActivity = comm > 0 || act > 0;
                  const marginDA = hasActivity ? contract - eac : 0;
                  const marginPct = (hasActivity && contract > 0) ? ((marginDA / contract) * 100).toFixed(1) : null;
                  const wilaya = resolveWilaya(p);
                  const pole = p.pole || (p.sector === 'OIL_AND_GAS' || p.sector === 'ENERGIE' ? 'Tuyauterie & Chaudronnerie' : p.sector === 'CHIMIE' ? 'HVAC & Climatisation Industrielle' : 'Maintenance Industrielle & Mécanique');
                  const isHighRisk = p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === ProjectRiskLevel.HIGH || p.riskLevel === ProjectRiskLevel.CRITICAL;

                  return (
                    <tr
                      key={p.id || p.code}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/60'}
                    >
                      {/* Code */}
                      <td className="py-2.5 px-2 font-mono font-bold text-[#0B207D]">
                        <Link
                          href={`/projects/${p.code}`}
                          className="hover:underline flex items-center gap-0.5"
                          title={`Ouvrir le chantier ${p.code}`}
                        >
                          {p.code}
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400 no-print" />
                        </Link>
                      </td>

                      {/* Intitulé */}
                      <td className="py-2.5 px-2.5 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate" title={p.name}>
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.startDate ? formatDateDZ(p.startDate) : '-'} → {p.contractEndDate ? formatDateDZ(p.contractEndDate) : '-'}
                        </div>
                      </td>

                      {/* Client Contractuel */}
                      <td className="py-2.5 px-2 font-semibold text-slate-800">
                        {p.clientName}
                      </td>

                      {/* Site d'Exécution (Distingue du client selon 3.4) */}
                      <td className="py-2.5 px-2 text-slate-600 max-w-[140px] truncate" title={p.siteLocation}>
                        {p.siteLocation}
                      </td>

                      {/* Wilaya */}
                      <td className="py-2.5 px-1.5 font-medium text-slate-700">
                        {wilaya}
                      </td>

                      {/* Secteur */}
                      <td className="py-2.5 px-1.5 text-slate-600">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p.sector}
                        </span>
                      </td>

                      {/* Pôle Métier */}
                      <td className="py-2.5 px-2 text-slate-700 text-[10.5px]">
                        {pole}
                      </td>

                      {/* Responsable */}
                      <td className="py-2.5 px-2 text-slate-600 text-[10.5px]">
                        {p.managerName || 'Non assigné'}
                      </td>

                      {/* Statut */}
                      <td className="py-2.5 px-1.5 text-center">
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          p.status === 'IN_PROGRESS' || p.status === ProjectStatus.IN_PROGRESS
                            ? 'bg-blue-100 text-[#0B207D]'
                            : p.status === 'COMPLETED' || p.status === 'CLOTURE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.status === 'IN_PROGRESS' ? 'En cours' : p.status === 'COMPLETED' ? 'Clôturé' : p.status === 'PLANNING' ? 'Planif.' : p.status}
                        </span>
                      </td>

                      {/* Marché HT */}
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900 font-mono">
                        {formatCurrencyDA(contract, false)}
                      </td>

                      {/* Budget Révisé */}
                      <td className="py-2.5 px-2 text-right text-slate-700 font-mono">
                        {formatCurrencyDA(bRev, false)}
                      </td>

                      {/* Commandes Engagées */}
                      <td className="py-2.5 px-2 text-right font-mono text-amber-800">
                        {formatCurrencyDA(comm, false)}
                      </td>

                      {/* Réalisé */}
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#0A7F7C]">
                        {formatCurrencyDA(act, false)}
                      </td>

                      {/* EAC */}
                      <td className="py-2.5 px-2 text-right font-mono text-slate-900 font-semibold">
                        {formatCurrencyDA(eac, false)}
                      </td>

                      {/* Avancement Physique */}
                      <td className="py-2.5 px-1.5 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {p.physicalProgress || 0}%
                        </span>
                      </td>

                      {/* Avancement Financier */}
                      <td className="py-2.5 px-1.5 text-center text-slate-600 font-medium">
                        {p.financialProgress || 0}%
                      </td>

                      {/* Marge Prévisionnelle (DA & %) */}
                      <td className="py-2.5 px-2 text-right">
                        {marginPct !== null ? (
                          <div>
                            <div className="font-mono font-bold text-emerald-700">+{marginPct}%</div>
                            <div className="text-[9.5px] text-slate-500">{formatCurrencyDA(marginDA, false)}</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-medium block">Non calculable</span>
                            <span className="text-[9px] text-slate-400 italic">En attente d'engagements</span>
                          </div>
                        )}
                      </td>

                      {/* Risque */}
                      <td className="py-2.5 px-1.5 text-center">
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isHighRisk
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : p.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {p.riskLevel || 'LOW'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
              <tr>
                <td colSpan={9} className="py-3 px-3 uppercase text-right">
                  Totaux Périmètre Analysé ({filteredProjects.length} chantiers) :
                </td>
                <td className="py-3 px-2 text-right text-[#07164D] font-black font-mono">
                  {formatCurrencyDA(kpis.totalContractHT, false)}
                </td>
                <td className="py-3 px-2 text-right text-slate-700 font-mono">
                  {formatCurrencyDA(kpis.totalBudgetRev, false)}
                </td>
                <td className="py-3 px-2 text-right text-amber-800 font-mono">
                  {formatCurrencyDA(kpis.totalCommitted, false)}
                </td>
                <td className="py-3 px-2 text-right text-[#0A7F7C] font-black font-mono">
                  {formatCurrencyDA(kpis.totalActual, false)}
                </td>
                <td className="py-3 px-2 text-right text-slate-900 font-black font-mono">
                  {formatCurrencyDA(kpis.totalEAC, false)}
                </td>
                <td className="py-3 px-1.5 text-center text-emerald-800 font-black">
                  {kpis.avgPhysicalProgress}%
                </td>
                <td className="py-3 px-1.5 text-center text-slate-700 font-semibold">
                  {kpis.avgFinancialProgress}%
                </td>
                <td className="py-3 px-2 text-right text-emerald-800 font-black font-mono">
                  {kpis.isForecastCalculable ? `+${kpis.forecastMarginPct}%` : '-'}
                </td>
                <td className="py-3 px-1.5 text-center text-slate-500 text-[10px]">
                  CONSOLIDÉ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Executive Approvals & Visa Block (Conforme pour impression PDF) */}
        <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-12 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              Direction Financière & Contrôle de Gestion
            </div>
            <div className="text-[10px] text-slate-400 italic">
              « Certifié sincère et conforme aux engagements d'achat, décomptes métrés et relevés bancaires »
              <br />
              Visa, Date & Mention
            </div>
          </div>
          <div className="space-y-12 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              Direction Générale SILEX SERVICES
            </div>
            <div className="text-[10px] text-slate-400 italic">
              « Approbation formelle pour présentation au Comité de Direction & Conseil d'Administration »
              <br />
              Signature & Cachet Officiel
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fiche de Conformité au Cahier des Charges */}
      <ComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
      />
    </div>
  );
}
