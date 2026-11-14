'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrencyDA, SystemRole } from '@silex/shared';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Plus,
  Download,
  ExternalLink,
  ChevronRight,
  Calculator,
  TrendingUp,
  Info,
} from 'lucide-react';

import { FinanceHeader, FinanceTab } from '@/components/finance/finance-header';
import { ExecutiveKpis } from '@/components/finance/executive-kpis';
import { AccountsSummaryWidget, FinancialAccountSummary } from '@/components/finance/accounts-summary-widget';
import { FinancialAlertsWidget, FinancialAlertItem } from '@/components/finance/financial-alerts-widget';
import { RecentTransactionsWidget, CashTransactionItem } from '@/components/finance/recent-transactions-widget';
import { ProjectsMarginSummary, ProjectProfitabilitySummary } from '@/components/finance/projects-margin-summary';

export default function FinanceDashboardPage() {
  const { activeRole } = useAuth();

  const canManageFinances =
    activeRole === SystemRole.RESPONSABLE_FINANCIER ||
    activeRole === SystemRole.DIRECTEUR_GENERAL ||
    activeRole === SystemRole.ADMINISTRATEUR;

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');
  const [includeDemo, setIncludeDemo] = useState<boolean>(true);

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [financeOverview, setFinanceOverview] = useState<any>(null);
  const [accounts, setAccounts] = useState<FinancialAccountSummary[]>([]);
  const [transactions, setTransactions] = useState<CashTransactionItem[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<any[]>([]);
  const [agedTrialBalance, setAgedTrialBalance] = useState<any>(null);

  // Modals state
  const [selectedProjectForDecompte, setSelectedProjectForDecompte] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payProjectId, setPayProjectId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payReference, setPayReference] = useState<string>('');
  const [payBank, setPayBank] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState<string>('');

  const [showWarrantyModal, setShowWarrantyModal] = useState<boolean>(false);
  const [warrantyProjectId, setWarrantyProjectId] = useState<string>('');
  const [warrantyReference, setWarrantyReference] = useState<string>('');
  const [warrantyDate, setWarrantyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [warrantyNotes, setWarrantyNotes] = useState<string>('');

  // Primary data loader
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, accountsRes, txsRes, custInvRes, suppInvRes, atbRes] = await Promise.all([
        api.get<any>(`/finance/overview?includeDemo=${includeDemo}`).catch(e => {
          console.warn('[Finance Dashboard] overview fallback:', e.message);
          return null;
        }),
        api.get<any[]>(`/finance/accounts?includeDemo=${includeDemo}`).catch(e => {
          console.warn('[Finance Dashboard] accounts fallback:', e.message);
          return [];
        }),
        api.get<any[]>('/finance/transactions').catch(e => {
          console.warn('[Finance Dashboard] transactions fallback:', e.message);
          return [];
        }),
        api.get<any[]>('/finance/customer-invoices').catch(e => {
          console.warn('[Finance Dashboard] customer invoices fallback:', e.message);
          return [];
        }),
        api.get<any[]>('/finance/supplier-invoices').catch(e => {
          console.warn('[Finance Dashboard] supplier invoices fallback:', e.message);
          return [];
        }),
        api.get<any>('/finance/aged-trial-balance').catch(e => {
          console.warn('[Finance Dashboard] aged trial balance fallback:', e.message);
          return null;
        }),
      ]);

      setFinanceOverview(overviewRes);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : []);
      setTransactions(Array.isArray(txsRes) ? txsRes : []);
      setCustomerInvoices(Array.isArray(custInvRes) ? custInvRes : []);
      setSupplierInvoices(Array.isArray(suppInvRes) ? suppInvRes : []);
      setAgedTrialBalance(atbRes);

      if (overviewRes?.projects?.length > 0) {
        if (!payProjectId) setPayProjectId(overviewRes.projects[0].id);
        if (!warrantyProjectId) setWarrantyProjectId(overviewRes.projects[0].id);
      }
    } catch (err: any) {
      console.error('Erreur chargement finance dashboard:', err);
      setError(err?.message || 'Erreur lors de la récupération des données financières.');
    } finally {
      setLoading(false);
    }
  }, [includeDemo, payProjectId, warrantyProjectId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, activeRole]);

  // Calculated Top KPIs
  const kpisData = useMemo(() => {
    // Treasury
    const totalTreasury = accounts.reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
    const bankTreasury = accounts
      .filter(a => a.type?.startsWith('BANQUE'))
      .reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);
    const cashTreasury = accounts
      .filter(a => a.type?.startsWith('CAISSE'))
      .reduce((acc, a) => acc + Number(a.currentBalance || 0), 0);

    // Customer Debts (Receivables)
    const customerDebts = customerInvoices.reduce((acc, inv) => acc + Number(inv.remainingAmount ?? (inv.netReceivableAmount - (inv.paidAmount || 0))), 0);
    const now = new Date();
    const customerOverdue = customerInvoices
      .filter(inv => inv.dueDate && new Date(inv.dueDate) < now && (inv.remainingAmount ?? 1) > 0)
      .reduce((acc, inv) => acc + Number(inv.remainingAmount || 0), 0);

    // Supplier Debts
    const supplierDebts = supplierInvoices.reduce((acc, inv) => acc + Number(inv.remainingAmount ?? (inv.amountTTC - (inv.paidAmount || 0))), 0);
    const supplierPendingCount = supplierInvoices.filter(inv => inv.status === 'A_APPROUVER' || inv.status === 'A_VERIFIER').length;
    const supplierDiscrepancyCount = supplierInvoices.filter(inv => inv.matchingStatus === 'ECART_PRIX' || inv.matchingStatus === 'ECART_QUANTITE').length;

    // Warranty retention
    const warrantyHeld = customerInvoices.reduce((acc, inv) => acc + Number(inv.warrantyHeldAmount || inv.retentionAmount || 0), 0);

    // BFR
    const bfrDA = agedTrialBalance?.workingCapitalRequirement?.bfrDA !== undefined
      ? Number(agedTrialBalance.workingCapitalRequirement.bfrDA)
      : customerDebts - supplierDebts;

    return {
      totalTreasury,
      bankTreasury,
      cashTreasury,
      customerDebts,
      customerOverdue,
      customerCount: customerInvoices.length,
      supplierDebts,
      supplierPendingCount,
      supplierDiscrepancyCount,
      warrantyHeld: warrantyHeld || Number(financeOverview?.totals?.warrantyHeld || 0),
      bfrDA,
      bfrStatus: agedTrialBalance?.workingCapitalRequirement?.status || (bfrDA <= 0 ? 'RESSOURCE_NETTE' : 'BESOIN_NET'),
    };
  }, [accounts, customerInvoices, supplierInvoices, agedTrialBalance, financeOverview]);

  // Operational Alerts
  const operationalAlerts = useMemo<FinancialAlertItem[]>(() => {
    const list: FinancialAlertItem[] = [];

    // 1. Supplier discrepancies
    const discrepancyInvoices = supplierInvoices.filter(
      inv => inv.matchingStatus === 'ECART_PRIX' || inv.matchingStatus === 'ECART_QUANTITE'
    );
    discrepancyInvoices.forEach(inv => {
      list.push({
        id: `alert-supp-${inv.id}`,
        type: 'MATCHING_DISCREPANCY',
        severity: 'WARNING',
        title: `Écart de Rapprochement 3-Way (${inv.matchingStatus === 'ECART_PRIX' ? 'Prix' : 'Quantité'})`,
        description: `Facture fournisseur ${inv.supplierName || 'Fournisseur'} en attente de dérogation ou d'avoir.`,
        amount: Number(inv.amountHT || inv.amountTTC || 0),
        reference: inv.invoiceNumber || inv.internalReference,
      });
    });

    // 2. Overdue customer invoices
    const overdueCust = customerInvoices.filter(
      inv => inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.remainingAmount ?? 1) > 0
    );
    overdueCust.forEach(inv => {
      list.push({
        id: `alert-cust-${inv.id}`,
        type: 'OVERDUE_INVOICE',
        severity: 'CRITICAL',
        title: 'Échéance Client Dépassée (> 30j)',
        description: `Facture client ${inv.clientName || 'Client'} non soldée. Recouvrement requis.`,
        amount: Number(inv.remainingAmount || 0),
        reference: inv.invoiceNumber,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('fr-DZ') : undefined,
      });
    });

    // 3. High value invoice requiring DG validation (> 500,000 DA)
    const highValueInvoices = supplierInvoices.filter(
      inv => inv.status === 'A_APPROUVER' && Number(inv.amountHT || 0) > 500000
    );
    highValueInvoices.forEach(inv => {
      list.push({
        id: `alert-dg-${inv.id}`,
        type: 'DG_APPROVAL_REQUIRED',
        severity: 'INFO',
        title: 'Validation Direction Générale Requise (Seuil SoD > 500k DA)',
        description: `Engagement fournisseur supérieur au plafond opérationnel pour ${inv.supplierName || 'Marché'}.`,
        amount: Number(inv.amountHT || 0),
        reference: inv.invoiceNumber || inv.internalReference,
      });
    });

    return list;
  }, [supplierInvoices, customerInvoices]);

  // Analytical projects summary
  const projectsSummary = useMemo<ProjectProfitabilitySummary[]>(() => {
    if (!financeOverview?.projects || !Array.isArray(financeOverview.projects)) {
      return [];
    }
    return financeOverview.projects.map((p: any) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      clientName: p.clientName,
      contractAmount: Number(p.contractAmount || 0),
      budgetAmount: Number(p.budgetAmount || 0),
      committedCost: Number(p.committedCost || 0),
      actualCost: Number(p.actualCost || 0),
      billedAmount: Number(p.billedAmount || 0),
      paidAmount: Number(p.paidAmount || 0),
      marginDA: Math.max(0, Number(p.contractAmount || 0) - Number(p.actualCost || 0)),
      marginRate: p.marginRate || '0.0',
      status: p.status || 'IN_PROGRESS',
    }));
  }, [financeOverview]);

  // Handlers for payments and warranty release
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payProjectId) return;
    try {
      await api.post('/finance/payments', {
        projectId: payProjectId,
        amount: Number(payAmount),
        paymentReference: payReference,
        bankName: payBank,
        paymentDate: payDate,
        notes: payNotes,
      });
      setShowPaymentModal(false);
      setNotification(`Encaissement de ${formatCurrencyDA(payAmount, false)} consigné avec succès (Réf: ${payReference}) ! Trésorerie réactualisée.`);
      setTimeout(() => setNotification(null), 5000);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erreur enregistrement encaissement');
    }
  };

  const handleReleaseWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyProjectId) return;
    try {
      const res = await api.post<any>('/finance/warranty-release', {
        projectId: warrantyProjectId,
        releaseReference: warrantyReference,
        receptionDefinitiveDate: warrantyDate,
        notes: warrantyNotes,
      });
      setShowWarrantyModal(false);
      const releasedAmt = res?.releasedAmount ? ` (${formatCurrencyDA(res.releasedAmount, false)})` : '';
      setNotification(`Retenue de garantie (5%) débloquée avec succès${releasedAmt} suite au PV de réception définitive !`);
      setTimeout(() => setNotification(null), 5000);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erreur déblocage retenue de garantie');
    }
  };

  const handleExportProjectDecompte = (p: any) => {
    const headers = ['Code', 'Marché', 'Client', 'Montant Contractuel HT (DA)', 'Budget Alloué (DA)', 'Engagements BC (DA)', 'Coût Réel (DA)', 'Marge (DA)', 'Taux Marge (%)'];
    const marginDA = Math.max(0, Number(p.contractAmount) - Number(p.actualCost));
    const row = [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.clientName}"`,
      p.contractAmount,
      p.budgetAmount,
      p.committedCost,
      p.actualCost,
      marginDA,
      p.marginRate,
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DECOMPTE_METRE_${p.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-[#07164D] rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B207D]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Sub-Tabs */}
      <FinanceHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'dashboard') {
            setNotification(`L'espace "${tab}" fait partie des sous-phases 6C.2 à 6C.5 en cours de déploiement.`);
            setTimeout(() => setNotification(null), 4000);
          }
        }}
        activeRole={activeRole}
        includeDemo={includeDemo}
        onToggleIncludeDemo={() => setIncludeDemo(prev => !prev)}
        onRefresh={loadDashboardData}
        isLoading={loading}
      />

      {/* RBAC Error / Warning banner */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">Accès ou Chargement Restreint</div>
            <div className="text-xs text-amber-800 mt-0.5">{error}</div>
            <div className="text-[11px] text-amber-700 mt-1">
              Les habilitations financières sont réservées aux rôles <strong>Directeur Général</strong>, <strong>Responsable Financier</strong> et <strong>Administrateur</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Action Bar for DG / DAF */}
      {canManageFinances && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-3.5 h-3.5 text-[#0B207D]" />
            <span>Opérations de trésorerie rapides :</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B207D] text-white rounded hover:bg-[#07164D] transition-colors font-semibold cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Encaisser Situation Client</span>
            </button>
            <button
              onClick={() => setShowWarrantyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-600 text-amber-800 rounded hover:bg-amber-50 transition-colors font-semibold cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Restituer Retenue (5%)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Body */}
      {activeTab === 'dashboard' ? (
        <div className="space-y-5">
          {/* 1. Top Executive KPIs */}
          <ExecutiveKpis
            totalTreasury={kpisData.totalTreasury}
            bankTreasury={kpisData.bankTreasury}
            cashTreasury={kpisData.cashTreasury}
            customerDebts={kpisData.customerDebts}
            customerOverdue={kpisData.customerOverdue}
            customerCount={kpisData.customerCount}
            supplierDebts={kpisData.supplierDebts}
            supplierPendingCount={kpisData.supplierPendingCount}
            supplierDiscrepancyCount={kpisData.supplierDiscrepancyCount}
            warrantyHeld={kpisData.warrantyHeld}
            bfrDA={kpisData.bfrDA}
            bfrStatus={kpisData.bfrStatus}
            isLoading={loading}
          />

          {/* 2. Middle Row: Bank Accounts & Operational Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AccountsSummaryWidget
              accounts={accounts}
              onNavigateTreasury={() => setActiveTab('treasury')}
            />

            <FinancialAlertsWidget
              alerts={operationalAlerts}
              onNavigateAction={(alert) => {
                if (alert.type === 'MATCHING_DISCREPANCY') setActiveTab('matching');
                else if (alert.type === 'OVERDUE_INVOICE') setActiveTab('billing');
              }}
            />
          </div>

          {/* 3. Lower Row: Recent Cash Transactions Journal */}
          <RecentTransactionsWidget
            transactions={transactions}
            onNavigateTransactions={() => setActiveTab('treasury')}
          />

          {/* 4. Bottom Row: Projects Analytical Rentability */}
          <ProjectsMarginSummary
            projects={projectsSummary}
            onNavigateProjects={() => setActiveTab('profitability')}
          />
        </div>
      ) : (
        /* Placeholder view when switching sub-phase tabs */
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
          <Coins className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            Espace {activeTab.toUpperCase()} — Phase suivante
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ce sous-module est planifié dans le cadre des Phases 6C.2 à 6C.5.
            Vous pouvez retourner au <strong>Tableau de Bord Finance</strong> pour consulter les indicateurs consolidés.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-1.5 bg-[#0B207D] text-white rounded text-xs font-semibold hover:bg-[#07164D] transition-colors"
          >
            Retour au Dashboard Finance
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : ENREGISTRER UN ENCAISSEMENT CLIENT (VIREMENT BEA / ACOMPTE) */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#0B207D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Enregistrer un Encaissement Client</h3>
                  <p className="text-[11px] text-slate-500">Règlement de situation de travaux ou acompte contractuel</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chantier / Marché Destinataire *
                </label>
                <select
                  value={payProjectId}
                  onChange={e => setPayProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  {financeOverview?.projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Montant Encaissé Net (DA) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-bold text-[#0B207D]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date de Valeur Virement *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Référence Virement / Chèque *
                  </label>
                  <input
                    type="text"
                    required
                    value={payReference}
                    onChange={e => setPayReference(e.target.value)}
                    placeholder="Ex: VIR-BEA-2026-992"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Établissement Bancaire *
                  </label>
                  <input
                    type="text"
                    required
                    value={payBank}
                    onChange={e => setPayBank(e.target.value)}
                    placeholder="Ex: BEA Arzew / BNA Oran"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observations & Tranche Concernée
                </label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="Ex: Règlement situation mensuelle après décompte contradictoire"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B207D] shrink-0" />
                <span>
                  Synchronisation immédiate : L'avancement financier et le solde bancaire seront actualisés.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B207D] text-white font-bold rounded hover:bg-[#07164D] shadow-xs cursor-pointer"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : RESTITUTION RETENUE DE GARANTIE (5%) */}
      {/* ========================================================================= */}
      {showWarrantyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-[#07164D]">Restitution Retenue de Garantie (5%)</h3>
                  <p className="text-[11px] text-slate-500">Déblocage après PV de Réception Définitive (J+365)</p>
                </div>
              </div>
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReleaseWarranty} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Chantier Éligible à la Réception Définitive *
                </label>
                <select
                  value={warrantyProjectId}
                  onChange={e => setWarrantyProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  {financeOverview?.projects?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} (Retenue 5% : {formatCurrencyDA(Number(p.contractAmount) * 0.05, false)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Réf. PV Réception Définitive *
                  </label>
                  <input
                    type="text"
                    required
                    value={warrantyReference}
                    onChange={e => setWarrantyReference(e.target.value)}
                    placeholder="Ex: PV-RD-2026-044"
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date PV Réception Définitive *
                  </label>
                  <input
                    type="date"
                    required
                    value={warrantyDate}
                    onChange={e => setWarrantyDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attestation de Levée Totale des Réserves *
                </label>
                <textarea
                  rows={2}
                  required
                  value={warrantyNotes}
                  onChange={e => setWarrantyNotes(e.target.value)}
                  placeholder="Ex: Constat d'absence de désordre durant l'année de parfait achèvement"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Conformité Code des Marchés : La caution de 5% est libérée intégralement à l'expiration de la garantie contractuelle.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowWarrantyModal(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 font-semibold text-slate-600 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 text-white font-bold rounded hover:bg-amber-800 shadow-xs cursor-pointer"
                >
                  Libérer la Retenue (5%)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
