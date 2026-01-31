# API Reference

Base URL: `https://localhost:8080`

## Authentication
- `GET /auth/google`: Start login flow.
- `GET /auth/me`: Get current user session.
- `POST /auth/logout`: Destroy session.

## Public (No Authentication)
- `GET /public/customers`: Get a list of all customers.

## Customers
- `GET /customers`: List customers (Filtered by Branch, unless ADMIN).
- `POST /customers`: Create new customer.
- `GET /customers/:id`: Get details + accounts + transactions.

## Accounts
- `POST /accounts`: Create new account.
- `POST /accounts/:id/transaction`: Perform Deposit/Withdrawal.
  - Body: `{ type: "DEPOSIT" | "WITHDRAWAL", amount: number }`

## Transactions
- `GET /transactions`: List last 100 transactions (Filtered by Branch, unless ADMIN).

## Administration
- `GET /admin/users`: List all users.
- `PATCH /admin/users/:id`: Update User Role (`TELLER`, `MANAGER`, `ADMIN`) or Branch.
- `GET /admin/branches`: List available branches.
