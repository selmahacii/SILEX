@echo off
chcp 65001 > nul
title SILEX INDUSTRIAL ERP — RÉINITIALISATION DE LA BASE

echo ================================================================
echo    SILEX INDUSTRIAL ERP — RÉINITIALISATION PRISMA
echo ================================================================
echo.
echo Choisissez le mode de réinitialisation :
echo   [1] VERSION VIERGE (Recommandé) :
echo       Base 100%% propre (0 projet, 0 achat, 0 stock, 0 pointage)
echo       Tous les départements, le magasin central et les 9 comptes
echo       sont prêts pour que vos testeurs saisissent leurs vraies données.
echo.
echo   [2] VERSION AVEC DONNÉES DE DÉMONSTRATION :
echo       Peuple des projets exemples (Sonatrach, HMD, Arzew),
echo       des soudeurs ASME IX, des pièces en stock et des devis.
echo.
echo   [3] Annuler
echo ================================================================
echo.
set /p choix="Entrez votre choix (1, 2 ou 3) : "

if "%choix%"=="1" goto blank
if "%choix%"=="2" goto demo
if "%choix%"=="3" goto cancel
goto invalid

:blank
echo.
echo [INFO] Initialisation en VERSION VIERGE OPÉRATIONNELLE...
call pnpm --filter @silex/api prisma:seed:blank
goto finish

:demo
echo.
echo [INFO] Initialisation en VERSION DÉMO COMPLÈTE...
call pnpm --filter @silex/api prisma:seed
goto finish

:cancel
echo Opération annulée.
pause
exit /b 0

:invalid
echo Choix invalide.
pause
exit /b 1

:finish
if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo [OK] Base de données initialisée avec succès !
    echo Connectez-vous sur http://localhost:3008
    echo Identifiant  : admin@silex-services.dz
    echo Mot de passe : SilexDemo2026!
    echo ================================================================
) else (
    echo.
    echo [ERREUR] L'opération a échoué. Assurez-vous que Docker / PostgreSQL est actif.
)
echo.
pause
