import { createClient } from '@/lib/supabase/server';
import { fmtMoney, projectFinancials } from '@/lib/finance';
import type { Project, Document, Expense } from '@/lib/types';
import Link from 'next/link';

export default async function RoiPage() {
  const supabase = await createClient();
  const [{ data: projects }, { data: docs }, { data: expenses }] = await Promise.all([
    supabase.from('projects').select('*, clients(name)'),
    supabase.from('documents').select('*'),
    supabase.from('expenses').select('*'),
  ]);

  const ps = (projects ?? []) as Project[];
  const ds = (docs ?? []) as Document[];
  const es = (expenses ?? []) as Expense[];

  const rows = ps
    .map(p => ({ p, fin: projectFinancials(p, ds, es) }))
    .sort((a, b) => (b.fin.roi ?? 0) - (a.fin.roi ?? 0));

  const totalRevenue = rows.reduce((s, r) => s + r.fin.revenue, 0);
  const totalCosts = rows.reduce((s, r) => s + r.fin.allocatedCost, 0);
  const totalProfit = totalRevenue - totalCosts;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Project ROI</h1>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Billing</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'right' }}>Costs</th>
              <th style={{ textAlign: 'right' }}>Profit</th>
              <th style={{ textAlign: 'right' }}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, fin }) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/projects/${p.id}`} className="link">{p.name}</Link>
                </td>
                <td className="muted">{p.clients?.name ?? '—'}</td>
                <td><span className="tag">{p.billing_type}</span></td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(fin.revenue)}</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(fin.allocatedCost)}</td>
                <td style={{ textAlign: 'right', color: fin.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {fmtMoney(fin.profit)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {fin.roi != null ? (
                    <span style={{ color: fin.roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {fin.roi.toFixed(0)}%
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No projects yet</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="table-grand-total">
                <td colSpan={3}>Total</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(totalRevenue)}</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(totalCosts)}</td>
                <td style={{ textAlign: 'right', color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {fmtMoney(totalProfit)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {totalCosts > 0 ? `${((totalProfit / totalCosts) * 100).toFixed(0)}%` : '—'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
