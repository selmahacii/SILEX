'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateDZ, formatDateTimeDZ, SystemRole } from '@silex/shared';
import { Shield, Users, RotateCcw, AlertTriangle, CheckCircle2, History } from 'lucide-react';

export default function AdminPage() {
  const { user, activeRole } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usrs, logs] = await Promise.all([
        api.get<any[]>('/users'),
        api.get<any[]>('/audit?limit=25'),
      ]);
      setUsersList(usrs);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Erreur admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      const res = await api.post<any>('/users/reset-demo');
      setShowResetModal(false);
      await loadAdminData();
      alert(res.message || 'Données de démonstration réinitialisées avec succès.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  const isAdmin = activeRole === SystemRole.ADMINISTRATEUR;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Administration Système & Sécurité</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Comptes de démonstration, matrice des permissions, traçabilité immuable et maintenance.
          </p>
        </div>
        <div>
          {isAdmin && (
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C44747] text-white text-xs font-semibold rounded hover:bg-[#a83838] transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser les données démo
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Connectez-vous en tant qu'<strong>Administrateur Système</strong> (via le sélecteur en haut à droite) pour exécuter la réinitialisation de la base de démonstration.
          </span>
        </div>
      )}

      {/* Grid: Users Table & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Users (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#0A7F7C]" />
              Comptes Utilisateurs & Rôles Définis
            </h2>
            <span className="text-[11px] text-slate-500">{usersList.length} profils configurés</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {usersList.map(u => (
              <div key={u.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                <div>
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.title} • {u.email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Département : {u.department?.name}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#0A7F7C]" />
              Journal d’Audit Immuable
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
              ISO 9001
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px] p-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 text-xs space-y-1 hover:bg-slate-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#142B45] text-[10px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{formatDateTimeDZ(log.createdAt)}</span>
                </div>
                <div className="text-slate-700 text-[11px] leading-snug">{log.description}</div>
                <div className="text-[10px] text-slate-500">
                  Auteur : <strong>{log.performerName}</strong> ({log.performerRole})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALE RÉINITIALISATION DÉMO */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Confirmation de Réinitialisation Démo</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cette action va réinitialiser l’ensemble des flux transactionnels de démonstration (Demandes d’Achat, Bons de Commande, Réceptions Magasins, Sorties Chantiers) à leur état initial.
            </p>
            <p className="text-xs text-slate-600">
              Voulez-vous réinitialiser les données de démonstration de <strong>SILEX SERVICES</strong> ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resetting}
                className="px-4 py-1.5 bg-[#C44747] text-white text-xs font-bold rounded hover:bg-[#a83838]"
              >
                {resetting ? 'Réinitialisation en cours...' : 'Confirmer la réinitialisation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
