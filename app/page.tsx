import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import {
  totalProjectMRR, totalMonthlySubs, fmtMoney, revenueInRange, periodPresets,
} from '@/lib/finance';
import type { Project, Expense, Document } from '@/lib/types';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: projects },
    { data: expenses },
    { data: docs },
    { data: tasks },
    { data: focus },
  ] = await Promise.all([
    supabase.from('projects').select('*, clients(name)'),
    supabase.from('expenses').select('*'),
    supabase.from('documents').select('*'),
    supabase.from('tasks').select('*').in('status', ['todo', 'in_progress', 'review']).order('due_date', { ascending: true }).limit(8),
    supabase.from('weekly_focus').select('*').order('position'),
  ]);

  const ps = (projects ?? []) as Project[];
  const es = (expenses ?? []) as Expense[];
  const ds = (docs ?? []) as Document[];
  const presets = periodPresets();
  const { from, to } = presets['this-month'];

  const mrr = totalProjectMRR(ps);
  const monthlyCost = totalMonthlySubs(es);
  const monthRevenue = revenueInRange(ps, ds, from, to);
  const activeProjects = ps.filter(p => !['Lead'].includes(p.stage)).length;
  const overdueInvoices = ds.filter(d => d.kind === 'invoice' && d.status === 'Overdue');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="MRR" value={fmtMoney(mrr)} sub="active retainers" />
        <StatCard label="This Month Revenue" value={fmtMoney(monthRevenue)} />
        <StatCard label="Monthly Costs" value={fmtMoney(monthlyCost)} sub="subscriptions" />
        <StatCard label="Net (Month)" value={fmtMoney(monthRevenue - monthlyCost)}
          trend={monthRevenue >= monthlyCost ? 'up' : 'down'} />
        <StatCard label="Active Projects" value={activeProjects} />
        <StatCard label="Overdue Invoices" value={overdueInvoices.length}
          sub={overdueInvoices.length > 0 ? fmtMoney(overdueInvoices.reduce((s, d) => s + d.total, 0)) : undefined}
          trend={overdueInvoices.length > 0 ? 'down' : 'neutral'} />
      </div>

      <div className="two-col">
        <div>
          <div className="section-header">
            <h2 className="section-title">Open Tasks</h2>
            <Link href="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <div className="task-list">
              {tasks.map(t => (
                <div key={t.id} className="task-row">
                  <span className={`priority-dot priority-${(t.priority ?? 'Low').toLowerCase()}`} />
                  <div className="task-row-main">
                    <div className="task-row-title">{t.title}</div>
                    {t.due_date && <div className="task-row-due">Due {t.due_date}</div>}
                  </div>
                  <span className={`tag tag-${t.status}`}>{t.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No open tasks</div>
          )}
        </div>

        <div>
          <div className="section-header">
            <h2 className="section-title">Weekly Focus</h2>
          </div>
          {focus && focus.length > 0 ? (
            <div className="focus-list">
              {focus.map(f => (
                <div key={f.id} className={`focus-item${f.done ? ' done' : ''}`}>
                  {f.done ? '✓' : '○'} {f.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No focus items this week</div>
          )}

          <div className="section-header" style={{ marginTop: 24 }}>
            <h2 className="section-title">Overdue Invoices</h2>
            <Link href="/invoices" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {overdueInvoices.length > 0 ? (
            <div className="task-list">
              {overdueInvoices.slice(0, 5).map(d => (
                <div key={d.id} className="task-row">
                  <div className="task-row-main">
                    <div className="task-row-title">#{d.number} – {d.clients?.name ?? '—'}</div>
                    <div className="task-row-due">Due {d.due_date}</div>
                  </div>
                  <span className="tag tag-danger">{fmtMoney(d.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No overdue invoices</div>
          )}
        </div>
      </div>
    </div>
  );
}
