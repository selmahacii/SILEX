# REVUE DE SÉCURITÉ & SÉPARATION DES FONCTIONS (SoD) — PHASE 6B
## Contrôles Internes, Anti-Fraude & Protection des Données Financières

### 1. Séparation des Fonctions (Separation of Duties - SoD)
- **Engagement vs Ordonnancement vs Décaissement :**
  - Le Chef de Projet (`RESPONSABLE_PROJET`) ou l'Acheteur (`RESPONSABLE_ACHATS`) initie le besoin ou la commande.
  - Le Magasinier (`RESPONSABLE_MAGASIN`) atteste de la réception physique des fournitures (`GoodsReceipt`).
  - Le Responsable Financier (`RESPONSABLE_FINANCIER`) contrôle le 3-way matching et prépare le paiement.
  - La Direction Générale (`DIRECTEUR_GENERAL`) valide tout montant excédant le seuil configurable `dgApprovalThresholdDA` (2,000,000 DA).
  - Un paiement ne peut en aucun cas être ordonnancé sur une facture fournisseur présentant un écart de prix ou non validée par la hiérarchie compétente.

### 2. Protection Anti-Double-Compte & Intégrité Analytique
- L'émission d'un Bon de Commande (`PurchaseOrder`) engage un coût prévisionnel (`committedBudget`).
- La Réception Physique (`GoodsReceipt`) ou la sortie matière enregistre la consommation réelle de stock.
- La Réception de la Facture Fournisseur (`SupplierInvoice`) constate la dette financière au passif.
- Le Décaissement Bancaire (`CashTransaction` de type `DECAISSEMENT_FOURNISSEUR`) compense la dette fournisseur : il ne réimpute pas de charge sur le projet afin de ne pas altérer artificiellement la rentabilité du chantier.

### 3. Isolation Absolue des Données de Démonstration (DEMO)
- Les comptes bancaires de démonstration portent les identifiants `DEMO-CPT-*` avec un drapeau explicite `isDemoAccount: true`.
- Aucune transaction de test ne peut s'exécuter sur un compte réel.
- La base Neon PostgreSQL existante est protégée contre tout effacement, écriture sauvage ou migration destructive.

### 4. Idempotence & Résilience Réseau
- Tout appel de transaction monétaire supporte un en-tête / champ `idempotencyKey`.
- En cas de déconnexion réseau ou de double soumission par l'utilisateur, le serveur détecte la clé existante et retourne l'enregistrement initial sans réitérer le débit bancaire.
