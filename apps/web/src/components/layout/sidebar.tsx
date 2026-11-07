'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  Boxes,
  Users,
  Coins,
  Truck,
  FileCheck,
  GitPullRequest,
  BarChart3,
  ShieldAlert,
  Settings,
  Flame,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle,
  Lock,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SystemRole, SILEX_DOMAINS, COMPANY_ESTABLISHED } from '@silex/shared';

interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  allowedRoles?: SystemRole[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { activeRole } = useAuth();
  const [showDomainsModal, setShowDomainsModal] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const res = await api.get<any>('/workflows/inbox');
        if (isMounted && res) {
          setPendingApprovals(res.totalPending ?? res.items?.length ?? 0);
        }
      } catch {
        // Silencieux si non authentifié ou pas de droits
      }
    };
    fetchPending();
    return () => { isMounted = false; };
  }, [activeRole, pathname]);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'projects',
      title: 'Gestion des projets',
      path: '/projects',
      icon: Briefcase,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.RESPONSABLE_FINANCIER,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.RESPONSABLE_QUALITE,
        SystemRole.RESPONSABLE_MAGASIN,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'procurement',
      title: 'Achats & Approvisionnements',
      path: '/procurement',
      icon: ShoppingCart,
      badge: 'Flux clé',
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_MAGASIN,
        SystemRole.RESPONSABLE_FINANCIER,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'inventory',
      title: 'Stocks & Magasins',
      path: '/inventory',
      icon: Boxes,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_MAGASIN,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'hr',
      title: 'Ressources humaines',
      path: '/hr',
      icon: Users,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_RH,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Rentabilité',
      path: '/finance',
      icon: Coins,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_FINANCIER,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'maintenance',
      title: 'Parc & Maintenance',
      path: '/maintenance',
      icon: Truck,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'quality',
      title: 'Documents & Qualité',
      path: '/quality',
      icon: FileCheck,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_QUALITE,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'workflows',
      title: 'Workflows & Validations',
      path: '/workflows',
      icon: GitPullRequest,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_FINANCIER,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'reports',
      title: 'Rapports & Exports',
      path: '/reports',
      icon: BarChart3,
      allowedRoles: [
        SystemRole.DIRECTEUR_GENERAL,
        SystemRole.RESPONSABLE_PROJET,
        SystemRole.RESPONSABLE_ACHATS,
        SystemRole.RESPONSABLE_FINANCIER,
        SystemRole.RESPONSABLE_MAINTENANCE,
        SystemRole.RESPONSABLE_QUALITE,
        SystemRole.ADMINISTRATEUR,
      ],
    },
    {
      id: 'admin',
      title: 'Administration Système',
      path: '/admin',
      icon: ShieldAlert,
      allowedRoles: [
        SystemRole.ADMINISTRATEUR,
        SystemRole.DIRECTEUR_GENERAL,
      ],
    },
    {
      id: 'settings',
      title: 'Paramètres',
      path: '/settings',
      icon: Settings,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
    return activeRole ? item.allowedRoles.includes(activeRole) : true;
  });

  return (
    <aside className="w-64 bg-[#07164D] text-slate-100 flex flex-col shrink-0 border-r border-[#152972] select-none h-screen sticky top-0 shadow-lg">
      {/* Brand & Corporate Logo Header */}
      <div className="h-20 flex items-center px-4 border-b border-[#152972] bg-[#05113B] justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Logo container with clean white background for high-contrast B2B rendering */}
          <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img
              src="/logo-silex.png"
              alt="SILEX SERVICES Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-wider text-white text-base leading-tight">SILEX</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E51A1A] text-white tracking-widest uppercase">
                DZ
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-semibold truncate tracking-wider uppercase">
              SERVICES
            </div>
            <div className="text-[9px] text-[#A2B6F0] flex items-center gap-1">
              <span>Depuis Sept. 2015</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="flex items-center justify-between px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Navigation Opérationnelle</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E51A1A]" title="Système Opérationnel" />
        </div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B207D] text-white shadow-sm font-semibold border-l-4 border-[#E51A1A] pl-2.5'
                  : 'text-slate-300 hover:bg-[#122668] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8EA5E9]'}`} />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E51A1A] text-white font-bold shrink-0 shadow-2xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Direct Link to Login Portal */}
      <div className="px-3 py-1.5 border-t border-[#152972] bg-[#05113B]/80">
        <Link
          href="/login"
          className="w-full flex items-center justify-between p-2 rounded bg-[#091C5C] hover:bg-[#0E287C] border border-[#1C3691] text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#E51A1A] group-hover:scale-110 transition-transform" />
            <span className="text-[11px]">Portail de Connexion</span>
          </div>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/60 font-mono">
            /login
          </span>
        </Link>
      </div>

      {/* 5 Domains of Activity Button / Mini-card */}
      <div className="px-3 py-2 border-t border-[#152972] bg-[#05113B]/70">
        <button
          onClick={() => setShowDomainsModal(true)}
          className="w-full text-left p-2 rounded bg-[#091C5C] hover:bg-[#0E287C] border border-[#1C3691] transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E51A1A]" />
              5 Domaines d&apos;Activité
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-[10px] text-slate-300 truncate">
            Tuyauterie, Élec, Froid, Maintenance...
          </div>
        </button>
      </div>

      {/* Corporate Footer info */}
      <div className="p-3 border-t border-[#152972] bg-[#05113B] text-[11px] text-slate-300">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-400">ERP SILEX SERVICES</span>
          <span className="text-[#E51A1A] font-bold text-[10px] bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/40">
            v1.0 Pro
          </span>
        </div>
        <div className="text-[9.5px] text-slate-400 mt-1 truncate">
          QCD : Qualité • Coûts • Délais
        </div>
      </div>

      {/* Modal / Flyout for the 5 Domains of Activity */}
      {showDomainsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="bg-[#07164D] p-5 text-white flex items-center justify-between border-b border-[#152972]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
                  <img src="/logo-silex.png" alt="SILEX" className="h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">SILEX SERVICES</h3>
                  <p className="text-xs text-slate-300">
                    5 Domaines d&apos;Activité Officiels • Créée en {COMPANY_ESTABLISHED}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDomainsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
                Notre politique vise à apporter des solutions pour nos clients sur l&apos;ensemble du territoire Algérien
                dans le respect strict de la <strong>Qualité, des Coûts et des Délais (QCD)</strong>.
              </div>

              <div className="space-y-2.5">
                {SILEX_DOMAINS.map((dom, idx) => (
                  <div
                    key={dom.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#0B207D] hover:shadow-xs transition-all bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0B207D] text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{dom.title}</h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#0B207D]">
                        {dom.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-7">{dom.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDomainsModal(false)}
                className="px-4 py-2 bg-[#07164D] hover:bg-[#0B207D] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

