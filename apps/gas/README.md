# TAIM — Google Apps Script backend

Free backend using **Google Sheets** as the database. No Supabase, Render, or paid Postgres required.

## What you get

- REST-style API matching TAIM’s `/api/v1/*` routes (auth, schools, students, classes, results, attendance, notifications, teacher workspace)
- Demo data via `seedDemoData_()` (same logins as the Prisma seed)
- OTP codes logged in Apps Script **Executions** (no SMS cost in dev)

## Setup (about 15 minutes)

### 1. Create the Apps Script project

**Option A — Google Sheets bound script (easiest)**

1. Go to [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**.
2. **Extensions → Apps Script**.
3. Delete the default `Code.gs` content.
4. Copy every file from `apps/gas/src/` into the Apps Script editor (one file per `.gs` name).
5. Copy `appsscript.json` settings: **Project Settings → Apps Script manifest** → enable “Show appsscript.json” and paste from this repo.

**Option B — clasp (CLI)**

```bash
npm install -g @google/clasp
clasp login
cd apps/gas
copy .clasp.json.example .clasp.json
# Create a new Apps Script project in the browser, paste script ID into .clasp.json
clasp push
```

### 2. Initialize the database

In the Apps Script editor:

1. Run **`initializeTaimBackend`** (first time: approve permissions).
2. Check **Execution log** — it prints the spreadsheet URL and demo account hints.
3. **Project Settings → Script properties** — confirm `SPREADSHEET_ID` and `JWT_SECRET` were set.

### 3. Deploy as Web App

1. **Deploy → New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Copy the **`/exec`** URL (not `/dev`).

### 4. Point the React app at GAS

Create `apps/web/.env`:

```env
VITE_API_BACKEND=gas
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Run the web app:

```bash
npm run dev:web
```

Vite proxies `/api/gas` to your script so **CORS is not an issue in local dev**.

### 5. Production (Vercel)

On Vercel, set:

- `VITE_API_BACKEND=gas`
- `VITE_GAS_URL` = your `/exec` URL

Redeploy the web project. The browser calls Apps Script directly (simple `text/plain` POST, no `Authorization` header).

## Demo logins (after seed)

| Role | Login | Secret |
|------|-------|--------|
| Super admin | `super@taim.local` | `Admin123!` |
| School admin | `admin@demo-school.gh` | `Admin123!` |
| Teacher | `0241000001` | OTP in Apps Script execution log |
| Parent | `0241000002` | OTP in execution log |
| Student | School `demo-school`, admission `STU-001` | PIN `1234` |

## Sheet tabs (database)

Each tab is a table: `Schools`, `Users`, `Students`, `Classes`, `Subjects`, `Results`, `Attendance`, `Notifications`, etc. You can inspect or edit rows directly in Sheets (careful in production).

## Limits & notes

- **Google quotas**: fine for a small school; not for thousands of concurrent users.
- **Not all Express routes are ported yet** — unimplemented routes return `404 Route not implemented in GAS backend yet`. Add handlers in `Handlers.gs` / `Router.gs` as needed.
- **Teacher workforce SMS** is stubbed off (`TEACHER_WORKFORCE_DISABLED` in `Config.gs`).
- **Migrating back to Supabase later**: keep the Express API in `apps/api`; switch `VITE_API_BACKEND` back to `express` and deploy Render when ready.

## Re-seed demo data

Run **`initializeTaimBackend`** again from the Apps Script editor (clears sheet rows and re-inserts demo data).
