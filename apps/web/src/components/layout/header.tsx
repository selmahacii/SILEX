'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DEMO_PROFILES, SystemRole } from '@silex/shared';
import { ChevronDown, AlertCircle, Shield, UserCheck, Bell } from 'lucide-react';

export function Header() {
  const { currentProfile, activeRole, switchRole, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectRole = async (role: SystemRole) => {
    setDropdownOpen(false);
    await switchRole(role);
  };

  return (
    <header className="h-16 bg-white border-b border-[#E1E6ED] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Demo Banner & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>MODE DÉMONSTRATION — DONNÉES FICTIVES</span>
        </div>
        <div className="hidden md:flex items-center text-xs text-slate-500 gap-2 border-l border-slate-200 pl-4">
          <span>Fuseau : <strong className="text-slate-700">Africa/Algiers</strong></span>
          <span>•</span>
          <span>Devise : <strong className="text-slate-700">Dinar algérien (DA)</strong></span>
        </div>
      </div>

      {/* Right: Notifications & Demo Profile Switcher */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          title="Notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C44747] rounded-full ring-2 ring-white" />
        </button>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg border border-[#E1E6ED] hover:bg-slate-50 transition-colors text-left bg-white shadow-2xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#142B45] text-white flex items-center justify-center font-bold text-xs">
              {currentProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#182433] leading-tight flex items-center gap-1.5">
                {currentProfile.name}
                <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-slate-100 text-slate-600 border border-slate-200">
                  {currentProfile.role.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-[11px] text-[#697789]">{currentProfile.title}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E1E6ED] rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-[#142B45] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#0A7F7C]" />
                  Sélecteur de Profils de Démonstration
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Commutation serveur avec recalcul instantané des habilitations RBAC/ABAC.
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto py-1">
                {(Object.keys(DEMO_PROFILES) as SystemRole[]).map(roleKey => {
                  const profile = DEMO_PROFILES[roleKey];
                  const isSelected = activeRole === roleKey;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleSelectRole(roleKey)}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-teal-50/70 border-l-4 border-[#0A7F7C]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#0A7F7C] text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#182433] truncate">{profile.name}</span>
                          {isSelected && <UserCheck className="w-4 h-4 text-[#0A7F7C] shrink-0" />}
                        </div>
                        <div className="text-[11px] font-medium text-[#0A7F7C] truncate">{profile.title}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{profile.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
