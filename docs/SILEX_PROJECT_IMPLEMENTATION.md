# ARCHITECTURE & IMPLÉMENTATION — MODULE 02 : PROJETS INDUSTRIELS & CHANTIERS
## ERP SARL SILEX SERVICES — PHASE 3

---

## 1. VISION GÉNÉRALE & OBJECTIF FONCTIONNEL

SARL Silex Services opère sur des chantiers industriels complexes (raffineries Sonatrach, centrales électriques Sonelgaz, cimenteries, complexes pétrochimiques, froid industriel). Ces interventions impliquent des travaux de **tuyauterie haute pression, soudage homologué (ASME IX, EN ISO), montage mécanique d'équipements lourds, contrôles non destructifs (CND) et arrêts techniques d'usines sous contrainte de temps sévère**.

Le Module **02 - Gestion de Projets & Chantiers** a été développé pour répondre concrètement à cette réalité opérationnelle. Il ne s'agit pas d'un simple outil de gestion de tâches générique, mais d'un **système de pilotage industriel de chantier contradictoire** interconnecté avec l'ensemble des départements de l'entreprise :

1. **Contractuel & Métrés contradictoires** : Découpage en lots, métrés réels contradictoires visés par le client et calcul automatique de l'avancement physique pondéré.
2. **Planning & Tâches opérationnelles** : Suivi fin par corps d'état (tuyauterie, soudage, mécanique, échafaudage), détection proactive et automatique des retards sur planning.
3. **Rapports Journaliers de Chantier (Daily Site Reports - RJC)** : Journal de bord légal et contradictoire consignant effectifs par corps d'état, heures travaillées, métrés réalisés, engins engagés, matériaux consommés, météo, quart d'heure sécurité, visa électronique et export imprimable conforme au format A4 officiel.
4. **Rapports de Situation Périodiques (RSP)** : Synthèses transversales transmises à la Direction Générale analysant l'avancement physique vs financier, l'écart budgétaire, les approvisionnements et les effectifs.
5. **Registre Centralisé des Contraintes & Points de Blocage** : Traçabilité des aléas chantiers (refus de permis client, intempéries, indisponibilité de zone, retard livraison) avec sévérité, impact délais/coûts, plan d'action et porteur.
6. **Qualité & Sécurité HSE** : Suivi des presque-accidents (near-misses), conformité des contrôles radiographiques (RT) et ressuage (PT), objectif Zéro Accident avec arrêt.
7. **Interconnexion Achats & Stocks** : Émission directe de Demandes d'Achat (DA) chantier vers le module Achats (incrémentant le budget engagé) et sorties réelles de magasin vers le chantier (déduisant le stock et imputant les dépenses réelles).
8. **Ressources Humaines & Pointages** : Suivi des effectifs mobilisés par qualification et demandes de renfort d'urgence.

---

## 2. MODÈLE DE DONNÉES & STRUCTURES DE STOCKAGE

Toutes les entités industrielles sont persistées avec intégrité référentielle dans le store centralisé (`apps/web/src/lib/server-store.ts`) et relayées de manière transparente vers l'API REST (`apps/web/src/app/api/[...path]/route.ts`) et le bridge de données (`apps/web/src/lib/db-bridge.ts`).

### A. Prestations Contractuelles & Métrés (`StoredContractItem`)
```typescript
interface StoredContractItem {
  id: string;
  itemCode: string;          // ex: LOT-01
  designation: string;       // ex: Préfabrication & montage tuyauterie acier carbone DN150
  unit: string;              // ml, U, kg, forfait
  contractQty: number;       // Quantité contractuelle du marché
  realizedQty: number;       // Quantité exécutée sur chantier
  validatedQty: number;      // Quantité validée contradictoirement par le client
  unitPriceDA: number;       // Prix unitaire contractuel
  totalContractAmountDA: number;
  weightPercent: number;     // Pondération dans l'avancement physique total
  notes?: string;
}
```

### B. Tâches Opérationnelles & Délais (`StoredProjectTask`)
```typescript
interface StoredProjectTask {
  id: string;
  code: string;              // ex: TSK-01
  name: string;
  description?: string;
  projectId: string;
  milestoneId?: string;
  assignedToName: string;
  team: string;              // Corps d'état (ex: Tuyauterie, Soudage, HSE)
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours: number;
  actualHours: number;
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  status: 'A_FAIRE' | 'EN_COURS' | 'EN_ATTENTE' | 'BLOQUEE' | 'TERMINEE' | 'ANNULEE';
  progress: number;          // 0 à 100%
  dependencies?: string[];
  observations?: string;
  isDelayed?: boolean;       // Calculé dynamiquement (plannedEndDate < today && non achevée)
}
```

