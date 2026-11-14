'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ExternalLink, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';

export interface ProjectProfitabilitySummary {
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
}

interface ProjectsMarginSummaryProps {
  projects: ProjectProfitabilitySummary[];
  onNavigateProjects?: () => void;
}

export function ProjectsMarginSummary({
  projects = [],
  onNavigateProjects,
}: ProjectsMarginSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#07164D]">
            Rentabilité & Engagements des Chantiers en Cours ({projects.length})
          </h2>
        </div>
        {onNavigateProjects && (
          <button
            type="button"
            onClick={onNavigateProjects}
            className="text-[11px] font-semibold text-[#0B207D] hover:underline cursor-pointer"
          >
            Vue détaillée chantiers
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2 px-3 font-semibold">Chantier / Code</th>
              <th className="py-2 px-3 font-semibold">Client Industriel</th>
              <th className="py-2 px-3 font-semibold text-right">Marché HT (DZD)</th>
              <th className="py-2 px-3 font-semibold text-right">Engagements BC</th>
              <th className="py-2 px-3 font-semibold text-right">Coût Réel Consommé</th>
              <th className="py-2 px-3 font-semibold text-center">Taux de Marge</th>
              <th className="py-2 px-3 font-semibold text-right">Recouvrement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-xs text-slate-400">
                  Aucun chantier en cours de suivi analytique.
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const margin = Number(p.marginRate || 0);
                const collectionRate = p.billedAmount > 0 ? Math.min(100, Math.round((p.paidAmount / p.billedAmount) * 100)) : 0;

                return (
                  <tr key={p.id || p.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Link
                        href={`/projects/${p.code}`}
                        className="font-mono font-bold text-[#0B207D] hover:underline inline-flex items-center gap-1 group"
                        title={`Ouvrir le chantier ${p.code}`}
                      >
                        {p.code}
                        <ExternalLink className="h-2.5 w-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                      </Link>
                      <div className="text-[11px] font-medium text-slate-800 line-clamp-1 max-w-[220px]">
                        {p.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-700 font-medium line-clamp-1 flex items-center gap-1">
                        <Building className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span>{p.clientName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyDA(p.contractAmount, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCurrencyDA(p.committedCost, false)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#0B207D] whitespace-nowrap">
                      {formatCurrencyDA(p.actualCost, false)}
                    </td>
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
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-800">
                        {formatCurrencyDA(p.paidAmount, false)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        sur {formatCurrencyDA(p.billedAmount, false)} ({collectionRate}%)
                      </div>
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
