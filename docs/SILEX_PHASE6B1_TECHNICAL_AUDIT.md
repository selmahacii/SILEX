# AUDIT TECHNIQUE CONTRADICTOIRE & VÉRIFICATION DE LA PERSISTANCE — PHASE 6B.1
## SILEX SERVICES ERP — Module 06 : Finance, Trésorerie & Comptabilité Industrielle

> **Statut de l'Audit :** CONTRADICTOIRE & EN LECTURE SEULE  
> **Date de réalisation :** 13 Novembre 2026  
> **Auteur :** Senior Software Architect & Lead Financial ERP Auditor  
> **Commit audité :** `cb4d02b` (Synchronisé sur `master` et `main`)  
> **Périmètre inspecté :** `schema.prisma`, migrations SQL, `server-store.ts`, `db-bridge.ts`, `route.ts`, `finance.service.ts`, `test-finance-e2e.js`.

---

### 1. Synthèse Exécutive & Réponse à la Question Bloquante

> [!CAUTION]
> **RÉPONSE À LA QUESTION BLOQUANTE DU MANDAT :**  
> **La Phase 6B possède-t-elle une véritable persistance PostgreSQL ou repose-t-elle encore principalement sur le Store applicatif ?**  
> **CONSTAT : FAILED (Non persisté en base relationnelle).**  
> Les entités financières introduites en Phase 6B (`StoredFinancialAccount`, `StoredCashTransaction`, `StoredCustomerInvoice`, `StoredSupplierInvoice`, `StoredFinancialConfig`) **n'existent PAS** en tant que modèles dans `schema.prisma` ni dans les tables PostgreSQL de Neon. Elles sont exclusivement définies et gérées en mémoire vive dans `apps/web/src/lib/server-store.ts` avec pontage dans `apps/web/src/lib/db-bridge.ts`.

Bien que les règles de calcul (TVA, retenue de garantie 5%, 3-way matching, double-entry, anti-double-compte) soient parfaitement fonctionnelles au niveau applicatif et validées par les tests E2E en mémoire, **aucune écriture financière ne survit à un redémarrage à froid du processus Node.js ou du conteneur serverless**.

---

### 2. Matrice d'Inspection Détaillée des Entités Financières

| Entité Financière | Lieu de Définition | Lieu de Création / Instanciation | Lieu de Stockage | Persisté dans PostgreSQL Neon ? | Survie au redémarrage serveur ? | Relations & Contraintes SQL | Transactions SQL (`$transaction`) | Statut d'Audit |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`StoredFinancialAccount`** | `server-store.ts` (l. 1009-1023) | `createFinancialAccount()` (l. 4349) + `initFinanceBaseline()` | `serverStore.financialAccounts` (Array mémoire) | **NON** (Absent de `schema.prisma`) | **NON** (Réinitialisé au boot) | **NON** (Aucune clé étrangère BD) | **NON** (Mémoire JS unitaire) | **PARTIALLY VERIFIED** (Fonctionnel en store, inexistant en BD) |
| **`StoredCashTransaction`** | `server-store.ts` (l. 1025-1064) | `recordCashTransaction()` (l. 4390) + `transferBetweenAccounts()` | `serverStore.cashTransactions` (Array mémoire) | **NON** (Absent de `schema.prisma`) | **NON** | **NON** | **NON** (Pas de verrouillage row-level SQL) | **PARTIALLY VERIFIED** |
| **`StoredCustomerInvoice`** | `server-store.ts` (l. 1066-1094) | `createCustomerInvoice()` (l. 4487) | `serverStore.customerInvoices` (Array mémoire) | **NON** | **NON** | **NON** (Lien texte libre `projectId`, `workSituationId`) | **NON** | **PARTIALLY VERIFIED** |
| **`StoredSupplierInvoice`** | `server-store.ts` (l. 1096-1135) | `createSupplierInvoice()` (l. 4588) | `serverStore.supplierInvoices` (Array mémoire) | **NON** | **NON** | **NON** (Lien texte libre `purchaseOrderId`, `goodsReceiptId`) | **NON** | **PARTIALLY VERIFIED** |
| **`StoredFinancialConfig`** | `server-store.ts` (l. 1137-1145) | Déclaré avec valeurs par défaut (l. 1205-1215) | Objet mémoire `financialConfig` | **NON** | **NON** | **NON** | **NON** | **PARTIALLY VERIFIED** |

---

### 3. Analyse Approfondie du Mécanisme de Persistance & Fallback

1. **Inspection de `apps/web/prisma/schema.prisma` :**
   - Le schéma compte 35 modèles (`Project`, `WorkSituation`, `PurchaseOrder`, `GoodsReceipt`, `ProjectCostEntry`, `StockMovement`, etc.).
   - Aucun modèle `FinancialAccount`, `CashTransaction`, `CustomerInvoice`, ou `SupplierInvoice` n'est présent.
   - Les mentions existantes de `invoice` se limitent à `WorkSituation.invoicedAt` et `WorkSituation.invoiceReference` (champs informatifs).
   - Aucun dossier `apps/web/prisma/migrations` n'existe dans le dépôt (les modifications de schéma ont été synchronisées par `db push` ou sont gérées par le runtime hybride).

2. **Inspection de `apps/web/src/lib/db-bridge.ts` :**
   - Toutes les méthodes du Module 06 (`getFinancialAccounts`, `createCustomerInvoice`, `recordCashTransaction`, `transferBetweenAccounts`, `createSupplierInvoice`, `recordSupplierPayment`, etc.) délèguent **directement** à `serverStore` :
     ```typescript
     async createCustomerInvoice(data: any, user?: any) {
       return serverStore.createCustomerInvoice(data, user);
     }
     ```
   - Il n'y a **aucun bloc `if (hasDb) { try { await prisma.customerInvoice... } }`** car les tables Prisma n'existent pas.

3. **Comportement au redémarrage :**
   - À chaque arrêt du conteneur ou de l'application, l'état revient à `initFinanceBaseline()`.
   - Les factures ou encaissements générés au cours d'une session disparaissent lors du redémarrage du processus.

---

### 4. Classification des Constats

- `PERSISTENCE-01` : **FAILED** — Absence des tables financières dans PostgreSQL Neon. Le typage TypeScript ne remplace pas la persistance relationnelle.
- `PERSISTENCE-02` : **VERIFIED** — Isolation totale des données existantes de Neon (aucune altération des données de production).
- `PERSISTENCE-03` : **FAILED** — Volatilité des écritures de trésorerie en mémoire (perte de données au redémarrage du serveur).
