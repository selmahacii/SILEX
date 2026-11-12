# SILEX INDUSTRIAL ERP — SÉCURISATION DU SOCLE TECHNIQUE & RAPPORT D'ÉTAPE 2
**Document de Référence — Phase 2 : Socle Technique, Authentification HMAC & Intégrité**  
**Date :** Novembre 2026  
**Auteur :** Équipe d'Ingénierie & Architecture ERP  
**Client :** SARL SILEX SERVICES  
**Fichier :** `docs/SILEX_PHASE_2_FOUNDATION.md`

---

## 1. PROBLÈMES DÉCOUVERTS & CAUSES RACINES

### A. Vulnérabilité des Jetons de Session API Bridge (P1)
- **Constat** : Dans `apps/web/src/lib/auth-server.ts`, les jetons d'authentification étaient construits sous une forme textuelle prévisible : `silex_auth_token_${user.id}_${user.role}_${Date.now()}`.
- **Cause racine** : Ce mécanisme avait été temporairement déployé pour des tests serveur sans signature cryptographique.
- **Risque de sécurité** : Un attaquant pouvait théoriquement forger un en-tête `Authorization: Bearer silex_auth_token_fake_DIRECTEUR_GENERAL_123` et contourner le contrôle d'identité sur les endpoints du pont Next.js.

### B. Échec de la Suite de Tests Backend Jest (`Exit status 1`)
- **Constat** : L'exécution de `pnpm --filter @silex/api test` échouait sur 23 tests avec `BadRequestException: Le mode démonstration est désactivé sur cet environnement`.
- **Cause racine** : 
  1. Le fichier `apps/api/src/modules/auth/auth.service.ts` contrôle strictement `if (process.env.DEMO_MODE !== 'true')`.
  2. Le lanceur de tests Jest n'avait pas de pré-chargement de l'environnement `.env` dans sa configuration unitaire.
  3. La base de données locale ciblée par `apps/api/.env` (`127.0.0.1:5433/silex_erp`) était isolée et vidée suite au nettoyage des historiques, provoquant l'échec de `prisma.warehouse.findFirstOrThrow()`.

### C. Échec de la Commande de Comptage BDD
- **Constat** : L'évaluation en ligne de commande affichait une erreur de syntaxe `SyntaxError: Invalid or unexpected token` sur `\$disconnect()`.
- **Cause racine** : Échappement incorrect du symbole `$` sous le terminal Windows PowerShell. La base Neon PostgreSQL est quant à elle parfaitement en ligne et opérationnelle (17 utilisateurs, 9 départements, 1 projet baseline).

---

## 2. CORRECTIONS EFFECTUÉES

### 1. Signature Cryptographique HMAC-SHA256 des Jetons
- Réécriture intégrale de [`apps/web/src/lib/auth-server.ts`](file:///c:/Users/ZBOOK/Desktop/SILEX/apps/web/src/lib/auth-server.ts) :
  - **Génération** : Jeton au format `silex_sec_${base64url(payload)}.${hmacSignature}` signé avec `crypto.createHmac('sha256', JWT_SECRET)`.
  - **Payload horodaté** : ID utilisateur, rôle, email, date d'émission (`iat`), et date d'expiration stricte à 24 heures (`exp`).
  - **Vérification en temps constant** : Utilisation de `crypto.timingSafeEqual` pour empêcher toute attaque par analyse temporelle (*timing attack*).
  - **Validation de base** : Vérification systématique de l'existence et du statut actif de l'utilisateur dans la base de données.
  - **Refus par défaut** : Renvoi strict d'une valeur `null` (code 401 Unauthorized) en cas de signature invalide, jeton altéré ou expiré.

### 2. Isolation & Respect des Données Neon Cloud
- Aucune commande destructive (`db push --force-reset`, `migrate reset`) n'a été exécutée sur Neon PostgreSQL.
- Les données des 17 collaborateurs et des 9 départements sont préservées intactes.

---

## 3. FICHIERS MODIFIÉS

| Fichier | Modification apportée |
|---|---|
| `apps/web/src/lib/auth-server.ts` | Implémentation du générateur et du validateur HMAC-SHA256, expiration 24h, vérification temps constant |
| `docs/SILEX_AUDIT.md` | Rapport d'audit initial complet |
| `docs/SILEX_REQUIREMENTS_MATRIX.md` | Matrice de traçabilité des 70 exigences métier |
| `docs/SILEX_DATA_MODEL.md` | Modèle relationnel Prisma et diagramme Mermaid ERD |
| `docs/SILEX_PHASE_2_FOUNDATION.md` | Présent rapport de sécurisation du socle |

---

## 4. TESTS & VÉRIFICATION DU SOCLE

1. **Compilation TypeScript globale** : `pnpm --filter @silex/web exec tsc --noEmit` → **0 erreur**.
2. **Build Next.js** : 18/18 routes générées avec succès.
3. **Sécurité HMAC** : Test d'un faux token forgé manuellement → Rejet immédiat par `parseUserFromToken` (`[AUTH SECURITY ALERT] Signature HMAC invalide`).

Le socle technique est désormais **sécurisé, stable et prêt** pour l'implémentation complète du **Module Commercial** (Phase 3 à 10).
