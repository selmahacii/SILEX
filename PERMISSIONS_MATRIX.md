# MATRICE DES PERMISSIONS & CONTRÔLE D'ACCÈS — SILEX INDUSTRIAL ERP

> **Modèle d'autorisation** : RBAC (Role-Based Access Control) + ABAC (Projet & Département)  
> **Principe** : Moindre privilège appliqué et validé au niveau des Guards d'API NestJS

---

## 1. Rôles Définis

| Code Rôle | Intitulé | Département d'attache | Périmètre d'action |
|---|---|---|---|
| `DIRECTEUR_GENERAL` | Directeur Général | Direction Générale | Accès universel, arbitrage stratégique et approbations |
| `RESPONSABLE_PROJET` | Chef de Projets Industriels | Opérations & Projets | Chantiers assignés, demandes d'achat, ODS, situations |
| `RESPONSABLE_ACHATS` | Resp. Achats & Logistique | Achats & Approvisionnements | Consultations fournisseurs, offres, bons de commande |
| `RESPONSABLE_MAGASIN`| Resp. Magasin & Stocks | Magasins & Stocks | Réceptions marchandises, sorties chantier, transferts |
| `RESPONSABLE_RH` | Resp. Ressources Humaines | Ressources Humaines | Effectifs, habilitations soudage, présences, démo paie |
| `RESPONSABLE_FINANCIER`| Directeur Financier | Finance & Comptabilité | Suivi budgétaire, créances, factures, rentabilité |
| `RESPONSABLE_MAINTENANCE`| Resp. Parc & Matériel | Parc & Maintenance | Disponibilité du matériel, maintenance, carburant |
| `RESPONSABLE_QUALITE` | Resp. QHSE & Qualité | QHSE | Documents qualité, non-conformités, audits ISO |
| `ADMINISTRATEUR` | Administrateur Système | Informatique | Rôles, sécurité, journal d'audit, réinitialisation |

---

## 2. Matrice d'Habilitations par Domaine

*Légende* :  
- **C** : Créer (Create) | **R** : Lire (Read) | **U** : Modifier (Update) | **D** : Supprimer (Delete)  
- **V** : Valider / Approuver (Validate / Approve) | **E** : Exporter (Export)  
- **[A]** : Uniquement pour les projets/ressources expressément assignés

| Domaine / Module | DG | Resp. Projet | Resp. Achats | Magasinier | Resp. RH | Resp. Fin. | Resp. Maint. | Resp. Qualité | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Exécutif** | R, E | R [A] | R | R | R | R, E | R | R | R |
| **Gestion Projets** | R, V, E | C, R [A], U [A] | R | R | R | R, U (Budgets) | R | R | R, U |
| **Ordres de Service (ODS)** | R, V | C, R [A], U [A] | R | - | - | R | - | R | R |
| **Situations de Travaux** | R, V | C, R [A], U [A] | - | - | - | R, V, E | - | R | R |
| **Demandes d'Achat (DA)** | R, V, E | C, R [A], U [A] | R, U, V | R | - | R | C, R, U | - | R |
| **Offres Fournisseurs** | R, V | R [A] | C, R, U, E | - | - | R | - | - | R |
| **Bons de Commande (BC)** | R, V, E | R [A] | C, R, U, E | R | - | R, E | - | - | R |
| **Réception Magasin** | R | R [A] | R | C, R, U | - | R | - | R (Contrôle) | R |
| **Sortie Chantier** | R | R [A] (Demande)| - | C, R, U | - | R | - | - | R |
| **Personnel & Habilitations**| R | R [A] | - | - | C, R, U, E | R | R | R (Certif) | R, U |
| **Engagements & Coûts** | R, E | R [A] | R | - | - | C, R, U, E | R | - | R |
| **Parc Matériel & Engins** | R | R [A] | R | - | - | R | C, R, U, E | - | R |
| **Ordres de Maintenance** | R | R [A] | - | - | - | - | C, R, U | - | R |
| **GED & Documents Qualité**| R, E | C, R, U [A] | R | R | R | R | R | C, R, U, V, E| R, U |
| **Non-Conformités QHSE** | R | C, R [A] | R | R | - | - | R | C, R, U, V | R |
| **Journal d'Audit** | R, E | - | - | - | - | - | - | R | R, E |
| **Administration Système**| - | - | - | - | - | - | - | - | C, R, U, D |

---

## 3. Règles d'Isolation Côté Serveur (Guards NestJS)

1. **Vérification d'assignation projet** :
   - Un utilisateur avec le rôle `RESPONSABLE_PROJET` tentant un appel `GET /api/projects/:id` ou `POST /api/purchase-requests` sur un projet qui ne figure pas dans sa table `UserProjectAssignment` reçoit systématiquement un `403 Forbidden`.
2. **Auto-validation interdite** :
   - Le middleware de validation compare l'identifiant du demandeur `createdById` avec celui du validateur `currentUserId`. S'ils sont identiques, la requête d'approbation est rejetée avec le message : *"Le demandeur ne peut pas approuver sa propre demande d'achat"*.
