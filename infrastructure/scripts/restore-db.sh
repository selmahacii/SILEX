#!/usr/bin/env bash
# Script de restauration de base de données — SILEX INDUSTRIAL ERP
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <chemin_vers_fichier_backup.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erreur: Le fichier ${BACKUP_FILE} n'existe pas."
    exit 1
fi

echo "[SILEX ERP] ATTENTION : La restauration va écraser les données actuelles de silex_erp."
read -p "Confirmez-vous la restauration ? (oui/non) : " confirmation

if [ "$confirmation" != "oui" ]; then
    echo "Restauration annulée."
    exit 0
fi

echo "[SILEX ERP] Décompression et restauration en cours..."
gunzip -c "$BACKUP_FILE" | docker exec -i silex_postgres psql -U silex_admin -d silex_erp

echo "[SILEX ERP] Base de données restaurée avec succès."
