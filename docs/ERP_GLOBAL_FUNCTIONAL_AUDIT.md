# SILEX SERVICES ERP — AUDIT FONCTIONNEL GLOBAL, INTÉGRITÉ DES DONNÉES, ARCHITECTURE API & ANALYSE TECHNIQUE
**Date de l'audit** : 15 Novembre 2026  
**Auteur** : Architecte Logiciel Senior & Lead Auditeur ERP SILEX  
**Version** : 1.0.0 — Enterprise-Grade Industrial ERP Audit  
**Périmètre** : SARL SILEX SERVICES ERP (Monorepo PNPM : `apps/api` [NestJS 11], `apps/web` [Next.js 15.5 App Router], `packages/shared`, `packages/contracts`, `packages/validation`, PostgreSQL 16 Alpine Docker / Neon)

---

## 1. SYNTHÈSE EXÉCUTIVE & CONSTAT GLOBAL

L'audit technique et fonctionnel complet de la plateforme **SILEX SERVICES ERP** a été réalisé conformément aux règles de gouvernance industrielle, d'intégrité comptable et de sécurité applicative.

### 1.1. État Actuel du Système
La plateforme actuelle dispose d'un socle technique avancé, combinant :
- Une modélisation relationnelle riche sous **Prisma ORM** (39 modèles dans `apps/api/prisma/schema.prisma`).
- Un backend **NestJS 11** structuré en 12 modules opérationnels avec gardes JWT, décorateurs de rôles et audit trail.
- Un frontend **Next.js 15.5** (App Router) ergonomique, stylisé aux couleurs institutionnelles de SILEX SERVICES (`#07164D`, `#0B207D`, `#E51A1A`, `#0A7F7C`).
- Une passerelle **dbBridge** / **serverStore** hybride assurant la continuité fonctionnelle et la persistance sur base PostgreSQL 16.

### 1.2. Problèmes Majeurs Identifiés (P0 / P1)
Toutefois, l'inspection minutieuse du code, des données et des flux a révélé des incohérences structurelles critiques qui empêchent actuellement l'application d'atteindre le statut d'ERP industriel d'entreprise prêt pour l'exploitation en production :

1. **Calcul erroné de la marge consolidée (94,4 %)** : La formule utilisée dans `apps/web/src/app/(dashboard)/reports/page.tsx` assimile l'enveloppe budgétaire prévisionnelle au coût total du projet et ignore les engagements et les coûts réels.
2. **Double comptabilisation et désynchronisation du chiffrage commercial (`FC-2026-001`)** : Les lignes de débours des contributions Projet, Achats et RH se superposent sans réconciliation univoque des postes de dépenses.
3. **Désynchronisation de la boîte d'arbitrage DG et du tableau de bord exécutif** : Le tableau de bord DG ne filtre et ne présente que les demandes d'achat et les situations de travaux, excluant de fait les fiches de chiffrage commercial en attente de visa DG.
4. **Pipeline commercial imprécis et statuts non normalisés** : Des fallbacks statiques subsistent (`74 500 000 DA`) et les statuts CRM ne distinguent pas les étapes réelles du cycle d'avant-vente industriel.
5. **Mélange de données de démonstration et absence de tag de provenance** : La présence de mentions telles que `Client Industrie Démo` pollue le référentiel métier sans isolation stricte.
6. **Vulnérabilité critique de sécurité sur l'usurpation de rôle (`/auth/demo-switch`)** : Un endpoint d'API permet à tout client de s'octroyer le rôle `DIRECTEUR_GENERAL` avec permissions complètes (`['*']`), et des messages d'aide dans l'interface incitent à basculer de rôle côté client pour contourner la SoD.
7. **Fonctionnalités purement décoratives (Weld Book, upload GED, exports)** : Le Weld Book (`quality/page.tsx`) n'est stocké que dans un état React local volatil (`useState`), les boutons d'export manquent de filtres dynamiques, et l'enregistrement de documents GED ne stocke aucun fichier binaire.

---

## 2. AUDIT DÉTAILLÉ DES MODULES FONCTIONNELS

