# TAIM — Interface System & UX Architecture

**Tomhel Academic Information Manager** — design specification for a modern academic platform for schools in Ghana.  
This document defines the **visual system**, **layout patterns**, **role experiences**, and **interaction rules** so engineering and design stay aligned.

**Quality bar:** SaaS-grade clarity (Google), restraint and polish (Apple), flow speed (Uber), information hierarchy (Amazon). Usable **without** a manual by non-technical staff.

---

## 1. Design objectives

| Goal | How we achieve it |
|------|-------------------|
| Premium & trustworthy | Deep blue/indigo primary, generous whitespace, crisp type |
| Low friction | ≤3 steps for common tasks; prefer pickers over free text |
| Sharp & structured | 8px grid, consistent radii, vector icons only, subtle shadows |
| Fast-feeling | Skeletons, optimistic UI where safe, immediate tap/hover feedback |

---

## 2. Core principles

1. **Clarity over decoration** — Every control earns its place; no ornamental chrome.
2. **Speed of interaction** — Short paths; bulk actions for teachers; smart defaults.
3. **Visual hierarchy** — One primary action per view; secondary = outline/ghost; tertiary = text link.
4. **Consistency** — Same component = same behavior for Admin, Teacher, Parent, Student.
5. **Sharpness** — 8px grid, 12–16px radius on cards, 1px hairline borders (`border` tokens), no muddy grays.

---

## 3. Design tokens

### 3.1 Color

| Role | Intent | Implementation hint |
|------|--------|------------------------|
| **Primary** | Trust, education, primary actions | Deep blue–indigo (current `--color-primary` OKLCH hue ~260); use for primary buttons, key nav active state, links |
| **Secondary / success** | Confirmations, “present”, saved | Emerald — separate token `--color-success` (not reused as primary) |
| **Neutral** | Surfaces & text | Off-white page (`--color-background`), white cards (`--color-card`), slate text (`--color-foreground` / `--color-muted`) |
| **Accent / warning** | Attention without panic | Soft orange — alerts, “pending”, optional highlights; pair with text for a11y |
| **Destructive** | Irreversible / absent / error | Keep `--color-destructive`; reserve red for errors + critical absent |

**Rules:** Never rely on color alone (e.g. attendance = icon + label + color). WCAG AA contrast for body text on backgrounds.

### 3.2 Typography

| Use | Spec |
|-----|------|
| **Font stack** | **Inter** (UI) — variable font if possible; **Poppins** optional for marketing/landing only to avoid dual-body fonts in app chrome |
| **H1** | 28–32px, semibold, tight line-height |
| **H2** | 22–24px, semibold |
| **H3 / section** | 16–18px, semibold |
| **Body** | 15–16px, regular/medium, line-height 1.5 |
| **Label / helper** | 12–13px, medium for labels; muted color for hints |
| **Numbers (tables)** | Tabular lining figures where available (`font-variant-numeric: tabular-nums`) |

### 3.3 Spacing (8px grid)

| Token | Value | Usage |
|-------|-------|--------|
| `1` | 4px | Icon gaps, dense inline |
| `2` | 8px | Default inline/stack gap |
| `3` | 12px | Input padding vertical |
| `4` | 16px | Card padding mobile |
| `5` | 20px | — |
| `6` | 24px | Card padding desktop, section gap |
| `8` | 32px | Page section separation |
| `10` | 40px | Hero / empty states |

### 3.4 Radius & elevation

| Element | Radius | Shadow |
|---------|--------|--------|
| Buttons, inputs | 8px | None |
| Cards, modals | 12–16px | `0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.06)` (subtle) |
| Dropdowns / popovers | 12px | Slightly stronger than cards |

### 3.5 Motion

| Type | Duration | Easing |
|------|----------|--------|
| Hover / press | 120–150ms | `ease-out` |
| Panel / modal enter | 200–240ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Success flash | 400ms hold | Fade emerald tint on row/card |

Respect `prefers-reduced-motion`: reduce to opacity-only or instant.

---

## 4. Component library

### 4.1 Foundations

