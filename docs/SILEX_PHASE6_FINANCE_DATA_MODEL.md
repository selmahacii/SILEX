# MODÈLE DE DONNÉES & SCHÉMA RELATIONNEL FINANCIER
**ERP INDUSTRIEL SARL SILEX SERVICES — Version 2026**  
**Document de Référence : Phase 6A (Spécification de Modèle)**  
**Fichier :** `docs/SILEX_PHASE6_FINANCE_DATA_MODEL.md`

---

## 1. EXTENSIONS DU MODÈLE DE DONNÉES (PRISMA / TYPESCRIPT)

Pour supporter l'ensemble des besoins de trésorerie, facturation, dettes fournisseurs et rentabilité, les entités suivantes sont formalisées dans le schéma :

### 1.1 `FinancialAccount` (Comptes Bancaires & Caisses)
- `id` : String (PK)
- `code` : String (Unique, ex: `CPT-BEA-01`, `CPT-CAISSE-ARZ`)
- `name` : String (ex: `Compte Courant BEA Entreprises Arzew`)
- `type` : Enum (`BANQUE`, `CAISSE`, `DEPOT_GARANTIE`)
- `bankName` : String? (ex: `Banque Extérieure d'Algérie - Agence 024 Arzew`)
- `ribNumber` : String? (20 chiffres normalisés)
- `currency` : String (Défaut: `DZD`)
- `initialBalance` : Decimal (Solde d'ouverture)
- `currentBalance` : Decimal (Solde comptable recalculé)
- `isActive` : Boolean (Défaut: `true`)
- `createdAt` / `updatedAt` : DateTime

### 1.2 `CashTransaction` (Mouvements de Trésorerie & Flux Atomiques)
- `id` : String (PK)
- `transactionNumber` : String (Unique, ex: `TR-2026-0001`)
- `transactionDate` : DateTime
- `type` : Enum (`ENCAISSEMENT_CLIENT`, `DECAISSEMENT_FOURNISSEUR`, `PAIE_SALAIRES`, `FRAIS_MISSION`, `VIREMENT_INTERNE`, `AJUSTEMENT_BANCAIRE`)
- `amount` : Decimal (Montant positif strict)
- `accountId` : String (FK $\rightarrow$ `FinancialAccount`)
- `counterpartAccountId` : String? (FK $\rightarrow$ `FinancialAccount` pour virements internes)
- `customerInvoiceId` : String? (FK $\rightarrow$ `CustomerInvoice`)
- `supplierInvoiceId` : String? (FK $\rightarrow$ `SupplierInvoice`)
- `projectId` : String? (FK $\rightarrow$ `Project`)
- `referenceDocument` : String (ex: `VIR-BEA-99214`, `CHQ-BNA-8812`)
- `category` : String (ex: `MATIERE`, `SOUS_TRAITANCE`, `PERSONNEL`, `CLIENT`)
- `performedById` : String (FK $\rightarrow$ `User`)
- `status` : Enum (`VALIDE`, `EN_ATTENTE_RAPPROCHEMENT`, `ANNULE`)
- `idempotencyKey` : String (Unique)

### 1.3 `CustomerInvoice` (Factures Clients & Situations Contractuelles)
- `id` : String (PK)
- `invoiceNumber` : String (Unique, ex: `FAC-2026-001`)
- `clientId` : String?
- `clientName` : String (ex: `Sonatrach Raffinerie Skikda`)
- `projectId` : String (FK $\rightarrow$ `Project`)
- `projectCode` : String
- `commercialQuoteId` : String?
- `workSituationId` : String? (Liaison avec la situation de travaux)
- `issueDate` : DateTime
- `dueDate` : DateTime
- `amountHT` : Decimal
- `vatRate` : Decimal (Défaut: 19% ou 0% ANDI)
- `vatAmount` : Decimal
- `retentionRate` : Decimal (Défaut: 5% retenue de garantie)
- `retentionAmount` : Decimal
- `amountTTC` : Decimal
- `netReceivableAmount` : Decimal (`amountTTC - retentionAmount`)
- `paidAmount` : Decimal (Cumul des encaissements)
- `remainingAmount` : Decimal (`netReceivableAmount - paidAmount`)
- `status` : Enum (`BROUILLON`, `VALIDEE_DG`, `EMISE`, `PARTIELLEMENT_PAYEE`, `SOLDEE`, `EN_RETARD`, `ANNULEE`)
- `paymentTerms` : String (ex: `45 jours fin de mois`)

### 1.4 `SupplierInvoice` (Factures Fournisseurs & 3-Way Matching)
- `id` : String (PK)
- `internalReference` : String (Unique, ex: `FF-2026-001`)
- `invoiceNumber` : String (Numéro facture émise par le fournisseur)
- `supplierId` : String
- `supplierName` : String (ex: `Batimetal Tuyauteries Algérie`)
- `purchaseOrderId` : String? (FK $\rightarrow$ `PurchaseOrder`)
- `purchaseOrderCode` : String?
- `goodsReceiptId` : String? (FK $\rightarrow$ `GoodsReceipt`)
- `goodsReceiptCode` : String?
- `projectId` : String?
- `invoiceDate` : DateTime
- `dueDate` : DateTime
- `amountHT` : Decimal
- `vatAmount` : Decimal
- `amountTTC` : Decimal
- `paidAmount` : Decimal
- `remainingAmount` : Decimal
- `matchingStatus` : Enum (`CONFORME`, `ECART_PRIX`, `ECART_QUANTITE`, `SANS_COMMANDE`)
- `status` : Enum (`REÇUE`, `EN_CONTROLE`, `APPROUVEE_DG`, `PARTIELLEMENT_PAYEE`, `PAYEE`, `LITIGE`)

### 1.5 `ProjectProfitabilitySnapshot` (Indicateurs Analytiques Rentabilité)
- `projectId` : String (PK $\rightarrow$ `Project`)
- `contractAmountHT` : Decimal
- `billedRevenueHT` : Decimal
- `collectedRevenueTTC` : Decimal
- `materialsCost` : Decimal (Issu des sorties stocks & factures fournisseurs)
- `subcontractingCost` : Decimal (Sous-traitance & CND)
- `laborCost` : Decimal (Pointages & débours réels consolidés RH)
- `travelAndMissionCost` : Decimal (Frais de mission & per diem)
- `equipmentCost` : Decimal (Engins & levage)
- `totalActualCost` : Decimal
- `grossMarginDA` : Decimal (`billedRevenueHT - totalActualCost`)
- `marginRatePercent` : Decimal
- `forecastFinalCost` : Decimal
- `financialHealth` : Enum (`EXCELLENTE`, `CONFORME`, `SOUS_SURVEILLANCE`, `DEFICITAIRE`)

---

## 2. RÈGLES DE COHÉRENCE ET PRÉCISION CALCULATOIRE

1. **Précision** : Tout calcul financier intermédiaire est stocké avec 2 chiffres après la virgule (`Round(x, 2)`).
2. **Atomicité des Virements Internes** :
   ```typescript
   // Lors d'un virement de 500 000 DA de Compte A vers Compte B :
   CompteA.currentBalance -= 500000;
   CompteB.currentBalance += 500000;
   // Les deux soldes sont mis à jour simultanément avec log d'audit
   ```
3. **Formule d'Échéancier & Balance Âgée** :
   $$\text{Jours de Retard} = \max(0, \text{Date du Jour} - \text{Date d'Échéance})$$

---
*SARL SILEX SERVICES — Architecture des Données Financières.*
