# CHECKLIST DE SÉCURITÉ & AUDITABILITÉ — SILEX INDUSTRIAL ERP

> **Statut d'assurance** : Prototype industriel renforcé selon les standards OWASP Top 10 et ISO 27001  
> **Contrôle continu** : Validations automatiques côté serveur

---

## 1. Authentification & Gestion des Sessions

- [x] **Hachage cryptographique robuste & Vérification obligatoire** : Mots de passe chiffrés et vérifiés avec `Argon2id`. Le champ `password` est obligatoire dans `LoginRequestDto` et validé par Zod (min 6 caractères, non vide). Refus catégorique des connexions sans mot de passe ou avec mot de passe null/vide.
- [x] **Stockage sécurisé des tokens** : JWT signé avec clé secrète, durée de validité contrôlée, transmis via en-têtes d'autorisation sécurisés (`Bearer`).
- [x] **Rotation des Refresh Tokens** : Chaque session de renouvellement invalide l'ancien jeton en base (`RefreshSession`).
- [x] **Protection anti-brute-force & Lockout** : Verrouillage automatique de compte après 5 tentatives infructueuses consécutives (blocage 15 minutes avec code HTTP `429 Too Many Requests`).
- [x] **Sécurisation du sélecteur de démo** : Le sélecteur de rôles n'est actif que si `DEMO_MODE=true` ; en production, le flag est désactivé et l'endpoint API dédié retourne `404 Not Found`. La page de connexion `/login` fonctionne de manière autonome en mode standard.
- [x] **Protection des données sensibles** : Exclusion systématique de `passwordHash` dans toutes les projections Prisma (`select`), notamment `GET /api/users` et `GET /api/auth/me`. L'accès à `GET /api/users` est strictement restreint à `ADMINISTRATEUR`, `DIRECTEUR_GENERAL` et `RESPONSABLE_RH`.

---

## 2. Contrôle d'Accès & Autorisations (RBAC & ABAC)

- [x] **Vérification systématique côté serveur** : `JwtAuthGuard` appliqué globalement à l'ensemble de l'API (bypasses uniquement sur routes annotées `@Public()`).
- [x] **Contrôle de rôle (RBAC)** : `RolesGuard` validant les rôles autorisés sur chaque endpoint sensible (achats, stocks, finance, utilisateurs).
- [x] **Protection contre l'escalade horizontale de privilèges (BOLA/IDOR)** :
  - Un chef de projet ne peut ni lire ni modifier une ressource rattachée à un projet non assigné (`ProjectAccessGuard` validant l'assignation sur `id` ou `code`).
  - Toute violation déclenche un code HTTP `403 Forbidden`.
- [x] **Règle de séparation des tâches (SoD)** : Le demandeur d'une commande ne peut valider sa propre demande, même s'il possède le rôle d'approbateur délégué.
- [x] **Idempotence des décisions** : Impossibilité de revalider ou rejeter deux fois la même demande.

---

## 3. Intégrité des Données & Transactionnalité

- [x] **Types Decimal pour la finance** : Zéro calcul monétaire sur des flottants JavaScript (IEEE 754). Utilisation de `Decimal.js` et types Prisma `Decimal(15,2)`.
- [x] **Atomicité PostgreSQL (`prisma.$transaction`)** : Les opérations combinées (ex: validation de réception, création de mouvement stock, et mise à jour de commande) s'exécutent dans un bloc transactionnel unifié.
- [x] **Immuabilité du stock ledger** : Aucun enregistrement de mouvement de stock validé ne peut être supprimé ou altéré. Une régularisation s'effectue par un mouvement compensatoire tracé.
- [x] **Contrainte anti-stock négatif & Concurrence** : Décrément conditionnel atomique (`currentStock: { gte: quantity }`) doublé d'une contrainte CHECK PostgreSQL native (`CONSTRAINT check_positive_stock CHECK (currentStock >= 0)`). Impossibilité physique d'atteindre un stock négatif, même sous requêtes concurrentes simultanées.
- [x] **Gestion des migrations BDD** : Migration baseline `0_init` versionnée et reproductible via `prisma migrate deploy`.

---

## 4. Sécurité des API & Protection Réseau

- [x] **En-têtes de sécurité HTTP** : Activation de `Helmet` (CSP, X-Content-Type-Options, HSTS, X-Frame-Options: DENY).
- [x] **Validation stricte des DTOs** : `ValidationPipe` NestJS avec `whitelist: true` et `forbidNonWhitelisted: true` interdisant l'injection de paramètres non déclarés.
- [x] **Isolement de la base de données** : PostgreSQL n'expose aucun port sur l'interface publique du serveur ; il n'est accessible que sur le réseau privé Docker interne.
- [x] **Reverse Proxy Caddy** : Gestion automatique des certificats TLS/SSL Let's Encrypt et redirection forcée HTTP vers HTTPS.

---

## 5. Journal d'Audit & Traçabilité (Conformité ISO 9001 / ISO 27001)

- [x] **Audit Trail inaltérable** : Enregistrement pour chaque action sensible de l'utilisateur, de l'adresse IP, du timestamp UTC et des états avant/après.
- [x] **Consultation réservée** : Le journal d'audit n'est accessible en lecture qu'au `DIRECTEUR_GENERAL` et à l'`ADMINISTRATEUR`.
