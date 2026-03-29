# Expense Tracker

**Expense Tracker** is a full-stack personal finance application for tracking everyday spending. It lets each user create an account, sign in, save expenses, organize them by category, and view a visual breakdown of where their money goes.

This project includes:

- account registration and sign in
- expense and category management
- filtered expense history
- analytics and chart-based insights

The repository contains two apps:

- `expense-tracker-back` - a NestJS REST API with Prisma and PostgreSQL
- `expense-tracker-front` - a Next.js frontend where users interact with the system

---

## Features

### Accounts

- **Register page** where a new user enters name, username, and password.
- **Username availability check** in the UI while typing.
- **Unique usernames** enforced by the backend and database.
- **Password hashing with bcrypt** before storing user credentials.
- **Login page** for existing users.
- **JWT access token + refresh token** authentication flow.
- **Automatic token refresh** when the access token expires.
- **Protected dashboard routes** so unauthenticated users cannot access private pages.

### Expenses

- **Expenses page** that acts as the main working area after login.
- **Expense table** with date, category, note, and amount.
- **Add expense** modal.
- **Edit expense** modal.
- **Delete expense** confirmation flow.
- **Date range filtering** with from/to inputs.
- **Category filtering** to narrow results.
- **Pagination** for large sets of records.
- **Summary total** for the selected period.

### Categories

- **Seeded default categories**: Housing, Transport, Health, Entertainment, Education, Work, and Other.
- **Custom category creation** by the user.
- **Category editing** for user-created categories, including renaming and color changes.
- **Category removal** is available only for custom user-created categories, not the seeded default ones.
- When removing a custom category, the user can choose to **delete its related expenses**, **reassign them to `Other`**, or **keep existing expenses unchanged**.
- **Color-coded categories** in the UI and analytics views.

### Analytics

- **Analytics page** with a donut chart for category-based spending.
- **Period presets**: all time, last month, last 3 months.
- **Custom date range** filtering.
- **Grouped custom categories** under `Other`, with the option to expand and inspect them.
- **Breakdown list** showing both amount and percentage of the total.

### Dashboard and navigation

- **Sidebar navigation** between Expenses and Analytics.
- **User info panel** showing the signed-in user with name.
- **Sign out** action from the dashboard.

---

## User flow

### 1. Register

A new user opens the register page and fills in:

- name
- username
- password

The frontend validates the input and checks whether the username is already taken. If the data is valid, the backend creates the account, hashes the password with bcrypt, and returns authentication tokens.

### 2. Login

An existing user signs in with username and password. The backend compares the provided password with the stored bcrypt hash. If the credentials are correct, the server returns:

- an access token
- a refresh token
- basic user information

The frontend stores the session state and redirects the user into the dashboard.

### 3. Open the dashboard

After authentication, the user lands inside the main dashboard layout. The sidebar allows navigation between:

- `Expenses`
- `Analytics`

Protected routes ensure that unauthenticated visitors are redirected away from the dashboard.

### 4. Manage expenses

On the Expenses page, the user can:

- create a new expense
- update an existing expense
- delete an expense
- filter by date range
- filter by category
- browse multiple pages of expense history

The app also calculates the total amount spent for the selected period.

### 5. Review analytics

On the Analytics page, the app groups expenses by category and displays them in a donut chart and a breakdown list. This helps the user quickly understand which categories take the biggest share of spending.

### 6. Stay signed in

API requests use the access token. If that token expires, the frontend tries to refresh the session using the refresh token. If refresh fails, the user is signed out and sent back to login.

---

## System flow

1. The frontend sends requests to the backend REST API under `/api`.
2. The backend validates input, checks authentication, and reads or writes data through Prisma.
3. PostgreSQL stores users, refresh tokens, categories, and expenses.
4. The frontend uses React Query to fetch, cache, and refresh server data.
5. Analytics endpoints aggregate expense data and return totals grouped by category.

---

## Repository layout

```
expense-tracker-back/    NestJS API (`/api` global prefix, default port 4000)
  prisma/                Schema, migrations, seed (default categories)
  src/auth/              Register, login, refresh, logout, username check
  src/categories/        Category CRUD and related rules
  src/expenses/          Expense CRUD, filters, summaries, analytics queries
  src/users/             User lookups for auth
  src/common/            JWT guard, decorators, exception filter, response shape

expense-tracker-front/   Next.js App Router UI (default dev port 3000)
  src/app/(auth)/        Login and register routes
  src/app/(main)/        Dashboard shell and nested routes (expenses, analytics)
  src/components/        Forms, expense table, modals, analytics chart, sidebar
  src/lib/api/           Axios client, token refresh on 401, API paths
  src/store/             Auth state (Zustand)
  src/hooks/             React Query hooks for expenses and categories
```

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Backend

```bash
cd expense-tracker-back
npm install
```

Create a `.env` file (adjust values for your machine):

```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

Apply migrations and seed default categories:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the API (default: `http://localhost:4000`, routes under `/api`):

```bash
npm run start:dev
```

### Frontend

```bash
cd expense-tracker-front
npm install
```

Point the UI at the API base URL (must include `/api`):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start Next.js:

```bash
npm run dev
```

Open the app at `http://localhost:3000` (or the port Next prints).

---

## Tech stack

| Layer        | Technologies |
|-------------|---------------|
| **API**     | NestJS, Prisma, PostgreSQL, Passport JWT, bcrypt, class-validator |
| **Auth**    | JWT access + refresh tokens, refresh tokens hashed (SHA-256) in DB |
| **Web UI**  | Next.js (App Router), React, TypeScript |
| **State & data** | Zustand (auth), TanStack React Query (server state), Axios |
| **Forms & validation** | react-hook-form, Zod (frontend); class-validator (API DTOs) |
| **Charts**  | Recharts |
| **Styling** | SCSS Modules |
