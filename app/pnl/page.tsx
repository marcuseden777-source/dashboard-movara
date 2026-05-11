import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import {
  fmtMoney, totalProjectMRR, totalMonthlySubs,
  revenueInRange, expensesInRange, periodPresets,
} from '@/lib/finance';
import type { Project, Expense, Document } from '@/lib/types';
import PnlClient from './PnlClient';

export default async function PnlPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: expenses }, { data: docs }] = await Promise.all([
    supabase.from('projects').select('*'),
    supabase.from('expenses').select('*'),
    supabase.from('documents').select('*'),
  ]);

  const ps = (projects ?? []) as Project[];
  const es = (expenses ?? []) as Expense[];
  const ds = (docs ?? []) as Document[];
  const presets = periodPresets();
  const { from, to } = presets['this-month'];

  const mrr = totalProjectMRR(ps);
  const monthlyExpenses = totalMonthlySubs(es);
  const revenue = revenueInRange(ps, ds, from, to);
  const costs = expensesInRange(es, from, to);
  const profit = revenue - costs;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">P&L Overview</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="MRR" value={fmtMoney(mrr)} sub="active retainers" />
        <StatCard label="Monthly Costs" value={fmtMoney(monthlyExpenses)} sub="subscriptions" />
        <StatCard label="Net MRR" value={fmtMoney(mrr - monthlyExpenses)} trend={mrr >= monthlyExpenses ? 'up' : 'down'} />
        <StatCard label="This Month Revenue" value={fmtMoney(revenue)} />
        <StatCard label="This Month Costs" value={fmtMoney(costs)} />
        <StatCard label="This Month Profit" value={fmtMoney(profit)} trend={profit >= 0 ? 'up' : 'down'} />
      </div>

      <PnlClient projects={ps} expenses={es} documents={ds} presets={presets} />
    </div>
  );
}
