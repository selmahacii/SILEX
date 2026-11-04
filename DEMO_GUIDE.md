# GUIDE DE DÉMONSTRATION COMMERCIALE — SILEX INDUSTRIAL ERP

> **Auditoire visé** : Direction Générale et Responsables Opérationnels de SILEX SERVICES  
> **Objectif** : Présenter la valeur ajoutée d'une plateforme ERP moderne, intégrée, réactive et sécurisée pour les chantiers industriels (Oil & Gas, Sidérurgie, Cimenterie).

---

## 1. Comptes de Démonstration Disponibles

En haut à droite de l'application (lorsque `DEMO_MODE=true`), un sélecteur de profil permet de commuter instantanément entre les rôles métier avec authentification serveur sécurisée :

| Profil | Nom | Rôle | Email | Périmètre de démonstration |
|---|---|---|---|---|
| **Directeur Général** | Karim Mansouri | `DIRECTEUR_GENERAL` | `k.mansouri@silex-services.dz` | Vue 360°, arbitrages, approbations finales, rentabilité |
| **Chef de Projet** | Sofiane Belkacem | `RESPONSABLE_PROJET` | `s.belkacem@silex-services.dz` | Chantiers Tuyauterie & Maintenance, DA, ODS |
| **Resp. Achats** | Amina Benali | `RESPONSABLE_ACHATS` | `a.benali@silex-services.dz` | Consultation fournisseurs, comparateur, bons de commande |
| **Resp. Magasin** | Tarek Meziani | `RESPONSABLE_MAGASIN` | `t.meziani@silex-services.dz` | Réception marchandises, sorties chantiers, stocks |
| **Resp. RH** | Samira Haddad | `RESPONSABLE_RH` | `s.haddad@silex-services.dz` | Effectifs, habilitations soudage, présences |
| **Directeur Financier**| Rachid Bouzid | `RESPONSABLE_FINANCIER` | `r.bouzid@silex-services.dz` | Trésorerie, engagements, budgets projets, facturation |
| **Resp. Matériel** | Yacine Khelifi | `RESPONSABLE_MAINTENANCE` | `y.khelifi@silex-services.dz` | Disponibilité parc, engins de levage, maintenance |
| **Resp. QHSE** | Nadia Chaib | `RESPONSABLE_QUALITE` | `n.chaib@silex-services.dz` | Non-conformités ISO, audits, GED |
| **Administrateur** | Lyes Hamidi | `ADMINISTRATEUR` | `admin@silex-services.dz` | Administration système, audit trail, reset démo |

*Mot de passe générique démo pour tous les comptes* : `SilexDemo2026!`

---

## 2. Déroulement du Scénario Phare de Démonstration (Le Cycle Complet Projet → Achats → Stock → Coûts)

Durée estimée : **12 à 15 minutes** en réunion commerciale.

### Étape 1 — Responsable de Projet (Sofiane Belkacem)
1. Sélectionner le profil **Sofiane Belkacem (Chef de Projet)** via le sélecteur en haut à droite.
2. Naviguer vers **Gestion des Projets** et ouvrir le projet `PRJ-2026-001` (*Maintenance Arrêt Unité de Production*).
3. Parcourir les onglets : Planning des jalons, Budget, et Matériel.
4. Constater un besoin urgent de vannes industrielles pour la ligne de tuyauterie haute pression.
5. Cliquer sur **Nouvelle Demande d'Achat** :
   - Article : `Vanne à opercule acier forgé DN100 PN40`
   - Quantité : `100 unités`
   - Justification : `Remplacement préventif vannes défectueuses ligne HP bloc 4`
   - Budget estimé : `1 450 000 DA`
6. Cliquer sur **Soumettre la demande**.
7. *Point clé à souligner à la direction* : La demande passe en base de données à l'état `SUBMITTED`, tracée dans l'audit log avec l'auteur et la date.

