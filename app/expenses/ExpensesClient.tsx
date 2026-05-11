'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/Modal';
import { fmtMoney, expenseYearly, expenseMonthly } from '@/lib/finance';
import type { Expense, ExpenseKind, ExpenseFreq } from '@/lib/types';
import { EXPENSE_CATEGORIES, EXPENSE_FREQUENCIES } from '@/lib/types';

interface Props {
  mode: 'button' | 'table';
  expenses?: Expense[];
  projects: { id: string; name: string }[];
}

interface FormState {
  name: string;
  category: string;
  kind: ExpenseKind;
  amount: string;
  frequency: ExpenseFreq;
  start_date: string;
  end_date: string;
  expense_date: string;
  status: string;
  notes: string;
  project_id: string;
}

const BLANK: FormState = {
  name: '', category: EXPENSE_CATEGORIES[0], kind: 'subscription',
  amount: '', frequency: 'monthly', start_date: '', end_date: '',
  expense_date: '', status: 'active', notes: '', project_id: '',
};

export default function ExpensesClient({ mode, expenses = [], projects }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(BLANK);

  function openNew() { setForm(BLANK); setEditing(null); setOpen(true); }
  function openEdit(e: Expense) {
    setForm({
      name: e.name, category: e.category, kind: e.kind,
      amount: String(e.amount), frequency: (e.frequency ?? 'monthly') as ExpenseFreq,
      start_date: e.start_date ?? '', end_date: e.end_date ?? '',
      expense_date: e.expense_date ?? '', status: e.status,
      notes: e.notes ?? '', project_id: e.project_id ?? '',
    });
    setEditing(e);
    setOpen(true);
  }

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name, category: form.category,
      kind: form.kind, amount: parseFloat(form.amount) || 0,
      frequency: form.kind === 'subscription' ? form.frequency : null,
      start_date: form.start_date || null, end_date: form.end_date || null,
      expense_date: form.expense_date || null,
      status: form.status, notes: form.notes || null,
      project_id: form.project_id || null,
    };
    if (editing) {
      await supabase.from('expenses').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('expenses').insert(payload);
    }
    setOpen(false); setSaving(false); router.refresh();
  }

  async function del(id: string) {
    if (!confirm('Delete expense?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    router.refresh();
  }

  const modal = open && (
    <Modal title={editing ? 'Edit Expense' : 'New Expense'} onClose={() => setOpen(false)}>
      <form onSubmit={save}>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kind</label>
            <select className="form-input" value={form.kind} onChange={e => set('kind', e.target.value)}>
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
          {form.kind === 'subscription' && (
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select className="form-input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {EXPENSE_FREQUENCIES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
          )}
          {form.kind === 'one-time' && (
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} />
            </div>
          )}
        </div>
        {form.kind === 'subscription' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-input" value={form.project_id} onChange={e => set('project_id', e.target.value)}>
              <option value="">— None —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </Modal>
  );

  if (mode === 'button') {
    return <>{modal}<button className="btn btn-primary" onClick={openNew}>+ Add Expense</button></>;
  }

  return (
    <>
      {modal}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Kind</th>
              <th style={{ textAlign: 'right' }}>Monthly</th>
              <th style={{ textAlign: 'right' }}>Annual</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td className="muted">{e.category}</td>
                <td><span className="tag">{e.kind}</span></td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(expenseMonthly(e))}</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(expenseYearly(e))}</td>
                <td><span className={`tag tag-${e.status}`}>{e.status}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => del(e.id)}>×</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No expenses yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
