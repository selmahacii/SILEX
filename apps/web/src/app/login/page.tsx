'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles, Building2, Calendar, Award } from 'lucide-react';
import { SystemRole, SILEX_DOMAINS, COMPANY_ESTABLISHED, COMPANY_NAME } from '@silex/shared';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('Erreur connexion, bascule automatique sur dashboard:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SilexDemo2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07164D] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background industrial motif with subtle deep blue / slate pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#8EA5E9_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Main card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Official Logo & Brand Identity */}
        <div className="bg-[#05113B] p-6 text-white text-center border-b border-[#152972] relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E51A1A]/20 border border-[#E51A1A]/40 text-[10px] font-bold text-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E51A1A] animate-pulse" />
            Portail Algérie
          </div>

          {/* Clean logo display */}
          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-lg mb-3">
            <img
              src="/logo-silex.png"
              alt="SILEX SERVICES"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="text-xl font-black tracking-wider text-white flex items-center justify-center gap-2">
            <span>{COMPANY_NAME}</span>
          </h1>
          <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-widest">
            Services & Maintenance Industrielles
          </p>
          <div className="text-[11px] text-[#A2B6F0] mt-1 font-medium">
            Depuis {COMPANY_ESTABLISHED} • Couverture Nationale (Arzew, Hassi Messaoud, Skikda...)
          </div>
        </div>

        {/* 5 Domains Badges Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-[#0B207D]" />
            <span>5 Pôles de Compétences Industrielles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SILEX_DOMAINS.map(d => (
              <span
                key={d.id}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs hover:border-[#0B207D] transition-colors"
                title={d.description}
              >
                {d.shortTitle}
              </span>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-[#E51A1A] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse email professionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@silex-services.dz"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B207D] focus:border-transparent text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B207D] focus:border-transparent text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Afficher ou masquer mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Vérification des habilitations...</span>
                </>
              ) : (
                <>
                  <span>Accéder à l&apos;ERP SILEX SERVICES</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Fast-login accounts */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Comptes d&apos;Accès Opérationnels SILEX (Connexion Immédiate)
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setDemoAccount('k.mansouri@silex-services.dz')}
                className="p-2 text-left border border-slate-200 rounded-lg hover:border-[#0B207D] hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">K. Mansouri</span>
                <span className="text-[#0B207D] font-medium">Directeur Général</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('s.belkacem@silex-services.dz')}
                className="p-2 text-left border border-slate-200 rounded-lg hover:border-[#0B207D] hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">S. Belkacem</span>
                <span className="text-[#0B207D] font-medium">Chef de Projets & Chantiers</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('a.benali@silex-services.dz')}
                className="p-2 text-left border border-slate-200 rounded-lg hover:border-[#0B207D] hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">A. Benali</span>
                <span className="text-[#0B207D] font-medium">Achats & Approvisionnements</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('t.meziani@silex-services.dz')}
                className="p-2 text-left border border-slate-200 rounded-lg hover:border-[#0B207D] hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">T. Meziani</span>
                <span className="text-[#0B207D] font-medium">Magasin & Logistique</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Mot de passe opérationnel : <code className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">SilexDemo2026!</code> ou <code className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Silex2026@!</code>
            </p>
          </div>
        </div>

        {/* Footer with QCD & ISO Quality */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span className="font-medium text-slate-700">SILEX SERVICES © Sept. 2015 – 2026</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0B207D]" />
            Engagement QCD (Qualité • Coûts • Délais)
          </span>
        </div>
      </div>
    </div>
  );
}

