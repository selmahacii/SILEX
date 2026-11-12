# REVUE CRITIQUE & CONTRÔLE QUALITÉ — PHASE 2
**SARL SILEX SERVICES — ERP INDUSTRIEL**  
*Document de Contrôle Qualité — Étape 0 de la Phase 3*  
*Date : 12 Novembre 2026*

---

## 1. Contexte & Objectif

Conformément aux directives d'architecture de l'Étape 0 de la Phase 3, ce document consigne l'examen critique des livrables de la Phase 2 (Sécurisation du socle et Module Commercial). Il identifie les écarts méthodologiques, clarifie les définitions financières et juridiques, et arrête les mesures correctives immédiates.

---

## 2. Analyse des 6 Points de Contrôle

### A. Calcul de Marge : Marge sur Coût vs Taux de Marque
- **Constat d'audit :**  
  Dans la version initiale de la Phase 2, la formule implémentée utilisait par défaut le taux de marque sur prix de vente :
  $$P_{\text{vente}} = \frac{C_{\text{total}}}{1 - \frac{m}{100}}$$
  Certains acteurs industriels et contrôleurs de gestion raisonnent toutefois en marge sur coût (coefficient multiplicateur ou majoration directe) :
  $$P_{\text{vente}} = C_{\text{total}} \times \left(1 + \frac{m}{100}\right)$$
- **Clarification terminologique stricte :**
  - **Taux de marge (sur coût) :** Rapport de la marge brute sur le coût de revient total ($\frac{\text{Marge}}{C_{\text{total}}} \times 100$).
  - **Taux de marque (sur vente) :** Rapport de la marge brute sur le prix de vente HT ($\frac{\text{Marge}}{P_{\text{vente}}} \times 100$).
- **Action corrective appliquée :**  
  Le moteur de calcul prend désormais en charge un paramètre explicite `marginCalculationMode` avec deux options étiquetées sans ambiguïté :
  1. `TAUX_DE_MARQUE` : *Taux de marque sur Prix de Vente HT* (ex: 20% sur un coût de 80 donne un prix de 100 et 20 de marge).
  2. `MARGE_SUR_COUT` : *Marge brute sur Coût Total* (ex: 25% sur un coût de 80 donne un prix de 100 et 20 de marge).
  Les deux ratios sont systématiquement calculés et affichés côte à côte dans les fiches de coût pour éliminer toute confusion lors des arbitrages.

---

### B. TVA : Taux de Taxation Paramétrables
- **Constat d'audit :**  
  Le taux de TVA était fixé par défaut à 19% en dur.
- **Réalité fiscale algérienne & industrielle :**  
  - Taux normal : **19%** (prestations industrielles courantes, tuyauterie, maintenance).
  - Taux réduit : **9%** (certains équipements spécifiques, pièces agroalimentaires, intrants ciblés).
  - Régimes d'exonération : **0%** (opérations sous franchise de taxe, projets d'investissement sous convention **ANDI / AAPI**, exportations ou clients sous attestation d'exonération d'impôts indirects).
