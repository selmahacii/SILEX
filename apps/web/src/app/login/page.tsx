'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { SILEX_DOMAINS, COMPANY_ESTABLISHED, COMPANY_NAME } from '@silex/shared';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setError('Veuillez renseigner votre email professionnel et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      await login(cleanEmail, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('[LOGIN ERROR]', err);
      setError(err?.message || 'Identifiants invalides. Vérifiez votre email et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuperAdmin = () => {
    setEmail('admin@silex-services.dz');
    setPassword('Silex2026@Admin!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07164D] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background industrial motif */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#8EA5E9_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Decorative gradient glowing spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Header Brand */}
        <div className="bg-[#05113B] p-4 sm:p-6 text-white text-center border-b border-[#152972] relative">
          <div className="flex sm:absolute sm:top-4 sm:right-4 justify-center mb-2 sm:mb-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E51A1A]/20 border border-[#E51A1A]/40 text-[10px] font-bold text-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51A1A] animate-pulse" />
              Portail National Algérie
            </div>
          </div>

          {/* Logo container */}
          <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white shadow-xl mb-3">
            <img
              src="/logo-silex.png"
              alt="SILEX SERVICES"
              className="h-14 w-auto object-contain"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center justify-center gap-2">
            <span>{COMPANY_NAME}</span>
          </h1>
          <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-widest">
            Plateforme ERP & Pilotage Industriel Multi-Chantiers
          </p>
          <div className="text-[11px] text-[#A2B6F0] mt-1.5 flex items-center justify-center gap-2 flex-wrap font-medium">
            <span>Établi en {COMPANY_ESTABLISHED}</span>
            <span>•</span>
            <span>Bases Opérationnelles : Arzew • Hassi Messaoud • Rouiba • Skikda</span>
          </div>
        </div>

        {/* 5 Domains Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-[#07164D] uppercase tracking-wider text-[10px]">
            <Award className="w-3.5 h-3.5 text-[#0A7F7C]" />
            <span>5 Pôles d'Excellence :</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SILEX_DOMAINS.map(d => (
              <span
                key={d.id}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                {d.shortTitle}
              </span>
            ))}
          </div>
        </div>

        {/* Card Body — Clean Direct Form */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-[#07164D]">Connexion à votre Espace Sécurisé</h2>
            <p className="text-xs text-slate-500">Renseignez vos identifiants pour accéder aux modules de gestion.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-[#E51A1A] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="admin@silex-services.dz"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B207D] focus:border-transparent text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B207D] focus:border-transparent text-slate-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label="Afficher ou masquer mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0B207D] hover:bg-[#07164D] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Vérification des habilitations en base...</span>
                </>
              ) : (
                <>
                  <span>Se connecter à la plateforme SILEX</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Superadmin Credentials Quick Pre-fill */}
          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#07164D]">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  <span>Accès Super-Administrateur Initial</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseSuperAdmin}
                  className="text-[11px] font-bold text-[#0B207D] hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200"
                >
                  Pré-remplir
                </button>
              </div>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>Email : <strong className="text-slate-900 font-mono">admin@silex-services.dz</strong></span>
                <span>Mot de passe : <strong className="text-slate-900 font-mono">Silex2026@Admin!</strong></span>
              </div>
              <div className="text-[10px] text-slate-500 italic pt-1 border-t border-blue-100">
                Une fois connecté en SuperAdmin, créez les collaborateurs et gérez les permissions RBAC micro-détaillées depuis le module Administration Système.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
          <span className="font-medium text-slate-700">SILEX SERVICES © 2015 – 2026</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0A7F7C]" />
            Normes ISO 9001 / ASME • Agrément National
          </span>
          <span className="text-slate-400 font-mono">Fuseau : Africa/Algiers</span>
        </div>
      </div>
    </div>
  );
}
