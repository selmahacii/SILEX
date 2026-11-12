# RAPPORT D'AUDIT TECHNIQUE ET FONCTIONNEL DU PROTOTYPE ERP SILEX SERVICES
**Document de Référence — Phase 1 de Qualification & Audit**  
**Date d'audit :** Novembre 2026  
**Auditeur :** Équipe d'Ingénierie & Architecture ERP (Senior Team)  
**Client :** SARL SILEX SERVICES (Algérie — Travaux neufs, Tuyauterie, HVAC, Maintenance industrielle, Chaudronnerie)  
**Fichier :** `docs/SILEX_AUDIT.md`

---

## 1. ARCHITECTURE ACTUELLE

Le projet SILEX ERP est structuré sous la forme d'un **Monorepo PNPM** avec espaces de travail (`pnpm-workspace.yaml`), découpé en deux applications principales et trois packages partagés :

```
SILEX/
├── apps/
│   ├── api/          # Backend NestJS 11 (Architecture en couches, Contrôleurs, Services, Modules)
│   └── web/          # Frontend Next.js 15 (App Router, Tailwind CSS 4, React 19) + API Routes Bridge
├── packages/
│   ├── shared/       # Énumérations (SystemRole, DepartmentCode), types, devises (DZD), constantes
│   ├── contracts/    # DTOs, interfaces de requêtes et de réponses normalisées
│   └── validation/   # Schémas Zod de validation des formulaires et entités
├── infrastructure/   # Dockerfile multi-stage, docker-compose (PostgreSQL 16, Caddy HTTPS)
├── scripts/          # Suites de tests E2E, vérification de compatibilité, scripts de seed
└── docs/             # Spécifications métier, architecture, matrice de conformité
```

### Double Couche d'Exécution Backend / API :
1. **Couche NestJS (`apps/api`)** : API REST complète avec injection de dépendance, Prisma ORM, Passport-JWT, Argon2id, Guards RBAC/ABAC et Swagger.
2. **Couche Next.js Bridge (`apps/web/src/app/api/[...path]`)** : Route handler dynamique Next.js couplé à un `dbBridge` et un `serverStore`. Ce bridge a été conçu pour permettre un fonctionnement autonome hybride (notamment pour les démonstrations Vercel/Serverless sans instance NestJS active), interagissant soit directement avec PostgreSQL via Prisma (`@prisma/client`), soit via une mémoire tampon synchronisée.

---

## 2. TECHNOLOGIES DÉTECTÉES

| Couche | Technologie / Outil | Version détectée | Rôle dans l'application |
|---|---|---|---|
| **Gestionnaire de paquets** | PNPM | 11.8.0 | Monorepo workspaces |
| **Langage** | TypeScript | 5.7.3 | Typage strict partagé sur l'ensemble de la stack |
| **Frontend Framework** | Next.js (React 19) | 15.2.0 / 15.5.29 | App Router, rendu SSR, composants interactifs |
| **Styling & UI** | Tailwind CSS 4, Lucide React | 4.0.9 / 0.477.0 | Design system industriel épuré, responsive drawer |
| **Composants Table/Charts** | TanStack Table, Recharts | 8.21.2 / 2.15.1 | Tableaux d'audit et visualisation décisionnelle |
| **Backend Framework** | NestJS | 11.0.11 | Architecture modulaire, micro-framework Express 5 |
| **ORM & BDD** | Prisma ORM, PostgreSQL | 6.4.1 / 6.19.3 | Modélisation relationnelle, migrations, intégrité SQL |
| **Hébergement Base** | Neon Cloud PostgreSQL & Local Docker | PostgreSQL 16 | Dualité de connexion Cloud serverless et local 5433 |
| **Authentification API** | Passport JWT, Argon2id | 0.41.1 | Hachage sécurisé mémoires/temps et jetons JWT |
| **Sécurité Web** | Helmet, Compression, Rate Limiting | 8.0.0 | En-têtes HTTP sécurisés, prévention attaques |

---

## 3. ÉTAT DU FRONTEND

### Points forts constatés :
- **Navigation & Ergonomie** : Structure claire avec en-tête d'entreprise, sélecteur de rôles pour la démonstration, et barre latérale (`Sidebar`) récemment fixée (`fixed inset-y-0 left-0 w-64`) avec compensation propre de l'espace de travail (`lg:pl-64`).
- **Adaptation Mobile & Tablette** : Tiroir de navigation escamotable (`lg:hidden`) avec bouton hamburger, backdrop d'atténuation et fermeture automatique au changement de page.
- **Cohérence Visuelle** : Palette sobre aux couleurs institutionnelles de SILEX SERVICES (Bleu Nuit `#07164D`, Bleu Industriel `#0B207D`, Accent Rouge Sécurité `#E51A1A`, Blanc `#FFFFFF`).
- **Gestion des sessions** : Contexte d'authentification persistant (`localStorage`), rafraîchissement sans déconnexion intempestive.

