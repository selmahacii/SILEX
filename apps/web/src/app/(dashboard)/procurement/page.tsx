'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, formatDateDZ, SystemRole, COMPANY_NAME, COMPANY_ESTABLISHED } from '@silex/shared';
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
  Users,
  Phone,
  Mail,
  MapPin,
  Tag,
  Star,
  Search,
  Filter,
  DollarSign,
  Package,
  Layers,
  X,
  Sparkles,
  CheckCircle2,
  Edit,
  RotateCcw,
  FileSpreadsheet,
  Percent,
  Award,
  Building2,
  Calendar,
  AlertOctagon,
  HardHat,
  ShieldAlert,
  FileCheck2,
  Flame,
  ArrowRight,
  BarChart3,
  Info,
  Gauge,
  FolderGit2,
  Zap,
  Snowflake,
  Wrench,
  Ruler,
  Factory,
  Trash2,
  ExternalLink,
} from 'lucide-react';

function getPRTotal(pr: any): number {
  if (pr?.totalEstimatedAmount && Number(pr.totalEstimatedAmount) > 0) {
    return Number(pr.totalEstimatedAmount);
  }
  if (pr?.lines && pr.lines.length > 0) {
    return pr.lines.reduce(
      (sum: number, l: any) => sum + (Number(l.quantity || 0) * Number(l.estimatedUnitPrice || 0)),
      0
    );
  }
  return Number(pr?.estimatedAmount || 0);
}

const DEFAULT_SPECIALTIES = [
  'Robinetterie Industrielle & Vannes HP',
  'Tuyauterie & Raccords Forgés ASTM',
  'Spools Inox 316L & CCPU 3.1',
  'Consommables de Soudage TIG/MIG',
  'Équipements HVAC & Centrales d\'eau glacée',
  'Instrumentation & Capteurs Pression',
  'Boulonnerie Grade B7/2H & Joints Spirométalliques',
];

