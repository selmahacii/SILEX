# GUIDE DE DÉPLOIEMENT & EXPLOITATION — SILEX INDUSTRIAL ERP

> **Environnements** : Local (Windows / Docker Desktop), Staging, et Production VPS Linux (Ubuntu 22.04 / 24.04 LTS)  
> **Composants** : Reverse Proxy Caddy, Frontend Next.js, API NestJS, Base PostgreSQL 16

---

## 1. Démarrage en Environnement Local (Windows)

### Option A — Développement Direct (avec pnpm & PostgreSQL Docker)
1. Démarrer uniquement la base de données PostgreSQL via Docker Compose :
   ```powershell
   docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
   ```
2. Installer les dépendances du monorepo :
   ```powershell
   pnpm install
   ```
3. Exécuter les migrations et le seed initial complet :
   ```powershell
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```
4. Lancer les applications frontend et backend :
   ```powershell
   pnpm dev
   ```
   - Application Web : `http://localhost:3000`
   - API REST & Documentation Swagger : `http://localhost:4000/api/docs`

### Option B — Conteneurs Complets (Stack Docker intégrée)
1. Démarrer l'ensemble des conteneurs :
   ```powershell
   pnpm docker:up
   ```
2. L'application est immédiatement accessible via Caddy sur `http://localhost` (ou HTTPS auto-signé).

---

## 2. Déploiement sur Serveur VPS Linux

### 2.1 Prérequis du serveur VPS
- Système d'exploitation : Ubuntu 22.04 / 24.04 LTS
- Configuration minimale recommandée : 2 vCPU, 4 Go RAM, 40 Go SSD
- Ports ouverts sur le pare-feu (UFW) :
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- Outils installés : `docker`, `docker-compose-plugin`, `git`.

### 2.2 Procédure de déploiement pas à pas
1. **Connexion SSH sécurisée** :
   ```bash
   ssh deploy@vps.silex-services.dz
   ```
2. **Clonage du référentiel** :
   ```bash
   git clone <URL_DU_DEPOT_SILEX> /opt/silex-erp
   cd /opt/silex-erp
   ```
3. **Configuration du fichier d'environnement de production** :
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Renseigner des secrets forts pour JWT_SECRET, JWT_REFRESH_SECRET et DATABASE_URL. Désactiver DEMO_MODE si nécessaire.*
4. **Configuration du nom de domaine dans Caddy** :
   Éditer `infrastructure/caddy/Caddyfile` en remplaçant `localhost` par le domaine officiel (ex: `erp.silex-services.dz`). Caddy provisionnera automatiquement le certificat SSL/TLS Let's Encrypt.
5. **Construction et lancement des conteneurs** :
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml build
   docker compose -f infrastructure/docker/docker-compose.yml up -d
   ```
6. **Application des migrations de base de données** :
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml exec api pnpm prisma migrate deploy
   ```
7. **Vérification de l'état des services** :
   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml ps
   curl -I https://erp.silex-services.dz/api/health
   ```

---

## 3. Sauvegardes & Restauration de la Base de Données

Les scripts automatisés se trouvent dans [infrastructure/scripts/](file:///c:/Users/ZBOOK/Desktop/SILEX/infrastructure/scripts/).

### 3.1 Sauvegarde manuelle ou planifiée (Cron)
```bash
bash infrastructure/scripts/backup-db.sh
```
Génère une archive compressée horodatée dans `/var/backups/silex/` avec conservation glissante sur 30 jours.

### 3.2 Restauration en cas d'incident
```bash
bash infrastructure/scripts/restore-db.sh /var/backups/silex/backup_20261104_210000.sql.gz
```
