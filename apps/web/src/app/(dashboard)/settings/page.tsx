'use client';

import React from 'react';
import { Settings, Globe, Shield, Clock, Coins } from 'lucide-react';
import { TIMEZONE, LOCALE, CURRENCY, COMPANY_NAME, APP_NAME } from '@silex/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#182433]">Paramètres Généraux de la Plateforme</h1>
        <p className="text-xs text-[#697789] mt-0.5">
          Configuration régionale, sécurité et paramètres d'exploitation SILEX ERP.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E1E6ED] shadow-2xs max-w-2xl space-y-4 text-xs">
        <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider pb-2 border-b border-slate-100">
          Format Régional & Normes Algériennes
        </h2>

        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Entreprise :</span>
          <strong className="text-slate-800">{COMPANY_NAME} (Algérie)</strong>
        </div>

        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Fuseau Horaire :</span>
          <strong className="text-slate-800">{TIMEZONE}</strong>
        </div>

        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Devise des Transactions :</span>
          <strong className="text-[#0A7F7C] font-bold">Dinar Algérien ({CURRENCY})</strong>
        </div>

        <div className="flex justify-between py-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Format des Dates :</span>
          <strong className="text-slate-800">JJMMAAAA (24 heures)</strong>
        </div>

        <div className="flex justify-between py-2">
          <span className="text-slate-500 font-medium">Mode Système :</span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
            DÉMONSTRATION ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
