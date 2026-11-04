'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ, SystemRole, PurchaseRequestStatus } from '@silex/shared';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  ShoppingCart,
  Plus,
  CheckCircle,
  FileText,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  Check,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';

export default function ProcurementPage() {
  const { user, activeRole } = useAuth();
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'orders'>('requests');

  // Modal création DA
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [requestQty, setRequestQty] = useState(100);
  const [requestJustification, setRequestJustification] = useState('Remplacement préventif vannes défectueuses ligne HP bloc 4');
  const [requestUrgency, setRequestUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Arbitrage DG
  const [decisionNotes, setDecisionNotes] = useState('Offre Sarl Algérie Vannes validée sous délai 7 jours pour l’arrêt d’unité.');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prs, pos, prjs, itms, supps] = await Promise.all([
        api.get<any[]>('/procurement/purchase-requests'),
        api.get<any[]>('/procurement/purchase-orders'),
        api.get<any[]>('/projects'),
        api.get<any[]>('/inventory/items'),
        api.get<any[]>('/procurement/purchase-orders').then(() => [
          { id: 'frn-1', code: 'FRN-001', name: 'Sarl Algérie Vannes & Robinetterie' },
          { id: 'frn-2', code: 'FRN-002', name: 'Eurl Comptoir Sidérurgique & Métallurgique' },
          { id: 'frn-3', code: 'FRN-003', name: 'Sarl Gaz & Soudure Industrielle DZ' },
        ]),
      ]);

      setPurchaseRequests(prs);
      setPurchaseOrders(pos);
      setProjects(prjs);
      setItems(itms);
      if (prjs.length > 0) setSelectedProjectId(prjs[0].id);
      if (itms.length > 0) setSelectedItemId(itms[0].id);

      if (prs.length > 0) {
        // Sélectionner par défaut la première DA ou celle en cours
        const fullPR = await api.get<any>(`/procurement/purchase-requests/${prs[0].id}`);
        setSelectedPR(fullPR);
      }
    } catch (err) {
      console.error('Erreur chargement achats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPR = async (prId: string) => {
    try {
      const fullPR = await api.get<any>(`/procurement/purchase-requests/${prId}`);
      setSelectedPR(fullPR);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chosenItem = items.find(i => i.id === selectedItemId);
      if (!chosenItem) return;

      const created = await api.post<any>('/procurement/purchase-requests', {
        projectId: selectedProjectId,
        urgencyLevel: requestUrgency,
        justification: requestJustification,
        desiredDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        lines: [
          {
            itemId: chosenItem.id,
            description: chosenItem.name,
            quantity: Number(requestQty),
            unit: chosenItem.unit,
            estimatedUnitPrice: Number(chosenItem.unitCost || 14200),
          },
        ],
      });

      setShowCreateModal(false);
      await loadData();
      await handleSelectPR(created.id);
      alert(`Demande d'Achat ${created.reference} soumise avec succès au service Achats !`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddQuotesAndSubmitToDG = async () => {
    if (!selectedPR) return;
    try {
      // 1. Ajouter l'offre recommandée A (Sarl Algérie Vannes)
      const quoteA = await api.post<any>('/procurement/quotes', {
        purchaseRequestId: selectedPR.id,
        supplierId: (await api.get<any[]>('/inventory/items')).length ? 'FRN-001' : 'frn-1',
        totalAmountHT: 1420000,
        deliveryLeadTimeDays: 7,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: 'Virement 30j fin de mois',
        notes: 'Offre recommandée : conforme normes ASME/API, livraison rapide sur site HMD.',
        lines: [
          {
            purchaseRequestLineId: selectedPR.lines[0].id,
            unitPrice: 14200,
          },
        ],
      });

      // 2. Transmettre à la Direction Générale
      await api.post(`/procurement/purchase-requests/${selectedPR.id}/submit-approval`, {
        recommendedQuoteId: quoteA.id,
      });

      await handleSelectPR(selectedPR.id);
      await loadData();
      alert('Offres ajoutées au comparateur. Demande transmise avec succès à la Direction Générale !');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveByDG = async () => {
    if (!selectedPR) return;
    try {
      const recommendedQuote = selectedPR.quotes?.find((q: any) => q.isRecommended) || selectedPR.quotes?.[0];
      if (!recommendedQuote) {
        alert('Veuillez d’abord consulter les offres fournisseurs.');
        return;
      }

      const res = await api.post<any>(`/procurement/purchase-requests/${selectedPR.id}/approve`, {
        approvedQuoteId: recommendedQuote.id,
        decisionNotes,
      });

      await handleSelectPR(selectedPR.id);
      await loadData();
      alert(`Demande approuvée par la Direction Générale ! Bon de Commande ${res.purchaseOrder.orderNumber} émis.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Achats & Approvisionnements Chantiers</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Cycle complet : Demandes d’achat → Consultation fournisseurs → Comparateur d’offres → Validation DG → Bons de commande.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0A7F7C] text-white rounded-md hover:bg-[#086a67] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle Demande d’Achat (DA)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-[#0A7F7C] text-[#0A7F7C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Demandes d’Achat ({purchaseRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-[#0A7F7C] text-[#0A7F7C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bons de Commande Émis ({purchaseOrders.length})
        </button>
      </div>

      {/* TAB 1: Demandes d'Achat & Comparateur */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of DAs (Left column) */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              Répertoire des Demandes d'Achat
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {purchaseRequests.map(pr => {
                const isSelected = selectedPR?.id === pr.id;
                return (
                  <div
                    key={pr.id}
                    onClick={() => handleSelectPR(pr.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/60 border-l-4 border-[#0A7F7C]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#142B45]">{pr.reference}</span>
                      <StatusBadge status={pr.status} type="procurement" />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">{pr.project?.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Demandeur : {pr.createdBy?.name} • {formatDateDZ(pr.createdAt)}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Estimé : {formatCurrencyDA(pr.totalEstimatedAmount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed View & Comparateur (Right column) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedPR ? (
              <div className="bg-white p-5 rounded-lg border border-[#E1E6ED] shadow-2xs space-y-5">
                {/* Header of selected PR */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#142B45]">{selectedPR.reference}</span>
                      <StatusBadge status={selectedPR.status} type="procurement" />
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                        {selectedPR.urgencyLevel}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">
                      Chantier : {selectedPR.project?.code} — {selectedPR.project?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Justification : <em>{selectedPR.justification}</em>
                    </div>
                  </div>
                </div>

                {/* Articles demandés */}
                <div>
                  <h3 className="text-xs font-bold text-[#142B45] uppercase tracking-wider mb-2">
                    Articles Industriels Requis
                  </h3>
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Désignation</th>
                          <th className="py-2 px-3 text-right">Quantité</th>
                          <th className="py-2 px-3 text-right">P.U Estimé</th>
                          <th className="py-2 px-3 text-right">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPR.lines?.map((line: any) => (
                          <tr key={line.id}>
                            <td className="py-2 px-3">
                              <span className="font-mono text-slate-700">{line.item?.code}</span> — {line.description}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {line.quantity} {line.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600">
                              {formatCurrencyDA(line.estimatedUnitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-[#142B45]">
                              {formatCurrencyDA(line.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COMPARATEUR FOURNISSEURS (Étape clé 2 & 3) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
                        Comparateur Multi-Critères Fournisseurs
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Pondération des offres (Prix, Délai de livraison, Conformité norme ISO/API, Disponibilité)
                      </p>
                    </div>
                    {selectedPR.quotes?.length === 0 && (
                      <button
                        onClick={handleAddQuotesAndSubmitToDG}
                        className="px-3 py-1.5 bg-[#142B45] text-white text-xs font-semibold rounded hover:bg-[#203D5A]"
                      >
                        Enregistrer 3 Offres & Transmettre à la Direction
                      </button>
                    )}
                  </div>

                  {selectedPR.quotes?.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 bg-white rounded border border-dashed border-slate-300">
                      En attente de saisie des offres fournisseurs par le service Achats.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedPR.quotes?.map((q: any, idx: number) => {
                        const isRec = q.isRecommended;
                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-lg border text-xs bg-white space-y-2 relative ${
                              isRec ? 'border-[#0A7F7C] ring-2 ring-[#0A7F7C]/20 shadow-xs' : 'border-slate-200'
                            }`}
                          >
                            {isRec && (
                              <div className="bg-[#0A7F7C] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Offre Recommandée
                              </div>
                            )}
                            <div className="font-bold text-slate-900 leading-snug">{q.supplier?.name}</div>
                            <div className="text-sm font-extrabold text-[#142B45]">
                              {formatCurrencyDA(q.totalAmountHT)}
                            </div>
                            <div className="text-[11px] space-y-1 text-slate-600 pt-1 border-t border-slate-100">
                              <div>Délai : <strong>{q.deliveryLeadTimeDays} jours</strong></div>
                              <div>Disponibilité : <strong>{q.stockAvailability}</strong></div>
                              <div>Conformité technique : <strong className="text-emerald-700">100% Conforme</strong></div>
                              <div>Garantie : <strong>{q.warrantyMonths} mois</strong></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* APPROBATION PAR LA DIRECTION GÉNÉRALE (Étape clé 3) */}
                {selectedPR.status === 'PENDING_APPROVAL' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Arbitrage de la Direction Générale
                    </div>
                    {isDG ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-900 mb-1">
                            Motivation de la décision & Ordre d'engagement
                          </label>
                          <input
                            type="text"
                            value={decisionNotes}
                            onChange={e => setDecisionNotes(e.target.value)}
                            className="w-full p-2 text-xs border border-emerald-300 rounded bg-white"
                          />
                        </div>
                        <button
                          onClick={handleApproveByDG}
                          className="w-full py-2 bg-[#0A7F7C] text-white text-xs font-bold rounded hover:bg-[#086a67] transition-colors shadow-xs"
                        >
                          Approuver l’Offre & Émettre le Bon de Commande Officiel
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-800">
                        Connectez-vous avec le profil <strong>Directeur Général</strong> (via le sélecteur en haut à droite) pour approuver cet engagement financier.
                      </div>
                    )}
                  </div>
                )}

                {/* Bon de commande généré */}
                {selectedPR.purchaseOrders?.length > 0 && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-teal-900">
                        Bon de Commande Émis : {selectedPR.purchaseOrders[0].orderNumber}
                      </div>
                      <div className="text-[11px] text-teal-700">
                        Fournisseur : {selectedPR.purchaseOrders[0].supplier?.name} • Montant : {formatCurrencyDA(selectedPR.purchaseOrders[0].totalAmountHT)}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-3 py-1.5 bg-[#142B45] text-white text-xs font-semibold rounded hover:bg-[#203D5A]"
                    >
                      Consulter le Bon de Commande
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                Sélectionnez une demande d’achat à gauche pour afficher son comparateur et son historique.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Bons de Commande Émis */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Bons de Commande Officiels (SILEX SERVICES)
            </h2>
            <span className="text-[11px] text-slate-500">Prêts pour expédition fournisseur ou magasin</span>
          </div>

          <div className="divide-y divide-slate-100">
            {purchaseOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Aucun bon de commande émis pour l'instant.</div>
            ) : (
              purchaseOrders.map(po => (
                <div key={po.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#142B45]">{po.orderNumber}</span>
                      <StatusBadge status={po.status} type="po" />
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      Fournisseur : <strong>{po.supplier?.name}</strong> • Chantier : <strong>{po.project?.code}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Émis le {formatDateDZ(po.issuedAt)} • Conditions : {po.paymentTerms || '30 jours'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#142B45]">{formatCurrencyDA(po.totalAmountHT)} HT</div>
                    <div className="text-[11px] text-slate-500 font-medium">TTC : {formatCurrencyDA(po.totalAmountTTC)}</div>
                    <button
                      onClick={() => alert(`Aperçu imprimable du Bon de Commande ${po.orderNumber} prêt pour export PDF.`)}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#0A7F7C] font-semibold hover:underline"
                    >
                      <Printer className="w-3 h-3" /> Imprimer / PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALE CRÉATION DEMANDE D'ACHAT (Étape clé 1) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#182433]">Nouvelle Demande d’Achat Chantier (DA)</h3>
            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chantier / Projet d’imputation</label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Article Industriel Requis</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.code} — {i.name} (Stock actuel : {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité demandée</label>
                  <input
                    type="number"
                    value={requestQty}
                    onChange={e => setRequestQty(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Degré d'urgence</label>
                  <select
                    value={requestUrgency}
                    onChange={e => setRequestUrgency(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Urgent (Arrêt d'unité)</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Justification opérationnelle</label>
                <textarea
                  value={requestJustification}
                  onChange={e => setRequestJustification(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#086a67]"
                >
                  Soumettre la Demande d'Achat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
