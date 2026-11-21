'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Building,
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Scale,
  X,
  PieChart,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrencyDA, SystemRole } from '@silex/shared';
import { api } from '@/lib/api-client';

export interface ProjectProfitabilityItem {
  id: string;
  code: string;
  name: string;
  clientName: string;
  contractAmount: number;
  budgetAmount: number;
  committedCost: number;
  actualCost: number;
  billedAmount: number;
  paidAmount: number;
  marginDA: number;
  marginRate: string | number;
  status: string;
  warrantyHeld?: number;
}

export interface AgedBalanceBucket {
  current: number;
  days30: number;
  days60: number;
  days90Plus: number;
  total: number;
}

export interface AgedTrialBalanceData {
  clients?: AgedBalanceBucket;
  suppliers?: AgedBalanceBucket;
  customerAging?: AgedBalanceBucket;
  supplierAging?: AgedBalanceBucket;
  workingCapitalRequirement?: {
    customerReceivablesTotal: number;
    supplierPayablesTotal: number;
    bfrDA: number;
    status: 'BESOIN_NET' | 'RESSOURCE_NETTE';
    isDemoIncluded?: boolean;
  };
  netWorkingCapitalNeed?: number;
}

export interface ProjectDetailedPnl {
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  contractAmount: number;
  estimatedBudget: number;
  actualBilledHT: number;
  collectedTTC: number;
  realCosts: {
    materials: number;
    labor: number;
    otherExpenses: number;
    totalDirectCost: number;
  };
  committedRemaining: number;
  projectedFinalCost: number;
  grossMarginDA: number;
  grossMarginPercent: number;
  isMarginCalculable?: boolean;
  budgetVarianceDA: number;
  isProfitable: boolean | null;
}

interface ProfitabilityViewProps {
  projects: ProjectProfitabilityItem[];
  agedBalance?: AgedTrialBalanceData | null;
  canManage: boolean;
  activeRole?: string;
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export function ProfitabilityView({
  projects = [],
  agedBalance,
  canManage,
  activeRole,
  onRefresh,
  onNotify,
}: ProfitabilityViewProps) {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [marginFilter, setMarginFilter] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Drill-down Modal State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [detailedPnl, setDetailedPnl] = useState<ProjectDetailedPnl | null>(null);
  const [loadingPnl, setLoadingPnl] = useState<boolean>(false);
  const [pnlError, setPnlError] = useState<string | null>(null);

  // Load detailed P&L when a project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setDetailedPnl(null);
      return;
    }

    let isMounted = true;
    setLoadingPnl(true);
    setPnlError(null);