- **Button:** Primary (filled), Secondary (outline), Ghost (text), Destructive (outline + red). Sizes: `sm` (dense tables), `md` (default), `lg` (mobile hero CTAs). **Always** `min-h-44` min touch target on mobile for primary flows.
- **Input / Select:** 44px min height on mobile; inline error below field; focus ring 2px primary with offset.
- **Card:** Title row + optional action; content padding 16–24px; optional footer for meta actions.
- **Badge / Pill:** Role, status, count — neutral surface + border or soft tint.
- **Avatar:** Initials fallback; crisp 2x export if photo.
- **Skeleton:** Rectangles with shimmer or pulse; **match final layout** (no generic spinners for page loads).
- **Toast / inline alert:** Success (emerald border), warning (orange), error (destructive); auto-dismiss 4–6s for success.
- **Modal:** Max width 480px for forms; 640px for complex; focus trap; ESC + overlay click (confirm if dirty).
- **Tabs (mobile bottom nav):** 4–5 items max; active state = label + icon color primary.

### 4.2 Data components

- **Table:** Header sticky on long lists; zebra **optional** (prefer extra row padding over stripes); sortable column headers with chevron; row hover `bg-muted/40`.
- **Empty state:** Illustration or icon + one sentence + primary CTA.
- **Pagination:** Bottom-right desktop; centered mobile; show “Showing 1–25 of 240”.

### 4.3 Navigation

- **Desktop:** Collapsible **sidebar** (icon-only collapsed): Dashboard, [role modules…], Settings at bottom. **Top bar:** school context, user menu, global search if applicable.
- **Mobile:** **Bottom tab bar** for top-level; secondary actions in screen header.

---

## 5. Global layouts

### 5.1 Desktop (≥1024px)

```text
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Top bar (context, search, user)      │
│ 240px    ├────────────────────────────────────┤
│          │                                     │
│ Nav      │  Main (max-width container 1280px) │
│          │  Breadcrumb optional                 │
│          │  Page title + primary action         │
│          │  Content                             │
└──────────┴────────────────────────────────────┘
```

### 5.2 Tablet (768–1023px)

Sidebar → **drawer**; hamburger in top bar; same content max-width with horizontal padding 24px.

### 5.3 Mobile (≤767px)

