# Getting Started

NestJS 11 REST API backend for the Expense Tracker application.  
Uses **Prisma** ORM with **PostgreSQL** and **JWT** cookie-based auth.

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally (default port 5432)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file (see example below)
cp .env.example .env   # then edit with your values

# 3. Run database migrations
npx prisma migrate dev

# 4. (Optional) Seed the database
npm run prisma:seed
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start dev server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |

---

## Environment Variables

```env
NODE_ENV=development
PORT=4000

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker"

# JWT — use long random strings (min 32 chars), keep them different from each other
JWT_ACCESS_SECRET=here_is_super_secret_access_key_min_32_characters_long
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=here_is_super_secret_refresh_key_different_from_access
JWT_REFRESH_EXPIRES_IN=30d

# bcrypt hashing cost (10–14 recommended)
BCRYPT_ROUNDS=12

# Allowed frontend origin for CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Tech Stack

- **NestJS 11** with TypeScript
- **Prisma 7** — ORM & migrations
- **PostgreSQL** — primary database
- **Passport + JWT** — access & refresh token auth (HTTP-only cookies)
- **bcrypt** — password hashing
