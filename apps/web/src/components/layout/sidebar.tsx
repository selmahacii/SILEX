'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SystemRole } from '@silex/shared';

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
    },
    {
      id: 'procurement',
      title: 'Achats & Approvisionnements',
      path: '/procurement',
      icon: ShoppingCart,
      badge: 'Flux clé',
    },
    {
      id: 'inventory',
      title: 'Stocks & Magasins',
      path: '/inventory',
      icon: Boxes,
    },
    {
      id: 'hr',
      title: 'Ressources humaines',
      path: '/hr',
      icon: Users,
    },
    {
      id: 'finance',
      title: 'Finance & Rentabilité',
      path: '/finance',
      icon: Coins,
    },
    {
      id: 'maintenance',
      title: 'Parc & Maintenance',
      path: '/maintenance',
      icon: Truck,
    },
    {
      id: 'quality',
      title: 'Documents & Qualité',
      path: '/quality',
      icon: FileCheck,
    },
    {
      id: 'workflows',
      title: 'Workflows & Validations',
      path: '/workflows',
      icon: GitPullRequest,
    },
    {
      id: 'reports',
      title: 'Rapports & Exports',
      path: '/reports',
      icon: BarChart3,
    },
    {
      id: 'admin',
      title: 'Administration Système',
      path: '/admin',
      icon: ShieldAlert,
    },
    {
      id: 'settings',
      title: 'Paramètres',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#142B45] text-slate-100 flex flex-col shrink-0 border-r border-[#203D5A] select-none h-screen sticky top-0">
      {/* Brand & Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#203D5A] bg-[#0E1F33]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0A7F7C] flex items-center justify-center font-bold text-white shadow-inner">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-white text-base leading-tight">SILEX ERP</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Services Industriels</div>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase px-3 pb-2 tracking-wider">
          Navigation Opérationnelle
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#0A7F7C] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-[#203D5A] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D99B35] text-slate-900 font-bold shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-[#203D5A] bg-[#0E1F33] text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Plateforme Industrielle</span>
          <span className="text-[#0A7F7C] font-semibold">v1.0 Demo</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">Sonatrach / SPE / Sider / Cimenteries</div>
      </div>
    </aside>
  );
}
