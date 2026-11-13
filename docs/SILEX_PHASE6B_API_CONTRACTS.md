# CONTRATS D'API & ENDPOINTS — PHASE 6B FINANCE
## Monorepo SILEX — Spécification des Routes Next.js / API Gateway

### 1. Configuration Financière
- `GET /api/finance/config` : Récupère les paramètres financiers en vigueur (taux TVA, retenues, seuils SoD).
- `PATCH /api/finance/config` : Met à jour les seuils et paramètres (Réservé DG & Administrateur).

### 2. Comptes Bancaires & Trésorerie
- `GET /api/finance/accounts` : Liste les comptes bancaires et caisses avec solde courant et statut Démo.
- `POST /api/finance/accounts` : Crée un compte bancaire ou une caisse de chantier.
- `GET /api/finance/transactions` : Liste l'historique chronologique des flux de trésorerie (avec filtres).
- `POST /api/finance/transactions` : Enregistre un flux de trésorerie unitaire (avec contrôle de solvabilité et clé d'idempotence).
- `POST /api/finance/transactions/transfer` : Exécute un virement de compte à compte atomique en partie double.

### 3. Facturation Client & Encaissements
- `GET /api/finance/customer-invoices` : Liste les factures clients (filtrable par projet/statut).
- `POST /api/finance/customer-invoices` : Émet une nouvelle facture client à partir d'une situation contractuelle ou d'un devis.
- `POST /api/finance/customer-invoices/:id/pay` : Enregistre un encaissement client partiel ou total et crédite le compte bancaire.
- `POST /api/finance/customer-invoices/:id/release-warranty` : Débloque la retenue de garantie séquestrée suite au procès-verbal de réception définitive (PVRD).

### 4. Facturation Fournisseur & 3-Way Matching
- `GET /api/finance/supplier-invoices` : Liste les factures fournisseurs avec leur statut de matching et d'approbation.
- `POST /api/finance/supplier-invoices` : Enregistre une facture fournisseur et exécute automatiquement l'algorithme de 3-way matching (BC vs BR vs Facture).
- `POST /api/finance/supplier-invoices/:id/pay` : Décaisse le règlement fournisseur sur un compte bancaire (interdit si facture non approuvée).

### 5. Pilotage, Balance Âgée & Rentabilité Projet
- `GET /api/finance/overview` : Synthèse globale du CA contracté, facturé, encaissé, trésorerie et ventilation analytique.
- `GET /api/finance/aged-trial-balance` : Échéancier et balance âgée clients et fournisseurs (0-30j, 31-60j, >60j) et BFR.
- `GET /api/finance/project-profitability?projectId=:id` : Rentabilité industrielle détaillée par projet (CA facturé vs Matières + MO + Frais, sans double comptage).
