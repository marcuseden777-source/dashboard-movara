'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fmtMoney } from '@/lib/finance';
import type { Document, DocKind, LineItem } from '@/lib/types';

interface Props {
  doc: Document | null;
  kind: DocKind;
  defaultNumber?: string;
  clients: { id: string; name: string }[];
  projects: { id: string; name: string; client_id: string }[];
  taxRate: number;
}

function blankItem(): LineItem { return { description: '', quantity: 1, rate: 0 }; }

export default function DocEditor({ doc, kind, defaultNumber = '', clients, projects, taxRate }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: doc?.client_id ?? (clients[0]?.id ?? ''),
    project_id: doc?.project_id ?? '',
    number: doc?.number ?? defaultNumber,
    date: doc?.date ?? new Date().toISOString().split('T')[0],
    due_date: doc?.due_date ?? '',
    status: doc?.status ?? (kind === 'quotation' ? 'Draft' : 'Draft'),
    notes: doc?.notes ?? '',
    tax_rate: doc?.tax_rate ?? taxRate,
  });
  const [items, setItems] = useState<LineItem[]>(doc?.items?.length ? doc.items : [blankItem()]);

  function setField(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function setItem(i: number, field: keyof LineItem, value: string | number) {
    setItems(items => items.map((it, idx) =>
      idx === i ? { ...it, [field]: field === 'description' ? value : Number(value) } : it
    ));
  }

  function addItem() { setItems(its => [...its, blankItem()]); }
  function removeItem(i: number) { setItems(its => its.filter((_, idx) => idx !== i)); }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const tax = subtotal * (Number(form.tax_rate) / 100);
  const total = subtotal + tax;

  const filteredProjects = projects.filter(p => !form.client_id || p.client_id === form.client_id);

  const STATUS_OPTIONS = kind === 'quotation'
    ? ['Draft', 'Sent', 'Accepted', 'Rejected']
    : ['Draft', 'Sent', 'Paid', 'Overdue'];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      kind, client_id: form.client_id, project_id: form.project_id || null,
      number: form.number, date: form.date, due_date: form.due_date || null,
      status: form.status as Document['status'], notes: form.notes || null,
      tax_rate: Number(form.tax_rate), items,
      subtotal, tax, total,
    };
    if (doc) {
      await supabase.from('documents').update(payload).eq('id', doc.id);
      router.refresh();
    } else {
      const { data } = await supabase.from('documents').insert(payload).select('id').single();
      router.push(`/${kind === 'invoice' ? 'invoices' : 'quotations'}/${data?.id}`);
    }
    setSaving(false);
  }

  async function del() {
    if (!doc || !confirm('Delete this document?')) return;
    await supabase.from('documents').delete().eq('id', doc.id);
    router.push(kind === 'invoice' ? '/invoices' : '/quotations');
  }

  return (
    <div className="card">
      <form onSubmit={save}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Client *</label>
            <select className="form-input" value={form.client_id} onChange={e => setField('client_id', e.target.value)} required>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-input" value={form.project_id} onChange={e => setField('project_id', e.target.value)}>
              <option value="">— None —</option>
              {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Number</label>
            <input className="form-input" value={form.number} onChange={e => setField('number', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={form.due_date} onChange={e => setField('due_date', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => setField('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tax Rate (%)</label>
            <input className="form-input" type="number" min="0" step="0.1" value={form.tax_rate}
              onChange={e => setField('tax_rate', e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="section-header">
            <h3 className="section-title">Line Items</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="line-item-row">
              <input className="form-input" style={{ flex: 3 }} placeholder="Description"
                value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
              <input className="form-input" style={{ width: 70 }} type="number" min="1" placeholder="Qty"
                value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} />
              <input className="form-input" style={{ width: 100 }} type="number" min="0" step="0.01" placeholder="Rate"
                value={item.rate} onChange={e => setItem(i, 'rate', e.target.value)} />
              <span style={{ width: 90, textAlign: 'right' }}>{fmtMoney(item.quantity * item.rate)}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(i)}>×</button>
            </div>
          ))}
          <div className="doc-totals" style={{ marginTop: 8 }}>
            <div className="doc-total-row"><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
            {Number(form.tax_rate) > 0 && (
              <div className="doc-total-row"><span>Tax ({form.tax_rate}%)</span><span>{fmtMoney(tax)}</span></div>
            )}
            <div className="doc-total-row doc-grand-total"><span>Total</span><span>{fmtMoney(total)}</span></div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows={2} value={form.notes} onChange={e => setField('notes', e.target.value)} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : doc ? 'Save Changes' : `Create ${kind === 'invoice' ? 'Invoice' : 'Quotation'}`}
          </button>
          {doc && <button type="button" className="btn btn-danger" onClick={del}>Delete</button>}
        </div>
      </form>
    </div>
  );
}
