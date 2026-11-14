'use client';

import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Scale,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

interface ExecutiveKpisProps {
  totalTreasury: number;
  bankTreasury: number;
  cashTreasury: number;
  customerDebts: number;
  customerOverdue: number;
  customerCount: number;
  supplierDebts: number;
  supplierPendingCount: number;
  supplierDiscrepancyCount: number;
  warrantyHeld: number;
  bfrDA: number;
  bfrStatus?: string;
  isLoading?: boolean;
}

export function ExecutiveKpis({
  totalTreasury,
  bankTreasury,
  cashTreasury,
  customerDebts,
  customerOverdue,
  customerCount,
  supplierDebts,
  supplierPendingCount,
  supplierDiscrepancyCount,
  warrantyHeld,
  bfrDA,
  bfrStatus = 'ÉQUILIBRÉ',
  isLoading = false,
}: ExecutiveKpisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-slate-200 bg-slate-50/60 p-3 animate-pulse">
            <div className="h-3 w-20 bg-slate-200 rounded mb-3"></div>
            <div className="h-6 w-32 bg-slate-300 rounded mb-2"></div>
            <div className="h-2.5 w-24 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Trésorerie Nette Disponible */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Trésorerie Nette
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-emerald-700">
            <Wallet className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-bold font-mono tracking-tight text-[#07164D]">
            {formatCurrencyDA(totalTreasury, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1">
            <span>Banques: {formatCurrencyDA(bankTreasury, false)}</span>
            <span>Caisse: {formatCurrencyDA(cashTreasury, false)}</span>
          </div>
        </div>
      </div>

      {/* 2. Créances Clients en Attente */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Créances Clients
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-[#0B207D]">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-bold font-mono tracking-tight text-slate-900">
            {formatCurrencyDA(customerDebts, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] border-t border-slate-100 pt-1">
            <span className="text-slate-500">{customerCount} facture(s) émise(s)</span>
            {customerOverdue > 0 ? (
              <span className="font-semibold text-rose-600 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {formatCurrencyDA(customerOverdue, false)} &gt;30j
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" /> 0 échue
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dettes Fournisseurs Exigibles */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Dettes Fournisseurs
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-50 text-amber-700">
            <ArrowDownRight className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-bold font-mono tracking-tight text-slate-900">
            {formatCurrencyDA(supplierDebts, false)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] border-t border-slate-100 pt-1">
            <span className="text-slate-500">{supplierPendingCount} en cours</span>
            {supplierDiscrepancyCount > 0 ? (
              <span className="font-semibold text-amber-700 flex items-center gap-0.5">
                <ShieldAlert className="h-2.5 w-2.5" />
                {supplierDiscrepancyCount} écart(s) 3-way
              </span>
            ) : (
              <span className="text-emerald-700">100% conformes</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Retenues de Garantie Bloquées (5%) */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Retenues de Garantie (5%)
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-50 text-purple-700">
            <Scale className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg font-bold font-mono tracking-tight text-slate-900">
            {formatCurrencyDA(warrantyHeld, false)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 border-t border-slate-100 pt-1 flex items-center justify-between">
            <span>Cautions légales chantiers</span>
            <span className="text-purple-700 font-medium">Libérables J+365</span>
          </div>
        </div>
      </div>

      {/* 5. BFR d'Exploitation */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            BFR Synthétique
          </span>
          <div className={`flex h-6 w-6 items-center justify-center rounded ${
            bfrDA <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <Scale className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-lg font-bold font-mono tracking-tight ${
            bfrDA <= 0 ? 'text-emerald-700' : 'text-amber-800'
          }`}>
            {formatCurrencyDA(bfrDA, false)}
          </div>
          <div className="mt-1 text-[11px] border-t border-slate-100 pt-1 flex items-center justify-between">
            <span className="text-slate-500">Créances − Dettes</span>
            <span className={`font-semibold ${
              bfrDA <= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {bfrDA <= 0 ? 'Ressource nette' : 'Besoin net'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
