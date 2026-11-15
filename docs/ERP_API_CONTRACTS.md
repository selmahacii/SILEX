# SILEX SERVICES ERP — SPÉCIFICATION TECHNIQUE DES CONTRATS D'API & INVENTAIRE DES ENDPOINTS
**Date** : 15 Novembre 2026  
**Version** : 1.0.0 — Enterprise-Grade API Contracts  
**Standard d'Échange** : RESTful JSON, Encodage UTF-8, Devise Dinar Algérien (DZD), Fuseau `Africa/Algiers`  
**Gestion des erreurs** : Codes HTTP normalisés, payload d'erreur enrichi avec `correlationId` et `fieldErrors`

---

## 1. FORMAT UNIFIÉ DES RÉPONSES ET GESTION DES ERREURS

### 1.1. Format Standard de Succès (Collection Paginée)
Toute liste d'entités doit retourner un objet enveloppe respectant le contrat ci-dessous :

```json
{
  "data": [
    {
      "id": "prj-2026-001",
      "code": "PRJ-2026-001",
      "name": "Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques",
      "clientName": "Sonatrach Raffinerie Skikda (RA1K)",
      "contractAmount": 48500000,
      "budgetAmount": 36800000,
      "status": "IN_PROGRESS",
      "isDemo": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "totalPages": 1
  }
}
```

### 1.2. Format Standard de Succès (Entité Unitaire)
```json
{
  "data": {
    "id": "fc-2026-001",
    "reference": "FC-2026-001",
    "title": "Chiffrage Maintenance Tuyauteries HP",
    "proposedSellingPrice": 38700000,
    "totalDirectCost": 26090000,
    "totalIndirectCost": 3130800,
    "totalEstimatedCost": 29220800,
    "status": "PRETE_POUR_VALIDATION",
    "isDemo": false
  }
}
```

### 1.3. Format Standard d'Erreur Applicative
Le format d'erreur unifié ne doit jamais exposer de stack trace, de requête SQL brute ou d'information sensible en production :

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Certains champs obligatoires sont invalides ou manquants.",
    "fieldErrors": {
      "proposedSellingPrice": "Le prix de vente doit être strictement supérieur au coût total prévisionnel.",
      "clientName": "Le nom du client contractuel est obligatoire."
    },
    "correlationId": "req-9b8c-4f1e-8a2b-7c3d2e1f0a9b",
    "timestamp": "2026-11-15T11:30:00.000Z"
  }
}
```

### 1.4. Matrice des Codes HTTP
| Code HTTP | Cas d'Usage Métier | Description & Règle d'Attribution |
| :--- | :--- | :--- |
| **200 OK** | Lecture / Consultation | Requête GET réussie avec payload retourné. |
| **201 Created** | Création d'entité | Création POST réussie avec enregistrement persisté. |
| **204 No Content** | Suppression | Suppression réussie sans contenu dans le corps de réponse. |
| **400 Bad Request** | Validation de schéma | Paramètres manquants, format invalide, types incorrects. |
| **401 Unauthorized** | Non authentifié | Jeton JWT absent, corrompu ou expiré. |
| **403 Forbidden** | Droits insuffisants / SoD | Rôle insuffisant, tentative d'approbation de sa propre demande (SoD). |
| **404 Not Found** | Ressource introuvable | L'identifiant demandé n'existe pas en base. |
| **409 Conflict** | Conflit d'intégrité / Version | Doublon de code unique, conflit de version documentaire. |
| **422 Unprocessable Entity** | Transition métier impossible | Ex: Règlement d'une facture non approuvée, passage d'un projet clôturé en cours sans avenant. |
| **500 Internal Server Error** | Erreur serveur | Exception inattendue interceptée par le filtre d'audit global. |

---

## 2. INVENTAIRE DES ENDPOINTS EXISTANTS ET ENDPOINTS CIBLES

### 2.1. Module Reports & Contrôle de Gestion
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/project-portfolio` | Liste analytique complète des chantiers avec filtres (dates, client, wilaya, pôle, secteur, statut, isDemo) | Tous rôles authentifiés | **À standardiser** |
| `GET` | `/api/reports/project-portfolio/summary` | KPI consolidés : Volume contractuel HT/TTC, EAC, Marge prév., Marge réalisée, Engagements | DAF, DG, Responsable Projet | **À corriger (formule 94.4%)** |
| `GET` | `/api/reports/project-portfolio/export?format=csv` | Export CSV UTF-8 (BOM, séparateur point-virgule) de l'état consolidé | DAF, DG, Responsable Projet | **À enrichir** |
| `GET` | `/api/reports/project-portfolio/export?format=xlsx` | Export Excel structuré avec onglets et métadonnées | DAF, DG | **À enrichir** |
| `GET` | `/api/reports/project-portfolio/export?format=pdf` | Rapport PDF A4 officiel SILEX SERVICES avec cartouche de contrôle | DAF, DG | **À implémenter** |

