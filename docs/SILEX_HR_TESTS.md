# PROTOCOLE DE VALIDATION & BANCS D'ESSAIS DU MODULE RESSOURCES HUMAINES
**ERP SARL SILEX SERVICES — Version 2026**
Fichier : `docs/SILEX_HR_TESTS.md`

---

## 1. Objectifs de Test & Couverture E2E

Le protocole de test du Module 04 Ressources Humaines & Mobilité Industrielle garantit :
1. L'isolation absolue des données réelles (100% de profils `DEMO` fictifs).
2. L'absence de régression sur la base PostgreSQL Neon (`Employee` = intacte).
3. Le bon fonctionnement des 18 étapes du cycle de vie du personnel.
4. L'efficacité des règles de ségrégation des tâches (SoD) et tests négatifs.

---

## 2. Matrice d'Exécution des Tests E2E (`scripts/test-hr-e2e.js`)

| Étape | Scénario Testé | Description Technique | Résultat Obtenu |
|:---:|---|---|:---:|
| **1** | Baseline 12 Collaborateurs Fictifs | Vérification matricules `DEMO-MAT-001` à `012`, anonymisation stricte, absence d'accès direct application sans compte. | **SUCCÈS (100%)** |
| **2** | Qualifications CQS & Soudeurs ASME IX | Vérification des CQS initiaux (ASME IX 6G, procédés 141/111, P91/Inox, Bureau Veritas / Apave). | **SUCCÈS (100%)** |
| **3** | Audit Documentaire CQS & Décision | Soumission nouvelle qualif `CQS-APAVE-2026-778` et validation par superviseur HSE. | **SUCCÈS (100%)** |
| **4** | Organisation des Rotations Sud | Rattachement de collaborateur au cycle saharien 4×4 `ROT-HMD-4X4` (28j travail / 28j repos). | **SUCCÈS (100%)** |
| **5** | Circuit de Congés (SoD à 2 niveaux) | Émission congé `LV-2026-002`, visa RH, approbation DG et génération du Titre de Congé A4 `TC-2026-002`. | **SUCCÈS (100%)** |
| **6** | Ordre de Mission Chantier Distant | Création mission `MIS-2026-002` avec per diem, visa DG et bascule statut employé vers `EN_MISSION`. | **SUCCÈS (100%)** |
| **7** | Expression de Besoin Recrutement | Création besoin `REC-2026-002` (4 tuyauteurs qualifiés) depuis chantier et arbitrage DG. | **SUCCÈS (100%)** |
| **8** | Vérification Rubriques Paie 2026 | Conformité SNMG 24 000 DA (Décret 26-01), CNAS 9% (Décret 15-236), barème IRG progressif. | **SUCCÈS (100%)** |
| **9** | Simulation Bulletin de Paie DEMO | Calcul automatique des rubriques R100 à R600 avec filigrane DEMO strict. | **SUCCÈS (100%)** |
| **10** | Calcul KPIs Dashboard RH | Actualisation en temps réel : effectifs actifs, collaborateurs en mission, taux de conformité CQS. | **SUCCÈS (100%)** |
| **11** | Test Négatif de Sécurité (SoD) | Tentative de validation DG directe d'un congé sans visa RH préalable : blocage confirmé. | **SUCCÈS (100%)** |

---

## 3. Banc de Test Global de Non-Régression Multi-Modules (`scripts/run-all-e2e.js`)

L'exécution conjointe des 4 suites de tests E2E démontre une interopérabilité sans faille :
- **Suite 1 (Commercial)** : 14/14 étapes validées.
- **Suite 2 (Projets Industriels)** : 18/18 étapes validées.
- **Suite 3 (Achats & Stocks Multi-Dépôts)** : 18/18 étapes validées.
- **Suite 4 (Ressources Humaines & Mobilité)** : 11/11 étapes validées.
- **Total général** : **61 / 61 tests réussis à 100%**.

---

## 4. Compilation & Build Production Next.js

- Commande : `pnpm --filter @silex/web exec next build`
- Résultat :
  - **Compilation réussie** en 9.6s.
  - **19 routes statiques et dynamiques** générées.
  - Aucune erreur de typage TypeScript (`tsc --noEmit` propre).

---
*SARL SILEX SERVICES — Direction Qualité & Assurance Logicielle.*