### C. Rapports Journaliers de Chantier (`StoredDailyReport`)
```typescript
interface StoredDailyReport {
  id: string;
  reportNumber: string;      // ex: RJC-PRJ-2026-001-001
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  siteLocation: string;
  date: string;
  weatherConditions: string; // ENSOLEILLE, PLUVIEUX, VENTEUX, CANICULE
  siteCondition?: string;
  temperature?: number;
  manpower: { trade: string; plannedCount: number; presentCount: number; hoursWorked: number }[];
  workDone: { code?: string; description: string; quantity: number; unit: string }[];
  heavyEquipment: { equipmentCode: string; equipmentName: string; hoursRun: number; status: string }[];
  materialsConsumed: { itemCode: string; itemName: string; quantity: number; unit: string }[];
  hseIncidentsCount: number;
  hseNotes?: string;
  siteSupervisorName: string;
  clientRepresentativeName?: string;
  status: 'BROUILLON' | 'SOUMIS' | 'VALIDE';
  validationVisa?: string;
  validatedByRole?: string;
  validatedAt?: string;
  createdAt: string;
}
```

### D. Rapports de Situation Périodiques (`StoredSituationReport`)
```typescript
interface StoredSituationReport {
  id: string;
  reportNumber: string;      // ex: RSP-PRJ-2026-001-001
  projectId: string;
  projectCode: string;
  projectName: string;
  periodStart: string;
  periodEnd: string;
  reportDate: string;
  preparedByName: string;
  physicalStatus: {
    plannedProgress: number;
    actualProgress: number;
    completedTasksCount: number;
    delayedTasksCount: number;
    summary: string;
  };
  financialStatus: {
    initialBudget: number;
    revisedBudget: number;
    committedCost: number;
    actualCost: number;
    billedAmount: number;
    forecastAtCompletion: number;
    budgetVariance: number;
  };
  logisticsStatus: {
    criticalProcurementNeeds: string;
    pendingOrdersCount: number;
    stockAlertsCount: number;
  };
  hrStatus: {
    mobilizedHeadcount: number;
    totalHoursWorked: number;
    absentCount: number;
    additionalNeeds: string;
  };
  risksStatus: {
    openConstraintsCount: number;
    criticalRisksSummary: string;
    correctiveActions: { action: string; responsible: string; status: string }[];
  };
  generalAppraisal: string;
  createdAt: string;
}
```

### E. Registre des Contraintes & Difficultés (`StoredProjectConstraint`)
```typescript
interface StoredProjectConstraint {
  id: string;
  reference: string;         // ex: CTR-PRJ-2026-001-01
  projectId: string;
  projectCode: string;
  dateDetected: string;
  type: 'CLIENT' | 'METEO' | 'TECHNIQUE' | 'APPROVISIONNEMENT' | 'HSE' | 'SOUS_TRAITANT';
  description: string;
  impact: string;
  impactScheduleDays?: number;
  impactCostDA?: number;
  severity: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';
  assignedToName: string;
  assignedToId?: string;
  correctiveAction: string;
  deadline: string;
  status: 'OUVERTE' | 'EN_COURS' | 'RESOLUE' | 'CLOTUREE';
  resolvedDate?: string;
  resolutionComment?: string;
  linkedTaskId?: string;
  linkedDailyReportId?: string;
  createdAt: string;
}
```

### F. Événements Qualité & Sécurité HSE (`StoredHseIncident`)
```typescript
interface StoredHseIncident {
  id: string;
  reference: string;         // ex: HSE-PRJ-2026-001-01
  projectId: string;
  projectCode: string;
  incidentDate: string;
  type: 'OBSERVATION_SECURITE' | 'PRESQU_ACCIDENT' | 'PREMIER_SOIN' | 'ARRET_TRAVAIL' | 'INSPECTION_HSE' | 'CONTROLE_CND';
  severity: 'MINEURE' | 'MOYENNE' | 'GRAVE' | 'CRITIQUE';
  locationZone: string;
  description: string;
  immediateAction: string;
  correctiveAction: string;
  responsibleName: string;
  status: 'OUVERT' | 'EN_COURS' | 'CLOTURE';
  closedDate?: string;
  createdAt: string;
}
```

---

## 3. RÈGLES DE CALCUL INDUSTRIELLES & AUTOMATISATIONS

### 3.1 Avancement Physique Pondéré (Strictement découplé du Financier)
L'avancement physique n'est jamais confondu avec le montant facturé ou consommé. Il est calculé comme la somme pondérée de la progression de chaque prestation contractuelle :
$$\text{Avancement Physique} = \sum_{i=1}^{n} \left( \frac{\text{Quantité validée}_i}{\text{Quantité contractuelle}_i} \times \text{Poids}_i (\%) \right)$$

