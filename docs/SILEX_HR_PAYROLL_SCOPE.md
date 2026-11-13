# CADRAGE DU PÉRIMÈTRE PAIE & CONFORMITÉ RÉGLEMENTAIRE ALGÉRIENNE 2026
**ERP SARL SILEX SERVICES — Version 2026**
Fichier : `docs/SILEX_HR_PAYROLL_SCOPE.md`

---

## 1. Périmètre & Objectif Fonctionnel

Le module RH de l'ERP SARL SILEX SERVICES intègre un moteur de paie de démonstration (**Fiche de Paie DEMO**) afin de :
1. Calculer précisément les débours de main-d'œuvre et le coût journalier réel par chantier industriel.
2. Simuler les charges salariales et patronales conformément à la législation algérienne en vigueur en 2026.
3. Préparer les formats de données nécessaires à la future passerelle avec le logiciel homologué de l'entreprise (**PC Paie**).

> [!WARNING]
> **Mention Légale Obligatoire** : Les bulletins de paie édités depuis ce module sont exclusivement des outils de simulation et de contrôle de débours de chantiers. Chaque document porte l'estampille obligatoire :
> `"DOCUMENT DE DÉMONSTRATION — NON CONTRACTUEL — NE CONSTITUE PAS UN BULLETIN OFFICIEL"`.

---

## 2. Textes Réglementaires Algériens de Référence (2026)

Le moteur de calcul applique strictement les textes officiels suivants :

1. **Salaire National Minimum Garanti (SNMG)** :
   - Montant légal : **24 000 DA / mois**.
   - Référence : Décret présidentiel n° 26-01 du 07 Janvier 2026 (Journal Officiel de la République Algérienne n° 01).
   - Aucun salaire de base ne peut être inférieur à cette valeur.

2. **Cotisation Sécurité Sociale (CNAS)** :
   - Part Ouvrière (Retenue Salariale) : **9,00%** de l'assiette brute cotisable.
   - Part Patronale (Charge Employeur) : **26,00%** de l'assiette brute cotisable.
   - Référence : Décret exécutif n° 15-236 du 03 Septembre 2015 fixant les taux des cotisations de sécurité sociale (JO n° 49).

3. **Impôt sur le Revenu Global (IRG / Salaires)** :
   - Application du barème progressif officiel de la Direction Générale des Impôts (DGI) :
     - Tranche 0 à 20 000 DA : 0%
     - Tranche 20 001 à 40 000 DA : 23% (avec abattement légal de 40% sous plafond)
     - Tranche 40 001 à 80 000 DA : 27%
     - Tranche 80 001 à 160 000 DA : 30%
     - Tranche 160 001 à 320 000 DA : 33%
     - Tranche > 320 000 DA : 35%

---

## 3. Architecture des Rubriques Salariales Unitaires

Toutes les rubriques de paie sont configurables et identifiées par un code normalisé :

| Code Rubrique | Libellé | Type | Cotisable CNAS | Imposable IRG | Règle de Calcul |
|---|---|:---:|:---:|:---:|---|
| **R100** | Salaire de Base Mensuel | GAIN | OUI | OUI | Salaire contractuel (Minimum SNMG 24 000 DA) |
| **R110** | Indemnité d'Expérience Professionnelle (IEP) | GAIN | OUI | OUI | Taux d'ancienneté (ex: 12%) × Salaire de Base |
| **R120** | Heures Supplémentaires (+50%) | GAIN | OUI | OUI | (Salaire de Base / 173.33) × 1.50 × Nb Heures |
| **R125** | Heures Supplémentaires (+100% Nuit/Férié) | GAIN | OUI | OUI | (Salaire de Base / 173.33) × 2.00 × Nb Heures |
| **R150** | Prime de Panier Chantier | GAIN | NON | NON | Forfait journalier présence (ex: 800 DA / jour) |
| **R160** | Indemnité de Transport | GAIN | NON | NON | Forfait mensuel selon zone d'affectation |
| **R170** | Indemnité de Nuisance & Risque ATEX | GAIN | OUI | OUI | Taux de pénibilité (ex: 10%) × Salaire de Base |
| **R180** | Indemnité de Zone & Isolement Sud | GAIN | NON | OUI | Barème zone saharienne (HMD, In Amenas) |
| **R500** | Retenue Sécurité Sociale CNAS (9%) | RETENUE | - | - | 9% × Assiette Cotisable |
| **R600** | Retenue Fiscale IRG | RETENUE | - | - | Barème progressif DGI sur Imposable Net CNAS |

---

## 4. Passerelle vers PC Paie (Phase Ultérieure)

La structure des tables et des objets JSON générés respecte l'exactitude des champs exigés par PC Paie (Matricule, Rubrique, Base, Taux, Montant Gain, Montant Retenue). L'export pourra être branché directement sur le format fichier ASCII attendu par PC Paie sans refonte structurelle.

---
*SARL SILEX SERVICES — Contrôle de Gestion Sociale & Direction Financière.*
