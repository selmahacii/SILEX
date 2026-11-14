'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Calendar,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Coins,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';
import { api } from '@/lib/api-client';
import { FinancialAccountSummary } from './accounts-summary-widget';

export interface CustomerInvoiceItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectCode: string;
  projectName?: string;
  workSituationId?: string;
  workSituationNumber?: string;
  commercialQuoteId?: string;
  issueDate: string;
  dueDate: string;
  amountHT: number;
  vatRate: number;
  vatAmount: number;
  retentionRate: number;
  retentionAmount: number;
  amountTTC: number;
  netReceivableAmount: number;
  paidAmount: number;
  remainingAmount: number;
  warrantyHeldAmount: number;
  warrantyReleasedAmount: number;
  status: string;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BillingViewProps {
  invoices: CustomerInvoiceItem[];
  accounts: FinancialAccountSummary[];
  projects: any[];
  canManage: boolean;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
  retentionRateLabel?: string;
}

export function BillingView({
  invoices = [],
  accounts = [],
  projects = [],
  canManage,
  onRefresh,
  onNotify,
  retentionRateLabel = '5%',
}: BillingViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoiceItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Create Invoice Form State
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [createSituationNumber, setCreateSituationNumber] = useState<string>('');
  const [createAmountHT, setCreateAmountHT] = useState<number>(0);
  const [createVatRate, setCreateVatRate] = useState<number>(19);
  const [createRetentionRate, setCreateRetentionRate] = useState<number>(5);
  const [createIssueDate, setCreateIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [createDueDate, setCreateDueDate] = useState<string>(
    new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]
  );
  const [createPaymentTerms, setCreatePaymentTerms] = useState<string>('45 jours fin de mois');
  const [createNotes, setCreateNotes] = useState<string>('');
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Pay Invoice Form State
  const [payInvoiceId, setPayInvoiceId] = useState<string>('');
  const [payAccountId, setPayAccountId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRef, setPayRef] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');
  const [paySubmitting, setPaySubmitting] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Release Warranty Form State
  const [warrantyInvoiceId, setWarrantyInvoiceId] = useState<string>('');
  const [warrantyAccountId, setWarrantyAccountId] = useState<string>('');
  const [warrantyAmount, setWarrantyAmount] = useState<number>(0);
  const [warrantyRef, setWarrantyRef] = useState<string>('');
  const [warrantyNotes, setWarrantyNotes] = useState<string>('');
  const [warrantySubmitting, setWarrantySubmitting] = useState<boolean>(false);
  const [warrantyError, setWarrantyError] = useState<string | null>(null);

  // Selected project for auto-populating rates
  const selectedCreateProject = useMemo(() => {
    return projects.find(p => p.id === createProjectId);
  }, [projects, createProjectId]);

  // Handle project selection change
  const handleSelectProjectForCreate = (projId: string) => {
    setCreateProjectId(projId);
    const p = projects.find(proj => proj.id === projId);
    if (p) {
      if (p.tvaRate !== undefined) setCreateVatRate(Number(p.tvaRate));
      if (p.retentionRate !== undefined) setCreateRetentionRate(Number(p.retentionRate));
    }
  };

  // Real-time calculation for create modal
  const createCalculations = useMemo(() => {
    const ht = Number(createAmountHT || 0);
    const retRate = Number(createRetentionRate || 0);
    const vatR = Number(createVatRate || 0);

    const retAmount = Math.round((ht * retRate) / 100);
    const vatAmount = Math.round((ht * vatR) / 100);
    const netReceivable = (ht - retAmount) + vatAmount;

    return {
      amountHT: ht,
      retentionAmount: retAmount,
      vatAmount,
      netReceivable,
    };
  }, [createAmountHT, createRetentionRate, createVatRate]);

  // Selected Invoice for Payment
  const activePayInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === payInvoiceId);
  }, [invoices, payInvoiceId]);

  // Selected Invoice for Warranty Release
  const activeWarrantyInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === warrantyInvoiceId);
  }, [invoices, warrantyInvoiceId]);

  // Invoices with available warranty retention to release
  const eligibleWarrantyInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const held = Number(inv.warrantyHeldAmount || 0);
      const released = Number(inv.warrantyReleasedAmount || 0);
      return held - released > 0;
    });
  }, [invoices]);

  // Top KPI Stats
  const { totalInvoicedNet, totalReceivables, totalWarrantyHeld, totalOverdueAmount, overdueCount } = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    let billed = 0;
    let rec = 0;
    let war = 0;
    let overdueAmt = 0;
    let odCount = 0;

    invoices.forEach(inv => {
      const net = Number(inv.netReceivableAmount || inv.amountTTC || 0);
      const remaining = Number(inv.remainingAmount ?? (net - Number(inv.paidAmount || 0)));
      const warrantyAvailable = Number(inv.warrantyHeldAmount || 0) - Number(inv.warrantyReleasedAmount || 0);

      billed += net;
      rec += remaining;
      war += Math.max(0, warrantyAvailable);

      const due = inv.dueDate ? inv.dueDate.split('T')[0] : '';
      if (remaining > 0 && due && due < now) {
        overdueAmt += remaining;
        odCount++;
      }
    });

    return {
      totalInvoicedNet: billed,
      totalReceivables: rec,
      totalWarrantyHeld: war,
      totalOverdueAmount: overdueAmt,
      overdueCount: odCount,
    };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    return invoices.filter(inv => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
          (inv.clientName && inv.clientName.toLowerCase().includes(q)) ||
          (inv.projectCode && inv.projectCode.toLowerCase().includes(q)) ||
          (inv.projectName && inv.projectName.toLowerCase().includes(q)) ||
          (inv.workSituationNumber && inv.workSituationNumber.toLowerCase().includes(q)) ||
          (inv.notes && inv.notes.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 2. Project Filter
      if (projectFilter !== 'ALL') {
        if (inv.projectId !== projectFilter && inv.projectCode !== projectFilter) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL') {
        const remaining = Number(inv.remainingAmount ?? 0);
        const due = inv.dueDate ? inv.dueDate.split('T')[0] : '';
        const isOverdue = remaining > 0 && due && due < now;

        if (statusFilter === 'OVERDUE') {
          if (!isOverdue) return false;
        } else if (statusFilter === 'EMISE') {
          if (inv.status !== 'EMISE' || isOverdue) return false;
        } else if (statusFilter === 'PARTIELLEMENT_PAYEE') {
          if (inv.status !== 'PARTIELLEMENT_PAYEE' || isOverdue) return false;
        } else if (statusFilter === 'PAYEE') {
          if (inv.status !== 'PAYEE') return false;
        }
      }

      // 4. Date Range
      if (startDate) {
        const issue = inv.issueDate ? inv.issueDate.split('T')[0] : '';
        if (issue && issue < startDate) return false;
      }
      if (endDate) {
        const issue = inv.issueDate ? inv.issueDate.split('T')[0] : '';
        if (issue && issue > endDate) return false;
      }

      return true;
    });
  }, [invoices, searchQuery, projectFilter, statusFilter, startDate, endDate]);

  // Filtered Totals
  const { filteredBilled, filteredPaid, filteredRemaining } = useMemo(() => {
    let b = 0;
    let p = 0;
    let r = 0;
    filteredInvoices.forEach(inv => {
      const net = Number(inv.netReceivableAmount || inv.amountTTC || 0);
      const paid = Number(inv.paidAmount || 0);
      const rem = Number(inv.remainingAmount ?? (net - paid));
      b += net;
      p += paid;
      r += rem;
    });
    return { filteredBilled: b, filteredPaid: p, filteredRemaining: r };
  }, [filteredInvoices]);

  // Status Badge Helper
  const getStatusBadge = (inv: CustomerInvoiceItem) => {
    const now = new Date().toISOString().split('T')[0];
    const due = inv.dueDate ? inv.dueDate.split('T')[0] : '';
    const remaining = Number(inv.remainingAmount ?? 0);
    const isOverdue = remaining > 0 && due && due < now;

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
          <AlertCircle className="h-3 w-3 text-rose-600" />
          En Retard ({Math.ceil((new Date(now).getTime() - new Date(due).getTime()) / 86400000)}j)
        </span>
      );
    }

    switch (inv.status) {
      case 'PAYEE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Soldée
          </span>
        );
      case 'PARTIELLEMENT_PAYEE':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            Partiellement Payée
          </span>
        );
      case 'EMISE':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0B207D] border border-blue-200">
            <Clock className="h-3 w-3 text-[#0B207D]" />
            Émise (En attente)
          </span>
        );
    }
  };

  // Handler: Create Customer Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createProjectId) {
      setCreateError('Veuillez sélectionner un chantier / projet.');
      return;
    }
    if (createAmountHT <= 0) {
      setCreateError('Le montant des travaux (HT) doit être supérieur à zéro.');
      return;
    }

    try {
      setCreateSubmitting(true);
      const proj = projects.find(p => p.id === createProjectId);
      await api.post('/finance/customer-invoices', {
        projectId: createProjectId,
        projectCode: proj?.code,
        projectName: proj?.name,
        clientId: proj?.clientId || 'cli-001',
        clientName: proj?.clientName || 'Client Industriel',
        workSituationNumber: createSituationNumber.trim() || undefined,
        amountHT: Number(createAmountHT),
        vatRate: Number(createVatRate),
        retentionRate: Number(createRetentionRate),
        issueDate: createIssueDate,
        dueDate: createDueDate,
        paymentTerms: createPaymentTerms,
        notes: createNotes,
      });

      setShowCreateModal(false);
      setCreateAmountHT(0);
      setCreateSituationNumber('');
      setCreateNotes('');
      onNotify(`Facture client émise avec succès (${formatCurrencyDA(createCalculations.netReceivable, false)}).`);
      await onRefresh();
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de l\'émission de la facture client');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handler: Record Customer Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);

    if (!payInvoiceId) {
      setPayError('Facture introuvable.');
      return;
    }
    if (!payAccountId) {
      setPayError('Veuillez sélectionner le compte bancaire récepteur.');
      return;
    }
    if (payAmount <= 0) {
      setPayError('Le montant du paiement doit être supérieur à zéro.');
      return;
    }
    if (activePayInvoice && payAmount > Number(activePayInvoice.remainingAmount)) {
      setPayError(`Le montant dépasse le solde restant dû (${formatCurrencyDA(activePayInvoice.remainingAmount, false)}).`);
      return;
    }

    try {
      setPaySubmitting(true);
      await api.post(`/finance/customer-invoices/${payInvoiceId}/pay`, {
        accountId: payAccountId,
        amount: Number(payAmount),
        referenceDocument: payRef.trim() || `VIR-CLI-${activePayInvoice?.invoiceNumber}`,
        paymentDate: payDate,
        notes: payNotes,
      });

      setShowPayModal(false);
      setPayAmount(0);
      setPayRef('');
      setPayNotes('');
      onNotify(`Encaissement de ${formatCurrencyDA(payAmount, false)} enregistré avec succès sur la facture.`);
      await onRefresh();
    } catch (err: any) {
      setPayError(err.message || 'Erreur lors de l\'enregistrement de l\'encaissement');
    } finally {
      setPaySubmitting(false);
    }
  };

  // Handler: Release Warranty Retention
  const handleReleaseWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarrantyError(null);

    if (!warrantyInvoiceId) {
      setWarrantyError('Facture introuvable.');
      return;
    }
    if (!warrantyAccountId) {
      setWarrantyError('Veuillez sélectionner le compte bancaire récepteur.');
      return;
    }
    if (warrantyAmount <= 0) {
      setWarrantyError('Le montant à libérer doit être supérieur à zéro.');
      return;
    }

    try {
      setWarrantySubmitting(true);
      await api.post(`/finance/customer-invoices/${warrantyInvoiceId}/release-warranty`, {
        accountId: warrantyAccountId,
        amount: Number(warrantyAmount),
        referenceDocument: warrantyRef.trim() || 'PVRD-CONFORME',
        notes: warrantyNotes || 'Libération de la retenue de garantie après réception définitive',
      });

      setShowWarrantyModal(false);
      setWarrantyAmount(0);
      setWarrantyRef('');
      setWarrantyNotes('');
      onNotify(`Retenue de garantie (${formatCurrencyDA(warrantyAmount, false)}) libérée avec succès sur le compte bancaire.`);
      await onRefresh();
    } catch (err: any) {
      setWarrantyError(err.message || 'Erreur lors du déblocage de la retenue de garantie');
    } finally {
      setWarrantySubmitting(false);
    }
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    const headers = [
      'N° Facture',
      'Code Chantier',
      'Marché / Projet',
      'Client',
      'Date Émission',
      'Date Échéance',
      'Montant HT (DA)',
      'Taux TVA (%)',
      'Montant TVA (DA)',
      'Taux Retenue (%)',
      'Montant Retenue (DA)',
      'Net Exigible TTC (DA)',
      'Encaissé (DA)',
      'Reste Dû (DA)',
      'Garantie Restante (DA)',
      'Statut',
      'Conditions'
    ];

    const rows = filteredInvoices.map(inv => {
      const issue = inv.issueDate ? inv.issueDate.split('T')[0] : '';
      const due = inv.dueDate ? inv.dueDate.split('T')[0] : '';
      const net = Number(inv.netReceivableAmount || inv.amountTTC || 0);
      const paid = Number(inv.paidAmount || 0);
      const rem = Number(inv.remainingAmount ?? (net - paid));
      const warAvailable = Math.max(0, Number(inv.warrantyHeldAmount || 0) - Number(inv.warrantyReleasedAmount || 0));

      return [
        `"${inv.invoiceNumber}"`,
        `"${inv.projectCode || ''}"`,
        `"${(inv.projectName || '').replace(/"/g, '""')}"`,
        `"${(inv.clientName || '').replace(/"/g, '""')}"`,
        `"${issue}"`,
        `"${due}"`,
        inv.amountHT,
        inv.vatRate,
        inv.vatAmount,
        inv.retentionRate,
        inv.retentionAmount,
        net,
        paid,
        rem,
        warAvailable,
        `"${inv.status}"`,
        `"${(inv.paymentTerms || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FACTURIER_CLIENTS_SILEX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Facturé Net */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Facturé Exigible
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D] border border-blue-100">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#07164D]">
            {formatCurrencyDA(totalInvoicedNet, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {invoices.length} situations et factures émises
          </p>
        </div>

        {/* Encours Créances Clients */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Créances à Recouvrer
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
            {formatCurrencyDA(totalReceivables, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Solde net exigible restant dû par les maîtres d'ouvrage
          </p>
        </div>

        {/* Retenues de Garantie en Séquestre */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Retenues de Garantie (RG)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-purple-900">
            {formatCurrencyDA(totalWarrantyHeld, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Sous séquestre (taux contractuel : {retentionRateLabel})
          </p>
        </div>

        {/* Échéances en Retard */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Retards de Règlement
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              overdueCount > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${
            overdueCount > 0 ? 'text-rose-600' : 'text-slate-800'
          }`}>
            {formatCurrencyDA(totalOverdueAmount, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {overdueCount} {overdueCount > 1 ? 'factures échues' : 'facture échue'}
          </p>
        </div>
      </div>

      {/* 2. Action Bar with SoD Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#0B207D]" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Facturation Clients & Situations de Travaux BTP
            </h2>
            <p className="text-xs text-slate-500">
              Émission de décomptes, calcul contractuel de la retenue de garantie et encaissements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* New Invoice Trigger */}
          <button
            onClick={() => {
              if (projects.length > 0) handleSelectProjectForCreate(projects[0].id);
              setShowCreateModal(true);
            }}
            disabled={!canManage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
              canManage
                ? 'bg-[#0B207D] text-white hover:bg-[#07164D]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Émettre une nouvelle facture ou situation de travaux'}
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle Situation / Facture
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Quick Payment Trigger */}
          <button
            onClick={() => {
              if (invoices.length > 0) {
                const unpaid = invoices.find(i => Number(i.remainingAmount) > 0) || invoices[0];
                setPayInvoiceId(unpaid.id);
                setPayAmount(Number(unpaid.remainingAmount || 0));
              }
              if (accounts.length > 0) setPayAccountId(accounts[0].id);
              setShowPayModal(true);
            }}
            disabled={!canManage || invoices.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              canManage && invoices.length > 0
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Enregistrer un encaissement sur facture client'}
          >
            <Coins className="h-3.5 w-3.5 text-emerald-600" />
            Encaisser Règlement
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Release Warranty Trigger */}
          <button
            onClick={() => {
              if (eligibleWarrantyInvoices.length > 0) {
                const inv = eligibleWarrantyInvoices[0];
                setWarrantyInvoiceId(inv.id);
                setWarrantyAmount(Number(inv.warrantyHeldAmount || 0) - Number(inv.warrantyReleasedAmount || 0));
              }
              if (accounts.length > 0) setWarrantyAccountId(accounts[0].id);
              setShowWarrantyModal(true);
            }}
            disabled={!canManage || eligibleWarrantyInvoices.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              canManage && eligibleWarrantyInvoices.length > 0
                ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Débloquer une retenue suite au PV de Réception Définitive'}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            Débloquer Retenue PVRD
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Exporter le facturier filtré au format CSV (Excel compatible)"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* 3. Grand Livre & Filtres Multicritères */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Journal du Facturier Clients ({filteredInvoices.length})
            </h3>
            <p className="text-xs text-slate-500">
              Suivi détaillé des situations mensuelles, retenues de garantie et créances recouvrées
            </p>
          </div>

          {/* Filtered Synthesis Bar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sélection :</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Facturé: {formatCurrencyDA(filteredBilled, false)}
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Encaissé: {formatCurrencyDA(filteredPaid, false)}
            </span>
            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Reste Dû: {formatCurrencyDA(filteredRemaining, false)}
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher facture, client, code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EMISE">Émises (En cours)</option>
              <option value="PARTIELLEMENT_PAYEE">Partiellement Payées</option>
              <option value="PAYEE">Soldées / Payées</option>
              <option value="OVERDUE">En Retard d'Échéance (!)</option>
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

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] text-slate-700"
              title="Date d'émission min"
            />
          </div>

          {/* End Date & Reset */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] text-slate-700"
              title="Date d'émission max"
            />
            {(searchQuery || statusFilter !== 'ALL' || projectFilter !== 'ALL' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
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

        {/* Invoices Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3">N° Facture</th>
                  <th className="py-2.5 px-3">Émission / Échéance</th>
                  <th className="py-2.5 px-3">Chantier / Client</th>
                  <th className="py-2.5 px-3 text-right">Montant HT</th>
                  <th className="py-2.5 px-3 text-right">Retenue ({retentionRateLabel})</th>
                  <th className="py-2.5 px-3 text-right">Net Exigible (TTC)</th>
                  <th className="py-2.5 px-3 text-right">Encaissé</th>
                  <th className="py-2.5 px-3 text-right">Reste Dû</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Aucune facture client trouvée</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Modifiez vos filtres ou émettez une nouvelle situation de travaux.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const issueFormatted = inv.issueDate
                      ? new Date(inv.issueDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '—';
                    const dueFormatted = inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '—';

                    const net = Number(inv.netReceivableAmount || inv.amountTTC || 0);
                    const paid = Number(inv.paidAmount || 0);
                    const remaining = Number(inv.remainingAmount ?? (net - paid));
                    const canPay = canManage && remaining > 0;
                    const warrantyAvailable = Math.max(0, Number(inv.warrantyHeldAmount || 0) - Number(inv.warrantyReleasedAmount || 0));
                    const canRelease = canManage && warrantyAvailable > 0;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Invoice Number */}
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0B207D] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{inv.invoiceNumber}</span>
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
                          {inv.workSituationNumber && (
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              {inv.workSituationNumber}
                            </div>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                          <div>Émis : {issueFormatted}</div>
                          <div className="text-slate-400">Échéance : {dueFormatted}</div>
                        </td>

                        {/* Project / Client */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <span className="font-mono text-[11px] text-[#0B207D]">{inv.projectCode}</span>
                            <span className="truncate max-w-[140px]" title={inv.projectName}>{inv.projectName || ''}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]" title={inv.clientName}>
                            {inv.clientName}
                          </div>
                        </td>

                        {/* Amount HT */}
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-slate-700">
                          {formatCurrencyDA(inv.amountHT, false)}
                        </td>

                        {/* Retention */}
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-purple-700">
                          <div>-{formatCurrencyDA(inv.retentionAmount, false)}</div>
                          <div className="text-[10px] text-purple-500 font-sans">
                            {inv.retentionRate}% retenu
                          </div>
                        </td>

                        {/* Net Receivable TTC */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900">
                          {formatCurrencyDA(net, false)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-emerald-600 font-semibold">
                          {paid > 0 ? formatCurrencyDA(paid, false) : '0 DA'}
                        </td>

                        {/* Remaining Amount */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span className={remaining > 0 ? 'text-amber-700' : 'text-slate-400'}>
                            {formatCurrencyDA(remaining, false)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {getStatusBadge(inv)}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* Record Payment Button */}
                            {canPay && (
                              <button
                                onClick={() => {
                                  setPayInvoiceId(inv.id);
                                  setPayAmount(remaining);
                                  if (accounts.length > 0) setPayAccountId(accounts[0].id);
                                  setShowPayModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                title="Encaisser un règlement sur cette facture"
                              >
                                Encaisser
                              </button>
                            )}

                            {/* Release Warranty Button */}
                            {canRelease && (
                              <button
                                onClick={() => {
                                  setWarrantyInvoiceId(inv.id);
                                  setWarrantyAmount(warrantyAvailable);
                                  if (accounts.length > 0) setWarrantyAccountId(accounts[0].id);
                                  setShowWarrantyModal(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition-colors"
                                title={`Débloquer la retenue de garantie (${formatCurrencyDA(warrantyAvailable, false)})`}
                              >
                                Libérer RG
                              </button>
                            )}

                            {/* View Detail Button */}
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowDetailModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                              title="Consulter le détail de la facture"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
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
      {/* MODAL 1 : ÉMISSION D'UNE NOUVELLE FACTURE / SITUATION DE TRAVAUX */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Émission d'une Facture Client / Décompte
                  </h3>
                  <p className="text-xs text-slate-500">
                    Application des conditions contractuelles du marché et calcul de retenue de garantie
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

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Projet / Chantier */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Marché / Chantier BTP *
                </label>
                <select
                  value={createProjectId}
                  onChange={e => handleSelectProjectForCreate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner un chantier...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
                {selectedCreateProject && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                    <span>Client : <strong>{selectedCreateProject.clientName}</strong></span>
                    <span>Montant Marché : <strong>{formatCurrencyDA(selectedCreateProject.contractAmount, false)}</strong></span>
                  </div>
                )}
              </div>

              {/* N° Situation & Montant HT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    N° Décompte / Situation
                  </label>
                  <input
                    type="text"
                    value={createSituationNumber}
                    onChange={e => setCreateSituationNumber(e.target.value)}
                    placeholder="Ex: Situation N° 03"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Montant Travaux Réalisés (HT) *
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
              </div>

              {/* Taux TVA & Retenue de garantie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Taux TVA Légale (%)
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
                  <div className="text-[10px] text-slate-400">Taux légal Algérie : 19% (ou 9% / 0%)</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Retenue de Garantie (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={createRetentionRate}
                    onChange={e => setCreateRetentionRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                  />
                  <div className="text-[10px] text-purple-600 font-medium">Prévalence contractuelle du marché</div>
                </div>
              </div>

              {/* Real-time Calculation Breakdown Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                <div className="font-semibold text-slate-700 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>Décomposition Comptable de la Facture</span>
                  <span className="text-[11px] font-normal text-slate-500">Dinar Algérien (DZD)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Montant HT des travaux :</span>
                  <span className="font-mono">{formatCurrencyDA(createCalculations.amountHT, false)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>Retenue de garantie (-{createRetentionRate}%) :</span>
                  <span className="font-mono">-{formatCurrencyDA(createCalculations.retentionAmount, false)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA Légale (+{createVatRate}%) :</span>
                  <span className="font-mono">+{formatCurrencyDA(createCalculations.vatAmount, false)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span className="text-[#0B207D]">Net Exigible Immédiat :</span>
                  <span className="font-mono text-[#0B207D]">{formatCurrencyDA(createCalculations.netReceivable, false)}</span>
                </div>
              </div>

              {/* Dates & Payment Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date d'Émission *
                  </label>
                  <input
                    type="date"
                    value={createIssueDate}
                    onChange={e => setCreateIssueDate(e.target.value)}
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
                  Notes / Objet de la Facture
                </label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={e => setCreateNotes(e.target.value)}
                  placeholder="Ex: Décompte mensuel travaux de génie civil et pose de charpente"
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
                  Émettre la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : ENREGISTREMENT D'UN ENCAISSEMENT CLIENT (VIREMENT / CHÈQUE) */}
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
                    Enregistrer un Règlement Client
                  </h3>
                  <p className="text-xs text-slate-500">
                    Encaissement d'un acompte ou solde de facture client
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
              {/* Facture à payer */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Facture Client Concernée *
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
                    .filter(i => Number(i.remainingAmount) > 0)
                    .map(i => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} — {i.clientName} (Reste : {formatCurrencyDA(i.remainingAmount, false)})
                      </option>
                    ))}
                </select>
                {activePayInvoice && (
                  <div className="text-[11px] text-slate-500 p-2 bg-slate-50 rounded border border-slate-200 space-y-0.5 mt-1">
                    <div className="flex justify-between">
                      <span>Client :</span>
                      <span className="font-semibold">{activePayInvoice.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projet :</span>
                      <span className="font-semibold">{activePayInvoice.projectCode} — {activePayInvoice.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Exigible :</span>
                      <span className="font-mono">{formatCurrencyDA(activePayInvoice.netReceivableAmount, false)}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-bold">
                      <span>Reste à payer :</span>
                      <span className="font-mono">{formatCurrencyDA(activePayInvoice.remainingAmount, false)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Compte Bancaire Récepteur */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Compte Bancaire Récepteur (Crédit) *
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
                      {a.code} — {a.name} ({a.bankName || 'Banque'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant Règlement */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Montant Encaissé (DZD) *
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

              {/* Réf pièce & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Réf Virement / Chèque
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    placeholder="Ex: VIR-BEA-89410"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date de Valeur *
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Notes
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="Ex: Acompte sur situation N° 2"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                />
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
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : DÉBLOCAGE DE LA RETENUE DE GARANTIE (RÉCEPTION DÉFINITIVE PVRD) */}
      {/* ========================================================================= */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Déblocage de la Retenue de Garantie
                  </h3>
                  <p className="text-xs text-slate-500">
                    Libération des fonds après PV de Réception Définitive (PVRD)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {warrantyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{warrantyError}</span>
              </div>
            )}

            <form onSubmit={handleReleaseWarranty} className="space-y-4">
              {/* Facture concernée */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Facture Client Éligible *
                </label>
                <select
                  value={warrantyInvoiceId}
                  onChange={e => {
                    const id = e.target.value;
                    setWarrantyInvoiceId(id);
                    const inv = eligibleWarrantyInvoices.find(i => i.id === id);
                    if (inv) {
                      setWarrantyAmount(Number(inv.warrantyHeldAmount || 0) - Number(inv.warrantyReleasedAmount || 0));
                    }
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner une facture avec retenue...</option>
                  {eligibleWarrantyInvoices.map(i => {
                    const avail = Number(i.warrantyHeldAmount || 0) - Number(i.warrantyReleasedAmount || 0);
                    return (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} — {i.projectCode} (Retenue dispo : {formatCurrencyDA(avail, false)})
                      </option>
                    );
                  })}
                </select>
                {activeWarrantyInvoice && (
                  <div className="text-[11px] text-slate-500 p-2 bg-purple-50/50 rounded border border-purple-100 space-y-0.5 mt-1">
                    <div className="flex justify-between">
                      <span>Projet :</span>
                      <span className="font-semibold">{activeWarrantyInvoice.projectCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retenue totale prélevée :</span>
                      <span className="font-mono">{formatCurrencyDA(activeWarrantyInvoice.warrantyHeldAmount, false)}</span>
                    </div>
                    <div className="flex justify-between text-purple-800 font-bold">
                      <span>Retenue disponible à libérer :</span>
                      <span className="font-mono">
                        {formatCurrencyDA(
                          Number(activeWarrantyInvoice.warrantyHeldAmount || 0) - Number(activeWarrantyInvoice.warrantyReleasedAmount || 0),
                          false
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Compte Bancaire Récepteur */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Compte Bancaire Récepteur (Crédit) *
                </label>
                <select
                  value={warrantyAccountId}
                  onChange={e => setWarrantyAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner un compte bancaire...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name} ({a.bankName || 'Banque'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant à Débloquer */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Montant à Débloquer (DZD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={warrantyAmount || ''}
                    onChange={e => setWarrantyAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 pr-10 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">DA</span>
                </div>
              </div>

              {/* Réf PV Réception Définitive */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Réf. Procès-Verbal de Réception Définitive (PVRD) *
                </label>
                <input
                  type="text"
                  value={warrantyRef}
                  onChange={e => setWarrantyRef(e.target.value)}
                  placeholder="Ex: PVRD-2026-CH04-SIGNE"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Notes
                </label>
                <input
                  type="text"
                  value={warrantyNotes}
                  onChange={e => setWarrantyNotes(e.target.value)}
                  placeholder="Ex: Clôture de la période de garantie sans réserve"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWarrantyModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={warrantySubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-purple-700 text-white hover:bg-purple-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {warrantySubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Débloquer la Retenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : VOLET DÉTAIL / FICHE FACTURE */}
      {/* ========================================================================= */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Fiche Facture — {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedInvoice.projectCode} • {selectedInvoice.clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400">Date d'émission :</span>
                  <div className="font-semibold text-slate-700">{selectedInvoice.issueDate?.split('T')[0]}</div>
                </div>
                <div>
                  <span className="text-slate-400">Échéance de paiement :</span>
                  <div className="font-semibold text-slate-700">{selectedInvoice.dueDate?.split('T')[0]}</div>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-400">Conditions :</span>
                  <div className="font-semibold text-slate-700">{selectedInvoice.paymentTerms || '45 jours fin de mois'}</div>
                </div>
              </div>

              {/* Financial Decomposition */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Décomposition Financière
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Montant HT des Travaux :</span>
                  <span className="font-mono font-medium">{formatCurrencyDA(selectedInvoice.amountHT, false)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>Retenue de Garantie (-{selectedInvoice.retentionRate}%) :</span>
                  <span className="font-mono font-medium">-{formatCurrencyDA(selectedInvoice.retentionAmount, false)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA Légale (+{selectedInvoice.vatRate}%) :</span>
                  <span className="font-mono font-medium">+{formatCurrencyDA(selectedInvoice.vatAmount, false)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Net Exigible Immédiat :</span>
                  <span className="font-mono text-[#0B207D]">{formatCurrencyDA(selectedInvoice.netReceivableAmount, false)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Total Déjà Encaissé :</span>
                  <span className="font-mono">{formatCurrencyDA(selectedInvoice.paidAmount, false)}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>Reste à Recouvrer :</span>
                  <span className="font-mono">{formatCurrencyDA(selectedInvoice.remainingAmount, false)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-600">
                  <span className="font-semibold">Notes : </span>{selectedInvoice.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
