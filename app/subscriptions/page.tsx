import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import { fmtMoney, expenseMonthly, expenseYearly, totalMonthlySubs } from '@/lib/finance';
import type { Expense } from '@/lib/types';
import { EXPENSE_FREQUENCIES } from '@/lib/types';

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('kind', 'subscription')
    .order('category');

  const es = (expenses ?? []) as Expense[];
  const active = es.filter(e => e.status !== 'cancelled');
  const monthly = totalMonthlySubs(active);
  const annual = active.reduce((s, e) => s + expenseYearly(e), 0);

  const byCategory = active.reduce<Record<string, { total: number; items: Expense[] }>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { total: 0, items: [] };
    acc[e.category].total += expenseMonthly(e);
    acc[e.category].items.push(e);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Subscriptions</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Monthly Spend" value={fmtMoney(monthly)} />
        <StatCard label="Annual Spend" value={fmtMoney(annual)} />
        <StatCard label="Active Subscriptions" value={active.length} />
      </div>

      {Object.entries(byCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([category, { total, items }]) => (
          <div key={category} style={{ marginTop: 24 }}>
            <div className="section-header">
              <h2 className="section-title">{category}</h2>
              <span className="muted">{fmtMoney(total)}/mo</span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Billing</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Monthly</th>
                    <th style={{ textAlign: 'right' }}>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(e => {
                    const freq = EXPENSE_FREQUENCIES.find(f => f.key === e.frequency);
                    return (
                      <tr key={e.id}>
                        <td>{e.name}</td>
                        <td className="muted">{freq?.label ?? '—'}</td>
                        <td style={{ textAlign: 'right' }}>{fmtMoney(e.amount)}</td>
                        <td style={{ textAlign: 'right' }}>{fmtMoney(expenseMonthly(e))}</td>
                        <td style={{ textAlign: 'right' }}>{fmtMoney(expenseYearly(e))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {active.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          No active subscriptions. Add them in Expenses.
        </div>
      )}
    </div>
  );
}