Chaque lot dispose d'un poids contractuel strict, validé dès la contractualisation (la somme des poids totalisant 100%).

### 3.2 Détection Proactive des Retards sur Tâches
Une tâche est automatiquement signalée en retard (`isDelayed = true`) lorsque :
$$\text{Date fin planifiée} < \text{Aujourd'hui} \quad \text{ET} \quad \text{Statut} \notin \{\text{TERMINEE}, \text{ANNULEE}\}$$

Le système calcule le nombre exact de jours de dérive et met en évidence visuellement la tâche dans le tableau et la vue Kanban avec un badge d'alerte rouge clignotant.

### 3.3 Interconnexion Réelle avec le Module Achats
Lorsqu'un besoin de matériel ou de sous-traitance surgit sur le chantier :
1. Le conducteur de travaux clique sur `+ Demande d'Achat DA`.
2. Le système crée une véritable `PurchaseRequest` dans le registre des achats (`purchaseRequests`) avec le code du projet rattaché.
3. Le montant estimé de la DA est immédiatement imputé au **budget engagé** du projet (`committedBudget`).
4. Le département Achats reçoit la DA dans son tableau de bord opérationnel pour traitement.

### 3.4 Interconnexion Réelle avec le Module Stocks
Lorsque des matériaux stockés sont livrés et posés sur le chantier :
1. Le conducteur de travaux ou le magasinier déclare la sortie réelle de stock (`recordProjectStockConsumption`).
2. Un véritable mouvement d'inventaire `StockMovement` de type `SORTIE_CHANTIER` est consigné dans le registre des stocks, déduisant physiquement la quantité du stock disponible.
3. Une écriture de dépense analytique `ProjectCostEntry` de catégorie `FOURNITURES` est créée.
4. Le **coût consommé réel** du projet (`spentBudget`) est immédiatement incrémenté.

---

## 4. LES 14 ONGLETS OPÉRATIONNELS DE LA FICHE PROJET

L'écran de détail de chantier (`/projects/[code]`) centralise 14 onglets spécialisés :

1. **Vue d'ensemble (`overview`)** : Fiche d'identité contractuelle, client, responsable, dates, indicateurs clés financiers et progression physique.
2. **Contrat & Métrés (`contract`)** : Liste des lots de prestations, quantités contractuelles vs exécutées vs validées contradictoirement, récapitulatif fiscal (TVA, retenue de garantie 5%).
3. **Planning & Jalons (`planning`)** : Jalons contractuels majeurs avec pré-configurations industrielles (CND, arrêts LOTO, épreuves hydrauliques).
4. **Tâches Opérationnelles (`tasks`)** : Vue Tableau et vue Kanban, filtrage par corps d'état, priorité, statut, mise à jour rapide et détection des retards.
5. **Rapports Journaliers RJC (`daily-reports`)** : Registre contradictoire quotidien, effectifs, métrés, engins, HSE, signatures électroniques et **génération de la fiche A4 imprimable officielle**.
6. **Rapports Périodiques (`situation-reports`)** : Synthèses exécutives transmises à la Direction Générale, écarts plannings et budgétaires, logistique et RH.
7. **Contraintes & Blocages (`constraints`)** : Registre centralisé des difficultés de chantier, sévérité, impact délais/coûts, plan d'action et modalité de levée/résolution.
8. **Sécurité HSE & CND (`quality-hse`)** : Zéro accident, presque-accidents, contrôles radiographiques, ressuage et fiches de non-conformité FNC.
9. **Achats Liés (`procurement`)** : Bons de commande (BC) fournisseurs et demandes d'achat (DA) rattachées au chantier.
10. **Stock & Sorties Chantier (`materials`)** : Allocations de fournitures et déclarations des consommations réelles.
11. **RH & Qualifications (`hr`)** : Effectifs mobilisés sur le site, habilitations requises, pointages et demandes de renfort RH.
12. **Budget & Coûts (`budget`)** : Comparatif budget prévisionnel vs coûts engagés vs dépenses réelles avec marge analytique actualisée.
13. **Ordres de Service (`ods`)** : ODS de démarrage, arrêt, reprise et avenants contractuels avec ajustement automatique des délais du projet.
14. **Situations de Travaux (`situations`)** : Attachements contradictoires multi-lignes, déduction retenue de garantie et génération des situations pour facturation.

---

## 5. VALIDATION TECHNIQUE & CONFORMITÉ

- **Compilation TypeScript** : 0 erreur (`pnpm --filter @silex/web exec tsc --noEmit`).
- **Compilation Next.js Production** : 19/19 routes compilées statiquement et dynamiquement (`pnpm --filter @silex/web exec next build`).
- **Tests E2E Automatisés** : 100% de réussite validant l'ensemble de la chaîne (`npx tsx scripts/test-project-e2e.js`).
