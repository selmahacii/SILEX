#!/usr/bin/env bash
# Script de sauvegarde automatisée PostgreSQL — SILEX INDUSTRIAL ERP
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="silex_erp_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[SILEX ERP] Début de la sauvegarde PostgreSQL (${TIMESTAMP})..."

docker exec -t silex_postgres pg_dump -U silex_admin -d silex_erp | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[SILEX ERP] Sauvegarde terminée avec succès : ${BACKUP_DIR}/${FILENAME}"

# Nettoyage des sauvegardes datant de plus de 30 jours
find "${BACKUP_DIR}" -name "silex_erp_backup_*.sql.gz" -mtime +30 -exec rm {} \;
echo "[SILEX ERP] Rotation effectuée (rétention 30 jours)."
