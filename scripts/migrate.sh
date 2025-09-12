#!/usr/bin/env bash
set -euo pipefail
MYSQL="mysql -h ${DB_HOST:-127.0.0.1} -P ${DB_PORT:-3306} -u${DB_USER:-root} -p${DB_PASSWORD:-root}"
$MYSQL -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME:-ads_unified};"
for f in migrations/*.sql; do
  echo "Applying $f"
  $MYSQL ${DB_NAME:-ads_unified} < "$f"
done
