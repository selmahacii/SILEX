'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatCurrencyDA, formatDateDZ, ProjectStatus, IndustrialSector } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import { Search, Filter, Plus, Briefcase, ChevronRight } from 'lucide-react';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await api.get<any[]>('/projects');
        setProjects(data);
      } catch (err) {
        console.error('Erreur chargement projets:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Gestion des Projets Industriels</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Suivi opérationnel, technique et financier des chantiers (Tuyauterie, Montage, HVAC, Maintenance).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Formulaire de création de nouveau marché industriel disponible pour l'administrateur.")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#142B45] text-white rounded-md hover:bg-[#203D5A] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par code, nom, client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0A7F7C]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Tous les secteurs</option>
            <option value="OIL_AND_GAS">Oil & Gas</option>
            <option value="ENERGIE">Énergie</option>
            <option value="SIDERURGIE">Sidérurgie</option>
            <option value="CIMENTERIE">Cimenterie</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="PLANNING">Planification</option>
            <option value="COMPLETED">Clôturé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#697789] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Projet & Client</th>
                <th className="py-3 px-4">Secteur</th>
                <th className="py-3 px-4">Période contractuelle</th>
                <th className="py-3 px-4 text-right">Montant Marché</th>
                <th className="py-3 px-4 text-right">Coût Réel Consommé</th>
                <th className="py-3 px-4 text-center">Avancement</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#142B45] whitespace-nowrap">
                    {p.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.clientName} • {p.siteLocation}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {p.sector.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDateDZ(p.startDate)} → {formatDateDZ(p.contractEndDate)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrencyDA(p.contractAmount, false)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0A7F7C] whitespace-nowrap">
                    {formatCurrencyDA(p.actualCost, false)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-800">{p.physicalProgress}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-[#0A7F7C] h-full rounded-full"
                          style={{ width: `${Math.min(100, p.physicalProgress)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <StatusBadge status={p.status} type="project" />
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <Link
                      href={`/projects/${p.code}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A7F7C] hover:underline"
                    >
                      <span>Fiche</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