### Manques et imperfections constatés :
- **Absence du Module Commercial** : Aucun onglet ni page `/commercial` ou `/cost-sheets` n'est actuellement exposé dans la navigation.
- **Formulaires manquants dans RH** : Pas d'interface pour soumettre des congés, des missions ou des demandes de recrutement.
- **Documents A4 normalisés** : Absence de gabarits d'impression normalisés (Devis, ODS, DA, Fiche de coût, Fiche de paie DEMO).

---

## 4. ÉTAT DU BACKEND

### Points forts constatés :
- Architecture modulaire claire dans `apps/api/src/modules/` :
  - `auth`, `users`, `projects`, `procurement`, `inventory`, `hr`, `fleet`, `quality`, `finance`, `workflows`, `audit`.
- Contrôle d'accès par décorateurs `@Roles(...)` et guards `@UseGuards(JwtAuthGuard, RolesGuard)`.
- Traçabilité universelle des actions : enregistrement dans `AuditLog` (utilisateur, rôle, action, entité, horodatage, adresse IP).
- Gestion transactionnelle stricte pour les stocks (verrouillage et vérification du solde disponible avant décrémentation).

### Incohérences et alertes backend :
- **Différence d'environnement de BDD** : `apps/api/.env` pointe vers une instance Docker locale `127.0.0.1:5433/silex_erp`, tandis que `apps/web/.env` et la racine pointent vers **Neon Cloud PostgreSQL**.
- **Jeton d'authentification du Next.js API Bridge** : Le fichier `apps/web/src/lib/auth-server.ts` génère et décode un jeton sous forme de chaîne préfixée sans signature HMAC (`silex_auth_token_...`), contrairement au NestJS qui utilise une signature JWT stricte (`jsonwebtoken`).
- **Exécution des tests Jest** : Les tests exécutés avec `pnpm --filter @silex/api test` échouent en partie car le mode démo n'est pas activé dans le process Jest (`DEMO_MODE !== 'true'`), et la base locale n'a pas été rechargée après le nettoyage demandé.

---

## 5. ÉTAT DE LA BASE DE DONNÉES

