# RAPPORT DE DÉCISION CONTRADICTOIRE GO / NO-GO — PHASE 6B.1
## SILEX SERVICES ERP — Module 06 : Finance & Trésorerie

> **Date de Délibération :** 13 Novembre 2026  
> **Comité d'Audit :** Senior Software Architect, Lead Financial Auditor, QA Lead  
> **Commit Audité :** `cb4d02b`  

---

### 1. DÉCISION FINALE DU COMITÉ D'AUDIT

# 🛑 **DÉCISION : CONDITIONAL GO (GO SOUS CONDITIONS STRICTES)**

La Phase 6B **ne peut pas recevoir un "GO" inconditionnel** pour l'engagement direct de la Phase 6C (UI/Frontend Finance).  
Cependant, un **"NO GO" bloquant intégral n'est pas justifié** car la structure algorithmique métier (calculs TVA/retenue, flux de trésorerie, règles de 3-way matching, absence de double comptage) est mature, robuste et déjà opérationnelle dans le moteur applicatif.

---

### 2. Synthèse des Écarts Constatés par Catégorie

| Domaine Audité | Constat Synthétique | Statut |
| :--- | :--- | :---: |
| **Persistance Relationnelle** | Les entités financières n'existent pas dans PostgreSQL (`schema.prisma`). Elles sont volatiles et stockées uniquement en mémoire dans `server-store.ts`. | **FAILED** |
| **Règles Comptables & Anti-Double-Compte** | Zéro double comptage entre commandes, réceptions, stocks, dettes et projets. Retenues de garantie (5%) et TVA (19%) conformes. | **VERIFIED** |
| **3-Way Matching** | Rapprochement unitaire opérationnel. Tolérance de 100 DA codée en dur. Absence de multi-rapprochement (plusieurs BR pour 1 facture, ou facturation partielle de BC). | **PARTIALLY VERIFIED** |
| **Sécurité des Routes API** | Les routes de lecture `GET /api/finance/*` ne vérifient pas le token JWT ni les rôles utilisateurs. | **FAILED** |
| **Maker-Checker SoD** | Blocage des paiements sur factures non approuvées effectif, mais pas de règle empêchant le créateur d'approuver sa propre facture. | **PARTIALLY VERIFIED** |
| **Isolation DEMO** | Comptes et transactions démo étanches avec flag explicite, mais l'agrégateur global n'exclut pas le démo des totaux consolidés. | **BUSINESS DECISION REQUIRED** |
| **Validation par les Tests** | 11/11 étapes réussies en mémoire, mais aucune validation de persistance BD ni de requêtage HTTP avec authentification. | **PARTIALLY VERIFIED** |

---

### 3. Conditions Préalables Obligatoires (Gate de Sécurité avant Phase 6C)

Pour lever les réserves et autoriser le développement de l'interface utilisateur (Phase 6C), les 4 actions correctives suivantes doivent être programmées :

#### Condition P0 (Sécurité des Données) :
- **Sécuriser immédiatement l'API Gateway :** Ajouter le contrôle d'authentification et de rôle sur l'ensemble des routes `GET /api/finance/*` dans `apps/web/src/app/api/[...path]/route.ts`.

#### Condition P1 (Persistance Relationnelle Additionnelle) :
- **Modélisation Prisma Additive :** Introduire les modèles `FinancialAccount`, `CashTransaction`, `CustomerInvoice`, `SupplierInvoice` et `FinancialConfig` dans `schema.prisma` de manière purement additive (sans reset, sans altération des tables existantes), et adapter `db-bridge.ts` pour persister les écritures réelles dans Neon.

#### Condition P2 (Paramétrage Métier 3-Way Matching) :
- **Externaliser le seuil de tolérance :** Remplacer le seuil de 100 DA codé en dur dans `server-store.ts` par un paramètre dynamique `priceVarianceToleranceDA` issu de `StoredFinancialConfig`.

#### Condition P3 (Filtre d'Isolation DEMO / PRODUCTION) :
- **Garantir l'étanchéité des indicateurs :** Ajouter un filtre `where: { isDemoAccount: false }` dans le calcul de la synthèse financière lorsque l'utilisateur consulte la vue de production.

---

### 4. Recommandation à la Direction Générale

Il est recommandé à la Direction Générale de :
1. **Prendre acte** de la réussite de la modélisation fonctionnelle et algorithmique du Module 06.
2. **Autoriser une sous-phase de durcissement technique (Phase 6B.2)** dédiée à la sécurisation des routes API et à la persistance relationnelle Prisma/Neon avant de basculer sur les écrans React de la Phase 6C.
