# Getting Started

Next.js 16 frontend for the Expense Tracker application. Communicates with `expense-tracker-back` via REST.

---

## Prerequisites

- **Node.js** ≥ 18
- `expense-tracker-back` running locally on port **4000**

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file (see example below)
cp .env.local.example .env.local   # then edit with your values
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot-reload |
| `npm run build` | Build production bundle |

---

## Environment Variables

```env
# Base URL of the backend API (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** with TypeScript
- **Zustand** — global auth / UI state
- **React Hook Form + Zod** — form validation
- **Recharts** — charts & analytics
- **SCSS Modules** — component-scoped styles
- **Axios** — HTTP client with interceptors
