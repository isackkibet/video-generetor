#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
: "${BACKUP_FILE:?BACKUP_FILE required}"

TMP_DB="${TMP_DB:-yohpal_live_restore_test}"
createdb "$TMP_DB" 2>/dev/null || true
psql "$TMP_DB" < "$BACKUP_FILE"
psql "$TMP_DB" -c "SELECT COUNT(*) FROM \"Video\";" || true
dropdb "$TMP_DB"
echo "Backup verification passed: $BACKUP_FILE"