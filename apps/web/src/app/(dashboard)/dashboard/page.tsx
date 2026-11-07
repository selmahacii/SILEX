'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  Building2,
  Coins,
  RefreshCw,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  Wrench,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, SILEX_DOMAINS, COMPANY_NAME, COMPANY_ESTABLISHED } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'accompagnement-projets': Compass,
  'electricite-instrumentation': Zap,
  'froid-industriel': Snowflake,
  'tuyauterie-chaudronnerie-isolation': Flame,
  'maintenance-industrielle': Wrench,
};

const DOMAIN_HREF_MAP: Record<string, string> = {
  'accompagnement-projets': '/projects?domain=accompagnement',
  'electricite-instrumentation': '/projects?domain=electricite',
  'froid-industriel': '/projects?domain=froid',
  'tuyauterie-chaudronnerie-isolation': '/projects?domain=tuyauterie',
  'maintenance-industrielle': '/projects?domain=maintenance',
};

export default function ExecutiveDashboardPage() {
  const { activeRole } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingWorkflows, setPendingWorkflows] = useState<any[]>([]);
  const [costDistribution, setCostDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, projectsRes, workflowsRes, distRes] = await Promise.all([
        api.get<any>('/projects/kpis'),
        api.get<any[]>('/projects'),
        api.get<any>('/workflows/inbox'),
        api.get<any[]>('/finance/distribution'),
      ]);
      setKpis(kpisRes);
      setProjects(projectsRes);
      setPendingWorkflows(workflowsRes?.items || []);
      setCostDistribution(distRes && distRes.length > 0 ? distRes : [
        { name: 'Tuyauterie, Soudage & Matériaux', value: 45, color: '#0B207D' },
        { name: 'Main d’œuvre & Soudeurs ASME', value: 30, color: '#0A7F7C' },
        { name: 'Froid, HVAC & Électricité', value: 15, color: '#D99B35' },
        { name: 'Sous-traitance & Contrôles CND', value: 10, color: '#E51A1A' },
      ]);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const chartProjectsData = projects.slice(0, 7).map(p => ({
    name: p.code,
    fullName: p.name,
    budget: Math.round((Number(p.budgetAmount) / 1000000) * 10) / 10,
    engage: Math.round((Number(p.committedCost) / 1000000) * 10) / 10,
    reel: Math.round((Number(p.actualCost) / 1000000) * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Corporate Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
            <img src="/logo-silex.png" alt="SILEX" className="h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#07164D] tracking-tight">{COMPANY_NAME}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E51A1A]/10 text-[#E51A1A] border border-[#E51A1A]/30 uppercase">
                Direction Générale
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fondée en {COMPANY_ESTABLISHED} • Services et maintenance industrielles, accompagnement de projets sur tout le territoire national.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Link
            href="/workflows"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs"
          >
            <span>Validations en attente</span>
            <span className="bg-[#E51A1A] px-1.5 py-0.2 rounded text-[10px] font-bold text-white shadow-2xs">
              {kpis?.pendingApprovalsCount || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* 5 Domains of Activity Showcase Grid */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0B207D]" />
            <h2 className="text-sm font-bold text-[#07164D] uppercase tracking-wide">
              5 Domaines d&apos;Activité Officiels — Compétences Clés
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Respect strict des engagements QCD (Qualité • Coûts • Délais)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SILEX_DOMAINS.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id] || Compass;
            return (
              <div
                key={domain.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-[#0B207D] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-md bg-white border border-slate-200 text-[#0B207D] shadow-2xs group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0B207D]">
                      {domain.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{domain.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {domain.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                  <span className="font-semibold text-emerald-700">Chantiers Actifs</span>
                  <Link
                    href={DOMAIN_HREF_MAP[domain.id] || '/projects'}
                    className="text-[#0B207D] font-bold hover:underline flex items-center gap-0.5"
                  >
                    Voir <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires Contractuel */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Chiffre d’Affaires Engagé</span>
            <span className="p-2 bg-blue-50 text-[#0B207D] rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#182433] mt-2">
            {formatCurrencyDA(kpis?.totalTurnover, false)}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis?.activeProjectsCount ?? projects.length} contrats industriels actifs</span>
          </div>
        </div>

        {/* Coûts Engagés vs Budgets */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Coûts Engagés (Commandes)</span>
            <span className="p-2 bg-teal-50 text-[#0A7F7C] rounded-lg">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#182433] mt-2">
            {formatCurrencyDA(kpis?.totalCommittedCosts, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Budget prévu : <strong>{formatCurrencyDA(kpis?.totalProjectBudgets, false)}</strong>
          </div>
        </div>

        {/* Coûts Réels Consommés */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Coûts Réels Consommés</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#182433] mt-2">
            {formatCurrencyDA(kpis?.totalActualCosts, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Marge brute prévisionnelle : <strong className="text-emerald-700 font-bold">+{kpis?.projectedMarginRate}%</strong>
          </div>
        </div>

        {/* Validations & Alertes */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Approbations en Attente</span>
            <span className="p-2 bg-rose-50 text-[#E51A1A] rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#E51A1A] mt-2 flex items-center gap-2">
            <span>{kpis?.pendingApprovalsCount || 0}</span>
            <span className="text-xs font-normal text-slate-500">arbitrages requis</span>
          </div>
          <Link
            href="/workflows"
            className="text-[11px] text-[#0B207D] hover:underline flex items-center gap-1 mt-1 font-semibold"
          >
            <span>Accéder à la boîte d’arbitrage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Budget vs Engagé vs Réalisé (Millions DA) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#182433]">Budget vs Engagements vs Réalisé (en Millions DA)</h2>
              <p className="text-[11px] text-[#697789]">Données consolidées temps réel des chantiers SILEX</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0B207D]" />
                <span>Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0A7F7C]" />
                <span>Engagé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#D99B35]" />
                <span>Réel</span>
              </div>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartProjectsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F3F7" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#697789' }} />
                <YAxis tick={{ fontSize: 11, fill: '#697789' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Millions DA`, '']}
                  labelFormatter={(name) => `Chantier : ${name}`}
                />
                <Bar dataKey="budget" name="Budget" fill="#0B207D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engage" name="Engagé" fill="#0A7F7C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reel" name="Réel" fill="#D99B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-[#182433]">Répartition Analytique des Dépenses</h2>
            <p className="text-[11px] text-[#697789]">Imputations par corps d&apos;état</p>
          </div>
          <div className="h-60 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Part']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Projects & Immediate Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Status Summary */}
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#182433]">Suivi des Projets Industriels</h2>
            <Link href="/projects" className="text-xs text-[#0B207D] font-semibold hover:underline">
              Voir tous les projets
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.code}`}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group block"
                title={`Accéder à la fiche complète du chantier ${p.code}`}
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0B207D] group-hover:underline flex items-center gap-1">
                      {p.code}
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#0B207D]" />
                    </span>
                    <StatusBadge status={p.status} type="project" />
                    <StatusBadge status={p.riskLevel} type="risk" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate mt-1 group-hover:text-[#0B207D] transition-colors">{p.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.clientName} • {p.siteLocation}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">{formatCurrencyDA(p.contractAmount, false)}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Avanc. physique : {p.physicalProgress}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Priority Decisions / Pending Approvals */}
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#182433]">Arbitrages & Décisions en Attente</h2>
            <span className="text-[10px] bg-red-100 text-[#E51A1A] font-bold px-2 py-0.5 rounded">
              Priorité Direction
            </span>
          </div>
          <div className="p-4">
            {pendingWorkflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>Tous les arbitrages sont à jour. Aucun blocage sur les chantiers.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWorkflows.slice(0, 4).map((w: any) => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs hover:border-[#0B207D] transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {w.reference}
                        </span>
                        <span className="font-bold text-slate-800 truncate">
                          {w.type === 'PURCHASE_REQUEST' ? "Demande d'Achat (DA)" : "Situation de Travaux"}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          w.urgencyLevel === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {w.urgencyLevel || 'NORMAL'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 truncate">
                        {w.title} • Chantier :{' '}
                        <Link
                          href={`/projects/${w.projectCode}`}
                          className="font-semibold text-[#0B207D] hover:underline"
                        >
                          {w.projectCode}
                        </Link>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Demandeur : <strong>{w.requesterName}</strong> ({w.department}) • Montant : <strong className="text-slate-800">{formatCurrencyDA(Number(w.amountHT || 0), false)} HT</strong>
                      </div>
                    </div>
                    <Link
                      href="/workflows"
                      className="px-3 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white text-[11px] font-bold rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0"
                    >
                      Arbitrer (DG)
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
