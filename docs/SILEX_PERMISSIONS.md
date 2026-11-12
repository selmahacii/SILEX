# MATRICE DES HABILITATIONS & PERMISSIONS (RBAC / ABAC)
## ERP SARL SILEX SERVICES

---

## 1. RÔLES SYSTÈME DÉFINIS

| Identifiant Rôle | Rôle Opérationnel | Profil Utilisateur |
| :--- | :--- | :--- |
| `DIRECTEUR_GENERAL` / `ADMINISTRATEUR` | Direction Générale & Associés | Vision globale, arbitrages financiers, désignation chefs de projet, visas finaux |
| `RESPONSABLE_PROJET` | Conducteur de Travaux / Chef de Chantier | Pilotage opérationnel, saisie des RJC, affectation des tâches, déclaration contraintes, émission DA |
| `RESPONSABLE_COMMERCIAL` | Ingénieur d'Affaires / Commercial | Prospection, réponses aux appels d'offres, fiches de coûts, émission devis clients |
| `RESPONSABLE_ACHATS` | Responsable Approvisionnements | Négociation fournisseurs, validation des DA, émission des bons de commande (BC), suivi livraisons |
| `MAGASINIER` | Gestionnaire de Stocks & Magasins | Réceptions physiques, contrôles quantitatifs/qualitatifs, sorties chantier, inventaires |
| `RESPONSABLE_RH` | Gestionnaire RH & Paie | Mobilisation des équipes, pointages chantiers, habilitations, transmission vers PC Paie |
| `RESPONSABLE_FINANCIER` | Directeur Financier / Comptable | Situations de travaux, facturation clients, suivi des encaissements, transmission PC Compta |
| `RESPONSABLE_QUALITE` | Ingénieur Qualité & Superviseur HSE | Contrôles CND (radio/ressuage), fiches de non-conformité (FNC), audits sécurité chantier |

---

## 2. MATRICE D'HABILITATION PAR PROCESSUS & ENTITÉ

### Légende :
- **C** : Créer
- **R** : Consulter (Lecture)
- **U** : Modifier
- **V** : Viser / Arbitrer / Valider
- **D** : Supprimer
- **—** : Aucun accès

| Entité / Opération | DG / Admin | Resp. Projet | Resp. Commercial | Resp. Achats | Magasinier | Resp. RH | Resp. Finance | Resp. Qualité/HSE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Opportunités Commerciales** | C-R-U-V-D | R | C-R-U | R | — | — | R | R |
| **Fiches de Coût Collaboratives** | R-V (Arbitrage) | U (Contrib.) | C-R-U | U (Contrib.) | — | U (Contrib.) | U (Contrib.) | — |
| **Devis Clients Officiels** | C-R-U-V-D | R | C-R-U | — | — | — | R | — |
| **Conversion en Projet Chantier** | C-R-V | R | C-R | — | — | — | R | — |
| **Nomination Responsable Chantier** | C-U-V | R | — | — | — | — | R | — |
| **Modification Calendrier Contractuel**| C-U-V | R | — | — | — | — | R | — |
| **Lots Contractuels & Métrés** | C-R-U-V | C-R-U | R | — | — | — | R | R |
| **Tâches Opérationnelles & Délais** | C-R-U-V-D | C-R-U-D | R | R | — | R | R | R |
| **Rapports Journaliers (RJC)** | R-V | C-R-U | — | — | — | R (Heures) | R | R (HSE) |
| **Rapports de Situation Périodiques** | R-V | C-R-U | R | R | — | R | R | R |
| **Registre des Contraintes & Arrêts** | C-R-U-V | C-R-U | R | R | — | R | R | C-R-U |
| **Événements HSE & Contrôles CND** | R-V | C-R-U | — | — | — | R | — | C-R-U-V |
| **Demandes d'Achat Chantier (DA)** | R-V | C-R-U | — | C-R-U-V | — | — | R | — |
| **Sorties Réelles de Stock Chantier** | R | C-R (Demande)| — | R | C-R-U (Sortie)| — | R | — |
| **Demandes de Renfort RH** | R-V | C-R | — | — | — | C-R-U-V | R | — |
| **Ordres de Service (ODS)** | C-R-U-V | C-R-U | R | — | — | — | R | — |
| **Situations de Travaux & Factures** | R-V | C-R-U | R | — | — | — | C-R-U-V | — |
| **Journal d'Audit & Traçabilité** | C-R (Total) | R (Projet) | R (Affaire) | R (Achats) | R (Stock) | R (RH) | R (Finance) | R (Qualité) |

---

## 3. RÈGLES DE CONTRÔLE D'ACCÈS SPÉCIFIQUES (ABAC)

1. **Isolation par Chantier (Attribute-Based Access Control)** :
   - Un conducteur de travaux a les droits de modification complète uniquement sur les chantiers dont il est désigné responsable (`project.managerId === user.id`) ou membre assigné (`project.members`).
   - La Direction Générale et l'Administrateur ont une vue transversale non filtrée sur tous les chantiers.
2. **Inviolabilité des Visas DG** :
   - Une fois qu'un rapport journalier, une fiche de coût, un devis ou une situation de travaux est visé par la Direction Générale (`status === 'VALIDE'`), ses données financières et métrés deviennent **strictement non modifiables**.
   - Toute modification requiert l'émission d'une nouvelle version ou d'un avenant d'ajustement tracé dans le journal d'audit.
