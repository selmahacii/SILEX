'use client';

import React from 'react';
import {
  Coins,
  ShieldCheck,
  RefreshCw,
  Database,
  LayoutDashboard,
  Wallet,
  Receipt,
  FileCheck2,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { SystemRole, COMPANY_NAME } from '@silex/shared';

export type FinanceTab = 'dashboard' | 'treasury' | 'billing' | 'matching' | 'profitability';

interface FinanceHeaderProps {
  activeTab: FinanceTab;
  onTabChange: (tab: FinanceTab) => void;
  activeRole?: string;
  includeDemo: boolean;
  onToggleIncludeDemo: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function FinanceHeader({
  activeTab,
  onTabChange,
  activeRole,
  includeDemo,
  onToggleIncludeDemo,
  onRefresh,
  isLoading = false,
}: FinanceHeaderProps) {
  const tabs: { id: FinanceTab; label: string; icon: React.ElementType; phase: string }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, phase: 'Phase 6C.1' },
    { id: 'treasury', label: 'Trésorerie & Banques', icon: Wallet, phase: 'Phase 6C.2' },
    { id: 'billing', label: 'Facturation Clients', icon: Receipt, phase: 'Phase 6C.3' },
    { id: 'matching', label: 'Fournisseurs & 3-Way', icon: FileCheck2, phase: 'Phase 6C.4' },
    { id: 'profitability', label: 'Rentabilité & BFR', icon: TrendingUp, phase: 'Phase 6C.5' },
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case SystemRole.DIRECTEUR_GENERAL:
        return 'Directeur Général (DG)';
      case SystemRole.RESPONSABLE_FINANCIER:
        return 'Responsable Financier (DAF)';
      case SystemRole.ADMINISTRATEUR:
        return 'Administrateur Système';
      case SystemRole.RESPONSABLE_PROJET:
        return 'Chef de Projet';
      default:
        return role || 'Utilisateur';
    }
  };

  return (
    <header className="space-y-4 border-b border-slate-200 pb-4">
      {/* Top Banner: Module Branding & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#07164D] text-white shadow-xs">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#07164D]">
                  Finance & Trésorerie Industrielle
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  <Database className="h-3 w-3 text-emerald-600" />
                  PostgreSQL 16
                </span>
              </div>
              <p className="text-xs text-[#697789]">
                {COMPANY_NAME} — Convergence financière, trésorerie multi-banques, 3-way matching et BFR
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active User Role Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-[#0B207D] border border-blue-200/60">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0B207D]" />
            <span>{getRoleLabel(activeRole)}</span>
          </div>

          {/* Include Demo Toggle */}
          <button
            type="button"
            onClick={onToggleIncludeDemo}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              includeDemo
                ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Activer ou masquer les comptes et factures de simulation / démonstration"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
            <span>{includeDemo ? 'Données Démo : Incluses' : 'Données Démo : Masquées'}</span>
          </button>

          {/* Refresh Action Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-60 cursor-pointer"
            title="Actualiser les soldes et écritures en temps réel"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin text-[#0B207D]' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-2 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#0B207D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.id !== 'dashboard' && (
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.phase}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
