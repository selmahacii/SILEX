# SPÉCIFICATION TECHNIQUE DES MODÈLES PRISMA — PHASE 6B.2
## Modélisation Relationnelle Additive PostgreSQL / Neon

### 1. Énumérations Financières

```prisma
enum FinancialAccountType {
  BANQUE_COURANT
  BANQUE_INVESTISSEMENT
  CAISSE_SIEGE
  CAISSE_CHANTIER
}

enum CashTransactionType {
  ENCAISSEMENT_CLIENT
  DECAISSEMENT_FOURNISSEUR
  PAIEMENT_SALAIRES
  PAIEMENT_CHARGES_SOCIALES
  VIREMENT_INTERNE_EMIS
  VIREMENT_INTERNE_RECU
  LIBERATION_RETENUE_GARANTIE
  FRAIS_BANCAIRES
  AVANCE_CHANTIER
}

enum CustomerInvoiceStatus {
  BROUILLON
  EMISE
  PARTIELLEMENT_PAYEE
  PAYEE
  LITIGE
  ANNULEE
}

enum SupplierInvoiceStatus {
  A_APPROUVER
  APPROUVEE
  EN_COURS_DE_PAIEMENT
  PARTIELLEMENT_PAYEE
  PAYEE
  REJETEE
}

enum SupplierInvoiceMatchingStatus {
  CONFORME_3_WAY
  ECART_PRIX
  ECART_QUANTITE
  SANS_RECEPTION
  NON_VERIFIE
}
```

---

### 2. Modèles de Données & Relations

#### A. Compte Financier (`FinancialAccount`)
```prisma
model FinancialAccount {
  id             String               @id @default(cuid())
  code           String               @unique // DEMO-CPT-01, CPT-BEA-01
  name           String
  type           FinancialAccountType @default(BANQUE_COURANT)
  bankName       String
  ribNumber      String
  currency       String               @default("DZD")
  initialBalance Decimal              @default(0) @db.Decimal(18, 2)
  currentBalance Decimal              @default(0) @db.Decimal(18, 2)
  isDemoAccount  Boolean              @default(false)
  isActive       Boolean              @default(true)
  notes          String?              @db.Text
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  transactions            CashTransaction[] @relation("AccountTransactions")
  counterpartTransactions CashTransaction[] @relation("CounterpartAccountTransactions")

  @@index([code])
  @@index([isDemoAccount, isActive])
}
```

#### B. Mouvement de Trésorerie (`CashTransaction`)
```prisma
model CashTransaction {
  id                     String              @id @default(cuid())
  transactionNumber      String              @unique // FLX-2026-NNN
  transactionDate        DateTime            @default(now())
  type                   CashTransactionType
  amount                 Decimal             @db.Decimal(18, 2)
  accountId              String
  account                FinancialAccount    @relation("AccountTransactions", fields: [accountId], references: [id])
  accountCode            String
  counterpartAccountId   String?
  counterpartAccount     FinancialAccount?   @relation("CounterpartAccountTransactions", fields: [counterpartAccountId], references: [id])
  counterpartAccountCode String?
  customerInvoiceId      String?
  customerInvoiceNumber  String?
  supplierInvoiceId      String?
  supplierInvoiceNumber  String?
  projectId              String?
  projectCode            String?
  referenceDocument      String?
  paymentMethod          String              @default("VIREMENT")
  category               String
  notes                  String?             @db.Text
  performedById          String
  performedByName        String
  status                 String              @default("VALIDE")
  idempotencyKey         String?             @unique
  createdAt              DateTime            @default(now())

  @@index([accountId])
  @@index([type])
  @@index([transactionDate])
  @@index([idempotencyKey])
}
```

