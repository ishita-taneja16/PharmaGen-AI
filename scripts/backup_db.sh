#!/usr/bin/env bash
# ==============================================================================
# Automated Database Backup Script - PharmaGen AI (PostgreSQL + pgvector)
# ==============================================================================

set -eo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/pharmagen_db_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[1/3] Executing pg_dump backup for PostgreSQL database..."
docker exec pharmagen_db pg_dump -U pharmagen pharmagen_db | gzip > "$BACKUP_FILE"

echo "[2/3] Generating SHA-256 integrity checksum..."
sha256sum "$BACKUP_FILE" > "${BACKUP_FILE}.sha256"

echo "[3/3] Backup completed successfully: $BACKUP_FILE"
echo "Checksum: $(cat ${BACKUP_FILE}.sha256)"

# Retain only last 14 days of backups
find "$BACKUP_DIR" -type f -mtime +14 -name "*.sql.gz*" -delete
