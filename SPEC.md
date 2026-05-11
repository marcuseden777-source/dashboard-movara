# Dashboard SPEC — Next.js + Supabase port

This is the build spec for converting the existing localStorage dashboard
(`dashboard-standalone/dashboard.html`) into a multi-device web app backed
by Supabase. Hand this to Claude Code along with the prompt at the bottom.

---

## Stack

- **Framework:** Next.js 14 (app router, TypeScript, Tailwind disabled — keep
  the existing CSS variables and class names from `dashboard.html`).
- **Database/auth:** Supabase. Browser uses the **anon** key with magic-link
  auth. Server-only routes use the **service** key.
- **Realtime:** Supabase Realtime channels on `clients`, `projects`, `tasks`,
  `expenses`, `documents`, `content_items`, `weekly_focus`, `settings`.
- **Charts:** none required for v1 (existing dashboard is layout + numbers).
- **Deps to add:** `@supabase/supabase-js`, `@supabase/ssr`.

## File layout (target)

```
dashboard/
├── app/
│   ├── layout.tsx            ← root layout, sidebar, auth gate
│   ├── page.tsx              ← Dashboard view (the home stats page)
│   ├── globals.css           ← copied from dashboard.html <style> block
│   ├── login/page.tsx        ← magic-link sign-in
│   ├── auth/callback/route.ts ← exchange code for session
│   ├── clients/
│   │   ├── page.tsx          ← list view
│   │   └── [id]/page.tsx     ← detail view
│   ├── projects/
│   │   ├── page.tsx          ← pipeline + list (toggleable)
│   │   └── [id]/page.tsx     ← detail view
│   ├── tasks/page.tsx        ← kanban + list
│   ├── pnl/page.tsx          ← P&L Overview
│   ├── expenses/page.tsx
│   ├── subscriptions/page.tsx
│   ├── roi/page.tsx
│   ├── quotations/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx     ← printable preview
│   ├── invoices/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── ai-generator/page.tsx
│   ├── settings/page.tsx
│   └── data/page.tsx         ← import / export
├── components/
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── Tag.tsx
│   ├── Modal.tsx
│   ├── Kanban.tsx            ← reusable drag-drop column
│   ├── DocPreview.tsx        ← shared quote/invoice renderer
│   └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← createBrowserClient
│   │   ├── server.ts         ← createServerClient (anon, with cookie session)
│   │   └── service.ts        ← service-role client (server only)
│   ├── finance.ts            ← all calculation rules (see "Math" below)
│   ├── types.ts              ← typed DB row shapes
│   └── realtime.ts           ← subscription helper
├── scripts/
│   └── migrate-localstorage.ts ← one-shot import from dashboard JSON
├── .env.local.example        ← already provided
├── package.json
├── tsconfig.json
└── next.config.js
```

## Visual parity

- Copy the entire `<style>` block from `dashboard-standalone/dashboard.html`
  into `app/globals.css`. Keep all CSS variables (`--accent`, `--green`, etc.)
  and class names (`.card`, `.tag`, `.kcol`, `.pipeline`, `.stat-num`, etc.).
- Keep the same component layout: left sidebar nav + main content area.
- Keep the existing modal pattern for create/edit forms.
- Light mode only (matches Cowork shell — though here it's standalone, light
  is the design intent).

## Auth flow

1. Unauthed user → redirected to `/login`.
2. Magic-link form → POST to Supabase auth.
3. Email link → `/auth/callback` exchanges code → cookie session.
4. Authed user → loads dashboard at `/`.
5. Sign-out button in sidebar footer.

Use `@supabase/ssr` so the same session works in server components and route
handlers.

## Data layer

- **All rows are scoped by `user_id = auth.uid()`** via Supabase RLS — already
  enforced in the schema. Don't pass `user_id` from the browser.
- Use `@supabase/ssr` `createServerClient` for SSR queries (initial page
  loads), `createBrowserClient` for live subscriptions in client components.
- Wrap each table's CRUD in a small typed helper in `lib/supabase/`. Example
  shape:

```ts
export async function listProjects() {
  const supabase = createServerClient(/* ... */);
  return supabase.from('projects')
    .select('*, clients(name)')
    .order('stage');
}
```

## Realtime

In a top-level client component (e.g. `components/RealtimeBoot.tsx`),
subscribe to changes on the seven tables and call `router.refresh()` on each
INSERT/UPDATE/DELETE. Throttle to one refresh per 500ms.

## Math — copy these rules verbatim

Translate from the existing dashboard.html JS. The core helpers belong in
`lib/finance.ts`:

