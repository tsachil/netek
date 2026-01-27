# Testing Strategy

## Overview
We use **Vitest** for Frontend and **Jest** for Backend. Tests run in CI/CD pipeline (simulated via pre-commit rule).

## Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test -- --run
```

## Coverage
- **Controllers:** RBAC enforcement, Input validation (Zod), Logic.
- **UI Components:** Rendering, User Interaction, Routing.

## Adding Tests
- **Backend:** Create `*.test.ts` in `backend/src/tests/`. Use `prismaMock` singleton.
- **Frontend:** Create `*.test.tsx` in `frontend/src/tests/`. Use `renderWithAuth`.
