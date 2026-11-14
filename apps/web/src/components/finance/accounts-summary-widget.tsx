'use client';

import React from 'react';
import { Landmark, ArrowRight, ShieldCheck, Database, Building2 } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

export interface FinancialAccountSummary {
  id: string;
  code: string;
  name: string;
  type: string;
  bankName?: string;
  ribNumber?: string;
  currency: string;
  currentBalance: number;
  initialBalance: number;
  isDemoAccount?: boolean;
  isActive?: boolean;
}

interface AccountsSummaryWidgetProps {
  accounts: FinancialAccountSummary[];
  onSelectAccount?: (account: FinancialAccountSummary) => void;
  onNavigateTreasury?: () => void;
}

export function AccountsSummaryWidget({
  accounts = [],
  onSelectAccount,
  onNavigateTreasury,
}: AccountsSummaryWidgetProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BANQUE_COURANT':
      case 'BANQUE':
        return <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-[#0B207D] border border-blue-200">Compte Courant</span>;
      case 'BANQUE_INVESTISSEMENT':
        return <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">Investissement</span>;
      case 'CAISSE_SIEGE':
      case 'CAISSE':
        return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">Caisse Siège</span>;
      case 'CAISSE_CHANTIER':
        return <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-800 border border-orange-200">Régie Chantier</span>;
      default:
        return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{type}</span>;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-[#0B207D]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
            Comptes Financiers & Liquidités ({accounts.length})
          </h2>
        </div>
        {onNavigateTreasury && (
          <button
            type="button"
            onClick={onNavigateTreasury}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B207D] hover:underline cursor-pointer"
          >
            <span>Gestion trésorerie</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2 px-3 font-semibold">Code</th>
              <th className="py-2 px-3 font-semibold">Établissement / Intitulé</th>
              <th className="py-2 px-3 font-semibold">Type</th>
              <th className="py-2 px-3 font-semibold text-right">Solde Actuel (DZD)</th>
              <th className="py-2 px-3 font-semibold text-center">Origine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                  Aucun compte financier configuré.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.id || acc.code}
                  onClick={() => onSelectAccount && onSelectAccount(acc)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                    {acc.code}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {acc.name}
                    </div>
                    {acc.bankName && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-2.5 w-2.5" />
                        <span>{acc.bankName}</span>
                        {acc.ribNumber && (
                          <span className="font-mono text-slate-400">({acc.ribNumber})</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getTypeBadge(acc.type)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrencyDA(acc.currentBalance, false)}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {acc.isDemoAccount ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 border border-slate-200" title="Compte de simulation mémoire">
                        Démo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 border border-emerald-200" title="Compte persisté PostgreSQL">
                        <Database className="h-2 w-2 text-emerald-600" />
                        PostgreSQL
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
