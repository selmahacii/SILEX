'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  X,
  FileText,
  DollarSign,
  TrendingDown,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Coins,
  ChevronRight,
  Eye,
  Info,
  PackageCheck,
  ShoppingCart,
  FileSpreadsheet,
  Ban,
  Check,
  Layers,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';
import { api } from '@/lib/api-client';
import { FinancialAccountSummary } from './accounts-summary-widget';

export interface SupplierInvoiceItem {
  id: string;
  internalReference: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  goodsReceiptId?: string;
  goodsReceiptCode?: string;
  goodsReceiptIds?: string[];
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  invoiceDate: string;
  dueDate: string;
  amountHT: number;
  vatRate: number;
  vatAmount: number;
  amountTTC: number;
  paidAmount: number;
  remainingAmount: number;
  matchingStatus: string;
  matchingDetails?: {
    poAmountHT?: number;
    grTotalHT?: number;
    priceVarianceDA?: number;
    qtyVariancePct?: number;
    notes?: string;
  };
  approvalThresholdStatus?: string;
  status: string;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  lines?: any[];
  lineMatchings?: any[];
}

interface MatchingViewProps {
  invoices: SupplierInvoiceItem[];
  accounts: FinancialAccountSummary[];
  projects: any[];
  canManage: boolean;
  activeRole?: string;
  dgThreshold?: number;
  pmThreshold?: number;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export function MatchingView({
  invoices = [],
  accounts = [],
  projects = [],
  canManage,
  activeRole,
  dgThreshold = 2000000,
  pmThreshold = 600000,
  onRefresh,
  onNotify,
}: MatchingViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchingStatusFilter, setMatchingStatusFilter] = useState<string>('ALL');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Inspector & Modals State
  const [inspectedInvoice, setInspectedInvoice] = useState<SupplierInvoiceItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showDerogationModal, setShowDerogationModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  // Pay Modal Form State
  const [payInvoiceId, setPayInvoiceId] = useState<string>('');
  const [payAccountId, setPayAccountId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRef, setPayRef] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');
  const [paySubmitting, setPaySubmitting] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Derogation Modal Form State
  const [derogationInvoiceId, setDerogationInvoiceId] = useState<string>('');
  const [derogationReason, setDerogationReason] = useState<string>('');
  const [derogationSubmitting, setDerogationSubmitting] = useState<boolean>(false);
  const [derogationError, setDerogationError] = useState<string | null>(null);

