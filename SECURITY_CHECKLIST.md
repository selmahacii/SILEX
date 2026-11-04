# CHECKLIST DE SÉCURITÉ & AUDITABILITÉ — SILEX INDUSTRIAL ERP

> **Statut d'assurance** : Prototype industriel renforcé selon les standards OWASP Top 10 et ISO 27001  
> **Contrôle continu** : Validations automatiques côté serveur

---

## 1. Authentification & Gestion des Sessions

- [x] **Hachage cryptographique robuste** : Mots de passe chiffrés avec `Argon2id` (paramètres mémoire et parallélisme conformes aux recommandations ANSSI/OWASP).
- [x] **Stockage sécurisé des tokens** : JWT transmis via en-têtes d'autorisation sécurisés ou cookies `HttpOnly; Secure; SameSite=Strict`.
- [x] **Rotation des Refresh Tokens** : Chaque session de renouvellement invalide l'ancien jeton en base (`RefreshSession`).
- [x] **Rate Limiting sur l'authentification** : Protection active contre les attaques par force brute (ex: 5 tentatives par minute par IP).
- [x] **Sécurisation du sélecteur de démo** : Le sélecteur de rôles n'est actif que si `DEMO_MODE=true` ; en production, le flag est désactivé et l'endpoint API dédié retourne `404 Not Found`.

---

## 2. Contrôle d'Accès & Autorisations (RBAC & ABAC)

- [x] **Vérification systématique côté serveur** : Les composants d'interface ne cachent que la vue ; chaque requête API passe par `JwtAuthGuard`, `RolesGuard` et `ProjectAccessGuard`.
- [x] **Protection contre l'escalade horizontale de privilèges (BOLA/IDOR)** :
  - Un chef de projet ne peut ni lire ni modifier une ressource rattachée à un projet non assigné.
  - L'accès par identifiant (`GET /api/projects/:id`) vérifie la relation `UserProjectAssignment`.
- [x] **Règle de séparation des tâches (SoD)** : Le demandeur d'une commande ne peut valider sa propre demande, même s'il possède le rôle d'approbateur délégué.
- [x] **Idempotence des décisions** : Impossibilité de revalider ou rejeter deux fois la même demande.

---

## 3. Intégrité des Données & Transactionnalité

- [x] **Types Decimal pour la finance** : Zéro calcul monétaire sur des flottants JavaScript (IEEE 754). Utilisation de `Decimal.js` et types Prisma `Decimal(15,2)`.
- [x] **Atomicité PostgreSQL (`prisma.$transaction`)** : Les opérations combinées (ex: validation de réception, création de mouvement stock, et mise à jour de commande) s'exécutent dans un bloc transactionnel unifié.
- [x] **Immuabilité du stock ledger** : Aucun enregistrement de mouvement de stock validé ne peut être supprimé ou altéré. Une régularisation s'effectue par un mouvement compensatoire tracé.
- [x] **Contrainte anti-stock négatif** : Vérification stricte en amont du mouvement sous verrou de ligne (`SELECT FOR UPDATE` ou transaction sérialisable).

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
