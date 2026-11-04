'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatCurrencyDA } from '@silex/shared';
import { Coins, TrendingUp, AlertCircle, PieChart, FileSpreadsheet } from 'lucide-react';

export default function FinancePage() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        setLoading(true);
        const data = await api.get<any>('/finance/overview');
        setFinanceData(data);
      } catch (err) {
        console.error('Erreur chargement finance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#182433]">Finance & Contrôle des Engagements</h1>
        <p className="text-xs text-[#697789] mt-0.5">
          Pilotage budgétaire, créances clients, facturation fournisseurs et analyse de marge brute par chantier.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Total Marchés Contractuels</div>
          <div className="text-lg font-bold text-[#142B45] mt-1">
            {formatCurrencyDA(financeData?.totals?.contractAmount, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Engagements clients fermes</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Budgets Prévus Alloués</div>
          <div className="text-lg font-bold text-slate-800 mt-1">
            {formatCurrencyDA(financeData?.totals?.budgetAmount, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Enveloppe opérationnelle</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Engagements Bons de Commande</div>
          <div className="text-lg font-bold text-[#0A7F7C] mt-1">
            {formatCurrencyDA(financeData?.totals?.committedCost, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dépenses contractées</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-xs font-medium text-[#697789]">Marge Globale Prévue</div>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            +{financeData?.totals?.globalMarginRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Conforme aux objectifs 2026</div>
        </div>
      </div>

      {/* Detailed analytical table by project */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
            Rentabilité Analytique par Marché Industriel
          </h2>
          <span className="text-[11px] text-slate-500">Montants calculés en Dinar Algérien (DA)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Projet</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3 text-right">Montant Marché</th>
                <th className="py-2.5 px-3 text-right">Budget Alloué</th>
                <th className="py-2.5 px-3 text-right">Coûts Engagés</th>
                <th className="py-2.5 px-3 text-right">Coûts Réels Consommés</th>
                <th className="py-2.5 px-3 text-right">Taux de Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {financeData?.projects?.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#142B45] whitespace-nowrap">
                    {p.code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {p.clientName}
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
                  <td className="py-3 px-3 text-right font-bold text-[#0A7F7C] whitespace-nowrap">
                    {formatCurrencyDA(p.actualCost, false)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      +{p.marginRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
