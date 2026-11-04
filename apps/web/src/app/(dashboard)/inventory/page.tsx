'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ, SystemRole, StockMovementType } from '@silex/shared';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Building,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';

export default function InventoryPage() {
  const { user, activeRole } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Réception (Étape 5)
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('BL-ALGVANNES-2026-88');
  const [receiveQty, setReceiveQty] = useState(100);

  // Modal Sortie Chantier (Étape 6)
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedIssueItemId, setSelectedIssueItemId] = useState('');
  const [issueQty, setIssueQty] = useState(40);
  const [workZone, setWorkZone] = useState('Ligne Haute Pression Bloc 4');

  const loadData = async () => {
    try {
      setLoading(true);
      const [itms, whs, mvts, pos, prjs] = await Promise.all([
        api.get<any[]>('/inventory/items'),
        api.get<any[]>('/inventory/warehouses'),
        api.get<any[]>('/inventory/movements'),
        api.get<any[]>('/procurement/purchase-orders'),
        api.get<any[]>('/projects'),
      ]);

      setItems(itms);
      setWarehouses(whs);
      setMovements(mvts);
      setPurchaseOrders(pos);
      setProjects(prjs);

      if (whs.length > 0) setSelectedWarehouseId(whs[0].id);
      if (pos.length > 0) setSelectedPOId(pos[0].id);
      if (prjs.length > 0) setSelectedProjectId(prjs[0].id);
      if (itms.length > 0) setSelectedIssueItemId(itms[0].id);
    } catch (err) {
      console.error('Erreur chargement inventaire:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const po = purchaseOrders.find(p => p.id === selectedPOId);
      if (!po || po.lines.length === 0) {
        alert('Bon de commande non valide ou sans ligne');
        return;
      }

      await api.post('/inventory/receive-goods', {
        purchaseOrderId: po.id,
        warehouseId: selectedWarehouseId,
        deliveryNoteNumber,
        notes: `Réception conforme magasin pour commande ${po.orderNumber}`,
        lines: [
          {
            purchaseOrderLineId: po.lines[0].id,
            quantityReceived: Number(receiveQty),
          },
        ],
      });

      setShowReceiveModal(false);
      await loadData();
      alert(`Réception de ${receiveQty} unités enregistrée avec succès au magasin ! Mouvement tracé dans le ledger.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleIssueToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item = items.find(i => i.id === selectedIssueItemId);
      const available = Number(item?.currentStock || 0);

      if (Number(issueQty) > available) {
        alert(`Refus : Stock disponible insuffisant (${available} ${item?.unit}). Impossible de créer un stock négatif.`);
        return;
      }

      const res = await api.post<any>('/inventory/issue-to-project', {
        projectId: selectedProjectId,
        warehouseId: selectedWarehouseId,
        itemId: selectedIssueItemId,
        quantity: Number(issueQty),
        workZone,
        recipientEmployeeId: 'emp-001',
        notes: `Sortie matériel vers chantier (${workZone})`,
      });

      setShowIssueModal(false);
      await loadData();
      alert(`Sortie de ${issueQty} unités validée vers le chantier ! Coût de ${formatCurrencyDA(res.imputedCost)} imputé au projet.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#182433]">Stocks & Magasins Industriels</h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Multi-magasins, catalogue des matières, ledger immuable des mouvements et affectations chantiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0A7F7C] text-white rounded-md hover:bg-[#086a67] transition-colors shadow-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Réception Marchandises (BC)
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#142B45] text-white rounded-md hover:bg-[#203D5A] transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Sortie vers Chantier
          </button>
        </div>
      </div>

      {/* Warehouses Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="bg-white p-4 rounded-lg border border-[#E1E6ED] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#142B45]">{w.code}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Opérationnel
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">{w.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{w.location}</div>
            <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100 flex justify-between">
              <span>Responsable : <strong>{w.managerName}</strong></span>
              <span>Mouvements : <strong>{w._count?.stockMovements || 0}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Catalog Table & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Articles Catalog (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider">
              Catalogue des Articles & Niveaux de Stock
            </h2>
            <span className="text-[11px] text-slate-500">{items.length} références gérées</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Désignation</th>
                  <th className="py-2.5 px-3">Catégorie</th>
                  <th className="py-2.5 px-3 text-right">Seuil Min</th>
                  <th className="py-2.5 px-3 text-right">Stock Disponible</th>
                  <th className="py-2.5 px-3 text-right">Dernier Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(i => {
                  const current = Number(i.currentStock);
                  const min = Number(i.minStockLevel);
                  const isLow = current <= min;

                  return (
                    <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#142B45] whitespace-nowrap">
                        {i.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {i.name}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {i.category?.name || 'Général'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {min} {i.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                            isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {current} {i.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                        {formatCurrencyDA(i.unitCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Mouvements (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#142B45] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#0A7F7C]" />
              Journal Immuable des Mouvements
            </h2>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
            {movements.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Aucun mouvement pour le moment.</div>
            ) : (
              movements.map(m => {
                const isReceipt = m.movementType === 'PURCHASE_RECEIPT';
                return (
                  <div key={m.id} className="p-3 text-xs space-y-1 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#142B45]">{m.movementNumber}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isReceipt ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isReceipt ? 'Entrée Réception' : 'Sortie Chantier'}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">
                      {m.item?.name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Qté : <strong className={isReceipt ? 'text-emerald-700' : 'text-blue-700'}>
                          {isReceipt ? '+' : '-'}{m.quantity} {m.item?.unit}
                        </strong>
                      </span>
                      <span>{formatCurrencyDA(m.totalCost)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Magasin : {m.warehouse?.code} • {formatDateDZ(m.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODALE RÉCEPTION MARCHANDISES (Étape 5) */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#182433]">Enregistrer une Réception Marchandises (Magasin)</h3>
            <form onSubmit={handleReceiveGoods} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bon de Commande Fournisseur (BC)</label>
                <select
                  value={selectedPOId}
                  onChange={e => setSelectedPOId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.orderNumber} — {po.supplier?.name} ({formatCurrencyDA(po.totalAmountHT)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Magasin de Destination</label>
                <select
                  value={selectedWarehouseId}
                  onChange={e => setSelectedWarehouseId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Numéro du Bon de Livraison (BL)</label>
                <input
                  type="text"
                  value={deliveryNoteNumber}
                  onChange={e => setDeliveryNoteNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantité reçue</label>
                <input
                  type="number"
                  value={receiveQty}
                  onChange={e => setReceiveQty(Number(e.target.value))}
                  min={1}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0A7F7C] text-white font-semibold rounded hover:bg-[#086a67]"
                >
                  Valider la Réception en Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE SORTIE VERS CHANTIER (Étape 6) */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#182433]">Sortie de Stock vers Chantier Industriel</h3>
            <form onSubmit={handleIssueToProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Projet / Chantier Destinataire</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Magasin Source</label>
                <select
                  value={selectedWarehouseId}
                  onChange={e => setSelectedWarehouseId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Article à sortir</label>
                <select
                  value={selectedIssueItemId}
                  onChange={e => setSelectedIssueItemId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                  required
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.code} — {i.name} (Disponible : {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantité à délivrer</label>
                <input
                  type="number"
                  value={issueQty}
                  onChange={e => setIssueQty(Number(e.target.value))}
                  min={1}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Zone d'intervention sur site</label>
                <input
                  type="text"
                  value={workZone}
                  onChange={e => setWorkZone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#142B45] text-white font-semibold rounded hover:bg-[#203D5A]"
                >
                  Valider la Sortie & Imputer Coût
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