  // Cancel Modal Form State
  const [cancelInvoiceId, setCancelInvoiceId] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelSubmitting, setCancelSubmitting] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Create Invoice Modal State
  const [createSupplierName, setCreateSupplierName] = useState<string>('');
  const [createInvoiceNumber, setCreateInvoiceNumber] = useState<string>('');
  const [createPoCode, setCreatePoCode] = useState<string>('');
  const [createGrCode, setCreateGrCode] = useState<string>('');
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [createAmountHT, setCreateAmountHT] = useState<number>(0);
  const [createVatRate, setCreateVatRate] = useState<number>(19);
  const [createInvoiceDate, setCreateInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [createDueDate, setCreateDueDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [createPaymentTerms, setCreatePaymentTerms] = useState<string>('30 jours');
  const [createNotes, setCreateNotes] = useState<string>('');
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Active Pay Invoice
  const activePayInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === payInvoiceId);
  }, [invoices, payInvoiceId]);

  // Selected Bank Account for Pay Modal
  const activePayAccount = useMemo(() => {
    return accounts.find(a => a.id === payAccountId);
  }, [accounts, payAccountId]);

  // Active Derogation Invoice
  const activeDerogationInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === derogationInvoiceId);
  }, [invoices, derogationInvoiceId]);

  // Active Cancel Invoice
  const activeCancelInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === cancelInvoiceId);
  }, [invoices, cancelInvoiceId]);

  // Top KPI Stats
  const { totalDebts, totalPendingApproval, discrepancyCount, highValuePendingCount } = useMemo(() => {
    let debts = 0;
    let pending = 0;
    let discCount = 0;
    let highValCount = 0;

    invoices.forEach(inv => {
      const rem = Number(inv.remainingAmount ?? (Number(inv.amountTTC || 0) - Number(inv.paidAmount || 0)));
      debts += rem;

      if (inv.status === 'A_APPROUVER') {
        pending++;
        if (Number(inv.amountHT || 0) > dgThreshold) {
          highValCount++;
        }
      }

      if (['ECART_PRIX', 'ECART_QUANTITE', 'SANS_RECEPTION'].includes(inv.matchingStatus)) {
        discCount++;
      }
    });

    return {
      totalDebts: debts,
      totalPendingApproval: pending,
      discrepancyCount: discCount,
      highValuePendingCount: highValCount,
    };
  }, [invoices, dgThreshold]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          (inv.internalReference && inv.internalReference.toLowerCase().includes(q)) ||
          (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
          (inv.supplierName && inv.supplierName.toLowerCase().includes(q)) ||
          (inv.purchaseOrderCode && inv.purchaseOrderCode.toLowerCase().includes(q)) ||
          (inv.goodsReceiptCode && inv.goodsReceiptCode.toLowerCase().includes(q)) ||
          (inv.projectCode && inv.projectCode.toLowerCase().includes(q)) ||
          (inv.notes && inv.notes.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Matching Status Filter
      if (matchingStatusFilter !== 'ALL') {
        if (inv.matchingStatus !== matchingStatusFilter) return false;
      }

      // 3. Approval Status Filter
      if (approvalStatusFilter !== 'ALL') {
        if (inv.status !== approvalStatusFilter) return false;
      }

      // 4. Project Filter
      if (projectFilter !== 'ALL') {
        if (inv.projectId !== projectFilter && inv.projectCode !== projectFilter) return false;
      }

      // 5. Date Range
      if (startDate) {
        const d = inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '';
        if (d && d < startDate) return false;
      }
      if (endDate) {
        const d = inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '';
        if (d && d > endDate) return false;
      }

      return true;
    });
  }, [invoices, searchQuery, matchingStatusFilter, approvalStatusFilter, projectFilter, startDate, endDate]);

  // Summary of filtered selection
  const { filteredTotalTTC, filteredPaid, filteredRemaining } = useMemo(() => {
    let ttc = 0;
    let paid = 0;
    let rem = 0;
    filteredInvoices.forEach(inv => {
      const t = Number(inv.amountTTC || 0);
      const p = Number(inv.paidAmount || 0);
      const r = Number(inv.remainingAmount ?? (t - p));
      ttc += t;
      paid += p;
      rem += r;
    });
    return { filteredTotalTTC: ttc, filteredPaid: paid, filteredRemaining: rem };
  }, [filteredInvoices]);

  // 3-Way Matching Status Badge
  const getMatchingBadge = (status: string) => {
    switch (status) {
      case 'CONFORME_3_WAY':
      case 'CONFORME':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Conforme 3-Way
          </span>
        );
      case 'ECART_PRIX':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            Écart de Prix
          </span>
        );
      case 'ECART_QUANTITE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Écart Quantité
          </span>
        );
      case 'SANS_RECEPTION':
      case 'EN_ATTENTE_BR':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">
            <Clock className="h-3 w-3 text-purple-600" />
            Sans / Attente BR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {status}
          </span>
        );
    }
  };

  // SoD Approval Status Badge
  const getApprovalBadge = (status: string, amountHT: number) => {
    const isAboveDgThreshold = amountHT > dgThreshold;
    switch (status) {
      case 'APPROUVEE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Approuvée
          </span>
        );
      case 'PAYEE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0B207D] border border-blue-200">
            <CheckCircle2 className="h-3 w-3 text-[#0B207D]" />
            Payée
          </span>
        );
      case 'REJETEE':
      case 'ANNULEE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
            <Ban className="h-3 w-3 text-rose-600" />
            Rejetée / Annulée
          </span>
        );
      case 'A_APPROUVER':
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border ${
            isAboveDgThreshold
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Clock className="h-3 w-3 text-amber-600" />
            {isAboveDgThreshold ? 'Visa DG Requis (>2M)' : 'Visa DAF/PM Requis'}
          </span>
        );
    }
  };

  // Handler: Record Supplier Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);

    if (!payInvoiceId) {
      setPayError('Facture introuvable.');
      return;
    }
    if (!payAccountId) {
      setPayError('Veuillez sélectionner le compte bancaire émetteur.');
      return;
    }
    if (payAmount <= 0) {
      setPayError('Le montant doit être supérieur à zéro.');
      return;
    }
    if (activePayInvoice && payAmount > Number(activePayInvoice.remainingAmount)) {
      setPayError(`Le montant dépasse la dette restante (${formatCurrencyDA(activePayInvoice.remainingAmount, false)}).`);
      return;
    }
    if (activePayAccount && Number(activePayAccount.currentBalance) < payAmount) {
      setPayError(`Solde insuffisant sur le compte bancaire sélectionné (${formatCurrencyDA(activePayAccount.currentBalance, false)}).`);
      return;
    }

    try {
      setPaySubmitting(true);
      await api.post(`/finance/supplier-invoices/${payInvoiceId}/pay`, {
        accountId: payAccountId,
        amount: Number(payAmount),
        referenceDocument: payRef.trim() || `VIR-FOU-${activePayInvoice?.internalReference}`,
        paymentDate: payDate,
        notes: payNotes,
      });

      setShowPayModal(false);
      setPayAmount(0);
      setPayRef('');
      setPayNotes('');
      onNotify(`Règlement fournisseur de ${formatCurrencyDA(payAmount, false)} exécuté avec succès.`);
      await onRefresh();
    } catch (err: any) {
      setPayError(err.message || 'Erreur lors du paiement de la facture');
    } finally {
      setPaySubmitting(false);
    }
  };

  // Handler: Approve with Derogation
  const handleApproveDerogation = async (e: React.FormEvent) => {
    e.preventDefault();
    setDerogationError(null);

    if (!derogationReason.trim()) {
      setDerogationError('Le motif de dérogation managériale est obligatoire.');
      return;
    }

    try {
      setDerogationSubmitting(true);
      await api.post(`/finance/supplier-invoices/${derogationInvoiceId}/derogation`, {
        reason: derogationReason.trim(),
      });

      setShowDerogationModal(false);
      setDerogationReason('');
      onNotify(`Facture ${activeDerogationInvoice?.internalReference} approuvée sous dérogation.`);
      await onRefresh();
    } catch (err: any) {
      setDerogationError(err.message || 'Erreur lors de l\'approbation sous dérogation');
    } finally {
      setDerogationSubmitting(false);
    }
  };

  // Handler: Cancel / Reject Invoice
  const handleCancelInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError(null);

    if (!cancelReason.trim()) {
      setCancelError('Le motif de rejet / annulation est obligatoire.');
      return;
    }

    try {
      setCancelSubmitting(true);
      await api.post(`/finance/supplier-invoices/${cancelInvoiceId}/cancel`, {
        reason: cancelReason.trim(),
      });

      setShowCancelModal(false);
      setCancelReason('');
      onNotify(`Facture ${activeCancelInvoice?.internalReference} rejetée / annulée.`);
      await onRefresh();
    } catch (err: any) {
      setCancelError(err.message || 'Erreur lors du rejet de la facture');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Handler: Create Supplier Invoice
  const handleCreateSupplierInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createSupplierName.trim() || !createInvoiceNumber.trim()) {
      setCreateError('Le nom du fournisseur et le N° de facture externe sont obligatoires.');
      return;
    }
    if (createAmountHT <= 0) {
      setCreateError('Le montant HT doit être supérieur à zéro.');
      return;
    }

    try {
      setCreateSubmitting(true);
      const proj = projects.find(p => p.id === createProjectId);
      await api.post('/finance/supplier-invoices', {
        supplierName: createSupplierName.trim(),
        invoiceNumber: createInvoiceNumber.trim(),
        purchaseOrderCode: createPoCode.trim() || undefined,
        goodsReceiptCode: createGrCode.trim() || undefined,
        projectId: createProjectId || undefined,
        projectCode: proj?.code || undefined,
        amountHT: Number(createAmountHT),
        vatRate: Number(createVatRate),
        invoiceDate: createInvoiceDate,
        dueDate: createDueDate,
        paymentTerms: createPaymentTerms,
        notes: createNotes,
      });

      setShowCreateModal(false);
      setCreateSupplierName('');
      setCreateInvoiceNumber('');
      setCreatePoCode('');
      setCreateGrCode('');
      setCreateAmountHT(0);
      setCreateNotes('');
      onNotify('Facture fournisseur enregistrée et soumise au moteur de 3-way matching.');
      await onRefresh();
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de l\'enregistrement de la facture');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    const headers = [
      'N° Interne',
      'N° Facture Externe',
      'Fournisseur',
      'Réf BC Commande',
      'Réf BR Réception',
      'Chantier',
      'Date Facture',
      'Date Échéance',
      'Montant HT (DA)',
      'TVA (%)',
      'Montant TTC (DA)',
      'Payé (DA)',
      'Reste Dû (DA)',
      'Statut 3-Way Matching',
      'Statut Approbation',
      'Seuil SoD',
      'Notes'
    ];

    const rows = filteredInvoices.map(inv => {
      const invDate = inv.invoiceDate ? inv.invoiceDate.split('T')[0] : '';
      const due = inv.dueDate ? inv.dueDate.split('T')[0] : '';
      const ttc = Number(inv.amountTTC || 0);
      const paid = Number(inv.paidAmount || 0);
      const rem = Number(inv.remainingAmount ?? (ttc - paid));

      return [
        `"${inv.internalReference}"`,
        `"${inv.invoiceNumber}"`,
        `"${(inv.supplierName || '').replace(/"/g, '""')}"`,
        `"${inv.purchaseOrderCode || ''}"`,
        `"${inv.goodsReceiptCode || ''}"`,
        `"${inv.projectCode || ''}"`,
        `"${invDate}"`,
        `"${due}"`,
        inv.amountHT,
        inv.vatRate,
        ttc,
        paid,
        rem,
        `"${inv.matchingStatus}"`,
        `"${inv.status}"`,
        Number(inv.amountHT || 0) > dgThreshold ? '"DG (>2M)"' : '"PM/DAF"',
        `"${(inv.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FACTURES_FOURNISSEURS_SILEX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Dettes Fournisseurs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Dettes Fournisseurs Restantes
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
            {formatCurrencyDA(totalDebts, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Engagements restant dus après vérification 3-way
          </p>
        </div>

        {/* En Attente d'Approbation SoD */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              À Approuver (SoD)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
            {totalPendingApproval} <span className="text-sm font-normal text-slate-500">factures</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {highValuePendingCount > 0 ? (
              <span className="font-semibold text-amber-800">Dont {highValuePendingCount} au plafond DG (&gt;2M DA)</span>
            ) : (
              'En attente de visa opérationnel'
            )}
          </p>
        </div>

        {/* Écarts de Rapprochement */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Écarts 3-Way Détectés
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              discrepancyCount > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${
            discrepancyCount > 0 ? 'text-rose-600' : 'text-slate-800'
          }`}>
            {discrepancyCount} <span className="text-sm font-normal text-slate-500">anomalies</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Écarts de prix ou quantités au-delà des tolérances
          </p>
        </div>

        {/* Factures Conformes */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Rapprochements Conformes
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#07164D]">
            {invoices.filter(i => i.matchingStatus === 'CONFORME_3_WAY').length} <span className="text-sm font-normal text-slate-500">/ {invoices.length}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            BC, BR et Factures 100% concordants
          </p>
        </div>
      </div>

      {/* 2. Action Bar with SoD Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-[#0B207D]" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Rapprochement Fournisseurs (3-Way Matching) & SoD
            </h2>
            <p className="text-xs text-slate-500">
              Contrôle strict des écarts de prix/quantité entre Commandes BC, Réceptions BR et Factures
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* New Supplier Invoice Trigger */}
          <button
            onClick={() => {
              if (projects.length > 0) setCreateProjectId(projects[0].id);
              setShowCreateModal(true);
            }}
            disabled={!canManage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
              canManage
                ? 'bg-[#0B207D] text-white hover:bg-[#07164D]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Enregistrer une facture fournisseur et lancer le 3-Way Matching'}
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle Facture Fournisseur
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Quick Pay Trigger */}
          <button
            onClick={() => {
              const payable = invoices.find(i => i.status === 'APPROUVEE' && Number(i.remainingAmount) > 0) || invoices[0];
              if (payable) {
                setPayInvoiceId(payable.id);
                setPayAmount(Number(payable.remainingAmount || 0));
              }
              if (accounts.length > 0) setPayAccountId(accounts[0].id);
              setShowPayModal(true);
            }}
            disabled={!canManage || invoices.filter(i => i.status === 'APPROUVEE' && Number(i.remainingAmount) > 0).length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              canManage && invoices.some(i => i.status === 'APPROUVEE' && Number(i.remainingAmount) > 0)
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Régler une facture fournisseur approuvée'}
          >
            <Coins className="h-3.5 w-3.5 text-emerald-600" />
            Régler Facture Approuvée
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Exporter le journal des factures fournisseurs et rapprochements 3-Way au format CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Journal des Factures Fournisseurs ({filteredInvoices.length})
            </h3>
            <p className="text-xs text-slate-500">
              Vérification des montants, reliquats de commande et approbations SoD
            </p>
          </div>

          {/* Synthesis pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sélection :</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Total TTC: {formatCurrencyDA(filteredTotalTTC, false)}
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Payé: {formatCurrencyDA(filteredPaid, false)}
            </span>
            <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Dette Restante: {formatCurrencyDA(filteredRemaining, false)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher réf, fournisseur, BC..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D]"
            />
          </div>

          {/* Matching Status Filter */}
          <div>
            <select
              value={matchingStatusFilter}
              onChange={e => setMatchingStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Tous les statuts 3-Way</option>
              <option value="CONFORME_3_WAY">Conforme 3-Way</option>
              <option value="ECART_PRIX">Écart de Prix (!)</option>
              <option value="ECART_QUANTITE">Écart de Quantité (!)</option>
              <option value="SANS_RECEPTION">Sans / Attente Réception BR</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <select
              value={approvalStatusFilter}
              onChange={e => setApprovalStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Tous les statuts SoD</option>
              <option value="A_APPROUVER">À Approuver</option>
              <option value="APPROUVEE">Approuvée</option>
              <option value="PAYEE">Payée / Soldée</option>
              <option value="REJETEE">Rejetée / Annulée</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Tous les chantiers ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] text-slate-700"
              title="Date min"
            />
            {(searchQuery || matchingStatusFilter !== 'ALL' || approvalStatusFilter !== 'ALL' || projectFilter !== 'ALL' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMatchingStatusFilter('ALL');
                  setApprovalStatusFilter('ALL');
                  setProjectFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                title="Effacer tous les filtres"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table of Supplier Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Réf Interne & N° Externe</th>
                  <th className="py-2.5 px-3">Fournisseur & Chantier</th>
                  <th className="py-2.5 px-3">Rapprochement (BC / BR)</th>
                  <th className="py-2.5 px-3 text-right">Montant HT</th>
                  <th className="py-2.5 px-3 text-right">Montant TTC</th>
                  <th className="py-2.5 px-3 text-right">Reste Dû</th>
                  <th className="py-2.5 px-3 text-center">3-Way Matching</th>
                  <th className="py-2.5 px-3 text-center">Statut SoD</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <FileCheck2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Aucune facture fournisseur trouvée</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Modifiez vos critères de recherche ou enregistrez une nouvelle facture.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const ttc = Number(inv.amountTTC || 0);
                    const paid = Number(inv.paidAmount || 0);
                    const remaining = Number(inv.remainingAmount ?? (ttc - paid));
                    const isDiscrepant = ['ECART_PRIX', 'ECART_QUANTITE', 'SANS_RECEPTION'].includes(inv.matchingStatus);
                    const isPending = inv.status === 'A_APPROUVER';
                    const isApproved = inv.status === 'APPROUVEE';
                    const canPay = canManage && isApproved && remaining > 0;
                    const canApprove = canManage && isPending;
                    const isHighValue = Number(inv.amountHT || 0) > dgThreshold;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Reference Numbers */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-[#0B207D]">
                            <span>{inv.internalReference}</span>
                            {inv.isDemoInvoice ? (
                              <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200">
                                DÉMO
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                                PG
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            Ext: <strong className="text-slate-700">{inv.invoiceNumber}</strong>
                          </div>
                        </td>

                        {/* Supplier & Project */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 truncate max-w-[150px]" title={inv.supplierName}>
                            {inv.supplierName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="font-mono text-[#0B207D] font-bold">{inv.projectCode || '—'}</span>
                            <span className="truncate max-w-[120px]">{inv.projectName || ''}</span>
                          </div>
                        </td>

                        {/* BC / BR Links */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                          <div className="flex items-center gap-1 text-slate-600">
                            <ShoppingCart className="h-3 w-3 text-slate-400" />
                            <span>BC: <strong>{inv.purchaseOrderCode || '—'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                            <PackageCheck className="h-3 w-3 text-slate-400" />
                            <span>BR: <strong>{inv.goodsReceiptCode || (inv.goodsReceiptIds?.length ? `${inv.goodsReceiptIds.length} BRs` : 'Aucun')}</strong></span>
                          </div>
                        </td>

                        {/* Amount HT */}
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-slate-700">
                          {formatCurrencyDA(inv.amountHT, false)}
                        </td>

                        {/* Amount TTC */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900">
                          {formatCurrencyDA(ttc, false)}
                        </td>

                        {/* Remaining Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span className={remaining > 0 ? 'text-rose-600' : 'text-slate-400'}>
                            {formatCurrencyDA(remaining, false)}
                          </span>
                        </td>

                        {/* 3-Way Matching Status */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {getMatchingBadge(inv.matchingStatus)}
                        </td>

                        {/* SoD Approval Status */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {getApprovalBadge(inv.status, Number(inv.amountHT || 0))}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* Inspect 3-Way Modal Button */}
                            <button
                              onClick={() => setInspectedInvoice(inv)}
                              className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-[#0B207D] hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1"
                              title="Inspecter le rapprochement 3-Way (BC vs BR vs Facture)"
                            >
                              <Eye className="h-3 w-3" />
                              Inspecter
                            </button>

                            {/* Approve under derogation or standard approval */}
                            {canApprove && (
                              <button
                                onClick={() => {
                                  setDerogationInvoiceId(inv.id);
                                  setDerogationReason(isDiscrepant ? 'Écart validé pour continuité de chantier' : 'Conforme et validé');
                                  setShowDerogationModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-300 transition-colors"
                                title="Approuver la facture (sous dérogation si écart)"
                              >
                                {isDiscrepant ? 'Dérogation' : 'Approuver'}
                              </button>
                            )}

                            {/* Pay Button */}
                            {canPay && (
                              <button
                                onClick={() => {
                                  setPayInvoiceId(inv.id);
                                  setPayAmount(remaining);
                                  if (accounts.length > 0) setPayAccountId(accounts[0].id);
                                  setShowPayModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                title="Régler cette facture fournisseur"
                              >
                                Payer
                              </button>
                            )}

                            {/* Cancel / Reject Button */}
                            {isPending && canManage && (
                              <button
                                onClick={() => {
                                  setCancelInvoiceId(inv.id);
                                  setCancelReason('Non-conformité de livraison');
                                  setShowCancelModal(true);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                title="Rejeter la facture"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INSPECTEUR VISUEL INTERACTIF 3-WAY MATCHING (BC vs BR vs FACTURE) */}
      {/* ========================================================================= */}
      {inspectedInvoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Inspecteur Visuel 3-Way Matching — {inspectedInvoice.internalReference}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fournisseur : <strong>{inspectedInvoice.supplierName}</strong> • Réf externe : <strong>{inspectedInvoice.invoiceNumber}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Statut Rapprochement :</span>
                {getMatchingBadge(inspectedInvoice.matchingStatus)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Approbation SoD :</span>
                {getApprovalBadge(inspectedInvoice.status, Number(inspectedInvoice.amountHT || 0))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Seuil Réglementaire :</span>
                <span className="font-mono font-bold text-[#0B207D]">
                  {Number(inspectedInvoice.amountHT || 0) > dgThreshold
                    ? `Plafond DG (> ${formatCurrencyDA(dgThreshold, false)})`
                    : `Délégation PM/DAF (<= ${formatCurrencyDA(dgThreshold, false)})`}
                </span>
              </div>
            </div>

            {/* 3 Columns Comparison : BC vs BR vs FACTURE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1 : BC Commande */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold pb-2 border-b border-slate-100 text-xs">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <span>1. Bon de Commande (BC)</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>Réf: <strong className="font-mono text-[#0B207D]">{inspectedInvoice.purchaseOrderCode || '—'}</strong></div>
                  <div>Montant prévu: <span className="font-mono font-semibold">{formatCurrencyDA(inspectedInvoice.matchingDetails?.poAmountHT || inspectedInvoice.amountHT, false)}</span></div>
                  <div className="text-[11px] text-slate-500">Engagements contractuels et prix unitaires négociés</div>
                </div>
              </div>

              {/* Column 2 : BR Réception Physique */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold pb-2 border-b border-slate-100 text-xs">
                  <PackageCheck className="h-4 w-4 text-emerald-600" />
                  <span>2. Bon de Réception (BR)</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>Réf: <strong className="font-mono text-emerald-700">{inspectedInvoice.goodsReceiptCode || (inspectedInvoice.goodsReceiptIds?.join(', ') || 'En attente')}</strong></div>
                  <div>Valeur reçue: <span className="font-mono font-semibold">{formatCurrencyDA(inspectedInvoice.matchingDetails?.grTotalHT || inspectedInvoice.amountHT, false)}</span></div>
                  <div className="text-[11px] text-slate-500">Métré et comptage physique visé par le magasinier / conducteur</div>
                </div>
              </div>

              {/* Column 3 : Facture Réclamée */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold pb-2 border-b border-slate-100 text-xs">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>3. Facture Fournisseur</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>N° Facture: <strong className="font-mono text-purple-800">{inspectedInvoice.invoiceNumber}</strong></div>
                  <div>Montant réclamé HT: <span className="font-mono font-bold text-slate-900">{formatCurrencyDA(inspectedInvoice.amountHT, false)}</span></div>
                  <div>TTC: <span className="font-mono font-bold text-[#0B207D]">{formatCurrencyDA(inspectedInvoice.amountTTC, false)}</span></div>
                </div>
              </div>
            </div>

            {/* Discrepancy Diagnostics & Matchings */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0B207D]" />
                Diagnostic & Analyse des Écarts
              </h4>

              {inspectedInvoice.matchingStatus === 'CONFORME_3_WAY' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Rapprochement 100% conforme : les prix unitaires correspondent exactement à la commande BC et les quantités facturées n'excèdent pas les réceptions physiques BR.</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Anomalie constatée par le moteur de matching :</span>
                  </div>
                  <div className="text-slate-700">
                    {inspectedInvoice.matchingStatus === 'ECART_PRIX' && 'Le prix unitaire facturé est supérieur au prix convenu sur le Bon de Commande au-delà de la tolérance admise.'}
                    {inspectedInvoice.matchingStatus === 'ECART_QUANTITE' && 'La quantité facturée dépasse la quantité physique réceptionnée (ou dépassement du reliquat restant disponible).'}
                    {inspectedInvoice.matchingStatus === 'SANS_RECEPTION' && 'Aucune réception physique de marchandises (BR) n\'a encore été validée pour cette commande.'}
                  </div>
                  {inspectedInvoice.matchingDetails?.priceVarianceDA !== undefined && (
                    <div className="text-[11px] font-mono font-semibold pt-1">
                      Écart de prix total : {inspectedInvoice.matchingDetails.priceVarianceDA > 0 ? `+${formatCurrencyDA(inspectedInvoice.matchingDetails.priceVarianceDA, false)}` : '0 DA'}
                    </div>
                  )}
                </div>
              )}

              {/* Notes & Derogation History */}
              {inspectedInvoice.notes && (
                <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700">Historique & Justifications : </span>
                  {inspectedInvoice.notes}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectedInvoice(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : NOUVELLE FACTURE FOURNISSEUR */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nouvelle Facture Fournisseur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enregistrement de la facture externe et rapprochement automatique 3-Way
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSupplierInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nom du Fournisseur *
                  </label>
                  <input
                    type="text"
                    value={createSupplierName}
                    onChange={e => setCreateSupplierName(e.target.value)}
                    placeholder="Ex: SARL ACIERIE INDUSTRIELLE"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    N° Facture Externe *
                  </label>
                  <input
                    type="text"
                    value={createInvoiceNumber}
                    onChange={e => setCreateInvoiceNumber(e.target.value)}
                    placeholder="Ex: F-2026-9912"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Réf Bon de Commande (BC)
                  </label>
                  <input
                    type="text"
                    value={createPoCode}
                    onChange={e => setCreatePoCode(e.target.value)}
                    placeholder="Ex: BC-2026-001"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Réf Bon de Réception (BR)
                  </label>
                  <input
                    type="text"
                    value={createGrCode}
                    onChange={e => setCreateGrCode(e.target.value)}
                    placeholder="Ex: BR-2026-001"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Chantier / Projet d'Imputation
                </label>
                <select
                  value={createProjectId}
                  onChange={e => setCreateProjectId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                >
                  <option value="">Sélectionner un chantier...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Montant HT Facturé (DZD) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={createAmountHT || ''}
                      onChange={e => setCreateAmountHT(Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2 pr-10 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#0B207D]"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">DA</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Taux TVA (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={createVatRate}
                    onChange={e => setCreateVatRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date Facture *
                  </label>
                  <input
                    type="date"
                    value={createInvoiceDate}
                    onChange={e => setCreateInvoiceDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date d'Échéance *
                  </label>
                  <input
                    type="date"
                    value={createDueDate}
                    onChange={e => setCreateDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Notes
                </label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={e => setCreateNotes(e.target.value)}
                  placeholder="Ex: Fourniture fer à béton et treillis soudé"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0B207D] text-white hover:bg-[#07164D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {createSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Valider et Rapprocher (3-Way)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : PAIEMENT FACTURE FOURNISSEUR */}
      {/* ========================================================================= */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Règlement Facture Fournisseur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Décaissement bancaire et apurement de la dette fournisseur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {payError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{payError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Facture Fournisseur Concernée *
                </label>
                <select
                  value={payInvoiceId}
                  onChange={e => {
                    const id = e.target.value;
                    setPayInvoiceId(id);
                    const inv = invoices.find(i => i.id === id);
                    if (inv) setPayAmount(Number(inv.remainingAmount || 0));
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner une facture...</option>
                  {invoices
                    .filter(i => i.status === 'APPROUVEE' && Number(i.remainingAmount) > 0)
                    .map(i => (
                      <option key={i.id} value={i.id}>
                        {i.internalReference} — {i.supplierName} (Reste : {formatCurrencyDA(i.remainingAmount, false)})
                      </option>
                    ))}
                </select>
                {activePayInvoice && (
                  <div className="text-[11px] text-slate-500 p-2 bg-slate-50 rounded border border-slate-200 space-y-0.5 mt-1">
                    <div className="flex justify-between">
                      <span>Fournisseur :</span>
                      <span className="font-semibold">{activePayInvoice.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Montant TTC :</span>
                      <span className="font-mono">{formatCurrencyDA(activePayInvoice.amountTTC, false)}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Reste à payer :</span>
                      <span className="font-mono">{formatCurrencyDA(activePayInvoice.remainingAmount, false)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Compte Bancaire Émetteur */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Compte Bancaire Émetteur (Débit) *
                </label>
                <select
                  value={payAccountId}
                  onChange={e => setPayAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner un compte bancaire...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name} (Solde : {formatCurrencyDA(a.currentBalance, false)})
                    </option>
                  ))}
                </select>
                {activePayAccount && (
                  <div className="text-[11px] text-slate-500 flex justify-between px-1">
                    <span>Solde disponible :</span>
                    <span className="font-bold font-mono text-[#0B207D]">
                      {formatCurrencyDA(activePayAccount.currentBalance, false)}
                    </span>
                  </div>
                )}
              </div>

              {/* Montant Règlement */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Montant à Régler (DZD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={payAmount || ''}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 pr-10 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">DA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Réf Virement / Chèque
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    placeholder="Ex: OV-FOURN-0991"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date de Règlement *
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {paySubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Exécuter le Paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : APPROBATION SOUS DÉROGATION */}
      {/* ========================================================================= */}
      {showDerogationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Approbation Managériale SoD (Dérogation)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Validation exceptionnelle d'une facture présentant un écart ou un dépassement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDerogationModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {derogationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{derogationError}</span>
              </div>
            )}

            <form onSubmit={handleApproveDerogation} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div>Facture: <strong className="font-mono text-[#0B207D]">{activeDerogationInvoice?.internalReference}</strong></div>
                <div>Fournisseur: <strong>{activeDerogationInvoice?.supplierName}</strong></div>
                <div>Montant HT: <strong className="font-mono">{formatCurrencyDA(activeDerogationInvoice?.amountHT || 0, false)}</strong></div>
                <div>Statut 3-Way: <strong>{activeDerogationInvoice?.matchingStatus}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Motif Obligatoire de Dérogation Managériale *
                </label>
                <textarea
                  rows={3}
                  value={derogationReason}
                  onChange={e => setDerogationReason(e.target.value)}
                  placeholder="Ex: Écart de prix validé par la Direction Générale suite à la hausse matières premières..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDerogationModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={derogationSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {derogationSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Valider l'Approbation SoD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : REJET / ANNULATION FACTURE FOURNISSEUR */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rejeter / Annuler Facture Fournisseur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clôture en anomalie et libération des lignes de commande
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{cancelError}</span>
              </div>
            )}

            <form onSubmit={handleCancelInvoice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Motif du Rejet / Litige *
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Ex: Facture erronée, marchandises non livrées..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {cancelSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
