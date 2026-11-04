# SILEX INDUSTRIAL ERP
### Industrial Project & Operations Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

Prototype ERP industriel développé pour **SILEX SERVICES**, entreprise algérienne spécialisée dans les prestations industrielles de pointe :
- **Tuyauterie industrielle & soudage haute précision**
- **Montage mécanique & travaux neufs**
- **Maintenance industrielle & arrêts techniques d'unités**
- **HVAC & installations frigorifiques industrielles**
- **Chaudronnerie & préfabrication en atelier**
- Secteurs d'intervention : **Oil & Gas, Énergie, Agroalimentaire, Sidérurgie, Cimenterie**.

---

## 🚀 Démarrage Rapide (Quickstart)

### Prérequis
- [Node.js](https://nodejs.org/) v20+ (testé sous v24 LTS)
- [pnpm](https://pnpm.io/) v9+ (v11+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) en cours d'exécution

### 1. Clonage et Installation des Dépendances
```powershell
git clone <url-du-depot> silex-erp
cd silex-erp
pnpm install
```

### 2. Configuration d'Environnement
Copier le fichier d'exemple :
```powershell
cp .env.example .env
```

### 3. Lancement de la Base de Données & Données Démo
```powershell
# Démarrer le conteneur PostgreSQL
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres

# Appliquer le schéma Prisma et injecter les 5 projets, articles et employés démo
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Lancement de l'Application (Web + API)
```powershell
pnpm dev
```
- 🌐 **Interface Web ERP** : [http://localhost:3000](http://localhost:3000)
- 🔌 **API Backend & Swagger** : [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 👥 Comptes de Démonstration Intégrés

Lorsque le mode démo est activé (`DEMO_MODE=true`), utilisez le **sélecteur de profils en haut à droite** de l'interface ou connectez-vous avec :

| Profil Métier | Nom | Email | Mot de passe |
|---|---|---|---|
| **Directeur Général (DG)** | Karim Mansouri | `k.mansouri@silex-services.dz` | `SilexDemo2026!` |
| **Chef de Projets** | Sofiane Belkacem | `s.belkacem@silex-services.dz` | `SilexDemo2026!` |
| **Responsable Achats** | Amina Benali | `a.benali@silex-services.dz` | `SilexDemo2026!` |
| **Responsable Magasin** | Tarek Meziani | `t.meziani@silex-services.dz` | `SilexDemo2026!` |
| **Responsable RH** | Samira Haddad | `s.haddad@silex-services.dz` | `SilexDemo2026!` |
| **Directeur Financier** | Rachid Bouzid | `r.bouzid@silex-services.dz` | `SilexDemo2026!` |
| **Responsable Maintenance** | Yacine Khelifi | `y.khelifi@silex-services.dz` | `SilexDemo2026!` |
| **Responsable QHSE** | Nadia Chaib | `n.chaib@silex-services.dz` | `SilexDemo2026!` |
| **Administrateur** | Lyes Hamidi | `admin@silex-services.dz` | `SilexDemo2026!` |

---

## 📚 Documentation Technique & Fonctionnelle

Pour explorer l'architecture et les règles métier détaillées :
- 📐 [Architecture Système & Stack](file:///c:/Users/ZBOOK/Desktop/SILEX/ARCHITECTURE.md)
- 📋 [Règles Métier & Workflows Industriels](file:///c:/Users/ZBOOK/Desktop/SILEX/BUSINESS_RULES.md)
- 🔐 [Matrice des Permissions & Rôles (RBAC/ABAC)](file:///c:/Users/ZBOOK/Desktop/SILEX/PERMISSIONS_MATRIX.md)
- 🗄️ [Modèle de Données & ERD PostgreSQL](file:///c:/Users/ZBOOK/Desktop/SILEX/DATABASE_SCHEMA.md)
- 🚢 [Guide de Déploiement VPS & Docker](file:///c:/Users/ZBOOK/Desktop/SILEX/DEPLOYMENT_GUIDE.md)
- 🎯 [Guide de Démonstration Commerciale (Scénario Pas à Pas)](file:///c:/Users/ZBOOK/Desktop/SILEX/DEMO_GUIDE.md)
- 🛡️ [Checklist de Sécurité & Auditabilité](file:///c:/Users/ZBOOK/Desktop/SILEX/SECURITY_CHECKLIST.md)
- 📊 [État d'Avancement du Projet](file:///c:/Users/ZBOOK/Desktop/SILEX/PROJECT_STATUS.md)

---

## 🛠️ Stack Technique

- **Monorepo** : `pnpm workspaces` + TypeScript Strict
- **Frontend** : Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Lucide Icons, Recharts, TanStack Table
- **Backend** : NestJS 11, Prisma ORM, Swagger OpenAPI, Argon2id, JWT
- **Base de Données** : PostgreSQL 16 (Types Decimal pour toutes les transactions financières)
- **DevOps** : Docker multi-stage, Caddy Reverse Proxy, scripts automatisés de sauvegarde
- **Format Régional** : Fuseau horaire `Africa/Algiers`, Dates `JJ/MM/AAAA`, Devise Dinar Algérien (`DA`)
