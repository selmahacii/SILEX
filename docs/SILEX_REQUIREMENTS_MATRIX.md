# MATRICE DE TRAÇABILITÉ DES EXIGENCES — PROTOTYPE ERP SARL SILEX SERVICES
**Document de Référence — Phase 2 : Exigences Métier & Traçabilité**  
**Date :** Novembre 2026  
**Client :** SARL SILEX SERVICES (Algérie)  
**Fichier :** `docs/SILEX_REQUIREMENTS_MATRIX.md`

---

## 1. SYNTHÈSE DES STATUTS PAR MODULE

| Module | Fonctionnalités Totales | Existant & Fonctionnel | Existant Incomplet | À Développer | À Valider Client |
|---|---|---|---|---|---|
| **Module 01 — Commercial** | 12 | 11 | 0 | 0 | 1 |
| **Module 02 — Projet** | 13 | 13 | 0 | 0 | 0 |
| **Module 03 — Achats & Stocks**| 12 | 7 | 3 | 2 | 0 |
| **Module 04 — Ressources Humaines** | 12 | 5 | 3 | 3 | 1 |
| **Module 05 — Finance & Comptabilité** | 11 | 4 | 4 | 3 | 0 |
| **Transversal & Direction Générale** | 10 | 7 | 2 | 1 | 0 |
| **TOTAL** | **70** | **47** | **12** | **9** | **2** |

---

## 2. DÉTAIL DES EXIGENCES PAR MODULE

### MODULE 01 — COMMERCIAL (PROCESSUS AMONT & DEVIS)

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **COM-01** | Prospection & Opportunités | Enregistrement des opportunités d'affaires, consultations et appels d'offres reçus avec date limite et localisation. | `/commercial` | Resp. Commercial, DG | Brouillon → En cours → Qualifié / Perdu | Fiche Opportunité | **EXISTANT ET FONCTIONNEL** | P1 | Vue liste, modal création d'opportunité, filtres sectoriels et conversion en fiche de coût. |
| **COM-02** | Fiche de Coût Collaborative — Projet | Saisie de la contribution technique travaux : description, quantités, durées en jours, moyens matériels. | `/commercial` | Resp. Projet, DG | Contribution Projet | Volet Technique | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Volet Projet opérationnel : description travaux, planning, moyens ATEX et lignes chiffrées. |
| **COM-03** | Fiche de Coût Collaborative — Achats | Saisie des fournitures, consommables, sous-traitance prévisionnelle, prix unitaires estimés et transport. | `/commercial` | Resp. Achats, DG | Contribution Achats | Volet Débours Achats | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Volet Achats opérationnel : fournitures tuyauterie, vannes, locations engins et sous-traitance CND. |
| **COM-04** | Fiche de Coût Collaborative — RH | Saisie des profils requis (soudeurs, tuyauteurs, monteurs), effectifs, durée, taux journaliers et débours équipe. | `/commercial` | Resp. RH, DG | Contribution RH | Volet Main d'Œuvre | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Volet RH opérationnel : effectifs tuyauteurs/soudeurs 6G, journées, débours équipe et base de vie. |
| **COM-05** | Fiche de Coût Collaborative — Finance | Analyse financière : coût direct total, marge cible, besoin trésorerie prévisionnel, délais paiement, risques. | `/commercial` | Resp. Financier, DG | Contribution Finance | Volet Rentabilité & Risques | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Volet Finance opérationnel : calculs automatiques coûts directs/indirects, marge, FG 5% et prix DZD. |
| **COM-06** | Validation DG Fiche de Coût | Revue transversale consolidée des 4 contributions, arbitrage de la marge et décision (Approuver / Rejeter / Réviser). | `/commercial`, `/workflows` | Directeur Général | En attente DG → Validée / Rejetée | Fiche de Coût Signée | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Modal d'arbitrage DG avec ajustement de marge, visa électronique et historisation complète. |
| **COM-07** | Conversion Automatique Fiche → Projet | Génération automatique d'un nouveau projet chantier avec budget découpé et jalons dès validation de l'offre. | `/commercial` | DG, Resp. Projet | Validé → Projet Initialisé | Fiche d'Ouverture Chantier | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Conversion instantanée et idempotente vers `Project` avec préservation des budgets. |
| **COM-08** | Devis Client Professionnel | Génération d'un devis formel chiffré en DA avec conditions de paiement et délais de validité. | `/commercial` | Resp. Commercial, DG | Édition → Envoyé → Accepté | Devis A4 Imprimable | **EXISTANT ET FONCTIONNEL** | P1 | Générateur de Devis A4 avec ventilation HT / TVA 19% / TTC et conditions contractuelles. |
| **COM-09** | Bons de Commande Clients & Contrats | Enregistrement de la commande client acceptée, référence marché et conditions particulières. | `/commercial` | Resp. Commercial, DG | Reçu → Contractualisé | Registre Contrats | **EXISTANT ET FONCTIONNEL** | P2 | Suivi du passage en commande client et statut de conversion projet. |
| **COM-10** | Ordres de Service (ODS) | Suivi des ODS contractuels (démarrage, suspension, reprise, modification). | `/projects/[code]` | Resp. Projet, DG | Émis → Notifié | PV Ordre de Service | **EXISTANT ET FONCTIONNEL** | P2 | Intégré dans l'onglet ODS des projets avec impact sur délai. |
| **COM-11** | Attachements & Situations | Métrés contradictoires périodiques et situations de travaux validées. | `/projects/[code]` | Resp. Projet, DG | Projeté → Vérifié → Approuvé | Situation de Travaux A4 | **EXISTANT ET FONCTIONNEL** | P2 | Modèle `WorkSituation` avec statuts complets et retenue 5%. |
| **COM-12** | Enquêtes de Satisfaction Client | Évaluation post-chantier par le client industriel (qualité, délais, HSE). | `/commercial/satisfaction` | Resp. Qualité, DG | Soumis → Enregistré | Fiche Évaluation Client | **À VALIDER AVEC LE CLIENT** | P3 | Formulaire de notation 5 critères. |