---

### 2.2. Module Projets Industriels & Chantiers
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Liste paginée des projets avec indicateurs de rentabilité | Tous rôles | Existant |
| `GET` | `/api/projects/:id` | Fiche détaillée du projet avec données contractuelles et KPIs | Tous rôles (filtré si RP affecté) | Existant |
| `POST` | `/api/projects` | Création d'un projet industriel (manuel ou via opportunité gagnée) | Responsable Projet, DG | Existant |
| `PATCH` | `/api/projects/:id` | Mise à jour des informations administratives ou du planning | Responsable Projet affecté, DG | Existant |
| `GET` | `/api/projects/:id/budget` | Décomposition budgétaire par lot (MO, matières, engins, etc.) | Responsable Projet, DAF, DG | **À normaliser** |
| `GET` | `/api/projects/:id/costs` | Historique des coûts réels imputés et commandes engagées | Responsable Projet, DAF, DG | Existant |
| `GET` | `/api/projects/:id/milestones` | Jalons contractuels et état d'achèvement | Responsable Projet, Conducteur Tx | Existant |
| `GET` | `/api/projects/:id/situations` | Décomptes mensuels de travaux et retenues de garantie | Responsable Projet, DAF, DG | Existant |
| `POST` | `/api/projects/:id/situations` | Émission d'une situation de travaux à valider | Responsable Projet | Existant |

---

### 2.3. Module Commercial, CRM & Chiffrage
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/commercial/opportunities` | Pipeline CRM filtrable par étape (Nouvelle, Qualifiée, Chiffrage, etc.) | Commercial, RP, DG | Existant (statuts à corriger) |
| `POST` | `/api/commercial/opportunities` | Création d'une nouvelle opportunité d'affaires | Commercial, RP, DG | Existant |
| `GET` | `/api/commercial/opportunities/:id` | Consultation détaillée de l'opportunité | Commercial, RP, DG | Existant |
| `PATCH` | `/api/commercial/opportunities/:id` | Avancement de l'étape du cycle de vente CRM | Commercial, RP, DG | Existant |
| `GET` | `/api/commercial/cost-sheets` | Registre des fiches de chiffrage collaboratif | RP, Achats, RH, DAF, DG | Existant |
| `POST` | `/api/commercial/cost-sheets` | Initialisation d'une fiche de chiffrage liée à une opportunité | Responsable Projet, Commercial | Existant |
| `GET` | `/api/commercial/cost-sheets/:id` | Fiche collaborative avec 4 contributions distinctes | RP, Achats, RH, DAF, DG | Existant (formule à caler) |
| `POST` | `/api/commercial/cost-sheets/:id/contributions` | Enregistrement de la contribution Projet, Achats, RH ou Finance | Selon rôle métier responsable | Existant |
| `POST` | `/api/commercial/cost-sheets/:id/submit` | Soumission formelle de la fiche chiffrée à l'arbitrage DG | Responsable Projet | Existant |
| `GET` | `/api/commercial/kpis` | Indicateurs de pipeline pondéré, conversion et fiches en cours | Tous rôles autorisés | Existant (fallbacks à purger) |

---

### 2.4. Module Arbitrages & Workflows (Circuit SoD)
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/workflows/inbox` | Boîte de réception unifiée des arbitrages en instance (DA, Situations, Fiches de Coût) | DAF, DG, RP | **À unifier (inclure Cost Sheets)** |
| `GET` | `/api/workflows/:id` | Examen approfondi du dossier, offres comparées et antécédents | DAF, DG | Existant |
| `POST` | `/api/workflows/:id/approve` | Approbation formelle du dossier avec émission de BC ou visa | **DG, Administrateur** (SoD vérifiée) | Existant |
| `POST` | `/api/workflows/:id/reject` | Rejet motivé du dossier | **DG, Administrateur** | Existant |
| `POST` | `/api/workflows/:id/request-revision` | Demande de révision avec consignes de négociation | **DG, Administrateur** | Existant |

