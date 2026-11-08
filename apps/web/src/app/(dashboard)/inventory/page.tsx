'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDateDZ, formatCurrencyDA, StockMovementType, COMPANY_NAME, COMPANY_ESTABLISHED } from '@silex/shared';
import {
  Boxes,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Building,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  Printer,
  Truck,
  FileText,
  UserCheck,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  CheckSquare,
  ShieldCheck,
  FileCheck2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface MultiIssueLine {
  id: string;
  itemId: string;
  quantity: number;
  batchNumber: string;
}

interface IssuedBonDeSortie {
  id: string;
  bonNumber: string;
  date: string;
  senderCompany: string;
  warehouseName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  siteLocation: string;
  driverName: string;
  vehicleMatricule: string;
  workZone: string;
  recipientName: string;
  items: Array<{
    code: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    batchNumber: string;
  }>;
  totalAmountDA: number;
  status: 'EN_TRANSIT' | 'RECEPTIONNE_CONFORME' | 'RESERVES_SIGNALEES' | 'ANNULE';
  receiptTimestamp?: string;
  receiverSignature?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'bons_sortie' | 'transfers' | 'returns' | 'warehouses' | 'ledger'>('catalog');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Search
  const [searchItem, setSearchItem] = useState('');
  const [searchBs, setSearchBs] = useState('');

  // Modales
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showCreateWarehouseModal, setShowCreateWarehouseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Formulaire Transfert Inter-Magasins
  const [transferSourceWhId, setTransferSourceWhId] = useState('');
  const [transferTargetWhId, setTransferTargetWhId] = useState('');
  const [transferItemId, setTransferItemId] = useState('');
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferDriver, setTransferDriver] = useState('Djamel Hamidi (Chauffeur SILEX)');
  const [transferVehicle, setTransferVehicle] = useState('02450-116-30 (Plateau 10T)');
  const [transferNotes, setTransferNotes] = useState('Transfert stock Magasin Arzew vers Base Logistique Hassi Messaoud pour chantier tuyauterie');

  // Formulaire Retour de Chantier (Surplus & Chutes)
  const [returnProjectId, setReturnProjectId] = useState('');
  const [returnWhId, setReturnWhId] = useState('');
  const [returnItemId, setReturnItemId] = useState('');
  const [returnQty, setReturnQty] = useState<number>(3);
  const [returnCondition, setReturnCondition] = useState('BON_ETAT');
  const [returnNotes, setReturnNotes] = useState('Réintégration des surplus de bobines et brides non consommées. Allègement des coûts réels du projet.');

  // Modal Visualisation & Impression A4 Bon de Sortie & Accusé
  const [showPrintBsModal, setShowPrintBsModal] = useState(false);
  const [selectedBsForPrint, setSelectedBsForPrint] = useState<IssuedBonDeSortie | null>(null);

  // Formulaire Bon de Sortie Multi-produits & Transport
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [driverName, setDriverName] = useState('Mourad Benali');
  const [vehicleMatricule, setVehicleMatricule] = useState('01452-116-30');
  const [workZone, setWorkZone] = useState('Zone Skids de Pompage P-101');
  const [recipientEmployeeId, setRecipientEmployeeId] = useState('');
  const [issueLines, setIssueLines] = useState<MultiIssueLine[]>([
    { id: 'line-1', itemId: '', quantity: 5, batchNumber: 'LOT-TUB-2026-904' },
  ]);

  // Formulaire Réception Marchandise
  const [selectedPOId, setSelectedPOId] = useState('');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('BL-FOURN-2026-884');
  const [materialCertificate31, setMaterialCertificate31] = useState('CCPU-EN10204-3.1-AL77');
  const [receiveDriver, setReceiveDriver] = useState('Rachid Meziani (Transporteur SARL TuboAlg)');
  const [receiveVehicle, setReceiveVehicle] = useState('00789-115-31');
  const [receiveQty, setReceiveQty] = useState<number>(10);
  const [receiveQualityStatus, setReceiveQualityStatus] = useState<'CONFORME' | 'AVEC_RESERVES' | 'REJET'>('CONFORME');
  const [receiveReserveNotes, setReceiveReserveNotes] = useState('');

  // Modale Incident & Réserve Bon de Sortie
  const [selectedBsForIncident, setSelectedBsForIncident] = useState<IssuedBonDeSortie | null>(null);
  const [incidentNotes, setIncidentNotes] = useState('');

  // Modale Ajustement Physique & Audit de Stock
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustWarehouseId, setAdjustWarehouseId] = useState('');
  const [adjustNewQty, setAdjustNewQty] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('Écart d’inventaire contradictoire (Recomptage annuel)');
  const [adjustNotes, setAdjustNotes] = useState('Régularisation après inventaire physique contradictoire en présence du contrôleur de gestion.');

  // Formulaire Nouvel Article
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('TUYAUTERIE');
  const [newItemUnit, setNewItemUnit] = useState('UNITE');
  const [newItemCost, setNewItemCost] = useState<number>(24500);
  const [newItemMinStock, setNewItemMinStock] = useState<number>(10);
  const [newItemCurrentStock, setNewItemCurrentStock] = useState<number>(50);

  // Formulaire Nouveau Magasin
  const [newWhName, setNewWhName] = useState('');
  const [newWhLocation, setNewWhLocation] = useState('');
  const [newWhManager, setNewWhManager] = useState('');

  // Registre des Bons de Sortie avec Accusé de Réception (persisté en mémoire/local)
  const [bonsSortieList, setBonsSortieList] = useState<IssuedBonDeSortie[]>([
    {
      id: 'bs-sample-001',
      bonNumber: 'BS-2026-0089',
      date: new Date().toISOString(),
      senderCompany: `${COMPANY_NAME} — Magasin Central Arzew`,
      warehouseName: 'Magasin Central Arzew (Zone Industrielle)',
      projectId: 'prj-001',
      projectCode: 'PRJ-2026-001',
      projectName: 'Maintenance Arrêt Unité Raffinage U-100',
      clientName: 'SONATRACH / Raffinerie Arzew',
      siteLocation: 'Zone Industrielle Arzew (Oran)',
      driverName: 'Mourad Benali',
      vehicleMatricule: '01452-116-30',
      workZone: 'Unité Reformage Catalytique R-102',
      recipientName: 'Sofiane Belkacem (Chef de Chantier)',
      items: [
        {
          code: 'ART-001',
          name: 'Vanne à opercule acier forgé DN100 PN40',
          quantity: 12,
          unit: 'UNITE',
          unitCost: 14000,
          totalCost: 168000,
          batchNumber: 'CCPU-EN10204-3.1-V44',
        },
        {
          code: 'ART-002',
          name: 'Bride à collerette WNRF 6" Sch 40 A105',
          quantity: 24,
          unit: 'UNITE',
          unitCost: 8500,
          totalCost: 204000,
          batchNumber: 'LOT-BR-2026-12',
        },
      ],
      totalAmountDA: 372000,
      status: 'RECEPTIONNE_CONFORME',
      receiptTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      receiverSignature: 'Sofiane Belkacem — Reçu conforme sans réserve',
    },
  ]);

  const { activeRole } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [itms, whs, mvts, pos, prjs, emps] = await Promise.all([
        api.get<any[]>('/inventory/items'),
        api.get<any[]>('/inventory/warehouses'),
        api.get<any[]>('/inventory/stock-movements'),
        api.get<any[]>('/procurement/purchase-orders'),
        api.get<any[]>('/projects'),
        api.get<any[]>('/hr/employees'),
      ]);
      const safeItms = Array.isArray(itms) ? itms : [];
      const safeWhs = Array.isArray(whs) ? whs : [];
      const safeMvts = Array.isArray(mvts) ? mvts : [];
      const safePos = Array.isArray(pos) ? pos : [];
      const safePrjs = Array.isArray(prjs) ? prjs : [];
      const safeEmps = Array.isArray(emps) ? emps : [];

      setItems(safeItms);
      setWarehouses(safeWhs);
      setMovements(safeMvts);
      setPurchaseOrders(safePos);
      setProjects(safePrjs);
      setEmployees(safeEmps);

      if (safeWhs.length > 0 && !selectedWarehouseId) setSelectedWarehouseId(safeWhs[0].id);
      if (safePrjs.length > 0 && !selectedProjectId) setSelectedProjectId(safePrjs[0].id);
      if (safePos.length > 0 && !selectedPOId) setSelectedPOId(safePos[0].id);
      if (safeItms.length > 0 && issueLines[0] && !issueLines[0].itemId) {
        setIssueLines([{ id: 'line-1', itemId: safeItms[0].id, quantity: 5, batchNumber: 'LOT-TUB-2026-904' }]);
      }
      if (safeEmps.length > 0 && !recipientEmployeeId) setRecipientEmployeeId(safeEmps[0].id);
      if (whs.length > 1) {
        if (!transferSourceWhId) setTransferSourceWhId(whs[0].id);
        if (!transferTargetWhId) setTransferTargetWhId(whs[1].id);
      } else if (whs.length > 0) {
        if (!transferSourceWhId) setTransferSourceWhId(whs[0].id);
        if (!transferTargetWhId) setTransferTargetWhId(whs[0].id);
      }
      if (whs.length > 0 && !returnWhId) setReturnWhId(whs[0].id);
      if (itms.length > 0) {
        if (!transferItemId) setTransferItemId(itms[0].id);
        if (!returnItemId) setReturnItemId(itms[0].id);
      }
      if (prjs.length > 0 && !returnProjectId) setReturnProjectId(prjs[0].id);
    } catch (err: any) {
      console.error('Erreur chargement inventaire:', err);
      setError(err?.message || 'Erreur lors du chargement des données de stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  // Total stock valuation calculation
  const totalStockValuation = items.reduce((acc, curr) => {
    return acc + Number(curr.currentStock || 0) * Number(curr.unitCost || 0);
  }, 0);

  // Selected project for issue
  const activeIssueProject = projects.find(p => p.id === selectedProjectId);
  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId);
  const activeRecipientEmp = employees.find(e => e.id === recipientEmployeeId);

  // Add line to Bon de Sortie
  const handleAddIssueLine = () => {
    const defaultItem = items[0];
    setIssueLines(prev => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        itemId: defaultItem?.id || '',
        quantity: 1,
        batchNumber: `LOT-${Date.now().toString().slice(-4)}`,
      },
    ]);
  };

  // Remove line from Bon de Sortie
  const handleRemoveIssueLine = (id: string) => {
    if (issueLines.length <= 1) return;
    setIssueLines(prev => prev.filter(l => l.id !== id));
  };

  // Update line in Bon de Sortie
  const handleUpdateIssueLine = (id: string, field: 'itemId' | 'quantity' | 'batchNumber', value: any) => {
    setIssueLines(prev =>
      prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // Compute total amount and stock validity
  const issueLinesComputed = (Array.isArray(issueLines) ? issueLines : []).map(line => {
    const item = items.find(i => i.id === line.itemId);
    const available = Number(item?.currentStock || 0);
    const requested = Number(line.quantity || 0);
    const unitCost = Number(item?.unitCost || 0);
    const totalLineCost = requested * unitCost;
    const isInsufficient = requested > available;
    return {
      ...line,
      item,
      available,
      requested,
      unitCost,
      totalLineCost,
      isInsufficient,
    };
  });

  const hasAnyInsufficientStock = issueLinesComputed.some(l => l.isInsufficient);
  const totalIssueAmount = issueLinesComputed.reduce((sum, l) => sum + l.totalLineCost, 0);

  // SOUMISSION DU BON DE SORTIE (Multi-produits avec Accusé de Réception)
  const handleSubmitBonDeSortie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (hasAnyInsufficientStock) {
        alert('Impossible de valider : certains articles demandés dépassent le stock disponible.');
        return;
      }

      if (!activeIssueProject) {
        alert('Veuillez sélectionner un chantier destinataire.');
        return;
      }

      const generatedBsNumber = `BS-2026-${String(bonsSortieList.length + 90).padStart(4, '0')}`;

      // Pour chaque article, décrémenter via l'API atomique Prisma
      for (const line of issueLinesComputed) {
        if (!line.item) continue;
        await api.post<any>('/inventory/issue-to-project', {
          projectId: selectedProjectId,
          warehouseId: selectedWarehouseId,
          itemId: line.itemId,
          quantity: Number(line.quantity),
          workZone: workZone || 'Zone Chantiers',
          recipientEmployeeId: recipientEmployeeId || undefined,
          notes: `Bon de Sortie ${generatedBsNumber} | Chauffeur: ${driverName} (Matricule: ${vehicleMatricule}) | Destinataire: ${activeIssueProject.clientName} (${activeIssueProject.siteLocation}) | Lot: ${line.batchNumber}`,
        });
      }

      // Enregistrer le Bon de Sortie complet pour impression & accusé
      const newBonDeSortie: IssuedBonDeSortie = {
        id: `bs-${Date.now()}`,
        bonNumber: generatedBsNumber,
        date: new Date().toISOString(),
        senderCompany: `${COMPANY_NAME} — ${activeWarehouse?.name || 'Magasin Central'}`,
        warehouseName: activeWarehouse?.name || 'Magasin Central',
        projectId: activeIssueProject.id,
        projectCode: activeIssueProject.code,
        projectName: activeIssueProject.name,
        clientName: activeIssueProject.clientName || 'Client Industriel',
        siteLocation: activeIssueProject.siteLocation || 'Site Chantier',
        driverName: driverName || 'Chauffeur Expéditeur',
        vehicleMatricule: vehicleMatricule || 'Matricule Véhicule',
        workZone: workZone || 'Zone Travaux',
        recipientName: activeRecipientEmp ? `${activeRecipientEmp.firstName} ${activeRecipientEmp.lastName} (${activeRecipientEmp.title})` : 'Chef de Chantier',
        items: (Array.isArray(issueLinesComputed) ? issueLinesComputed : []).map(l => ({
          code: l.item?.code || 'ART',
          name: l.item?.name || 'Article',
          quantity: l.requested,
          unit: l.item?.unit || 'U',
          unitCost: l.unitCost,
          totalCost: l.totalLineCost,
          batchNumber: l.batchNumber || 'CCPU-3.1',
        })),
        totalAmountDA: totalIssueAmount,
        status: 'EN_TRANSIT',
      };

      setBonsSortieList(prev => [newBonDeSortie, ...prev]);
      setShowIssueModal(false);
      await loadData();

      // Proposer immédiatement d'afficher et imprimer le Bon de Sortie / Accusé
      setSelectedBsForPrint(newBonDeSortie);
      setShowPrintBsModal(true);

      setNotification(`Bon de Sortie ${generatedBsNumber} validé avec succès (${issueLines.length} produits, ${formatCurrencyDA(totalIssueAmount, false)}).`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la génération du bon de sortie');
    }
  };

  // Action : Valider l'Accusé de Réception sur site
  const handleValidateAccuseReception = (bsId: string) => {
    setBonsSortieList(prev =>
      prev.map(b =>
        b.id === bsId
          ? {
              ...b,
              status: 'RECEPTIONNE_CONFORME',
              receiptTimestamp: new Date().toISOString(),
              receiverSignature: `${b.recipientName} — Reçu conforme sur chantier sans réserve`,
            }
          : b
      )
    );
    if (selectedBsForPrint && selectedBsForPrint.id === bsId) {
      setSelectedBsForPrint(prev =>
        prev
          ? {
              ...prev,
              status: 'RECEPTIONNE_CONFORME',
              receiptTimestamp: new Date().toISOString(),
              receiverSignature: `${prev.recipientName} — Reçu conforme sur chantier sans réserve`,
            }
          : null
      );
    }
    setNotification("Accusé de Réception validé ! Le matériel a été réceptionné conforme sur site.");
    setTimeout(() => setNotification(null), 5000);
  };

  // Réception de Marchandises sur Bon de Commande
  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPO = purchaseOrders.find(p => p.id === selectedPOId);
      if (!selectedPO || !selectedPO.lines || selectedPO.lines.length === 0) {
        alert('Bon de commande non valide ou sans ligne');
        return;
      }

      if (receiveQualityStatus === 'REJET') {
        setShowReceiveModal(false);
        setNotification(`Procès-verbal de Rejet Fournisseur émis ! La livraison de ${receiveQty} unités a été refusée et renvoyée au transporteur.`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      const qualityNote = receiveQualityStatus === 'AVEC_RESERVES'
        ? `[QUARANTAINE CND / RÉSERVES CONSTATÉES : ${receiveReserveNotes}]`
        : `[RÉCEPTION 100% CONFORME SANS RÉSERVE]`;

      await api.post<any>('/inventory/receive-goods', {
        purchaseOrderId: selectedPO.id,
        warehouseId: selectedWarehouseId,
        deliveryNoteNumber,
        notes: `${qualityNote} | CCPU 3.1: [${materialCertificate31}] | Livré par: ${receiveDriver} (Matricule: ${receiveVehicle})`,
        lines: [
          {
            purchaseOrderLineId: selectedPO.lines[0].id,
            quantityReceived: Number(receiveQty),
          },
        ],
      });

      setShowReceiveModal(false);
      await loadData();
      setNotification(`Réception de ${receiveQty} unités enregistrée avec succès (${receiveQualityStatus === 'AVEC_RESERVES' ? 'Sous Réserves CND' : 'Conforme'}) ! Stock magasin actualisé.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur réception marchandises');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itm = items.find(i => i.id === adjustItemId);
      if (!itm) {
        alert('Veuillez sélectionner un article');
        return;
      }

      await api.post('/inventory/adjust-stock', {
        itemId: adjustItemId,
        warehouseId: adjustWarehouseId || warehouses[0]?.id,
        newQuantity: Number(adjustNewQty),
        reason: adjustReason,
        notes: adjustNotes,
      });

      setShowAdjustModal(false);
      setAdjustNotes('');
      await loadData();
      setNotification(`Ajustement d'inventaire validé pour "${itm.name}" ! Nouveau stock physique : ${adjustNewQty} ${itm.unit}.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur ajustement stock');
    }
  };

  const handleReportBsIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBsForIncident) return;

    setBonsSortieList(prev =>
      prev.map(b =>
        b.id === selectedBsForIncident.id
          ? {
              ...b,
              status: 'RESERVES_SIGNALEES',
              receiverSignature: `${b.recipientName} — RÉSERVE TRANSPORT : ${incidentNotes}`,
              receiptTimestamp: new Date().toISOString(),
            }
          : b
      )
    );
    setSelectedBsForIncident(null);
    setIncidentNotes('');
    setNotification('Réserve transport / anomalie chantier consignée sur le Bon de Sortie !');
    setTimeout(() => setNotification(null), 5000);
  };

  // Nouvel Article
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<any>('/inventory/items', {
        name: newItemName,
        description: newItemDesc || `${newItemCategory} - ${newItemName}`,
        unit: newItemUnit,
        unitCost: Number(newItemCost),
        minStockLevel: Number(newItemMinStock),
        currentStock: Number(newItemCurrentStock),
      });

      setShowCreateItemModal(false);
      setNewItemName('');
      setNewItemDesc('');
      await loadData();
      setNotification(`Article "${created.name}" (${created.code}) créé avec succès dans le catalogue !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur création article');
    }
  };

  // Nouveau Magasin
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<any>('/inventory/warehouses', {
        name: newWhName,
        location: newWhLocation,
        managerName: newWhManager,
      });

      setShowCreateWarehouseModal(false);
      setNewWhName('');
      setNewWhLocation('');
      setNewWhManager('');
      await loadData();
      setNotification(`Magasin "${created.name}" (${created.code}) déclaré avec succès !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur création magasin');
    }
  };

  // Transfert Inter-Magasins
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceWhId || !transferTargetWhId || !transferItemId) {
      alert('Veuillez sélectionner les magasins source/destination et un article.');
      return;
    }
    if (transferSourceWhId === transferTargetWhId) {
      alert('Le magasin d’expédition et le magasin de destination doivent être différents.');
      return;
    }
    try {
      const fullNotes = `[Chauffeur: ${transferDriver} | Matricule: ${transferVehicle}] ${transferNotes}`;
      await api.post('/inventory/transfers', {
        sourceWarehouseId: transferSourceWhId,
        targetWarehouseId: transferTargetWhId,
        itemId: transferItemId,
        quantity: Number(transferQty),
        notes: fullNotes,
      });
      setShowTransferModal(false);
      await loadData();
      setNotification(`Transfert inter-magasins validé avec succès (${transferQty} unités) ! Mouvement tracé au grand livre.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du transfert inter-magasins');
    }
  };

  // Retour de Chantier (Surplus & Chutes)
  const handleExecuteReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnProjectId || !returnWhId || !returnItemId) {
      alert('Veuillez sélectionner le projet, le magasin récepteur et l’article à réintégrer.');
      return;
    }
    try {
      const res = await api.post<any>('/inventory/returns', {
        projectId: returnProjectId,
        warehouseId: returnWhId,
        itemId: returnItemId,
        quantity: Number(returnQty),
        condition: returnCondition,
        notes: returnNotes,
      });
      setShowReturnModal(false);
      await loadData();
      const creditedTxt = res?.costCredited ? ` (+${formatCurrencyDA(res.costCredited, false)} déduit du coût réel du projet)` : '';
      setNotification(`Retour de chantier enregistré ! Stock réintégré au magasin${creditedTxt}.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du retour de chantier');
    }
  };

  const filteredItems = items.filter(
    i =>
      i.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
      i.code?.toLowerCase().includes(searchItem.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const filteredBonsSortie = bonsSortieList.filter(
    b =>
      b.bonNumber?.toLowerCase().includes(searchBs.toLowerCase()) ||
      b.clientName?.toLowerCase().includes(searchBs.toLowerCase()) ||
      b.siteLocation?.toLowerCase().includes(searchBs.toLowerCase()) ||
      b.driverName?.toLowerCase().includes(searchBs.toLowerCase()) ||
      b.projectCode?.toLowerCase().includes(searchBs.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#0B207D] rounded-lg text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B207D]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error / RBAC Alert */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Alerte de chargement des stocks / Contrôle RBAC</div>
            <div className="text-xs text-amber-800 mt-1">{error}</div>
            <div className="text-[11px] text-amber-700 mt-2">
              Certaines opérations de stock sont réservées au Responsable Magasin ou Directeur Général.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#0B207D]" />
            Stocks, Magasins & Bons de Sortie Chantiers — {COMPANY_NAME}
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Multi-magasins, gestion des bons de livraison, sorties multi-articles, chauffeurs & accusés de réception signés.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateWarehouseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-[#0B207D]" />
            Nouveau Magasin
          </button>
          <button
            onClick={() => setShowCreateItemModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#E1E6ED] rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-[#0B207D]" />
            Nouvel Article
          </button>
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Réception Marchandises (BC)
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#E51A1A] text-white rounded-lg hover:bg-[#c91414] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Émettre Bon de Sortie & AR
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#0B207D] text-[#0B207D] rounded-lg hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            Transfert Inter-Magasins
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" />
            Retour Chantier (Surplus)
          </button>
        </div>
      </div>

      {/* Stock Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Valeur du Stock Valorisé (PMP)
          </div>
          <div className="text-lg font-extrabold text-[#07164D] mt-1">
            {formatCurrencyDA(totalStockValuation, false)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Calculé sur {items.length} références actives dans PostgreSQL
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Bons de Sortie Émis & AR
          </div>
          <div className="text-lg font-bold text-[#E51A1A] mt-1">
            {bonsSortieList.length} bons de transfert
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avec chauffeur, matricule et visa chantier
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Dépôts & Magasins Avancés
          </div>
          <div className="text-lg font-bold text-slate-800 mt-1">
            {warehouses.length} magasins opérationnels
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Arzew Central, Hassi Messaoud & Chantiers
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#697789] uppercase tracking-wider">
            Mouvements Tracés au Ledger
          </div>
          <div className="text-lg font-bold text-emerald-700 mt-1">
            {movements.length} écritures immuables
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Traçabilité 100% auditable
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'catalog'
              ? 'border-[#0B207D] text-[#0B207D] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Catalogue Articles & Niveaux de Stock ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('bons_sortie')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'bons_sortie'
              ? 'border-[#E51A1A] text-[#E51A1A] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Bons de Sortie & Accusés de Réception ({bonsSortieList.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'transfers'
              ? 'border-[#0B207D] text-[#0B207D] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Transferts Inter-Magasins
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'returns'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          Retours Chantiers (Surplus)
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 ${
            activeTab === 'warehouses'
              ? 'border-[#0B207D] text-[#0B207D] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dépôts & Magasins ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 px-4 border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'border-[#0B207D] text-[#0B207D] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Grand Livre des Mouvements ({movements.length})
        </button>
      </div>

      {/* TAB 1: CATALOGUE ARTICLES */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
              Articles Normalisés & Valorisation au Coût Moyen Pondéré (PMP)
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrer par code, désignation..."
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Seuil Min</th>
                  <th className="py-2.5 px-3 text-right">Stock Disponible</th>
                  <th className="py-2.5 px-3 text-right">Dernier Coût PMP</th>
                  <th className="py-2.5 px-3 text-right">Valeur Totale</th>
                  <th className="py-2.5 px-3 text-center">État Seuil</th>
                  <th className="py-2.5 px-3 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(filteredItems) ? filteredItems : []).map(i => {
                  const current = Number(i.currentStock || 0);
                  const min = Number(i.minStockLevel || 0);
                  const isLow = current <= min;

                  return (
                    <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                        {i.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        <div>{i.name}</div>
                        <div className="text-[10px] text-slate-400">{i.description}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                        {min} {i.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold whitespace-nowrap">
                        <span className={isLow ? 'text-amber-700' : 'text-slate-900'}>
                          {current} {i.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-medium whitespace-nowrap">
                        {formatCurrencyDA(i.unitCost || 0, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#07164D] whitespace-nowrap">
                        {formatCurrencyDA(current * Number(i.unitCost || 0), false)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isLow ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Seuil Critique
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            setAdjustItemId(i.id);
                            setAdjustNewQty(current);
                            setShowAdjustModal(true);
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Ajustement physique d'inventaire contradictoire"
                        >
                          Ajuster Stock
                        </button>
                        <button
                          onClick={() => {
                            setIssueLines([{ id: 'line-quick', itemId: i.id, quantity: 1, batchNumber: 'LOT-RAPIDE' }]);
                            setShowIssueModal(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-[#E51A1A] hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          Délivrer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BONS DE SORTIE & ACCUSÉS DE RÉCEPTION */}
      {activeTab === 'bons_sortie' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#07164D]">
                Registre des Bons de Sortie Matériel & Accusés de Réception (BS / AR)
              </h2>
              <p className="text-[11px] text-slate-500">
                Traçabilité des transferts de magasins vers chantiers avec chauffeur, immatriculation camion et accusé contradictoire.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Rechercher par bon, client, chauffeur..."
                  value={searchBs}
                  onChange={e => setSearchBs(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
                />
              </div>
              <button
                onClick={() => setShowIssueModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E51A1A] text-white rounded-lg text-xs font-semibold hover:bg-[#c91414] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau Bon de Sortie
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Réf Bon</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Chantier / Client</th>
                    <th className="py-2.5 px-3">Site Destination</th>
                    <th className="py-2.5 px-3">Chauffeur & Véhicule</th>
                    <th className="py-2.5 px-3 text-center">Articles</th>
                    <th className="py-2.5 px-3 text-right">Montant Imputé</th>
                    <th className="py-2.5 px-3 text-center">Statut Accusé</th>
                    <th className="py-2.5 px-3 text-right">Actions Disponibles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Array.isArray(filteredBonsSortie) ? filteredBonsSortie : []).map(bs => (
                    <tr key={bs.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#E51A1A] whitespace-nowrap">
                        {bs.bonNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDateDZ(bs.date)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link
                          href={`/projects/${bs.projectCode}`}
                          className="text-[#0B207D] hover:underline flex items-center gap-1 font-mono font-bold"
                          title={`Accéder à la fiche du projet ${bs.projectCode}`}
                        >
                          {bs.projectCode}
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </Link>
                        <div className="text-[10px] text-slate-500">{bs.clientName}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{bs.siteLocation}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{bs.workZone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#0B207D]" />
                          {bs.driverName}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-500">
                          Matr: {bs.vehicleMatricule}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-slate-700">
                        {bs.items.length} produit(s)
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#07164D] whitespace-nowrap">
                        {formatCurrencyDA(bs.totalAmountDA, false)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {bs.status === 'RECEPTIONNE_CONFORME' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Reçu conforme sur site
                          </span>
                        ) : bs.status === 'RESERVES_SIGNALEES' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-200 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            Réserves transport signalées
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center justify-center gap-1">
                            <Truck className="w-3 h-3 text-amber-600 animate-pulse" />
                            En transit vers chantier
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedBsForPrint(bs);
                            setShowPrintBsModal(true);
                          }}
                          className="px-2.5 py-1 bg-white border border-[#0B207D] text-[#0B207D] hover:bg-blue-50 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Voir & Imprimer BS
                        </button>
                        {bs.status === 'EN_TRANSIT' && (
                          <>
                            <button
                              onClick={() => handleValidateAccuseReception(bs.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Accuser Conforme
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBsForIncident(bs);
                                setIncidentNotes('Écart de quantité ou anomalie visuelle constatée au déchargement');
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Signaler Réserve
                            </button>
                          </>
                        )}
                        {bs.status === 'RESERVES_SIGNALEES' && (
                          <button
                            onClick={() => handleValidateAccuseReception(bs.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Lever la Réserve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TRANSFERTS INTER-MAGASINS */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0B207D]" />
                Transferts Inter-Magasins (Arzew ↔ Hassi Messaoud)
              </h2>
              <p className="text-[11px] text-slate-500">
                Acheminement de stocks entre dépôts centraux et bases avancées avec transporteur et récépissé.
              </p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B207D] text-white text-xs font-semibold rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Transfert Inter-Magasins
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Magasin Central Principal</div>
              <div className="text-xs font-bold text-[#07164D] mt-0.5">Magasin Central Arzew (ZI Ouest)</div>
              <div className="text-[10px] text-slate-400 mt-1">Plateforme logistique primaire</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Parc Avancé Sud</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">Base Logistique Hassi Messaoud</div>
              <div className="text-[10px] text-slate-400 mt-1">Dépôt réacteur & tuyauterie Sud</div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Statut Transport</div>
              <div className="text-xs font-bold text-emerald-800 mt-0.5">En Transit & Sécurisé</div>
              <div className="text-[10px] text-emerald-600 mt-1">Contrôle contradictoire au départ et à l'arrivée</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Historique des Transferts Inter-Dépôts
            </div>
            {movements.filter(m => m.movementType === 'WAREHOUSE_TRANSFER').length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Aucun transfert inter-magasins récent. Cliquez sur "Nouveau Transfert" pour initier un déplacement de stock.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Article Transféré</th>
                      <th className="p-2.5 text-center">Quantité</th>
                      <th className="p-2.5">Magasin Source</th>
                      <th className="p-2.5">Magasin Récepteur</th>
                      <th className="p-2.5">Chauffeur & Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {movements
                      .filter(m => m.movementType === 'WAREHOUSE_TRANSFER')
                      .map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500">{formatDateDZ(m.createdAt)}</td>
                          <td className="p-2.5 font-bold text-[#07164D]">{m.item?.name || 'Article'}</td>
                          <td className="p-2.5 text-center font-bold text-[#0B207D]">{m.quantity} {m.item?.unit}</td>
                          <td className="p-2.5 text-slate-700">{m.warehouse?.name || 'Départ'}</td>
                          <td className="p-2.5 font-semibold text-emerald-700">Dépôt Destinataire</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{m.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RETOURS DE CHANTIER (SURPLUS & CHUTES) */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden flex flex-col space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" />
                Retours de Chantier (Surplus & Chutes Valorables)
              </h2>
              <p className="text-[11px] text-slate-500">
                Réintégration de matière non consommée en stock magasin et crédit immédiat sur les coûts réels du projet.
              </p>
            </div>
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Retour de Chantier
            </button>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Principe de Synchronisation Financière & Matière
            </div>
            <p className="text-[11px] text-emerald-800">
              Chaque retour consigné réincrémente le stock physique du magasin et vient soustraire la valeur marchande correspondante du champ <code className="font-mono bg-white px-1 rounded">actualCost</code> du chantier concerné.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Historique des Retours Chantier Enregistrés
            </div>
            {movements.filter(m => m.movementType === 'RETURN').length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Aucun retour de chantier enregistré pour le moment. Cliquez sur "Nouveau Retour" pour réintégrer des surplus.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Article Réintégré</th>
                      <th className="p-2.5 text-center">Quantité</th>
                      <th className="p-2.5">Chantier d'Origine</th>
                      <th className="p-2.5">Magasin Récepteur</th>
                      <th className="p-2.5">Observations & État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {movements
                      .filter(m => m.movementType === 'RETURN')
                      .map((m: any) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500">{formatDateDZ(m.createdAt)}</td>
                          <td className="p-2.5 font-bold text-[#07164D]">{m.item?.name || 'Article'}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">+{m.quantity} {m.item?.unit}</td>
                          <td className="p-2.5 font-mono font-bold">
                            {m.project?.code ? (
                              <Link
                                href={`/projects/${m.project.code}`}
                                className="text-[#0B207D] hover:underline flex items-center gap-1"
                                title={`Voir la fiche du chantier ${m.project.code}`}
                              >
                                {m.project.code}
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </Link>
                            ) : (
                              <span className="text-slate-400">Chantier</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-700">{m.warehouse?.name || 'Magasin'}</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{m.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DÉPÔTS & MAGASINS */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Array.isArray(warehouses) ? warehouses : []).map(w => (
            <div key={w.id} className="bg-white p-4 rounded-xl border border-[#E1E6ED] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B207D]">{w.code}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Opérationnel
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800">{w.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {w.location}
              </div>
              <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100 flex justify-between">
                <span>Responsable : <strong>{w.managerName}</strong></span>
                <span>Mouvements : <strong>{w._count?.stockMovements || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: GRAND LIVRE DES MOUVEMENTS (LEDGER) */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#0B207D]" />
              Journal Immuable des Écritures de Stocks ({movements.length})
            </span>
            <span className="text-[10px] text-slate-500">Traçabilité complète PostgreSQL</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date & Heure</th>
                  <th className="py-2.5 px-3">Réf Mouvement</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Article</th>
                  <th className="py-2.5 px-3 text-right">Quantité</th>
                  <th className="py-2.5 px-3 text-right">Coût Unitaire</th>
                  <th className="py-2.5 px-3 text-right">Valeur Totale</th>
                  <th className="py-2.5 px-3">Pièce Justificative & Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(movements) ? movements : []).map(m => {
                  const isReceive = m.movementType === StockMovementType.PURCHASE_RECEIPT || m.movementType === 'RECEIPT';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDateDZ(m.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                        {m.movementNumber}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isReceive ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Entrée Réception
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-[#E51A1A] font-bold px-2 py-0.5 rounded">
                            Sortie Chantier
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {m.item?.name || m.itemId}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold whitespace-nowrap">
                        {isReceive ? `+${m.quantity}` : `-${m.quantity}`} {m.item?.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                        {formatCurrencyDA(m.unitCost, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#07164D] whitespace-nowrap">
                        {formatCurrencyDA(m.totalCost, false)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        <div>{m.referenceDocument || m.notes}</div>
                        <div className="text-[10px] text-slate-400">{m.notes}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : ÉMETTRE BON DE SORTIE CHANTIER & ACCUSÉ DE RÉCEPTION (MULTI-LIGNES) */}
      {/* ========================================================================= */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#07164D] flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-[#E51A1A]" />
                  Émettre un Bon de Sortie & Accusé de Réception (BS / AR)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Transfert multi-produits du magasin vers chantier avec traçabilité transporteur et décharge signée.
                </p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBonDeSortie} className="space-y-4 text-xs">
              {/* Expéditeur & Destinataire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    1. Entreprise Expéditrice (Magasin Source)
                  </span>
                  <div className="font-bold text-slate-900 mb-1">{COMPANY_NAME}</div>
                  <select
                    value={selectedWarehouseId}
                    onChange={e => setSelectedWarehouseId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                    required
                  >
                    {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name} ({w.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    2. Chantier & Client Destinataire
                  </span>
                  <select
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-semibold text-[#0B207D]"
                    required
                  >
                    {(Array.isArray(projects) ? projects : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.clientName} ({p.name})
                      </option>
                    ))}
                  </select>
                  {activeIssueProject && (
                    <div className="mt-1 text-[11px] text-slate-600">
                      Site : <strong>{activeIssueProject.siteLocation}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Chauffeur Transporteur & Véhicule */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#0B207D] text-xs">
                  <Truck className="w-4 h-4" />
                  <span>3. Informations Transport & Chauffeur</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nom & Prénom du Chauffeur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      placeholder="ex: Mourad Benali"
                      className="w-full p-2 border border-slate-200 rounded bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Matricule du Camion / Véhicule <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleMatricule}
                      onChange={e => setVehicleMatricule(e.target.value)}
                      placeholder="ex: 01452-116-30"
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Zone de Déchargement Chantier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={workZone}
                      onChange={e => setWorkZone(e.target.value)}
                      placeholder="ex: Zone Skids de Pompage P-101"
                      className="w-full p-2 border border-slate-200 rounded bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* LIGNES MULTI-PRODUITS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#0B207D]" />
                    4. Articles à Expédier ({issueLines.length} référence(s))
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIssueLine}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#0B207D] hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un Produit
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
                  {(Array.isArray(issueLinesComputed) ? issueLinesComputed : []).map((line, idx) => (
                    <div key={line.id} className="p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Ligne #{idx + 1}</span>
                        {issueLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIssueLine(line.id)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Produit / Article</label>
                          <select
                            value={line.itemId}
                            onChange={e => handleUpdateIssueLine(line.id, 'itemId', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs"
                            required
                          >
                            {(Array.isArray(items) ? items : []).map(i => (
                              <option key={i.id} value={i.id}>
                                {i.code} — {i.name} (Dispo : {i.currentStock} {i.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Quantité</label>
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={e => handleUpdateIssueLine(line.id, 'quantity', Math.max(1, Number(e.target.value)))}
                            className={`w-full p-1.5 border rounded font-bold text-right ${
                              line.isInsufficient ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200'
                            }`}
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">N° Lot / Coulée CCPU</label>
                          <input
                            type="text"
                            value={line.batchNumber}
                            onChange={e => handleUpdateIssueLine(line.id, 'batchNumber', e.target.value)}
                            placeholder="LOT-2026-..."
                            className="w-full p-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 text-right">
                          <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Sous-Total</label>
                          <span className="font-extrabold text-slate-800 text-xs block">
                            {formatCurrencyDA(line.totalLineCost, false)}
                          </span>
                        </div>
                      </div>

                      {line.isInsufficient && (
                        <div className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          Stock insuffisant en magasin ({line.available} disponible).
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Bon de Sortie & Imputation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Montant Total Imputé au Marché
                  </span>
                  <span className="text-slate-600 text-xs">
                    Débité au coût réel du projet {activeIssueProject?.code}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#07164D]">
                    {formatCurrencyDA(totalIssueAmount, false)}
                  </span>
                </div>
              </div>

              {/* Boutons d'actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={hasAnyInsufficientStock || issueLines.length === 0}
                  className="px-5 py-2 bg-[#E51A1A] hover:bg-[#c91414] text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Valider le Bon de Sortie & Accusé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : AFFICHAGE & IMPRESSION A4 DU BON DE SORTIE & ACCUSÉ DE RÉCEPTION */}
      {/* ========================================================================= */}
      {showPrintBsModal && selectedBsForPrint && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Header d'actions (masqué à l'impression) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0B207D]" />
                <h3 className="text-sm font-bold text-[#07164D]">
                  Document Officiel : Bon de Sortie & Accusé de Réception (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedBsForPrint.status === 'EN_TRANSIT' && (
                  <button
                    onClick={() => handleValidateAccuseReception(selectedBsForPrint.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valider Accusé de Réception sur Site
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0B207D] text-white rounded-lg text-xs font-semibold hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer / PDF
                </button>
                <button
                  onClick={() => setShowPrintBsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT OFFICIEL FORMAT IMPRESSION */}
            <div className="p-8 bg-white border border-slate-300 rounded-lg shadow-xs space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0">
              {/* Cartouche supérieur */}
              <div className="flex items-center justify-between border-b-2 border-[#0B207D] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center">
                    <img src="/logo-silex.png" alt="SILEX SERVICES" className="h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-[#07164D] tracking-wide">{COMPANY_NAME}</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      Services Industriels & Maintenance — Depuis {COMPANY_ESTABLISHED}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      QCD : Qualité • Coûts • Délais — Couverture Nationale Algérie
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-[#E51A1A] font-mono tracking-wider">
                    {selectedBsForPrint.bonNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date : <strong>{formatDateDZ(selectedBsForPrint.date)}</strong>
                  </div>
                  <div className="text-[9px] px-2 py-0.5 rounded bg-slate-100 font-bold uppercase mt-1 inline-block">
                    Statut : {selectedBsForPrint.status === 'RECEPTIONNE_CONFORME' ? 'Reçu Conforme sur Site' : 'En Transit Chantiers'}
                  </div>
                </div>
              </div>

              {/* Titre Document */}
              <div className="text-center py-2 bg-slate-100 rounded border border-slate-200">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  BON DE SORTIE MATÉRIEL & ACCUSÉ DE RÉCEPTION DE CHANTIER
                </h2>
                <p className="text-[10px] text-slate-600">
                  Document de transfert matière et décharge contradictoire magasin-chantier
                </p>
              </div>

              {/* Tableau Expéditeur, Destinataire & Transport */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-1">
                  <div className="font-bold text-[#0B207D] uppercase tracking-wider text-[10px]">
                    EXPÉDITEUR
                  </div>
                  <div className="font-bold text-slate-900">{selectedBsForPrint.senderCompany}</div>
                  <div className="text-slate-600">{selectedBsForPrint.warehouseName}</div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Émetteur : Magasinier Général SILEX
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-1">
                  <div className="font-bold text-[#0B207D] uppercase tracking-wider text-[10px]">
                    DESTINATAIRE (CLIENT & CHANTIER)
                  </div>
                  <div className="font-bold text-slate-900">{selectedBsForPrint.clientName}</div>
                  <div className="text-slate-700">
                    Projet : <strong>{selectedBsForPrint.projectCode}</strong> — {selectedBsForPrint.projectName}
                  </div>
                  <div className="text-slate-600">
                    Site : <strong>{selectedBsForPrint.siteLocation}</strong> ({selectedBsForPrint.workZone})
                  </div>
                </div>
              </div>

              {/* Bloc Transport */}
              <div className="p-3 border border-slate-200 rounded-lg bg-blue-50/40 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Chauffeur Transporteur :</span>
                  <span className="font-bold text-slate-900">{selectedBsForPrint.driverName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Matricule Camion :</span>
                  <span className="font-mono font-bold text-[#0B207D] text-sm">{selectedBsForPrint.vehicleMatricule}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Destinataire / Réceptionnaire :</span>
                  <span className="font-bold text-slate-900">{selectedBsForPrint.recipientName}</span>
                </div>
              </div>

              {/* Tableau des Produits */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Désignation des Équipements & Matières Délivrées
                </div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">N°</th>
                      <th className="py-2 px-3">Réf Article</th>
                      <th className="py-2 px-3">Désignation & Spécification</th>
                      <th className="py-2 px-3">N° Lot / CCPU 3.1</th>
                      <th className="py-2 px-3 text-right">Quantité</th>
                      <th className="py-2 px-3 text-right">Coût Unitaire HT</th>
                      <th className="py-2 px-3 text-right">Montant Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(Array.isArray(selectedBsForPrint?.items) ? selectedBsForPrint.items : []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{it.code}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{it.name}</td>
                        <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{it.batchNumber}</td>
                        <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          {formatCurrencyDA(it.unitCost, false)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatCurrencyDA(it.totalCost, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                      <td colSpan={6} className="py-2 px-3 text-right uppercase text-slate-700">
                        Total Général Imputé au Marché (DA HT) :
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-[#07164D] font-black">
                        {formatCurrencyDA(selectedBsForPrint.totalAmountDA, false)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Cadres de Signatures et Visas Triples */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs">
                {/* 1. Émetteur */}
                <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between bg-slate-50/30">
                  <div className="text-[10px] font-bold uppercase text-slate-600">
                    1. Visa Magasinier SILEX
                  </div>
                  <div className="text-[10px] text-slate-500">M. Tarek Meziani</div>
                  <div className="text-[9px] text-slate-400 italic">Signature & Cachet Magasin</div>
                </div>

                {/* 2. Transporteur */}
                <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between bg-slate-50/30">
                  <div className="text-[10px] font-bold uppercase text-slate-600">
                    2. Visa Chauffeur Transporteur
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">
                    {selectedBsForPrint.driverName} ({selectedBsForPrint.vehicleMatricule})
                  </div>
                  <div className="text-[9px] text-slate-400 italic">Prise en charge du matériel</div>
                </div>

                {/* 3. Accusé de réception */}
                <div className={`border rounded p-3 h-28 flex flex-col justify-between ${
                  selectedBsForPrint.status === 'RECEPTIONNE_CONFORME'
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-300 bg-slate-50/30'
                }`}>
                  <div className="text-[10px] font-bold uppercase text-[#0B207D]">
                    3. Accusé de Réception Client / Chantier
                  </div>
                  {selectedBsForPrint.status === 'RECEPTIONNE_CONFORME' ? (
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        REÇU CONFORME SANS RÉSERVE
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {selectedBsForPrint.receiverSignature}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-400 italic">
                      Date d&apos;arrivée, Nom, Visa & Cachet Réception
                    </div>
                  )}
                  <div className="text-[9px] text-slate-400 italic">Décharge contradictoire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : RÉCEPTION MARCHANDISES SUR BON DE COMMANDE (BR / CCPU 3.1) */}
      {/* ========================================================================= */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-[#0B207D]" />
                  Réception Marchandise sur Bon de Commande (BC)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Contrôle quantitatif, conformité CCPU 3.1, chauffeur livreur et incrémentation immédiate du stock.
                </p>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReceiveGoods} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Bon de Commande Associé <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPOId}
                  onChange={e => setSelectedPOId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-semibold text-[#0B207D]"
                  required
                >
                  {(Array.isArray(purchaseOrders) ? purchaseOrders : []).map(po => (
                    <option key={po.id} value={po.id}>
                      {po.orderNumber} — Fournisseur : {po.supplier?.name} ({po.project?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Magasin Réceptionnaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWarehouseId}
                  onChange={e => setSelectedWarehouseId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  required
                >
                  {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    N° Bon de Livraison (BL) Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNoteNumber}
                    onChange={e => setDeliveryNoteNumber(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    N° Certificat Matière CCPU 3.1
                  </label>
                  <input
                    type="text"
                    value={materialCertificate31}
                    onChange={e => setMaterialCertificate31(e.target.value)}
                    placeholder="CCPU-EN10204-3.1"
                    className="w-full p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chauffeur Transporteur / Livreur
                  </label>
                  <input
                    type="text"
                    value={receiveDriver}
                    onChange={e => setReceiveDriver(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Matricule Camion de Livraison
                  </label>
                  <input
                    type="text"
                    value={receiveVehicle}
                    onChange={e => setReceiveVehicle(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantité Réceptionnée <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={receiveQty}
                  onChange={e => setReceiveQty(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contrôle Qualité Réception & Conformité Fournisseur *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    onClick={() => setReceiveQualityStatus('CONFORME')}
                    className={`p-2 rounded border text-center cursor-pointer transition-colors ${
                      receiveQualityStatus === 'CONFORME'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rqStatus"
                      checked={receiveQualityStatus === 'CONFORME'}
                      onChange={() => setReceiveQualityStatus('CONFORME')}
                      className="sr-only"
                    />
                    <div className="text-xs flex items-center justify-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      100% Conforme
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Entrée directe en stock</div>
                  </label>

                  <label
                    onClick={() => setReceiveQualityStatus('AVEC_RESERVES')}
                    className={`p-2 rounded border text-center cursor-pointer transition-colors ${
                      receiveQualityStatus === 'AVEC_RESERVES'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rqStatus"
                      checked={receiveQualityStatus === 'AVEC_RESERVES'}
                      onChange={() => setReceiveQualityStatus('AVEC_RESERVES')}
                      className="sr-only"
                    />
                    <div className="text-xs flex items-center justify-center gap-1 font-semibold text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Avec Réserves
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Quarantaine CND</div>
                  </label>

                  <label
                    onClick={() => setReceiveQualityStatus('REJET')}
                    className={`p-2 rounded border text-center cursor-pointer transition-colors ${
                      receiveQualityStatus === 'REJET'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rqStatus"
                      checked={receiveQualityStatus === 'REJET'}
                      onChange={() => setReceiveQualityStatus('REJET')}
                      className="sr-only"
                    />
                    <div className="text-xs flex items-center justify-center gap-1 font-semibold text-red-800">
                      <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      Rejet Fournisseur
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">Retour au transporteur</div>
                  </label>
                </div>
              </div>

              {receiveQualityStatus === 'AVEC_RESERVES' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Détail des Réserves CND / Quarantaine *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiveReserveNotes}
                    onChange={e => setReceiveReserveNotes(e.target.value)}
                    placeholder="Ex: CCPU manquant ou défaut dimensionnel sur collerette bride..."
                    className="w-full p-2 border border-amber-300 rounded bg-amber-50/50 text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-semibold rounded text-white transition-colors shadow-xs cursor-pointer ${
                    receiveQualityStatus === 'REJET'
                      ? 'bg-red-600 hover:bg-red-700'
                      : receiveQualityStatus === 'AVEC_RESERVES'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#0B207D] hover:bg-[#07164D]'
                  }`}
                >
                  {receiveQualityStatus === 'REJET'
                    ? 'Notifier Rejet & Refus de Réception'
                    : 'Valider la Réception & Actualiser Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : CRÉER NOUVEAU MAGASIN */}
      {/* ========================================================================= */}
      {showCreateWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0B207D]" />
                  Déclarer un Nouveau Magasin / Parc Chantier
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ouverture d&apos;un dépôt central ou parc avancé sur base de vie.
                </p>
              </div>
              <button onClick={() => setShowCreateWarehouseModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom du Magasin / Dépôt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWhName}
                  onChange={e => setNewWhName(e.target.value)}
                  placeholder="ex: Magasin Avancé Chantier Hassi Messaoud"
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Localisation Géographique / Wilaya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWhLocation}
                  onChange={e => setNewWhLocation(e.target.value)}
                  placeholder="ex: Base de Vie Sud HMD Bloc 4 (Ouargla)"
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Responsable Magasinier Assigné <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWhManager}
                  onChange={e => setNewWhManager(e.target.value)}
                  placeholder="ex: M. Tarek Meziani"
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateWarehouseModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs"
                >
                  Créer le Magasin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5 : CRÉER NOUVEL ARTICLE */}
      {/* ========================================================================= */}
      {showCreateItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0B207D]" />
                  Créer une Référence Article Industrielle
                </h3>
                <p className="text-[11px] text-slate-500">
                  Normalisation et valorisation immédiate dans l&apos;inventaire permanent.
                </p>
              </div>
              <button onClick={() => setShowCreateItemModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Désignation de l&apos;Article <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="ex: Vanne à Boisseau Sphérique 6'' ANSI 300 Inox 316L"
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Unité de Mesure <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  >
                    <option value="UNITE">Unité (U)</option>
                    <option value="METRE">Mètre linéaire (m)</option>
                    <option value="KG">Kilogramme (kg)</option>
                    <option value="LOT">Lot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Coût Unitaire Estimé PMP (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Seuil d&apos;Alerte Minimum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemMinStock}
                    onChange={e => setNewItemMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Stock Initial en Magasin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newItemCurrentStock}
                    onChange={e => setNewItemCurrentStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold text-slate-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-xs">
                <span className="text-slate-600">Valeur d&apos;inventaire initiale :</span>
                <span className="font-bold text-[#0B207D]">
                  {formatCurrencyDA(newItemCurrentStock * newItemCost, false)}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description & Spécifications Métallurgiques
                </label>
                <textarea
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  rows={2}
                  placeholder="Spécifications API 6D, classe de pression ANSI 300, nuance acier inoxydable..."
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateItemModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer l&apos;Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5 : SIGNALER RÉSERVE / INCIDENT TRANSPORT BON DE SORTIE */}
      {/* ========================================================================= */}
      {selectedBsForIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Signaler une Réserve de Transport</h3>
                  <p className="text-[11px] text-slate-500">{selectedBsForIncident.bonNumber} ({selectedBsForIncident.projectCode})</p>
                </div>
              </div>
              <button onClick={() => setSelectedBsForIncident(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportBsIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motif de la Réserve ou Anomalie Constatée *
                </label>
                <textarea
                  required
                  rows={3}
                  value={incidentNotes}
                  onChange={e => setIncidentNotes(e.target.value)}
                  placeholder="Ex: Colis ouvert pendant le transport, manque 2 joints DN100 ou rayure profonde sur portée d'étanchéité..."
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-[11px] text-red-900 space-y-1">
                <div className="font-bold">Conséquences de la notification :</div>
                <div>Le bon de sortie est marqué avec réserves au registre RH/Matériel et transmis au contrôle qualité chantier.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBsForIncident(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                >
                  Consigner la Réserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6 : AJUSTEMENT PHYSIQUE & AUDIT DE STOCK (RÉGULARISATION PÉRIODIQUE) */}
      {/* ========================================================================= */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Ajustement Physique & Régularisation de Stock</h3>
                  <p className="text-[11px] text-slate-500">Mise à jour du comptage réel avec traçabilité d'audit immuable (PostgreSQL).</p>
                </div>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Article à Ajuster <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustItemId}
                  onChange={e => {
                    setAdjustItemId(e.target.value);
                    const it = items.find(i => i.id === e.target.value);
                    if (it) setAdjustNewQty(Number(it.currentStock || 0));
                  }}
                  className="w-full p-2 border border-slate-200 rounded font-semibold text-slate-900 bg-white"
                  required
                >
                  {(Array.isArray(items) ? items : []).map(it => (
                    <option key={it.id} value={it.id}>
                      {it.code} — {it.name} (Stock actuel: {it.currentStock} {it.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Magasin Concerné <span className="text-red-500">*</span>
                </label>
                <select
                  value={adjustWarehouseId}
                  onChange={e => setAdjustWarehouseId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded font-medium bg-white"
                  required
                >
                  {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nouveau Stock Physique Réel Constaté <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={adjustNewQty}
                  onChange={e => setAdjustNewQty(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 border border-amber-300 rounded font-black text-sm text-[#0B207D] bg-amber-50/40"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motif d'Ajustement / Catégorie d'Écart *
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded font-medium bg-white"
                >
                  <option value="Écart d’inventaire contradictoire (Recomptage annuel)">Écart d’inventaire contradictoire (Recomptage annuel)</option>
                  <option value="Mise au rebut / Dégradation / Rejet matière">Mise au rebut / Dégradation / Rejet matière</option>
                  <option value="Régularisation entrée réception sans BL">Régularisation entrée réception sans BL</option>
                  <option value="Consommation atelier / Chutes non pointées">Consommation atelier / Chutes non pointées</option>
                  <option value="Autre rectification autorisée DG">Autre rectification autorisée DG</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Justification d'Audit & Références des Vérificateurs
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  placeholder="PV contradictoire signé par le magasinier et le contrôleur..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 text-white font-semibold rounded hover:bg-amber-800 transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer l'Ajustement d'Inventaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : NOUVEAU TRANSFERT INTER-MAGASINS */}
      {/* ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Émettre un Bon de Transfert Inter-Magasins</h3>
                  <p className="text-[11px] text-slate-500">Expédition de stock entre dépôts avec traçabilité transport</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Magasin d'Expédition (Source) *
                  </label>
                  <select
                    value={transferSourceWhId}
                    onChange={e => setTransferSourceWhId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Magasin de Réception (Cible) *
                  </label>
                  <select
                    value={transferTargetWhId}
                    onChange={e => setTransferTargetWhId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Article à Transférer *
                  </label>
                  <select
                    value={transferItemId}
                    onChange={e => setTransferItemId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(items) ? items : []).map(it => (
                      <option key={it.id} value={it.id}>
                        {it.code} — {it.name} (Stock actuel: {it.currentStock} {it.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferQty}
                    onChange={e => setTransferQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-center font-bold text-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chauffeur Transporteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={transferDriver}
                    onChange={e => setTransferDriver(e.target.value)}
                    placeholder="Ex: Djamel Hamidi"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Matricule Véhicule *
                  </label>
                  <input
                    type="text"
                    required
                    value={transferVehicle}
                    onChange={e => setTransferVehicle(e.target.value)}
                    placeholder="Ex: 02450-116-30"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observations & Justification du Transfert *
                </label>
                <textarea
                  rows={2}
                  required
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  placeholder="Ex: Approvisionnement pour phase de montage tuyauterie HP"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] shadow-xs cursor-pointer"
                >
                  Valider le Bon de Transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : RETOUR DE CHANTIER (SURPLUS & CHUTES) */}
      {/* ========================================================================= */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Retour de Chantier (Surplus & Chutes)</h3>
                  <p className="text-[11px] text-slate-500">Réintégration en stock et allègement des coûts réels du chantier</p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteReturn} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Chantier d'Origine *
                  </label>
                  <select
                    value={returnProjectId}
                    onChange={e => setReturnProjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(projects) ? projects : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Magasin de Réception *
                  </label>
                  <select
                    value={returnWhId}
                    onChange={e => setReturnWhId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Article Réintégré *
                  </label>
                  <select
                    value={returnItemId}
                    onChange={e => setReturnItemId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(items) ? items : []).map(it => (
                      <option key={it.id} value={it.id}>
                        {it.code} — {it.name} ({formatCurrencyDA(it.unitCost, false)}/{it.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={e => setReturnQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-center font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  État de la Marchandise Réintégrée *
                </label>
                <select
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D] font-semibold"
                >
                  <option value="BON_ETAT">Neuf / Intact en emballage d'origine</option>
                  <option value="CHUTE_REUTILISABLE">Chute de tuyauterie réutilisable avec traçabilité coulée</option>
                  <option value="A_REVISER">À contrôler / Décapage & requalification requis</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Justification & Contrôle Visuel *
                </label>
                <textarea
                  rows={2}
                  required
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="Ex: Réintégration de surplus non consommés avec décharge chef de chantier"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Synchronisation active : La valeur de ce stock sera automatiquement soustraite du coût réel consommé du chantier.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded hover:bg-emerald-800 shadow-xs cursor-pointer"
                >
                  Valider le Retour Chantier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
