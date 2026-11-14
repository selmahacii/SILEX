'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Repeat, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

export interface CashTransactionItem {
  id: string;
  transactionNumber: string;
  type: string;
  amount: number;
  accountId: string;
  accountCode: string;
  counterpartAccountId?: string;
  counterpartAccountCode?: string;
  category?: string;
  referenceDocument?: string;
  paymentMethod?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface RecentTransactionsWidgetProps {
  transactions: CashTransactionItem[];
  onNavigateTransactions?: () => void;
}

export function RecentTransactionsWidget({
  transactions = [],
  onNavigateTransactions,
}: RecentTransactionsWidgetProps) {
  const isIncoming = (type: string) => {
    return [
      'ENCAISSEMENT_CLIENT',
      'VIREMENT_INTERNE_RECU',
      'LIBERATION_RETENUE_GARANTIE',
      'ENCAISSEMENT',
    ].includes(type);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ENCAISSEMENT_CLIENT':
      case 'ENCAISSEMENT':
        return 'Encaissement Client';
      case 'DECAISSEMENT_FOURNISSEUR':
      case 'DECAISSEMENT':
        return 'Règlement Fournisseur';
      case 'VIREMENT_INTERNE_EMIS':
        return 'Virement Interne (Débit)';
      case 'VIREMENT_INTERNE_RECU':
      case 'VIREMENT_INTERNE':
        return 'Virement Interne';
      case 'PAIEMENT_SALAIRES':
        return 'Salaires & Paie';
      case 'PAIEMENT_CHARGES_SOCIALES':
        return 'Cotisations CNAS';
      case 'LIBERATION_RETENUE_GARANTIE':
        return 'Restitution Retenue (5%)';
      case 'FRAIS_BANCAIRES':
        return 'Frais & Commissions';
      default:
        return type;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0B207D]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
            Journal Récent des Flux de Trésorerie ({transactions.length})
          </h2>
        </div>
        {onNavigateTransactions && (
          <button
            type="button"
            onClick={onNavigateTransactions}
            className="text-[11px] font-semibold text-[#0B207D] hover:underline cursor-pointer"
          >
            Voir grand livre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2 px-3 font-semibold">Date & Réf</th>
              <th className="py-2 px-3 font-semibold">Nature du Flux</th>
              <th className="py-2 px-3 font-semibold">Compte</th>
              <th className="py-2 px-3 font-semibold">Pièce Justificative</th>
              <th className="py-2 px-3 font-semibold text-right">Montant (DZD)</th>
              <th className="py-2 px-3 font-semibold text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                  Aucune écriture de trésorerie récente enregistrée.
                </td>
              </tr>
            ) : (
              transactions.slice(0, 8).map((tx) => {
                const incoming = isIncoming(tx.type);
                const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

                return (
                  <tr key={tx.id || tx.transactionNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-[#0B207D]">
                        {tx.transactionNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">{dateStr}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {incoming ? (
                          <ArrowDownLeft className="h-3 w-3 text-emerald-600 shrink-0" />
                        ) : tx.type.includes('VIREMENT') ? (
                          <Repeat className="h-3 w-3 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-rose-600 shrink-0" />
                        )}
                        <span>{getTypeLabel(tx.type)}</span>
                      </div>
                      {tx.category && (
                        <div className="text-[10px] text-slate-500">{tx.category}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {tx.accountCode || tx.accountId}
                      </span>
                      {tx.counterpartAccountCode && (
                        <span className="text-[10px] text-slate-500 ml-1">
                          → {tx.counterpartAccountCode}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-600">
                        {tx.referenceDocument || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={incoming ? 'text-emerald-700' : 'text-slate-900'}>
                        {incoming ? '+' : '-'}{formatCurrencyDA(tx.amount, false)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Validé
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
