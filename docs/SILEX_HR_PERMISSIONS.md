# MATRICE DES DROITS & HABILITATIONS DU MODULE RESSOURCES HUMAINES (RBAC)
**ERP SARL SILEX SERVICES — Version 2026**
Fichier : `docs/SILEX_HR_PERMISSIONS.md`

---

## 1. Principes de Ségrégation des Tâches (SoD) & Confidentialité RH

La gestion des ressources humaines dans l'ERP SILEX SERVICES applique des règles strictes de sécurité et de confidentialité :
1. **Confidentialité des Salaires** : Seuls la Direction Générale et le Responsable RH ont accès aux montants de rémunération de base, aux taux journaliers et aux simulations de bulletin de paie démo.
2. **Indépendance des Validations** : Un collaborateur ne peut pas valider ses propres congés ou ses ordres de mission.
3. **Double Contrôle des Dépenses de Mission** : Les frais de mission et avances per diem sont visés par la DG avant tout décaissement.

---

## 2. Matrice des Rôles & Accès Métier

| Fonctionnalité / Objet RH | Collaborateur / Opérateur | Chef de Chantier / Resp. Projet | Responsable RH | Directeur Général (DG) | Administrateur Système |
|---|:---:|:---:|:---:|:---:|:---:|
| **Consultation Registre Personnel** | Profil propre | Équipe affectée | Lecture Complète | Lecture Complète | Lecture Complète |
| **Création Collaborateur** | ❌ Interdit | ❌ Interdit | ✅ Autorisé | ✅ Autorisé | ✅ Autorisé |
| **Saisie Pointage Chantier** | ❌ Interdit | ✅ Saisie Chantier | ✅ Contrôle & Saisie | ✅ Audit | ✅ Contrôle |
| **Dépôt Qualification CQS** | Dépôt propre | Consultation équipe | ✅ Saisie & Gestion | Lecture | ✅ Administration |
| **Audit & Validation CQS** | ❌ Interdit | ❌ Interdit | ✅ Audit Documentaire | ✅ Accord Final | ❌ Interdit |
| **Demande de Congé** | ✅ Émission | ✅ Émission | ✅ Émission & Visa | Arbitrage & Accord | Consultation |
| **Visa RH Congé** | ❌ Interdit | ❌ Interdit | ✅ Visa RH Obligatoire | ❌ Requiert visa RH | ❌ Interdit |
| **Accord DG Congé** | ❌ Interdit | ❌ Interdit | ❌ Interdit | ✅ Accord Final DG | ❌ Interdit |
| **Ordre de Mission** | ❌ Interdit | ✅ Demande Chantier | ✅ Émission | ✅ Approbation DG | Consultation |
| **Besoins Recrutement** | ❌ Interdit | ✅ Émission Besoin | ✅ Revue RH | ✅ Accord DG | Consultation |
| **Affectation Rotations Sud** | ❌ Interdit | Consultation | ✅ Affectation | ✅ Validation | ✅ Administration |
| **Simulation Bulletin Paie DEMO** | ❌ Interdit | ❌ Interdit | ✅ Simulation & Calcul | ✅ Consultation DG | ❌ Interdit |
| **Journal d'Audit RH** | ❌ Interdit | ❌ Interdit | Consultation | ✅ Consultation Complète | ✅ Administration |

---

## 3. Sécurisation au Niveau de l'API

Tous les endpoints API Next.js `/api/hr/*` vérifient le rôle système issu du jeton JWT ou du contexte d'authentification (`useAuth()`) :
- Endpoint `/api/hr/leaves/[id]/approve-rh` : Requiert le rôle `RESPONSABLE_RH` ou `ADMINISTRATEUR`.
- Endpoint `/api/hr/leaves/[id]/approve-dg` : Requiert le rôle `DIRECTEUR_GENERAL`.
- Endpoint `/api/hr/payslip-demo` : Réservé aux rôles `RESPONSABLE_RH`, `DIRECTEUR_GENERAL`, et `ADMINISTRATEUR`.
- Endpoint `/api/hr/missions/[id]/approve` : Requiert le rôle `DIRECTEUR_GENERAL`.

---
*SARL SILEX SERVICES — Sécurité des Systèmes d'Information & Gouvernance.*
