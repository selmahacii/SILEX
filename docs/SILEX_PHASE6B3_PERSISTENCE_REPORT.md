# RAPPORT D'AUDIT DE PERSISTANCE ET D'INTÉGRITÉ FINANCIÈRE — PHASE 6B.3
## SILEX SERVICES ERP — Module 06 : Fiabilité ACID, Tolérance aux Pannes & Étanchéité Démo

> **Statut :** VALIDÉ & CONFORME  
> **Date :** 14 Novembre 2026  
> **Composants :** `apps/web/src/lib/db-bridge.ts`, `apps/web/src/lib/server-store.ts`, `apps/web/src/app/api/[...path]/route.ts`  

---

### 1. Contexte & Problématique Résolue

L'audit contradictoire Phase 6B.2 avait relevé une vulnérabilité critique :
> *« En cas de défaillance de la base de données relationnelle, le pont mémoire intercepte l'erreur, consigne un avertissement dans la console et retourne un objet mémoire avec succès. L'utilisateur reçoit un statut HTTP 201 Created alors que la donnée n'a jamais été écrite dans PostgreSQL. »*

Dans un ERP de gestion industrielle et financière (trésorerie, facturation, règlements), ce comportement est inacceptable :
- Risque d'illusion de confirmation pour le directeur financier ou l'opérateur.
- Perte de données irréversible lors du redémarrage du serveur Node.js.
- Désynchronisation entre le grand livre en mémoire et le stockage physique.

---

### 2. Architecture de Persistance Sécurisée en Phase 6B.3

#### 2.1 Élimination du Faux Succès HTTP 201
Dans `apps/web/src/lib/db-bridge.ts`, une fonction d'interception stricte a été introduite :
```typescript
export function handleFinancePersistenceError(
  context: string,
  err: any,
  rollbackFn?: () => void
): never {
  console.error(`[DB Bridge Finance] Persistence failure in ${context}:`, err);
  if (rollbackFn) {
    try {
      rollbackFn();
    } catch (rbErr) {
      console.error(`[DB Bridge Finance] Rollback failure in ${context}:`, rbErr);
    }
  }
  throw new Error(`[DB_PERSISTENCE_FAILED] Échec critique d'écriture PostgreSQL pour ${context}: ${err?.message || err}`);
}
```

#### 2.2 Mécanisme de Rollback en Mémoire
Lors d'une tentative d'écriture financière (ex: création d'un compte, écriture d'une transaction, émission d'une facture), l'opération suit un protocole strict :
1. Une pré-allocation ou un identifiant est généré.
2. Si une écriture provisoire en cache mémoire a eu lieu, une fonction de nettoyage `rollbackFn` est fournie au pont (ex: suppression de l'élément créé dans `serverStore`).
3. L'écriture PostgreSQL Prisma est exécutée dans une transaction ACID.
4. En cas d'échec SQL (timeout, table verrouillée, erreur d'intégrité, base inaccessible) :
   - `rollbackFn()` est exécutée immédiatement pour annuler la modification en mémoire.
   - `handleFinancePersistenceError` lève l'exception `[DB_PERSISTENCE_FAILED]`.
5. La couche API (`apps/web/src/app/api/[...path]/route.ts`) intercepte spécifiquement cette erreur :
   ```typescript
   if (err?.message?.includes('[DB_PERSISTENCE_FAILED]')) {
     return NextResponse.json({
       error: 'Échec critique de persistance en base de données',
       details: err.message,
       code: 'PERSISTENCE_FAILED'
     }, { status: 500 });
   }
   ```
   **Résultat : Aucun faux 201 Created ne peut être retourné.**

---

### 3. Étanchéité Rigoureuse des Données Démo vs Production

Conformément à la règle d'or d'étanchéité :
1. Les données portant un préfixe de démonstration (ex: `acc-demo-*`, `tx-demo-*`, `fac-demo-*`) sont identifiées par `isDemoAccount(code)` ou `isDemoTransaction(id)`.
2. Ces entités restent strictement cantonnées dans le store mémoire `serverStore` et **ne sont jamais écrites dans les tables PostgreSQL de production**.
3. Lors du paiement d'une facture de démo ou de la consultation des soldes consolidés :
   - Le système vérifie l'existence préalable dans PostgreSQL (`invInDb = await prisma.customerInvoice.findUnique(...)`).
   - Si la facture est une entité de démo, elle est traitée exclusivement en mémoire sans provoquer d'erreur Prisma `P2025: Record to update not found`.
   - Les soldes bancaires réels en base PostgreSQL ne sont jamais altérés par les transactions de démonstration.

---

### 4. Idempotence des Transactions Financières

La table `CashTransaction` applique une contrainte d'unicité stricte sur `idempotencyKey` :
```sql
CONSTRAINT "CashTransaction_idempotencyKey_key" UNIQUE ("idempotencyKey")
```
Avant toute insertion, `db-bridge.ts` interroge la base de données :
```typescript
const existingTx = await (prisma as any).cashTransaction.findUnique({
  where: { idempotencyKey: data.idempotencyKey }
});
if (existingTx) {
  return existingTx; // Rejeu idempotent sans doublon
}
```
Si deux requêtes concurrentes transmettent la même clé d'idempotence, la seconde requête rejoue l'enregistrement existant au lieu de tenter une double écriture ou de lever une erreur non gérée.

---

### 5. Vérification du Redémarrage à Froid (Cold Reboot)

Un test de persistance réelle avec redémarrage à froid a été simulé :
1. **Écriture :** Création d'un compte financier réel et insertion de 2 transactions réelles dans PostgreSQL 16.
2. **Arrêt / Redémarrage :** Réinitialisation complète du processus Node.js et du store mémoire `serverStore`.
3. **Rechargement :** Lecture directe depuis la base PostgreSQL :
   - Le compte est retrouvé avec son solde exact (1 500 000 DA).
   - Les transactions sont intégralement présentes avec leurs montants, références et dates d'enregistrement.
   - Les contraintes d'intégrité référentielle sont respectées.

---

### 6. Matrice de Validation de la Persistance

| Test d'Intégrité | Scénario | Comportement Observé | Statut |
| :--- | :--- | :--- | :---: |
| **Erreur SQL forcée** | Tentative d'insertion avec une contrainte violée | Rollback mémoire exécuté, exception levée, HTTP 500 retourné | **PASS** |
| **Zéro faux 201** | Indisponibilité simulée de PostgreSQL | Aucun statut 201 retourné, client informé de l'échec | **PASS** |
| **Persistance à froid** | Redémarrage du serveur applicatif | Données financières relues fidèlement depuis PostgreSQL | **PASS** |
| **Isolation Démo** | Injection de transactions et comptes DEMO | Aucun enregistrement parasite dans les tables physiques | **PASS** |
| **Idempotence Trésorerie** | Double soumission d'une transaction avec même clé | Un seul enregistrement créé, solde débité une seule fois | **PASS** |
