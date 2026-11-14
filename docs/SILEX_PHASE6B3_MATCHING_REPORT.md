# RAPPORT TECHNIQUE DU MOTEUR 3-WAY MATCHING — PHASE 6B.3
## SILEX SERVICES ERP — Module 06 : Rapprochement Facture Fournisseur / Réception / Commande

> **Statut :** VALIDÉ & CONFORME AU CAHIER DES CHARGES  
> **Date :** 14 Novembre 2026  
> **Composants :** `apps/web/src/lib/server-store.ts`, `apps/web/src/lib/db-bridge.ts`, `scripts/test-phase6b3-validation.js`  

---

### 1. Contexte & Problématique Résolue

L'audit contradictoire Phase 6B.2 (`SILEX_PHASE6B2_FINAL_ACCEPTANCE_AUDIT.md`) avait mis en évidence une limitation majeure du moteur de rapprochement :
- La comparaison s'effectuait au niveau global (`amountHT` facture vs `totalHT` commande) au lieu de s'opérer ligne à ligne.
- Une facture partielle (ex: 25 unités facturées sur une commande de 100 unités) générait une fausse alerte `ECART_PRIX` avec un écart négatif de 3 750 000 DA.
- Les Bons de Réception (BR) étaient verrouillés de manière binaire (un BR utilisé était totalement bloqué, empêchant la facturation multi-factures ou multi-BR).

La Phase 6B.3 a entièrement refactorisé le moteur de 3-way matching avec allocation quantitative dynamique FIFO par ligne, suivi des reliquats et gestion granulaire des écarts.

---

### 2. Architecture du Rapprochement par Ligne

#### 2.1 Modèle de Données `InvoiceLineMatching`
Chaque ligne de rapprochement relie physiquement :
- La facture fournisseur (`SupplierInvoice`)
- La ligne de facture (`SupplierInvoiceLine`)
- La ligne de commande (`PurchaseOrderLine`)
- La ligne de bon de réception (`GoodsReceiptLine`)
- `matchedQuantity` : quantité allouée
- `invoicedUnitPrice` vs `orderedUnitPrice`
- `varianceAmount` : écart de prix constaté
- `status` : statut de la ligne (`CONFORME`, `ECART_PRIX`, `ECART_QUANTITE`, `DEROGATION`, `ANNULE`)

#### 2.2 Algorithme d'Allocation FIFO Multi-BR
1. **Identification des réceptions éligibles (`candidateGrs`) :**
   - Si un `goodsReceiptId` spécifique est spécifié, l'allocation est restreinte à ce BR (permettant la détection immédiate de réceptions épuisées).
   - Sinon, toutes les réceptions validées (`RECEIVED`) rattachées à la commande sont sélectionnées par ordre chronologique (FIFO).
2. **Calcul des quantités déjà consommées (`alreadyMatched`) :**
   - Le moteur agrège les quantités déjà rapprochées sur chaque ligne de BR pour toutes les factures non annulées ou rejetées.
   - `availableQty = grLine.quantity - alreadyMatched`.
3. **Imputation progressive de la quantité facturée :**
   - Pour chaque BR disponible, le moteur impute `toMatch = Math.min(remainingToAllocate, availableQty)`.
   - Création d'un enregistrement `InvoiceLineMatching` pour chaque fraction imputée.
4. **Calcul du reliquat de réception (`remainingQuantityToInvoice`) :**
   - `totalAvailableOnGrs` = somme des quantités réceptionnées non encore facturées.
   - `invoicedQuantityTotal` = cumul des quantités facturées à ce jour.
   - `remainingQuantityToInvoice = Math.max(0, totalReceivedOnGrs - totalInvoicedOnGrs)`.

---

### 3. Validation sur le Scénario d'Épreuve Imposé

Le scénario d'épreuve imposé a été exécuté et validé par le script automatisé `scripts/test-phase6b3-validation.js` :

