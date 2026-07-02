#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:=./backups/postgres}"

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$BACKUP_DIR/yohpal_live_${TIMESTAMP}.sql"
pg_dump "$DATABASE_URL" > "$FILE"
echo "Backup created: $FILE"