export interface PRLineInput {
  id: string;
  mode: 'CATALOG' | 'CUSTOM';
  itemId: string;
  customName: string;
  customNuance: string;
  customIsoRef: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function ProcurementPage() {
  const { user, activeRole } = useAuth();
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'orders' | 'suppliers'>('requests');
  const [notification, setNotification] = useState<string | null>(null);

  // Search and filters
  const [searchPR, setSearchPR] = useState('');
  const [searchPO, setSearchPO] = useState('');
  const [searchSupp, setSearchSupp] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal création DA (Ultra-Détaillé, Multi-Articles & Orienté Chantiers)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [itemSelectionMode, setItemSelectionMode] = useState<'CATALOG' | 'CUSTOM'>('CATALOG');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customNuance, setCustomNuance] = useState('');
  const [customIsoRef, setCustomIsoRef] = useState('');
  const [requestQty, setRequestQty] = useState<number>(1);
  const [requestUnit, setRequestUnit] = useState<string>('UNITE');
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(0);
  const [procurementCategory, setProcurementCategory] = useState<string>('TUYAUTERIE');
  const [requestUrgency, setRequestUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [reqCertCcpu31, setReqCertCcpu31] = useState(false);
  const [reqCndReport, setReqCndReport] = useState(false);
  const [reqCoc, setReqCoc] = useState(false);
  const [reqAtexFds, setReqAtexFds] = useState(false);
  const [requestJustification, setRequestJustification] = useState('');
  const [prVatRate, setPrVatRate] = useState<number>(19); // Régime Fiscal DZ (19%, 9%, 0%)

  // Lignes multi-produits de la Demande d'Achat
  const [prLines, setPrLines] = useState<PRLineInput[]>([
    {
      id: '1',
      mode: 'CUSTOM',
      itemId: '',
      customName: '',
      customNuance: '',
      customIsoRef: '',
      quantity: 1,
      unit: 'UNITE',
      unitPrice: 0,
    },
  ]);

  const addPRLine = () => {
    const defaultItem = items[0];
    setPrLines(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        mode: defaultItem ? 'CATALOG' : 'CUSTOM',
        itemId: defaultItem ? defaultItem.id : '',
        customName: 'Bride Collerette WNRF DN100 PN40 Inox 316L',
        customNuance: 'ASTM A182 F316L',
        customIsoRef: '',
        quantity: 1,
        unit: defaultItem?.unit || 'UNITE',
        unitPrice: Number(defaultItem?.unitCost || 15000),
      },
    ]);
  };

  const removePRLine = (id: string) => {
    if (prLines.length <= 1) return;
    setPrLines(prev => prev.filter(l => l.id !== id));
  };

  const updatePRLine = (id: string, updates: Partial<PRLineInput>) => {
    setPrLines(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        const updated = { ...l, ...updates };
        if (updates.itemId && updates.itemId !== l.itemId) {
          const itm = (Array.isArray(items) ? items : []).find(i => i.id === updates.itemId);
          if (itm) {
            updated.unit = itm.unit || updated.unit;
            updated.unitPrice = Number(itm.unitCost || 0);
          }
        }
        return updated;
      })
    );
  };

  const applyJustificationPreset = (text: string, urgency: 'NORMAL' | 'HIGH' | 'CRITICAL') => {
    setRequestJustification(text);
    setRequestUrgency(urgency);
  };

  // Modal Modification / Édition DA
  const [showEditPrModal, setShowEditPrModal] = useState(false);
  const [editQty, setEditQty] = useState<number>(50);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(18500);
  const [editUrgency, setEditUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [editJustification, setEditJustification] = useState('');

  // Modal création Fournisseur Homologué (Exactement comme demandé par l'utilisateur)
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierTaxId, setNewSupplierTaxId] = useState('');
  const [newSupplierRC, setNewSupplierRC] = useState('');
  const [newSupplierBankRIB, setNewSupplierBankRIB] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierSpecialties, setNewSupplierSpecialties] = useState('');
  const [selectedSpecialtyTags, setSelectedSpecialtyTags] = useState<string[]>([]);

  // Modal Ajout Variante / Offre Fournisseur
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [quoteSupplierId, setQuoteSupplierId] = useState('');
  const [quoteUnitPrice, setQuoteUnitPrice] = useState<number>(18500);
  const [quoteLeadDays, setQuoteLeadDays] = useState<number>(7);
  const [quoteAvailability, setQuoteAvailability] = useState('IMMEDIATE');
  const [quoteWarrantyMonths, setQuoteWarrantyMonths] = useState<number>(12);
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('Virement bancaire 30j fin de mois');
  const [quoteNotes, setQuoteNotes] = useState('Offre conforme aux spécifications CND, certificats matière CCPU 3.1 fournis.');
  const [quoteIsRecommended, setQuoteIsRecommended] = useState(true);

  // Modal Impression Officielle Bon de Commande (BC)
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<any | null>(null);

  // Arbitrage DG & Refus / Réexamen
  const [decisionNotes, setDecisionNotes] = useState('Offre conforme techniquement, fournisseur qualifié A, délai compatible avec le planning chantier.');
  const [rejectReason, setRejectReason] = useState('Prix unitaire supérieur au budget alloué. Négocier une remise complémentaire.');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReexamineModal, setShowReexamineModal] = useState(false);
  const [reexamineNotes, setReexamineNotes] = useState('Demande de renégociation des conditions tarifaires et de proposition d\'une variante matière ou délai court.');

  // Modification Devis / Variante
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [editQuoteAmountHT, setEditQuoteAmountHT] = useState('');
  const [editQuoteLeadTime, setEditQuoteLeadTime] = useState('');
  const [editQuotePayment, setEditQuotePayment] = useState('');
  const [editQuoteNotes, setEditQuoteNotes] = useState('');

  // Confirmation Bon de Commande
  const [showConfirmPoModal, setShowConfirmPoModal] = useState(false);
  const [confirmingPo, setConfirmingPo] = useState<any>(null);
  const [supplierAckRef, setSupplierAckRef] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prs, pos, prjs, itms, supps] = await Promise.all([
        api.get<any[]>('/procurement/purchase-requests'),
        api.get<any[]>('/procurement/purchase-orders'),
        api.get<any[]>('/projects'),
        api.get<any[]>('/inventory/items'),
        api.get<any[]>('/procurement/suppliers'),
      ]);

      const safePrs = Array.isArray(prs) ? prs : [];
      const safePos = Array.isArray(pos) ? pos : [];
      const safePrjs = Array.isArray(prjs) ? prjs : [];
      const safeItms = Array.isArray(itms) ? itms : [];
      const safeSupps = Array.isArray(supps) ? supps : [];

      setPurchaseRequests(safePrs);
      setPurchaseOrders(safePos);
      setProjects(safePrjs);
      setItems(safeItms);
      setSuppliers(safeSupps);

      if (safePrjs.length > 0 && !selectedProjectId) setSelectedProjectId(safePrjs[0].id);
      if (safeItms.length > 0 && !selectedItemId) setSelectedItemId(safeItms[0].id);
      if (supps.length > 0 && !quoteSupplierId) setQuoteSupplierId(supps[0].id);

      if (itms.length > 0) {
        setPrLines(prev => prev.map((line, idx) => {
          if (line.mode === 'CATALOG' && !line.itemId) {
            const itm = itms[idx % itms.length] || itms[0];
            return {
              ...line,
              itemId: itm.id,
              unit: itm.unit || line.unit,
              unitPrice: Number(itm.unitCost || line.unitPrice),
            };
          }
          return line;
        }));
      }

      if (prs.length > 0) {
        const prToSelect = selectedPR ? (Array.isArray(prs) ? prs : []).find(p => p.id === selectedPR.id) || prs[0] : prs[0];
        const fullPR = await api.get<any>(`/procurement/purchase-requests/${prToSelect.id}`);
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
  }, [activeRole]);

  const handleSelectPR = async (prId: string) => {
    try {
      const fullPR = await api.get<any>(`/procurement/purchase-requests/${prId}`);
      setSelectedPR(Array.isArray(fullPR) ? fullPR[0] : fullPR);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calculs dynamiques pour le modal Création DA
  const chosenProject = (Array.isArray(projects) ? projects : []).find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);
  const chosenItem = (Array.isArray(items) ? items : []).find(i => i.id === selectedItemId) || (items.length > 0 ? items[0] : null);
  const effectiveUnitPrice = itemSelectionMode === 'CUSTOM' ? Number(customUnitPrice || 0) : Number(chosenItem?.unitCost || 18500);
  const totalLineHT = requestQty * effectiveUnitPrice;
  const tvaAmount = Math.round(totalLineHT * 0.19); // TVA Algérie 19%
  const totalLineTTC = totalLineHT + tvaAmount;

  // Calculs multi-produits en temps réel pour la DA
  const totalPRLinesHT = prLines.reduce((acc, l) => acc + (Number(l.quantity || 0) * Number(l.unitPrice || 0)), 0);
  const totalPRTva = Math.round(totalPRLinesHT * (prVatRate / 100));
  const totalPRLinesTTC = totalPRLinesHT + totalPRTva;

  // Contexte financier et consommation budgétaire du projet sélectionné
  const projectBudget = Number(chosenProject?.budgetAmount || chosenProject?.contractAmount || 120000000);
  const projectCommitted = Number(chosenProject?.committedCost || chosenProject?.actualCost || 34500000);
  const projectRemaining = Math.max(0, projectBudget - projectCommitted);
  const budgetImpactPercent = projectBudget > 0 ? ((totalPRLinesHT / projectBudget) * 100).toFixed(1) : '0';

  // Calculs dynamiques pour le modal Édition DA
  const editLineHT = editQty * editUnitPrice;
  const editTva = Math.round(editLineHT * 0.19);
  const editTTC = editLineHT + editTva;

  // Calculs dynamiques pour le modal Ajout Variante
  const quoteLineCount = selectedPR?.lines?.[0]?.quantity ? Number(selectedPR.lines[0].quantity) : 1;
  const quoteTotalHT = quoteUnitPrice * quoteLineCount;
  const quoteTva = Math.round(quoteTotalHT * 0.19);
  const quoteTotalTTC = quoteTotalHT + quoteTva;

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projId = selectedProjectId || (projects[0]?.id ?? '');
      if (!projId) {
        alert('Veuillez sélectionner un chantier / projet.');
        return;
      }

      if (prLines.length === 0) {
        alert('Veuillez ajouter au moins un produit ou article à la Demande d\'Achat.');
        return;
      }

      const qualitySpecs = [
        reqCertCcpu31 ? 'CCPU 3.1 EN 10204' : null,
        reqCndReport ? 'Rapport CND' : null,
        reqCoc ? 'Certificat Fabricant (CoC)' : null,
        reqAtexFds ? 'Norme ATEX / FDS' : null,
      ].filter(Boolean).join(', ');

      const created = await api.post<any>('/procurement/purchase-requests', {
        projectId: projId,
        urgencyLevel: requestUrgency,
        justification: requestJustification,
        desiredDate: new Date(desiredDeliveryDate).toISOString(),
        vatRate: Number(prVatRate),
        totalHT: totalPRLinesHT,
        amountHT: totalPRLinesHT,
        amountTVA: totalPRTva,
        amountTTC: totalPRLinesTTC,
        lines: (Array.isArray(prLines) ? prLines : []).map((line, idx) => {
          const itemDesc = line.mode === 'CUSTOM'
            ? `${line.customName || `Article sur-mesure #${idx + 1}`} [Matière: ${line.customNuance || 'Standard'}] [ISO: ${line.customIsoRef || 'N/A'}]`
            : ((Array.isArray(items) ? items : []).find(i => i.id === line.itemId)?.name || `Composant industriel #${idx + 1}`);

          const fullTechnicalSpecs = `Pôle: ${procurementCategory} | Lieu: ${deliveryLocation}${qualitySpecs ? ` | Qualité: ${qualitySpecs}` : ''}${line.customIsoRef ? ` | Repère ISO: ${line.customIsoRef}` : ''}`;

          const resolvedItemId = line.mode === 'CATALOG' && line.itemId
            ? line.itemId
            : (items[0]?.id || undefined);

          return {
            itemId: resolvedItemId,
            description: itemDesc,
            quantity: Number(line.quantity),
            unit: line.unit || 'UNITE',
            technicalSpecs: fullTechnicalSpecs,
            estimatedUnitPrice: Number(line.unitPrice),
            unitPrice: Number(line.unitPrice),
          };
        }),
      });

      setShowCreateModal(false);
      await loadData();
      await handleSelectPR(created.id);
      setNotification(`Demande d'Achat ${created.reference} (${prLines.length} article(s)) soumise avec succès au circuit QCD pour ${chosenProject?.code || 'le chantier'} (Total HT: ${formatCurrencyDA(totalPRLinesHT, false)} + TVA ${prVatRate}%) !`);
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'enregistrement de la Demande d'Achat");
    }
  };

  const handleOpenEditPR = () => {
    if (!selectedPR) return;
    const l = selectedPR.lines?.[0];
    setEditQty(Number(l?.quantity || 1));
    setEditUnitPrice(Number(l?.estimatedUnitPrice || 18500));
    setEditUrgency(selectedPR.urgencyLevel || 'HIGH');
    setEditJustification(selectedPR.justification || '');
    setShowEditPrModal(true);
  };

  const handleSaveEditPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR) return;
    try {
      const l = selectedPR.lines?.[0];
      await api.patch(`/procurement/purchase-requests/${selectedPR.id}`, {
        urgencyLevel: editUrgency,
        justification: editJustification,
        lines: [
          {
            itemId: l?.itemId || l?.item?.id,
            description: l?.description || 'Article industriel',
            quantity: Number(editQty),
            unit: l?.unit || 'UNITE',
            estimatedUnitPrice: Number(editUnitPrice),
          },
        ],
      });

      setShowEditPrModal(false);
      await loadData();
      await handleSelectPR(selectedPR.id);
      setNotification(`DA ${selectedPR.reference} mise à jour avec succès (Nouveau total: ${formatCurrencyDA(editLineHT, false)} HT) !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur mise à jour DA');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fullTaxId = `NIF: ${newSupplierTaxId} | RC: ${newSupplierRC} | RIB: ${newSupplierBankRIB}`;
      const fullSpecs = selectedSpecialtyTags.length > 0
        ? selectedSpecialtyTags.join(', ') + (newSupplierSpecialties ? `, ${newSupplierSpecialties}` : '')
        : newSupplierSpecialties;

      const created = await api.post<any>('/procurement/suppliers', {
        name: newSupplierName,
        contactName: newSupplierContact,
        email: newSupplierEmail,
        phone: newSupplierPhone,
        address: newSupplierAddress,
        specialties: fullSpecs,
        taxId: fullTaxId,
      });

      setShowCreateSupplierModal(false);
      await loadData();
      setActiveTab('suppliers');
      setNotification(`Fournisseur "${created.name}" (${created.code}) homologué avec succès dans PostgreSQL !`);
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSpecialty = (spec: string) => {
    if (selectedSpecialtyTags.includes(spec)) {
      setSelectedSpecialtyTags(selectedSpecialtyTags.filter(s => s !== spec));
    } else {
      setSelectedSpecialtyTags([...selectedSpecialtyTags, spec]);
    }
  };

  // Consultation Multicritère Rapide
  const handleAddQuotesAndSubmitToDG = async () => {
    if (!selectedPR) return;
    try {
      const suppList = suppliers.length > 0 ? suppliers : await api.get<any[]>('/procurement/suppliers');
      const s1 = suppList[0];
      const s2 = suppList[1] || suppList[0];

      if (!s1) {
        alert('Aucun fournisseur agréé enregistré. Veuillez d’abord en créer un.');
        return;
      }

      const prLinesList = selectedPR.lines && selectedPR.lines.length > 0 ? selectedPR.lines : [];
      const prTotalEstimated = prLinesList.length > 0
        ? prLinesList.reduce((sum: number, l: any) => sum + (Number(l.quantity || 1) * Number(l.estimatedUnitPrice || 0)), 0)
        : 18500;

      // 1. Offre recommandée A
      const quoteA = await api.post<any>('/procurement/quotes', {
        purchaseRequestId: selectedPR.id,
        supplierId: s1.id,
        totalAmountHT: prTotalEstimated,
        deliveryLeadTimeDays: 7,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: 'Virement bancaire 30j fin de mois',
        notes: `Offre ${s1.name} recommandée : conforme normes ASME/API, certificats 3.1 fournis.`,
        lines: (Array.isArray(prLinesList) ? prLinesList : []).map((l: any) => ({
          purchaseRequestLineId: l.id,
          unitPrice: Number(l.estimatedUnitPrice || 0),
        })),
      });

      // 2. Offre concurrente B
      if (s2 && s2.id !== s1.id) {
        const totalB = Math.round(prTotalEstimated * 1.08);
        await api.post<any>('/procurement/quotes', {
          purchaseRequestId: selectedPR.id,
          supplierId: s2.id,
          totalAmountHT: totalB,
          deliveryLeadTimeDays: 14,
          stockAvailability: 'ON_ORDER',
          technicalCompliance: true,
          warrantyMonths: 6,
          paymentTerms: '50% acompte, solde à réception',
          notes: `Offre concurrente ${s2.name} : sous réserve d'approvisionnement matière.`,
          lines: (Array.isArray(prLinesList) ? prLinesList : []).map((l: any) => ({
            purchaseRequestLineId: l.id,
            unitPrice: Math.round(Number(l.estimatedUnitPrice || 0) * 1.08),
          })),
        });
      }

      // 3. Transmettre à la Direction Générale
      await api.post(`/procurement/purchase-requests/${selectedPR.id}/submit-approval`, {
        recommendedQuoteId: quoteA.id,
      });

      // Mise à jour visuelle immédiate du statut
      setSelectedPR((prev: any) => (prev ? { ...prev, status: 'PENDING_APPROVAL' } : prev));
      setPurchaseRequests(prev => prev.map(p => (p.id === selectedPR.id ? { ...p, status: 'PENDING_APPROVAL' } : p)));

      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification('Offres comparatives enregistrées et transmises avec succès à la Direction Générale pour arbitrage !');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Ajout Manuel d'une Variante / Devis Fournisseur
  const handleAddManualQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR) return;
    try {
      const line = selectedPR.lines?.[0];
      const qty = Number(line?.quantity || 1);
      const totalHT = quoteUnitPrice * qty;

      const createdQuote = await api.post<any>('/procurement/quotes', {
        purchaseRequestId: selectedPR.id,
        supplierId: quoteSupplierId,
        totalAmountHT: totalHT,
        deliveryLeadTimeDays: Number(quoteLeadDays),
        stockAvailability: quoteAvailability,
        technicalCompliance: true,
        warrantyMonths: Number(quoteWarrantyMonths),
        paymentTerms: quotePaymentTerms,
        notes: quoteNotes,
        lines: line ? [{ purchaseRequestLineId: line.id, unitPrice: quoteUnitPrice }] : [],
      });

      if (quoteIsRecommended) {
        await api.post(`/procurement/purchase-requests/${selectedPR.id}/submit-approval`, {
          recommendedQuoteId: createdQuote.id,
        });
        setSelectedPR((prev: any) => (prev ? { ...prev, status: 'PENDING_APPROVAL' } : prev));
        setPurchaseRequests(prev => prev.map(p => (p.id === selectedPR.id ? { ...p, status: 'PENDING_APPROVAL' } : p)));
      }

      setShowAddQuoteModal(false);
      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification(`Variante fournisseur enregistrée (${formatCurrencyDA(totalHT, false)} HT + TVA 19%) !`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Validation DG
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

      // Mise à jour visuelle instantanée du statut et de l'intégration du Bon de Commande
      setSelectedPR((prev: any) => (prev ? {
        ...prev,
        status: 'APPROVED',
        purchaseOrders: res?.purchaseOrder ? [res.purchaseOrder, ...(prev.purchaseOrders || [])] : (prev.purchaseOrders || []),
      } : prev));
      setPurchaseRequests(prev => prev.map(p => (p.id === selectedPR.id ? { ...p, status: 'APPROVED' } : p)));

      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification(`Demande validée par la DG ! Bon de Commande ${res.purchaseOrder.orderNumber} émis avec TVA 19%.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Rejet DG
  const handleRejectByDG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR) return;
    try {
      // Mise à jour visuelle immédiate
      setSelectedPR((prev: any) => (prev ? { ...prev, status: 'REJECTED' } : prev));
      setPurchaseRequests(prev => prev.map(p => (p.id === selectedPR.id ? { ...p, status: 'REJECTED' } : p)));

      await api.post(`/procurement/purchase-requests/${selectedPR.id}/reject`, {
        reason: rejectReason,
      });
      setShowRejectModal(false);
      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification(`Demande d'Achat ${selectedPR.reference} rejetée par la DG et classée.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Réexamen DG (Renégociation / Variante)
  const handleReexamineByDG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR) return;
    try {
      setSelectedPR((prev: any) => (prev ? { ...prev, status: 'QUOTATION_IN_PROGRESS' } : prev));
      setPurchaseRequests(prev => prev.map(p => (p.id === selectedPR.id ? { ...p, status: 'QUOTATION_IN_PROGRESS' } : p)));

      await api.post(`/procurement/purchase-requests/${selectedPR.id}/reexamine`, {
        notes: reexamineNotes,
      });
      setShowReexamineModal(false);
      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification(`Demande d'Achat ${selectedPR.reference} renvoyée aux Achats pour réexamen et renégociation.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Enregistrer modification devis / variante
  const handleSaveQuoteVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR || !editingQuote) return;
    try {
      await api.patch(`/procurement/purchase-requests/${selectedPR.id}/quotes/${editingQuote.id}`, {
        totalAmountHT: Number(editQuoteAmountHT) || Number(editingQuote.totalAmountHT),
        deliveryLeadTimeDays: Number(editQuoteLeadTime) || Number(editingQuote.deliveryLeadTimeDays),
        paymentTerms: editQuotePayment || editingQuote.paymentTerms,
        notes: editQuoteNotes || editingQuote.notes,
      });
      setShowEditQuoteModal(false);
      setEditingQuote(null);
      await handleSelectPR(selectedPR.id);
      await loadData();
      setNotification(`Offre / variante fournisseur mise à jour avec succès.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Confirmation Bon de Commande
  const handleConfirmPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingPo) return;
    try {
      await api.post(`/procurement/purchase-orders/${confirmingPo.id}/confirm`, {
        supplierAcknowledgmentRef: supplierAckRef || undefined,
      });
      setShowConfirmPoModal(false);
      setConfirmingPo(null);
      setSupplierAckRef('');
      await loadData();
      setNotification(`Bon de Commande ${confirmingPo.orderNumber} confirmé avec succès.`);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isDG = activeRole === SystemRole.DIRECTEUR_GENERAL || activeRole === SystemRole.ADMINISTRATEUR;

  const filteredPRs = purchaseRequests.filter(pr => {
    const matchesSearch =
      pr.reference?.toLowerCase().includes(searchPR.toLowerCase()) ||
      pr.project?.code?.toLowerCase().includes(searchPR.toLowerCase()) ||
      pr.project?.name?.toLowerCase().includes(searchPR.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PURCHASE_ORDER') return pr.status === 'PURCHASE_ORDER' || pr.status === 'APPROVED';
    return pr.status === statusFilter;
  });

  const filteredPOs = purchaseOrders.filter(po =>
    po.orderNumber?.toLowerCase().includes(searchPO.toLowerCase()) ||
    po.supplier?.name?.toLowerCase().includes(searchPO.toLowerCase()) ||
    po.project?.code?.toLowerCase().includes(searchPO.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchSupp.toLowerCase()) ||
    s.specialties?.toLowerCase().includes(searchSupp.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(searchSupp.toLowerCase())
  );

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

      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#07164D] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#0B207D]" />
            Achats & Approvisionnements Chantiers SILEX SERVICES
          </h1>
          <p className="text-xs text-[#697789] mt-0.5">
            Cycle complet QCD : Demandes d’achat (DA) → Consultation multicritère → Validation DG (SoD) → Bons de commande (BC) avec TVA 19%.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateSupplierModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#0B207D] text-[#0B207D] rounded-lg hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-[#0B207D]" />
            Homologuer Nouveau Fournisseur
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B207D] text-white rounded-lg hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvelle Demande d&apos;Achat (DA)
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#E1E6ED] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-[#0B207D] text-[#0B207D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Demandes d&apos;Achat ({purchaseRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#0B207D] text-[#0B207D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Bons de Commande Engagés ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-[#0B207D] text-[#0B207D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Fournisseurs Homologués ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: DEMANDES D'ACHAT (WORKFLOW COMPLET QCD & MODIFICATIONS) */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Liste des DA */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-lg border border-[#E1E6ED] p-3 shadow-2xs space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par référence DA, code projet..."
                  value={searchPR}
                  onChange={e => setSearchPR(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              {/* Filtres d'état rapides */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === 'ALL'
                      ? 'bg-[#0B207D] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Toutes ({purchaseRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PURCHASE_ORDER')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === 'PURCHASE_ORDER'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  BC Émis ({purchaseRequests.filter(p => p.status === 'PURCHASE_ORDER' || p.status === 'APPROVED').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PENDING_APPROVAL')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === 'PENDING_APPROVAL'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Arbitrage DG ({purchaseRequests.filter(p => p.status === 'PENDING_APPROVAL').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('QUOTATION_IN_PROGRESS')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === 'QUOTATION_IN_PROGRESS'
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  Consultation ({purchaseRequests.filter(p => p.status === 'QUOTATION_IN_PROGRESS').length})
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {(Array.isArray(filteredPRs) ? filteredPRs : []).map(pr => {
                const isSelected = selectedPR?.id === pr.id;
                const total = getPRTotal(pr);

                return (
                  <div
                    key={pr.id}
                    onClick={() => handleSelectPR(pr.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B207D] bg-blue-50/40 shadow-xs'
                        : 'border-[#E1E6ED] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#0B207D]">{pr.reference}</span>
                      <StatusBadge status={pr.status} type="procurement" />
                    </div>

                    <div className="text-xs font-bold text-slate-800 mt-1 truncate flex items-center gap-1.5">
                      {pr.project?.code ? (
                        <Link
                          href={`/projects/${pr.project.code}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#0B207D] hover:underline font-mono inline-flex items-center gap-0.5"
                          title={`Ouvrir la fiche du chantier ${pr.project.code}`}
                        >
                          {pr.project.code}
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </Link>
                      ) : null}
                      <span>— {pr.project?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 text-slate-500">
                      <span>Émis le {formatDateDZ(pr.createdAt)}</span>
                      <span className="font-bold text-slate-900">{formatCurrencyDA(total, false)} HT</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Urgence : <strong className="text-slate-700">{pr.urgencyLevel}</strong></span>
                      <span className="text-slate-500">{pr.lines?.length || 1} ligne(s) d'articles</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détails de la DA sélectionnée */}
          <div className="lg:col-span-7">
            {selectedPR ? (
              <div className="bg-white rounded-lg border border-[#E1E6ED] p-5 shadow-2xs space-y-5">
                {/* En-tête de la DA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-[#0B207D]">
                        {selectedPR.reference}
                      </span>
                      <StatusBadge status={selectedPR.status} type="procurement" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedPR.urgencyLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        selectedPR.urgencyLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Urgence : {selectedPR.urgencyLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>Projet rattaché :</span>
                      {selectedPR.project?.code ? (
                        <Link
                          href={`/projects/${selectedPR.project.code}`}
                          className="font-bold text-[#0B207D] hover:underline inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                          title={`Accéder à la fiche du projet ${selectedPR.project.code}`}
                        >
                          {selectedPR.project.code} — {selectedPR.project.name}
                          <ExternalLink className="w-3 h-3 text-[#0B207D]" />
                        </Link>
                      ) : (
                        <span>Non rattaché</span>
                      )}
                    </div>
                  </div>

                  {/* Bouton Modification DA si non verrouillée */}
                  {selectedPR.status !== 'APPROVED' && selectedPR.status !== 'PURCHASE_ORDER' && (
                    <button
                      onClick={handleOpenEditPR}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-[#0B207D] hover:border-[#0B207D] rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Modifier Prix / Quantités
                    </button>
                  )}
                </div>

                {/* BANDEAU BON DE COMMANDE ÉMIS & EXAMEN DIRECT */}
                {selectedPR.purchaseOrders && selectedPR.purchaseOrders.length > 0 && (() => {
                  const po = selectedPR.purchaseOrders[0];
                  const poHT = Number(po.totalAmountHT);
                  const poTTC = Number(po.totalAmountTTC);
                  return (
                    <div className="p-4 bg-emerald-50/90 border-2 border-emerald-400 rounded-xl space-y-3 shadow-xs animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2 flex-wrap">
                              <span>Bon de Commande Ferme Émis</span>
                              <span className="font-mono text-xs bg-emerald-800 text-white px-2 py-0.5 rounded font-bold shadow-2xs">
                                {po.orderNumber}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold border border-emerald-300">
                                Statut : {po.status}
                              </span>
                            </div>
                            <div className="text-xs text-emerald-900 mt-1">
                              Fournisseur Contractuel Retenu : <strong>{po.supplier?.name}</strong> • Validé par la Direction Générale
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPoForPrint({ ...po, project: selectedPR.project })}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B207D] text-white text-xs font-bold rounded-lg hover:bg-[#07164D] shadow-xs cursor-pointer transition-colors shrink-0"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Examiner & Imprimer le Bon de Commande (A4)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2.5 border-t border-emerald-200 text-xs">
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold uppercase">Montant Contractuel HT</span>
                          <div className="font-extrabold text-emerald-950 text-sm">{formatCurrencyDA(poHT, false)}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold uppercase">TVA Légale (19.00%)</span>
                          <div className="font-bold text-emerald-800 text-sm">+{formatCurrencyDA(Math.round(poHT * 0.19), false)}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-800 font-semibold uppercase">Total Net à Payer TTC</span>
                          <div className="font-black text-[#0B207D] text-sm">{formatCurrencyDA(poTTC, false)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* STEPPER DE TRAÇABILITÉ DU CYCLE D'ACHAT QCD */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#0B207D]" />
                      Traçabilité du Cycle d'Achat QCD ({selectedPR.reference})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Processus Qualité & SoD</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <div className="font-bold text-slate-900">1. Émission DA</div>
                      <div className="text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        Enregistrée
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5 truncate">{selectedPR.requester?.name || 'Chef de Projet'}</div>
                    </div>
                    <div className={`p-2 rounded border ${
                      selectedPR.quotes && selectedPR.quotes.length > 0 ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}>
                      <div className="font-bold text-slate-900">2. Consultation</div>
                      <div className="text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        {selectedPR.quotes?.length ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {selectedPR.quotes.length} Devis Reçu(s)
                          </>
                        ) : 'En cours'}
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Achats & Appro</div>
                    </div>
                    <div className={`p-2 rounded border ${
                      selectedPR.status === 'APPROVED' || selectedPR.status === 'PURCHASE_ORDER'
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : selectedPR.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-100 opacity-60'
                    }`}>
                      <div className="font-bold text-slate-900">3. Arbitrage DG</div>
                      <div className="font-semibold mt-0.5 flex items-center gap-1">
                        {selectedPR.status === 'APPROVED' || selectedPR.status === 'PURCHASE_ORDER' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="text-emerald-700">Visa Accordé</span>
                          </>
                        ) : selectedPR.status === 'PENDING_APPROVAL' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="text-amber-700">En cours de visa</span>
                          </>
                        ) : 'À venir'}
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Séparation SoD</div>
                    </div>
                    <div className={`p-2 rounded border ${
                      selectedPR.purchaseOrders?.length
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-100 opacity-60'
                    }`}>
                      <div className="font-bold text-slate-900">4. Bon de Commande</div>
                      <div className="text-emerald-800 font-black mt-0.5 flex items-center gap-1">
                        {selectedPR.purchaseOrders?.length ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {selectedPR.purchaseOrders[0].orderNumber}
                          </>
                        ) : 'En attente'}
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">TVA 19% fermée</div>
                    </div>
                  </div>
                </div>

                {/* Synthèse financière avec TVA dynamique */}
                {(() => {
                  const ht = getPRTotal(selectedPR);
                  const vr = Number(selectedPR.vatRate !== undefined ? selectedPR.vatRate : 19);
                  const tva = Math.round(ht * (vr / 100));
                  const ttc = ht + tva;
                  return (
                    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Montant Total HT</div>
                        <div className="text-sm font-extrabold text-slate-900 mt-0.5">{formatCurrencyDA(ht, false)}</div>
                        <div className="text-[10px] text-slate-400">Dépense estimée</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">TVA Légale ({Number(selectedPR.vatRate !== undefined ? selectedPR.vatRate : 19)}%)</div>
                        <div className="text-sm font-extrabold text-slate-700 mt-0.5">+{formatCurrencyDA(tva, false)}</div>
                        <div className="text-[10px] text-slate-400">Régime fiscal DZ</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Total TTC Prévisionnel</div>
                        <div className="text-sm font-black text-[#0B207D] mt-0.5">{formatCurrencyDA(ttc, false)}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">TTC chiffré</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Justification & Demandeur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Justification de la demande</span>
                    <p className="font-medium text-slate-800 mt-0.5">{selectedPR.justification}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Demandeur Opérationnel</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {selectedPR.requester?.name || 'Sofiane Belkacem (Chef de Projet)'} • {selectedPR.department || 'Direction Projets Chantiers'}
                    </p>
                  </div>
                </div>

                {/* Lignes de commande */}
                <div>
                  <h3 className="text-xs font-bold text-[#07164D] uppercase tracking-wider mb-2">
                    Lignes d'Articles Demandées ({selectedPR.lines?.length || 0})
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Article / Spécification</th>
                          <th className="py-2 px-3 text-right">Quantité</th>
                          <th className="py-2 px-3 text-right">Prix Unitaire Estimé</th>
                          <th className="py-2 px-3 text-right">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPR.lines?.map((line: any) => (
                          <tr key={line.id}>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              <div>{line.description}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{line.item?.code}</div>
                            </td>
                            <td className="py-2 px-3 text-right font-bold">
                              {line.quantity} {line.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600">
                              {formatCurrencyDA(line.estimatedUnitPrice, false)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {formatCurrencyDA(Number(line.quantity) * Number(line.estimatedUnitPrice), false)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COMPARATEUR D'OFFRES FOURNISSEURS / VARIANTES */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#07164D] uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-[#0B207D]" />
                      Matrice Comparative des Variantes & Offres Fournisseurs ({selectedPR.quotes?.length || 0})
                    </h3>
                    {selectedPR.status !== 'APPROVED' && selectedPR.status !== 'PURCHASE_ORDER' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAddQuoteModal(true)}
                          className="text-xs px-2.5 py-1 bg-white border border-[#0B207D] text-[#0B207D] font-semibold rounded hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Ajouter Variante / Devis
                        </button>
                        {(!selectedPR.quotes || selectedPR.quotes.length === 0) && (
                          <button
                            onClick={handleAddQuotesAndSubmitToDG}
                            className="text-xs px-3 py-1 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                          >
                            Mise en concurrence auto
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedPR.quotes && selectedPR.quotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(Array.isArray(selectedPR?.quotes) ? selectedPR.quotes : []).map((quote: any, idx: number) => {
                        const isRec = quote.isRecommended || idx === 0;
                        const ht = Number(quote.totalAmountHT || 0);
                        const tva = Math.round(ht * 0.19);
                        const ttc = ht + tva;

                        return (
                          <div
                            key={quote.id}
                            className={`p-3.5 rounded-lg border text-xs space-y-2 relative transition-all ${
                              isRec
                                ? 'border-[#0B207D] bg-blue-50/40 shadow-xs ring-1 ring-[#0B207D]'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold">
                                  {quote.quoteReference || `OFFRE-${quote.supplier?.code || 'FRN'}`}
                                </span>
                                <div className="font-bold text-slate-900 text-sm mt-0.5">
                                  {quote.supplier?.name || `Fournisseur Homologué ${idx + 1}`}
                                </div>
                              </div>
                              {isRec ? (
                                <span className="text-[10px] bg-[#0B207D] text-white px-2 py-0.5 rounded font-bold uppercase shadow-2xs">
                                  Variante Recommandée
                                </span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    await api.post(`/procurement/purchase-requests/${selectedPR.id}/submit-approval`, {
                                      recommendedQuoteId: quote.id,
                                    });
                                    await handleSelectPR(selectedPR.id);
                                    await loadData();
                                  }}
                                  className="text-[10px] text-[#0B207D] hover:underline font-semibold cursor-pointer"
                                >
                                  Retenir cette variante
                                </button>
                              )}
                            </div>

                            <div className="flex items-baseline gap-2">
                              <div className="text-base font-black text-[#07164D]">
                                {formatCurrencyDA(ht, false)}
                                <span className="text-[10px] font-normal text-slate-500 ml-1">HT</span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                (TTC : <strong>{formatCurrencyDA(ttc, false)}</strong>)
                              </div>
                            </div>

                            {/* Économie négociée par rapport à l'estimation */}
                            {(() => {
                              const est = Number(selectedPR.totalEstimatedAmount || 0);
                              const diff = est - ht;
                              if (diff > 0 && est > 0) {
                                const pct = ((diff / est) * 100).toFixed(1);
                                return (
                                  <div className="flex items-center gap-1 text-[10.5px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <Percent className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Gain négocié : -{formatCurrencyDA(diff, false)} ({pct}% sous l'estimation initiale)</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                              <div>Délai : <strong>{quote.deliveryLeadTimeDays} jours</strong></div>
                              <div>Disponibilité : <strong>{quote.stockAvailability}</strong></div>
                              <div>Garantie : <strong>{quote.warrantyMonths || 12} mois</strong></div>
                              <div>Paiement : <strong>{quote.paymentTerms}</strong></div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                              <p className="text-[10px] text-slate-500 italic truncate max-w-[200px]" title={quote.notes}>
                                {quote.notes || 'Devis standard conforme'}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuote(quote);
                                  setEditQuoteAmountHT(String(quote.totalAmountHT || ''));
                                  setEditQuoteLeadTime(String(quote.deliveryLeadTimeDays || ''));
                                  setEditQuotePayment(quote.paymentTerms || '');
                                  setEditQuoteNotes(quote.notes || '');
                                  setShowEditQuoteModal(true);
                                }}
                                className="text-[10.5px] font-semibold text-[#0B207D] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Edit className="w-3 h-3 text-[#0B207D]" />
                                <span>Modifier / Variante</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center space-y-2">
                      <p>Aucune offre fournisseur pour le moment.</p>
                      <button
                        onClick={handleAddQuotesAndSubmitToDG}
                        className="px-3 py-1.5 bg-[#0B207D] text-white font-semibold rounded text-xs hover:bg-[#07164D] cursor-pointer"
                      >
                        Consulter Fournisseurs & Transmettre à la DG
                      </button>
                    </div>
                  )}
                </div>

                {/* SECTION ARBITRAGE DIRECTION GÉNÉRALE (Four-Eyes Principle / SoD) */}
                {selectedPR.status === 'PENDING_APPROVAL' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Arbitrage & Décision Finale de la Direction Générale (SoD)
                    </div>

                    {!isDG ? (
                      <div className="text-amber-800 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Règle de séparation stricte des fonctions (SoD) : Seul le <strong>Directeur Général</strong> peut approuver cette demande d'achat. Utilisez le sélecteur de rôle en haut à droite pour basculer sur Directeur Général.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">
                            Motif d'approbation / Visa DG :
                          </label>
                          <input
                            type="text"
                            value={decisionNotes}
                            onChange={e => setDecisionNotes(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                          />
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                          <button
                            type="button"
                            onClick={() => setShowRejectModal(true)}
                            className="px-3 py-1.5 bg-white border border-red-300 text-red-700 font-bold rounded hover:bg-red-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5 text-red-600" />
                            <span>Rejeter Définitivement</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReexamineModal(true)}
                            className="px-3 py-1.5 bg-white border border-amber-400 text-amber-800 font-bold rounded hover:bg-amber-100/70 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>Demander Réexamen / Renégociation</span>
                          </button>
                          <button
                            onClick={handleApproveByDG}
                            className="px-4 py-2 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Valider la DA & Émettre le Bon de Commande (BC) avec TVA 19%</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#E1E6ED] p-12 text-center text-xs text-slate-400">
                Sélectionnez une demande d'achat à gauche pour consulter les offres et le workflow.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BONS DE COMMANDE ÉMIS (AVEC IMPRESSION A4 OFFICIELLE ET TVA 19%) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Bons de Commande Engagés ({filteredPOs.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Contrats d'achat fermes avec TVA 19%</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Rechercher par N° BC, fournisseur..."
                value={searchPO}
                onChange={e => setSearchPO(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#697789] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">N° Commande</th>
                  <th className="py-2.5 px-3">Fournisseur Retenu</th>
                  <th className="py-2.5 px-3">Projet Destinataire</th>
                  <th className="py-2.5 px-3">Date d'Émission</th>
                  <th className="py-2.5 px-3 text-right">Montant HT</th>
                  <th className="py-2.5 px-3 text-right">TVA (19%)</th>
                  <th className="py-2.5 px-3 text-right">Total TTC</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Array.isArray(filteredPOs) ? filteredPOs : []).map(po => {
                  const ht = Number(po.totalAmountHT || 0);
                  const tva = Math.round(ht * 0.19);
                  const ttc = ht + tva;

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                        {po.orderNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {po.supplier?.name || 'Fournisseur Agréé'}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {po.project?.code ? (
                          <Link
                            href={`/projects/${po.project.code}`}
                            className="hover:underline inline-flex items-center gap-1 group"
                            title={`Accéder à la fiche du projet ${po.project.code}`}
                          >
                            <span className="font-mono text-[11px] bg-blue-50 text-[#0B207D] font-bold px-1.5 py-0.5 rounded border border-blue-200 group-hover:bg-blue-100">
                              {po.project.code}
                            </span>
                            <span className="font-medium text-slate-800">{po.project.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">Non affecté</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDateDZ(po.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatCurrencyDA(ht, false)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                        {formatCurrencyDA(tva, false)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#0B207D] whitespace-nowrap">
                        {formatCurrencyDA(ttc, false)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={po.status || 'COMMANDE_VALIDEE'} type="po" />
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPoForPrint(po)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-semibold rounded hover:bg-slate-100 hover:text-[#0B207D] transition-colors shadow-2xs cursor-pointer text-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#0B207D]" />
                            <span>Aperçu BC</span>
                          </button>
                          {po.status === 'ISSUED' && (
                            <button
                              onClick={() => {
                                setConfirmingPo(po);
                                setSupplierAckRef(`AR-${po.supplier?.code || 'FRN'}-${new Date().getFullYear()}`);
                                setShowConfirmPoModal(true);
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold rounded hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer text-xs"
                              title="Enregistrer l'Accusé de Réception Fournisseur"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Confirmer AR</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANNUAIRE FOURNISSEURS HOMOLOGUÉS AVEC IDENTIFIANTS FISCAUX ALGÉRIENS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-lg border border-[#E1E6ED] shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#07164D] uppercase tracking-wider">
                Annuaire des Fournisseurs Homologués ({filteredSuppliers.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Agrément qualité, NIF, RC, RIB & Conformité CND
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Rechercher par raison sociale, spécialité..."
                value={searchSupp}
                onChange={e => setSearchSupp(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#0B207D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {(Array.isArray(filteredSuppliers) ? filteredSuppliers : []).map(s => (
              <div
                key={s.id}
                className="bg-slate-50/50 border border-slate-200 rounded-lg p-4 space-y-3 hover:border-[#0B207D] transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{s.code}</span>
                    <h3 className="text-xs font-bold text-[#07164D] mt-0.5">{s.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1 border border-emerald-200">
                    <Star className="w-3 h-3 fill-emerald-700" />
                    Agrément Qualité Validé
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Contact : <strong>{s.contactName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${s.phone}`} className="hover:text-[#0B207D]">{s.phone}</a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${s.email}`} className="truncate hover:text-[#0B207D]">{s.email}</a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>
                </div>

                {/* Identifiants Fiscaux Algériens */}
                {s.taxId && (
                  <div className="p-2 bg-white rounded border border-slate-200 text-[10.5px] font-mono text-slate-700 space-y-0.5">
                    <div className="font-bold text-[#0B207D] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Identifiants Fiscaux :
                    </div>
                    <div className="truncate text-slate-600">{s.taxId}</div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <span className="block font-semibold text-slate-700 mb-1">Spécialités industrielles agréées :</span>
                  <div className="flex flex-wrap gap-1">
                    {s.specialties?.split(',').map((spec: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                        {spec.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL HOMOLOGUER UN NOUVEAU FOURNISSEUR INDUSTRIEL (EXIGENCES UTILISATEUR) */}
      {showCreateSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0B207D]" />
                  Homologuer un Nouveau Fournisseur Industriel
                </h3>
                <p className="text-[11px] text-slate-500">
                  Agrément qualité et enregistrement des identifiants fiscaux algériens.
                </p>
              </div>
              <button
                onClick={() => setShowCreateSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Raison Sociale / Société <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={e => setNewSupplierName(e.target.value)}
                  placeholder="ex: Sarl Algérie Robinetterie Industrielle"
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Contact Commercial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierContact}
                    onChange={e => setNewSupplierContact(e.target.value)}
                    placeholder="ex: M. Sofiane Brahimi"
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplierPhone}
                    onChange={e => setNewSupplierPhone(e.target.value)}
                    placeholder="+213 29 73 00 00"
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email Commercial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newSupplierEmail}
                    onChange={e => setNewSupplierEmail(e.target.value)}
                    placeholder="contact@fournisseur-dz.com"
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    NIF (Numéro d'Identification Fiscale)
                  </label>
                  <input
                    type="text"
                    value={newSupplierTaxId}
                    onChange={e => setNewSupplierTaxId(e.target.value)}
                    placeholder="001931029485761"
                    className="w-full p-2 border border-slate-200 rounded font-mono focus:border-[#0B207D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    N° Registre de Commerce (RC)
                  </label>
                  <input
                    type="text"
                    value={newSupplierRC}
                    onChange={e => setNewSupplierRC(e.target.value)}
                    placeholder="16/00-0987654B20"
                    className="w-full p-2 border border-slate-200 rounded font-mono focus:border-[#0B207D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    RIB Bancaire
                  </label>
                  <input
                    type="text"
                    value={newSupplierBankRIB}
                    onChange={e => setNewSupplierBankRIB(e.target.value)}
                    placeholder="002 00055 0552200123 45 (BEA Arzew)"
                    className="w-full p-2 border border-slate-200 rounded font-mono text-[11px] focus:border-[#0B207D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Adresse Siège / Dépôt Principal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplierAddress}
                  onChange={e => setNewSupplierAddress(e.target.value)}
                  placeholder="Zone Industrielle Ouest, BP 120, Arzew"
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Spécialités Industrielles Agrées
                </label>
                {/* Badges de sélection rapide */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DEFAULT_SPECIALTIES.map((spec, i) => {
                    const isSelected = selectedSpecialtyTags.includes(spec);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleSpecialty(spec)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#0B207D] text-white border-[#0B207D]'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{spec}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newSupplierSpecialties}
                  onChange={e => setNewSupplierSpecialties(e.target.value)}
                  placeholder="Ajouter d'autres spécialités (séparées par virgules)..."
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSupplierModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Homologuer le Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION DEMANDE D'ACHAT — ULTRA-DÉTAILLÉE & ORIENTÉE CHANTIERS */}
      {showCreateModal && (() => {
        const activeProj = (Array.isArray(projects) ? projects : []).find(p => p.id === (selectedProjectId || projects[0]?.id)) || projects[0];
        const projBudget = Number(activeProj?.budgetAmount || activeProj?.contractAmount || 120000000);
        const projCommitted = Number(activeProj?.committedCost || activeProj?.actualCost || 34500000);
        const projRemaining = Math.max(0, projBudget - projCommitted);
        const budgetConsumedPct = projBudget > 0 ? Math.min(100, Math.round((projCommitted / projBudget) * 100)) : 28;
        const currentDaImpactPct = projBudget > 0 ? ((totalPRLinesHT / projBudget) * 100).toFixed(1) : '0';

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-xs">
            <div className="bg-white rounded-xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0B207D]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#07164D] flex items-center gap-2">
                      Nouvelle Demande d'Achat Chantier (DA)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Émission par le Responsable Projet et soumission au circuit QCD (Qualité, Coûts, Délais).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePR} className="space-y-4 text-xs">
                {/* 1. Sélection Chantier / Projet Concerne & Fiche d'Identité Dynamique */}
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold">
                      Chantier / Projet Concerne <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Affectation analytique obligatoire</span>
                  </div>
                  <select
                    value={selectedProjectId || (projects[0]?.id ?? '')}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    {(Array.isArray(projects) ? projects : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} ({p.clientName})
                      </option>
                    ))}
                  </select>

                  {/* Fiche d'identité synthétique du Chantier sélectionné */}
                  {activeProj && (
                    <div className="bg-white p-2.5 rounded border border-slate-200 mt-2 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0B207D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {activeProj.code}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {activeProj.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>Client : <strong>{activeProj.clientName}</strong></span>
                              <span>•</span>
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Site : <strong>{activeProj.siteLocation || 'Zone Industrielle Arzew / Sud'}</strong></span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                          {activeProj.status || 'EN COURS / ACTIF'}
                        </span>
                      </div>

                      {/* Indicateurs financiers en temps réel du chantier */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 block">Budget Alloué :</span>
                          <span className="font-bold text-slate-800">{formatCurrencyDA(projBudget, false)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Engagé & Dépenses :</span>
                          <span className="font-bold text-amber-700">{formatCurrencyDA(projCommitted, false)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Solde Disponible :</span>
                          <span className="font-bold text-emerald-700">{formatCurrencyDA(projRemaining, false)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Impact DA Actuelle :</span>
                          <span className="font-bold text-[#0B207D]">~{currentDaImpactPct}% budget</span>
                        </div>
                      </div>

                      {/* Barre de consommation budgétaire */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            budgetConsumedPct > 90 ? 'bg-red-500' : budgetConsumedPct > 70 ? 'bg-amber-500' : 'bg-[#0B207D]'
                          }`}
                          style={{ width: `${budgetConsumedPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Pôle Métier & Catégorie d'Achat SILEX */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Pôle d'Activité & Famille d'Achat Chantier <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                    {[
                      { id: 'TUYAUTERIE', label: 'Tuyauterie & Robin.', icon: Flame },
                      { id: 'ELECTRICITE', label: 'Électricité & Inst.', icon: Zap },
                      { id: 'HVAC', label: 'Froid & HVAC', icon: Snowflake },
                      { id: 'SOUDAGE', label: 'Soudage & Outils', icon: Wrench },
                      { id: 'SOUS_TRAITANCE', label: 'CND & Sous-trait.', icon: ShieldCheck },
                    ].map(cat => {
                      const IconComp = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setProcurementCategory(cat.id)}
                          className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                            procurementCategory === cat.id
                              ? 'border-[#0B207D] bg-blue-50 text-[#07164D] shadow-2xs ring-1 ring-[#0B207D]'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <IconComp className="w-4 h-4 mb-1 text-[#0B207D]" />
                          <div>{cat.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Bordereau des Articles & Fournitures Multi-Produits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-slate-800 font-bold">
                        Bordereau des Articles & Produits de la DA ({prLines.length}) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Ajoutez, modifiez ou panachez des composants du stock et des pièces sur-mesure
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addPRLine}
                      className="px-2.5 py-1 bg-[#0B207D] hover:bg-[#07164D] text-white rounded text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un article
                    </button>
                  </div>

                  {/* Liste des lignes multi-produits */}
                  <div className="space-y-3">
                    {(Array.isArray(prLines) ? prLines : []).map((line, idx) => {
                      const lineItem = (Array.isArray(items) ? items : []).find(i => i.id === line.itemId);
                      const lineSubtotal = Number(line.quantity || 0) * Number(line.unitPrice || 0);

                      return (
                        <div
                          key={line.id}
                          className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 space-y-2.5 transition-all hover:border-slate-300 relative"
                        >
                          {/* Ligne Header */}
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#0B207D] text-white flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-800 text-xs">
                                Ligne Article #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Toggle CATALOGUE vs SUR-MESURE */}
                              <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const defaultItem = items[0];
                                    updatePRLine(line.id, {
                                      mode: 'CATALOG',
                                      itemId: defaultItem ? defaultItem.id : '',
                                      unit: defaultItem?.unit || 'UNITE',
                                      unitPrice: Number(defaultItem?.unitCost || 18500),
                                    });
                                  }}
                                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                    line.mode === 'CATALOG'
                                      ? 'bg-[#0B207D] text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <Package className="w-3 h-3" />
                                  Stock Central
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updatePRLine(line.id, { mode: 'CUSTOM' })}
                                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                    line.mode === 'CUSTOM'
                                      ? 'bg-[#0B207D] text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <Ruler className="w-3 h-3" />
                                  Sur-Mesure
                                </button>
                              </div>

                              {/* Bouton Suppression (si plus d'1 ligne) */}
                              {prLines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePRLine(line.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                  title="Supprimer cette ligne"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Corps de la ligne */}
                          {line.mode === 'CATALOG' ? (
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-semibold text-slate-700">
                                Sélectionner dans le Magasin Central SILEX (Arzew / Sud) *
                              </label>
                              <select
                                value={line.itemId || (items[0]?.id ?? '')}
                                onChange={e => updatePRLine(line.id, { itemId: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B207D]"
                                required
                              >
                                {(Array.isArray(items) ? items : []).map(i => (
                                  <option key={i.id} value={i.id}>
                                    {i.code} — {i.name} (PMP: {formatCurrencyDA(i.unitCost, false)} • Stock: {Number(i.currentStock || 0)} {i.unit || 'U'})
                                  </option>
                                ))}
                              </select>

                              {lineItem && (
                                <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500">
                                    Réf Magasin : <strong className="font-mono text-slate-800">{lineItem.code}</strong>
                                  </span>
                                  <span className="text-slate-500">
                                    Disponible : <strong className={Number(lineItem.currentStock || 0) > 0 ? 'text-emerald-700' : 'text-amber-700'}>
                                      {Number(lineItem.currentStock || 0)} {lineItem.unit || 'UNITE'}
                                    </strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 bg-blue-50/40 p-2.5 rounded border border-blue-200">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                  Désignation Spécifique de la Pièce / Fourniture *
                                </label>
                                <input
                                  type="text"
                                  value={line.customName}
                                  onChange={e => updatePRLine(line.id, { customName: e.target.value })}
                                  placeholder="ex: Spool Tuyauterie Inox 316L DN150 Sch 40S..."
                                  className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0B207D]"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                    Nuance Matière & Norme
                                  </label>
                                  <input
                                    type="text"
                                    value={line.customNuance}
                                    onChange={e => updatePRLine(line.id, { customNuance: e.target.value })}
                                    placeholder="ASTM A312 TP316L / EN 10216-5"
                                    className="w-full p-1 border border-slate-300 rounded bg-white text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                    Repère Plan Isométrique / TAG
                                  </label>
                                  <input
                                    type="text"
                                    value={line.customIsoRef}
                                    onChange={e => updatePRLine(line.id, { customIsoRef: e.target.value })}
                                    placeholder="ISO-PRJ-2026-DWG-04"
                                    className="w-full p-1 border border-slate-300 rounded bg-white text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quantité, Unité, Prix Unitaire & Sous-total Ligne */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200 items-end">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Quantité <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={line.quantity}
                                onChange={e => updatePRLine(line.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                min={1}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-900"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Unité <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={line.unit}
                                onChange={e => updatePRLine(line.id, { unit: e.target.value })}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-semibold"
                              >
                                <option value="UNITE">Unités (U)</option>
                                <option value="METRE">Mètres (ML)</option>
                                <option value="KG">Kilogrammes (KG)</option>
                                <option value="BOITE">Boîtes / Cartons</option>
                                <option value="LOT">Lots / Ensembles</option>
                                <option value="FORFAIT">Forfait</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Prix Unit. Estimé (DA HT) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={line.unitPrice}
                                onChange={e => updatePRLine(line.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0B207D]"
                                required
                              />
                            </div>
                            <div className="bg-white p-1.5 rounded border border-slate-200 text-right">
                              <span className="block text-[10px] text-slate-500">Sous-total Ligne HT</span>
                              <span className="font-bold text-xs text-[#07164D]">{formatCurrencyDA(lineSubtotal, false)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bouton ajout ligne supplémentaire */}
                  <button
                    type="button"
                    onClick={addPRLine}
                    className="w-full py-2 border-2 border-dashed border-blue-300 hover:border-[#0B207D] rounded-lg text-xs font-bold text-[#0B207D] hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + Ajouter un autre article / composant à cette Demande d'Achat
                  </button>
                </div>

                {/* 4. Ventilation Financière en Direct (DA, Régime Fiscal DZ & TVA 19%) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#0B207D]" />
                      Ventilation Financière Globale & Régime Fiscal Algérien
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      Calcul en temps réel
                    </span>
                  </div>

                  {/* Choix Régime Fiscal DZ avec Saisie Manuelle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-slate-600 font-medium">Régime Fiscal DZ & Taux de TVA :</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { rate: 19, label: '19% (Droit Commun)' },
                        { rate: 9, label: '9% (Taux Réduit)' },
                        { rate: 0, label: '0% (Exonération ANDI)' },
                      ].map(r => (
                        <button
                          key={r.rate}
                          type="button"
                          onClick={() => setPrVatRate(r.rate)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            prVatRate === r.rate
                              ? 'bg-[#0B207D] text-white border-[#0B207D]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                      {/* Saisie Manuelle du Taux de Taxe */}
                      <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-300">
                        <span className="text-[10px] text-slate-500 font-bold">Autre :</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={prVatRate}
                          onChange={e => setPrVatRate(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                          className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-bold text-[#07164D] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B207D]"
                          placeholder="%"
                        />
                        <span className="text-xs font-bold text-slate-700">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Total Fournitures HT ({prLines.length} article(s)) :</span>
                      <span className="font-bold">{formatCurrencyDA(totalPRLinesHT, false)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>TVA Légale Algérienne ({prVatRate}.00%) :</span>
                      <span className="font-semibold">+{formatCurrencyDA(totalPRTva, false)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Total Estimé Net à Engager TTC :</span>
                      <span className="text-[#0B207D] font-extrabold">{formatCurrencyDA(totalPRLinesTTC, false)}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Degré d'Urgence (SLA), Délai Souhaité & Lieu de Déchargement */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Degré d'Urgence & SLA <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestUrgency}
                      onChange={e => setRequestUrgency(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-semibold"
                    >
                      <option value="CRITICAL">Critique (Arrêt Chantier &lt; 24-48h)</option>
                      <option value="HIGH">Urgent (Jalon Prioritaire 3-5j)</option>
                      <option value="NORMAL">Normal (Standard 7 à 15 jours)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Date Limite de Livraison sur Site <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={desiredDeliveryDate}
                      onChange={e => setDesiredDeliveryDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lieu Précis de Déchargement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deliveryLocation}
                      onChange={e => setDeliveryLocation(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs font-medium"
                    >
                      <option value="Magasin Central Arzew (Zone Industrielle Ouest)">Magasin Central Arzew (ZI Ouest)</option>
                      <option value="Parc Avancé Hassi Messaoud (Base Sud)">Parc Avancé Hassi Messaoud</option>
                      <option value="Direct Chantier Site Client (Protocole Sonatrach)">Direct Chantier Site Client</option>
                    </select>
                  </div>
                </div>

                {/* 7. Exigences Qualité & Traçabilité (Sonatrach / Pétrochimie) */}
                <div className="p-2.5 bg-blue-50/40 rounded-lg border border-blue-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#07164D] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0B207D]" />
                    Exigences Qualité & Traçabilité Légale (Exigées à la Réception) :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={reqCertCcpu31}
                        onChange={e => setReqCertCcpu31(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Certificat CCPU 3.1 selon EN 10204 (Coulée / Nuance)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={reqCndReport}
                        onChange={e => setReqCndReport(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Rapport Contrôle CND (Radio / Ressuage)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={reqCoc}
                        onChange={e => setReqCoc(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Certificat de Conformité Fabricant (CoC)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={reqAtexFds}
                        onChange={e => setReqAtexFds(e.target.checked)}
                        className="rounded text-[#0B207D]"
                      />
                      <span>Agrément Zone ATEX / FDS Fournisseur</span>
                    </label>
                  </div>
                </div>

                {/* 8. Justification Opérationnelle & Presets Rapides */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-800 font-bold">
                      Justification Opérationnelle & Motifs de la DA <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Transmis au service Achats et à la DG</span>
                  </div>

                  {/* Presets rapides de justification */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyJustificationPreset(
                          'Approvisionnement prioritaire pour test d\'épreuve hydraulique sous pression (150 bars) et tie-in réseau selon planning contractuel Sonatrach.',
                          'HIGH'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Gauge className="w-3 h-3 text-cyan-600" />
                      Épreuve Hydro 150 bars
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyJustificationPreset(
                          'Remplacement préventif et révision des robinetteries industrielles pendant la fenêtre d\'arrêt d\'unité U-100.',
                          'NORMAL'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Factory className="w-3 h-3 text-amber-600" />
                      Arrêt Unité U-100
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyJustificationPreset(
                          'Fourniture des électrodes et fils de soudage certifiés pour passage des épreuves de qualification soudeur ASME IX / Bureau Veritas.',
                          'NORMAL'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-orange-600" />
                      Épreuves Soudeurs ASME
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyJustificationPreset(
                          'Intervention curative urgente suite à détection de fuite sur bride amont lors de la mise en service du collecteur (Risque pénalités Sonatrach).',
                          'CRITICAL'
                        )
                      }
                      className="px-2 py-0.5 bg-slate-100 hover:bg-red-50 border border-slate-200 rounded text-[10px] font-semibold text-red-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Avarie Urgente Bride / Fuite
                    </button>
                  </div>

                  <textarea
                    value={requestJustification}
                    onChange={e => setRequestJustification(e.target.value)}
                    rows={2}
                    placeholder="Préciser le contexte technique, la ligne isométrique concernée ou la cause du besoin..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-[#0B207D] text-xs leading-relaxed"
                    required
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Enregistrement PostgreSQL immédiat
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#0B207D] hover:bg-[#07164D] text-white font-bold rounded shadow-xs transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Soumettre la Demande d'Achat (DA)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL MODIFICATION DA (UPDATES PRIX & QUANTITÉS & TVA) */}
      {showEditPrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#0B207D]" />
                  Modifier la Demande d'Achat ({selectedPR?.reference})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Actualisation des quantités, prix unitaires estimés et recalcul TVA 19%.
                </p>
              </div>
              <button
                onClick={() => setShowEditPrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPR} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nouvelle Quantité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editQty}
                    onChange={e => setEditQty(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Prix Unitaire HT (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editUnitPrice}
                    onChange={e => setEditUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
              </div>

              {/* Recalcul dynamique immédiat */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Sous-total HT actualisé :</span>
                  <span className="font-bold">{formatCurrencyDA(editLineHT, false)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA Légale (19%) :</span>
                  <span>+{formatCurrencyDA(editTva, false)}</span>
                </div>
                <div className="pt-1 border-t border-blue-200 flex justify-between font-extrabold text-[#0B207D] text-sm">
                  <span>Nouveau Total TTC :</span>
                  <span>{formatCurrencyDA(editTTC, false)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Urgence</label>
                <select
                  value={editUrgency}
                  onChange={e => setEditUrgency(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Urgent</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motif de modification</label>
                <textarea
                  value={editJustification}
                  onChange={e => setEditJustification(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPrModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT VARIANTE / OFFRE FOURNISSEUR */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#0B207D]" />
                  Ajouter une Variante / Devis Fournisseur
                </h3>
                <p className="text-[11px] text-slate-500">
                  Rattachement d'une offre concurrente pour la DA {selectedPR?.reference}.
                </p>
              </div>
              <button
                onClick={() => setShowAddQuoteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualQuote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Fournisseur Homologué <span className="text-red-500">*</span>
                </label>
                <select
                  value={quoteSupplierId}
                  onChange={e => setQuoteSupplierId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs font-medium"
                  required
                >
                  {(Array.isArray(suppliers) ? suppliers : []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Prix Unitaire HT Proposé (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quoteUnitPrice}
                    onChange={e => setQuoteUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Délai de Livraison (Jours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quoteLeadDays}
                    onChange={e => setQuoteLeadDays(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded"
                    required
                  />
                </div>
              </div>

              {/* Recalcul avec TVA 19% */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Total HT ({quoteLineCount} unités) :</span>
                  <span className="font-bold">{formatCurrencyDA(quoteTotalHT, false)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>TVA Légale 19% :</span>
                  <span>+{formatCurrencyDA(quoteTva, false)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 flex justify-between font-extrabold text-[#0B207D]">
                  <span>Total TTC Devis :</span>
                  <span>{formatCurrencyDA(quoteTotalTTC, false)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Disponibilité Stock</label>
                  <select
                    value={quoteAvailability}
                    onChange={e => setQuoteAvailability(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="IMMEDIATE">En stock immédiat</option>
                    <option value="ON_ORDER">Sur commande usine</option>
                    <option value="FABRICATION_SPECIALE">Fabrication spéciale / Usinage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Garantie Matériel</label>
                  <select
                    value={quoteWarrantyMonths}
                    onChange={e => setQuoteWarrantyMonths(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value={12}>12 mois constructeur</option>
                    <option value={24}>24 mois constructeur</option>
                    <option value={6}>6 mois</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Conditions de Paiement</label>
                <input
                  type="text"
                  value={quotePaymentTerms}
                  onChange={e => setQuotePaymentTerms(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Conformité CND</label>
                <textarea
                  value={quoteNotes}
                  onChange={e => setQuoteNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="quoteIsRecommended"
                  checked={quoteIsRecommended}
                  onChange={e => setQuoteIsRecommended(e.target.checked)}
                  className="rounded text-[#0B207D]"
                />
                <label htmlFor="quoteIsRecommended" className="text-slate-800 font-semibold cursor-pointer">
                  Définir comme variante recommandée et soumettre pour arbitrage DG
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuoteModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-semibold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer l'Offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REJET DG */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Refuser la Demande d'Achat ({selectedPR?.reference})
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRejectByDG} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motif du rejet / Instruction de renégociation :
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors shadow-xs"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÉEXAMEN / RENÉGOCIATION DG */}
      {showReexamineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                Demander un Réexamen / Renégociation ({selectedPR?.reference})
              </h3>
              <button onClick={() => setShowReexamineModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleReexamineByDG} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Instructions de renégociation / recherche de variante pour les Achats :
                </label>
                <textarea
                  value={reexamineNotes}
                  onChange={e => setReexamineNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 bg-amber-50 p-2 rounded border border-amber-200">
                La DA repassera au statut <strong>Consultation en cours</strong>. Les acheteurs pourront mettre à jour les devis, proposer une variante technique ou un nouveau prix, puis la re-soumettre pour approbation.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReexamineModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                >
                  Renvoyer pour Réexamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER DEVIS / SAISIR VARIANTE */}
      {showEditQuoteModal && editingQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#07164D] flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#0B207D]" />
                Modifier Devis & Saisir Variante ({editingQuote.quoteReference})
              </h3>
              <button onClick={() => setShowEditQuoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveQuoteVariant} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10.5px] text-slate-500 uppercase font-bold block">Fournisseur :</span>
                <span className="font-bold text-slate-900 text-sm">{editingQuote.supplier?.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Montant Total Négocié HT (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editQuoteAmountHT}
                    onChange={e => setEditQuoteAmountHT(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none font-bold"
                    required
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    TVA (19%) : {formatCurrencyDA(Math.round((Number(editQuoteAmountHT) || 0) * 0.19), false)} | TTC : {formatCurrencyDA(Math.round((Number(editQuoteAmountHT) || 0) * 1.19), false)}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Délai de Livraison (Jours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editQuoteLeadTime}
                    onChange={e => setEditQuoteLeadTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Conditions de Paiement & Remise
                </label>
                <input
                  type="text"
                  value={editQuotePayment}
                  onChange={e => setEditQuotePayment(e.target.value)}
                  placeholder="ex: 30% commande, 70% réception conforme à 30 jours"
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Précisions sur la Variante Technique ou Commerciale
                </label>
                <textarea
                  value={editQuoteNotes}
                  onChange={e => setEditQuoteNotes(e.target.value)}
                  rows={2}
                  placeholder="ex: Variante Inox 316L avec certificats 3.1 EN 10204 et remise additionnelle de 5% sur volume"
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditQuoteModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] transition-colors shadow-xs cursor-pointer"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION ACCUSÉ RÉCEPTION BON DE COMMANDE */}
      {showConfirmPoModal && confirmingPo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Confirmer l'Accusé de Réception ({confirmingPo.orderNumber})
              </h3>
              <button onClick={() => setShowConfirmPoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmPO} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div>Fournisseur : <strong>{confirmingPo.supplier?.name}</strong></div>
                <div>Montant TTC : <strong>{formatCurrencyDA(Number(confirmingPo.totalAmountTTC || 0), false)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Référence Accusé de Réception (AR Fournisseur) :
                </label>
                <input
                  type="text"
                  value={supplierAckRef}
                  onChange={e => setSupplierAckRef(e.target.value)}
                  placeholder="ex: AR-2026-0881-CONFIRMED"
                  className="w-full p-2 border border-slate-200 rounded focus:border-[#0B207D] focus:outline-none font-mono"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-500 bg-emerald-50 p-2 rounded border border-emerald-200">
                Cette confirmation valide l'engagement ferme du fournisseur sur les prix, les délais et le respect du CCPU 3.1 pour les chantiers SILEX SERVICES.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmPoModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                >
                  Valider la Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OFFICIEL IMPRESSION BON DE COMMANDE FOURNISSEUR (A4 AVEC TVA 19%) */}
      {selectedPoForPrint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#0B207D]" />
                Bon de Commande Fournisseur Officiel (A4)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B207D] text-white rounded text-xs font-semibold hover:bg-[#07164D] cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer / Exporter PDF
                </button>
                <button
                  onClick={() => setSelectedPoForPrint(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable BC */}
            <div className="border border-slate-300 p-6 sm:p-8 rounded-lg bg-white space-y-6 text-xs text-slate-800">
              {/* Header Société SILEX */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-200 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                    <img
                      src="/logo-silex.png"
                      alt="SILEX SERVICES"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-base font-black text-[#07164D]">{COMPANY_NAME}</div>
                    <div className="text-[11px] text-slate-600 font-semibold">
                      Services & Maintenance Industrielles
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Zone Industrielle, Arzew / Siège Social Algérie • Depuis {COMPANY_ESTABLISHED}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NIF : 001516098273645 • RC : 16/00-0876543A15
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Document Contractuel</div>
                  <div className="font-mono text-base font-black text-[#0B207D] mt-0.5">
                    {selectedPoForPrint.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Date : <strong>{formatDateDZ(selectedPoForPrint.createdAt)}</strong>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    Statut : COMMANDE FERME VALIDÉE DG
                  </div>
                </div>
              </div>

              {/* Bloc Destinataire Fournisseur & Projet */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Fournisseur Homologué :</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedPoForPrint.supplier?.name}</div>
                  <div className="text-[11px] text-slate-600">Contact : {selectedPoForPrint.supplier?.contactName}</div>
                  <div className="text-[11px] text-slate-600">Tél : {selectedPoForPrint.supplier?.phone}</div>
                  <div className="text-[11px] text-slate-600">Adresse : {selectedPoForPrint.supplier?.address}</div>
                  {selectedPoForPrint.supplier?.taxId && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-200">
                      {selectedPoForPrint.supplier?.taxId}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Affectation Chantier :</div>
                  <div className="font-bold text-[#07164D] text-sm">
                    {selectedPoForPrint.project?.code} — {selectedPoForPrint.project?.name}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Lieu de livraison : <strong>Magasin Chantier SILEX</strong>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Conditionnement : <strong>Bordereau de livraison + CCPU 3.1</strong>
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1 pt-1 border-t border-slate-200">
                    Pénalités : 0.5% par jour de retard calendaire
                  </div>
                </div>
              </div>

              {/* Tableau des Articles Commandés */}
              <div className="border rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07164D] text-white font-semibold text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5">Réf & Désignation des Fournitures</th>
                      <th className="p-2.5 text-right">Quantité</th>
                      <th className="p-2.5 text-right">Prix Unitaire HT</th>
                      <th className="p-2.5 text-right">Montant Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPoForPrint.lines && selectedPoForPrint.lines.length > 0 ? (
                      (Array.isArray(selectedPoForPrint?.lines) ? selectedPoForPrint.lines : []).map((l: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium text-slate-900">
                            <div>{l.description}</div>
                            {l.item?.code && <div className="text-[10px] text-slate-400 font-mono">{l.item.code}</div>}
                          </td>
                          <td className="p-2.5 text-right font-bold">{l.quantity} {l.unit || 'UNITE'}</td>
                          <td className="p-2.5 text-right">{formatCurrencyDA(l.unitPrice, false)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrencyDA(l.subtotal, false)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Fourniture matérielle industrielle conforme DA</td>
                        <td className="p-2.5 text-right font-bold">1 FORFAIT</td>
                        <td className="p-2.5 text-right">{formatCurrencyDA(selectedPoForPrint.totalAmountHT, false)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrencyDA(selectedPoForPrint.totalAmountHT, false)}</td>
                      </tr>
                    )}
                  </tbody>
                  {/* Totaux & TVA 19% */}
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-xs">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right text-slate-600 uppercase">Total Hors Taxes (HT) :</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrencyDA(selectedPoForPrint.totalAmountHT, false)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 text-right text-slate-600 uppercase">
                        TVA Légale Algérienne (19.00%) :
                      </td>
                      <td className="p-2 text-right font-bold text-slate-700">
                        +{formatCurrencyDA(Math.round(Number(selectedPoForPrint.totalAmountHT) * 0.19), false)}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/70 border-t border-blue-200 text-sm">
                      <td colSpan={3} className="p-3 text-right font-black text-[#07164D] uppercase">
                        Net à Payer Toutes Taxes Comprises (TTC) :
                      </td>
                      <td className="p-3 text-right font-black text-[#0B207D]">
                        {formatCurrencyDA(Number(selectedPoForPrint.totalAmountHT) * 1.19, false)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mentions Légales & Signatures Contradictoires */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-12 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">
                    Service Achats & Approvisionnements SILEX
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Visa Acheteur & Date d'émission</div>
                </div>
                <div className="space-y-12 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">
                    Direction Générale SILEX SERVICES
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Signature & Cachet Officiel (Engagement Ferme)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
