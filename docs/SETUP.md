# Setup & Installation

## Prerequisites
- Docker & Docker Compose
- Node.js (for local script execution if needed)
- Google Cloud Console Project (OAuth Credentials)

## Configuration
1.  **Environment Variables (`backend/.env`):**
    ```env
    DATABASE_URL="postgresql://postgres:postgres@db:5432/banker_db?schema=public"
    PORT=5000
    GOOGLE_CLIENT_ID=your_client_id
    GOOGLE_CLIENT_SECRET=your_client_secret
    SESSION_SECRET=your_secure_random_string
    # ALLOWED_DOMAIN=bank.com (Optional: Restrict login domain)
    ```

2.  **Certificates:**
    The system requires SSL certificates in `certs/`.
    ```bash
    mkdir -p certs
    openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/CN=localhost"
    ```

## Running the Application
```bash
docker-compose up --build
```
- **Frontend:** https://localhost:3030
- **Backend:** https://localhost:8080

## First Time Setup
1.  **Login:** Access the frontend and login with Google.
2.  **Promote to Admin:**
    ```bash
    docker-compose exec backend npx ts-node make_admin.ts your_email@gmail.com
    ```
3.  **Re-login:** Logout and login again to apply permissions.
