'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Search,
  Filter,
  Plus,
  Briefcase,
  ChevronRight,
  X,
  Building,
  Calendar,
  MapPin,
  Coins,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function ProjectsListPage() {
  const { activeRole } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal Nouveau Projet
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [sector, setSector] = useState('OIL_AND_GAS');
  const [siteLocation, setSiteLocation] = useState('');
  const [contractAmount, setContractAmount] = useState<number>(0);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [description, setDescription] = useState('');

  const CLIENT_PRESETS: any[] = [];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Erreur chargement projets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeRole]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dom = params.get('domain');
      if (dom) setDomainFilter(dom);
      const q = params.get('search');
      if (q) setSearchTerm(q);
    }
  }, []);

  // Calculs dynamiques dans la modale
  const targetMarginDA = Math.max(0, contractAmount - budgetAmount);
  const targetMarginPct = contractAmount > 0 ? ((targetMarginDA / contractAmount) * 100).toFixed(1) : '0';
  
  const daysDuration = (() => {
    if (!startDate || !contractEndDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(contractEndDate).getTime();
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  })();

  const handleApplyPreset = (preset: typeof CLIENT_PRESETS[0]) => {
    setClientName(preset.name);
    setSector(preset.sector);
    setSiteLocation(preset.location);
    if (preset.defaultTitle) setName(preset.defaultTitle);
    if (preset.defaultDesc) setDescription(preset.defaultDesc);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const generatedCode = code || `PRJ-2026-${String(projects.length + 1).padStart(3, '0')}`;
      const created = await api.post<any>('/projects', {
        code: generatedCode,
        name,
        clientName,
        sector,
        siteLocation,
        contractAmount: Number(contractAmount),
        budgetAmount: Number(budgetAmount),
        startDate: new Date(startDate).toISOString(),
        contractEndDate: new Date(contractEndDate).toISOString(),
        description: description || `Marché industriel - ${name}`,
      });

      setShowCreateModal(false);
      setName('');
      setCode('');
      await fetchProjects();
      setNotification(`Projet ${created.code} créé avec succès ! Budget alloué : ${formatCurrencyDA(created.budgetAmount, false)}.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur création projet');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.siteLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    const matchesDomain = domainFilter === 'ALL' ||
      (domainFilter === 'tuyauterie' && (
        p.name?.toLowerCase().includes('tuyauterie') ||
        p.description?.toLowerCase().includes('tuyauterie') ||
        p.name?.toLowerCase().includes('skid') ||
        p.description?.toLowerCase().includes('soudage')
      )) ||
      (domainFilter === 'electricite' && (
        p.name?.toLowerCase().includes('élec') ||
        p.name?.toLowerCase().includes('instru') ||
        p.description?.toLowerCase().includes('armoire') ||
        p.description?.toLowerCase().includes('câblage')
      )) ||
      (domainFilter === 'froid' && (
        p.name?.toLowerCase().includes('froid') ||
        p.name?.toLowerCase().includes('hvac') ||
        p.description?.toLowerCase().includes('ammoniac') ||
        p.description?.toLowerCase().includes('climatisation')
      )) ||
      (domainFilter === 'maintenance' && (
        p.name?.toLowerCase().includes('maint') ||
        p.name?.toLowerCase().includes('arrêt') ||
        p.description?.toLowerCase().includes('révision') ||
        p.description?.toLowerCase().includes('pompe')
      )) ||
      ((domainFilter === 'accompagnement' || domainFilter === 'projets') && (
        p.name?.toLowerCase().includes('accompagnement') ||
        p.name?.toLowerCase().includes('pilotage') ||
        p.name?.toLowerCase().includes('projet') ||
        p.description?.toLowerCase().includes('méthodes') ||
        p.description?.toLowerCase().includes('qualité')
      ));

    return matchesSearch && matchesSector && matchesStatus && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#0B207D] rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B207D]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#0B207D]" />
            Gestion des Projets & Chantiers Industriels
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Suivi opérationnel, technique et financier des chantiers SILEX SERVICES dans le respect QCD (Qualité • Coûts • Délais).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-2xs font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Affichage par cartes chantiers"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-2xs font-semibold text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Affichage tableau détaillé"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* 5 Domains Pill Filter Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">Pôles :</span>
        <button
          onClick={() => setDomainFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'ALL'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tous les Domaines ({projects.length})
        </button>
        <button
          onClick={() => setDomainFilter('tuyauterie')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'tuyauterie'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tuyauterie, Chaudronnerie & Isolation
        </button>
        <button
          onClick={() => setDomainFilter('electricite')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'electricite'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Électricité & Instrumentation
        </button>
        <button
          onClick={() => setDomainFilter('froid')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'froid'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Froid Industriel & HVAC
        </button>
        <button
          onClick={() => setDomainFilter('maintenance')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'maintenance'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Maintenance Industrielle & Arrêts
        </button>
        <button
          onClick={() => setDomainFilter('accompagnement')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
            domainFilter === 'accompagnement'
              ? 'bg-[#0B207D] text-white shadow-2xs font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Accompagnement de Projets
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#E1E6ED] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par code, libellé, client, wilaya..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
            {filteredProjects.length} sur {projects.length} projet(s)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Tous les 5 Domaines d&apos;Activité</option>
            <option value="tuyauterie">Tuyauterie, Chaudronnerie &amp; Soudage HP</option>
            <option value="electricite">Électricité &amp; Instrumentation</option>
            <option value="froid">HVAC &amp; Froid Industriel</option>
            <option value="maintenance">Maintenance Industrielle &amp; Arrêts</option>
            <option value="accompagnement">Accompagnement Projets &amp; QCD</option>
          </select>

          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Tous les secteurs industriels</option>
            <option value="OIL_AND_GAS">Oil & Gas</option>
            <option value="ENERGIE">Énergie</option>
            <option value="SIDERURGIE">Sidérurgie</option>
            <option value="CIMENTERIE">Cimenterie</option>
            <option value="AUTRE_INDUSTRIE">Autre Industrie</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="IN_PROGRESS">En cours d'exécution</option>
            <option value="PLANNING">En planification</option>
            <option value="COMPLETED">Chantier clôturé</option>
          </select>
        </div>
      </div>

      {/* Projects Display: Cards or Detailed Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(filteredProjects) ? filteredProjects : []).map(p => (
            <Link
              key={p.id}
              href={`/projects/${p.code}`}
              className="bg-white rounded-lg border border-[#E1E6ED] p-4 hover:border-[#0A7F7C] transition-all duration-200 shadow-2xs hover:shadow-xs group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#142B45] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {p.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={p.status} type="project" />
                    <StatusBadge status={p.riskLevel} type="risk" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#182433] group-hover:text-[#0A7F7C] transition-colors line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{p.clientName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{p.siteLocation}</span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Avancement physique</span>
                      <span className="font-bold text-slate-900">{p.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0A7F7C] h-full rounded-full transition-all duration-300"
                        style={{ width: `${p.physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Budget Alloué</span>
                      <span className="font-bold text-slate-800">{formatCurrencyDA(p.budgetAmount, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Coûts Réels</span>
                      <span className="font-bold text-[#142B45]">{formatCurrencyDA(p.actualCost, false)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#0A7F7C]">
                <span>Consulter le dossier chantier</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Marché / Intitulé</th>
                  <th className="py-2.5 px-3">Client & Localisation</th>
                  <th className="py-2.5 px-3">Secteur</th>
                  <th className="py-2.5 px-3 text-center">Avancement</th>
                  <th className="py-2.5 px-3 text-right">Montant Marché HT</th>
                  <th className="py-2.5 px-3 text-right">Budget Alloué</th>
                  <th className="py-2.5 px-3 text-right">Coût Réel</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(filteredProjects) ? filteredProjects : []).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#142B45] whitespace-nowrap">
                      {p.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-slate-400">Échéance: {formatDateDZ(p.contractEndDate)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{p.clientName}</div>
                      <div className="text-[10px] text-slate-500">{p.siteLocation}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {p.sector}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0A7F7C] h-full rounded-full"
                            style={{ width: `${p.physicalProgress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">{p.physicalProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyDA(p.contractAmount, false)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                      {formatCurrencyDA(p.budgetAmount, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#142B45] whitespace-nowrap">
                      {formatCurrencyDA(p.actualCost, false)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={p.status} type="project" />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/projects/${p.code}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#0A7F7C] hover:bg-teal-50 rounded border border-teal-200 transition-colors"
                      >
                        <span>Ouvrir</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Création Nouveau Projet — MICRO-DÉTAILS & CALCULS EN DIRECT */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#142B45] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0A7F7C]" />
                  Nouveau Marché Industriel — Saisie Contractuelle & Technique
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enregistrement et persistance directe dans la base PostgreSQL via Prisma ORM.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets rapides clients industriels */}
            {CLIENT_PRESETS.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-[#697789] uppercase tracking-wider mb-1.5">
                  Préréglages Clients Algériens (1 clic) :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 transition-colors font-medium text-slate-700"
                    >
                      {preset.name.split('/')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Code Projet <span className="text-[10px] font-normal text-slate-400">(auto si vide)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PRJ-2026-006"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Secteur Industriel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="OIL_AND_GAS">Oil & Gas (Pétrochimie & Gaz)</option>
                    <option value="ENERGIE">Énergie (Turbines & Centrales)</option>
                    <option value="SIDERURGIE">Sidérurgie & Métallurgie</option>
                    <option value="CIMENTERIE">Cimenteries & Granulats</option>
                    <option value="AUTRE_INDUSTRIE">Agroalimentaire & Autre Industrie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Intitulé du Projet / Objet du Marché <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rénovation Réseau Tuyauterie Vapeur HP & Skids de Pompage"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Client Contractuel (Maître d'Ouvrage) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SONATRACH / DP Hassi Messaoud"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Localisation du Chantier / Wilaya <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Zone Industrielle Arzew (Oran)"
                    value={siteLocation}
                    onChange={e => setSiteLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Financial calculations and Margin indicator in real time */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Montant Contractuel HT (DA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100000}
                      step={50000}
                      value={contractAmount}
                      onChange={e => setContractAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none font-bold text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-500">{formatCurrencyDA(contractAmount, false)}</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Budget Opérationnel Alloué (DA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100000}
                      step={50000}
                      value={budgetAmount}
                      onChange={e => setBudgetAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none font-bold text-slate-900 bg-white"
                    />
                    <span className="text-[10px] text-slate-500">{formatCurrencyDA(budgetAmount, false)}</span>
                  </div>
                </div>

                {/* Real-time calculated Gross Margin indicator */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Marge Brute Prévisionnelle :</span>
                    <strong className="text-slate-900 font-bold">{formatCurrencyDA(targetMarginDA, false)}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        Number(targetMarginPct) >= 20
                          ? 'bg-emerald-100 text-emerald-800'
                          : Number(targetMarginPct) >= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      +{targetMarginPct}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {Number(targetMarginPct) >= 20 ? '(Optimal)' : '(Sous le seuil de 20%)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates & duration calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date Démarrage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date Fin Contractuelle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={e => setContractEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    Durée estimée : <strong>{daysDuration} jours</strong> (~{Math.round(daysDuration / 30)} mois)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Spécifications Techniques & Contraintes Chantiers
                </label>
                <textarea
                  rows={2}
                  placeholder="Nuances d'acier (Inox 316L, P91, A106), épreuves hydrauliques 150 bars, contrôle radio CND..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:border-teal-600 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  <span className="text-red-500">*</span> Champs obligatoires pour validation DTO
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {submitting ? 'Enregistrement...' : 'Créer et Enregistrer le Marché'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
