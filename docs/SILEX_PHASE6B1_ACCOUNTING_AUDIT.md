# AUDIT DE COHÉRENCE COMPTABLE & 3-WAY MATCHING — PHASE 6B.1
## Reconstitution du Cycle Achats, Stocks, Dettes & Trésorerie

> **Statut de l'Audit :** CONTRADICTOIRE & EN LECTURE SEULE  
> **Date de réalisation :** 13 Novembre 2026  
> **Commit audité :** `cb4d02b`

---

### 1. Reconstitution du Cycle Financier et Contrôle Anti-Double-Compte

La chaîne des événements financiers a été auditée étape par étape dans `apps/web/src/lib/server-store.ts` et validée dans le test E2E :

```
[1. Bon de Commande (BC)] ─────────> Engagement prévisionnel (committedBudget)
             │
             ▼
[2. Réception Magasin (BR)] ───────> Mouvement stock physique (StockMovement)
             │
             ▼
[3. Consommation Chantier] ────────> Sortie magasin -> Imputation Coût Réel Projet (MATIERE_STOCK)
             │
             ▼
[4. Facture Fournisseur] ──────────> Constatation Dette Fournisseur (Passif) + 3-Way Match
             │
             ▼
[5. Règlement Financier] ──────────> Décaissement Trésorerie (Banque/Caisse) -> Solde Dette Fournisseur
                                     (AUCUNE imputation sur le projet — ZÉRO DOUBLE COMPTAGE)
```

#### Constats d'audit sur l'anti-double-compte :
- **VERIFIED (Lignes 4650-4665 de `server-store.ts`) :** La méthode `recordSupplierPayment()` débite le compte bancaire et réduit `invoice.remainingAmount`. Elle n'appelle **en aucun cas** `addCostEntry()` ni n'incrémente `project.spentBudget`.
- **VERIFIED (Lignes 4700-4740 de `server-store.ts`) :** La méthode `getProjectProfitability()` reconstitue les coûts réels à partir :
  1. Des fournitures physiques reçues et validées (`goodsReceipts`).
  2. Des heures de pointage réelles multipliées par le taux horaire déboursé (`attendances`).
  3. Des charges directes autres que `MATIERE_STOCK` (`proj.costEntries.filter(c => c.category !== 'MATIERE_STOCK')`), éliminant tout doublon avec les consommations de stock.

---

### 2. Audit Contradictoire de l'Algorithme de 3-Way Matching

Inspection des lignes 4510 à 4545 de `apps/web/src/lib/server-store.ts` :

#### A. Scénarios Testés et Couverture

| Scénario | Comportement Réel du Code | Statut d'Audit |
| :--- | :--- | :---: |
| **BC complet + BR complet + Facture identique** | `matchingStatus = 'CONFORME_3_WAY'`, statut auto-approuvé si < 500k DA | **VERIFIED** |
| **Facture sans Bon de Réception (BR)** | Détecte l'absence de `goodsReceiptId` -> `matchingStatus = 'SANS_RECEPTION'`, statut `A_APPROUVER` | **VERIFIED** |
| **Écart de Prix constaté** | `Math.abs(amountHT - poAmountHT) > 100` -> `matchingStatus = 'ECART_PRIX'`, statut `A_APPROUVER` | **VERIFIED** |
| **Réception Partielle (BR partiel)** | Réceptionne les lignes avec `acceptedQuantity < orderedQuantity`. Mais le calcul compare `amountHT` facture au `poAmountHT` global du BC. | **PARTIALLY VERIFIED** |
| **Plusieurs réceptions pour un même BC** | Le modèle `StoredSupplierInvoice` n'admet qu'un seul `goodsReceiptId` scalaire (`string`), empêchant de rattacher plusieurs BR à une seule facture sans développement complémentaire. | **FAILED** |
| **Plusieurs factures pour un même BC** | Le BC n'a pas de compteur cumulatif `invoicedAmountHT`. Deux factures partielles sur un même BC ne tracent pas le solde restant à facturer sur la commande. | **FAILED** |
| **Tolérance de 100 DA codée en dur** | Ligne 4522 : `if (Math.abs(priceVarianceDA) > 100)` est **codé en dur** dans le code source au lieu de provenir de `financialConfig`. | **FAILED** |
| **Distinction Écart Prix vs Écart Quantité** | La variable `qtyVariancePct` est déclarée mais n'est pas alimentée par une comparaison ligne à ligne (quantité facturée vs quantité acceptée au BR). Tout écart global est classé en `ECART_PRIX`. | **FAILED** |

---

### 3. Facturation Client & Retenue de Garantie (PVRD)

- **Calcul de la Retenue (Lignes 4488-4497) :**
  - Retenue calculée sur le montant HT : `retentionAmount = Math.round((amountHT * retentionRate) / 100)`.
  - TVA calculée sur le montant HT : `vatAmount = Math.round((amountHT * vatRate) / 100)`.
  - Net exigible immédiat : `netReceivableAmount = (amountHT - retentionAmount) + vatAmount`.
  - **VERIFIED :** Conforme aux pratiques contractuelles des marchés publics et industriels algériens.
- **Libération de la Retenue (Lignes 4535-4560) :**
  - La méthode `releaseWarrantyRetention()` vérifie la disponibilité (`warrantyHeldAmount - warrantyReleasedAmount >= amount`) et crédite le compte bancaire avec la référence du PVRD.
  - **VERIFIED :** Validé dans l'étape 5 du test E2E.

---

### 4. Classification des Constats Comptables

- `ACCOUNTING-01` : **VERIFIED** — Absence totale de double comptage entre achats, stocks, dettes et coûts de projet.
- `ACCOUNTING-02` : **VERIFIED** — Mécanique de calcul de la retenue de garantie et de la TVA conforme aux règles contractuelles.
- `ACCOUNTING-03` : **FAILED** — Tolérance de 100 DA codée en dur dans `createSupplierInvoice()`.
- `ACCOUNTING-04` : **FAILED** — Impossibilité de multi-rapprochement (plusieurs BR pour une facture, ou facturation partielle d'un BC avec suivi du reste à facturer).
- `ACCOUNTING-05` : **FAILED** — Absence de contrôle d'écart ligne par ligne (quantité vs prix unitaire).
