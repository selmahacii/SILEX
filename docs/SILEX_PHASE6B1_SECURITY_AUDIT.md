# AUDIT DE SÉCURITÉ, RBAC & SÉPARATION DES FONCTIONS (SoD) — PHASE 6B.1
## Contrôles d'Accès, Protection des Écritures & Isolation DEMO

> **Statut de l'Audit :** CONTRADICTOIRE & EN LECTURE SEULE  
> **Date de réalisation :** 13 Novembre 2026  
> **Commit audité :** `cb4d02b`

---

### 1. Contrôles d'Accès et Protection des Routes API (`route.ts`)

Inspection des lignes 304 à 345 (GET) et 820 à 875 (POST) de `apps/web/src/app/api/[...path]/route.ts` :

#### A. Routes GET (Consultation)
- `GET /finance/accounts`
- `GET /finance/transactions`
- `GET /finance/customer-invoices`
- `GET /finance/supplier-invoices`
- `GET /finance/config`
- `GET /finance/aged-trial-balance`
- `GET /finance/project-profitability`
- **CONSTAT AUDIT : FAILED / VULNERABILITÉ**  
  Aucune vérification d'authentification (`parseUserFromToken`) ni de contrôle de rôle n'est effectuée sur ces routes `GET` dans `route.ts`. Tout client HTTP peut interroger et lister les soldes des comptes, les factures clients/fournisseurs et les rentabilités sans token JWT valide.

#### B. Routes POST / PATCH (Écritures)
- Lignes 822-824 :
  ```typescript
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const authUser = await parseUserFromToken(authHeader);
  ```
- Les routes d'écriture appellent `parseUserFromToken(authHeader)`.
- Cependant, si aucun token n'est fourni, `authUser` vaut `null`.
- Dans `server-store.ts`, certaines méthodes vérifient le rôle (ex: `createFinancialAccount` exige `DIRECTEUR_GENERAL` ou `RESPONSABLE_FINANCIER`), mais d'autres (comme `createCustomerInvoice`, `recordCustomerPayment`, `createSupplierInvoice`) ne lèvent pas d'exception si `user` est absent.
- **CONSTAT AUDIT : PARTIALLY VERIFIED** — Contrôles présents sur la création de compte et la configuration, mais absents ou permissifs sur l'émission de factures et l'enregistrement de règlements.

---

### 2. Maker-Checker & Séparation des Fonctions (SoD)

- **Blocage de Paiement Fournisseur Non Approuvé (Lignes 4635-4645) :**
  ```typescript
  if (invoice.status === 'REJETEE' || invoice.status === 'A_APPROUVER') {
    throw new Error(`Impossible de payer une facture au statut ${invoice.status}. Une approbation préalable est requise.`);
  }
  ```
  - **VERIFIED :** Une facture en litige, avec écart de prix, ou dépassant le seuil SoD ne peut pas être payée directement. Le test E2E (étape 11) confirme le rejet systématique.
- **Auto-approbation (Maker-Checker strict) :**
  - **NOT VERIFIED :** Il n'existe pas de contrôle empêchant l'utilisateur qui a créé la facture fournisseur d'en approuver le dépassement de seuil s'il possède le rôle `DIRECTEUR_GENERAL` ou `RESPONSABLE_PROJET`. La vérification stricte `approverId !== creatorId` n'est pas codée.

---

### 3. Idempotence, Atomicité & Traçabilité

1. **Idempotence des Transactions (Lignes 4393-4400) :**
   - La méthode `recordCashTransaction` vérifie si `idempotencyKey` existe déjà dans l'historique et retourne la transaction précédente sans réitérer le débit/crédit.
   - **VERIFIED :** Confirmé à 100% par l'étape 11 du banc de test E2E.
2. **Atomicité des Virements Internes (Lignes 4440-4485) :**
   - La méthode `transferBetweenAccounts` exécute le débit et le crédit de manière synchrone en mémoire JS.
   - **PARTIALLY VERIFIED :** L'atomicité est assurée dans le thread unique JavaScript, mais n'est pas protégée par une transaction ACID de base de données relationnelle (`BEGIN ... COMMIT` / `prisma.$transaction`). En cas de crash serveur pendant l'opération ou en environnement concurrent multi-instance, une désynchronisation reste possible.
3. **Protection contre la modification directe des soldes :**
   - Les soldes `currentBalance` sont modifiés uniquement au travers de `recordCashTransaction` et `transferBetweenAccounts`.
   - **VERIFIED :** Pas de route API directe de type `PATCH /finance/accounts/:id/balance`.
4. **Audit Trail & Historique :**
   - Chaque opération génère un journal d'audit (`this.addAuditLog(...)`).
   - **VERIFIED :** La traçabilité est enregistrée dans l'audit log applicatif.

---

### 4. Isolation des Données DEMO

- Les comptes démo sont marqués `isDemoAccount: true`.
- Le code `DEMO-CPT-*` et `DEMO-FAC-*` est distinct.
- **BUSINESS DECISION REQUIRED :** Bien que les comptes démo portent le flag `isDemoAccount`, la méthode `getFinanceOverview()` agrège l'ensemble des encaissements sans filtrer sur `!isDemoAccount`. Si des comptes réels étaient créés aux côtés des comptes démo, les KPIs financiers mélangeraient les soldes réels et fictifs.

---

### 5. Classification des Constats de Sécurité

- `SECURITY-01` : **FAILED** — Absence totale d'authentification sur les routes de lecture `GET /api/finance/*`.
- `SECURITY-02` : **VERIFIED** — Rejet systématique de paiement sur facture fournisseur non validée ou en écart de 3-way matching.
- `SECURITY-03` : **VERIFIED** — Mécanisme d'idempotence opérationnel avec clé unique.
- `SECURITY-04` : **PARTIALLY VERIFIED** — Virement interne atomique en mémoire, mais non garanti par transaction ACID relationnelle.
- `SECURITY-05` : **BUSINESS DECISION REQUIRED** — Risque de pollution des indicateurs consolidés par les données DEMO si les filtres d'exclusion ne sont pas stricts.
