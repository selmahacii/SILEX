# RAPPORT D'IMPLÉMENTATION — MODULE 01 COMMERCIAL & CHIFFRAGE COLLABORATIF
**SARL SILEX SERVICES — ERP INDUSTRIEL**  
*Date de livraison : 12 Novembre 2026*  
*Auteurs : Équipe Architecture Logicielle & ERP Métier*

---

## 1. Vue d'Ensemble et Objectifs Atteints

Le **Module 01 Commercial** comble le vide fonctionnel identifié lors de l'audit technique. Il dote **SARL SILEX SERVICES** d'un moteur de chiffrage industriel collaboratif et d'un cycle d'avant-vente complet, éliminant les fichiers Excel dispersés et les risques de sous-estimation des chantiers.

Le cycle mis en œuvre couvre intégralement la chaîne de valeur :
$$\text{Opportunité / Appel d'Offres} \longrightarrow \text{Fiche de Coût Collaborative (4 Métiers)} \longrightarrow \text{Calcul Automatique des Marges} \longrightarrow \text{Arbitrage & Visa DG} \longrightarrow \text{Devis Client Officiel A4} \longrightarrow \text{Conversion en Projet Chantier Actif}$$

---

## 2. Architecture Technique & Modèle de Données

### 2.1 Entités Métier Implémentées

1. **`Opportunity` (Opportunité Commerciale)**
   - Référence : `OPP-YYYY-NNN`
   - Données : Client, contact, domaine d'activité (parmi les 5 officiels SILEX), budget estimé DZD, statut (`NOUVELLE`, `QUALIFIE`, `EN_ETUDE`, `DEVIS_ENVOYE`, `GAGNEE`, `PERDUE`, `SANS_SUITE`), source du lead (`APPEL_OFFRES`, `CONSULTATION_DIRECTE`, `PROSPECTION`, `CLIENT_EXISTANT`).

2. **`CostSheet` (Fiche de Coût Collaborative)**
   - Référence : `FC-YYYY-NNN`
   - Cycle de vie : `BROUILLON` $\to$ `PRETE_POUR_VALIDATION` $\to$ `EN_ATTENTE_DG` $\to$ `VALIDEE` / `REJETEE` / `MODIFICATION_DEMANDEE` $\to$ `SOUMISE_CLIENT` $\to$ `GAGNEE`.
   - Contributions des 4 départements :
     - **Projet** : Planning prévisionnel (dates, durée en jours), effectif équipe, moyens matériels lourds (grues, échafaudages, ATEX), contraintes HSE et lignes d'estimations techniques.
     - **Achats** : Lignes de débours matières (tubes, vannes, raccords, électrodes avec fournisseurs pressentis), locations d'engins, sous-traitance spécialisée (contrôles CND, traitement thermique PWHT).
     - **Ressources Humaines** : Effectif mobilisé (tuyauteurs, soudeurs certifiés 6G, superviseurs, animateurs HSE), débours main d'œuvre directe, frais de base de vie, hébergement et transport chantier.
     - **Finance** : Frais financiers (cautions d'avance / bancaires de bonne exécution), analyse de solvabilité client, conditions de paiement et taux de marge cible.

3. **`CustomerQuote` (Devis Client Formel)**
   - Référence : `DEV-YYYY-NNN`
   - Généré automatiquement depuis une Fiche de Coût validée par la DG.
   - Montant Hors Taxes, TVA algérienne à 19%, Montant TTC en Dinars Algériens (DZD).
   - Conditions de paiement industrielles (avances, situations sur attachements, retenue de garantie 5-10%).
   - Vue A4 imprimable avec en-tête officielle, coordonnées SILEX et visa direction.

4. **`Project` (Projet Industriel)**
   - Issu de la conversion directe et idempotente de la Fiche de Coût lors de l'attribution du marché.
   - Récupère le budget prévisionnel (coût total) et le montant contractuel (prix de vente).

---

## 3. Modèle Mathématique & Formules de Chiffrage

Toutes les devises sont gérées en **Dinars Algériens (DZD)** avec protection contre la division par zéro :

1. **Coût Direct Chantier ($C_{\text{direct}}$) :**
   $$C_{\text{direct}} = \sum (\text{Achats Matières}) + \sum (\text{Locations}) + \sum (\text{Sous-Traitance}) + \sum (\text{Main d'œuvre directe})$$

2. **Coût Indirect Chantier ($C_{\text{indirect}}$) :**
   $$C_{\text{indirect}} = \text{Frais de Vie/Équipe (RH)} + \text{Frais Généraux Chantier (5\% de } C_{\text{direct}}\text{)} + \text{Frais Financiers (Cautions)}$$

3. **Coût Total Prévisionnel ($C_{\text{total}}$) :**
   $$C_{\text{total}} = C_{\text{direct}} + C_{\text{indirect}}$$

4. **Prix de Vente HT Proposé ($P_{\text{vente}}$) selon Taux de Marge Cible ($M\%$):**
   $$P_{\text{vente}} = \frac{C_{\text{total}}}{1 - \frac{M}{100}}$$

5. **Marge en Valeur ($\Delta M$) & Taux de Marque :**
   $$\Delta M = P_{\text{vente}} - C_{\text{total}}$$
   $$\text{Taux de marque} = \frac{\Delta M}{P_{\text{vente}}} \times 100$$
   $$\text{Marge sur coût} = \frac{\Delta M}{C_{\text{total}}} \times 100$$

6. **TVA & Prix Toutes Taxes Comprises :**
   $$\text{TVA (19\%)} = \text{round}(P_{\text{vente}} \times 0.19)$$
   $$\text{TTC} = P_{\text{vente}} + \text{TVA}$$

---

## 4. Endpoints API Implémentés

| Méthode | Route API | Rôles Autorisés | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/commercial/kpis` | Tous les départements | Pipeline global, décompte fiches, taux de conversion |
| `GET` | `/api/commercial/opportunities` | Commercial, DG, RP | Liste des affaires et appels d'offres |
| `POST` | `/api/commercial/opportunities` | Commercial, DG, RP | Création d'une nouvelle opportunité |
| `GET` | `/api/commercial/cost-sheets` | Tous départements autorisés | Liste des fiches de chiffrage collaboratif |
| `GET` | `/api/commercial/cost-sheets/:id` | Tous départements autorisés | Détail d'une fiche avec ses 4 contributions |
| `POST` | `/api/commercial/cost-sheets` | RP, Achats, RH, Finance, DG | Création d'une nouvelle fiche de coût |
| `PATCH` | `/api/commercial/cost-sheets/:id/PROJECT` | RP, DG | Saisie de la contribution Projet & Travaux |
| `PATCH` | `/api/commercial/cost-sheets/:id/PROCUREMENT` | Achats, DG | Saisie de la contribution Achats & Sous-traitance |
| `PATCH` | `/api/commercial/cost-sheets/:id/HR` | RH, DG | Saisie de la contribution Main d'œuvre & Équipe |
| `PATCH` | `/api/commercial/cost-sheets/:id/FINANCE` | Finance, DG | Saisie de la contribution Frais & Marge |
| `POST` | `/api/commercial/cost-sheets/:id/submit-dg` | RP, Finance, DG | Soumission officielle de la fiche pour arbitrage |
| `POST` | `/api/commercial/cost-sheets/:id/arbitrate` | **Directeur Général**, Admin | Arbitrage DG (Validation, Marge, Visa cryptographique) |
| `POST` | `/api/commercial/cost-sheets/:id/create-quote` | Commercial, DG | Édition formelle du Devis Client A4 |
| `POST` | `/api/commercial/cost-sheets/:id/convert-project` | **Directeur Général**, RP | Conversion de l'affaire gagnée en Chantier Actif |
| `GET` | `/api/commercial/quotes` | Tous rôles autorisés | Consultation du registre des devis émis |

---

## 5. Interface Utilisateur Frontend

Accessible via la navigation latérale fixe sous l'icône **`Commercial & Devis`** (`/commercial`) :
1. **Onglet 1 — Fiches de Coût Collaboratives :**
   - Indicateurs visuels des 4 départements (badge vert quand complété, ambre quand en attente).
   - Accès aux formulaires de saisie dédiés par corps de métier avec sauvegarde en temps réel.
   - Bouton d'arbitrage DG avec modal sécurisée permettant l'ajustement de marge et la signature électronique.
   - Bouton de conversion directe en projet dès validation DG.
2. **Onglet 2 — Suivi des Opportunités & Appels d'Offres :**
   - Vue synthétique par client, secteur industriel, montant prévisionnel et état d'avancement commercial.
   - Modal de création d'opportunité avec rattachement immédiat à une fiche de coût.
3. **Onglet 3 — Devis Clients Officiels & Impression A4 :**
   - Liste des devis horodatés avec statut de transmission.
   - Vue papier A4 conforme aux standards SILEX (logo officiel, mentions légales, ventilation HT / TVA 19% / TTC, délais contractuels).
4. **Tableau de Bord Direction Générale (`/dashboard`) :**
   - Intégration d'un panneau exécutif affichant le montant total du pipeline commercial, le nombre de fiches en attente de visa DG, les affaires gagnées et le chiffre d'affaires prévisionnel engagé.

---

## 6. Validation par Test E2E Automatisé

Le script `scripts/test-commercial-e2e.js` a exécuté l'intégralité du cycle avec les résultats suivants :

```
=== TEST E2E: MODULE 01 COMMERCIAL SARL SILEX SERVICES ===

[1] Initialisation catalogue commercial : 2 opportunités baseline, 1 fiche baseline
[2] Création opportunité OPP-2026-003 (Arrêt Technique Skikda — 45 000 000 DZD) -> OK
[3] Création fiche de coût collaborative FC-2026-002 -> OK (Statut: BROUILLON)
[4] Contribution Département PROJET (75j, ATEX, moyens Miller/Layher) -> OK
[5] Contribution Département ACHATS (Tubes A106, PetroValve, CND) -> OK
[6] Contribution Département RH (32 pers, soudeurs 6G, base de vie) -> OK
[7] Contribution Département FINANCE (cautions, marge 25%) -> OK
[8] Calculs financiers automatiques :
    - Coût Direct Calculé : 29 250 000 DZD
    - Coût Indirect Calculé : 3 662 500 DZD
    - Coût Total Chantier : 32 912 500 DZD
    - Prix de Vente HT Proposé : 43 883 333 DZD
    - Statut Fiche : PRETE_POUR_VALIDATION
[9] Soumission pour Arbitrage DG -> OK (Statut: EN_ATTENTE_DG)
[10] Arbitrage Direction Générale (Marge portée à 28%) :
    - Statut : VALIDEE (APPROVED)
    - Nouveau Prix de Vente : 45 711 806 DZD
[11] Génération Devis DEV-2026-001 :
    - HT : 45 711 806 DZD | TVA 19% : 8 685 243 DZD | TTC : 54 397 049 DZD -> OK
[12] Conversion en Projet Industriel :
    - Code : PRJ-2026-001 | Budget : 32 912 500 DZD | Contrat : 45 711 806 DZD -> OK
[13] Vérification Idempotence de la conversion :
    - 2ème appel retourne le projet PRJ-2026-001 existant (aucun doublon) -> OK
[14] Statuts finaux et KPIs mis à jour : Opportunité = GAGNEE, CA gagné = 45 711 806 DZD -> OK

===============================================================
✅ TEST E2E VALIDÉ À 100% : LE CYCLE COMMERCIAL COMPLET FONCTIONNE !
===============================================================
```

---

## 7. Conformité aux Exigences & Prochaines Étapes

Le Module 01 Commercial est prêt pour la production et pour les démonstrations clients, consolidé sur le socle technique sécurisé (tokens HMAC-SHA256 avec expiration 24h, typage partagé et compatibilité Next.js 15).