### Schéma relationnel Prisma :
Le schéma `apps/api/prisma/schema.prisma` compte **28 modèles** et **16 énumérations**. Les modèles couvrent :
- `User`, `Department`, `UserProjectAssignment`, `RefreshSession`, `AuditLog`, `Notification`
- `Project`, `ProjectMilestone`, `ProjectTask`, `ServiceOrder`, `WorkSituation`
- `Supplier`, `PurchaseRequest`, `PurchaseRequestLine`, `SupplierQuote`, `SupplierQuoteLine`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`
- `ItemCategory`, `Item`, `Warehouse`, `StockMovement`, `ProjectMaterialAllocation`
- `ProjectCostEntry`
- `Employee`, `EmployeeCertification`, `Attendance`
- `Asset`, `MaintenanceOrder`, `FuelRecord`
- `Document`, `NonConformity`, `CorrectiveAction`

### État actuel des données dans Neon PostgreSQL :
- **Utilisateurs** : 17 comptes réels configurés (Directeur Général, Responsables de projet, Achats, Magasin, RH, Finance, Maintenance, Qualité, Administrateur).
- **Départements** : 9 départements officiels initialisés.
- **Projets / Stocks / Opérations** : 0 ou 1 enregistrement suite au nettoyage demandé pour la mise en production.
- **Entités manquantes dans Prisma** :
  - Manque entité `CommercialOpportunity` (Prospection / Appels d'offres).
  - Manque entité `CostSheet` & `CostSheetContribution` (Fiche de coût collaborative 4 services).
  - Manque entité `CustomerQuote` (Devis client) et `Customer` (Référentiel Client).
  - Manque entité `LeaveRequest` (Congés / Absences) et `RecruitmentRequest` (Recrutement).
  - Manque entité `MissionOrder` (Ordres de mission).
  - Manque entité `CustomerInvoice` & `SupplierInvoice` (Facturation client/fournisseur).

---

## 6. FONCTIONNALITÉS DÉJÀ OPÉRATIONNELLES

| Module | Fonctionnalité | Description & Validation |
|---|---|---|
| **Sécurité & Auth** | Authentification Sécurisée | Hachage Argon2id, lockout anti force brute (5 tentatives / 15 min), exclusion stricte des hash de mots de passe. |
| **Sécurité & Auth** | Sélecteur de Rôles Démo | Permet de tester les 9 profils sans ressaisie de mot de passe tout en appliquant les restrictions réelles. |
| **DG & Pilotage** | Dashboard Direction Générale | Vue consolidée des KPIs financiers (CA, coûts réels, budget restant), répartition des coûts, alertes QCD. |
| **Projets** | Gestion des Chantiers | Création de projet, jalons contractuels, ODS (démarrage, arrêt, avenant), situations de travaux contradictoires. |
| **Projets** | Avancement Découplé | Suivi distinct de l'avancement physique (%) et financier (%). |
| **Achats** | Cycle DA → Consultation → BC | Expression de besoin avec imputation chantier, contrôle budgétaire, saisie des devis fournisseurs, validation DG. |
| **Achats** | Traitement Fiscal Algérien | Calcul dynamique HT / TVA au taux de droit commun (19%), réduit (9%) ou exonération ANDI (0%). |
| **Stocks** | Gestion Multi-Magasins | Réceptions fournisseurs avec incrémentation automatique, bons de sortie vers chantiers, traçabilité des mouvements. |
| **Stocks** | Intégrité & Anti-Stock Négatif | Verrouillage transactionnel interdisant toute sortie excédant la quantité physique réelle. |
| **Workflows** | Circuit d'Approbation DG | Validation/Rejet/Demande de révision avec signature électronique et journal d'audit horodaté. |
| **Parc & Maintenance**| Matériel & Engins | Inventaire des équipements, ordres de travail préventifs et correctifs. |
| **Qualité & HSE** | Non-Conformités & CND | Déclaration des NC par sévérité, actions correctives et bibliothèque documentaire. |

---

## 7. FONCTIONNALITÉS PARTIELLEMENT OPÉRATIONNELLES

1. **Ressources Humaines (`/hr`)** :
   - *Existant* : Annuaire des collaborateurs, certifications/habilitations techniques, saisie des pointages chantier.
   - *Incomplet* : Absence de gestion des congés/absences, pas de suivi des missions, pas d'expression de besoin de recrutement.
2. **Finance & Trésorerie (`/finance`)** :
   - *Existant* : Consolidation des débours et coûts réels chantier, suivi des retenues de garantie, enregistrement de règlements.
   - *Incomplet* : Absence de table des factures clients/fournisseurs formelle avec calcul d'échéances et balance âgée des créances.
3. **Achats & Comparatif Fournisseurs** :
   - *Existant* : Matrice comparative de prix unitaires et sélection d'un fournisseur recommandé.
   - *Incomplet* : Absence de la grille d'analyse TCO multicritères complète (coût total de possession : transport, garanties, délai, note qualité).
4. **Rapports & Éditions (`/reports`)** :
   - *Existant* : Tableaux récapitulatifs à l'écran.
   - *Incomplet* : Manque de modèles A4 imprimables ou exportables en PDF avec en-tête normalisé Silex.

---

## 8. FONCTIONNALITÉS ABSENTES (GAP ANALYSIS)

###  MODULE 01 — COMMERCIAL (ABSENT) :
- **Prospection & Appels d'offres** : Registre des consultations clients, dates limites de remise des offres, localisation et exigences.
- **Fiche de Coût Collaborative (PRIORITÉ ABSOLUE N°1)** :
  - Contribution Projet (métrés, durée, moyens techniques).
  - Contribution Achats (matériaux, sous-traitance, locations).
  - Contribution RH (effectifs, taux journaliers MO, frais de vie chantier).
  - Contribution Finance (faisabilité, trésorerie requise, risques financiers).
  - Consolidation automatique (coûts directs, indirects, marge, prix de vente DZD).
  - Circuit de validation DG et conversion automatique en Projet/Devis sans ressaisie.
- **Référentiel Clients & Enquêtes de satisfaction**.

###  MODULE 02 — PROJET (COMPLÉMENTS CRITIQUES) :
- **Rapport Journalier de Chantier (Daily Site Report)** : Météo, effectifs présents, engins mobilisés, travaux exécutés du jour, difficultés/arrêts, photos/PV.
- **Registre des Contraintes & Difficultés de Chantier** : Suivi des blocages avec plans d'action et alertes.

###  MODULE 04 — RH (COMPLÉMENTS NÉCESSAIRES) :
- **Demandes de Congés & Autorisations d'absence** avec workflow de validation hiérarchique.
- **Ordres de Mission & Rapports de mission**.
- **Demandes d'expression de recrutement**.
- **Fiche de Paie de Démonstration (Spécimen DEMO)**.

---

## 9. PROBLÈMES DE SÉCURITÉ

1. **Jeton d'authentification du Next.js API Bridge (P1)** :
   - Le token `silex_auth_token_...` n'est pas signé avec une clé cryptographique HMAC dans le pont Next.js. Bien que le backend NestJS utilise `passport-jwt` avec signature stricte, le bridge Next.js doit être sécurisé avec une signature cryptographique pour éviter toute altération côté client.
2. **Double source de vérité Auth/Rôles (P1)** :
   - Il convient de s'assurer que toutes les autorisations critiques (approbation DA, modification budget, création utilisateur) soient systématiquement vérifiées côté serveur et rejetées avec code `403 Forbidden` si le rôle est insuffisant.
3. **Exposition des secrets dans le dépôt (P0/Résolu)** :
   - Les fichiers `.env` contiennent des identifiants directs vers Neon PostgreSQL. Pour un déploiement public final, les secrets devront être injectés via les variables d'environnement de la plateforme d'hébergement.

---

## 10. PROBLÈMES DE PERFORMANCE

1. **Nombre d'allers-retours réseau sur le Dashboard** :
   - Le dashboard exécute 4 requêtes parallèles (`/projects/kpis`, `/projects`, `/workflows/inbox`, `/finance/distribution`). Sur une connexion 3G/4G chantier, regrouper ou mettre en cache ces indicateurs optimisera le temps de premier rendu.
2. **Latence de la base Neon Cloud (Ohio us-east-2 vs Algérie)** :
   - Neon est hébergé en Virginie/Ohio, ce qui introduit une latence réseau de 120-180ms par requête SQL depuis l'Algérie. L'utilisation du connection pooler (`-pooler`) est essentielle et le cache de session atténue cet impact.

---

## 11. PROBLÈMES DE DÉPLOIEMENT

1. **Désynchronisation entre `apps/api/.env` et `apps/web/.env`** :
   - `apps/api` pointe vers `127.0.0.1:5433` (Docker local) alors que `apps/web` pointe vers Neon Cloud. En cas de déploiement autonome, les deux applications doivent cibler la même chaîne de connexion.
2. **Build de production Next.js** :
   - Actuellement validé avec succès (18/18 routes statiques/dynamiques générées).

---

## 12. ERREURS DÉTECTÉES

1. **Échec de `pnpm --filter @silex/api test`** :
   - 23 tests sur 47 échouent actuellement lors du lancement local en raison de `DEMO_MODE !== 'true'` non défini dans l'environnement Jest et de tables vidées dans la base de test locale.
2. **Absence des routes commerciales côté client** :
   - Le menu ne propose aucun accès au cycle amont (devis, opportunité, fiche de coût).

---

## 13. RECOMMANDATIONS STRATÉGIQUES

1. **Conserver l'architecture Monorepo Modulaire** :
   - Ne pas scinder en 5 bases indépendantes pour le prototype, car cela casserait l'intégrité référentielle entre Projets, Achats, RH et Finance. Privilégier une base PostgreSQL partagée avec séparation logique stricte et droits d'accès par rôle.
2. **Implémenter immédiatement le Module Commercial & la Fiche de Coût Collaborative** :
   - C'est la priorité n°1 demandée par le client. Développer l'écran `/commercial` avec la matrice de contribution des 4 départements, la validation DG et la génération du projet.
3. **Harmoniser les données de démonstration avec le scénario unifié SILEX** :
   - Charger un scénario réaliste complet ("Projet DEMO — Maintenance installation industrielle", Client Industrie Démo, DA, Devis, Stock, Pointages, Factures) garantissant la parfaite continuité des données entre les 5 modules.
4. **Développer la bibliothèque d'éditions A4 normalisées** :
   - Intégrer les vues d'impression pour la Fiche de coût, le Devis, le Bon de commande, le Rapport de chantier journalier et le bulletin de paie DEMO.

---

## 14. PRIORITÉS DE CORRECTION & PLAN D'ACTION

| Priorité | Domaine | Action à entreprendre |
|---|---|---|
| **P0** | Sécurité | Signature cryptographique des jetons du bridge Next.js et sécurisation des endpoints |
| **P1** | Métier / Démo | **Création du Module Commercial (`/commercial`)** avec la Fiche de coût collaborative (4 contributions) |
| **P1** | Métier / Démo | **Workflow de validation DG & transformation automatique** de la Fiche de coût en Projet + Devis |
| **P1** | Métier / Démo | **Rapport Journalier de Chantier (`DailyReport`)** avec formulaire terrain et modèle imprimable |
| **P1** | Données | **Scénario de démonstration unique et cohérent** reliant commercial, projet, achats, RH et finance |
| **P2** | RH | Module congés, autorisations d'absence, ordres de mission et formulaire de recrutement |
| **P2** | Achats | Comparateur d'offres TCO multicritères formel |
| **P2** | Finance | Échéancier de facturation client/fournisseur et balance âgée |
| **P3** | Documents | Modèles d'impression A4 standardisés avec en-tête et pied de page officiels SILEX |

---
*Fin du rapport d'audit — Phase 1. Prêt pour la Phase 2 : Matrice de traçabilité et développement des fonctionnalités.*
