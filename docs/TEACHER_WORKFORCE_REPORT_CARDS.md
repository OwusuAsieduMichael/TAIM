# Teacher workforce (SMS OTP) and report card submissions

This document describes features added alongside the main [README](../README.md): **school timezones**, **teacher workforce sign-in / sign-out** with SMS OTP, **gates** on teacher activity when not allowed to operate, **report card submission workflow** (teacher submit, admin approve or reject), and **local development tooling** (Windows script, Supabase connection notes).

---

## Data model (Prisma)

- **`School.timezone`** — IANA timezone (e.g. `Africa/Accra`). Used for “calendar day” boundaries and workforce logic. Default `UTC`.
- **`TeacherWorkforceDay`** — One row per teacher per **`localDate`** (YYYY-MM-DD in the school timezone). Tracks morning or evening OTP issue times, sign-in and sign-out timestamps, late flags, evening deadline, and forced logout when applicable.
- **`OtpCode.userId`** — Optional link from an OTP record to a **`User`** (used for workforce OTP flows where the recipient is known).
- **`ReportCardSubmission`** — Batch metadata per teacher / term / class with **`ReportCardSubmissionStatus`**: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`.

Apply schema changes from `apps/api` with Prisma (`migrate deploy`, `migrate dev`, or `db push`) after configuring [database URLs](../README.md#supabase-database). Seed sets demo school timezone to `Africa/Accra`.

---

## Environment variables (`apps/api`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled Supabase URI (transaction pooler, port **6543**, include `pgbouncer=true` when shown). Used by the running API. |
| `DIRECT_URL` | Connection Prisma uses for **migrations** and **introspection** (see `schema.prisma` `directUrl`). Prefer Supabase **direct** `db.*:5432`, or **Session pooler** on port **5432** if `db.*` is unreachable (common on IPv4-only networks). Details in [`.env.example`](../apps/api/.env.example). |
| `TEACHER_WORKFORCE_DISABLED` | Set to `1` to bypass workforce checks for teacher APIs during local development (default `0` in example). |
| `WORKFORCE_PUNCTUALITY_MINUTES` | Minutes after issue time that count as “late” for sign-in and evening sign-out (default **15** in example). |

SMS for OTPs uses existing Hubtel variables when configured (`HUBTEL_*` in `.env.example`).

---

## API: teacher workforce (teacher portal)

Base path: **`/api/v1/teacher`** (same router as other teacher-portal routes). All routes require auth and school scope as for the rest of the portal.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workforce/status` | Current day state: whether morning or evening OTP is expected, deadlines, whether the teacher may operate, mock or disabled flags. |
| `POST` | `/workforce/sign-in` | Body: `{ "code": "<otp>" }`. Records morning sign-in; may set **late** if after punctuality window from morning issue time. |
| `POST` | `/workforce/sign-out` | Body: `{ "code": "<otp>" }`. Records evening sign-out before deadline when evening OTP was issued. |

After these routes, **`teacherWorkforceGate`** runs on the teacher portal router: if the teacher is not allowed to operate (offline simulation is handled on the web; server enforces session rules), further teacher-portal routes return an error until sign-in or policy allows access.

**Gated teacher writes (examples):**

- **`POST /api/v1/attendance/...`** bulk or upsert (see `attendance.routes.ts`).
- **`POST /api/v1/results/...`** upsert where applicable (see `result.routes.ts`).

---

## API: admin — issue workforce OTPs

