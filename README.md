# TAIM — Tomhel Academic Information Manager

Monorepo layout:

- `apps/web` — React (Vite) + TypeScript + Tailwind v4 + TanStack Query + Zustand + React Router
- `apps/api` — Express + Prisma + PostgreSQL ([Supabase](https://supabase.com) in production) + JWT + OTP (HMAC) + Zod

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (Postgres), or local PostgreSQL for development

## Extended features (teacher workforce and report cards)

Teacher workforce SMS OTP (morning sign-in and evening sign-out), report card submissions and admin approval, API route summary, Supabase **`DIRECT_URL`** options when **`db.*:5432`** fails, and the Windows **`scripts/stop-dev-ports.ps1`** helper for Prisma **`EPERM`** are documented in **[docs/TEACHER_WORKFORCE_REPORT_CARDS.md](docs/TEACHER_WORKFORCE_REPORT_CARDS.md)**.

## Supabase database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → Database** and copy:
   - **Transaction pooler** URI → `DATABASE_URL` (Prisma uses this for queries from the API).
   - **Direct connection** URI → `DIRECT_URL` (required for `prisma migrate` and `db push`).
3. If you use only a single local Postgres URL, set `DATABASE_URL` and `DIRECT_URL` to the **same** connection string.

**If login returns “Internal server error”:** (1) **Start the API** in its own terminal (`npm run dev:api` from the repo root) so something is listening on **port 4000** — the web app proxies `/api` there in development. (2) If the API is already running but logs **“Can’t reach database server”**, fix **`DATABASE_URL`**: do **not** use `db.<project>.supabase.co` with port **6543**. Use the **Transaction pooler** URI (host like `*.pooler.supabase.com`, port **6543**) for `DATABASE_URL`, and the **Direct** URI (`db.<project>.supabase.co`, port **5432**) for `DIRECT_URL`, then restart `npm run dev:api`.

Optional later: [Supabase Storage](https://supabase.com/docs/guides/storage) for files; enable Row Level Security if you expose the DB to clients other than this API.

## Setup

1. Copy environment files:

   - `apps/api/.env.example` → `apps/api/.env` (set `DATABASE_URL`, `DIRECT_URL`, and a `JWT_SECRET` of at least 32 characters)
   - `apps/web/.env.example` → `apps/web/.env` (optional; leave empty to use the Vite dev proxy)

2. Install dependencies from the repository root:

```bash
npm install
```

3. Apply database migrations and seed demo data (creates tables such as `User`, `School`, etc.):

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

The seed script **prefers `DATABASE_URL` (transaction pooler, port 6543) with `pgbouncer=true`**, because many networks **block direct Postgres** (`db.*:5432`) and Prisma then reports “Can’t reach database server”. Keep **`DIRECT_URL`** for `prisma migrate`. To force direct for seed only (e.g. CI): `SEED_USE_DIRECT=1 npx prisma db seed`.

If the app says **`The table public.User does not exist`** (or similar), migrations were never applied to this Supabase project. Run the two commands above from **`apps/api`** with a working **`DIRECT_URL`** (Supabase **direct** connection on port **5432**). If `migrate deploy` cannot reach the DB from your PC, use Supabase **SQL Editor** to run the SQL from `apps/api/prisma/migrations/*/migration.sql`, or temporarily set **`DATABASE_URL`** and **`DIRECT_URL`** to the same direct URI and run `npx prisma db push` then `db seed`.

4. Run the API and the web app (from the repo root):

```bash
npm run dev:api
```

In another terminal:

```bash
npm run dev:web
```

- API: `http://localhost:4000` (Swagger UI at `/api-docs`)
- Web: `http://localhost:5173` (proxies `/api` to the API in development)

If **`EADDRINUSE`** appears, another process is using port **4000**. Stop the old API terminal (**Ctrl+C** so Prisma disconnects cleanly) or run `netstat -ano | findstr :4000` and `taskkill /PID … /F`, or set **`PORT=4001`** in `apps/api/.env`.

## Demo accounts (after seed)

| Role        | Identifier              | Secret / note                                      |
| ----------- | ----------------------- | -------------------------------------------------- |
| Super admin | `super@taim.local`      | Password `Admin123!`                               |
| School admin| `admin@demo-school.gh`  | Password `Admin123!`                               |
| Teacher     | Phone `0241000001`      | OTP printed in API logs after request            |
| Parent      | Phone `0241000002`      | OTP printed in API logs after request              |
| Student     | Admission `STU-001`     | PIN `1234`                                         |

School slug for OTP and student login: `demo-school`.

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev:api`| Start API in watch mode  |
| `npm run dev:web`| Start Vite dev server    |
| `npm run build`  | Build all workspaces     |

## Deployment (Vercel + Render + Supabase)

This repo is a monorepo with two deployables:

- `apps/web` → **Vercel** (static site + SPA routing via `vercel.json`)
- `apps/api` → **Render** (Node web service; see `render.yaml`)
- Database → **Supabase Postgres** (set both `DATABASE_URL` and `DIRECT_URL` exactly like `apps/api/.env.example`)

### 1) Supabase

Create a Supabase project and copy:

- **Transaction pooler** URI → `DATABASE_URL` (for the running API)
- **Direct** URI (or Supavisor session pooler `:5432` if you need IPv4) → `DIRECT_URL` (for Prisma migrations)

### 2) Render (API)

Create a **Web Service** from this GitHub repo.

Recommended settings:

- **Root directory**: repository root (`.`)
- **Build command**: `npm install && npm run db:generate --workspace=@taim/api && npm run build --workspace=@taim/api`
- **Start command**: `npm run start --workspace=@taim/api`
- **Health check path**: `/health`

Environment variables (minimum):

- `NODE_ENV=production`
- `PORT` (Render usually injects this automatically; the API reads it)
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET` (32+ chars)
- `CORS_ORIGIN` (comma-separated list; include your Vercel domain, e.g. `https://your-app.vercel.app`)

Optional but recommended for reliable installs on Node hosts:

- `NPM_CONFIG_PRODUCTION=false` (ensures devDependencies like `typescript`/`prisma` are available during `npm install` on some hosts)

Database migrations:

- Run `prisma migrate deploy` against production using your `DIRECT_URL` (often easiest from your laptop with `DATABASE_URL`/`DIRECT_URL` temporarily pointed at prod, or via a one-off Render shell job).

### 3) Vercel (Web)

Create a Vercel project from this GitHub repo and set:

- **Root directory**: `apps/web`
- **Build command**: `npm install && npm run build`
- **Output directory**: `dist`

Environment variables:

- `VITE_API_URL=https://<your-render-service>.onrender.com` (no trailing slash)

Notes:

- In local dev, omit `VITE_API_URL` so the browser uses `/api` and Vite proxies to `http://localhost:4000`.
- In production, `VITE_API_URL` must be the full origin of your Render API because there is no Vite proxy in a static deployment.
