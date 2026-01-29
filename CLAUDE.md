# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Banker's Daily Dashboard - A secure banking web application for managing customer accounts and transactions. Features Hebrew localization with RTL layout support. Built with React/Vite frontend and Express/Prisma backend, all containerized with Docker.

## Commands

### Development (Docker - Recommended)
```bash
docker-compose up --build              # Start all services (Frontend, Backend, PostgreSQL)
docker-compose up -d db                # Start only database
```

### Backend Development
```bash
cd backend
npm install
npx prisma migrate dev --name init     # Apply database migrations
npm run dev                            # Start with hot reload (nodemon)
npm test                               # Run Jest tests
npm test -- customerController.test.ts # Run single test file
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev                            # Start Vite dev server
npm run lint                           # ESLint
npm test                               # Run Vitest in watch mode
npm test -- --run                      # Run tests once
```

### Utility Scripts
```bash
./scripts/backup.sh                                     # Database backup to backups/
./scripts/restore.sh backups/backup_FILE.sql.gz         # Restore database
docker-compose exec backend npx ts-node make_admin.ts <email>  # Promote user to ADMIN
```

## Architecture

### Stack
- **Frontend:** React 19, Vite, Material UI, TypeScript, Axios
- **Backend:** Express 5, Prisma, TypeScript, Passport.js (Google OAuth2)
- **Database:** PostgreSQL 15 with Prisma ORM
- **Testing:** Vitest (frontend), Jest (backend)

### Key Directories
```
backend/src/
├── controllers/     # Business logic with RBAC filtering
├── routes/          # Express route definitions
├── middleware/      # auth.ts (Passport), authorize.ts (RBAC)
├── config/          # passport.ts (Google OAuth2 strategy)
└── tests/           # Jest tests with Prisma mocks

frontend/src/
├── pages/           # Login, Dashboard, CustomerDetails, Transactions, Admin
├── components/      # Layout and reusable UI
├── context/         # AuthContext for user state
├── api/             # Axios instance
└── tests/           # Vitest tests with @testing-library
```

### Database Models (Prisma)
- **User** - Authenticated users with Role (TELLER/MANAGER/ADMIN) and Branch assignment
- **Branch** - Bank branches that scope data access
- **Customer** - Bank customers belonging to a Branch
- **Account** - Customer accounts (CHECKING/SAVINGS) with Decimal balance
- **Transaction** - Financial transactions (DEPOSIT/WITHDRAWAL/TRANSFER) with audit trail
- **Session** - PostgreSQL-backed session storage

### Authorization (RBAC)
- **TELLER:** Access only their assigned branch's data
- **MANAGER:** Branch-scoped access with limited admin features
- **ADMIN:** Full access across all branches

### Financial Integrity
- All monetary calculations use `decimal.js` for precision
- Database operations use `prisma.$transaction` for atomicity
- Balance stored as Prisma `Decimal` type

## Testing Patterns

### Backend Tests
- Location: `backend/src/tests/`
- Uses `jest-mock-extended` for Prisma mocking
- `singleton.ts` sets up shared mock instance
- `client.ts` provides Supertest HTTP client

### Frontend Tests
- Location: `frontend/src/tests/`
- `utils.tsx` provides `renderWithAuth()` helper for authenticated components
- Uses `@testing-library/react` and `@testing-library/user-event`

## Environment Variables

Backend `.env` requires:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `SESSION_SECRET` - Random string for session encryption
- `ALLOWED_DOMAIN` (optional) - Restrict login to email domain

## Ports
- Frontend: http://localhost:3000 (HTTP redirect) or https://localhost:3030 (HTTPS)
- Backend: https://localhost:8080 (Docker) or https://localhost:5000 (local)
- PostgreSQL: localhost:5432

## Development Workflow

**IMPORTANT: After any code changes, always:**

1. **Run full regression tests**
```bash
cd backend && npm test && cd ../frontend && npm test -- --run
```

2. **Commit and push to remote repository**
```bash
git add <changed-files>
git commit -m "Description of changes"
git push
```

This ensures:
- No regressions in existing functionality
- Security tests pass (RBAC, privilege escalation prevention)
- Financial transaction integrity maintained (SERIALIZABLE isolation)
- Input validation working correctly
- All changes are backed up and tracked in remote repository
