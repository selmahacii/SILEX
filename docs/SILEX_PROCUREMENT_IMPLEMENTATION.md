# SILEX ERP — Implémentation du Module 03 : Achats, Approvisionnements, TCO et Stocks

**Version :** 1.0.0 (Phase 4)  
**Date :** Novembre 2026  
**Société :** SARL SILEX SERVICES  
**Statut :** Validé en Production & Tests E2E à 100%

---

## 1. Contexte & Enjeux Métier

Dans les secteurs de la **tuyauterie industrielle**, de la **maintenance d'usines** et des **arrêts d'unités pétrochimiques (Raffineries Sonatrach, champs gaziers, complexes GNL)**, la gestion de la chaîne d'approvisionnement (Supply Chain) présente des contraintes critiques :
- **Traçabilité métallurgique absolue** : Les tubes acier haute pression (ASTM A106 Gr.B) et les raccords forgés (ASTM A234) doivent impérativement être livrés avec leurs certificats matière **CCPU 3.1 EN 10204**. L'absence de ce certificat constitue un critère éliminatoire immédiat.
- **Contrôle strict des engagements budgétaires** : Chaque Bon de Commande (BC) émis doit être rattaché à un chantier précis et consommer l'enveloppe budgétaire engagée (`committedBudget`) sans impacter immédiatement les dépenses réelles décaissées (`spentBudget`).
- **Gestion fine des réceptions et rebuts** : Les réceptions sur chantiers ou au magasin central peuvent être partielles (reliquats). Les pièces non-conformes ou endommagées ne doivent jamais entrer dans le stock disponible.
- **Multi-magasins industriels** : Distinction ferme entre le **Magasin Central d'Arzew** (base logistique), les **Dépôts régionaux** (Skikda RA1K) et les **Magasins Chantiers mobiles** (Hassi Messaoud).
- **Régularisation traçable des inventaires** : Les écarts d'inventaires constatés lors des comptages physiques doivent faire l'objet d'un arbitrage de la Direction Générale avant toute régularisation dans le grand livre des stocks.

---

## 2. Architecture Technique & Composants

L'implémentation respecte rigoureusement l'architecture monorepo PNPM / Next.js 15 / NestJS 11 / TypeScript :

```
apps/web/src/
├── lib/
│   ├── server-store.ts        # Moteur transactionnel en mémoire avec persistance & audit trail
│   ├── db-bridge.ts           # Pont unifié ORM Prisma PostgreSQL & Fallback Store
│   └── auth-server.ts         # Validation JWT & extraction de l'utilisateur connecté
├── app/
│   ├── api/[...path]/route.ts # Passerelle API REST dynamique gérant GET, POST, PATCH
│   └── (dashboard)/
│       ├── procurement/       # Interface Achats (EB, DA, RFQ, TCO, BC, Contrats, Évaluations)
│       └── inventory/         # Interface Stocks (Multi-Magasins, Mouvements, BR, Inventaires)
scripts/
├── test-procurement-e2e.js    # Suite automatisée de tests E2E couvrant les 18 étapes du cycle
└── run-all-e2e.js             # Orchestrateur des suites E2E (Modules 01, 02 et 03)
```

---

## 3. Entités & Modèles de Données Développés

### 3.1 Expression de Besoin (EB) — `StoredNeedRequest`
Distincte de la Demande d'Achat, l'EB est initiée directement sur le site industriel par le Chef de Chantier :
- `reference` : Identifiant unique `EB-YYYY-NNN`.
- `projectId`, `projectCode`, `projectName`, `siteLocation` : Rattachement au chantier.
- `priority` : `URGENTE`, `NORMALE`, `CRITIQUE`.
- `category` : `TUYAUTERIE`, `SOUDAGE`, `ROBINETTERIE_HP`, `EQUIPEMENT_PROTECTION`, `OUTILLAGE`.
- `status` : `SOUMISE` -> `VALIDEE` (Responsable Projet) -> `CONVERTIE_EN_DA` (Responsable Achats) -> `REJETEE`.
- `items` : Liste des articles avec `quantity`, `unit`, `estimatedUnitPrice`, `technicalSpecs`.

