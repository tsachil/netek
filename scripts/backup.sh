#!/bin/bash

# Configuration
CONTAINER_NAME="netek-db-1"
DB_USER="postgres"
DB_NAME="banker_db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Perform Backup
echo "Starting backup for $DB_NAME..."
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > "$FILENAME"

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $FILENAME"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Retention Policy: Keep last 7 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs -I {} rm -- {}
