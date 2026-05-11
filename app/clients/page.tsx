import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { initials } from '@/lib/finance';
import type { Client } from '@/lib/types';

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  const rows = (clients ?? []) as Client[];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <Link href="/clients/new" className="btn btn-primary">+ Add Client</Link>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">●</div>
          <div className="empty-title">No clients yet</div>
          <div className="empty-sub">Add your first client to get started</div>
          <Link href="/clients/new" className="btn btn-primary">+ Add Client</Link>
        </div>
      ) : (
        <div className="card-grid">
          {rows.map(c => (
            <Link key={c.id} href={`/clients/${c.id}`} className="client-card">
              <div className="client-avatar">{initials(c.name)}</div>
              <div className="client-info">
                <div className="client-name">{c.name}</div>
                {c.company && <div className="client-company">{c.company}</div>}
                {c.email && <div className="client-email">{c.email}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
