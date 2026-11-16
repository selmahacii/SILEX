'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07164D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-[#0B207D]">
          <FileQuestion className="w-7 h-7" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold mb-3">
          Erreur 404 — Page Non Trouvée
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Ressource Introuvable
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Le module, document ou chantier demandé n'existe pas ou n'est plus accessible avec vos droits actuels.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Page Précédente</span>
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 px-3 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Tableau de Bord</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