Bottom nav + **full-width** content; filters in sheet; tables → **card list** or horizontal scroll with sticky first column (admission # / name).

---

## 6. Role-based dashboards

### 6.1 Admin — structure & density

**Goal:** Oversight + safe operations.

- **Overview row:** 3–4 stat cards (Students, Teachers, Attendance today, Alerts) — big number + delta vs last week (small).
- **Primary tasks:** Create student/class, assign teacher, export — each ≤3 steps from dashboard.
- **Tables:** Students, Teachers, Classes — search + column filters; row actions in ⋮ menu (Edit, Reset PIN, Deactivate).
- **Reset PIN:** Secondary button in row menu; **modal** with confirm checkbox + consequence copy (“Student must sign in with new PIN”).
- **Create Student:** Modal or dedicated page; sections: Identity | Class | Guardian; dropdowns for class/school year; inline validation.

### 6.2 Teacher — speed first

**Goal:** Mark attendance and enter results in **minimum taps**.

- **Attendance:** Class selector sticky top → **student list** with large Present / Absent toggles (segmented control or two-button row); optional “All present”; sticky **Save** bar with count “32/32 present”.
- **Feedback:** On toggle, micro-flash (green/red border 300ms); on save, toast “Attendance saved ✓” + timestamp.
- **Results:** Matrix-friendly table or **card per student** on mobile; inline numeric inputs; **debounced auto-save** + “Saved” / “Saving…” in header; block navigation if unsaved (gentle).

### 6.3 Parent — simplicity first

**Goal:** At-a-glance child welfare.

- **Child selector** (if multiple) as top segmented control.
- **Cards:** This week attendance (green/red dots or %), latest term results (grades summary), one **Notifications** strip.
- **Copy:** Short labels (“Present 4 of 5 days”); avoid jargon; **notification-first** for new results / absences (future).

### 6.4 Student — engagement + clarity

**Goal:** Motivation without noise.

- **Performance cards:** GPA or average + sparkline or trend arrow; subject list with color-coded performance bands (not only red/green).
- **Subject drill-down:** Modal or page with assessments list.
- **Future quizzes:** placeholder card “Coming soon” — same card pattern as rest.

---

## 7. Key screens (spec)

### 7.1 Login (all roles)

- Single column card; logo + **one** line of reassurance (“Use your school email”).
- Email/password or role-specific fields; error **inline** under field when possible.
- Primary CTA full-width on mobile; **Back** as text link.
- No background clutter; optional very subtle gradient or pattern at 3% opacity.

### 7.2 Dashboard (home per role)

- Above-the-fold: greeting + **one** primary CTA for the most common task (Teacher: “Take attendance”; Admin: “Add student”).
- Secondary content scrolls; no competing primary buttons.

### 7.3 Attendance

- Flow: **Select class** → **List** → **Act** → **Save** → **Confirmation**.
- Bulk: “Mark all present” with undo snackbar.
- Offline (future): queue indicator in top bar.

### 7.4 Results

- Flow: **Select class/subject** → **Grid** → **Edit** → **Auto-save feedback** → optional **Publish** (Admin/Teacher policy).
- Prevent data loss: dirty state + “Leave without saving?”

---

## 8. Interaction flows (pattern)

Every critical action follows:

```text
Action → Immediate UI feedback → Server acknowledgment → Persistent UI update
```

Examples:

| Flow | Immediate | Ack |
|------|-----------|-----|
| Toggle attendance | Toggle anim + row tint | Toast + updated count |
| Save results | “Saving…” debounce | “Saved ✓” + time |
| Create student | Button loading | Modal close + row append or link to profile |

---

## 9. Forms (rules)

1. **Short** — Split long flows into steps with progress (Step 1 of 3).
2. **Grouped** — Fieldset titles every 3–5 fields.
3. **Pickers** — Class, gender, role from selects; free text only where unavoidable.
4. **Validation** — On blur + on submit; errors next to field; summarize at top for screen readers on submit fail.
5. **Mobile** — Appropriate `inputmode`; large hit areas.

---

## 10. Tables (rules)

- Sortable headers; one column for **actions** (icon menu).
- Search debounced 300ms; filters as chips below search.
- Pagination default 25 rows; density toggle optional for power users.
- **No** heavy grid lines — use whitespace and light `border-b` only.

---

## 11. Performance UX

- Route-level **lazy** loading for dashboards.
- **Skeleton** screens mirroring final layout (stats + table placeholder).
- Lists: virtualize if >100 rows (later phase).
- Images: lazy, `srcset`, WebP.

---

## 12. Ghana / real-world context

- **Low bandwidth:** Prefer skeletons and small payloads; avoid huge hero images on app shell.
- **Mixed literacy:** Icons + short labels; avoid idioms; numbers formatted locally.
- **Touch:** 44px minimum; spacing between toggles to prevent mis-taps.

---

## 13. Implementation map (current codebase)

| Area | Location |
|------|----------|
| Tokens | `apps/web/src/index.css` (`@theme`, CSS variables) |
| Shell | `apps/web/src/layouts/DashboardLayout.tsx` — evolve toward sidebar + top bar |
| UI primitives | `apps/web/src/components/ui/*` |
| Pages | `apps/web/src/pages/*` |

**Next build steps (engineering):** Add `--color-success`, `--color-warning`; load **Inter** via `@fontsource-variable/inter` or Google Fonts link; refactor `DashboardLayout` to sidebar + topbar on `lg:` breakpoint; introduce `Skeleton` component; standardize table wrapper component.

---

## 14. Definition of done (design QA)

- [ ] No screen without a clear primary action (or explicit read-only state).
- [ ] All interactive elements have hover/focus/active (keyboard included).
- [ ] Loading states use skeletons for main views.
- [ ] Success/error always acknowledged within 1s perception.
- [ ] Mobile: bottom nav for role app; no critical action only in hover tooltip.
- [ ] Contrast checked on primary + destructive + success on white/off-white.

---

*Document version: 1.0 — aligns with TAIM web stack (React, Vite, Tailwind v4). Update when tokens ship in code.*