| Module | Composants & Routes | État Réel | Lacunes & Éléments Fictifs | Niveau de Risque |
| :--- | :--- | :--- | :--- | :--- |
| **01. Authentification & Sécurité** | `/login`, `/api/auth/*`, `auth-context.tsx`, `auth-server.ts` | Partiellement sécurisé | Route `/auth/demo-switch` non protégée en environnement non-dev. Messages invitant à basculer sur profil DG. | **CRITIQUE (P0)** |
| **02. Rapports & Contrôle de gestion** | `/(dashboard)/reports/page.tsx`, `apps/api/src/modules/reports` | Incomplet / Erroné | Marge globale calculée à 94.4%. Absence de filtres analytiques (wilaya, pôle, dates, démo/réel). Export PDF/Excel non paramétrable. | **ÉLEVÉ (P1)** |
| **03. Projets Industriels** | `/(dashboard)/projects`, `projects/[code]`, `modules/projects` | Très avancé mais non consolidé | 12 onglets prévus mais certains reposent sur des listes partielles. Colonnes de localisation confondues avec le client (Sonelgaz / Kais). Risque calculé arbitraire. | **MOYEN (P2)** |
| **04. Commercial & Chiffrage** | `/(dashboard)/commercial`, `modules/commercial` | Partiellement connecté | Double comptabilisation des lignes de coûts dans `FC-2026-001`. Pipeline commercial non conforme au cycle CRM industriel. | **ÉLEVÉ (P1)** |
| **05. Arbitrages & Workflows (SoD)** | `/(dashboard)/workflows`, `dashboard/page.tsx`, `modules/workflows` | Fonctionnel mais asymétrique | Exclusion des fiches de chiffrage sur le dashboard DG. SoD contournable via le sélecteur démo. | **ÉLEVÉ (P1)** |
| **06. Achats & Stocks** | `/(dashboard)/procurement`, `inventory`, `modules/procurement` | Fonctionnel | Rapprochement 3-way développé en phase 6C.4. Stocks multi-statuts (réservé, commandé, reçu) à lier strictement au projet. | **MOYEN (P2)** |
| **07. RH Industriel & CQS** | `/(dashboard)/hr`, `modules/hr` | Fonctionnel avec lacunes | Rémunération ambiguë (taux journalier vs salaire mensuel). Pointages chantier à relier au circuit de validation hiérarchique. | **MOYEN (P2)** |
| **08. QHSE & GED** | `/(dashboard)/quality`, `modules/quality` | Incomplet / Écrans décoratifs | Weld Book stocké dans un `useState` React sans persistance ni API backend. GED sans stockage de fichiers ni gestion de révisions. | **ÉLEVÉ (P1)** |
| **09. Finance & Trésorerie** | `/(dashboard)/finance`, `modules/finance` | Conforme à la Phase 6C.2.1 / 6C.4 | **Périmètre préservé : lecture seule**. Aucune nouvelle écriture bancaire développée. Moteur 3-way conservé intact. | **SÉCURISÉ** |
| **10. Tableau de Bord DG** | `/(dashboard)/dashboard/page.tsx` | Désynchronisé | N'affiche que 2 types de workflows (DA et Situations). Éléments statiques résiduels. Calcul de marge incohérent. | **ÉLEVÉ (P1)** |

---

## 3. AUDIT DES ANOMALIES PRIORITAIRES (SECTION 2 DE LA MISSION)

### 3.1. Anomalie 2.1 — Marge consolidée affichée à +94,4 %
- **Données observées** :
  - Marché contractuel : 225 000 000 DA
  - Budget prévu : 12 500 000 DA
  - Engagements BC : 0 DA
  - Coûts réels : 0 DA
  - Marge affichée : +94,4 %
  - Avancement physique : 5,5 %
- **Diagnostic de la formule** :
  Dans `apps/web/src/app/(dashboard)/reports/page.tsx` (lignes 46-48) :
  ```typescript
  const marginGlobal = totalContract > 0
    ? (((totalContract - totalBudget) / totalContract) * 100).toFixed(1)
    : '0.0';
  ```
  Le code calcule `(225 000 000 - 12 500 000) / 225 000 000 = 212 500 000 / 225 000 000 = 0,9444 = 94,4 %` !
