'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatCurrencyDA, formatDateDZ } from '@silex/shared';
import { BarChart3, Download, Printer, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await api.get<any[]>('/projects');
        setProjects(data);
      } catch (err) {
        console.error('Erreur rapports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Code', 'Nom Projet', 'Client', 'Secteur', 'Montant Marche (DA)', 'Budget (DA)', 'Cout Reel (DA)', 'Avancement (%)'];
    const rows = projects.map(p => [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.clientName}"`,
      p.sector,
      p.contractAmount,
      p.budgetAmount,
      p.actualCost,
      p.physicalProgress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SILEX_RAPPORT_PROJETS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Rapports Consolidés & Analyse de Performance</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Exportations compatibles Excel / CSV et fiches de synthèse prêtes pour impression PDF.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1E6ED] text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV (Excel)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#142B45] text-white text-xs font-semibold rounded hover:bg-[#203D5A] transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white p-6 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="text-base font-extrabold text-[#142B45]">SILEX SERVICES — ÉTAT CONSOLIDÉ DES CHANTIERS</div>
            <div className="text-xs text-slate-500">Document d’analyse de gestion de projet et engagements financiers</div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Édité le : <strong>{formatDateDZ(new Date())}</strong></div>
            <div>Devise : <strong>Dinar Algérien (DA)</strong></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Chantier</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3 text-right">Montant Marché</th>
                <th className="py-2.5 px-3 text-right">Budget Prévu</th>
                <th className="py-2.5 px-3 text-right">Coût Réel Consommé</th>
                <th className="py-2.5 px-3 text-center">Avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => (
                <tr key={p.id}>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#142B45]">{p.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.clientName}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrencyDA(p.contractAmount, false)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrencyDA(p.budgetAmount, false)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#0A7F7C]">{formatCurrencyDA(p.actualCost, false)}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">{p.physicalProgress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
