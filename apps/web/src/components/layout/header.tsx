'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DEMO_PROFILES, SystemRole, COMPANY_NAME } from '@silex/shared';
import { ChevronDown, AlertCircle, Shield, UserCheck, Bell, LogOut } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { currentProfile, activeRole, switchRole, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectRole = async (role: SystemRole) => {
    setDropdownOpen(false);
    await switchRole(role);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#E1E6ED] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Demo Banner & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1 rounded text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#E51A1A] animate-pulse" />
          <span className="text-[11px] font-bold tracking-wide uppercase text-slate-700">
            {COMPANY_NAME} • Démo Interactive
          </span>
        </div>
        <div className="hidden md:flex items-center text-xs text-slate-500 gap-2 border-l border-slate-200 pl-4">
          <span>Fuseau : <strong className="text-slate-700">Africa/Algiers</strong></span>
          <span>•</span>
          <span>Devise : <strong className="text-[#0B207D] font-bold">Dinar algérien (DA)</strong></span>
          <span>•</span>
          <span>TVA : <strong className="text-slate-700">19%</strong></span>
        </div>
      </div>

      {/* Right: Notifications, Demo Profile Switcher & Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          title="Notifications & Alertes de gestion"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E51A1A] rounded-full ring-2 ring-white" />
        </button>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg border border-[#E1E6ED] hover:border-[#0B207D] hover:bg-slate-50 transition-colors text-left bg-white shadow-2xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B207D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {currentProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#182433] leading-tight flex items-center gap-1.5">
                {currentProfile.name}
                <span className="text-[9.5px] px-1.5 py-0.2 rounded font-semibold bg-blue-50 text-[#0B207D] border border-blue-100">
                  {currentProfile.role.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-[11px] text-[#697789]">{currentProfile.title}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E1E6ED] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-[#07164D] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#0B207D]" />
                  Sélecteur de Profils SILEX SERVICES
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Commutation serveur avec recalcul immédiat des habilitations RBAC/ABAC.
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {(Object.keys(DEMO_PROFILES) as SystemRole[]).map(roleKey => {
                  const profile = DEMO_PROFILES[roleKey];
                  const isSelected = activeRole === roleKey;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleSelectRole(roleKey)}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-[#0B207D]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#0B207D] text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#182433] truncate">{profile.name}</span>
                          {isSelected && <UserCheck className="w-4 h-4 text-[#0B207D] shrink-0" />}
                        </div>
                        <div className="text-[11px] font-medium text-[#0B207D] truncate">{profile.title}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{profile.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer with Logout */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter (Portail d'authentification)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          title="Déconnexion de session"
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