Base path: **`/api/v1/schools`**. Caller must be **`ADMIN`** with school scope.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/workforce/morning-otps` | Issue morning SMS OTPs for teachers at the school for the current local calendar day. |
| `POST` | `/workforce/evening-otps` | Issue evening SMS OTPs and set the evening deadline window. |

Implementation: `school-workforce.controller.ts` and `teacher-workforce` service (SMS via existing `sendSms` helper).

---

## API: report cards

Base path: **`/api/v1/report-cards`**. All routes use **`requireSchoolScope`**.

| Method | Path | Role | Notes |
|--------|------|------|--------|
| `POST` | `/submit` | `TEACHER` | Body: `{ "termId", "classId", "note?" }`. **`teacherWorkforceGate`** applies. |
| `GET` | `/rankings` | `TEACHER` | Query: `termId`, `classId`. Allowed only when submission policy / approval allows rankings (see service). **`teacherWorkforceGate`** applies. |
| `GET` | `/` | `ADMIN`, `TEACHER` | List submissions (scoped by role in service). |
| `POST` | `/:id/approve` | `ADMIN` | Body optional `{ "note" }`. |
| `POST` | `/:id/reject` | `ADMIN` | Body optional `{ "note" }`. |

**Publish flow:** Publishing results to parents/students remains the existing **admin** results publish API; report card **approval** gates teacher-facing **rankings**, not a separate publish flag on the submission row alone.

---

## Web app (high level)

- **`TeacherWorkforceShell`** — Wraps the teacher workspace: loads workforce status, blocks **offline** teachers from using the workspace UI, shows morning sign-in / session-ended states, supports dev mock bypass where applicable, then renders **`TeacherWorkspace`** when allowed.
- **`TeacherEveningSignOutBanner`** — Evening OTP sign-out prompt when the API indicates evening OTP is active.
- **`TeacherRouteGuard`** — Uses the shell so all teacher “workspace” entry points go through workforce UI.
- **`AdminTeacherWorkforceCard`** — School admin dashboard actions to trigger **morning** and **evening** OTP sends (with success or error feedback).

Dedicated **admin / teacher UIs** for listing, submitting, and approving report cards in the browser are not fully built; the **HTTP API** above is ready for integration or external tools.

---

## Behaviour summary (workforce)

- **Morning:** Admin issues morning OTPs. Teachers sign in with OTP; **late** if sign-in is after **`morningIssuedAt` + punctuality minutes** (from env).
- **Evening:** Admin issues evening OTPs; a **deadline** is stored. Teachers should sign out with OTP before the deadline. A background sweep marks late sign-out and **forced logout** when the deadline passes without a sign-out, consistent with “session ended” behaviour on the client.

Exact windows and SMS text live in **`teacher-workforce.service.ts`** and related helpers (**`schoolTime.ts`**).

---

## Windows: Prisma `EPERM` and dev servers

If **`npx prisma generate`** fails with **`EPERM`** renaming `query_engine-windows.dll.node`, a **Node** process (API, Vite, Prisma Studio, etc.) still has the DLL open.

From the repository root, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\stop-dev-ports.ps1"
```

That script frees ports **4000** and **5173** and stops **`node.exe`** processes whose command line looks tied to this repo (see script comments). Then run **`npx prisma generate`** again from **`apps/api`**, ideally with dev servers stopped.

---

## Supabase: `P1001` on `db.*:5432`

If **`prisma migrate deploy`**, **`db push`**, or **`migrate dev`** cannot reach **`db.<project>.supabase.co:5432`**, your network may be **IPv4-only** while the direct host is **IPv6-first**. Use Supabase **Session pooler** (Supavisor) on port **5432** as **`DIRECT_URL`**, and keep the **transaction** pooler on **6543** for **`DATABASE_URL`**. Copy both strings from the Supabase dashboard (**Connect**). See comments in **`apps/api/.env.example`**.

---

## Related files (for developers)

| Area | Path |
|------|------|
| School calendar / TZ helpers | `apps/api/src/lib/schoolTime.ts` |
| Workforce logic + OTP issue | `apps/api/src/modules/teacher-workforce/` |
| Workforce middleware | `apps/api/src/middleware/teacherWorkforceGate.ts` |
| Report cards | `apps/api/src/modules/report-cards/` |
| Teacher API client (web) | `apps/web/src/features/teacher/workforceApi.ts` |
| Stop script | `scripts/stop-dev-ports.ps1` |

---

## Changelog mindset

- **Teacher workforce:** SMS OTP morning sign-in and evening sign-out, school timezone, admin triggers, middleware gate on teacher writes and report-card teacher routes.
- **Report cards:** Submit, list, approve, reject, rankings with approval and workforce gates where applicable.
- **Docs / ops:** `.env.example` Supabase `DIRECT_URL` options; Windows `stop-dev-ports.ps1` for Prisma generate and clean restarts.

For general install, run, and demo accounts, continue to use the root [README](../README.md).