- **Faute conceptuelle** :
  L'application a traité l'enveloppe budgétaire allouée (`budgetAmount`) comme étant le coût total prévu du marché, considérant que tout le reste du montant du contrat était de la marge pure !
  De plus, en l'absence de coûts réels (`actualCost = 0`) et d'engagements (`committedCost = 0`), aucune marge réalisée ne peut être constatée.
- **Règle de correction obligatoire** :
  1. Distinguer formellement :
     - Chiffre d'Affaires Contractuel HT ($CA$)
     - Budget Initial ($B_{init}$)
     - Budget Révisé ($B_{rev}$)
     - Coûts Engagés par BC ($C_{eng}$)
     - Coûts Réceptionnés ($C_{rec}$)
     - Coûts Réels Comptabilisés ($C_{reel}$)
     - Coût Prévisionnel à Terminaison ($EAC = C_{reel} + ETC$)
     - Marge Prévisionnelle : $CA - EAC$ (en DA) et $(CA - EAC) / CA$ (en %)
     - Marge Réalisée sur Décomptes Validés : Situations Facturées - Coûts Réels
  2. Si $EAC$ ou le budget révisé n'est pas renseigné ou si les coûts sont nuls sur un chantier naissant, afficher « **Non calculable** » ou « **Données insuffisantes** ».

---

### 3.2. Anomalie 2.2 — Réconciliation du chiffrage commercial (`FC-2026-001`)
- **Données annoncées** :
  - Prix de vente HT : 38 700 000 DA
  - Coûts directs annoncés : 26 090 000 DA
  - Frais indirects (12 %) : 3 130 800 DA
  - Coût total estimé : 29 220 800 DA
  - Marge brute annoncée : 9 479 200 DA
  - Marge sur coût : 32,44 % ($9\,479\,200 / 29\,220\,800$)
  - Taux de marque : 24,49 % ($9\,479\,200 / 38\,700\,000$)
- **Décomposition des contributions constatée dans le code** :
  - *Contribution Projet* : 3 lignes totalisant **8 800 000 DA** (Échafaudages ATEX 1,8M, Tuyauterie Inox 4,8M, CND/Épreuves 2,2M).
  - *Contribution Achats* : 4 lignes totalisant **15 200 000 DA** (Tubes Inox 8,5M, Brides ANSI 3,2M, Consommables TIG 1,1M, Location grue 2,4M).
  - *Contribution RH* : 4 lignes totalisant **8 730 000 DA** + Frais de vie et déplacement annoncés à **2 160 000 DA** = **10 890 000 DA**.
  - *Somme brute non réconciliée* : $8\,800\,000 + 15\,200\,000 + 10\,890\,000 = 34\,890\,000\text{ DA} \neq 26\,090\,000\text{ DA}$.
- **Origine de l'écart** :
  La contribution Projet décrivait des forfaits globaux de travaux (ex: tuyauterie 4,8M) qui comprenaient déjà la main-d'œuvre des tuyauteurs et les tubes inox achetés ! En additionnant les fournitures Achats (15,2M) et la MO RH (10,89M), on obtient exactement les **26 090 000 DA** ($15,2\text{M} + 10,89\text{M} = 26,09\text{M}$). Les lignes du Projet étaient donc redondantes et comptaient en double !
- **Règle de correction obligatoire** :
  - Le module Projet ne doit pas saisir de lignes de dépenses financières brutes directes si celles-ci sont déjà valorisées par les Achats et les RH. Le Projet définit les **quantités physiques, métrés, durées et contraintes**.
  - Les Achats valorisent les **articles, fournitures, sous-traitance et matériels loués**.
  - Les RH valorisent les **taux de main-d'œuvre, heures supplémentaires et frais de mission**.
  - La Finance applique le coefficient de frais généraux indirects et vérifie le BFR.
  - Calculs Decimal stricts côté backend :
    $$\text{Prix de revient} = \text{Coûts directs} + \text{Coûts indirects}$$
    $$\text{Marge brute} = \text{Prix de vente HT} - \text{Prix de revient}$$
    $$\text{Taux de marque} = \frac{\text{Marge brute}}{\text{Prix de vente HT}}$$
    $$\text{Marge sur coût} = \frac{\text{Marge brute}}{\text{Prix de revient}}$$

