-- Migration: 20261114_finance_module
-- Description: Additive migration for Module 06 - Finance, Cash Flow & 3-Way Matching

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('BANQUE_COURANT', 'BANQUE_INVESTISSEMENT', 'CAISSE_SIEGE', 'CAISSE_CHANTIER');

-- CreateEnum
CREATE TYPE "CashTransactionType" AS ENUM ('ENCAISSEMENT_CLIENT', 'DECAISSEMENT_FOURNISSEUR', 'PAIEMENT_SALAIRES', 'PAIEMENT_CHARGES_SOCIALES', 'VIREMENT_INTERNE_EMIS', 'VIREMENT_INTERNE_RECU', 'LIBERATION_RETENUE_GARANTIE', 'FRAIS_BANCAIRES', 'AVANCE_CHANTIER');

-- CreateEnum
CREATE TYPE "CustomerInvoiceStatus" AS ENUM ('BROUILLON', 'EMISE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'LITIGE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "SupplierInvoiceStatus" AS ENUM ('A_APPROUVER', 'APPROUVEE', 'EN_COURS_DE_PAIEMENT', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "SupplierInvoiceMatchingStatus" AS ENUM ('CONFORME_3_WAY', 'ECART_PRIX', 'ECART_QUANTITE', 'SANS_RECEPTION', 'NON_VERIFIE');

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL DEFAULT 'BANQUE_COURANT',
    "bankName" TEXT NOT NULL,
    "ribNumber" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DZD',
    "initialBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "CashTransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "counterpartAccountId" TEXT,
    "counterpartAccountCode" TEXT,
    "customerInvoiceId" TEXT,
    "customerInvoiceNumber" TEXT,
    "supplierInvoiceId" TEXT,
    "supplierInvoiceNumber" TEXT,
    "projectId" TEXT,
    "projectCode" TEXT,
    "referenceDocument" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'VIREMENT',
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "performedByName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALIDE',
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT,
    "workSituationId" TEXT,
    "workSituationNumber" TEXT,
    "commercialQuoteId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountHT" DECIMAL(18,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 19,
    "vatAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "retentionRate" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "retentionAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountTTC" DECIMAL(18,2) NOT NULL,
    "netReceivableAmount" DECIMAL(18,2) NOT NULL,
    "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(18,2) NOT NULL,
    "warrantyHeldAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "warrantyReleasedAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" "CustomerInvoiceStatus" NOT NULL DEFAULT 'EMISE',
    "paymentTerms" TEXT NOT NULL DEFAULT '45 jours fin de mois',
    "notes" TEXT,
    "isDemoInvoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierInvoice" (
    "id" TEXT NOT NULL,
    "internalReference" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "purchaseOrderCode" TEXT NOT NULL,
    "goodsReceiptId" TEXT,
    "goodsReceiptCode" TEXT,
    "projectId" TEXT,
    "projectCode" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountHT" DECIMAL(18,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 19,
    "vatAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountTTC" DECIMAL(18,2) NOT NULL,
    "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(18,2) NOT NULL,
    "matchingStatus" "SupplierInvoiceMatchingStatus" NOT NULL DEFAULT 'NON_VERIFIE',
    "approvalThresholdStatus" TEXT NOT NULL DEFAULT 'AUTO_APPROVED',
    "status" "SupplierInvoiceStatus" NOT NULL DEFAULT 'A_APPROUVER',
    "paymentTerms" TEXT NOT NULL DEFAULT '30 jours date de facture',
    "notes" TEXT,
    "isDemoInvoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialConfig" (
    "id" TEXT NOT NULL,
    "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 19,
    "defaultRetentionRate" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "defaultWarrantyDurationMonths" INTEGER NOT NULL DEFAULT 12,
    "pmApprovalThresholdDA" DECIMAL(18,2) NOT NULL DEFAULT 500000,
    "dgApprovalThresholdDA" DECIMAL(18,2) NOT NULL DEFAULT 2000000,
    "priceToleranceAbsoluteDA" DECIMAL(18,2) NOT NULL DEFAULT 100,
    "priceToleranceRelativePct" DECIMAL(5,2) NOT NULL DEFAULT 0.5,
    "qtyTolerancePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "allowAutoApprovalOnMatch" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierInvoiceLine" (
    "id" TEXT NOT NULL,
    "supplierInvoiceId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "subtotalHT" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineMatching" (
    "id" TEXT NOT NULL,
    "supplierInvoiceId" TEXT NOT NULL,
    "supplierInvoiceLineId" TEXT,
    "purchaseOrderId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "goodsReceiptId" TEXT NOT NULL,
    "goodsReceiptLineId" TEXT NOT NULL,
    "quantityMatched" DECIMAL(12,2) NOT NULL,
    "unitPriceMatched" DECIMAL(15,2) NOT NULL,
    "amountMatchedHT" DECIMAL(18,2) NOT NULL,
    "priceVarianceDA" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CONFORME',
    "derogationReason" TEXT,
    "derogationApprovedById" TEXT,
    "derogationApprovedByName" TEXT,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedById" TEXT NOT NULL,
    "matchedByName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceLineMatching_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_code_key" ON "FinancialAccount"("code");
CREATE INDEX "FinancialAccount_code_idx" ON "FinancialAccount"("code");
CREATE INDEX "FinancialAccount_isDemoAccount_isActive_idx" ON "FinancialAccount"("isDemoAccount", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CashTransaction_transactionNumber_key" ON "CashTransaction"("transactionNumber");
CREATE UNIQUE INDEX "CashTransaction_idempotencyKey_key" ON "CashTransaction"("idempotencyKey");
CREATE INDEX "CashTransaction_accountId_idx" ON "CashTransaction"("accountId");
CREATE INDEX "CashTransaction_type_idx" ON "CashTransaction"("type");
CREATE INDEX "CashTransaction_transactionDate_idx" ON "CashTransaction"("transactionDate");
CREATE INDEX "CashTransaction_idempotencyKey_idx" ON "CashTransaction"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInvoice_invoiceNumber_key" ON "CustomerInvoice"("invoiceNumber");
CREATE INDEX "CustomerInvoice_invoiceNumber_idx" ON "CustomerInvoice"("invoiceNumber");
CREATE INDEX "CustomerInvoice_projectId_idx" ON "CustomerInvoice"("projectId");
CREATE INDEX "CustomerInvoice_status_idx" ON "CustomerInvoice"("status");
CREATE INDEX "CustomerInvoice_isDemoInvoice_idx" ON "CustomerInvoice"("isDemoInvoice");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierInvoice_internalReference_key" ON "SupplierInvoice"("internalReference");
CREATE INDEX "SupplierInvoice_internalReference_idx" ON "SupplierInvoice"("internalReference");
CREATE INDEX "SupplierInvoice_purchaseOrderId_idx" ON "SupplierInvoice"("purchaseOrderId");
CREATE INDEX "SupplierInvoice_matchingStatus_idx" ON "SupplierInvoice"("matchingStatus");
CREATE INDEX "SupplierInvoice_status_idx" ON "SupplierInvoice"("status");
CREATE INDEX "SupplierInvoice_isDemoInvoice_idx" ON "SupplierInvoice"("isDemoInvoice");

-- CreateIndex
CREATE INDEX "SupplierInvoiceLine_supplierInvoiceId_idx" ON "SupplierInvoiceLine"("supplierInvoiceId");

-- CreateIndex
CREATE INDEX "InvoiceLineMatching_supplierInvoiceId_idx" ON "InvoiceLineMatching"("supplierInvoiceId");
CREATE INDEX "InvoiceLineMatching_purchaseOrderLineId_idx" ON "InvoiceLineMatching"("purchaseOrderLineId");
CREATE INDEX "InvoiceLineMatching_goodsReceiptLineId_idx" ON "InvoiceLineMatching"("goodsReceiptLineId");
CREATE INDEX "InvoiceLineMatching_status_idx" ON "InvoiceLineMatching"("status");

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_counterpartAccountId_fkey" FOREIGN KEY ("counterpartAccountId") REFERENCES "FinancialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceLine" ADD CONSTRAINT "SupplierInvoiceLine_supplierInvoiceId_fkey" FOREIGN KEY ("supplierInvoiceId") REFERENCES "SupplierInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineMatching" ADD CONSTRAINT "InvoiceLineMatching_supplierInvoiceId_fkey" FOREIGN KEY ("supplierInvoiceId") REFERENCES "SupplierInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineMatching" ADD CONSTRAINT "InvoiceLineMatching_supplierInvoiceLineId_fkey" FOREIGN KEY ("supplierInvoiceLineId") REFERENCES "SupplierInvoiceLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineMatching" ADD CONSTRAINT "InvoiceLineMatching_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "PurchaseOrderLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineMatching" ADD CONSTRAINT "InvoiceLineMatching_goodsReceiptLineId_fkey" FOREIGN KEY ("goodsReceiptLineId") REFERENCES "GoodsReceiptLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