#### Paramètres du scénario :
- **Bon de Commande BC-TEST-6B3-MATCH :** 100 unités de tubes acier à 50 000 DA HT (Total HT = 5 000 000 DA).
- **Bon de Réception BR-1 :** 40 unités réceptionnées (2 000 000 DA HT).
- **Bon de Réception BR-2 :** 60 unités réceptionnées (3 000 000 DA HT).
- **Total réceptionné :** 100 unités.

#### Exécution séquentielle :

```
[BC: 100u @ 50 000 DA]
       |
       +---> [BR 1: 40u] -------------------------+
       |                                          |
       +---> [BR 2: 60u] -------------------+     |
                                            |     |
[Facture 1: 25u @ 50 000 DA = 1 250 000 DA] |     |
   -> Imputation: 25u sur BR 1 <------------+-----+
   -> Reliquat BR 1: 15u
   -> Reliquat total commande: 75u
   -> Statut: CONFORME / APPROUVEE

[Facture 2: 50u @ 50 000 DA = 2 500 000 DA]
   -> Imputation multi-BR:
        * 15u sur BR 1 (BR 1 soldé à 100%)
        * 35u sur BR 2 (Reliquat BR 2: 25u)
   -> Reliquat total commande: 25u
   -> Statut: CONFORME / APPROUVEE

Cumul facturé : 75 unités (3 750 000 DA HT)
Reste à facturer : 25 unités (1 250 000 DA HT)
```

#### Résultats Observés :
- **Facture 1 (25u) :** `matchingStatus = CONFORME`, `priceVarianceDA = 0`, `quantityVariance = 0`.
- **Facture 2 (50u) :** `matchingStatus = CONFORME`, `priceVarianceDA = 0`, `quantityVariance = 0`.
- **Reliquat après F1 + F2 :** Exactement 25 unités restantes sur BR 2.
- **Lignes de matching générées :** 3 lignes au total (1 pour F1 sur BR1, 1 pour F2 sur BR1 [15u], 1 pour F2 sur BR2 [35u]).

---

### 4. Tests des Cas Limites et Sécurités Financières

| Cas de Test | Données d'Entrée | Comportement Attendu | Résultat Constaté |
| :--- | :--- | :--- | :---: |
| **Surfacturation quantitative** | Facture 3 demandant 30 unités alors qu'il ne reste que 25 unités sur le BR 2 | Détection `ECART_QUANTITE` (+5 unités), bascule en `A_APPROUVER` | **PASS (100%)** |
| **Écart de prix unitaire** | Facture 4 à 52 000 DA/u au lieu de 50 000 DA/u négociés sur le BC | Détection `ECART_PRIX` (+50 000 DA sur 25u), bascule en `A_APPROUVER` | **PASS (100%)** |
| **Approbation avec Dérogation** | Appel de `approveSupplierInvoiceWithDerogation` par la Direction avec motif tracé | Facture passe en `APPROUVEE`, statut matching passe en `DEROGATION`, audit tracé | **PASS (100%)** |
| **Annulation de facture** | Annulation d'une facture fournisseur existante (`cancelSupplierInvoice`) | Les matchings passent en `ANNULE`, les quantités réservées sont restituées au BR | **PASS (100%)** |
| **Concurrence & Double-spending** | Deux factures soumises en concurrence pour consommer le reliquat | Atomicité garantie, détection de dépassement si le total dépasse le stock réceptionné | **PASS (100%)** |

---

### 5. Conclusion Technique

Le moteur 3-way matching de SARL SILEX SERVICES ERP répond désormais aux standards industriels les plus stricts :
1. Aucune fausse alerte sur facturations partielles ou acomptes.
2. Support natif et transparent des imputations multi-réceptions.
3. Détection mathématique exacte des écarts de quantité et de prix unitaire.
4. Traçabilité complète des dérogations et réversibilité en cas d'annulation.
