import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DocPreview from '@/components/DocPreview';
import DocEditor from '@/app/quotations/[id]/DocEditor';
import type { Document } from '@/lib/types';

interface Props { params: Promise<{ id: string }> }

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: settings }, { data: clients }, { data: projects }] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('projects').select('id, name, client_id').order('name'),
  ]);

  if (id === 'new') {
    const counter = (settings?.invoice_counter ?? 0) + 1;
    const number = `${settings?.invoice_prefix ?? 'INV'}-${String(counter).padStart(4, '0')}`;
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">New Invoice</h1>
          <Link href="/invoices" className="btn btn-ghost">← Back</Link>
        </div>
        <DocEditor
          doc={null} kind="invoice" defaultNumber={number}
          clients={clients ?? []} projects={projects ?? []}
          taxRate={settings?.tax_rate ?? 0}
        />
      </div>
    );
  }

  const { data: doc } = await supabase
    .from('documents')
    .select('*, clients(name), projects(name)')
    .eq('id', id)
    .single();

  if (!doc) notFound();
  const d = doc as Document;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice #{d.number}</h1>
          <div className="muted">{d.clients?.name ?? '—'}</div>
        </div>
        <Link href="/invoices" className="btn btn-ghost">← Back</Link>
      </div>

      <div className="two-col">
        <DocEditor
          doc={d} kind="invoice"
          clients={clients ?? []} projects={projects ?? []}
          taxRate={settings?.tax_rate ?? 0}
        />
        <div className="card">
          <DocPreview
            doc={d}
            companyName={settings?.company_name ?? 'Your Agency'}
            clientName={d.clients?.name ?? '—'}
          />
        </div>
      </div>
    </div>
  );
}
