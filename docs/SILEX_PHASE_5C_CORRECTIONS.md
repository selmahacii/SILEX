# RAPPORT DES CORRECTIONS COMPLÉMENTAIRES RH & VALIDATION AVANT FINANCE
**ERP SARL SILEX SERVICES — Version 2026**  
**Type de document :** Clôture formelle de la Phase 5C (Corrections P0 & Audit de Contrôle)  
**Date :** 13 Novembre 2026  
**Fichier :** `docs/SILEX_PHASE_5C_CORRECTIONS.md`

---

## 1. SYNTHÈSE DES ANOMALIES INITIALES ET CORRECTIONS APPORTÉES

Dans le cadre de la revue contradictoire approfondie, quatre anomalies majeures ont été identifiées et corrigées :

1. **Anomalie Moteur IRG (Priorité P0)** :
   - *Constat initial* : L'application n'appliquait qu'un premier abattement de 40% sans implémenter le **deuxième abattement légal DGI** applicable aux salaires compris entre 30 001 et 35 000 DA.
   - *Correction* : Intégration de la formule légale officielle de la Direction Générale des Impôts :
     $$\text{IRG Final} = \text{IRG après premier abattement} \times \left(\frac{137}{51}\right) - \left(\frac{27925}{8}\right)$$
   - *Résultat* : Lissage progressif parfait à la sortie du seuil d'exonération de 30 000 DA (30 001 DA imposé à seulement 2 DA au lieu de 1 300 DA).

2. **Restructuration des Cotisations Sociales CNAS & Charges Patronales** :
   - *Constat initial* : Présence d'un taux patronal global de 26% sans décomposition par branche.
   - *Correction* : Décomposition détaillée selon les Lois 83-11, 83-12 et le Décret exécutif 15-236 :
     - **Part Salariale (9,00%)** : Maladie/Maternité (1.50%), Retraite (6.75%), Chômage (0.50%), Retraite Anticipée (0.25%).
     - **Part Patronale Employeur (26,00%)** : Maladie/Maternité (12.50%), Retraite (10.00%), Accidents du travail (1.25%), Chômage (1.00%), Retraite Anticipée (0.25%).
     - **Contribution Fonds des Œuvres Sociales (FOS)** : 1,00% employeur distinct (Total employeur = 27,00%).
     - Ségrégation stricte : aucune charge patronale n'est imputée au net du salarié.

3. **Navigation & Interfaces Multi-Périmètres sur `/hr`** :
   - *Constat initial* : L'interface ne présentait que 4 onglets principaux. Les congés, ordres de mission, recrutements et rotations Sud étaient accessibles uniquement via API.
   - *Correction* : Extension fluide de la barre de navigation sur `/hr` avec **8 onglets opérationnels** :
     - 1. *Personnel*
     - 2. *Habilitations CQS*
     - 3. *Pointages & Feuilles de Site*
     - 4. *Congés & Absences* (avec circuit SoD Visa RH $\rightarrow$ Accord DG)
     - 5. *Ordres de Mission* (avec calcul du per diem, véhicule et visa DG)
     - 6. *Besoins Recrutement* (avec saisie chantier et arbitrage DG)
     - 7. *Rotations Sud (4×4 & 6×2)* (avec affichage des cycles et effectifs)
     - 8. *Moteur Paie & Débours 2026* (avec modal d'édition du bulletin A4 DEMO filigrané)

4. **Persistance DEMO & Cloisonnement PostgreSQL Neon** :
   - *Constat initial* : Les 12 collaborateurs DEMO étaient maintenus dans la mémoire volatile du store sans procédure de seed externe.
   - *Correction* : Création du script de seed idempotent `scripts/seed-hr-demo.js` pour initialiser ou réinitialiser une base PostgreSQL DEMO dédiée sans toucher aux données Neon de production.

---

## 2. FORMULES DE PAIE VÉRIFIÉES & RÉSULTATS COMPARATIFS IRG

### 2.1 Paliers de Validation Officiels DGI

| Salaire Imposable Net CNAS | IRG Brut Barème | 1er Abattement (40%) | 2ème Abattement Spécifique DGI | IRG Retenu Net | Conduite / Statut |
|:---:|:---:|:---:|:---:|:---:|---|
| **24 000 DA** | 0 DA | 0 DA | 0 DA | **0 DA** | Exonération légale (SNMG $\le$ 30 000 DA) |
| **30 000 DA** | 0 DA | 0 DA | 0 DA | **0 DA** | Plafond d'exonération totale |
| **30 001 DA** | 2 300 DA | 1 000 DA | 1 298 DA | **2 DA** | **Corrigé : Lissage sortie d'exonération** |
| **32 000 DA** | 2 760 DA | 1 104 DA | 698 DA | **958 DA** | **Corrigé : Formule (137/51) - (27925/8)** |
| **35 000 DA** | 3 450 DA | 1 380 DA | 0 DA | **2 070 DA** | Raccordement au régime général |
| **35 001 DA** | 3 450 DA | 1 380 DA | 0 DA | **2 070 DA** | Abattement 40% plafonné standard |
| **75 000 DA** | 14 050 DA | 1 500 DA (Plafond) | 0 DA | **12 550 DA** | Régime général, technicien |
| **120 000 DA** | 27 400 DA | 1 500 DA (Plafond) | 0 DA | **25 900 DA** | Régime général, cadre / ingénieur |
| **250 000 DA** | 69 100 DA | 1 500 DA (Plafond) | 0 DA | **67 600 DA** | Tranche 33%, cadre dirigeant |

> [!NOTE]
> **Formule Universelle du Net à Payer** :  
> $$\text{Net à Payer} = \text{Salaire Brut Global} - \text{CNAS Salariale (9\%)} - \text{IRG Retenu}$$

---

## 3. BANCS D'ESSAIS & RÉSULTATS DES TESTS

1. **Test Dédié IRG & CNAS (`scripts/test-irg-cnas.ts`)** :
   - 9 paliers réglementaires testés et validés à 100%.
   - Simulation complète de bulletin de paie sur profil DEMO (`DEMO-MAT-001`) validée.
2. **Suite E2E RH (`scripts/test-hr-e2e.js`)** :
   - Exécution directe via Node.js : **11 / 11 étapes réussies**.
3. **Suite Globale 4 Modules (`scripts/run-all-e2e.js`)** :
   - Suite 1 (Commercial) : 14/14 réussis.
   - Suite 2 (Projets Industriels) : 18/18 réussis.
   - Suite 3 (Achats & Stocks) : 18/18 réussis.
   - Suite 4 (Ressources Humaines & Mobilité) : 11/11 réussis.
   - **Total : 61 / 61 tests validés à 100%**.
4. **Builds & Typage** :
   - `pnpm --filter @silex/web exec tsc --noEmit` : **0 erreur**.
   - `pnpm --filter @silex/web exec next build` : **19 routes statiques/dynamiques générées**.
   - `pnpm --filter @silex/api exec nest build` : **0 erreur**.

---

## 4. LIMITATIONS RESTANTES & RECOMMANDATIONS CLIENT

- **Statut Réglementaire de la Paie** : La paie intégrée constitue un simulateur de débours de chantiers haute précision. Elle ne remplace pas le logiciel légal de paie de SARL SILEX SERVICES (**PC Paie**). Une validation formelle des paramètres conventionnels (IEP 1,5%, panier 800 DA/j, transport 5 000 DA) devra être effectuée avec le Responsable Paie de l'entreprise avant l'interconnexion finale.

---
*SARL SILEX SERVICES — Clôture de la Phase 5C & Autorisation d'Engagement Phase 6.*
