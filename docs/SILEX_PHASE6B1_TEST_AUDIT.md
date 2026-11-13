# AUDIT DES TESTS AUTOMATISÉS — PHASE 6B.1
## Analyse Critique de `test-finance-e2e.js` et `run-all-e2e.js`

> **Statut de l'Audit :** CONTRADICTOIRE & EN LECTURE SEULE  
> **Date de réalisation :** 13 Novembre 2026  
> **Commit audité :** `cb4d02b`

---

### 1. Analyse Détaillée par Étape de `scripts/test-finance-e2e.js`

| Étape de Test | Ce qu'il teste réellement | Endpoints / Couches appelées | Base de données réelle sollicitée ? | Données isolées ? | Pertinence des Assertions Métier | Scénarios Négatifs / Erreurs testés ? | Statut d'Audit |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **Étape 1 : Isolation Comptes Démo** | Vérifie la présence de 3 comptes avec code `DEMO-CPT-*` et `isDemoAccount: true` | `dbBridge.getFinancialAccounts()` | **NON** (Lecture store mémoire) | Oui | Vérifie le typage et le solde | Non | **VERIFIED** |
| **Étape 2 : Config Financière** | Vérifie les taux par défaut (TVA 19%, Retenue 5%) et la mise à jour d'un seuil | `dbBridge.getFinancialConfig()`, `updateFinancialConfig()` | **NON** | Oui | Vérifie la mutation de l'objet config | Non testé avec rôle non autorisé | **PARTIALLY VERIFIED** |
| **Étape 3 : Facture Client** | Calcul de la retenue de garantie (5%) et de la TVA (19%) sur 10M DA | `dbBridge.createCustomerInvoice()` | **NON** | Oui | Assertions exactes sur HT, TVA, Retenue, Net | Non | **VERIFIED** |
| **Étape 4 : Règlements Clients** | Paiement partiel (6M) puis solde (5.4M), mise à jour statuts et solde bancaire | `dbBridge.recordCustomerPayment()` | **NON** | Oui | Vérifie l'incrément de solde et le statut PAYEE | Non testé avec montant excédentaire | **VERIFIED** |
| **Étape 5 : Libération Retenue** | Déblocage retenue (500k DA) suite PVRD et encaissement bancaire | `dbBridge.releaseWarrantyRetention()` | **NON** | Oui | Vérifie crédit compte et décrément retenue | Non testé avec montant supérieur au disponible | **VERIFIED** |
| **Étape 6 : 3-Way Matching** | Création de 3 factures : sans BR, avec écart prix, et conforme | `dbBridge.createSupplierInvoice()` | **NON** | Oui | Vérifie `SANS_RECEPTION`, `ECART_PRIX`, `CONFORME_3_WAY` | Oui (détection des anomalies de facture) | **VERIFIED** |
| **Étape 7 : Décaissement Fournisseur** | Paiement facture 5.95M DA TTC via BEA et apurement dette | `dbBridge.recordSupplierPayment()` | **NON** | Oui | Vérifie débit compte et dette restante = 0 | Non | **VERIFIED** |
| **Étape 8 : Virement Interne** | Virement de 500k DA de BEA vers Caisse Régie | `dbBridge.transferBetweenAccounts()` | **NON** | Oui | Vérifie débit source + crédit destination + 2 transactions | Non testé avec solde insuffisant | **PARTIALLY VERIFIED** |
| **Étape 9 : Rentabilité Projet** | Calcul de marge PRJ-2026-001 (Facturé vs Matières + MO + Frais) | `dbBridge.getProjectProfitability()` | **NON** | Oui | Vérifie la marge brute DA et % | Non | **VERIFIED** |
| **Étape 10 : Balance Âgée** | Répartition des créances et dettes par antériorité d'échéance | `dbBridge.getAgedTrialBalance()` | **NON** | Oui | Vérifie les buckets et le calcul du BFR | Non | **VERIFIED** |
| **Étape 11 : Idempotence & SoD** | Rejeu de transaction avec même clé + tentative de paiement facture en écart | `dbBridge.recordCashTransaction()`, `recordSupplierPayment()` | **NON** | Oui | Vérifie l'idempotence et le rejet SoD | Oui (rejet tentative de paiement non autorisé) | **VERIFIED** |

---

### 2. Écarts Critiques & Limites de la Couverture de Test

1. **Test en Mémoire Exclusive :**
   - **FAILED :** Aucune des 11 étapes ne sollicite la base de données relationnelle Neon PostgreSQL. Si le service PostgreSQL était déconnecté, les tests réussiraient exactement à l'identique.
2. **Absence de Test de Redémarrage (Crash/Restart Resilience) :**
   - **FAILED :** Le banc de test n'intègre aucun scénario simulant l'arrêt du processus et le redémarrage. Après redémarrage, toutes les factures et transactions créées durant les tests disparaissent.
3. **Absence de Test des Routes HTTP Réelles (API Gateway) :**
   - **FAILED :** Les tests appellent directement `dbBridge` (couche logicielle interne) au lieu d'exécuter des requêtes HTTP réelles (`fetch('http://localhost:3000/api/finance/...')`). Par conséquent, les vulnérabilités d'authentification sur les routes `GET` de l'API Gateway ne sont pas détectées par le script.

---

### 3. Classification des Constats de Test

- `TEST-01` : **VERIFIED** — La logique métier (mathématique et flux) est rigoureusement validée par des assertions strictes sur 11 étapes.
- `TEST-02` : **FAILED** — Les tests valident uniquement le store mémoire et ne constituent pas une preuve de persistance en base PostgreSQL.
- `TEST-03` : **FAILED** — Absence de tests d'intégration HTTP de bout en bout avec contrôle des tokens JWT.
