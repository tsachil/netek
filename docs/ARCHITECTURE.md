# System Architecture

## Overview
Banker's Daily Dashboard is a secure, localized (Hebrew/RTL) web application designed for bankers to manage customer accounts, view transactions, and perform deposits/withdrawals.

## Technology Stack
- **Frontend:** 
  - React 18 (TypeScript)
  - Vite (Build Tool)
  - Material UI (Components & Theming)
  - Stylis (RTL Support)
  - Vitest (Testing)
- **Backend:** 
  - Node.js 22
  - Express.js (Web Server)
  - Prisma (ORM)
  - PostgreSQL (Database)
  - Passport.js (Google OAuth2)
  - Jest (Testing)
- **Infrastructure:** 
  - Docker & Docker Compose
  - Nginx (Internal proxying handled by Vite/Express in dev)

## Architecture Diagram (Conceptual)
```mermaid
graph TD
    Client[Browser (React)] -->|HTTPS:3030| Frontend[Frontend Container]
    Frontend -->|API Requests| Backend[Backend Container (Express)]
    Backend -->|SQL| DB[PostgreSQL Container]
    Backend -->|OAuth2| Google[Google Identity Platform]
```

## Security Design
1.  **Authentication:** Google OAuth2.
2.  **Session Management:** `connect-pg-simple` stores sessions in Postgres. Cookies are `Secure`, `HttpOnly`, and `SameSite=Lax`.
3.  **Authorization (RBAC):**
    - **TELLER:** Can only view/edit data for their assigned `Branch`.
    - **MANAGER:** Can access Admin panel but restricted to their branch (currently logic allows seeing all users, but data access is branch-scoped unless ADMIN).
    - **ADMIN:** Can access ALL data across ALL branches and manage users.
4.  **Data Integrity:** `decimal.js` used for all financial calculations. Atomic transactions via `prisma.$transaction`.
5.  **Network:** All internal communication is Docker-networked. External access requires HTTPS (Self-signed certs provided).
