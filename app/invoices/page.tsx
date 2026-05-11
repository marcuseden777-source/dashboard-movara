import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { fmtMoney, fmtDate } from '@/lib/finance';
import type { Document } from '@/lib/types';

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from('documents')
    .select('*, clients(name), projects(name)')
    .eq('kind', 'invoice')
    .order('date', { ascending: false });

  const ds = (docs ?? []) as Document[];
  const outstanding = ds.filter(d => d.status !== 'Paid').reduce((s, d) => s + d.total, 0);
  const paid = ds.filter(d => d.status === 'Paid').reduce((s, d) => s + d.total, 0);

  const STATUS_COLORS: Record<string, string> = {
    Draft: 'muted', Sent: 'info', Paid: 'success', Overdue: 'danger',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <Link href="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmtMoney(outstanding)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid (All Time)</div>
          <div className="stat-value">{fmtMoney(paid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{ds.length}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Project</th>
              <th>Date</th>
              <th>Due</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ds.map(d => (
              <tr key={d.id}>
                <td><Link href={`/invoices/${d.id}`} className="link">#{d.number}</Link></td>
                <td>{d.clients?.name ?? '—'}</td>
                <td className="muted">{d.projects?.name ?? '—'}</td>
                <td className="muted">{fmtDate(d.date)}</td>
                <td className="muted">{fmtDate(d.due_date)}</td>
                <td><span className={`tag tag-${STATUS_COLORS[d.status] ?? ''}`}>{d.status}</span></td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(d.total)}</td>
                <td><Link href={`/invoices/${d.id}`} className="btn btn-ghost btn-sm">View</Link></td>
              </tr>
            ))}
            {ds.length === 0 && (
              <tr><td colSpan={8} className="empty-state">No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
