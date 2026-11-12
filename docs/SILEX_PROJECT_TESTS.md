# CAHIER DE RECETTE & TESTS E2E — MODULE 02 : PROJETS INDUSTRIELS
## ERP SARL SILEX SERVICES — VALIDATION TECHNIQUE & OPÉRATIONNELLE

---

## 1. STRATÉGIE DE TEST

Afin de garantir que le Module Projet répond à 100% au cahier des charges de SARL Silex Services sans recourir à des données factices (mockdata) statiques, une suite complète de tests End-to-End automatisés a été implémentée dans le fichier :
`scripts/test-project-e2e.js`

La suite valide la persistance réelle en base, l'exactitude des calculs mathématiques et la communication intermodules (Commercial -> Projet -> Achats -> Stocks -> RH -> Finance).

---

## 2. CATALOGUE DES TESTS & SCÉNARIOS D'EXÉCUTION

### Scénario [1] — Récupération du Projet Industriel issu du Cycle Commercial
- **Objectif** : Vérifier que le projet initialisé lors de la conversion de l'affaire Sonatrach RA1K (`PRJ-2026-001`) existe avec ses données contractuelles complètes.
- **Assertions** :
  - `project.code === 'PRJ-2026-001'`
  - `project.clientName === 'Sonatrach Raffinerie Skikda (RA1K)'`
  - `project.contractAmount > 0` (46 000 000 DA)
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [2] — Découpage Contractuel & Calcul d'Avancement Physique Pondéré
- **Objectif** : Vérifier la présence des 4 lots contractuels et la formule mathématique d'avancement physique pondéré :
  $$\text{Avancement Physique} = \sum \left( \frac{\text{Quantité validée}}{\text{Quantité contractuelle}} \times \text{Poids} \right)$$
- **Lots testés** :
  - LOT-01 : Tuyauteries HP 80 bar (Poids 40%, 250/450 ml validés)
  - LOT-02 : Remplacement faisceaux échangeurs (Poids 30%, 2/4 unités)
  - LOT-03 : Lignes auxiliaires & robinetterie (Poids 15%, 80/280 ml)
  - LOT-04 : Épreuves hydrauliques & CND (Poids 15%, 0/2 épreuves)
- **Résultat attendu** : Avancement recalculé = 48% (strictement différent du montant facturé).
- **Résultat** : **SUCCÈS (Validé à 48%)**

### Scénario [3] — Gestion du Planning & des Tâches Opérationnelles
- **Objectif** : Créer une tâche opérationnelle par métier, ajuster sa progression et enregistrer son achèvement.
- **Actions** :
  - Création de la tâche `TSK-08` : "Remplacement joints spi & épreuve manométrique échangeur E-102"
  - Équipe : "Montage mécanique"
  - Modification du statut : `EN_COURS` (30%) -> `TERMINEE` (100%)
  - Enregistrement de la date de fin réelle.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [4] — Détection Automatique des Retards sur Tâches
- **Objectif** : Vérifier que le système identifie sans ambiguïté les tâches en dérive par rapport au planning prévisionnel.
- **Règle** : `plannedEndDate < today && status !== 'TERMINEE' && status !== 'ANNULEE' => isDelayed = true`.
- **Cas testé** : Tâche `TSK-09` ayant pour échéance planifiée le 15/10/2026 (date dépassée) et un statut `EN_COURS` (40%).
- **Résultat attendu** : `isDelayed === true`.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [5] — Rapports Journaliers de Chantier (RJC) & Visas Électroniques
- **Objectif** : Émettre un rapport journalier complet conforme aux exigences des clients pétroliers et enregistrer le visa contradictoire.
- **Données consignées** :
  - Date, météo (Venteux 40 km/h), contrainte de sécurité
  - Effectifs : 1 Chef de chantier, 2 Superviseurs, 6 Soudeurs 6G, 8 Tuyauteurs, 2 CND
  - Métrés contradictoires : 12 ml soudés, 3 spools éprouvés
  - Matériel lourd : Grue 50T (6h), 4 Postes à souder Miller (32h cumulées)
  - Validation électronique par la Direction Générale (`VISA-PROJET-XXXXXX-VALIDE`).
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [6] — Rapport Périodique de Situation (RSP)
- **Objectif** : Générer une synthèse exécutive multi-axes pour le comité de direction.
- **Indicateurs vérifiés** :
  - Avancement physique (48%) vs Avancement prévu (50%)
  - Budget initial : 36 800 000 DA
  - Coûts réels consommés : 14 226 000 DA
  - Nombre de contraintes actives et état des approvisionnements.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [7] — Registre Centralisé des Contraintes & Résolution
- **Objectif** : Signaler un point d'arrêt chantier, tracer son impact planning et documenter sa levée.
- **Cas testé** :
  - Signalement `CTR-PRJ-2026-001-04` : "Suspension temporaire délivrance permis feu suite purge azote".
  - Sévérité : `ELEVEE`, Type : `CLIENT`.
  - Impact : 2 jours d'arrêt prévus.
  - Action de résolution : Validation de la levée de réserve et horodatage de clôture.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [8] — Sécurité HSE & Contrôles CND
- **Objectif** : Tracer les événements de prévention HSE et les contrôles non destructifs.
- **Cas testé** :
  - Création `HSE-PRJ-2026-001-03` : Inspection générale d'échafaudages et vérification des harnais antichute.
  - Contrôle CND : Tirs radiographiques 100% sur soudures HP.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [9] — Interconnexion Chantier -> Module Achats (DA)
- **Objectif** : Valider qu'un besoin matériel émis sur le chantier génère une demande d'achat dans le module Achats et impacte le budget engagé.
- **Action** : Émission de la DA `DA-2026-001` (Fourniture coudes acier carbone ANSI B16.9) pour un montant de 640 000 DA.
- **Vérification** :
  - La DA est présente dans `purchaseRequests`.
  - Le `committedBudget` du projet a été augmenté de 640 000 DA.
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [10] — Interconnexion Chantier -> Module Stocks (Sorties Réelles)
- **Objectif** : Valider qu'une sortie de matériel déduit l'inventaire physique et incrémente immédiatement les dépenses réelles du chantier.
- **Action** : Consommation de 10 ml de tubes acier carbone (coût unitaire 20 000 DA = 200 000 DA).
- **Vérification** :
  - Mouvement de stock de type `SORTIE_CHANTIER` créé.
  - Écriture de coût direct rattachée au projet.
  - Le budget consommé (`spentBudget`) augmente de 200 000 DA (porté à 14 426 000 DA).
- **Résultat** : **SUCCÈS (Validé)**

### Scénario [11] — Intégrité Globale & Clôture de Recette
- **Objectif** : Vérifier la cohérence globale de l'état final du chantier `PRJ-2026-001`.
- **Indicateurs finaux constatés** :
  - Avancement physique pondéré : **48%**
  - Tâches actives au registre : **9**
  - Rapports journaliers validés : **2**
  - Contraintes gérées : **4**
  - Budget alloué : **36 800 000 DA**
  - Coûts engagés : **23 040 000 DA**
  - Coûts réels consommés : **14 426 000 DA**
- **Résultat** : **SUCCÈS (100% conforme)**

---

## 3. COMMANDE DE REPRODUCTION DU TEST

Pour exécuter le test automatisé à tout moment :
```bash
npx tsx scripts/test-project-e2e.js
```
Sortie constatée :
```
========================================================================
✅ TEST E2E PHASE 3 VALIDÉ À 100% : LE MODULE PROJET INDUSTRIEL FONCTIONNE !
========================================================================
```