### 3.2 Consultation Fournisseurs (RFQ) — `StoredRfqConsultation`
Permet la mise en concurrence transparente multi-fournisseurs :
- `reference` : `RFQ-YYYY-NNN`.
- `purchaseRequestId`, `purchaseRequestCode` : DA source.
- `closingDate` : Date limite de remise des plis tarifaires et techniques.
- `invitedSuppliers` : Fournisseurs homologués consultés.
- `offers` : Tableau des offres reçues (`StoredRfqOffer`).

### 3.3 Offre Fournisseur & Certifications — `StoredRfqOffer`
- `totalPriceHT`, `unitPriceHT`, `deliveryLeadTimeDays`, `warrantyMonths`.
- `certificationsProvided` :
  - `ccpu31` (boolean) : Certificat de conformité matière EN 10204 3.1.
  - `cndReport` (boolean) : Rapports de contrôle non destructif (Radio / US).
  - `coc` (boolean) : Certificat de conformité fabricant.
  - `atex` (boolean) : Homologation atmosphère explosible.
- `technicalComplianceRating` (/100), `qualityRating` (/100).
- `isEliminated` (boolean) et `eliminationReason` (ex: absence de CCPU 3.1).

### 3.4 Comparateur TCO Multicritères — `StoredTcoComparison`
Calcul mathématique objectif pour le choix de l'offre la plus avantageuse :
- Normalisation directionnelle des critères : Coût (35%), Délais (20%), Technique (25%), Qualité (10%), Garantie (10%).
- Gestion stricte de l'élimination : score à 0 et rang à 99 pour les offres non conformes aux critères obligatoires.
- `status` : `CALCULE` -> `APPROUVE_DG` (avec visa horodaté) -> `COMMANDE_GENEREE`.

### 3.5 Bon de Réception (BR) & Contrôle Qualité — `StoredGoodsReceipt`
- `receiptNumber` : `BR-YYYY-NNN`.
- `purchaseOrderId`, `purchaseOrderCode`, `warehouseId`.
- `deliveryNoteNumber` (N° BL Fournisseur), `carrierName`.
- `lines` :
  - `orderedQuantity`, `previouslyReceivedQuantity`.
  - `deliveredQuantity`, `rejectedQuantity`, `acceptedQuantity`.
  - `rejectionReason` (motif de non-conformité pour les pièces rebutées).
  - `remainingQuantity` : Reliquat restant à livrer.

### 3.6 Session d'Inventaire Physique — `StoredPhysicalInventory`
- `inventoryNumber` : `INV-YYYY-NNN`.
- `warehouseId`, `warehouseName`, `inventoryType` (`COMPLET`, `TOURNANT`).
- `itemsCounted` :
  - `theoreticalStock`, `physicalCount`.
  - `discrepancyQuantity` (écart quantité), `discrepancyValueDA` (écart valorisé).
  - `discrepancyReason`.
- `status` : `EN_COMPTAGE` -> `EN_VALIDATION_DG` -> `CLOTURE` (après génération automatique des mouvements `INVENTORY_ADJUSTMENT`).

### 3.7 Contrat-Cadre Fournisseur — `StoredSupplierContract`
- `contractNumber` : `CTR-FOU-YYYY-NNN`.
- `supplierId`, `supplierName`, `contractType` (`FOURNITURE_CADRE`, `PRESTATION_SERVICE`, `SOUS_TRAITANCE`).
- `totalAmountHT`, `startDate`, `endDate`, `hasRebateClause`, `paymentTerms`.
- `attachments` : Liens vers conventions signées et barèmes négociés.

### 3.8 Évaluation de la Performance Fournisseur — `StoredSupplierEvaluation`
- `evaluationNumber` : `EVAL-YYYY-NNN`.
- Notation pondérée : Qualité (35%), Respect des Délais (30%), Compétitivité Prix (20%), Réactivité (15%).
- `totalScore` (/100), `starRating` (/5).
- `classification` : `STRATEGIQUE_A` (>=90), `QUALIFIE_B` (70-89), `SOUS_VIGILANCE_C` (50-69), `SUSPENDU_D` (<50).

---

## 4. Endpoints API Implémentés

