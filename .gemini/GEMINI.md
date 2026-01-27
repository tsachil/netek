# Project: Banker's Daily Dashboard

## Tech Stack
- **Frontend:** React, Vite, Material UI (Port 3030)
- **Backend:** Node.js, Express, Prisma (Port 8080)
- **Database:** PostgreSQL (Port 5432)
- **Infrastructure:** Docker Compose

## Operational Rules
- Always run `docker-compose up --build` after dependency changes.
- Backend migrations must run via `npx prisma migrate deploy` in the container.
- Always push code to the remote GitHub repository after every codebase change.
- **Regression Testing:** Always run complete frontend and backend tests (`cd backend && npm test`, `cd frontend && npm test`) before building Docker images or committing changes to the remote repository.
- **Security Analysis:** Perform a security analysis (e.g., dependency check via `npm audit` or code review) every time the codebase changes.
- **Documentation:** Keep the `docs/` folder up-to-date with every architectural or feature change.