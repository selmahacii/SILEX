'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ, SystemRole, COMPANY_NAME } from '@silex/shared';
import {
  GitPullRequest,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  Building,
  DollarSign,
  Filter,
  Search,
  Sparkles,
  FileText,
  Percent,
  Eye,
  ShoppingCart,
  Package,
  Building2,
  MapPin,
  Calendar,
  Layers,
  HardHat,
  ChevronRight,
  Phone,
  Tag,
  ExternalLink,
} from 'lucide-react';

export default function WorkflowsPage() {
  const { user, activeRole } = useAuth();
  const [inbox, setInbox] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PURCHASE_REQUEST' | 'WORK_SITUATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Examen Détaillé du Dossier (Visualisation Complète des Lignes, Justification, Offres & Décision)
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);

  // Modals for Direct Decisions
  const [selectedItemForDecision, setSelectedItemForDecision] = useState<any | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'REJECT' | 'REVISE' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('Offre conforme aux spécifications techniques et aux contraintes du planning chantier.');
  const [rejectReason, setRejectReason] = useState('Dépassement de l\'enveloppe budgétaire allouée pour ce poste.');
  const [revisionInstructions, setRevisionInstructions] = useState('Négocier une remise complémentaire de 5% ou vérifier le stock du magasin central.');

  const executeDetailApprove = async (item: any) => {
    try {
      await api.post(`/workflows/${item.id}/approve`, {
        type: item.type,
        notes: decisionNotes || 'Approbation DG avec émission de Bon de Commande / Situation validée.',
      });
      setNotification(`Dossier ${item.reference} approuvé avec succès par la Direction Générale ! Bon de Commande émis (TVA 19%).`);
      setSelectedItemForDetail(null);
      await loadInbox();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’approbation DG');
    }
  };

  const executeDetailRevise = async (item: any) => {
    try {
      await api.post(`/workflows/${item.id}/request-revision`, {
        type: item.type,
        instructions: revisionInstructions || 'Demande de réexamen et renégociation tarifaire.',
      });
      setNotification(`Dossier ${item.reference} renvoyé aux équipes Achats / Chantier pour réexamen.`);
      setSelectedItemForDetail(null);
      await loadInbox();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la demande de réexamen');
    }
  };

  const executeDetailReject = async (item: any) => {
    try {
      await api.post(`/workflows/${item.id}/reject`, {
        type: item.type,
        reason: rejectReason || 'Rejet formel par la Direction Générale.',
      });
      setNotification(`Dossier ${item.reference} rejeté formellement.`);
      setSelectedItemForDetail(null);
      await loadInbox();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du rejet');
    }
  };

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
  }, [activeRole]);

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  const handleOpenDecision = (item: any, action: 'APPROVE' | 'REJECT' | 'REVISE') => {
    setSelectedItemForDecision(item);
    setDecisionAction(action);
  };

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForDecision || !decisionAction) return;

    try {
      if (decisionAction === 'APPROVE') {
        await api.post(`/workflows/${selectedItemForDecision.id}/approve`, {
          type: selectedItemForDecision.type,
          notes: decisionNotes,
        });
        setNotification(`Dossier ${selectedItemForDecision.reference} approuvé avec succès par la Direction Générale ! Bon de Commande / Situation validé.`);
      } else if (decisionAction === 'REJECT') {
        await api.post(`/workflows/${selectedItemForDecision.id}/reject`, {
          type: selectedItemForDecision.type,
          reason: rejectReason,
        });
        setNotification(`Dossier ${selectedItemForDecision.reference} rejeté formellement.`);
      } else if (decisionAction === 'REVISE') {
        await api.post(`/workflows/${selectedItemForDecision.id}/request-revision`, {
          type: selectedItemForDecision.type,
          instructions: revisionInstructions,
        });
        setNotification(`Dossier ${selectedItemForDecision.reference} renvoyé aux équipes pour réexamen / négociation.`);
      }

      setSelectedItemForDecision(null);
      setDecisionAction(null);
      await loadInbox();
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du traitement de l’arbitrage');
    }
  };

  const filteredItems = inbox.filter(item => {
    const matchesSearch =
      item.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (typeFilter === 'ALL') return true;
    return item.type === typeFilter;
  });

  const totalAmountPendingHT = inbox.reduce((sum, item) => sum + Number(item.amountHT || 0), 0);
  const totalAmountPendingTTC = Math.round(totalAmountPendingHT * 1.19);
  const urgentCount = inbox.filter(i => i.urgencyLevel === 'CRITICAL' || i.urgencyLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#07164D] rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B207D]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-[#0B207D]" />
            Arbitrages & Validations Hiérarchiques SILEX SERVICES
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Circuit d'approbation et séparation stricte des fonctions (SoD) : engagements d'achat, bons de commande et décomptes de travaux.
          </p>
        </div>
      </div>

      {/* Role banner if not DG */}
      {!isDG && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Vous êtes connecté avec le profil <strong>{user?.name} ({activeRole})</strong>. Selon la règle SoD, seul le <strong>Directeur Général</strong> (ou Administrateur) peut engager financièrement l'entreprise. Utilisez le sélecteur en haut à droite pour basculer sur Directeur Général.
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Dossiers en Attente d'Arbitrage
          </div>
          <div className="text-2xl font-black text-[#07164D] mt-1">
            {inbox.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {urgentCount} dossier(s) prioritaire(s) ou urgent(s)
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Montant Cumulé Soumis HT
          </div>
          <div className="text-xl font-black text-[#0B207D] mt-1">
            {formatCurrencyDA(totalAmountPendingHT, false)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Engagements fermes proposés à la DG
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Total Engagements TTC (TVA 19%)
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {formatCurrencyDA(totalAmountPendingTTC, false)}
          </div>
          <div className="text-[10px] text-emerald-800 font-semibold mt-1">
            Régime fiscal et comptabilité fournisseurs DZ
          </div>
        </div>
      </div>

      {/* List of pending items */}
      <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B207D]" />
            <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
              Dossiers Soumis à Décision DG ({filteredItems.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Rechercher par référence, chantier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  typeFilter === 'ALL'
                    ? 'bg-[#0B207D] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tous ({inbox.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('PURCHASE_REQUEST')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  typeFilter === 'PURCHASE_REQUEST'
                    ? 'bg-[#0B207D] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Demandes d'Achat ({inbox.filter(i => i.type === 'PURCHASE_REQUEST').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('WORK_SITUATION')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  typeFilter === 'WORK_SITUATION'
                    ? 'bg-[#0B207D] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Situations Chantiers ({inbox.filter(i => i.type === 'WORK_SITUATION').length})
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              Toutes les approbations sont à jour. Aucun arbitrage en attente.
            </div>
          ) : (
            filteredItems.map(item => {
              const ht = Number(item.amountHT || 0);
              const tva = Math.round(ht * 0.19);
              const ttc = ht + tva;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetail(item)}
                  className="p-4 hover:bg-blue-50/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs cursor-pointer border-b border-slate-100 last:border-b-0 group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors">
                        {item.reference}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.urgencyLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : item.urgencyLevel === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Urgence {item.urgencyLevel}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Soumis le {formatDateDZ(item.date)}
                      </span>
                      <span className="text-[10px] text-[#0B207D] font-semibold bg-blue-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Cliquer pour ouvrir l'examen détaillé ↗
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1">{item.title}</div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>
                        Chantier :{' '}
                        {item.projectCode ? (
                          <Link
                            href={`/projects/${item.projectCode}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#0B207D] hover:underline inline-flex items-center gap-0.5"
                            title={`Ouvrir la fiche du chantier ${item.projectCode}`}
                          >
                            {item.projectCode}
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </Link>
                        ) : null}{' '}
                        — {item.projectName}
                      </span>
                      <span>•</span>
                      <span>Demandeur : <strong>{item.requesterName}</strong> ({item.department})</span>
                      {item.recommendedSupplier && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Fournisseur proposé : {item.recommendedSupplier}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Financials */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-end lg:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#07164D]">{formatCurrencyDA(ht, false)} HT</div>
                      <div className="text-[10px] text-slate-500">TTC (19%) : <strong>{formatCurrencyDA(ttc, false)}</strong></div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemForDetail(item);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white font-semibold rounded text-xs shadow-2xs transition-colors cursor-pointer"
                        title="Examiner tous les détails du dossier (lignes, pièces, devis & arbitrage)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>

                      {isDG ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDecision(item, 'APPROVE');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Valider et émettre le bon de commande"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approuver (DG)</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDecision(item, 'REVISE');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold rounded text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Demander une renégociation ou vérification"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Réexaminer</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDecision(item, 'REJECT');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 font-semibold rounded text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Rejeter le dossier"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Rejeter</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          href={item.type === 'PURCHASE_REQUEST' ? '/procurement' : `/projects/${item.projectCode}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
                        >
                          <span>Voir Module</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL EXAMEN DÉTAILLÉ DU DOSSIER & ARBITRAGE DG COMPLET (DEMANDES D'ACHAT & SITUATIONS) */}
      {/* ========================================================================= */}
      {selectedItemForDetail && (() => {
        const item = selectedItemForDetail;
        const ht = Number(item.amountHT || 0);
        const tva = Math.round(ht * 0.19);
        const ttc = ht + tva;
        const isPR = item.type === 'PURCHASE_REQUEST';
        const projBudget = Number(item.projectBudget || 120000000);
        const projCommitted = Number(item.projectCommitted || 34500000);
        const projRemaining = Math.max(0, projBudget - projCommitted);

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    {isPR ? (
                      <ShoppingCart className="w-5 h-5 text-[#0B207D]" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#0B207D]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[#07164D]">
                        {isPR ? "Dossier Demande d'Achat Chantier" : "Dossier Situation Périodique de Travaux"}
                      </h3>
                      <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.reference}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200 uppercase">
                        Urgence {item.urgencyLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Soumis le <strong>{formatDateDZ(item.date)}</strong></span>
                      <span>•</span>
                      <span>Circuit de Validation Direction Générale (Règle SoD)</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Fiche Synthétique Chantier / Projet Concerne */}
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0B207D]" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Link
                          href={`/projects/${item.projectCode}`}
                          className="text-[#0B207D] hover:underline inline-flex items-center gap-1"
                          title={`Accéder directement au chantier ${item.projectCode}`}
                        >
                          {item.projectCode}
                          <ExternalLink className="w-3 h-3 text-[#0B207D]" />
                        </Link>
                        <span>— {item.projectName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Client : <strong>{item.clientName || 'SONATRACH / Sites Industriels'}</strong> • Demandeur : <strong>{item.requesterName}</strong> ({item.department})
                      </div>
                    </div>
                  </div>
                </div>

                {isPR && projBudget > 0 && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Budget Alloué :</span>
                      <span className="font-bold text-slate-800">{formatCurrencyDA(projBudget, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Engagé Cumulé :</span>
                      <span className="font-bold text-amber-700">{formatCurrencyDA(projCommitted, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Solde Restant :</span>
                      <span className="font-bold text-emerald-700">{formatCurrencyDA(projRemaining, false)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Impact de cette DA :</span>
                      <span className="font-bold text-[#0B207D]">~{((ht / projBudget) * 100).toFixed(1)}% du budget</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Justification Opérationnelle Chantier */}
              <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-200 space-y-1 text-xs">
                <div className="text-[11px] font-bold text-[#07164D] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B207D]" />
                  Justification Opérationnelle & Motifs Transmis à la DG :
                </div>
                <p className="text-slate-700 text-xs leading-relaxed italic bg-white p-2 rounded border border-blue-100">
                  "{item.justification || item.notes || "Approvisionnement prioritaire requis pour avancement des opérations sur site selon planning contractuel validé."}"
                </p>
                {item.desiredDate && (
                  <div className="text-[10px] text-slate-500 pt-0.5">
                    Date limite de livraison souhaitée sur site : <strong>{formatDateDZ(item.desiredDate)}</strong>
                  </div>
                )}
              </div>

              {/* Pour une Demande d'Achat : Tableau Complet des Lignes d'Articles */}
              {isPR && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#0B207D]" />
                      Bordereau des Fournitures Commandées ({item.lines?.length || 1} article(s))
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Spécifications et conformité CCPU 3.1
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#07164D] text-white font-semibold text-[11px] uppercase">
                        <tr>
                          <th className="p-2.5">Réf & Spécification Industrielle</th>
                          <th className="p-2.5 text-right">Quantité</th>
                          <th className="p-2.5 text-right">Prix Unitaire Estimé</th>
                          <th className="p-2.5 text-right">Montant Ligne HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {item.lines && item.lines.length > 0 ? (
                          item.lines.map((l: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2.5 font-medium text-slate-900">
                                <div className="font-bold">{l.description}</div>
                                {l.technicalSpecs && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">{l.technicalSpecs}</div>
                                )}
                                {l.itemCode && (
                                  <div className="text-[9px] text-slate-400 font-mono">Code stock : {l.itemCode}</div>
                                )}
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-800">
                                {l.quantity} {l.unit || 'UNITE'}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-600">
                                {formatCurrencyDA(l.unitPrice, false)}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                {formatCurrencyDA(l.subtotal || (l.quantity * l.unitPrice), false)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-2.5 font-medium text-slate-900">{item.title}</td>
                            <td className="p-2.5 text-right font-bold">1 FORFAIT</td>
                            <td className="p-2.5 text-right font-mono">{formatCurrencyDA(ht, false)}</td>
                            <td className="p-2.5 text-right font-mono font-bold">{formatCurrencyDA(ht, false)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Offre Fournisseur Retenue & Détails Commerciaux */}
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Offre Fournisseur Recommandée par les Achats
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-100 text-emerald-800 border-emerald-300">
                        Qualifié A — Conforme QCD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div>Fournisseur : <strong className="text-slate-900">{item.recommendedSupplier || 'Fournisseur Agréé SILEX'}</strong></div>
                        <div className="text-[11px] text-slate-600">
                          Délai contractuel : <strong>{item.recommendedQuote?.deliveryLeadTimeDays || 7} jours ouvrés</strong>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Paiement : <strong>{item.recommendedQuote?.paymentTerms || 'Virement bancaire 30j fin de mois'}</strong>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Garantie : <strong>{item.recommendedQuote?.warrantyMonths || 12} mois constructeur</strong>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-emerald-200 space-y-1 text-right">
                        <div className="text-xs text-slate-600">Total Fournitures HT : <strong className="font-mono">{formatCurrencyDA(ht, false)}</strong></div>
                        <div className="text-xs text-slate-500">TVA Légale DZ (19%) : <strong className="font-mono">+{formatCurrencyDA(tva, false)}</strong></div>
                        <div className="pt-1 border-t border-slate-200 text-sm font-black text-[#0B207D]">
                          Net à Payer TTC : {formatCurrencyDA(ttc, false)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pour une Situation de Travaux Métrée */}
              {!isPR && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Décompte Métré & Ventilation Financière de la Situation
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-right">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Montant Travaux HT :</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{formatCurrencyDA(ht, false)}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">TVA Légale (19%) :</span>
                      <span className="font-mono font-bold text-slate-700 text-xs">+{formatCurrencyDA(tva, false)}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Retenue Garantie (5%) :</span>
                      <span className="font-mono font-bold text-amber-700 text-xs">-{formatCurrencyDA(Math.round(ht * 0.05), false)}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Net à Facturer TTC :</span>
                      <span className="font-mono font-black text-[#0B207D] text-xs">{formatCurrencyDA(ht + tva - Math.round(ht * 0.05), false)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ZONE D'ARBITRAGE DE LA DIRECTION GÉNÉRALE EN DIRECT */}
              {/* ================================================================= */}
              {isDG ? (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#07164D] uppercase text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                      Décision d'Arbitrage & Visa de la Direction Générale (SoD)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Visa DG Requis
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-semibold text-[11px]">
                        Notes, Instructions ou Motifs du Visa DG :
                      </label>
                      <span className="text-[10px] text-slate-400">Enregistré dans le journal d'audit immuable</span>
                    </div>
                    <textarea
                      rows={2}
                      value={decisionNotes}
                      onChange={e => setDecisionNotes(e.target.value)}
                      placeholder="Indiquer les motivations de la décision DG..."
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0B207D]"
                    />

                    {/* Presets rapides de visa DG */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setDecisionNotes('Offre conforme techniquement et financièrement, fournisseur homologué A, délai compatible avec le jalon chantier.')}
                        className="px-2 py-0.5 bg-white hover:bg-emerald-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 cursor-pointer"
                      >
                        ✓ Offre conforme & validée
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionNotes('Demande de réexamen : négocier une remise tarifaire de 5% ou proposer une variante matière stock.')}
                        className="px-2 py-0.5 bg-white hover:bg-amber-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 cursor-pointer"
                      >
                        ↺ Demande renégociation -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionNotes('Dépassement du budget prévisionnel alloué pour ce jalon chantier.')}
                        className="px-2 py-0.5 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] font-medium text-slate-700 cursor-pointer"
                      >
                        ✗ Dépassement budgétaire
                      </button>
                    </div>
                  </div>

                  {/* Boutons d'Action Directs */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForDetail(null)}
                      className="px-3 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer w-full sm:w-auto"
                    >
                      Fermer sans statuer
                    </button>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => executeDetailReject(item)}
                        className="px-3 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 font-bold rounded text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Rejeter Définitivement
                      </button>

                      <button
                        type="button"
                        onClick={() => executeDetailRevise(item)}
                        className="px-3 py-2 bg-white border border-amber-400 text-amber-900 hover:bg-amber-50 font-bold rounded text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Demander Réexamen
                      </button>

                      <button
                        type="button"
                        onClick={() => executeDetailApprove(item)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        {isPR ? 'Valider la DA & Émettre Bon de Commande (TVA 19%)' : 'Valider & Approuver la Situation'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Vous êtes en mode consultation ({activeRole}). Seul le <strong>Directeur Général</strong> (ou Administrateur) peut accorder le visa contractuel ferme.
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODALE DÉCISION DG (APPROUVER, REJETER, DEMANDER RÉEXAMEN) */}
      {selectedItemForDecision && decisionAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B207D]" />
                  {decisionAction === 'APPROVE' && 'Validation DG & Engagement Ferme (SoD)'}
                  {decisionAction === 'REJECT' && 'Rejet Formel du Dossier (Direction Générale)'}
                  {decisionAction === 'REVISE' && 'Demande de Réexamen & Renégociation Achats'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dossier : <strong className="font-mono text-[#0B207D]">{selectedItemForDecision.reference}</strong> — Chantier {selectedItemForDecision.projectCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForDecision(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recap financier */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Montant Soumis HT :</span>
                <span className="font-bold">{formatCurrencyDA(selectedItemForDecision.amountHT, false)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TVA Légale (19%) :</span>
                <span>+{formatCurrencyDA(Math.round(Number(selectedItemForDecision.amountHT) * 0.19), false)}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-extrabold text-[#0B207D] text-sm">
                <span>Total Net à Payer TTC :</span>
                <span>{formatCurrencyDA(Number(selectedItemForDecision.amountHT) * 1.19, false)}</span>
              </div>
              {selectedItemForDecision.recommendedSupplier && (
                <div className="text-[11px] text-slate-600 pt-1">
                  Fournisseur : <strong>{selectedItemForDecision.recommendedSupplier}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleExecuteDecision} className="space-y-3.5 text-xs">
              {decisionAction === 'APPROVE' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Visa & Motif d'Approbation DG <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={decisionNotes}
                    onChange={e => setDecisionNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Génère automatiquement le Bon de Commande officiel (BC) avec engagement contractuel ferme.
                  </p>
                </div>
              )}

              {decisionAction === 'REVISE' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Instructions de Réexamen / Négociation Tarifaire <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={revisionInstructions}
                    onChange={e => setRevisionInstructions(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-amber-600 focus:outline-none text-xs"
                    required
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Le dossier sera renvoyé à l'acheteur pour négocier auprès du fournisseur ou chercher une variante technique.
                  </p>
                </div>
              )}

              {decisionAction === 'REJECT' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Motif Formel de Rejet <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-red-600 focus:outline-none text-xs"
                    required
                  />
                  <p className="text-[10px] text-red-600 mt-1">
                    Le dossier sera définitivement clôturé avec mention du refus hiérarchique.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDecision(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-white font-semibold rounded transition-colors shadow-xs cursor-pointer ${
                    decisionAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    decisionAction === 'REVISE' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {decisionAction === 'APPROVE' && 'Confirmer l\'Approbation (Émettre BC)'}
                  {decisionAction === 'REVISE' && 'Renvoyer pour Réexamen'}
                  {decisionAction === 'REJECT' && 'Confirmer le Rejet Définitif'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