---

### 2.5. Module Achats, Approvisionnements & Stocks
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/procurement/purchase-requests` | Liste des demandes d'achat et statuts | Tous rôles | Existant |
| `POST` | `/api/procurement/purchase-requests` | Création d'une DA avec lignes d'articles | Responsable Projet, Conducteur Tx | Existant |
| `GET` | `/api/procurement/purchase-requests/:id` | Détail de la DA avec vérification de disponibilité stock | Tous rôles | Existant |
| `POST` | `/api/procurement/purchase-requests/:id/quotes` | Ajout d'une offre fournisseur reçue (cotation RFQ) | Responsable Achats | Existant |
| `GET` | `/api/procurement/purchase-orders` | Bons de commande confirmés | Achats, Magasin, Finance, DG | Existant |
| `POST` | `/api/procurement/goods-receipts` | Constat de réception physique (BR) en magasin | Responsable Magasin | Existant |
| `GET` | `/api/inventory/items` | Catalogue d'articles avec niveaux de stock (dispo, réservé) | Magasin, Achats, RP | Existant |
| `POST` | `/api/inventory/movements/issue` | Sortie matière imputée à un chantier (Bon de Sortie) | Responsable Magasin | Existant |

---

### 2.6. Module Ressources Humaines Industrielles
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/hr/employees` | Registre du personnel industriel avec qualifications | RH, DG (salaires masqués hors RH/DG) | Existant |
| `POST` | `/api/hr/employees` | Création d'un collaborateur (matricule unique, contrat) | Responsable RH | Existant |
| `PATCH` | `/api/hr/employees/:id` | Mise à jour des coordonnées, contrat ou habilitations | Responsable RH | Existant |
| `GET` | `/api/hr/attendance` | Feuilles d'émargement et pointages chantiers | Conducteur Tx, RH | Existant |
| `POST` | `/api/hr/attendance` | Saisie d'une journée de pointage (normal, sup., absence) | Conducteur Tx, Chef de Chantier | Existant |
| `GET` | `/api/hr/leaves` | Demandes de congés et soldes | Tous collaborateurs | Existant |
| `POST` | `/api/hr/leaves` | Dépôt d'une demande de congé | Tout collaborateur | Existant |
| `POST` | `/api/hr/leaves/:id/decisions` | Décision hiérarchique : Visa RH puis Décision DG | RH (étape 1), DG (étape 2) | **À consolider** |
| `GET` | `/api/hr/qualifications` | Suivi des certifications soudeurs ASME/ISO et validités | QHSE, RH | Existant |

---

