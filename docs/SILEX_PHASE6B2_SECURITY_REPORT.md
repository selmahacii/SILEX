# RAPPORT DE SÉCURITÉ P0 & CONTRÔLE D'ACCÈS RBAC — PHASE 6B.2
## SILEX SERVICES ERP — Sécurisation de l'API Gateway & Contrôles Côté Serveur

> **Statut de Sécurité :** CONFORME & TESTÉ EN PRODUCTION  
> **Commit de référence :** `cb4d02b` / `16e24c6`  
> **Fichiers concernés :** `apps/web/src/app/api/[...path]/route.ts`, `apps/web/src/lib/auth-server.ts`, `apps/web/src/lib/db-bridge.ts`.

---

### 1. Traitement des Vulnérabilités Identifiées lors de la Phase 6B.1

| Vulnérabilité Phase 6B.1 | Risque | Correction Apportée en Phase 6B.2 | Statut de Vérification |
| :--- | :--- | :--- | :---: |
| **Routes GET `/api/finance/*` non authentifiées** | Fuite de données critiques (soldes bancaires, factures, marges de projet). | Ajout d'une barrière d'authentification cryptographique JWT obligatoire sur tout chemin `/finance*`. Rejet `401 Unauthorized` si en-tête `Authorization` absent ou signature invalide. | **VERIFIED** |
| **Absence de filtrage par rôle RBAC** | N'importe quel utilisateur connecté (ex: ouvrier, magasinier) pouvait consulter ou altérer la trésorerie. | Restriction stricte aux 4 rôles autorisés : `ADMINISTRATEUR`, `DIRECTEUR_GENERAL`, `RESPONSABLE_FINANCIER`, `RESPONSABLE_PROJET`. Rejet `403 Forbidden` pour tous les autres profils. | **VERIFIED** |
| **Contournement possible lors des écritures POST/PATCH** | Risque d'altération de comptes ou de création de factures par usurpation. | Extraction du jeton serveur, vérification systématique de l'identité `authUser` avant tout appel à `dbBridge`, et vérification que seule la Direction Générale ou l'Administrateur peut modifier `FinancialConfig`. | **VERIFIED** |
| **Collision dans le routage PATCH** | Route de configuration financière mal positionnée dans la fonction POST. | Correction structurelle du routeur Next.js et déplacement propre de la route dans `export async function PATCH`. | **VERIFIED** |

---

### 2. Matrice des Rôles et Permissions Finance

| Rôle Utilisateur | Consultation Soldes (`/accounts`) | Émission Facture Client (`/customer-invoices`) | Rapprochement 3-Way (`/supplier-invoices`) | Ordonnancement Paiement (`/:id/pay`) | Virement Compte à Compte (`/transfer`) | Configuration Financière (`/config`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ADMINISTRATEUR** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DIRECTEUR_GENERAL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RESPONSABLE_FINANCIER** | ✅ | ✅ | ✅ | ✅ (selon seuil SoD) | ✅ | ❌ (Lecture seule) |
| **RESPONSABLE_PROJET** | ✅ (projets assignés) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **RESPONSABLE_ACHATS** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **RESPONSABLE_MAGASIN** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **RESPONSABLE_RH** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### 3. Garanties d'Idempotence et d'Atomicité

1. **Idempotence des Paiements et Transactions :**
   - L'envoi répété d'une requête portant la même clé `idempotencyKey` renvoie la transaction préexistante sans réitérer le débit du compte bancaire (validé par le test unitaire Étape 13).
2. **Atomicité des Virements Internes :**
   - L'appel à `transferBetweenAccounts` encapsule le débit du compte source et le crédit du compte destination dans une opération synchrone validant la solvabilité du compte émetteur.
   - En mode base de données, l'opération est couverte par une transaction Prisma relationnelle (`$transaction`).
3. **Protection contre la modification directe des soldes :**
   - Aucune route de mise à jour arbitraire de solde n'existe. Tout mouvement doit faire l'objet d'une pièce justificative comptable.
