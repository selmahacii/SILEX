@echo off
chcp 65001 > nul
title SILEX INDUSTRIAL ERP — LANCEMENT DÉMONSTRATION

echo ================================================================
echo    SILEX INDUSTRIAL ERP — DÉMARRAGE DE LA DÉMONSTRATION (3 JOURS)
echo ================================================================
echo.

:: 1. Vérification de Docker et démarrage du conteneur PostgreSQL
echo [1/3] Vérification de la base de données PostgreSQL (Port 5433)...
docker ps -f name=silex_postgres --format "{{.Status}}" | findstr "Up" > nul
if %errorlevel% neq 0 (
    echo Démarrage du conteneur PostgreSQL...
    docker start silex_postgres > nul 2>&1
    if %errorlevel% neq 0 (
        echo Démarrage via Docker Compose...
        docker compose -f infrastructure\docker\docker-compose.yml up -d postgres
    )
)
echo [OK] Base de données PostgreSQL active sur port 5433.
echo.

:: 2. Démarrage de l'API NestJS en arrière-plan
echo [2/3] Démarrage du Backend API NestJS (Port 4000)...
start "SILEX API (Port 4000)" /min cmd /c "pnpm --filter @silex/api dev"
echo [OK] API NestJS lancée.
echo.

:: 3. Démarrage du Frontend Next.js en arrière-plan
echo [3/3] Démarrage de l'Interface Web Next.js (Port 3008)...
start "SILEX WEB (Port 3008)" /min cmd /c "pnpm --filter @silex/web dev -- -p 3008"
echo [OK] Interface Web lancée.
echo.

echo ================================================================
echo    PLATEFORME OPÉRATIONNELLE POUR LA DÉMO !
echo    • Accès Local   : http://localhost:3008
echo    • API & Docs    : http://localhost:4000/api/docs
echo    • Identifiant   : admin@silex-services.dz
echo    • Mot de passe  : SilexDemo2026!
echo ================================================================
echo.
echo Ouverture automatique du navigateur dans 5 secondes...
timeout /t 5 /nobreak > nul
start http://localhost:3008
