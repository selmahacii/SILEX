'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur interceptée par la frontière applicative SILEX:', error);
  }, [error]);

  const displayMessage =
    error?.message ||
    (typeof error === 'string'
      ? error
      : 'Une interruption temporaire de la session ou du réseau a été détectée.');

  return (
    <div className="min-h-screen bg-[#07164D] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-[#E51A1A]" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Notification de Session SILEX
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {displayMessage}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-3 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réactualiser</span>
          </button>
          <Link
            href="/login"
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <LogIn className="w-4 h-4 text-[#0B207D]" />
            <span>Connexion ERP</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
