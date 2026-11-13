# MODÉLISATION DES DONNÉES FINANCIÈRES — PHASE 6B
## Spécification Technique & Entités Métier

### 1. Entité : Compte Financier (`FinancialAccount`)

```typescript
export interface StoredFinancialAccount {
  id: string;
  code: string; // Ex: DEMO-CPT-01, CPT-BEA-01
  name: string; // Ex: Compte Courant Exploitation BEA
  type: 'BANQUE_COURANT' | 'BANQUE_INVESTISSEMENT' | 'CAISSE_SIEGE' | 'CAISSE_CHANTIER';
  bankName: string;
  ribNumber: string;
  currency: 'DZD' | 'EUR' | 'USD';
  initialBalance: number;
  currentBalance: number;
  isDemoAccount: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Entité : Flux de Trésorerie (`CashTransaction`)

```typescript
export type CashTransactionType =
  | 'ENCAISSEMENT_CLIENT'
  | 'DECAISSEMENT_FOURNISSEUR'
  | 'PAIEMENT_SALAIRES'
  | 'PAIEMENT_CHARGES_SOCIALES'
  | 'VIREMENT_INTERNE_EMIS'
  | 'VIREMENT_INTERNE_RECU'
  | 'LIBERATION_RETENUE_GARANTIE'
  | 'FRAIS_BANCAIRES'
  | 'AVANCE_CHANTIER';

export interface StoredCashTransaction {
  id: string;
  transactionNumber: string; // FLX-2026-NNN
  transactionDate: string;
  type: CashTransactionType;
  amount: number;
  accountId: string;
  accountCode: string;
  counterpartAccountId?: string;
  counterpartAccountCode?: string;
  customerInvoiceId?: string;
  customerInvoiceNumber?: string;
  supplierInvoiceId?: string;
  supplierInvoiceNumber?: string;
  projectId?: string;
  projectCode?: string;
  referenceDocument?: string;
  paymentMethod: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'LETTRE_DE_CHANGE';
  category: string;
  notes?: string;
  performedById: string;
  performedByName: string;
  status: 'VALIDE' | 'ANNULE';
  idempotencyKey?: string;
  createdAt: string;
}
```

### 3. Entité : Facture Client (`CustomerInvoice`)

```typescript
export type CustomerInvoiceStatus = 'BROUILLON' | 'EMISE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'LITIGE' | 'ANNULEE';

export interface StoredCustomerInvoice {
  id: string;
  invoiceNumber: string; // FAC-2026-NNN
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
  vatRate: number; // Configurable: 19, 9, 0
  vatAmount: number;
  retentionRate: number; // Configurable: 5, 10, 0
  retentionAmount: number;
  amountTTC: number; // Net exigible = (amountHT - retentionAmount) + vatAmount
  netReceivableAmount: number;
  paidAmount: number;
  remainingAmount: number;
  warrantyHeldAmount: number; // Retenue séquestrée jusqu'à PVRD
  warrantyReleasedAmount: number;
  status: CustomerInvoiceStatus;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 4. Entité : Facture Fournisseur (`SupplierInvoice`)

```typescript
export type SupplierInvoiceMatchingStatus = 'CONFORME_3_WAY' | 'ECART_PRIX' | 'ECART_QUANTITE' | 'SANS_RECEPTION' | 'NON_VERIFIE';
export type SupplierInvoiceStatus = 'A_APPROUVER' | 'APPROUVEE' | 'EN_COURS_DE_PAIEMENT' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'REJETEE';

export interface StoredSupplierInvoice {
  id: string;
  internalReference: string; // FAC-FOU-2026-NNN
  invoiceNumber: string; // Numéro facture externe émise par le fournisseur
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  goodsReceiptId?: string;
  goodsReceiptCode?: string;
  projectId?: string;
  projectCode?: string;
  invoiceDate: string;
  dueDate: string;
  amountHT: number;
  vatRate: number;
  vatAmount: number;
  amountTTC: number;
  paidAmount: number;
  remainingAmount: number;
  matchingStatus: SupplierInvoiceMatchingStatus;
  matchingDetails?: {
    poAmountHT: number;
    grTotalHT: number;
    priceVarianceDA: number;
    qtyVariancePct: number;
    notes?: string;
  };
  approvalThresholdStatus?: 'AUTO_APPROVED' | 'PENDING_PM' | 'PENDING_DG' | 'APPROVED';
  status: SupplierInvoiceStatus;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 5. Entité : Configuration Financière Globale (`FinancialConfig`)

```typescript
export interface StoredFinancialConfig {
  defaultVatRate: number; // 19%
  defaultRetentionRate: number; // 5%
  defaultWarrantyDurationMonths: number; // 12 mois
  pmApprovalThresholdDA: number; // 500,000 DA
  dgApprovalThresholdDA: number; // 2,000,000 DA
  allowedPaymentTermsDays: number[]; // [30, 45, 60, 90]
  vatRegimes: Array<{ code: string; label: string; rate: number }>;
}
```
