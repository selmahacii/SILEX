'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { SystemRole } from '@silex/shared';
import { 
  Crown, 
  TrendingUp, 
  Briefcase, 
  ShoppingCart, 
  Users, 
  Coins, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface RoleProfile {
  id: string;
  role: SystemRole;
  label: string;
  shortLabel: string;
  userName: string;
  userEmail: string;
  color: string;
  activeColor: string;
  icon: React.ElementType;
  description: string;
}

const DEMO_ROLES: RoleProfile[] = [
  {
    id: 'dg',
    role: SystemRole.DIRECTEUR_GENERAL,
    label: 'Direction Générale',
    shortLabel: 'DG',
    userName: 'Amine Benali',
    userEmail: 'dg@silex-services.dz',
    color: 'hover:bg-indigo-900/60 text-indigo-300 border-indigo-700/50',
    activeColor: 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 border-indigo-500 shadow-md',
    icon: Crown,
    description: 'Accès illimité • Arbitrage marges & Validation projets',
  },
  {
    id: 'commercial',
    role: SystemRole.RESPONSABLE_PROJET, // Mappé sur commercial avec profil commercial
    label: 'Commercial',
    shortLabel: 'COMMERCIAL',
    userName: 'Yacine Hamidi',
    userEmail: 'commercial@silex-services.dz',
    color: 'hover:bg-amber-900/60 text-amber-300 border-amber-700/50',
    activeColor: 'bg-amber-600 text-white font-bold ring-2 ring-amber-400 border-amber-500 shadow-md',
    icon: TrendingUp,
    description: 'Chiffrage • Fiches de coût • Devis & Créances',
  },
  {
    id: 'projet',
    role: SystemRole.RESPONSABLE_PROJET,
    label: 'Projets / Travaux',
    shortLabel: 'PROJET',
    userName: 'Karim Mansouri',
    userEmail: 'projets@silex-services.dz',
    color: 'hover:bg-blue-900/60 text-blue-300 border-blue-700/50',
    activeColor: 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 border-blue-500 shadow-md',
    icon: Briefcase,
    description: 'Chantiers • Planning • Rapports journaliers & HSE',
  },
  {
    id: 'achats',
    role: SystemRole.RESPONSABLE_ACHATS,
    label: 'Achats & Stocks',
    shortLabel: 'ACHATS',
    userName: 'Farouk Brahimi',
    userEmail: 'achats@silex-services.dz',
    color: 'hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    activeColor: 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 border-emerald-500 shadow-md',
    icon: ShoppingCart,
    description: 'Demandes d\'achat • TCO 3 offres • Bons de commande',
  },
  {
    id: 'rh',
    role: SystemRole.RESPONSABLE_RH,
    label: 'Ressources Humaines',
    shortLabel: 'RH',
    userName: 'Sabrina Haddad',
    userEmail: 'rh@silex-services.dz',
    color: 'hover:bg-rose-900/60 text-rose-300 border-rose-700/50',
    activeColor: 'bg-rose-600 text-white font-bold ring-2 ring-rose-400 border-rose-500 shadow-md',
    icon: Users,
    description: 'Effectifs • Pointages chantier • Paie & Déclarations',
  },
  {
    id: 'finance',
    role: SystemRole.RESPONSABLE_FINANCIER,
    label: 'Finance & Trésorerie',
    shortLabel: 'FINANCE',
    userName: 'Réda Bouzid',
    userEmail: 'finance@silex-services.dz',
    color: 'hover:bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
    activeColor: 'bg-cyan-600 text-white font-bold ring-2 ring-cyan-400 border-cyan-500 shadow-md',
    icon: Coins,
    description: 'Avis faisabilité • Contrôle budgétaire • Trésorerie',
  },
];

export function DemoRoleSwitcher() {
  const { user, activeRole, switchRole, loading } = useAuth();

  // Déterminer le profil actif
  const currentRoleProfile = DEMO_ROLES.find(r => {
    if (r.id === 'commercial' && user?.email?.includes('commercial')) return true;
    if (r.id === 'projet' && (user?.email?.includes('projets') || user?.email?.includes('k.mansouri'))) return true;
    return r.role === activeRole && r.id !== 'commercial';
  }) || DEMO_ROLES[0];

  const handleSelectRole = async (profile: RoleProfile) => {
    if (loading) return;
    try {
      await switchRole(profile.role);
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  return (
    <div className="w-full bg-[#0a1128] border-b border-slate-800 text-slate-200 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none shadow-md sticky top-0 z-50">
      {/* Label Gauche */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold tracking-wide uppercase text-[10.5px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
          <span>DÉMO LIVE • RBAC SWITCHER</span>
        </div>
        <span className="hidden md:inline text-[11px] text-slate-400">
          Profil actif : <strong className="text-white font-semibold">{user?.name || currentRoleProfile.userName}</strong> ({currentRoleProfile.label})
        </span>
      </div>

      {/* 6 Boutons de commutation instantanée */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
        {DEMO_ROLES.map((p) => {
          const Icon = p.icon;
          const isSelected = 
            (p.id === 'commercial' && user?.email?.includes('commercial')) ||
            (p.id === 'projet' && !user?.email?.includes('commercial') && (user?.email?.includes('projets') || user?.email?.includes('k.mansouri'))) ||
            (p.role === activeRole && p.id !== 'commercial' && p.id !== 'projet') ||
            (p.id === 'dg' && activeRole === SystemRole.DIRECTEUR_GENERAL);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectRole(p)}
              disabled={loading}
              title={`${p.label} (${p.userName}) — ${p.description}`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border transition-all cursor-pointer whitespace-nowrap ${
                isSelected ? p.activeColor : `${p.color} bg-slate-900/60 border-slate-700/60`
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">{p.shortLabel}</span>
              {isSelected && (
                <ShieldCheck className="w-3 h-3 ml-0.5 text-white/90" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