- **Action corrective appliquée :**  
  Le modèle `StoredCostSheet` et `StoredCustomerQuote` intègre un champ `vatRate: number` paramétrable (choix parmi 19%, 9%, 0% avec motif d'exonération obligatoire si 0%).

---

### C. Frais Généraux Chantier Paramétrables
- **Constat d'audit :**  
  Le taux de frais généraux de chantier était figé à 5% du coût direct.
- **Réalité des chantiers SILEX :**  
  Selon l'éloignement géographique (chantiers Hassi Messaoud / Skikda vs base locale Annaba) et la complexité logistique, ce taux varie entre 3% et 12%.
- **Action corrective appliquée :**  
  Le taux `overheadRatePercent` est configurable dans le volet Finance de la fiche de coût (par défaut 5%, ajustable par le Directeur Financier ou le Chef de Projet avec recalcul dynamique).

---

### D. Chaîne de Validation Commerciale vs Acceptation Client
- **Constat d'audit :**  
  La méthode `convertCostSheetToProject` autorisait la création d'un projet dès la validation interne DG de la fiche de coût, avant même l'accord formel du client.
- **Distinction du cycle de vie des ventes industrielles :**
  1. **Validation interne DG :** La DG approuve le chiffrage et les marges minimales (`VALIDEE` / Visa DG interne).
  2. **Émission & Envoi du Devis :** Le devis officiel A4 est notifié au client (`SOUMISE_CLIENT` / `DEVIS_ENVOYE`).
  3. **Négociation commerciale :** Échanges sur le planning et le bordereau des prix unitaires.
  4. **Acceptation Client & Contractualisation :** Réception d'un Bon de Commande client formel ou signature d'un Contrat de Marché (`CONTRAT_SIGNE` / `COMMANDE_CLIENT_RECUE`).
  5. **Ouverture du Chantier :** Notification de l'Ordre de Service (ODS) de démarrage et création du projet dans le module Projet.
- **Action corrective appliquée :**  
  La conversion en projet exige désormais que le devis ait été émis et qu'un numéro de Bon de Commande client (`clientPoNumber`) ou une référence de contrat signé (`contractReference`) soit renseigné, évitant l'engagement de ressources sur de simples devis non confirmés.

---

### E. Nature du "Visa DG"
- **Clarification juridique & fonctionnelle :**  
  Le `dgVisaSignature` (ex: `VISA-DG-XXXXXX-VALIDATED`) est un **visa de contrôle de gestion interne** assurant la traçabilité de l'approbation hiérarchique au sein du système ERP.
  Il ne constitue en aucun cas une signature électronique qualifiée au sens des règlements d'authentification forte par certificat tiers (comme le standard eIDAS européen ou l'Autorité Nationale de Certification Électronique en Algérie). Les documents contractuels externes destinés aux clients industriels font l'objet d'un paraphe et d'un cachet d'entreprise physique ou numérique scanné sur le document officiel.

---

### F. Audit des Tests E2E de la Phase 2
- **Inventaire :**  
  Le fichier `scripts/test-commercial-e2e.js` implémente **14 scénarios de test d'intégration backend/bridge**, couvrant :
  1. Initialisation catalogue & KPIs baseline.
  2. Création d'opportunité d'appel d'offres.
  3. Rattachement de fiche de coût.
  4. Contribution volet Projet.
  5. Contribution volet Achats.
  6. Contribution volet RH.
  7. Contribution volet Finance.
  8. Moteur arithmétique de calcul des coûts directs, indirects et prix de vente.
  9. Soumission pour arbitrage DG.
  10. Arbitrage DG et ajustement de marge.
  11. Génération de Devis Client formel et TVA.
  12. Conversion en projet industriel actif.
  13. Idempotence de la conversion.
  14. Mise à jour synchrone des KPIs du pipeline.
- **Complément frontend nécessaire :**  
  Les composants React du frontend ont été vérifiés via compilation stricte TypeScript (`tsc --noEmit`) et build statique Next.js 15 (`next build` sur 19 routes). Un test de composant interactif additionnel valide les interactions de la page commerciale.

---

## 3. Matrice de Remédiation Immédiate

| Réf | Sujet | État Précédent | Correction Phase 3 | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **REV-01** | Mode de calcul marge | Formule implicite unique | Paramétrage `TAUX_DE_MARQUE` ou `MARGE_SUR_COUT` | **Corrigé** |
| **REV-02** | Taux TVA | 19% codé en dur | Paramétrable (19%, 9%, 0% exonéré ANDI) | **Corrigé** |
| **REV-03** | Taux Frais Généraux | 5% figé | Paramétrable par projet dans le volet Finance | **Corrigé** |
| **REV-04** | Déclenchement projet | Direct après Visa DG | Requiert confirmation client (BC / Contrat) | **Corrigé** |
| **REV-05** | Visa DG | Libellé ambigu | Clarifié comme visa d'arbitrage interne | **Corrigé** |