```ts
// project billing
export function isRetainer(p)      { return p.billing_type === 'retainer-monthly'; }
export function isHybrid(p)        { return p.billing_type === 'hybrid'; }
export function hasRetainerPart(p) { return isRetainer(p) || isHybrid(p); }
export function hasOneTimePart(p)  { return p.billing_type === 'one-time' || isHybrid(p); }

export function projectMonthlyAmount(p) {
  return hasRetainerPart(p) ? Number(p.value || 0) : 0;
}
export function projectOneTimeAmount(p) {
  if (p.billing_type === 'one-time') return Number(p.value || 0);
  if (p.billing_type === 'hybrid')   return Number(p.one_time_value || 0);
  return 0;
}
export function projectAnnualizedValue(p) {
  return projectOneTimeAmount(p) + projectMonthlyAmount(p) * 12;
}
export function projectMRR(p) {
  if (!hasRetainerPart(p)) return 0;
  if (p.retainer_status && p.retainer_status !== 'active') return 0;
  const now = Date.now();
  const startTs = p.retainer_start ? new Date(p.retainer_start).getTime() : 0;
  const endTs = p.retainer_end ? new Date(p.retainer_end).getTime() : Infinity;
  if (now < startTs || now > endTs) return 0;
  return projectMonthlyAmount(p);
}

// retainer accrual within [from, to]
export function retainerAccrual(p, fromTs, toTs) {
  if (!hasRetainerPart(p)) return 0;
  if (p.retainer_status === 'paused') return 0;
  const monthly = projectMonthlyAmount(p);
  if (!monthly) return 0;
  const startTs = p.retainer_start ? new Date(p.retainer_start).getTime() : 0;
  const endTs = p.retainer_end
    ? new Date(p.retainer_end).getTime()
    : (p.retainer_status === 'ended' ? 0 : Infinity);
  const overlapStart = Math.max(fromTs, startTs);
  const overlapEnd = Math.min(toTs, endTs);
  if (overlapEnd <= overlapStart) return 0;
  const overlapDays = (overlapEnd - overlapStart) / 86400000;
  return monthly * 12 * (overlapDays / 365);
}
```

`projectFinancials`, `expenseMonthly`, `revenueInRange`, `expensesInRange` —
all follow the same shapes from the existing `dashboard.html`. Read it once
and translate.

**Critical rule:** for **pure retainer** projects, exclude paid invoices from
revenue (use accrual only — avoids double-count). For **hybrid** projects,
include paid invoices (they represent the upfront work) AND retainer accrual.
For **one-time** projects, only paid invoices.

## Schema reference

Truth lives in `supabase/migrations/0001_initial_schema.sql`. The DB uses
**snake_case** column names; the app uses the same shapes — don't camelize.

The `projects` table needs **one extra column** before this dashboard runs:

```sql
alter table public.projects add column one_time_value numeric default 0;
```

Add this as `supabase/migrations/0002_projects_one_time_value.sql`.

## Migration script

`scripts/migrate-localstorage.ts` — takes a JSON file (the existing
dashboard's Import/Export download), maps camelCase keys to snake_case, and
inserts into Supabase using the service-role key. Map this:

| LocalStorage key        | Table             | Notes                               |
| ----------------------- | ----------------- | ----------------------------------- |
| `clients`               | `clients`         | direct                              |
| `projects`              | `projects`        | `clientId→client_id`, `billingType→billing_type`, `oneTimeValue→one_time_value`, `retainerStart→retainer_start`, etc. |
| `tasks`                 | `tasks`           | `projectId→project_id`              |
| `expenses`              | `expenses`        | `type→kind`, `projectId→project_id`, `date→expense_date`, `startDate→start_date`, `endDate→end_date` |
| `quotations` `invoices` | `documents`       | flatten into one table with `kind` set to `'quotation'` or `'invoice'` |
| `weeklyFocus`           | `weekly_focus`    |                                     |
| `settings`              | `settings`        | upsert with `user_id`               |

Pass `--user <uuid>` and `--file <path>` as CLI args. Idempotent if possible
(skip rows whose ids already exist).

## Acceptance criteria

A successful build:

1. `npm install && npm run dev` boots clean on `http://localhost:3000`.
2. Magic-link sign-in works.
3. Every view from the existing dashboard renders without console errors.
4. Drag-and-drop in pipeline + kanban moves rows in Supabase (visible from
   another browser tab within ~1s thanks to realtime).
5. AI Generator view's "Save & preview" round-trips through Supabase.
6. Quote/invoice preview prints a clean PDF (Cmd-P).
7. Numbers on Dashboard, P&L, ROI, and project detail pages match the
   reference values from the existing localStorage dashboard for the same
   imported data.

---

## CLAUDE CODE PROMPT

Paste this verbatim into Claude Code, run from `~/Desktop/movara-ai-system`:

> Read `dashboard/SPEC.md`, `dashboard-standalone/dashboard.html`, and
> `supabase/migrations/0001_initial_schema.sql`. Build the Next.js 14 app
> described in SPEC.md inside the existing `dashboard/` folder. Stick to the
> file layout, math rules, RLS expectations, and acceptance criteria in the
> spec. Use `@supabase/supabase-js` and `@supabase/ssr` for auth + realtime.
> Copy the CSS verbatim from the standalone HTML into `app/globals.css`.
> Translate every page (Dashboard, Clients + detail, Projects pipeline/list +
> detail, Tasks kanban/list, P&L, Expenses, Subscriptions, ROI, Quotations,
> Invoices, AI Generator, Settings, Import/Export) into Next.js routes with
> matching visuals and behaviors. Also create
> `supabase/migrations/0002_projects_one_time_value.sql` adding
> `one_time_value numeric default 0` to `public.projects`. Then create
> `dashboard/scripts/migrate-localstorage.ts` per the spec. When done, run
> `npm install` and `npm run typecheck`, then print a summary of remaining
> manual steps (running the new migration, importing localStorage data,
> setting env vars).
