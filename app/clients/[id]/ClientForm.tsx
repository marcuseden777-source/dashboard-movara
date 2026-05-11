'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Client } from '@/lib/types';

interface Props { client: Client | null }

export default function ClientForm({ client }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    notes: client?.notes ?? '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
    };
    if (client) {
      await supabase.from('clients').update(payload).eq('id', client.id);
      router.refresh();
    } else {
      const { data } = await supabase.from('clients').insert(payload).select('id').single();
      router.push(`/clients/${data?.id}`);
    }
    setSaving(false);
  }

  async function del() {
    if (!client || !confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', client.id);
    router.push('/clients');
  }

  return (
    <form onSubmit={save}>
      <div className="form-group">
        <label className="form-label">Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Company</label>
        <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : client ? 'Save Changes' : 'Create Client'}
        </button>
        {client && (
          <button type="button" className="btn btn-danger" onClick={del}>Delete</button>
        )}
      </div>
    </form>
  );
}
