import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { fmtMoney, fmtDate } from '@/lib/finance';
import type { Document } from '@/lib/types';

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from('documents')
    .select('*, clients(name), projects(name)')
    .eq('kind', 'quotation')
    .order('date', { ascending: false });

  const ds = (docs ?? []) as Document[];

  const STATUS_COLORS: Record<string, string> = {
    Draft: 'muted', Sent: 'info', Accepted: 'success', Rejected: 'danger',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Quotations</h1>
        <Link href="/quotations/new" className="btn btn-primary">+ New Quotation</Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Project</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ds.map(d => (
              <tr key={d.id}>
                <td><Link href={`/quotations/${d.id}`} className="link">#{d.number}</Link></td>
                <td>{d.clients?.name ?? '—'}</td>
                <td className="muted">{d.projects?.name ?? '—'}</td>
                <td className="muted">{fmtDate(d.date)}</td>
                <td><span className={`tag tag-${STATUS_COLORS[d.status] ?? ''}`}>{d.status}</span></td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(d.total)}</td>
                <td><Link href={`/quotations/${d.id}`} className="btn btn-ghost btn-sm">View</Link></td>
              </tr>
            ))}
            {ds.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No quotations yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
