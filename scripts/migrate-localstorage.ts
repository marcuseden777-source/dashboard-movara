/**
 * Migrates a JSON export from the standalone dashboard.html (localStorage-backed)
 * into the Supabase schema. Run with:
 *   npm run migrate -- <path-to-export.json>
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const file = process.argv[2];
if (!file) { console.error('Usage: npm run migrate -- export.json'); process.exit(1); }

const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));

// Map standalone localStorage keys to Supabase table rows.
// Standalone used camelCase; Supabase schema uses snake_case.
function mapClient(c: Record<string, unknown>) {
  return {
    id: c.id,
    name: c.name,
    company: c.company ?? null,
    email: c.email ?? null,
    phone: c.phone ?? null,
    notes: c.notes ?? null,
  };
}

function mapProject(p: Record<string, unknown>) {
  const billing = p.billingType ?? p.billing_type ?? 'one-time';
  return {
    id: p.id,
    client_id: p.clientId ?? p.client_id,
    name: p.name,
    type: p.type ?? 'Other',
    stage: p.stage ?? 'Lead',
    description: p.description ?? null,
    billing_type: billing,
    value: Number(p.value ?? 0),
    one_time_value: Number(p.oneTimeValue ?? p.one_time_value ?? 0),
    retainer_start: p.retainerStart ?? p.retainer_start ?? null,
    retainer_end: p.retainerEnd ?? p.retainer_end ?? null,
    retainer_status: p.retainerStatus ?? p.retainer_status ?? 'active',
    start_date: p.startDate ?? p.start_date ?? null,
    due_date: p.dueDate ?? p.due_date ?? null,
  };
}

function mapTask(t: Record<string, unknown>) {
  return {
    id: t.id,
    project_id: t.projectId ?? t.project_id ?? null,
    title: t.title,
    description: t.description ?? null,
    status: t.status ?? 'todo',
    priority: t.priority ?? 'Medium',
    due_date: t.dueDate ?? t.due_date ?? null,
    notes: t.notes ?? null,
    position: Number(t.position ?? 0),
  };
}

function mapExpense(e: Record<string, unknown>) {
  return {
    id: e.id,
    project_id: e.projectId ?? e.project_id ?? null,
    name: e.name,
    category: e.category ?? 'Other',
    kind: e.kind ?? 'one-time',
    amount: Number(e.amount ?? 0),
    frequency: e.frequency ?? null,
    start_date: e.startDate ?? e.start_date ?? null,
    end_date: e.endDate ?? e.end_date ?? null,
    expense_date: e.expenseDate ?? e.expense_date ?? null,
    status: e.status ?? 'active',
    notes: e.notes ?? null,
  };
}

async function run() {
  const tables = [
    { key: 'clients', map: mapClient },
    { key: 'projects', map: mapProject },
    { key: 'tasks', map: mapTask },
    { key: 'expenses', map: mapExpense },
  ];

  for (const { key, map } of tables) {
    const rows = (raw[key] ?? []).map(map);
    if (rows.length === 0) { console.log(`${key}: skipped (empty)`); continue; }
    const { error } = await (supabase.from(key as 'clients') as ReturnType<typeof supabase.from>)
      .upsert(rows, { onConflict: 'id' });
    if (error) console.error(`${key}: ✗`, error.message);
    else console.log(`${key}: ✓ ${rows.length} rows`);
  }
}

run().catch(console.error);
