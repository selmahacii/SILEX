# RÈGLES MÉTIER & WORKFLOWS OPÉRATIONNELS — SILEX INDUSTRIAL ERP

> **Société** : SILEX SERVICES (Prestations industrielles, Tuyauterie, HVAC, Maintenance)  
> **Document de Référence** : Spécification des règles d'intégrité et de gestion

---

## 1. Règles du Cycle des Achats & Approvisionnements

### 1.1 Machine à états de la Demande d'Achat (DA)
Le cycle de vie d'une demande d'achat respecte scrupuleusement la séquence ordonnée :
```
[DRAFT] (Brouillon créé par le Responsable Projet)
   ↓ (Action: Soumettre)
[SUBMITTED] (Soumis au service Achats)
   ↓ (Action: Prise en charge achats)
[PROCUREMENT_REVIEW] (Vérification spécifications techniques & budget)
   ↓ (Action: Lancer consultation)
[QUOTATION_IN_PROGRESS] (Saisie des devis / offres fournisseurs comparatives)
   ↓ (Action: Soumettre à approbation DG avec offre recommandée)
[PENDING_APPROVAL] (En attente de décision de la Direction Générale)
   ↓ (Action: Approuver par DG)
[APPROVED] (Approuvé avec motif et seuil validé)
   ↓ (Action: Générer Bon de Commande)
[PURCHASE_ORDER] (Bon de commande émis et transmis au fournisseur)
   ↓ (Action: Réception partielle)
[PARTIALLY_RECEIVED]
   ↓ (Action: Réception totale)
[RECEIVED] (100% des articles réceptionnés au magasin)
   ↓ (Action: Contrôle facture fournisseur)
[INVOICE_REVIEW]
   ↓ (Action: Clôturer)
[CLOSED]
```
*États alternatifs terminaux* :
- `REJECTED` : Rejeté par la Direction ou les Achats avec justification obligatoire.
- `CANCELLED` : Annulé avant émission du bon de commande.

### 1.2 Règles de validation & Seuils indicatifs de démonstration
*Note de transparence* : Ces seuils sont paramétrés pour le prototype de démonstration et sont configurables selon la charte d'engagement définitive de SILEX :
- **Demande ≤ 500 000 DA** : Approbation déléguée possible par le Responsable Achats ou Chef de Projet.
- **Demande > 500 000 DA** : Approbation obligatoire par le Directeur Général (`DIRECTEUR_GENERAL`).
- **Règle de séparation des tâches (SoD)** : Le créateur de la demande ne peut pas l'approuver lui-même. Une tentative d'auto-approbation est rejetée au niveau du contrôleur API.

### 1.3 Évaluation des offres et Comparateur fournisseurs
Le choix de l'offre recommandée ne repose pas sur le prix brut seul. Les 5 critères obligatoires sont :
1. Prix total HT en Dinars Algériens (DA).
2. Délai de livraison contractuel (en jours ou date ferme).
3. Disponibilité immédiate en stock.
4. Conformité technique stricte aux spécifications (ex: normes tuyauterie ASME / API / EN).
5. Conditions de paiement et durée de garantie.

---

## 2. Règles de Gestion des Stocks & Magasins

### 2.1 Immuabilité et Principe du Double Enregistrement (Ledger)
- **Aucune modification directe de la quantité en stock** : La colonne `currentStock` d'un article en magasin est le résultat cumulé des transactions du ledger `StockMovement`.
- **Types de mouvements autorisés** :
  - `PURCHASE_RECEIPT` : Augmentation du stock à la réception d'un Bon de Commande.
  - `PROJECT_ISSUE` : Diminution du stock par sortie vers un chantier/projet.
  - `WAREHOUSE_TRANSFER` : Transfert physique entre deux magasins autorisés.
  - `RETURN` : Réintégration en stock d'un surplus non consommé sur chantier.
  - `INVENTORY_ADJUSTMENT` : Mouvement d'écart d'inventaire tracé avec motif explicite.
- **Interdiction du stock négatif** : Toute tentative de sortie (`PROJECT_ISSUE`) dont la quantité demandée dépasse le stock physique disponible entraîne une erreur bloquante `400 Bad Request` dans la transaction PostgreSQL.

---

## 3. Règles de Pilotage Financier & Projets

### 3.1 Découplage strict des indicateurs d'avancement
1. **Avancement physique (%)** : Pourcentage mesuré sur le terrain (mètres linéaires de tuyauterie soudée, tonnes montées, équipements révisés) validé par les fiches d'attachement.
2. **Avancement financier / Dépenses (%)** : Ratio `(Coûts réels consommés / Budget prévisionnel) * 100`.
3. **Avancement facturation (%)** : Ratio `(Montant total des situations validées / Montant contractuel global) * 100`.
4. **Avancement encaissement (%)** : Ratio `(Règlements clients encaissés / Montant total facturé) * 100`.

### 3.2 Imputation des coûts matières
Dès qu'un mouvement de sortie de stock (`PROJECT_ISSUE`) est validé pour un projet donné :
1. La quantité sortie est comptabilisée comme consommation matérielle du projet.
2. Le coût unitaire pondéré ou coût d'achat est imputé à la ligne budgétaire "Fournitures & Matières" du projet.
3. Les graphiques du Dashboard DG reflètent immédiatement cette augmentation de coût réel.

---

## 4. Règles de Gestion des Ordres de Service (ODS) & Situations de Travaux

### 4.1 Ordres de Service (ODS)
- Tout chantier démarre impérativement par un **ODS de Démarrage**.
- Un arrêt de chantier (intempéries, attente plan client, arrêt technique décalé) donne lieu à un **ODS d'Arrêt** suspendant le calcul des pénalités de retard.
- La reprise donne lieu à un **ODS de Reprise**.
- Toute prestation hors marché initial doit faire l'objet d'un **ODS de Modification de Périmètre** précisant l'impact financier et le délai additionnel.

### 4.2 Situations de Travaux périodiques
- Les situations mensuelles sont élaborées à partir des métrés et attachements validés contradictoirement avec le représentant du client industriel.
- Une situation ne peut passer à l'état `INVOICED` qu'après validation formelle de la direction de projet et du responsable financier.
