'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { COMPANY_NAME } from '@silex/shared';
import { Bell, LogOut, ShieldCheck, Menu } from 'lucide-react';

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const { user, currentProfile, activeRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.name || currentProfile.name;
  const displayRole = user?.role || activeRole;
  const displayTitle = user?.title || currentProfile.title;
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SX';

  return (
    <header className="h-16 bg-white border-b border-[#E1E6ED] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Menu Toggle & Brand Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu Toggle (< 1024px) */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="flex items-center gap-2 bg-slate-50 text-slate-800 border border-slate-200 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#0B207D] animate-pulse shrink-0" />
          <span className="hidden sm:inline text-[11px] font-bold tracking-wide uppercase text-slate-700">
            {COMPANY_NAME} • Plateforme ERP
          </span>
          <span className="sm:hidden text-[11px] font-bold tracking-wide uppercase text-slate-700">
            SILEX ERP
          </span>
        </div>

        <div className="hidden xl:flex items-center text-xs text-slate-500 gap-2 border-l border-slate-200 pl-4">
          <span>Fuseau : <strong className="text-slate-700">Africa/Algiers</strong></span>
          <span>•</span>
          <span>Devise : <strong className="text-[#0B207D] font-bold">Dinar algérien (DA)</strong></span>
        </div>
      </div>

      {/* Right: Notifications, Active User Identity & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          title="Notifications & Alertes de gestion"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E51A1A] rounded-full ring-2 ring-white" />
        </button>

        {/* Authenticated User Badge */}
        <div className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:px-3 rounded-lg border border-[#E1E6ED] bg-slate-50/50 text-left shadow-2xs">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B207D] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            {initials}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-[#182433] leading-tight flex items-center gap-1.5">
              <span className="truncate max-w-[140px]">{displayName}</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded font-semibold bg-blue-50 text-[#0B207D] border border-blue-100 flex items-center gap-0.5 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-[#0B207D]" />
                {displayRole.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-[11px] text-[#697789] truncate max-w-[180px]">{displayTitle}</div>
          </div>
        </div>

        {/* Logout Action */}
        <button
          type="button"
          onClick={handleLogout}
          title="Se déconnecter"
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 hover:text-red-600" />
        </button>
      </div>
    </header>
  );
}
