import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import { fmtMoney, totalMonthlySubs, expenseYearly } from '@/lib/finance';
import type { Expense } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import ExpensesClient from './ExpensesClient';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const [{ data: expenses }, { data: projects }] = await Promise.all([
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, name').order('name'),
  ]);

  const es = (expenses ?? []) as Expense[];
  const monthly = totalMonthlySubs(es);
  const annual = es.reduce((s, e) => s + expenseYearly(e), 0);
  const active = es.filter(e => e.status !== 'cancelled').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <ExpensesClient mode="button" projects={projects ?? []} />
      </div>

      <div className="stats-grid">
        <StatCard label="Monthly Run Rate" value={fmtMoney(monthly)} sub="subscriptions only" />
        <StatCard label="Annual Run Rate" value={fmtMoney(annual)} />
        <StatCard label="Active Expenses" value={active} />
      </div>

      <ExpensesClient mode="table" expenses={es} projects={projects ?? []} />
    </div>
  );
}
