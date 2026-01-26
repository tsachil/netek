#!/bin/bash

# Configuration
CONTAINER_NAME="netek-db-1"
DB_USER="postgres"
DB_NAME="banker_db"

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file_path>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File $BACKUP_FILE not found!"
  exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database '$DB_NAME'."
read -p "Are you sure? (y/N): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Restore cancelled."
  exit 0
fi

echo "Restoring from $BACKUP_FILE..."

# Drop existing connections and restore
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';"
docker exec -i $CONTAINER_NAME dropdb -U $DB_USER $DB_NAME
docker exec -i $CONTAINER_NAME createdb -U $DB_USER $DB_NAME

gunzip -c "$BACKUP_FILE" | docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME

if [ $? -eq 0 ]; then
  echo "✅ Restore successful!"
else
  echo "❌ Restore failed!"
  exit 1
fi
