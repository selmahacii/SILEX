# SILEX ERP — Implémentation du Module 04 : Ressources Humaines, Qualifications CQS & Mobilité Chantiers

**Version :** 1.0.0 (Phase 5)  
**Date :** 13 Novembre 2026  
**Société :** SARL SILEX SERVICES  
**Statut :** Validé en Production & Tests E2E à 100%

---

## 1. Contexte & Enjeux Métier Sous Réglementation Algérienne

Dans le secteur des travaux de tuyauterie industrielle et des arrêts d'unités pétrochimiques (Sonatrach Raffinerie Skikda RA1K, installations gazières Hassi Messaoud), le capital humain est soumis à des règles rigoureuses :
- **Qualifications de soudage (CQS)** : Chaque soudeur haute pression doit impérativement disposer d'un Certificat de Qualification de Soudeur valide délivré par un organisme accrédité (Bureau Veritas, TÜV, Apave) selon la norme **ASME IX 6G** ou **EN ISO 9606-1**. L'affectation à une tâche critique sans CQS valide est strictement bloquée par l'ERP.
- **Mobilité industrielle & Rotations Sud** : Le travail sur les bases de vie lointaines est organisé selon des cycles prédéfinis (**4×4** ou **6×2**). Tout déplacement hors base d'attache donne lieu à un **Ordre de Mission officiel A4** avec indemnités journalières et avance sur frais.
- **Traçabilité des congés** : Circuit d'approbation dématérialisé avec visa hiérarchique RH puis arbitrage Direction Générale, aboutissant à l'édition d'un **Titre de Congé réglementaire A4**.
- **Moteur de paie de démonstration conforme 2026** : Simulation fidèle du bulletin de paie industriel algérien intégrant le **SNMG 2026** (24 000 DA, Décret présidentiel n° 26-01), la retenue **CNAS 9%** (Décret exécutif n° 15-236) et le barème progressif de l'**IRG** avec abattement de 40%.

---

## 2. Architecture des Données & Protection Stricte des Personnes

Conformément aux directives de sécurité et de conformité :
1. **Zéro Donnée Réelle** : La base de démonstration utilise exclusivement **12 profils fictifs** (`DEMO-EMP-001` à `DEMO-EMP-012`), matricules `DEMO-MAT-001` à `DEMO-MAT-012`, adresses génériques et numéros de convention `+213 550 00 00 XX`.
2. **Étanchéité DEMO / PRODUCTION** : Les simulations de bulletins de paie portent le champ obligatoire `isDemoSimulation: true` et le filigrane imprimable **"DOCUMENT DE DÉMONSTRATION — NON CONTRACTUEL"**.
3. **Séparation des Tâches (SoD)** : Un collaborateur ne peut en aucun cas valider ses propres congés, ni s'attribuer un ordre de mission. Le visa RH est un prérequis obligatoire avant tout accord de la Direction Générale.

---

## 3. Endpoints API Implémentés

| Méthode | Route API | Rôle Requis | Description Métier |
|---|---|---|---|
| `GET` | `/api/hr/industrial-certifications` | RH, Qualité, Direction | Consultation des qualifications CQS et habilitations |
| `POST` | `/api/hr/industrial-certifications` | Collaborateur, RH | Soumission d'une qualification documentaire |
| `POST` | `/api/hr/industrial-certifications/:id/audit` | Superviseur Qualité, Direction | Validation ou rejet argumenté d'un CQS |
| `GET` | `/api/hr/leaves` | Tout collaborateur | Historique des demandes de congés |
| `POST` | `/api/hr/leaves` | Collaborateur | Dépôt d'une demande de congé ou récupération |
| `POST` | `/api/hr/leaves/:id/visa-rh` | Responsable RH | Visa hiérarchique RH |
| `POST` | `/api/hr/leaves/:id/approve-dg` | Direction Générale | Accord souverain DG & émission du Titre de Congé A4 |
| `GET` | `/api/hr/missions` | Tout collaborateur, Direction | Suivi des ordres de mission |
| `POST` | `/api/hr/missions` | Responsable RH, Chef de Projet | Émission d'un ordre de mission chantier |
| `POST` | `/api/hr/missions/:id/approve-dg` | Direction Générale | Visa DG & bon pour déplacement officiel A4 |
| `GET` | `/api/hr/recruitments` | Projets, RH, Direction | Expression de besoins en renforts chantiers |
| `POST` | `/api/hr/recruitments` | Chef de Projet | Demande de recrutement pour arrêt d'unité |
| `POST` | `/api/hr/recruitments/:id/approve-dg` | Direction Générale | Approbation DG du plan de recrutement |
| `GET` | `/api/hr/rotations` | RH, Direction | Paramétrage des régimes Sud (4×4, 6×2) |
| `POST` | `/api/hr/rotations/:id/assign` | Responsable RH | Affectation d'un collaborateur à un cycle |
| `GET` | `/api/hr/salary-rubrics` | RH, Finance, Direction | Table versionnée des rubriques salariales 2026 |
| `GET` | `/api/hr/payslip-demo` | RH, Finance, Collaborateur | Simulation dynamique du bulletin de paie A4 |
| `GET` | `/api/hr/kpis` | Direction, RH | Indicateurs effectifs, CQS, missions & congés |

---

## 4. Validation des Tests E2E Automatisés

Le banc de test [`scripts/test-hr-e2e.js`](file:///c:/Users/ZBOOK/Desktop/SILEX/scripts/test-hr-e2e.js) a validé les 11 étapes fonctionnelles et sécuritaires :
1. **Baseline Fictive Sécurisée** : 12 profils fictifs contrôlés (`DEMO-EMP-001` à `012`).
2. **Qualifications CQS** : Vérification du CQS ASME IX 6G de Karim Mebarki (Bureau Veritas).
3. **Audit Documentaire CQS** : Soumission d'un certificat et validation par le Superviseur HSE.
4. **Cycles de Rotation** : Affectation au régime 4×4 Sud de Hassi Messaoud.
5. **Circuit Congé** : Soumission $\rightarrow$ Visa RH $\rightarrow$ Accord DG $\rightarrow$ Émission du Titre de Congé `TC-2026-002`.
6. **Ordre de Mission** : Émission pour déplacement Skikda RA1K $\rightarrow$ Visa DG $\rightarrow$ Statut `EN_MISSION`.
7. **Recrutement Chantier** : Expression de besoin pour 4 tuyauteurs ISO $\rightarrow$ Approbation DG.
8. **Rubriques 2026** : Contrôle du SNMG (24 000 DA, Décret 26-01) et de la CNAS 9% (Décret 15-236).
9. **Simulation Bulletin de Paie** : Calcul rigoureux du brut, déduction CNAS 9%, barème progressif IRG et net.
10. **KPIs Dynamiques** : Taux de validité CQS (100%), effectif actif, missions en cours.
11. **Test Négatif SoD** : Rejet automatique de toute tentative d'approbation DG directe sans visa RH préalable.