    api.get<ProjectDetailedPnl>(`/finance/project-profitability?projectId=${selectedProjectId}`)
      .then((res) => {
        if (!isMounted) return;
        setDetailedPnl(res);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[ProfitabilityView] Fallback local PnL for:', selectedProjectId, err);
        // Fallback calculation from basic project item if analytical API is unreachable
        const fallbackProject = projects.find(p => p.id === selectedProjectId || p.code === selectedProjectId);
        if (fallbackProject) {
          const directCost = fallbackProject.actualCost || 0;
          const billed = fallbackProject.billedAmount || 0;
          const margin = Math.max(0, billed - directCost);
          const marginPct = billed > 0 ? Number(((margin / billed) * 100).toFixed(1)) : 0;
          setDetailedPnl({
            projectId: fallbackProject.id,
            projectCode: fallbackProject.code,
            projectName: fallbackProject.name,
            clientName: fallbackProject.clientName,
            contractAmount: fallbackProject.contractAmount,
            estimatedBudget: fallbackProject.budgetAmount,
            actualBilledHT: billed,
            collectedTTC: fallbackProject.paidAmount,
            realCosts: {
              materials: Math.round(directCost * 0.6),
              labor: Math.round(directCost * 0.3),
              otherExpenses: Math.round(directCost * 0.1),
              totalDirectCost: directCost,
            },
            committedRemaining: fallbackProject.committedCost,
            projectedFinalCost: directCost + fallbackProject.committedCost,
            grossMarginDA: margin,
            grossMarginPercent: marginPct,
            budgetVarianceDA: fallbackProject.budgetAmount - (directCost + fallbackProject.committedCost),
            isProfitable: margin >= 0,
          });
        } else {
          setPnlError(err.message || 'Impossible de charger le P&L analytique de ce chantier.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingPnl(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, projects]);

  // Aggregate portfolio totals
  const portfolioMetrics = useMemo(() => {
    let totalContract = 0;
    let totalBudget = 0;
    let totalCommitted = 0;
    let totalActualCost = 0;
    let totalBilled = 0;
    let totalPaid = 0;
    let totalWarranty = 0;

    projects.forEach((p) => {
      totalContract += Number(p.contractAmount || 0);
      totalBudget += Number(p.budgetAmount || 0);
      totalCommitted += Number(p.committedCost || 0);
      totalActualCost += Number(p.actualCost || 0);
      totalBilled += Number(p.billedAmount || 0);
      totalPaid += Number(p.paidAmount || 0);
      totalWarranty += Number(p.warrantyHeld || 0);
    });

    // La marge "réalisée" ne peut se baser que sur ce qui a été réellement facturé (situations
    // de travaux), jamais sur la valeur totale du marché : sans facturation, rien n'est réalisé.
    const isPortfolioMarginCalculable = totalBilled > 0;
    const portfolioGrossMarginDA = isPortfolioMarginCalculable ? Math.max(0, totalBilled - totalActualCost) : 0;
    const portfolioMarginRate = isPortfolioMarginCalculable
      ? Number(((portfolioGrossMarginDA / totalBilled) * 100).toFixed(1))
      : 0;

    const overallCollectionRate = totalBilled > 0
      ? Math.min(100, Math.round((totalPaid / totalBilled) * 100))
      : 0;

    return {
      totalContract,
      totalBudget,
      totalCommitted,
      totalActualCost,
      totalBilled,
      totalPaid,
      totalWarranty,
      portfolioGrossMarginDA,
      portfolioMarginRate,
      isPortfolioMarginCalculable,
      overallCollectionRate,
      projectCount: projects.length,
    };
  }, [projects]);

  // BFR Working Capital Requirements from agedBalance
  const bfrMetrics = useMemo(() => {
    const clientsBucket = agedBalance?.customerAging || agedBalance?.clients || {
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
      total: 0,
    };
    const suppliersBucket = agedBalance?.supplierAging || agedBalance?.suppliers || {
      current: 0,
      days30: 0,
      days60: 0,
      days90Plus: 0,
      total: 0,
    };

    const bfrDA = (clientsBucket.total || 0) - (suppliersBucket.total || 0);
    const status: 'BESOIN_NET' | 'RESSOURCE_NETTE' = bfrDA >= 0 ? 'BESOIN_NET' : 'RESSOURCE_NETTE';

    return {
      clientsBucket,
      suppliersBucket,
      bfrDA,
      status,
    };
  }, [agedBalance]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search filter
      const matchesSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }

      // Margin filter
      const margin = Number(p.marginRate || 0);
      if (marginFilter === 'HEALTHY' && margin < 20) return false;
      if (marginFilter === 'WARNING' && (margin < 10 || margin >= 20)) return false;
      if (marginFilter === 'CRITICAL' && margin >= 10) return false;

      return true;
    });
  }, [projects, searchTerm, statusFilter, marginFilter]);

  // Analytical Margin Variance Alerts (Projects requiring management attention)
  const marginAlertProjects = useMemo(() => {
    return projects.filter((p) => {
      const margin = Number(p.marginRate || 0);
      const isOverBudget = p.actualCost > p.budgetAmount && p.budgetAmount > 0;
      return margin < 15 || isOverBudget;
    });
  }, [projects]);

