'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ, SystemRole } from '@silex/shared';
import { GitPullRequest, CheckCircle2, ShieldCheck, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

export default function WorkflowsPage() {
  const { user, activeRole } = useAuth();
  const [inbox, setInbox] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/workflows/inbox');
      setInbox(res.items || []);
    } catch (err) {
      console.error('Erreur chargement workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Boîte de Réception des Validations & Arbitrages</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Circuit hiérarchique : Approbation des engagements d’achat, ordres de service et situations de travaux.
          </p>
        </div>
      </div>

      {/* Role banner if not DG */}
      {!isDG && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Vous êtes connecté avec le profil <strong>{user?.name} ({activeRole})</strong>. Utilisez le sélecteur en haut à droite pour basculer sur <strong>Directeur Général</strong> et exercer vos droits d’approbation finale.
          </span>
        </div>
      )}

      {/* List of pending items */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A7F7C]" />
            Dossiers Soumis à Décision ({inbox.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {inbox.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              Toutes les approbations sont à jour. Aucun arbitrage en attente.
            </div>
          ) : (
            inbox.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#142B45]">{item.reference}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      Urgence {item.urgencyLevel}
                    </span>
                    <span className="text-[11px] text-slate-400">Reçu le {formatDateDZ(item.date)}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Projet : <strong>{item.projectCode}</strong> — {item.projectName} • Demandeur : <strong>{item.requesterName}</strong> ({item.department})
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#142B45]">{formatCurrencyDA(item.amountHT)}</div>
                    <div className="text-[10px] text-slate-400">Montant HT proposé</div>
                  </div>
                  <Link
                    href={item.type === 'PURCHASE_REQUEST' ? '/procurement' : `/projects/${item.projectCode}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A7F7C] text-white text-xs font-semibold rounded hover:bg-[#086a67] transition-colors shadow-xs"
                  >
                    <span>Examiner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