| Méthode | Route API | Rôle Requis / ABAC | Description |
|---|---|---|---|
| `GET` | `/api/procurement/need-requests` | Tout rôle avec accès Projet | Liste des expressions de besoin |
| `POST` | `/api/procurement/need-requests` | Chef de Chantier, Resp. Projet | Création d'une EB |
| `POST` | `/api/procurement/need-requests/:id/validate` | Resp. Projet, Direction | Validation d'une EB |
| `POST` | `/api/procurement/need-requests/:id/convert-to-da` | Resp. Achats, Direction | Conversion d'EB en DA officielle |
| `GET` | `/api/procurement/rfq` | Achats, Direction | Liste des consultations RFQ |
| `POST` | `/api/procurement/rfq` | Resp. Achats | Lancement d'un appel d'offres RFQ |
| `POST` | `/api/procurement/rfq/:id/offers` | Acheteur, Resp. Achats | Enregistrement d'une offre fournisseur |
| `POST` | `/api/procurement/rfq/:id/tco-evaluate` | Resp. Achats, Direction | Calcul de la matrice comparative TCO |
| `POST` | `/api/procurement/tco/:id/approve-dg` | Direction Générale uniquement | Visa et approbation DG du TCO |
| `POST` | `/api/procurement/tco/:id/create-po` | Resp. Achats, Direction | Génération du BC depuis le TCO approuvé |
| `GET` | `/api/procurement/contracts` | Achats, Finance, DG | Liste des contrats fournisseurs |
| `POST` | `/api/procurement/contracts` | Direction Générale, Resp. Achats | Enregistrement d'un contrat-cadre |
| `GET` | `/api/inventory/goods-receipts` | Magasinier, Achats, Direction | Historique des réceptions |
| `POST` | `/api/inventory/goods-receipts` | Magasinier, Responsable Dépôt | Enregistrement BR avec contrôle qualité |
| `GET` | `/api/inventory/physical-inventories` | Magasinier, Direction | Sessions d'inventaire |
| `POST` | `/api/inventory/physical-inventories` | Resp. Dépôt, Direction | Lancement d'une session d'inventaire |
| `POST` | `/api/inventory/physical-inventories/:id/count` | Équipe d'inventaire | Saisie des comptages physiques |
| `POST` | `/api/inventory/physical-inventories/:id/validate-adjust` | Direction Générale uniquement | Validation DG & Régularisation du stock |
| `GET` | `/api/procurement/evaluations` | Achats, Direction | Liste des évaluations fournisseurs |
| `POST` | `/api/procurement/evaluations` | Comité Achats / Qualité | Enregistrement d'une notation fournisseur |
| `PATCH` | `/api/procurement/suppliers/:id/status` | Resp. Achats, Direction | Mise à jour du statut fournisseur |
| `GET` | `/api/procurement/kpis` | Direction, Achats, Contrôle | KPIs réels achats |
| `GET` | `/api/inventory/kpis` | Direction, Magasin, Contrôle | KPIs réels stocks |

---

## 5. Distinction Budgétaire & Sécurité Financière

Le cycle implémenté élimine tout risque de double comptabilisation grâce à un découplage rigoureux :

1. **Expression de Besoin (EB) & Demande d'Achat (DA)** : 
   - Impact budgétaire : `0 DA`. Statut d'estimation pure.
2. **Bon de Commande (BC) Approuvé** : 
   - Impact : `committedBudget += totalHT`. Le budget engagé est réservé sur le projet. `spentBudget` reste inchangé.
3. **Réception Marchandise (BR)** : 
   - Impact : Entrée physique en stock magasin (`currentStock += acceptedQty`). Aucune modification du budget projet tant que les pièces n'ont pas quitté le magasin vers le chantier.
4. **Sortie Chantier (Bon de Sortie BS)** : 
   - Impact : `committedBudget -= sortieAmount` et `spentBudget += sortieAmount`. Le coût est officiellement consommé par le chantier.

---

## 6. Validation & Tests Automatisés

Le script `scripts/test-procurement-e2e.js` valide de bout en bout l'intégralité du cycle en 18 étapes critiques avec assertions strictes :
- **Succès 100%** : Toutes les étapes nominales et les tests de robustesse négatifs passent sans erreur.
- **Non-régression totale** : `scripts/run-all-e2e.js` confirme que les suites des Modules 01 (Commercial), 02 (Projet) et 03 (Achats/Stocks) s'exécutent de concert avec 100% de réussite.
- **Compilation Production** : `pnpm --filter @silex/web exec next build` génère les 19 routes statiques et dynamiques sans aucun avertissement.