#### C. Facturation Client (`CustomerInvoice`)
```prisma
model CustomerInvoice {
  id                     String                @id @default(cuid())
  invoiceNumber          String                @unique // FAC-2026-NNN
  clientId               String
  clientName             String
  projectId              String
  projectCode            String
  projectName            String?
  workSituationId        String?
  workSituationNumber    String?
  commercialQuoteId      String?
  issueDate              DateTime              @default(now())
  dueDate                DateTime
  amountHT               Decimal               @db.Decimal(18, 2)
  vatRate                Decimal               @default(19) @db.Decimal(5, 2)
  vatAmount              Decimal               @default(0) @db.Decimal(18, 2)
  retentionRate          Decimal               @default(5) @db.Decimal(5, 2)
  retentionAmount        Decimal               @default(0) @db.Decimal(18, 2)
  amountTTC              Decimal               @db.Decimal(18, 2)
  netReceivableAmount    Decimal               @db.Decimal(18, 2)
  paidAmount             Decimal               @default(0) @db.Decimal(18, 2)
  remainingAmount        Decimal               @db.Decimal(18, 2)
  warrantyHeldAmount     Decimal               @default(0) @db.Decimal(18, 2)
  warrantyReleasedAmount Decimal               @default(0) @db.Decimal(18, 2)
  status                 CustomerInvoiceStatus @default(EMISE)
  paymentTerms           String                @default("45 jours fin de mois")
  notes                  String?               @db.Text
  isDemoInvoice          Boolean               @default(false)
  createdAt              DateTime              @default(now())
  updatedAt              DateTime              @updatedAt

  @@index([invoiceNumber])
  @@index([projectId])
  @@index([status])
  @@index([isDemoInvoice])
}
```

#### D. Facturation Fournisseur (`SupplierInvoice`)
```prisma
model SupplierInvoice {
  id                      String                        @id @default(cuid())
  internalReference       String                        @unique // FAC-FOU-2026-NNN
  invoiceNumber           String // Numéro externe
  supplierId              String
  supplierName            String
  purchaseOrderId         String
  purchaseOrderCode       String
  goodsReceiptId          String?
  goodsReceiptCode        String?
  projectId               String?
  projectCode             String?
  invoiceDate             DateTime                      @default(now())
  dueDate                 DateTime
  amountHT                Decimal                       @db.Decimal(18, 2)
  vatRate                 Decimal                       @default(19) @db.Decimal(5, 2)
  vatAmount               Decimal                       @default(0) @db.Decimal(18, 2)
  amountTTC               Decimal                       @db.Decimal(18, 2)
  paidAmount              Decimal                       @default(0) @db.Decimal(18, 2)
  remainingAmount         Decimal                       @db.Decimal(18, 2)
  matchingStatus          SupplierInvoiceMatchingStatus @default(NON_VERIFIE)
  approvalThresholdStatus String                        @default("AUTO_APPROVED")
  status                  SupplierInvoiceStatus         @default(A_APPROUVER)
  paymentTerms            String                        @default("30 jours date de facture")
  notes                   String?                       @db.Text
  isDemoInvoice           Boolean                       @default(false)
  createdAt               DateTime                      @default(now())
  updatedAt               DateTime                      @updatedAt

  @@index([internalReference])
  @@index([purchaseOrderId])
  @@index([matchingStatus])
  @@index([status])
  @@index([isDemoInvoice])
}
```

#### E. Configuration Financière (`FinancialConfig`)
```prisma
model FinancialConfig {
  id                            String   @id @default(cuid())
  defaultVatRate                Decimal  @default(19) @db.Decimal(5, 2)
  defaultRetentionRate          Decimal  @default(5) @db.Decimal(5, 2)
  defaultWarrantyDurationMonths Int      @default(12)
  pmApprovalThresholdDA         Decimal  @default(500000) @db.Decimal(18, 2)
  dgApprovalThresholdDA         Decimal  @default(2000000) @db.Decimal(18, 2)
  priceToleranceAbsoluteDA      Decimal  @default(100) @db.Decimal(18, 2)
  priceToleranceRelativePct     Decimal  @default(0.5) @db.Decimal(5, 2)
  qtyTolerancePct               Decimal  @default(0) @db.Decimal(5, 2)
  allowAutoApprovalOnMatch      Boolean  @default(true)
  updatedAt                     DateTime @updatedAt
  createdAt                     DateTime @default(now())
}
```