### Étape 2 — Responsable Achats (Amina Benali)
1. Commuter sur le profil **Amina Benali (Resp. Achats)**.
2. Aller dans **Achats & Approvisionnements > Demandes d'Achat**.
3. Ouvrir la demande créée à l'étape 1.
4. Consulter les 3 offres fournisseurs enregistrées pour cette consultation :
   - *Fournisseur A (Sarl Algérie Vannes)* : `14 200 DA / u` | Délai 7j | Conforme norme ISO/API | Recommandé.
   - *Fournisseur B (Eurl Robinetterie Industrielle)* : `13 800 DA / u` | Délai 25j | Stock partiel (Délai critique incompatible).
   - *Fournisseur C (Comptoir Sidérurgique de l'Est)* : `15 000 DA / u` | Délai 5j | Hors enveloppe budgétaire.
5. Ouvrir le **Comparateur multi-critères** : mettre en évidence que l'outil ne privilégie pas aveuglément le prix le plus bas, mais pondère le délai de chantier et la conformité technique.
6. Cliquer sur **Transmettre à la Direction Générale avec recommandation de l'offre A**.
7. Statut mis à jour : `PENDING_APPROVAL`.

### Étape 3 — Directeur Général (Karim Mansouri)
1. Commuter sur le profil **Karim Mansouri (Directeur Général)**.
2. Aller sur **Workflows & Validations** (la bulle de notification indique 1 approbation en attente).
3. Ouvrir la demande : la fiche comparative synthétise l'impact budgétaire sur le projet et la justification opérationnelle.
4. Renseigner le commentaire d'arbitrage : *"Offre A validée, impératif de livraison sous 7 jours pour l'arrêt d'unité."*
5. Cliquer sur **Approuver**.
6. *Point clé à souligner* : La validation est irréversible, horodatée, et le bouton d'approbation est verrouillé (protection anti-double validation).

### Étape 4 — Génération Automatique du Bon de Commande
1. La demande passe automatiquement à l'état `PURCHASE_ORDER`.
2. Le système génère le Bon de Commande officiel numéro `BC-2026-0042` avec le fournisseur Sarl Algérie Vannes, les montants en DA et les mentions légales.
3. Afficher l'aperçu prêt à l'impression / export PDF.

### Étape 5 — Responsable Magasin (Tarek Meziani) : Réception
1. Commuter sur le profil **Tarek Meziani (Resp. Magasin)**.
2. Aller dans **Stocks & Magasins > Réceptions Marchandises**.
3. Sélectionner le Bon de Commande `BC-2026-0042`.
4. Procéder à la réception physique de `100 unités` au Magasin Central Hassi Messaoud.
5. Valider la réception :
   - Le stock disponible de la référence passe immédiatement de 25 à 125 unités.
   - Un mouvement immuable `PURCHASE_RECEIPT` est généré dans le ledger.
   - Le bon de commande passe au statut `RECEIVED`.

### Étape 6 — Sortie vers le Chantier
1. Toujours avec le profil magasinier, aller dans **Stocks > Sortie Chantier**.
2. Sélectionner le projet `PRJ-2026-001` et l'article.
3. Tenter une sortie de 150 unités : le système affiche une alerte bloquante d'insuffisance de stock.
4. Enregistrer la sortie réelle requise par le chef de chantier : `40 unités`.
5. Valider la sortie :
   - Stock magasin mis à jour (85 unités restantes).
   - Mouvement `PROJECT_ISSUE` enregistré avec affectation au chantier `PRJ-2026-001`.
   - Coût matière imputé directement au projet (`40 x 14 200 DA = 568 000 DA`).

### Étape 7 — Synthèse sur le Dashboard Direction Générale
1. Revenir sur le profil **Directeur Général**.
2. Ouvrir le **Tableau de Bord Exécutif**.
3. Montrer en direct aux décideurs de SILEX :
   - L'augmentation des coûts réels engagés sur le projet `PRJ-2026-001`.
   - La mise à jour des jauges de stock dans les alertes d'approvisionnement.
   - L'historique complet dans le journal d'audit démontrant la conformité ISO et la traçabilité intégrale.

---

## 3. Bouton de Réinitialisation des Données de Démonstration

À la fin de la séance de démonstration, l'administrateur peut réinitialiser l'ensemble de la base à l'état d'origine en un clic :
- Connecté en tant qu'`ADMINISTRATEUR`, aller sur **Administration > Maintenance Démo**.
- Cliquer sur **Réinitialiser les données de démonstration** et confirmer dans la modale de sécurité.