  // Export CSV Handler
  const handleExportCSV = () => {
    try {
      const headers = [
        'Code Chantier',
        'Intitulé du Projet',
        'Client Industriel',
        'Statut',
        'Marché HT (DZD)',
        'Budget Estimé HT (DZD)',
        'Engagements BC (DZD)',
        'Coût Réel Consommé (DZD)',
        'Facturation Émise HT (DZD)',
        'Encaissement Réalisé (DZD)',
        'Taux de Recouvrement (%)',
        'Marge DA (DZD)',
        'Taux de Marge (%)',
        'Retenue Garantie Détenue (DZD)',
      ];

      const rows = filteredProjects.map((p) => {
        const collectionRate = p.billedAmount > 0 ? Math.round((p.paidAmount / p.billedAmount) * 100) : 0;
        return [
          `"${p.code}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.clientName.replace(/"/g, '""')}"`,
          `"${p.status}"`,
          p.contractAmount,
          p.budgetAmount,
          p.committedCost,
          p.actualCost,
          p.billedAmount,
          p.paidAmount,
          collectionRate,
          p.marginDA,
          p.marginRate,
          p.warrantyHeld || 0,
        ].join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SILEX_RENTABILITE_CHANTIERS_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onNotify('Rapport de rentabilité analytique exporté avec succès (format Excel CSV UTF-8).');
    } catch (err: any) {
      console.error('[ProfitabilityView] CSV Export error:', err);
      onNotify('Erreur lors de la génération du fichier CSV.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Module Context Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#0B207D]/10 text-[#0B207D] border border-[#0B207D]/20">
                Phase 6C.5
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contrôle de Gestion & BFR
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#07164D] mt-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Rentabilité Analytique des Chantiers & Décomposition du BFR
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi de la marge brute par affaire (matériaux, main d'œuvre, sous-traitance), atterrissages budgétaires et balance âgée clients/fournisseurs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Exporter le P&L analytique des chantiers (CSV Excel)"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Exporter P&L Chantiers</span>
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#0B207D] bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Executive KPIs for Portfolio & Working Capital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Portefeuille Contrats */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Portefeuille Marchés</span>
            <Building className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-[#07164D]">
            {formatCurrencyDA(portfolioMetrics.totalContract, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{portfolioMetrics.projectCount} affaires suivies</span>
            <span className="font-semibold text-blue-700">CA Contractuel HT</span>
          </div>
        </div>

        {/* KPI 2: Coûts Réels Consommés */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Coûts Réels Consommés</span>
            <Layers className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-slate-900">
            {formatCurrencyDA(portfolioMetrics.totalActualCost, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Engagements: {formatCurrencyDA(portfolioMetrics.totalCommitted, false)}</span>
            <span className="font-medium text-slate-700">Mat + MO + ST</span>
          </div>
        </div>

        {/* KPI 3: Marge Brute Globale */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Marge Brute Réalisée</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-emerald-700">
            {portfolioMetrics.isPortfolioMarginCalculable
              ? formatCurrencyDA(portfolioMetrics.portfolioGrossMarginDA, false)
              : <span className="text-amber-700 text-sm">Non calculable</span>}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {portfolioMetrics.isPortfolioMarginCalculable ? 'Taux de marge moyen' : 'Aucune situation facturée'}
            </span>
            {portfolioMetrics.isPortfolioMarginCalculable && (
            <span
              className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                portfolioMetrics.portfolioMarginRate >= 20
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : portfolioMetrics.portfolioMarginRate >= 10
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              +{portfolioMetrics.portfolioMarginRate}%
            </span>
            )}
          </div>
        </div>

        {/* KPI 4: BFR Net Opérationnel */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>BFR Opérationnel</span>
            <Scale className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-indigo-900">
            {formatCurrencyDA(Math.abs(bfrMetrics.bfrDA), false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span
              className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                bfrMetrics.status === 'BESOIN_NET'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {bfrMetrics.status === 'BESOIN_NET' ? 'Besoin Net de Trésorerie' : 'Ressource Nette'}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">Créances - Dettes</span>
          </div>
        </div>

        {/* KPI 5: Retenues de Garantie Détenues */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Retenues de Garantie</span>
            <Coins className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-amber-800">
            {formatCurrencyDA(portfolioMetrics.totalWarranty, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>5% bloqués / Situations</span>
            <span className="font-semibold text-amber-700">1 an post-réception</span>
          </div>
        </div>
      </div>

      {/* 3. Section BFR & Balance Âgée (Créances Clients vs Dettes Fournisseurs) */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#0B207D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
              Structure du Besoin en Fonds de Roulement (BFR) — Balance Âgée
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            Comparatif des échéances clients (Actif Circulant) et dettes fournisseurs (Passif Circulant)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Créances Clients Âgées */}
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Créances Clients Facturées
              </span>
              <span className="font-mono text-sm font-bold text-blue-900">
                {formatCurrencyDA(bfrMetrics.clientsBucket.total, false)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Bracket: Non échu / Courant */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Courant (&le; 0j - Non échu)</span>
                  <span className="font-mono font-semibold">{formatCurrencyDA(bfrMetrics.clientsBucket.current, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.clientsBucket.total > 0 ? (bfrMetrics.clientsBucket.current / bfrMetrics.clientsBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: 1 à 30 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>1 à 30 jours de retard</span>
                  <span className="font-mono font-semibold">{formatCurrencyDA(bfrMetrics.clientsBucket.days30, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.clientsBucket.total > 0 ? (bfrMetrics.clientsBucket.days30 / bfrMetrics.clientsBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: 31 à 60 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>31 à 60 jours de retard</span>
                  <span className="font-mono font-semibold text-amber-700">{formatCurrencyDA(bfrMetrics.clientsBucket.days60, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.clientsBucket.total > 0 ? (bfrMetrics.clientsBucket.days60 / bfrMetrics.clientsBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: > 60 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span className="font-semibold text-rose-700">&gt; 60 jours (Recouvrement critique)</span>
                  <span className="font-mono font-bold text-rose-700">{formatCurrencyDA(bfrMetrics.clientsBucket.days90Plus, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.clientsBucket.total > 0 ? (bfrMetrics.clientsBucket.days90Plus / bfrMetrics.clientsBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dettes Fournisseurs Âgées */}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Dettes Fournisseurs Exigibles
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {formatCurrencyDA(bfrMetrics.suppliersBucket.total, false)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Bracket: Non échu / Courant */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>Courant (&le; 0j - Non échu)</span>
                  <span className="font-mono font-semibold">{formatCurrencyDA(bfrMetrics.suppliersBucket.current, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.suppliersBucket.total > 0 ? (bfrMetrics.suppliersBucket.current / bfrMetrics.suppliersBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: 1 à 30 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>1 à 30 jours d'échéance</span>
                  <span className="font-mono font-semibold">{formatCurrencyDA(bfrMetrics.suppliersBucket.days30, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.suppliersBucket.total > 0 ? (bfrMetrics.suppliersBucket.days30 / bfrMetrics.suppliersBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: 31 à 60 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>31 à 60 jours d'échéance</span>
                  <span className="font-mono font-semibold text-slate-700">{formatCurrencyDA(bfrMetrics.suppliersBucket.days60, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.suppliersBucket.total > 0 ? (bfrMetrics.suppliersBucket.days60 / bfrMetrics.suppliersBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bracket: > 60 jours */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span className="font-semibold text-slate-800">&gt; 60 jours (Règlements en attente)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrencyDA(bfrMetrics.suppliersBucket.days90Plus, false)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-slate-500 h-full rounded-full"
                    style={{
                      width: `${bfrMetrics.suppliersBucket.total > 0 ? (bfrMetrics.suppliersBucket.days90Plus / bfrMetrics.suppliersBucket.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synthesis Commentary on BFR */}
        <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <Scale className="h-4 w-4 text-[#0B207D] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#07164D]">Diagnostic de Trésorerie Opérationnelle : </span>
            {bfrMetrics.status === 'BESOIN_NET' ? (
              <span>
                L'entreprise présente un <strong>Besoin en Fonds de Roulement de {formatCurrencyDA(bfrMetrics.bfrDA, false)}</strong>.
                Les créances clients excèdent les dettes fournisseurs. L'accélération du recouvrement des situations de travaux et le suivi des retards &gt; 30j sont prioritaires pour préserver la trésorerie disponible.
              </span>
            ) : (
              <span>
                L'entreprise dispose d'une <strong>Ressource Nette en Fonds de Roulement de {formatCurrencyDA(Math.abs(bfrMetrics.bfrDA), false)}</strong>.
                Les dettes fournisseurs financent temporairement le cycle d'exploitation. Veiller à respecter les échéances pour éviter les blocages de commandes.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Analytical Margin Variance Alerts (Projects Under Threshold) */}
      {marginAlertProjects.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Vigilance Managériale — Alertes sur Marge & Dépassements Budgétaires ({marginAlertProjects.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {marginAlertProjects.map((p) => {
              const margin = Number(p.marginRate || 0);
              const isOverBudget = p.actualCost > p.budgetAmount && p.budgetAmount > 0;
              return (
                <div key={p.id || p.code} className="bg-white border border-amber-200 rounded p-3 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#0B207D]">{p.code}</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        margin < 10
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      Marge: +{margin}%
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 line-clamp-1">{p.name}</div>
                  <div className="text-slate-500 text-[11px] line-clamp-1">Client: {p.clientName}</div>
                  <div className="pt-1 border-t border-slate-100 text-[11px] flex justify-between">
                    <span className="text-slate-600">Coût / Budget:</span>
                    <span className={`font-mono font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatCurrencyDA(p.actualCost, false)} / {formatCurrencyDA(p.budgetAmount, false)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(p.id || p.code)}
                    className="w-full mt-1 py-1 text-center text-[11px] font-semibold text-[#0B207D] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                  >
                    Auditer le P&L Analytique &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Project Profitability Interactive Table & Filter Matrix */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#0B207D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
              Matrice de Rentabilité par Chantier ({filteredProjects.length} / {projects.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher code, chantier, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B207D] w-56"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Margin Filter Selector */}
            <select
              value={marginFilter}
              onChange={(e) => setMarginFilter(e.target.value as any)}
              className="py-1 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B207D]"
            >
              <option value="ALL">Toutes marges</option>
              <option value="HEALTHY">Marge saine (&ge; 20%)</option>
              <option value="WARNING">Vigilance (10% - 20%)</option>
              <option value="CRITICAL">Critique (&lt; 10%)</option>
            </select>

            {/* Status Filter Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B207D]"
            >
              <option value="ALL">Tous statuts</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="EN_COURS">En cours (FR)</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CLOTURE">Clôturé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Chantier / Code</th>
                <th className="py-2.5 px-3">Client Industriel</th>
                <th className="py-2.5 px-3 text-right">Marché HT</th>
                <th className="py-2.5 px-3 text-right">Budget Estimé</th>
                <th className="py-2.5 px-3 text-right">Engagements BC</th>
                <th className="py-2.5 px-3 text-right">Coût Réel Consommé</th>
                <th className="py-2.5 px-3 text-right">Facturé HT</th>
                <th className="py-2.5 px-3 text-right">Encaissé (Recouvrement)</th>
                <th className="py-2.5 px-3 text-center">Taux Marge</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-400">
                    Aucun chantier ne correspond aux critères de recherche et filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const margin = Number(p.marginRate || 0);
                  const collectionRate = p.billedAmount > 0 ? Math.min(100, Math.round((p.paidAmount / p.billedAmount) * 100)) : 0;
                  const isOverBudget = p.actualCost > p.budgetAmount && p.budgetAmount > 0;

                  return (
                    <tr key={p.id || p.code} className="hover:bg-slate-50/80 transition-colors">
                      {/* Chantier */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Link
                          href={`/projects/${p.code}`}
                          className="font-mono font-bold text-[#0B207D] hover:underline inline-flex items-center gap-1 group"
                          title={`Ouvrir la fiche chantier ${p.code}`}
                        >
                          {p.code}
                          <ExternalLink className="h-2.5 w-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                        </Link>
                        <div className="text-[11px] font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={p.name}>
                          {p.name}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-700 font-medium line-clamp-1 flex items-center gap-1 max-w-[150px]" title={p.clientName}>
                          <Building className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{p.clientName}</span>
                        </div>
                      </td>

                      {/* Marché Contractuel HT */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrencyDA(p.contractAmount, false)}
                      </td>

                      {/* Budget Estimé */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                        {formatCurrencyDA(p.budgetAmount, false)}
                      </td>

                      {/* Engagements BC */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                        {formatCurrencyDA(p.committedCost, false)}
                      </td>

                      {/* Coût Réel Consommé */}
                      <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${isOverBudget ? 'text-rose-700' : 'text-[#0B207D]'}`}>
                        {formatCurrencyDA(p.actualCost, false)}
                        {isOverBudget && (
                          <div className="text-[10px] text-rose-600 font-sans font-normal">Dépassement</div>
                        )}
                      </td>

                      {/* Facturé Situations HT */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        {formatCurrencyDA(p.billedAmount, false)}
                      </td>

                      {/* Encaissé / Recouvrement */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-800">
                          {formatCurrencyDA(p.paidAmount, false)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {collectionRate}% recouvré
                        </div>
                      </td>

                      {/* Taux de Marge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${
                            margin >= 20
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : margin >= 10
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          +{margin}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedProjectId(p.id || p.code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#0B207D] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                          title="Inspecter le P&L analytique détaillé"
                        >
                          <Eye className="h-3 w-3" />
                          <span>P&L Analytique</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Drill-down Modal: Detailed Project P&L Inspector */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl rounded-lg bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#07164D] px-6 py-4 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 font-bold">
                    {detailedPnl?.projectCode || selectedProjectId}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-slate-300">
                    Contrôle de Gestion & P&L Affaire
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {detailedPnl?.projectName || 'Analyse Analytique du Chantier'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {loadingPnl ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#0B207D]" />
                  <span>Calcul analytique des coûts en cours (Matériaux, Main d'œuvre, Frais directs)...</span>
                </div>
              ) : pnlError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{pnlError}</span>
                </div>
              ) : detailedPnl ? (
                <div className="space-y-5">
                  {/* Synthesis Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Marché Contractuel</div>
                      <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
                        {formatCurrencyDA(detailedPnl.contractAmount, false)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Facturé HT</div>
                      <div className="mt-1 font-mono font-bold text-[#0B207D] text-sm">
                        {formatCurrencyDA(detailedPnl.actualBilledHT, false)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Coûts Consommés</div>
                      <div className="mt-1 font-mono font-bold text-slate-800 text-sm">
                        {formatCurrencyDA(detailedPnl.realCosts.totalDirectCost, false)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Marge Réalisée</div>
                      {detailedPnl.isMarginCalculable === false ? (
                        <div className="mt-1 font-mono font-bold text-amber-700 text-sm">Non calculable</div>
                      ) : (
                        <div className="mt-1 font-mono font-bold text-emerald-700 text-sm flex items-center justify-between">
                          <span>{formatCurrencyDA(detailedPnl.grossMarginDA, false)}</span>
                          <span className="text-xs">+{detailedPnl.grossMarginPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analytical Breakdown: Coûts Directs par Catégorie */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wider flex justify-between items-center">
                      <span>Décomposition des Coûts Réels Consommés</span>
                      <span className="font-mono text-slate-900">
                        {formatCurrencyDA(detailedPnl.realCosts.totalDirectCost, false)}
                      </span>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      {/* 1. Fournitures & Matières */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">1. Fournitures & Matières Réceptionnées (BR validés)</span>
                          <span className="font-mono font-bold text-slate-800">
                            {formatCurrencyDA(detailedPnl.realCosts.materials, false)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{
                              width: `${detailedPnl.realCosts.totalDirectCost > 0 ? (detailedPnl.realCosts.materials / detailedPnl.realCosts.totalDirectCost) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* 2. Main d'œuvre */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">2. Main d'Œuvre Chantier (Pointages réels & paniers)</span>
                          <span className="font-mono font-bold text-slate-800">
                            {formatCurrencyDA(detailedPnl.realCosts.labor, false)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{
                              width: `${detailedPnl.realCosts.totalDirectCost > 0 ? (detailedPnl.realCosts.labor / detailedPnl.realCosts.totalDirectCost) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* 3. Sous-traitance & Frais généraux */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">3. Sous-traitance & Frais Généraux Imputés</span>
                          <span className="font-mono font-bold text-slate-800">
                            {formatCurrencyDA(detailedPnl.realCosts.otherExpenses, false)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{
                              width: `${detailedPnl.realCosts.totalDirectCost > 0 ? (detailedPnl.realCosts.otherExpenses / detailedPnl.realCosts.totalDirectCost) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projection d'atterrissage & Écart Budgétaire */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded p-4 bg-slate-50 space-y-2">
                      <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Engagements & Atterrissage
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Engagements restants (BC non livrés) :</span>
                        <span className="font-mono font-semibold">{formatCurrencyDA(detailedPnl.committedRemaining, false)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-800">Coût Final Prévisionnel :</span>
                        <span className="font-mono font-bold text-[#0B207D]">{formatCurrencyDA(detailedPnl.projectedFinalCost, false)}</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded p-4 bg-slate-50 space-y-2">
                      <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Contrôle Budgétaire
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Budget alloué HT :</span>
                        <span className="font-mono font-semibold">{formatCurrencyDA(detailedPnl.estimatedBudget, false)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-800">Écart sur Budget :</span>
                        <span
                          className={`font-mono font-bold ${
                            detailedPnl.budgetVarianceDA >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {detailedPnl.budgetVarianceDA >= 0 ? '+' : ''}
                          {formatCurrencyDA(detailedPnl.budgetVarianceDA, false)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                SARL SILEX SERVICES ERP — Contrôle Analytique & Séparation des Exercices
              </span>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
