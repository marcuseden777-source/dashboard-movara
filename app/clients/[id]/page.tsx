import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fmtMoney, fmtDate, initials, projectFinancials } from '@/lib/finance';
import type { Project, Document, Expense } from '@/lib/types';
import ClientForm from './ClientForm';

interface Props { params: Promise<{ id: string }> }

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  if (id === 'new') {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">New Client</h1>
          <Link href="/clients" className="btn btn-ghost">← Back</Link>
        </div>
        <div className="card" style={{ maxWidth: 560 }}>
          <ClientForm client={null} />
        </div>
      </div>
    );
  }

  const [
    { data: client },
    { data: projects },
    { data: docs },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('client_id', id).order('date', { ascending: false }),
    supabase.from('expenses').select('*'),
  ]);

  if (!client) notFound();

  const ps = (projects ?? []) as Project[];
  const ds = (docs ?? []) as Document[];
  const es = (expenses ?? []) as Expense[];

  const totalRevenue = ps.reduce((s, p) => {
    const f = projectFinancials(p, ds, es);
    return s + f.revenue;
  }, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="client-avatar client-avatar-lg">{initials(client.name)}</div>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{client.name}</h1>
            {client.company && <div className="muted">{client.company}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/clients" className="btn btn-ghost">← Back</Link>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="card">
            <h2 className="section-title">Details</h2>
            <ClientForm client={client} />
          </div>
        </div>

        <div>
          <div className="stats-grid stats-grid-2">
            <div className="stat-card">
              <div className="stat-label">Projects</div>
              <div className="stat-value">{ps.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{fmtMoney(totalRevenue)}</div>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 24 }}>
            <h2 className="section-title">Projects</h2>
            <Link href={`/projects/new?client_id=${id}`} className="btn btn-ghost btn-sm">+ Add</Link>
          </div>
          {ps.length === 0 ? (
            <div className="empty-state">No projects yet</div>
          ) : (
            <div className="list">
              {ps.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="list-row">
                  <div>
                    <div className="list-row-title">{p.name}</div>
                    <div className="muted">{p.stage} · {p.type}</div>
                  </div>
                  <span className="tag">{fmtMoney(p.value)}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="section-header" style={{ marginTop: 24 }}>
            <h2 className="section-title">Documents</h2>
          </div>
          {ds.length === 0 ? (
            <div className="empty-state">No documents</div>
          ) : (
            <div className="list">
              {ds.slice(0, 5).map(d => (
                <Link key={d.id} href={`/${d.kind === 'invoice' ? 'invoices' : 'quotations'}/${d.id}`} className="list-row">
                  <div>
                    <div className="list-row-title">#{d.number}</div>
                    <div className="muted">{fmtDate(d.date)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`tag tag-${d.status.toLowerCase()}`}>{d.status}</span>
                    <span>{fmtMoney(d.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