---

### MODULE 02 — PROJETS INDUSTRIELS & CHANTIERS

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **PRJ-01** | Fiche Projet & Organisation | Ouverture et paramétrage du chantier : client, localisation, montant contractuel, budget, responsable. | `/projects`, `/projects/[code]` | DG, Resp. Projet | Création → En cours → Clôturé | Fiche Synthèse Projet | **EXISTANT ET FONCTIONNEL** | P1 | Affichage complet, filtres sectoriels et 14 onglets spécialisés. |
| **PRJ-02** | Planification & Jalons | Définition des jalons contractuels et des tâches avec dates et avancements. | `/projects/[code]` | Resp. Projet | En attente → En cours → Franchi | Planning de Projet | **EXISTANT ET FONCTIONNEL** | P1 | Onglet Jalons & Tâches avec préréglages industriels CND/LOTO. |
| **PRJ-03** | Double Avancement (Physique & Financier) | Découplage strict entre l'avancement physique constaté sur le terrain et la consommation financière. | `/projects/[code]` | Resp. Projet, DG | Ajustement dynamique | Indicateurs KPI | **EXISTANT ET FONCTIONNEL** | P1 | Calcul physique pondéré sur lots de métrés vs facturé vs consommé. |
| **PRJ-04** | Rapport Journalier de Chantier (RJC / DSR) | Saisie quotidienne des conditions météo, effectifs par métier, métrés réalisés, engins, matériaux, HSE et visa contradictoire. | `/projects/[code]` (Onglet RJC) | Chef de Chantier, Resp. Projet, DG | Rédigé → Soumis → Visé | Rapport Journalier A4 Imprimable | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Composant dédié `ProjectDailyReportsTab`, visa DG et aperçu officiel A4 imprimable. |
| **PRJ-05** | Rapport de Situation Périodique (RSP) | Bilan consolidé d'avancement croisé, écarts délais, surcoûts, approvisionnements et effectifs. | `/projects/[code]` (Onglet RSP) | Resp. Projet, DG | Périodique (Mensuel/Quinzaine) | Fiche RSP A4 Imprimable | **EXISTANT ET FONCTIONNEL** | P2 | Composant dédié `ProjectSituationReportsTab` avec synthèse exécutive. |
| **PRJ-06** | Registre des Contraintes & Difficultés | Déclaration centralisée des blocages chantier (accès site, intempéries, indisponibilité pièces) avec impact jours/coûts et levée. | `/projects/[code]` (Onglet Contraintes) | Resp. Projet, DG | Signalée → En cours → Résolue | Registre Contraintes & PV Levée | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Composant dédié `ProjectConstraintsTab` avec sévérité, alertes et levée formelle. |
| **PRJ-07** | Affectation Ressources & Équipe | Rattachement des collaborateurs et engins de chantier au projet actif avec suivi des qualifications. | `/projects/[code]` (Onglet RH) | Resp. Projet, DG | Assigné → Démobilisé | Organigramme Chantier | **EXISTANT ET FONCTIONNEL** | P1 | Composant `ProjectHrTab` avec profils métiers et demande de renfort RH. |
| **PRJ-08** | Suivi des Consommations Matières | Déstockage et imputation automatique des pièces/tuyaux sur le chantier concerné. | `/projects/[code]`, `/inventory` | Resp. Magasin, Resp. Projet | Sortie Magasin → Imputation | Bon de Sortie Projet | **EXISTANT ET FONCTIONNEL** | P1 | Modal de sortie réelle imputant le budget consommé et déduisant le stock. |
| **PRJ-09** | Suivi Dépenses & Frais de Chantier | Enregistrement des frais directs (transport, gasoil, outillage rapide). | `/projects/[code]` | Resp. Projet, Finance | Enregistré → Consolidé | Journal des Coûts | **EXISTANT ET FONCTIONNEL** | P1 | Modal d'imputation directe avec mise à jour du coût réel. |
| **PRJ-10** | Contrôle Qualité & CND Chantier | Déclaration des non-conformités de soudage/tuyauterie, événements HSE et tirs radio. | `/quality`, `/projects/[code]` | Resp. Qualité, Resp. HSE | Ouverte → Action → Clôturée | Fiche FNC & PV CND | **EXISTANT ET FONCTIONNEL** | P1 | Composant dédié `ProjectHseTab` avec suivi des près-accidents et tirs radio. |
| **PRJ-11** | Alertes Retards & Dépassement Budget | Détection proactive des retards sur jalons critiques et alertes si coût engagé > budget. | `/projects`, `/projects/[code]` | DG, Resp. Projet | Automatique | Alertes Visuelles | **EXISTANT ET FONCTIONNEL** | P2 | Calcul automatique `isDelayed = plannedEndDate < today` et indicateurs surcoûts. |
| **PRJ-12** | Clôture de Chantier & Réception Définitive | Clôture formelle des travaux, PV contradictoire et levée des réserves. | `/projects/[code]` | DG, Resp. Projet | Réception Provisoire → Définitive | PV Réception Définitive | **EXISTANT ET FONCTIONNEL** | P3 | Statut COMPLETED avec historisation complète et archivage analytique. |
| **PRJ-13** | Expression de Besoin Achats Chantier (DA) | Émission directe de demandes d'achat depuis le chantier vers le module Achats avec impact sur budget engagé. | `/projects/[code]` | Resp. Projet, Achats | Émise → Consultation → Commandée | Demande d'Achat (DA) | **EXISTANT ET FONCTIONNEL** | **P1 (CRITIQUE)** | Modal DA rapide avec imputation immédiate au `committedBudget`. |

