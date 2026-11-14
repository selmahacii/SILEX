# RAPPORT DE MIGRATION POSTGRESQL — PHASE 6B.3
## SILEX SERVICES ERP — Module 06 : Finance, Trésorerie & Comptabilité Industrielle

> **Statut :** VALIDÉ & TESTÉ SUR ENVIRONNEMENT ISOLÉ  
> **Date :** 14 Novembre 2026  
> **Cible de test :** PostgreSQL 16 local (`127.0.0.1:5433/silex_erp`, conteneur Docker `silex_postgres`)  
> **Cible de production Neon :** Non touchée (en attente de déploiement autorisé)  
> **Fichier de migration :** `apps/web/prisma/migrations/20261114_finance_module/migration.sql` (et `apps/api/prisma/migrations/20261114_finance_module/migration.sql`)  

---

### 1. Objectif de la Migration

La Phase 6B.2 avait validé les modèles Prisma (`prisma validate`, `prisma generate`), mais aucune migration SQL n'avait été créée ni appliquée sur une base physique.
La Phase 6B.3 comble cette lacune en créant une migration SQL purement additive, idempotente, conforme au schéma relationnel PostgreSQL, et en l'appliquant avec succès sur une base de données de test PostgreSQL 16 isolée.

---

### 2. Distinction des 5 Niveaux de Persistance

| Niveau d'État | Statut Phase 6B.2 | Statut Phase 6B.3 | Preuve Technique |
| :--- | :---: | :---: | :--- |
| **1. `prisma validate`** | VALIDÉ | **VALIDÉ** | `apps/web/prisma/schema.prisma` et `apps/api/prisma/schema.prisma` compilent sans avertissement ni erreur syntaxique. |
| **2. `prisma generate`** | VALIDÉ | **VALIDÉ** | Client `@prisma/client@6.19.3` généré avec typage complet des 7 modèles et 5 enums financiers. |
| **3. Migration SQL créée** | FAILED | **VALIDÉ** | Fichier SQL physique versionné dans le dépôt Git : `apps/web/prisma/migrations/20261114_finance_module/migration.sql`. |
| **4. Migration appliquée** | FAILED | **VALIDÉ** | Déployée avec succès sur PostgreSQL 16 (`127.0.0.1:5433/silex_erp`) via `prisma db execute`. Enregistrée dans `_prisma_migrations`. |
| **5. Persistance physique vérifiée** | PARTIEL (Mémoire) | **VALIDÉ (ACID)** | CRUD complet exécuté via Prisma, transactions commitées, intégrité référentielle vérifiée, persistance après redémarrage confirmée. |

---

### 3. Inventaire Détaillé des Objets de Base de Données Créés

#### 3.1 Énumérations PostgreSQL
- `AccountType` : `BANQUE`, `CAISSE`, `ATTENTE`, `PASSERELLE`
- `TransactionType` : `ENCAISSEMENT`, `DECAISSEMENT`, `VIREMENT_INTERNE`, `AJUSTEMENT`
- `CustomerInvoiceStatus` : `BROUILLON`, `VALIDEE`, `ENVOYEE`, `PARTIELLEMENT_PAYEE`, `PAYEE`, `LITIGE`, `ANNULEE`
- `SupplierInvoiceStatus` : `A_VERIFIER`, `A_APPROUVER`, `APPROUVEE`, `EN_PAIEMENT`, `PAYEE`, `LITIGE`, `REJETEE`
- `MatchingStatus` : `CONFORME`, `ECART_PRIX`, `ECART_QUANTITE`, `SANS_COMMANDE`, `DEROGATION`, `ANNULE`

#### 3.2 Tables Financières Physiques Créées

1. **`FinancialAccount`**
   - Clé primaire : `id` (VARCHAR)
   - Clé unique : `code` (VARCHAR)
   - Colonnes financières : `initialBalance` (DECIMAL(15,2)), `currentBalance` (DECIMAL(15,2)), `currency` (VARCHAR, default `'DZD'`)
   - Type : `AccountType`
   - Index : `FinancialAccount_code_key`

