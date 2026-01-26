# Banker's Daily Dashboard

A secure, containerized banking application for managing customer accounts and transactions.

## Tech Stack
- **Frontend:** React (Vite), Material UI, TypeScript
- **Backend:** Node.js, Express, Prisma, TypeScript
- **Database:** PostgreSQL
- **Auth:** Google OAuth2 (Passport.js)
- **Infrastructure:** Docker & Docker Compose

## Prerequisites
- Docker & Docker Compose
- Google Cloud Console Project (for OAuth credentials)

## Setup

1. **Google OAuth Credentials:**
   - Go to Google Cloud Console.
   - Create a project and configure OAuth consent screen.
   - Create OAuth 2.0 Client ID (Web Application).
   - **Authorized JavaScript origins:** `http://localhost:5173`
   - **Authorized redirect URIs:** `http://localhost:5000/auth/google/callback`
   - Copy Client ID and Client Secret.

2. **Configure Environment:**
   - Open `backend/.env`.
   - Replace `your_google_client_id` and `your_google_client_secret` with your actual keys.
   - (Optional) Change `SESSION_SECRET` to a random string.

## Running the Application

### Option 1: Docker (Recommended)
This will spin up the Database, Backend, and Frontend containers.

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### Option 2: Local Development
If you want to run services individually without Docker (except DB).

1. **Start Database:**
   ```bash
   docker-compose up -d db
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init # Ensure DB schema is applied
   npm run dev
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Features
- **Login:** Secure sign-in with Google.
- **RBAC:** Bankers are assigned to a branch (automatically 'DEFAULT' for new users) and can only see customers of that branch.
- **Dashboard:** View list of customers.
- **Customer Details:** View accounts, balance history.
- **Transactions:** Deposit and Withdraw funds with atomic consistency.
