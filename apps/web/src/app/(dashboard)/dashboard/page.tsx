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
import { formatCurrencyDA } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';

export default function ExecutiveDashboardPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingWorkflows, setPendingWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisRes, projectsRes, workflowsRes] = await Promise.all([
        api.get<any>('/projects/kpis'),
        api.get<any[]>('/projects'),
        api.get<any>('/workflows/inbox'),
      ]);
      setKpis(kpisRes);
      setProjects(projectsRes);
      setPendingWorkflows(workflowsRes.items || []);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartProjectsData = projects.map(p => ({
    name: p.code,
    fullName: p.name,
    budget: Number(p.budgetAmount) / 1000000,
    engage: Number(p.committedCost) / 1000000,
    reel: Number(p.actualCost) / 1000000,
  }));

  const costDistribution = [
    { name: 'Fournitures & Tuyauterie', value: 45, color: '#142B45' },
    { name: 'Main d’œuvre & Soudeurs', value: 30, color: '#0A7F7C' },
    { name: 'Matériel & Levage', value: 15, color: '#D99B35' },
    { name: 'Sous-traitance & CND', value: 10, color: '#203D5A' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Tableau de Bord Exécutif — Direction Générale</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Pilotage consolidé des opérations, engagements chantiers et rentabilité SILEX Services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-md text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Link
            href="/workflows"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0A7F7C] text-white rounded-md hover:bg-[#086a67] transition-colors shadow-xs"
          >
            <span>Validations en attente</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
              {kpis?.pendingApprovalsCount || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires Contractuel */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Chiffre d’Affaires Engagé</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-md">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#182433] mt-2">
            {formatCurrencyDA(kpis?.totalTurnover, false)}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5 contrats industriels actifs</span>
          </div>
        </div>

        {/* Coûts Engagés vs Budgets */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Coûts Engagés (Commandes)</span>
            <span className="p-2 bg-teal-50 text-[#0A7F7C] rounded-md">
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
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Coûts Réels Consommés</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-md">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#182433] mt-2">
            {formatCurrencyDA(kpis?.totalActualCosts, false)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Marge prévisionnelle : <strong className="text-emerald-700 font-bold">+{kpis?.projectedMarginRate}%</strong>
          </div>
        </div>

        {/* Validations & Alertes */}
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697789]">Approbations en Attente</span>
            <span className="p-2 bg-rose-50 text-rose-700 rounded-md">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-[#C44747] mt-2 flex items-center gap-2">
            <span>{kpis?.pendingApprovalsCount || 0}</span>
            <span className="text-xs font-normal text-slate-500">décisions requises</span>
          </div>
          <Link
            href="/workflows"
            className="text-[11px] text-[#0A7F7C] hover:underline flex items-center gap-1 mt-1 font-semibold"
          >
            <span>Accéder à la boîte d’arbitrage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Budget vs Engagé vs Réalisé (Millions DA) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#182433]">Budget vs Engagements vs Réalisé (en Millions DA)</h2>
              <p className="text-[11px] text-[#697789]">Données calculées en temps réel depuis les tables chantiers</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#142B45]" />
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
                  labelFormatter={(name) => `Projet : ${name}`}
                />
                <Bar dataKey="budget" name="Budget" fill="#142B45" radius={[3, 3, 0, 0]} />
                <Bar dataKey="engage" name="Engagé" fill="#0A7F7C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="reel" name="Réel" fill="#D99B35" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-[#182433]">Répartition des Coûts par Catégorie</h2>
            <p className="text-[11px] text-[#697789]">Imputations analytiques chantiers</p>
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
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#182433]">Suivi des Projets Industriels</h2>
            <Link href="/projects" className="text-xs text-[#0A7F7C] font-semibold hover:underline">
              Voir tous les projets
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#142B45]">{p.code}</span>
                    <StatusBadge status={p.status} type="project" />
                    <StatusBadge status={p.riskLevel} type="risk" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate mt-1">{p.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.clientName} • {p.siteLocation}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">{formatCurrencyDA(p.contractAmount, false)}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Avanc. physique : {p.physicalProgress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Decisions / Pending Approvals */}
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#182433]">Arbitrages & Décisions en Attente</h2>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
              Priorité Direction
            </span>
          </div>
          <div className="p-4">
            {pendingWorkflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Aucune approbation en souffrance. Tous les flux sont à jour.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWorkflows.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#142B45]">{item.reference}</span>
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                          {item.urgencyLevel}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-0.5">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Demandeur : <strong>{item.requesterName}</strong> • Montant : <strong>{formatCurrencyDA(item.amountHT)}</strong>
                      </div>
                    </div>
                    <Link
                      href="/procurement"
                      className="px-3 py-1.5 bg-[#0A7F7C] text-white text-xs font-semibold rounded hover:bg-[#086a67] transition-colors shrink-0"
                    >
                      Arbitrer
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