2. **`CashTransaction`**
   - Clé primaire : `id` (VARCHAR)
   - Clé unique : `transactionNumber` (VARCHAR), `idempotencyKey` (VARCHAR UNIQUE)
   - Clé étrangère : `accountId` -> `FinancialAccount(id)` ON DELETE RESTRICT
   - Précision : `amount` (DECIMAL(15,2))
   - Type : `TransactionType`
   - Audit : `createdById` (VARCHAR), `createdAt` (TIMESTAMP)

3. **`CustomerInvoice`**
   - Clé primaire : `id` (VARCHAR)
   - Clé unique : `invoiceNumber` (VARCHAR)
   - Clés étrangères optionnelles : `projectId` -> `Project(id)`, `commercialProposalId` -> `CommercialProposal(id)`
   - Montants : `amountHT`, `vatRate`, `vatAmount`, `amountTTC`, `retentionRate`, `retentionAmount`, `netPayable`, `paidAmount`, `remainingBalance` (tous en DECIMAL(15,2))
   - Statut : `CustomerInvoiceStatus`

4. **`SupplierInvoice`**
   - Clé primaire : `id` (VARCHAR)
   - Clé unique : `invoiceNumber` (VARCHAR)
   - Clés étrangères : `supplierId` -> `Supplier(id)`, `purchaseOrderId` -> `PurchaseOrder(id)` (optionnel), `goodsReceiptId` -> `GoodsReceipt(id)` (optionnel)
   - Montants : `amountHT`, `vatAmount`, `amountTTC`, `netPayable`, `paidAmount` (DECIMAL(15,2))
   - Rapprochement : `matchingStatus` (`MatchingStatus`), `priceVarianceDA`, `quantityVariance` (DECIMAL(15,2))
   - Statut : `SupplierInvoiceStatus`

5. **`SupplierInvoiceLine`**
   - Clé primaire : `id` (VARCHAR)
   - Clé étrangère : `supplierInvoiceId` -> `SupplierInvoice(id)` ON DELETE CASCADE
   - Clés de traçabilité : `purchaseOrderLineId` -> `PurchaseOrderLine(id)`, `goodsReceiptLineId` -> `GoodsReceiptLine(id)`
   - Données de ligne : `itemCode`, `description`, `quantity` (DECIMAL(15,2)), `unitPriceHT` (DECIMAL(15,2)), `totalHT` (DECIMAL(15,2))

6. **`InvoiceLineMatching`**
   - Clé primaire : `id` (VARCHAR)
   - Clés étrangères d'intégrité :
     - `supplierInvoiceId` -> `SupplierInvoice(id)` ON DELETE CASCADE
     - `supplierInvoiceLineId` -> `SupplierInvoiceLine(id)` ON DELETE SET NULL
     - `purchaseOrderLineId` -> `PurchaseOrderLine(id)` ON DELETE SET NULL
     - `goodsReceiptLineId` -> `GoodsReceiptLine(id)` ON DELETE SET NULL
   - Données d'allocation : `matchedQuantity` (DECIMAL(15,2)), `invoicedUnitPrice` (DECIMAL(15,2)), `orderedUnitPrice` (DECIMAL(15,2)), `varianceAmount` (DECIMAL(15,2)), `status` (`MatchingStatus`)

7. **`FinancialConfig`**
   - Clé primaire : `id` (VARCHAR)
   - Paramétrage : `defaultVatRate` (19.00), `defaultRetentionRate` (5.00), `priceToleranceThreshold` (100.00), `quantityToleranceThreshold` (0.00), `dgApprovalThreshold` (500000.00)

---

### 4. Vérification SQL de l'Application

La vérification a été effectuée par requête directe sur `information_schema.tables` :
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('FinancialAccount', 'CashTransaction', 'CustomerInvoice', 'SupplierInvoice', 'SupplierInvoiceLine', 'InvoiceLineMatching', 'FinancialConfig');
```
**Résultat : 7/7 tables présentes physiquement.**

Table de suivi des migrations `_prisma_migrations` :
```sql
SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations";
```
- `0_init` : Migration initiale (modules 01 à 05)
- `20261114_finance_module` : Appliquée le 14/11/2026 (Module 06 Finance)