---

### MODULE 03 — ACHATS ET GESTION DES STOCKS

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **ACH-01** | Expression de Besoin / DA Chantier | Émission d'une Demande d'Achat rattachée au projet, avec désignation, quantités et urgence. | `/procurement` | Resp. Projet, Achats | Brouillon → Soumise → Consultation | Demande d'Achat (DA) | **EXISTANT ET FONCTIONNEL** | P1 | Formulaire DA avec lignes chiffrées et régime TVA DZ. |
| **ACH-02** | Consultation Fournisseurs & Devis | Saisie de plusieurs offres concurrentes par DA pour mise en concurrence. | `/procurement` | Resp. Achats | En consultation → Offres saisies | Tableau des Offres | **EXISTANT ET FONCTIONNEL** | P1 | Saisie dynamique des devis fournisseurs par ligne. |
| **ACH-03** | Comparatif TCO Multicritères | Analyse comparative pondérée : Prix unitaire, Transport, Délais, Garantie, Disponibilité, Conformité technique. | `/procurement` | Resp. Achats, DG | En comparaison → Fournisseur retenu | Grille d'Évaluation TCO | **À DÉVELOPPER** | **P1** | Tableau de scoring TCO multicritères avec recommandation. |
| **ACH-04** | Circuit de Validation DG (SoD) | Validation hiérarchique avec séparation des tâches (le demandeur ne peut pas approuver son achat). | `/procurement`, `/workflows` | Directeur Général | En attente DG → Validé / Rejeté | Visa DG | **EXISTANT ET FONCTIONNEL** | P1 | Ségrégation stricte des rôles et enregistrement d'audit. |
| **ACH-05** | Bon de Commande Fournisseur (BC) | Génération du BC numéroté après validation DG, avec TVA légale (19%, 9% ou 0% ANDI). | `/procurement` | Resp. Achats | Validé → BC Émis | Bon de Commande A4 | **EXISTANT ET FONCTIONNEL** | P1 | Création automatique du BC lié à la DA. |
| **ACH-06** | Réception Fournisseur (Contrôle Quantitatif) | Réception en magasin avec rapprochement direct BC, contrôle quantités et conformité. | `/inventory`, `/procurement` | Resp. Magasin | Réception partielle / totale | Bon de Réception A4 | **EXISTANT ET FONCTIONNEL** | P1 | Incrémentation immédiate du stock physique magasin. |
| **ACH-07** | Sortie de Stock vers Chantier | Émission de bons de sortie pour affecter les pièces à un projet spécifique. | `/inventory` | Resp. Magasin | Sortie validée | Bon de Sortie Chantier | **EXISTANT ET FONCTIONNEL** | P1 | Décrémentation avec vérification stricte anti-négatif. |
| **ACH-08** | Gestion Multi-Magasins & Dépôts | Suivi des stocks par magasin central (ex. Hassi Messaoud, Rouiba) et dépôts chantiers. | `/inventory` | Resp. Magasin | Consultation en temps réel | Fiche Stock Magasin | **EXISTANT ET FONCTIONNEL** | P1 | Gestion des entrepôts physiques multiples. |
| **ACH-09** | Transferts Inter-Dépôts | Mouvements de stock entre deux magasins ou entre magasin central et chantier. | `/inventory` | Resp. Magasin | Transfert émis → Réceptionné | Bon de Transfert | **EXISTANT ET FONCTIONNEL** | P2 | Mouvement de type `WAREHOUSE_TRANSFER`. |
| **ACH-10** | Inventaires Physiques Périodiques | Saisie des comptages physiques et calcul des écarts d'inventaire. | `/inventory/inventaires` | Resp. Magasin, Finance | Planifié → Réalisé → Ajusté | Procès-Verbal d'Inventaire | **À DÉVELOPPER** | P2 | Écran de pointage d'inventaire et ajustement d'écart. |
| **ACH-11** | Seuils d'Alerte & Réapprovisionnement | Détection automatique des articles sous stock minimum de sécurité. | `/inventory`, `/dashboard` | Resp. Magasin | Alerte temps réel | Liste Ruptures Potentielles | **EXISTANT ET FONCTIONNEL** | P2 | Badge rouge "Alerte Rupture" sur les articles critiques. |
| **ACH-12** | Évaluation Fournisseurs | Notation de la performance des fournisseurs (qualité livrée, respect délais). | `/procurement` | Resp. Achats | Périodique | Fiche Fournisseur | **EXISTANT MAIS INCOMPLET**| P3 | Note globale 1-5 étoiles affichée, grille détaillée à compléter. |

