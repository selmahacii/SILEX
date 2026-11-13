# MODÈLE DE DONNÉES & SCHÉMA RELATIONNEL FINANCIER (RÉVISÉ)
**ERP INDUSTRIEL SARL SILEX SERVICES — Version 2026**  
**Document de Référence : Phase 6A (Spécification de Modèle Révisée)**  
**Fichier :** `docs/SILEX_PHASE6_FINANCE_DATA_MODEL.md`

---

## 1. EXTENSIONS DU MODÈLE DE DONNÉES FINANCIER

Pour supporter l'ensemble des besoins de trésorerie, facturation, dettes fournisseurs et rentabilité, sans créer de doublons avec les entités Prisma existantes (`Project`, `WorkSituation`, `PurchaseOrder`, `GoodsReceipt`), les entités financières suivantes sont spécifiées :

### 1.1 `FinancialAccount` (Comptes Bancaires & Caisses — Données DEMO Isolées)
- `id` : String (PK)
- `code` : String (Unique, ex: `DEMO-CPT-01`, `DEMO-CPT-02`, `DEMO-CPT-03`)
- `name` : String (ex: `Compte Bancaire Démo A`, `Compte Bancaire Démo B`, `Caisse Régie Chantier Démo`)
- `type` : Enum (`BANQUE`, `CAISSE`, `DEPOT_GARANTIE`)
- `bankName` : String? (ex: `Établissement Bancaire Fictif - Agence Démo`)
- `ribNumber` : String? (Format fictif DEMO: `00000-00000-0000000000-00`)
- `currency` : String (Défaut: `DZD`)
- `initialBalance` : Decimal (Solde d'ouverture de démonstration)
- `currentBalance` : Decimal (Solde recalculé en direct à partir des mouvements)
- `isDemoAccount` : Boolean (Strictement `true` pour les comptes fictifs)
- `isActive` : Boolean (Défaut: `true`)
- `createdAt` / `updatedAt` : DateTime

### 1.2 `CashTransaction` (Mouvements de Trésorerie & Flux Atomiques)
- `id` : String (PK)
- `transactionNumber` : String (Unique, ex: `TR-2026-0001`)
- `transactionDate` : DateTime
- `type` : Enum (`ENCAISSEMENT_CLIENT`, `DECAISSEMENT_FOURNISSEUR`, `PAIE_SALAIRES`, `FRAIS_MISSION`, `VIREMENT_INTERNE`, `AJUSTEMENT_BANCAIRE`)
- `amount` : Decimal (Montant positif strict)
- `accountId` : String (FK $\rightarrow$ `FinancialAccount`)
- `counterpartAccountId` : String? (FK $\rightarrow$ `FinancialAccount` pour virements internes atomiques)
- `customerInvoiceId` : String? (FK $\rightarrow$ `CustomerInvoice`)
- `supplierInvoiceId` : String? (FK $\rightarrow$ `SupplierInvoice`)
- `projectId` : String? (FK $\rightarrow$ `Project`)
- `referenceDocument` : String (ex: `VIR-DEMO-001`, `CHQ-DEMO-002`)
- `category` : String (ex: `MATIERE`, `SOUS_TRAITANCE`, `PERSONNEL`, `CLIENT`, `EQUIPEMENT`, `FRAIS_GENERAUX`)
- `performedById` : String (FK $\rightarrow$ `User`)
- `status` : Enum (`VALIDE`, `EN_ATTENTE_RAPPROCHEMENT`, `ANNULE`)
- `idempotencyKey` : String (Unique)

### 1.3 `CustomerInvoice` (Factures Clients & Situations Contractuelles)
- `id` : String (PK)
- `invoiceNumber` : String (Unique, ex: `FAC-2026-001`)
- `clientId` : String?
- `clientName` : String
- `projectId` : String (FK $\rightarrow$ `Project`)
- `projectCode` : String
- `commercialQuoteId` : String?
- `workSituationId` : String? (Liaison avec la situation de travaux `WorkSituation`)
- `issueDate` : DateTime
- `dueDate` : DateTime
- `amountHT` : Decimal
- `vatRate` : Decimal (Configurable : 19%, 9% ou 0% exonération ANDI)
- `vatAmount` : Decimal
- `retentionRate` : Decimal (Configurable selon contrat : 0%, 5%, 10%)
- `retentionAmount` : Decimal
- `amountTTC` : Decimal
- `netReceivableAmount` : Decimal (`amountTTC - retentionAmount`)
- `paidAmount` : Decimal (Cumul des encaissements enregistrés)
- `remainingAmount` : Decimal (`netReceivableAmount - paidAmount`)
- `status` : Enum (`BROUILLON`, `VALIDEE_DG`, `EMISE`, `PARTIELLEMENT_PAYEE`, `SOLDEE`, `EN_RETARD`, `ANNULEE`)
- `paymentTerms` : String (Configurable par contrat : ex: `45 jours fin de mois`, `30 jours net`, `Comptant`)

### 1.4 `SupplierInvoice` (Factures Fournisseurs & 3-Way Matching)
- `id` : String (PK)
- `internalReference` : String (Unique, ex: `FF-2026-001`)
- `invoiceNumber` : String (Numéro facture réel émis par le fournisseur)
- `supplierId` : String
- `supplierName` : String
- `purchaseOrderId` : String? (FK $\rightarrow$ `PurchaseOrder`)
- `purchaseOrderCode` : String?
- `goodsReceiptId` : String? (FK $\rightarrow$ `GoodsReceipt`)
- `goodsReceiptCode` : String?
- `projectId` : String?
- `invoiceDate` : DateTime
- `dueDate` : DateTime
- `amountHT` : Decimal
- `vatRate` : Decimal (Configurable selon fournisseur / produit)
- `vatAmount` : Decimal
- `amountTTC` : Decimal
- `paidAmount` : Decimal
- `remainingAmount` : Decimal
- `matchingStatus` : Enum (`CONFORME`, `ECART_PRIX`, `ECART_QUANTITE`, `SANS_COMMANDE`)
- `status` : Enum (`REÇUE`, `EN_CONTROLE`, `APPROUVEE_DG`, `PARTIELLEMENT_PAYEE`, `PAYEE`, `LITIGE`)
- `paymentTerms` : String (Configurable selon accord-cadre fournisseur)

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

## 2. RÈGLES DE COHÉRENCE, ATOMICITÉ & ARRONDIS

1. **Précision Décimale Monétaire** : Tout calcul financier intermédiaire est stocké avec 2 chiffres après la virgule (`Math.round(x * 100) / 100`).
2. **Atomicité des Virements Internes** :
   ```typescript
   // Lors d'un virement de montant M de Compte A vers Compte B :
   CompteA.currentBalance -= M;
   CompteB.currentBalance += M;
   // Écriture d'un CashTransaction unique liant accountId et counterpartAccountId
   ```
3. **Prévention Anti-Double-Comptage** :
   ```typescript
   // Coût Total Chantier = Coûts Consommés Réels (Factures payées/reconnues + Sorties Stock + MO)
   // + Engagements Restants (BC validés moins réceptions déjà facturées)
   ```

---
*SARL SILEX SERVICES — Architecture des Données Financières.*