---

### 3.3. Anomalie 2.3 — Synchronisation des arbitrages DG
- **Symptôme** :
  La fiche `FC-2026-001` est en attente d'arbitrage DG (38 700 000 DA HT / 46 053 000 DA TTC), visible dans la boîte `/workflows`, mais le tableau de bord exécutif (`/dashboard`) affiche 0 validation ou ne liste pas ce dossier.
- **Origine technique** :
  1. Dans `apps/api/src/modules/workflows/workflows.service.ts` (lignes 14-55) :
     La méthode `getPendingValidations()` interroge uniquement `prisma.purchaseRequest` et `prisma.workSituation`. Elle ne dispose d'aucune logique pour interroger les fiches de coût (`CostSheet` ou `CommercialCostSheet`).
  2. Dans `apps/web/src/app/(dashboard)/dashboard/page.tsx` (ligne 490) :
     Le composant affiche :
     ```tsx
     {w.type === 'PURCHASE_REQUEST' ? "Demande d'Achat (DA)" : "Situation de Travaux"}
     ```
     Un dossier de type `COST_SHEET` est soit ignoré, soit affiché avec des liens cassés vers `w.projectCode` (qui n'existe pas encore puisque le projet n'est pas créé avant l'arbitrage !).
- **Règle de correction obligatoire** :
  - Le service Workflow et le tableau de bord DG doivent consommer le même catalogue unifié d'arbitrages (`WORKFLOW_INBOX`).
  - Gérer les 3 types majeurs d'arbitrage DG :
    1. `COST_SHEET` (Validation du chiffrage commercial et autorisation de soumission de l'offre).
    2. `PURCHASE_REQUEST` (Engagement de dépense supérieur aux délégations des Chefs de Projet).
    3. `WORK_SITUATION` (Validation des décomptes mensuels de travaux à facturer au client).
  - Traitement transparent des métadonnées (Projet lié OU Opportunité liée).

---

### 3.4. Anomalie 2.4 — Pipeline commercial incohérent
- **Symptôme** :
  Affichage d'un pipeline de `74 500 000 DA` avec 2 opportunités actives, mais une zone affichant 0 affaire en négociation.
- **Origine technique** :
  1. `commercial/page.tsx` contenait des valeurs de secours statiques codées en dur : `kpis?.pipelineValue ?? 74500000` et `kpis?.conversionRate ?? 50.0%`.
  2. Les statuts d'opportunités utilisaient des chaînes ad hoc (`EN_ETUDE`, `BROUILLON`) sans correspondance avec les phases réelles d'avant-vente industrielle.
  3. Aucune opportunité n'était au statut `NEGOCIATION`, d'où l'indicateur à zéro.
- **Règle de correction obligatoire** :
  Normaliser l'énumération des statuts du CRM industriel :
  - `NOUVELLE` : Réception de l'avis de consultation / AO.
  - `QUALIFIEE` : Éligibilité technique et administrative confirmée.
  - `VISITE_TECHNIQUE` : Visite sur site / clarification client effectuée.
  - `CHIFFRAGE` : Fiche de coût collaborative en cours d'élaboration.
  - `VALIDATION_INTERNE` : Dossier soumis à l'arbitrage de la Direction Générale.
  - `OFFRE_SOUMISE` : Offre technique et financière transmise au maître d'ouvrage.
  - `NEGOCIATION` : Négociations commerciales / alignement final.
  - `GAGNEE` : Notification d'attribution reçue (déclenche la conversion en Marché/Projet).
  - `PERDUE` : Offre rejetée ou non retenue.
  - `ANNULEE` : Consultation annulée par le client.
  - Valeur pondérée = $\sum (\text{Montant estimé} \times \text{Probabilité de succès})$.

---

### 3.5. Anomalie 2.5 — Séparation données réelles / démonstration
- **Symptôme** :
  Le client nommé `Client Industrie Démo (Sonatrach Raffinerie Skikda)` apparaissait en dur dans les fiches commerciales et les rapports consolidés.
- **Origine technique** :
  Le seed initial (`initCommercialBaseline` et mock store) mélangeait des données fictives de démonstration avec le registre normal de l'application sans identifiant de provenance.
- **Règle de correction obligatoire** :
  - Chaque entité métier (Opportunité, Devis, Projet, DA, Facture, Employé, Document) doit comporter un indicateur de source d'origine :
    - `PERSISTED` : Enregistrement réel saisi et persisté en base de données PostgreSQL.
    - `DEMO` : Enregistrement de démonstration / formation.
    - `IMPORTED` : Donnée issue d'un import de migration.
    - `CALCULATED` : Agrégation analytique calculée à la volée.
  - Les rapports officiels et les tableaux de bord doivent être filtrables pour exclure automatiquement tout enregistrement marqué `DEMO`.
  - Le titre et l'en-tête des exports doivent mentionner explicitement le périmètre retenu : *« Périmètre : Données réelles certifiées de production »* ou *« Périmètre : Environnement de test / Démonstration »*.

---

### 3.6. Anomalie 2.6 — Confidentialité des rôles & Sécurité du changement de profil
- **Symptôme** :
  L'application expose un endpoint `/api/auth/demo-switch` et affichait des invites incitant l'utilisateur à basculer sur le profil Directeur Général pour approuver des dossiers.
- **Diagnostic de sécurité** :
  Dans `apps/web/src/app/api/auth/demo-switch/route.ts` :
  ```typescript
  const token = generateAuthToken(user);
  const payload = {
    accessToken: token,
    user: { ...user, permissions: ['*'] }
  };
  return NextResponse.json(payload);
  ```
  Tout utilisateur ou script externe pouvait forger un appel POST avec `{ "role": "DIRECTEUR_GENERAL" }` et recevoir un jeton JWT avec droits absolus `['*']` sans aucun contrôle de mot de passe ni vérification de session !
- **Règle de correction obligatoire** :
  1. **Suppression immédiate de toute possibilité de changement de rôle non authentifié**.
  2. L'accès aux privilèges du Directeur Général doit être strictement subordonné à l'authentification avec identifiants sécurisés (email et mot de passe chiffré par Argon2).
  3. L'endpoint `/api/auth/demo-switch` doit être désactivé en production (`NODE_ENV === 'production'`) et retourner impérativement `403 Forbidden` si `DEMO_MODE !== 'true'`.
  4. La Ségrégation des Fonctions (SoD) doit être contrôlée exclusivement côté backend : si un utilisateur n'a pas le rôle DG, le backend rejette la décision avec HTTP 403, sans jamais faire confiance à un rôle transmis par le client.
  5. Suppression de tous les messages incitant à contourner la SoD dans l'interface utilisateur.

---

## 4. AUDIT DES FONCTIONNALITÉS DÉCORATIVES OU FICTIVES À CORRIGER

### 4.1. Module QHSE — Weld Book (Cahier de Soudage)
- **Constat** :
  Le Weld Book (`apps/web/src/app/(dashboard)/quality/page.tsx`, lignes 261-279) enregistre les soudures uniquement dans un tableau mémoire React :
  `setWeldRecords(prev => [newWeld, ...prev])`.
  Aucune route API backend n'est appelée. Aucun modèle Prisma n'existe pour stocker les repères isométriques, les nuances d'acier, les DMOS, les soudeurs certifiés ou les résultats de contrôle CND.
- **Conséquence** :
  Tout rechargement de page (F5) efface l'intégralité du cahier de soudage. L'écran est purement décoratif.
- **Action corrective requise** :
  - Création du modèle Prisma `WeldRecord` et `WeldInspectionReport`.
  - Implémentation des routes backend `GET /api/quality/weld-book` et `POST /api/quality/weld-book`.
  - Connexion réelle du formulaire modal au backend avec validation des qualifications soudeurs (ASME IX / ISO 9606).

### 4.2. Module QHSE — Bibliothèque Documentaire GED
- **Constat** :
  Le formulaire d'ajout de document ne télécharge aucun fichier physique (PDF, scan). Le champ `file` est ignoré. De plus, aucun mécanisme de révision documentaire (Rev A, Rev 0, Rev 1) ni d'archivage des anciennes versions n'est implémenté.
- **Action corrective requise** :
  - Support du cycle de vie documentaire : `BROUILLON`, `EN_REVUE`, `APPROUVE`, `EN_VIGUEUR`, `OBSOLETE`, `ARCHIVE`.
  - Gestion des métadonnées de fichier, versioning incrémental et historique des approbations.

### 4.3. Module Projets — Découpage Budgétaire et Avancement
- **Constat** :
  L'avancement physique (5,5 %) et l'avancement financier sont souvent confondus ou figés. Les budgets par lots (main-d'œuvre, matières, engins, sous-traitance) ne sont pas recalculés de manière dynamique en fonction des bons de commande validés et des situations réelles.
- **Action corrective requise** :
  - Structure de décomposition du travail (WBS) et budget analytique par postes de dépenses.
  - Distinction stricte : Avancement Physique (%) mesuré sur attachements de travaux contradictoires vs Avancement Financier (%) mesuré par le ratio de facturation/dépenses.

---

## 5. AUDIT D'ARCHITECTURE & INFRASTRUCTURE

### 5.1. Coexistence Backend NestJS et Passerelle Next.js
- Le projet dispose d'un backend NestJS complet dans `apps/api` (port 4000) et d'une route passerelle universelle `apps/web/src/app/api/[...path]/route.ts` (port 3000).
- Le frontend `api-client.ts` cible `/api/*` sur la même origine lorsqu'aucune URL externe n'est spécifiée.
- La passerelle Next.js s'appuie sur `dbBridge` qui encapsule Prisma pour interroger directement PostgreSQL tout en fournissant une tolérance de panne avec `serverStore`.
- **Règle architecturale** :
  - Ne pas créer un troisième système.
  - Standardiser les contrats d'API entre les deux couches pour garantir que les calculs de gestion, les permissions RBAC et les règles SoD soient strictement identiques, quel que soit le canal d'appel.

### 5.2. Base de Données & Environnements
- **Environnement de Production** : Neon Cloud PostgreSQL (interdit de migration destructive et de tests pendant la mission).
- **Environnement Isolé de Test** : Conteneur Docker local `silex_postgres` (PostgreSQL 16 Alpine sur port `5433`).
- **Règle absolue** :
  - Aucun `prisma migrate reset`, `DROP` ou `TRUNCATE`.
  - Conservation intégrale de l'historique des migrations SQL.
  - Validation sur base PostgreSQL 16 isolée.

---

## 6. MATRICE DE CONFORMITÉ GLOBALE & CRITÈRES D'ACCEPTATION

| Domaine | Exigence Auditée | Conformité Initiale | Cible Post-Remédiation |
| :--- | :--- | :---: | :---: |
| **Gouvernance Git & DB** | Aucune perte de données, pas de migration destructive sur Neon | ✅ Conforme | ✅ Maintenu |
| **Sécurité RBAC** | Blocage absolu de l'usurpation de rôle DG via frontend | ❌ Non conforme | ✅ Verrouillé (403 si non auth) |
| **Calculs de Marge** | Marge brute analytique basée sur EAC et coûts réels | ❌ Non conforme (94.4%) | ✅ EAC & Formules certifiées |
| **Chiffrage Commercial** | Réconciliation stricte des contributions sans doublons | ❌ Non conforme | ✅ Modèle 4 pôles sans superposition |
| **Boîte d'Arbitrage DG** | Synchronisation 100% avec le tableau de bord exécutif | ❌ Non conforme | ✅ Source de vérité unique |
| **Pipeline CRM** | Statuts industriels normalisés et probabilités de gain | ❌ Non conforme (fallbacks) | ✅ Cycle de vente 10 étapes |
| **GED & Qualité** | Persistance réelle du Weld Book et traçabilité CND | ❌ Fictif (React state) | ✅ Modèle Prisma & API complète |
| **Périmètre Finance** | Maintien strict de la lecture seule (Phase 6C.2.1 / 6C.4) | ✅ Conforme | ✅ Zéro nouvelle écriture financière |