---

### MODULE 04 — RESSOURCES HUMAINES & COMPÉTENCES

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **RH-01** | Référentiel du Personnel & Dossiers | Fiches collaborateurs avec matricule, fonction, contrat (CDI/CDD), département, coordonnées. | `/hr` | Resp. RH, DG | Actif / Sorti | Fiche Employé | **EXISTANT ET FONCTIONNEL** | P1 | Liste collaborateurs et modal de création d'employé. |
| **RH-02** | Compétences, Habilitations & CQS | Suivi des certifications industrielles (soudage ASME, CQS, habilitation électrique, visite médicale). | `/hr` | Resp. RH, Qualité | En cours → Valide → Expiré | Certificat de Qualification | **EXISTANT ET FONCTIONNEL** | P1 | Gestion des dates d'expiration et statut de validité. |
| **RH-03** | Affectation aux Chantiers | Mobilisation du personnel sur les projets avec dates d'intervention. | `/hr`, `/projects/[code]` | Resp. RH, Resp. Projet | Affecté → Démobilisé | Ordre d'Affectation | **EXISTANT ET FONCTIONNEL** | P1 | Attribution des collaborateurs par projet. |
| **RH-04** | Pointage Quotidien Chantier | Enregistrement des heures régulières et supplémentaires travaillées par chantier. | `/hr` | Chef de Chantier, RH | Pointé → Validé RH | Relevé des Pointages | **EXISTANT ET FONCTIONNEL** | P1 | Saisie d'heures et motifs d'absence. |
| **RH-05** | Demandes de Congés & Absences | Saisie des congés payés, autorisations d'absence, récupération et maladie. | `/hr` | Tout collaborateur, RH, DG | Rédigé → Validé RH → Visa DG | Titre de Congé A4 | **À DÉVELOPPER** | **P1** | Formulaire demande de congé et circuit d'approbation. |
| **RH-06** | Ordres de Mission & Déplacements | Émission d'ordres de mission pour les interventions sur chantiers distants (frais, transport, durée). | `/hr` | Resp. RH, DG | Demande → Ordre émis → Clôturé | Ordre de Mission A4 | **À DÉVELOPPER** | **P1** | Saisie mission avec destination, objet et génération PDF A4. |
| **RH-07** | Expression de Besoin en Recrutement | Demande de renfort de personnel pour un projet (profil, qualification, nombre, durée). | `/hr` | Resp. Projet, RH, DG | Émis → Approuvé DG → Recrutement | Fiche Besoin RH | **À DÉVELOPPER** | **P2** | Formulaire de demande de recrutement rattaché au chantier. |
| **RH-08** | Fiche de Paie de Démonstration (DEMO) | Spécimen de bulletin de paie industriel avec rubriques démo (salaire de base, paniers, déplacement, retenues). | `/hr` | Resp. RH, Finance, DG | Simulation mensuelle | Bulletin de Paie DEMO A4 | **À DÉVELOPPER** | **P2** | Modèle imprimable A4 mentionnant explicitement "DOCUMENT DÉMO". |
| **RH-09** | Plan de Formation & Recyclage | Programmation des formations de recyclage sécurité et habilitations périodiques. | `/hr` | Resp. RH | Planifié → Dispensé | Registre des Formations | **EXISTANT MAIS INCOMPLET**| P3 | Calendrier des formations à venir. |
| **RH-10** | Déclarations Réglementaires (CNAS/DAS) | Spécimens indicatifs des états récapitulatifs pour la prévoyance sociale algérienne. | `/hr` | Resp. RH, Finance | Annuel / Trimestriel | État Récapitulatif DEMO | **À VALIDER AVEC LE CLIENT** | P3 | Mentionner en phase ultérieure d'intégration PC Paie. |
| **RH-11** | Suivi de la Main-d'Œuvre Indirecte | Suivi des ratios d'encadrement chantier (chefs d'équipe, superviseurs HSE vs ouvriers). | `/hr`, `/dashboard` | DG, Resp. RH | Indicateurs de bord | Tableau Effectifs Chantier | **EXISTANT MAIS INCOMPLET**| P3 | Ratios calculés dans les vues analytiques. |
| **RH-12** | Traçabilité des Mouvements de Personnel | Journal des mobilités entre chantiers et rotations d'équipes en zone sud. | `/hr` | Resp. RH | Historisé | Journal des Affectations | **EXISTANT MAIS INCOMPLET**| P3 | Historique des projets par salarié. |

---

### MODULE 05 — FINANCE, FACTURATION & TRÉSORERIE

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **FIN-01** | Suivi Budgétaire Consolidé | Synthèse financière globale : Chiffre d'Affaires contractuel, montants engagés, coûts réels, marge brute. | `/finance`, `/dashboard` | DG, Resp. Financier | Actualisation temps réel | Tableau de Bord Financier | **EXISTANT ET FONCTIONNEL** | P1 | Indicateurs en direct sur la base des débours réels. |
| **FIN-02** | Validation Financière Fiche de Coût | Évaluation amont des marges et du besoin de trésorerie avant engagement commercial. | `/commercial/fiches-cout/[id]` | Resp. Financier, DG | Analyse → Avis favorable/réservé | Visa Financier | **À DÉVELOPPER** | **P1** | Volet financier dans la fiche de coût collaborative. |
| **FIN-03** | Facturation Client (Factures Situations) | Suivi des factures émises sur la base des attachements et situations de travaux validées. | `/finance` | Resp. Financier, DG | Émise → Transmise → Encaissée | Facture Client A4 | **À DÉVELOPPER** | **P1** | Liste des factures clients avec état d'encaissement. |
| **FIN-04** | Suivi des Créances & Balance Âgée | Suivi des factures clients impayées avec échéances (0-30j, 30-60j, >60j) et relances. | `/finance` | Resp. Financier, DG | Échue / Non échue | Balance Âgée Clients | **À DÉVELOPPER** | **P1** | Tableau de balance âgée des créances clients. |
| **FIN-05** | Suivi des Dettes Fournisseurs | Enregistrement des factures fournisseurs rattachées aux bons de commande et réceptions. | `/finance` | Resp. Financier | Reçue → Vérifiée → Réglée | Échéancier Dettes | **À DÉVELOPPER** | **P2** | Tableau des factures fournisseurs à payer. |
| **FIN-06** | Enregistrement des Règlements | Enregistrement des encaissements clients et décaissements fournisseurs (Virement, Chèque). | `/finance` | Resp. Financier | Enregistré | Reçu de Règlement | **EXISTANT ET FONCTIONNEL** | P1 | Action "Enregistrer un Règlement" opérationnelle. |
| **FIN-07** | Gestion des Retenues de Garantie | Suivi de la retenue de garantie contractuelle (usuellement 5% à 10%) et de sa date de libération. | `/finance` | Resp. Financier, DG | Bloquée → Libérée | Certificat de Libération RG | **EXISTANT ET FONCTIONNEL** | P1 | Calcul automatique de la RG et bouton de libération. |
| **FIN-08** | Rentabilité Analytique par Chantier | Calcul automatique de la marge réelle par projet : CA facturé - (Matières + MO + Sous-traitance + Frais). | `/finance`, `/projects/[code]` | DG, Resp. Financier | Calcul temps réel | Fiche Rentabilité Chantier | **EXISTANT ET FONCTIONNEL** | P1 | Décomposition des coûts directs et marge dégagée. |
| **FIN-09** | Plan de Trésorerie Prévisionnel | Évolution prévisionnelle des flux de trésorerie entrants (situations) et sortants (achats, salaires). | `/finance` | DG, Resp. Financier | Mensuel | Tableau Flux Trésorerie | **EXISTANT MAIS INCOMPLET**| P2 | Graphique prévisionnel trésorerie. |
| **FIN-10** | Régime Fiscal Algérien & Déclarations | Application stricte des taux de TVA (19%, 9%, exonération ANDI avec attestation). | `/procurement`, `/finance` | Resp. Achats, Finance | Paramétré | Attestation de Dépense Fiscale | **EXISTANT ET FONCTIONNEL** | P1 | Sélecteur fiscal opérationnel avec calcul TTC. |
| **FIN-11** | Passerelle PC Comptable (Phase Ultérieure) | Export des écritures d'achats, ventes et règlements au format d'importation PC Comptable. | `/finance/export` | Resp. Financier | Export périodique | Fichier d'Écritures ASCII | **EXISTANT MAIS INCOMPLET**| P3 | Spécifications des colonnes à cadrer pour PC Comptable. |

---

### TRANSVERSAL & DIRECTION GÉNÉRALE (PILOTAGE GLOBALE & GOUVERNANCE)

| ID | Fonctionnalité | Description Métier | Écran Concerné | Rôle Autorisé | Workflow | Document Généré | Statut Actuel | Priorité | Travail Nécessaire |
|---|---|---|---|---|---|---|---|---|---|
| **TRV-01** | Dashboard Général DG | Vue 360° en temps réel : indicateurs commerciaux, chantiers, achats, effectifs et trésorerie. | `/dashboard` | Directeur Général | Tableau interactif | Synthèse Exécutive | **EXISTANT ET FONCTIONNEL** | P1 | Intégrer les KPIs du nouveau module Commercial. |
| **TRV-02** | Espace Centralisé des Validations | Regroupement de toutes les décisions en attente de visa DG (Fiches de coût, DA, BC, Congés, Dépenses). | `/workflows` | Directeur Général | Validation multi-objets | Visa Numérique DG | **EXISTANT ET FONCTIONNEL** | P1 | Ajouter les fiches de coût et congés dans la boîte d'approbation. |
| **TRV-03** | Matrice RBAC & Ségrégation des Tâches | Cloisonnement strict des accès par profil (un acheteur ne valide pas le paiement, un chef de projet ne voit pas les salaires). | `/admin` | Administrateur, DG | Matrice dynamique | Matrice des Droits | **EXISTANT ET FONCTIONNEL** | P1 | Configuration matricielle éditable par module et rôle. |
| **TRV-04** | Journal d'Audit & Traçabilité Immuable | Enregistrement de chaque création, modification, approbation avec auteur, heure, IP et détails. | `/admin` | Administrateur, DG | Enregistrement systématique | Registre d'Audit | **EXISTANT ET FONCTIONNEL** | P1 | Consultation des logs d'audit avec filtres d'action. |
| **TRV-05** | Gestion des 5 Domaines d'Activité SILEX | Présentation institutionnelle et rattachement des projets aux 5 métiers officiels de SILEX SERVICES. | `/dashboard`, Sidebar | Tous utilisateurs | Consultation | Charte Métier | **EXISTANT ET FONCTIONNEL** | P2 | Modal officiel des 5 domaines accessible depuis la sidebar. |
| **TRV-06** | Bibliothèque Documentaire Imprimable A4 | Modèles standards d'édition avec en-tête d'entreprise, pagination et signature légale. | `/reports` | Tous utilisateurs | Impression / PDF | Éditions A4 | **À DÉVELOPPER** | **P1** | Composant universel de génération de documents imprimables. |
| **TRV-07** | Mode Démonstration Fluide & Étanche | Bascule rapide entre profils pour la présentation client sans déconnexion et sans altérer les sécurités serveur. | Header, `/login` | Tous testeurs | Switch instantané | - | **EXISTANT ET FONCTIONNEL** | P1 | Sélecteur démo opérationnel dans le Header et l'écran de Login. |

---
*Fin du document — Matrice de Traçabilité SILEX ERP.*
