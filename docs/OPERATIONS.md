# Operations Guide

## Database Backup & Restore

### Backup
Creates a gzipped SQL dump in `backups/`.
```bash
./scripts/backup.sh
```

### Restore
**Warning:** Overwrites current database.
```bash
./scripts/restore.sh backups/backup_FILE.sql.gz
```

## User Management
- **Promote User via CLI:**
  ```bash
  docker-compose exec backend npx ts-node promote.ts <email> # Sets to MANAGER
  docker-compose exec backend npx ts-node make_admin.ts <email> # Sets to ADMIN
  ```
- **Via UI:** Login as Admin -> Click "ניהול" (Admin) -> Edit User.

## Security Maintenance
- **Audit Dependencies:**
  ```bash
  cd backend && npm audit
  cd frontend && npm audit
  ```
- **Rotate Secrets:** Update `.env` and restart containers (`docker-compose restart backend`).
