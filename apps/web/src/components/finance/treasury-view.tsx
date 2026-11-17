'use client';

import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Wallet,
  Building2,
  Calendar,
  X,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrencyDA } from '@silex/shared';
import { api } from '@/lib/api-client';
import { FinancialAccountSummary } from './accounts-summary-widget';
import { CashTransactionItem } from './recent-transactions-widget';

interface TreasuryViewProps {
  accounts: FinancialAccountSummary[];
  transactions: CashTransactionItem[];
  canManage: boolean;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export function TreasuryView({
  accounts = [],
  transactions = [],
  canManage,
  onRefresh,
  onNotify,
}: TreasuryViewProps) {
  // Selected Account for filtering transactions
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Transaction Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flowTypeFilter, setFlowTypeFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState<boolean>(false);
  const [showDirectTxModal, setShowDirectTxModal] = useState<boolean>(false);

  // Transfer Form State
  const [transferSrcId, setTransferSrcId] = useState<string>('');
  const [transferDstId, setTransferDstId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferRef, setTransferRef] = useState<string>('');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [transferSubmitting, setTransferSubmitting] = useState<boolean>(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // New Account Form State
  const [accCode, setAccCode] = useState<string>('');
  const [accName, setAccName] = useState<string>('');
  const [accType, setAccType] = useState<string>('BANQUE_COURANT');
  const [accBankName, setAccBankName] = useState<string>('Banque Extérieure d\'Algérie (BEA)');
  const [accRib, setAccRib] = useState<string>('');
  const [accInitialBalance, setAccInitialBalance] = useState<number>(0);
  const [accNotes, setAccNotes] = useState<string>('');
  const [accSubmitting, setAccSubmitting] = useState<boolean>(false);
  const [accError, setAccError] = useState<string | null>(null);

  // Direct Tx Form State
  const [txAccountId, setTxAccountId] = useState<string>('');
  const [txType, setTxType] = useState<string>('ENCAISSEMENT');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txRef, setTxRef] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('');
  const [txNotes, setTxNotes] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txSubmitting, setTxSubmitting] = useState<boolean>(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Calculated Totals
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (Number(a.currentBalance) || 0), 0);
  }, [accounts]);

  const bankBalance = useMemo(() => {
    return accounts
      .filter(a => a.type === 'BANQUE_COURANT' || a.type === 'BANQUE' || a.type === 'BANQUE_INVESTISSEMENT')
      .reduce((acc, a) => acc + (Number(a.currentBalance) || 0), 0);
  }, [accounts]);

  const cashBalance = useMemo(() => {
    return accounts
      .filter(a => a.type === 'CAISSE_SIEGE' || a.type === 'CAISSE' || a.type === 'CAISSE_CHANTIER')
      .reduce((acc, a) => acc + (Number(a.currentBalance) || 0), 0);
  }, [accounts]);

  // Selected Source Account for live transfer validation
  const sourceAccount = useMemo(() => {
    return accounts.find(a => a.id === transferSrcId);
  }, [accounts, transferSrcId]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Account Filter
      if (selectedAccountId !== 'ALL') {
        const matchesAccount = t.accountId === selectedAccountId || t.counterpartAccountId === selectedAccountId;
        if (!matchesAccount) return false;
      }

      // 2. Flow Type Filter
      if (flowTypeFilter !== 'ALL') {
        if (flowTypeFilter === 'ENCAISSEMENT') {
          if (!['ENCAISSEMENT_CLIENT', 'ENCAISSEMENT', 'VIREMENT_INTERNE_RECU', 'LIBERATION_RETENUE_GARANTIE'].includes(t.type)) {
            return false;
          }
        } else if (flowTypeFilter === 'DECAISSEMENT') {
          if (!['DECAISSEMENT_FOURNISSEUR', 'DECAISSEMENT', 'VIREMENT_INTERNE_EMIS', 'PAIEMENT_FOURNISSEUR'].includes(t.type)) {
            return false;
          }
        } else if (flowTypeFilter === 'VIREMENT_INTERNE') {
          if (!['VIREMENT_INTERNE', 'VIREMENT_INTERNE_EMIS', 'VIREMENT_INTERNE_RECU'].includes(t.type)) {
            return false;
          }
        } else if (flowTypeFilter === 'SALAIRES_CHARGES') {
          if (!['PAIEMENT_SALAIRES', 'PAIEMENT_CHARGES_SOCIALES'].includes(t.type)) {
            return false;
          }
        } else if (flowTypeFilter === 'FRAIS_BANCAIRES') {
          if (t.type !== 'FRAIS_BANCAIRES') {
            return false;
          }
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          (t.transactionNumber && t.transactionNumber.toLowerCase().includes(q)) ||
          (t.referenceDocument && t.referenceDocument.toLowerCase().includes(q)) ||
          (t.accountCode && t.accountCode.toLowerCase().includes(q)) ||
          (t.counterpartAccountCode && t.counterpartAccountCode.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // 4. Date Range
      if (startDate) {
        const txDate = t.createdAt ? t.createdAt.split('T')[0] : '';
        if (txDate && txDate < startDate) return false;
      }
      if (endDate) {
        const txDate = t.createdAt ? t.createdAt.split('T')[0] : '';
        if (txDate && txDate > endDate) return false;
      }

      return true;
    });
  }, [transactions, selectedAccountId, flowTypeFilter, searchQuery, startDate, endDate]);

  // Aggregate stats on filtered transactions
  const { totalCredits, totalDebits } = useMemo(() => {
    let credits = 0;
    let debits = 0;
    filteredTransactions.forEach(t => {
      const isCredit = ['ENCAISSEMENT_CLIENT', 'ENCAISSEMENT', 'VIREMENT_INTERNE_RECU', 'LIBERATION_RETENUE_GARANTIE'].includes(t.type);
      if (isCredit) {
        credits += Number(t.amount || 0);
      } else {
        debits += Number(t.amount || 0);
      }
    });
    return { totalCredits: credits, totalDebits: debits };
  }, [filteredTransactions]);

  // Helper type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BANQUE_COURANT':
      case 'BANQUE':
        return <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#0B207D] border border-blue-200">Compte Courant</span>;
      case 'BANQUE_INVESTISSEMENT':
        return <span className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">Investissement</span>;
      case 'CAISSE_SIEGE':
      case 'CAISSE':
        return <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">Caisse Siège</span>;
      case 'CAISSE_CHANTIER':
        return <span className="rounded bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800 border border-orange-200">Régie Chantier</span>;
      default:
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{type}</span>;
    }
  };

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'ENCAISSEMENT_CLIENT':
      case 'ENCAISSEMENT':
        return 'Encaissement Client';
      case 'DECAISSEMENT_FOURNISSEUR':
      case 'DECAISSEMENT':
        return 'Règlement Fournisseur';
      case 'VIREMENT_INTERNE':
        return 'Virement Interne';
      case 'VIREMENT_INTERNE_EMIS':
        return 'Virement Interne (Émis)';
      case 'VIREMENT_INTERNE_RECU':
        return 'Virement Interne (Reçu)';
      case 'PAIEMENT_SALAIRES':
        return 'Salaires & Paie';
      case 'PAIEMENT_CHARGES_SOCIALES':
        return 'Charges Sociales & Fiscales';
      case 'FRAIS_BANCAIRES':
        return 'Frais & Agios Bancaires';
      case 'LIBERATION_RETENUE_GARANTIE':
        return 'Libération Retenue Garantie';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const isIncoming = (type: string) => {
    return [
      'ENCAISSEMENT_CLIENT',
      'VIREMENT_INTERNE_RECU',
      'LIBERATION_RETENUE_GARANTIE',
      'ENCAISSEMENT',
    ].includes(type);
  };

  // Handler: Execute Internal Transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    if (!transferSrcId || !transferDstId) {
      setTransferError('Veuillez sélectionner un compte émetteur et un compte destinataire.');
      return;
    }
    if (transferSrcId === transferDstId) {
      setTransferError('Le compte destinataire doit être différent du compte émetteur.');
      return;
    }
    if (transferAmount <= 0) {
      setTransferError('Le montant du virement doit être strictement supérieur à zéro.');
      return;
    }
    if (sourceAccount && Number(sourceAccount.currentBalance) < transferAmount) {
      setTransferError(`Solde insuffisant sur le compte émetteur (${formatCurrencyDA(sourceAccount.currentBalance, false)}).`);
      return;
    }

    try {
      setTransferSubmitting(true);
      await api.post('/finance/transactions/transfer', {
        sourceAccountId: transferSrcId,
        destinationAccountId: transferDstId,
        amount: Number(transferAmount),
        referenceDocument: transferRef || `VIR-${Date.now().toString().slice(-6)}`,
        notes: transferNotes || 'Virement de trésorerie interne',
      });

      setShowTransferModal(false);
      setTransferAmount(0);
      setTransferRef('');
      setTransferNotes('');
      onNotify(`Virement interne de ${formatCurrencyDA(transferAmount, false)} exécuté avec succès.`);
      await onRefresh();
    } catch (err: any) {
      setTransferError(err.message || 'Erreur lors de l\'exécution du virement interne');
    } finally {
      setTransferSubmitting(false);
    }
  };

  // Handler: Create Financial Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccError(null);

    if (!accCode.trim() || !accName.trim()) {
      setAccError('Le code et le libellé du compte sont obligatoires.');
      return;
    }

    try {
      setAccSubmitting(true);
      await api.post('/finance/accounts', {
        code: accCode.trim().toUpperCase(),
        name: accName.trim(),
        type: accType,
        bankName: accBankName.trim(),
        ribNumber: accRib.trim() || undefined,
        initialBalance: Number(accInitialBalance) || 0,
        currency: 'DZD',
        notes: accNotes.trim() || undefined,
      });

      setShowNewAccountModal(false);
      setAccCode('');
      setAccName('');
      setAccRib('');
      setAccInitialBalance(0);
      setAccNotes('');
      onNotify(`Compte financier "${accCode.toUpperCase()}" créé avec succès.`);
      await onRefresh();
    } catch (err: any) {
      setAccError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setAccSubmitting(false);
    }
  };

  // Handler: Record Direct Cash Transaction
  const handleRecordDirectTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError(null);

    if (!txAccountId) {
      setTxError('Veuillez sélectionner un compte financier.');
      return;
    }
    if (txAmount <= 0) {
      setTxError('Le montant doit être strictement supérieur à zéro.');
      return;
    }

    try {
      setTxSubmitting(true);
      await api.post('/finance/transactions', {
        accountId: txAccountId,
        type: txType,
        amount: Number(txAmount),
        referenceDocument: txRef || `TX-${Date.now().toString().slice(-6)}`,
        category: txCategory || 'Opération diverse de trésorerie',
        notes: txNotes,
        transactionDate: txDate,
      });

      setShowDirectTxModal(false);
      setTxAmount(0);
      setTxRef('');
      setTxCategory('');
      setTxNotes('');
      onNotify(`Écriture de trésorerie (${formatCurrencyDA(txAmount, false)}) enregistrée avec succès.`);
      await onRefresh();
    } catch (err: any) {
      setTxError(err.message || 'Erreur lors de l\'enregistrement de l\'écriture');
    } finally {
      setTxSubmitting(false);
    }
  };

  // Handler: Export CSV Ledger
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'N° Piece',
      'Compte',
      'Contrepartie',
      'Nature',
      'Sens',
      'Piece Justificative',
      'Montant DA',
      'Statut',
      'Notes'
    ];

    const rows = filteredTransactions.map(t => {
      const incoming = isIncoming(t.type);
      const dateStr = t.createdAt ? t.createdAt.split('T')[0] : '';
      return [
        `"${dateStr}"`,
        `"${t.transactionNumber || ''}"`,
        `"${t.accountCode || ''}"`,
        `"${t.counterpartAccountCode || ''}"`,
        `"${getTxTypeLabel(t.type)}"`,
        incoming ? '"CREDIT"' : '"DEBIT"',
        `"${(t.referenceDocument || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${t.status || 'VALIDE'}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JOURNAL_TRESORERIE_SILEX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Liquidités */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Trésorerie Globale Nette
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#07164D]">
            {formatCurrencyDA(totalBalance, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {accounts.length} comptes actifs (banques et régies)
          </p>
        </div>

        {/* Banques Commerciales */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Banques Commerciales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D] border border-blue-100">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#0B207D]">
            {formatCurrencyDA(bankBalance, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            BEA, BNA & Comptes d'Investissement
          </p>
        </div>

        {/* Caisses & Régies */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Caisses & Régies Chantiers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-900">
            {formatCurrencyDA(cashBalance, false)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Fonds de roulement et dépenses sur site
          </p>
        </div>

        {/* Total Écritures du Journal */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Écritures & Mouvements
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {filteredTransactions.length} <span className="text-sm font-normal text-slate-500">/ {transactions.length} flux</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Grand livre synchronisé
          </p>
        </div>
      </div>

      {/* 2. Action Bar with SoD Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#0B207D]" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Gestion de Trésorerie & Comptes Opérationnels
            </h2>
            <p className="text-xs text-slate-500">
              Contrôle strict des flux, virements de trésorerie interne et traçabilité SoD
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Internal Transfer Modal Trigger */}
          <button
            onClick={() => {
              if (accounts.length >= 2) {
                setTransferSrcId(accounts[0].id);
                setTransferDstId(accounts[1].id);
              }
              setShowTransferModal(true);
            }}
            disabled={!canManage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
              canManage
                ? 'bg-[#0B207D] text-white hover:bg-[#07164D]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Exécuter un virement compte à compte'}
          >
            <Repeat className="h-3.5 w-3.5" />
            Virement Interne
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* New Account Trigger */}
          <button
            onClick={() => setShowNewAccountModal(true)}
            disabled={!canManage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              canManage
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Ouvrir un nouveau compte bancaire ou caisse'}
          >
            <Plus className="h-3.5 w-3.5" />
            Nouveau Compte
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Direct Transaction Trigger */}
          <button
            onClick={() => {
              if (accounts.length > 0) setTxAccountId(accounts[0].id);
              setShowDirectTxModal(true);
            }}
            disabled={!canManage}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-xs ${
              canManage
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
            title={!canManage ? 'Action réservée au DAF et à la DG' : 'Saisir une écriture directe (frais bancaires, régularisation)'}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Écriture Directe
            {!canManage && <Lock className="h-3 w-3 ml-1 text-slate-400" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Exporter le journal filtré au format CSV (Excel compatible)"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* 3. Accounts Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Comptes Bancaires & Caisses ({accounts.length})
          </h3>
          {selectedAccountId !== 'ALL' && (
            <button
              onClick={() => setSelectedAccountId('ALL')}
              className="text-xs text-[#0B207D] hover:underline font-semibold flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Réinitialiser le filtre de compte
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map(acc => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(isSelected ? 'ALL' : acc.id)}
                className={`relative rounded-xl border p-4 bg-white cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-[#0B207D] ring-2 ring-[#0B207D]/10 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Account Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {acc.code}
                      </span>
                      {acc.isDemoAccount ? (
                        <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200">
                          DÉMO
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate max-w-[180px]" title={acc.name}>
                      {acc.name}
                    </div>
                  </div>
                  {getTypeBadge(acc.type)}
                </div>

                {/* Bank / RIB details */}
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1 truncate text-[11px]" title={acc.bankName}>
                    <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{acc.bankName || 'Caisse Interne'}</span>
                  </div>

                  {/* RIB */}
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
                    {acc.isRibMasked ? (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Lock className="h-3 w-3 text-slate-400" />
                        {acc.ribNumber || '•••• •••• •••• •••• 0000'}
                      </span>
                    ) : (
                      <span className="truncate">{acc.ribNumber || 'Non renseigné'}</span>
                    )}
                  </div>
                </div>

                {/* Balance & Selection pill */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Solde Réel</div>
                    <div className="text-base font-bold text-[#07164D]">
                      {formatCurrencyDA(acc.currentBalance, false)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      isSelected
                        ? 'bg-[#0B207D] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Filtré' : 'Filtrer'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Grand Livre des Mouvements (Journal) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Grand Livre des Mouvements de Trésorerie
            </h3>
            <p className="text-xs text-slate-500">
              Journal des décaissements, encaissements et virements compte à compte
            </p>
          </div>

          {/* Period net flow summary */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Entrées: <strong>+{formatCurrencyDA(totalCredits, false)}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>Sorties: <strong>-{formatCurrencyDA(totalDebits, false)}</strong></span>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher réf, pièce, note..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D]"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Tous les comptes ({accounts.length})</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Flow Type Filter */}
          <div>
            <select
              value={flowTypeFilter}
              onChange={e => setFlowTypeFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] bg-white text-slate-700"
            >
              <option value="ALL">Toutes les natures de flux</option>
              <option value="ENCAISSEMENT">Encaissements Clients (+)</option>
              <option value="DECAISSEMENT">Règlements Fournisseurs (-)</option>
              <option value="VIREMENT_INTERNE">Virements Internes (↔)</option>
              <option value="SALAIRES_CHARGES">Salaires & Charges (-)</option>
              <option value="FRAIS_BANCAIRES">Frais Bancaires (-)</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] text-slate-700"
              title="Date de début"
            />
          </div>

          {/* End Date & Reset */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B207D] text-slate-700"
              title="Date de fin"
            />
            {(searchQuery || selectedAccountId !== 'ALL' || flowTypeFilter !== 'ALL' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAccountId('ALL');
                  setFlowTypeFilter('ALL');
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

        {/* Transactions Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">N° Pièce</th>
                  <th className="py-2.5 px-3">Compte(s)</th>
                  <th className="py-2.5 px-3">Nature du Mouvement</th>
                  <th className="py-2.5 px-3">Pièce Justificative</th>
                  <th className="py-2.5 px-3 text-right">Débit (Sortie)</th>
                  <th className="py-2.5 px-3 text-right">Crédit (Entrée)</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-700">Aucun mouvement de trésorerie trouvé</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Modifiez vos critères de recherche ou réinitialisez les filtres.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(t => {
                    const incoming = isIncoming(t.type);
                    const isTransfer = t.type.includes('VIREMENT_INTERNE');
                    const dateFormatted = t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString('fr-DZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* Transaction Number */}
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {t.transactionNumber || '—'}
                        </td>

                        {/* Accounts Involved */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0B207D]">
                              {t.accountCode}
                            </span>
                            {t.counterpartAccountCode && (
                              <>
                                <ArrowRight className="h-3 w-3 text-slate-400" />
                                <span className="font-mono font-bold text-slate-600">
                                  {t.counterpartAccountCode}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Nature of Transaction */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {incoming ? (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            ) : isTransfer ? (
                              <Repeat className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            )}
                            <span className="font-medium text-slate-800">
                              {getTxTypeLabel(t.type)}
                            </span>
                          </div>
                          {t.notes && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              {t.notes}
                            </div>
                          )}
                        </td>

                        {/* Reference Document */}
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {t.referenceDocument || '—'}
                        </td>

                        {/* Debit (Sortie) */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-rose-600">
                          {!incoming ? formatCurrencyDA(t.amount, false) : '—'}
                        </td>

                        {/* Credit (Entrée) */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap text-emerald-600">
                          {incoming ? formatCurrencyDA(t.amount, false) : '—'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {t.status || 'VALIDE'}
                          </span>
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
      {/* MODAL 1 : VIREMENT INTERNE COMPTE À COMPTE */}
      {/* ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Virement Interne Compte à Compte
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transfert de liquidités entre comptes SILEX (Banques et Caisses)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              {/* Compte Émetteur */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Compte Émetteur (Débit) *
                </label>
                <select
                  value={transferSrcId}
                  onChange={e => setTransferSrcId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner le compte émetteur...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name} (Solde : {formatCurrencyDA(a.currentBalance, false)})
                    </option>
                  ))}
                </select>
                {sourceAccount && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                    <span>Solde disponible :</span>
                    <span className="font-bold font-mono text-[#0B207D]">
                      {formatCurrencyDA(sourceAccount.currentBalance, false)}
                    </span>
                  </div>
                )}
              </div>

              {/* Compte Destinataire */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Compte Destinataire (Crédit) *
                </label>
                <select
                  value={transferDstId}
                  onChange={e => setTransferDstId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                  required
                >
                  <option value="">Sélectionner le compte destinataire...</option>
                  {accounts
                    .filter(a => a.id !== transferSrcId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name} (Solde : {formatCurrencyDA(a.currentBalance, false)})
                      </option>
                    ))}
                </select>
              </div>

              {/* Montant DA */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Montant du Virement (DZD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={transferAmount || ''}
                    onChange={e => setTransferAmount(Number(e.target.value))}
                    placeholder="Ex: 500000"
                    className="w-full p-2 pr-12 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                    DA
                  </span>
                </div>
              </div>

              {/* Référence & Motif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Référence Ordre de Virement
                  </label>
                  <input
                    type="text"
                    value={transferRef}
                    onChange={e => setTransferRef(e.target.value)}
                    placeholder="Ex: OV-2026-003"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Motif / Justification
                  </label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={e => setTransferNotes(e.target.value)}
                    placeholder="Ex: Alimentation régie chantier"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0B207D] text-white hover:bg-[#07164D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {transferSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Exécuter le Virement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : NOUVEAU COMPTE FINANCIER */}
      {/* ========================================================================= */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nouveau Compte Financier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Création d'un compte bancaire ou d'une caisse de régie
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {accError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{accError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Code Interne *
                  </label>
                  <input
                    type="text"
                    value={accCode}
                    onChange={e => setAccCode(e.target.value.toUpperCase())}
                    placeholder="Ex: BEA-EXP-02"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Type de Compte *
                  </label>
                  <select
                    value={accType}
                    onChange={e => setAccType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    <option value="BANQUE_COURANT">Compte Courant Commercial</option>
                    <option value="BANQUE_INVESTISSEMENT">Compte d'Investissement</option>
                    <option value="CAISSE_SIEGE">Caisse Centrale Siège</option>
                    <option value="CAISSE_CHANTIER">Régie de Chantier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Libellé du Compte *
                </label>
                <input
                  type="text"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  placeholder="Ex: BEA Agence Principale Alger"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Établissement / Banque
                  </label>
                  <input
                    type="text"
                    value={accBankName}
                    onChange={e => setAccBankName(e.target.value)}
                    placeholder="Ex: BEA, BNA, BADR..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Solde Initial (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={accInitialBalance || ''}
                    onChange={e => setAccInitialBalance(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Numéro RIB Bancaire (20 chiffres)
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={accRib}
                  onChange={e => setAccRib(e.target.value)}
                  placeholder="Ex: 002 00012 1234567890 12"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Notes ou Emplacement
                </label>
                <input
                  type="text"
                  value={accNotes}
                  onChange={e => setAccNotes(e.target.value)}
                  placeholder="Ex: Détenue par le conducteur de travaux"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={accSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0B207D] text-white hover:bg-[#07164D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {accSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : ÉCRITURE DIRECTE DE TRÉSORERIE */}
      {/* ========================================================================= */}
      {showDirectTxModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B207D]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Saisie d'une Écriture Directe
                  </h3>
                  <p className="text-xs text-slate-500">
                    Frais bancaires, régularisations, charges et menues dépenses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectTxModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {txError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{txError}</span>
              </div>
            )}

            <form onSubmit={handleRecordDirectTx} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Compte Concerné *
                  </label>
                  <select
                    value={txAccountId}
                    onChange={e => setTxAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    <option value="">Sélectionner un compte...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nature de l'Écriture *
                  </label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B207D]"
                    required
                  >
                    <option value="ENCAISSEMENT">Encaissement Direct (Crédit +)</option>
                    <option value="DECAISSEMENT">Décaissement Divers (Débit -)</option>
                    <option value="FRAIS_BANCAIRES">Frais & Agios Bancaires (Débit -)</option>
                    <option value="PAIEMENT_CHARGES_SOCIALES">Charges Sociales / Fiscales (Débit -)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Montant (DZD) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={txAmount || ''}
                      onChange={e => setTxAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-2 pr-10 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#0B207D]"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">DA</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Date de Valeur *
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Pièce Justificative / Réf
                  </label>
                  <input
                    type="text"
                    value={txRef}
                    onChange={e => setTxRef(e.target.value)}
                    placeholder="Ex: BORD-2026-091"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    placeholder="Ex: Frais de tenue de compte"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Notes / Libellé Complémentaire
                </label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={e => setTxNotes(e.target.value)}
                  placeholder="Ex: Débit trimestriel BEA agence Alger"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0B207D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDirectTxModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={txSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0B207D] text-white hover:bg-[#07164D] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {txSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Valider l'Écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