### 2.7. Module QHSE & GED
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/quality/documents` | Bibliothèque documentaire GED filtrable par catégorie/statut | Tous rôles | Existant |
| `POST` | `/api/quality/documents` | Enregistrement d'un document contrôlé avec métadonnées | Responsable Qualité, DG | Existant |
| `GET` | `/api/quality/non-conformities` | Registre des fiches de non-conformité (FNC) chantiers | Tous rôles | Existant |
| `POST` | `/api/quality/non-conformities` | Signalement d'une non-conformité avec criticité | Tout collaborateur chantier | Existant |
| `PATCH` | `/api/quality/non-conformities/:id/status` | Évolution du statut FNC (confinement, clôture) | Responsable Qualité, DG | Existant |
| `POST` | `/api/quality/non-conformities/:id/actions` | Assignation d'une action corrective (CAPA) | Responsable Qualité | Existant |
| `GET` | `/api/quality/weld-book` | **Weld Book : Liste des soudures industrielles et contrôles CND** | **QHSE, RP, DG** | **NOUVEAU (À ajouter)** |
| `POST` | `/api/quality/weld-book` | **Weld Book : Consignation d'un joint soudé et rapport CND** | **Inspecteur Qualité, RP** | **NOUVEAU (À ajouter)** |

---

### 2.8. Module Finance & Trésorerie (Périmètre Lecture Seule Préservé)
| Méthode | Route API | Description Métier | RBAC Requis | Statut Implémentation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/accounts` | Consultation des soldes des comptes bancaires et caisses | DAF, DG | Existant (Phase 6C.2) |
| `GET` | `/api/finance/customer-invoices` | Consultation des factures clients et créances échues | DAF, DG, RP | Existant (Phase 6C.3) |
| `GET` | `/api/finance/supplier-invoices` | Consultation des factures fournisseurs et état 3-Way | DAF, DG, RP | Existant (Phase 6C.4) |
| `GET` | `/api/finance/distribution` | Répartition des dépenses par catégorie de coûts | DAF, DG | Existant |
| *Règle* | *Toute écriture bancaire* | **Strictement interdite durant cette mission** | — | **Préservé** |

---

## 3. SCHÉMAS DE VALIDATION ZOD COMPLETS

```typescript
import { z } from 'zod';
import { SystemRole, IndustrialSector, ProjectRiskLevel } from '@silex/shared';

// 1. Validation Chiffrage Commercial Collaboratif
export const costSheetContributionSchema = z.object({
  department: z.enum(['PROJET', 'ACHATS', 'RH', 'FINANCE']),
  data: z.record(z.any()),
});

export const commercialOpportunitySchema = z.object({
  title: z.string().min(5, "L'intitulé doit comporter au moins 5 caractères"),
  clientName: z.string().min(2, "Le client maître d'ouvrage est obligatoire"),
  sector: z.nativeEnum(IndustrialSector),
  location: z.string().min(2, 'Le site ou la wilaya est obligatoire'),
  contactName: z.string().min(2, 'Le contact client est requis'),
  contactEmail: z.string().email('Adresse email professionnelle invalide'),
  contactPhone: z.string().min(8, 'Numéro de téléphone requis'),
  estimatedAmount: z.number().positive('Le montant estimé doit être supérieur à zéro'),
  submissionDeadline: z.string().min(1, 'La date limite de soumission est obligatoire'),
  priority: z.enum(['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']),
  notes: z.string().optional(),
});

// 2. Validation Weld Book (Cahier de Soudage Industriel)
export const weldRecordSchema = z.object({
  projectId: z.string().min(1, 'Le projet chantier est requis'),
  jointNumber: z.string().min(2, 'Le numéro de joint/repère soudure est obligatoire'),
  lineIso: z.string().min(2, 'La référence isométrique / ligne tuyauterie est obligatoire'),
  spoolNumber: z.string().optional(),
  material: z.string().min(2, 'La nuance matière est obligatoire (ex: Inox 316L, A106 Gr B)'),
  heatNumber: z.string().optional(), // N° de coulée
  welderName: z.string().min(2, 'Le nom du soudeur est requis'),
  welderStamp: z.string().min(1, 'Le poinçon du soudeur est requis'),
  dmosRef: z.string().min(2, 'La référence du DMOS approuvé est requise'),
  cndRequirement: z.enum(['VISUEL_SEUL', 'RESSUAGE_PT', 'RADIOGRAPHIE_RT', 'ULTRASONS_UT', 'RT_ET_PT']),
  inspectionAgency: z.string().min(2, "L'organisme de contrôle CND est requis"),
  status: z.enum(['EN_ATTENTE_CND', 'CONFORME', 'REPARE_CONFORME', 'REJETE']),
  executionDate: z.string().min(1, "La date d'exécution est requise"),
  reportReference: z.string().optional(),
});

// 3. Validation Filtres Portfolio Projets
export const portfolioFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sector: z.string().optional(),
  clientName: z.string().optional(),
  wilaya: z.string().optional(),
  status: z.string().optional(),
  isDemo: z.enum(['ALL', 'REAL_ONLY', 'DEMO_ONLY']).default('REAL_ONLY'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});
```
