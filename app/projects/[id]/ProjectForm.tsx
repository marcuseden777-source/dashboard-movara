'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';
import { STAGES, PROJECT_TYPES, PRIORITIES } from '@/lib/types';

interface Props {
  project: Project | null;
  clients: { id: string; name: string }[];
}

export default function ProjectForm({ project, clients }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: project?.name ?? '',
    client_id: project?.client_id ?? (clients[0]?.id ?? ''),
    type: project?.type ?? 'Website',
    stage: project?.stage ?? 'Lead',
    billing_type: project?.billing_type ?? 'one-time',
    value: String(project?.value ?? ''),
    one_time_value: String(project?.one_time_value ?? ''),
    description: project?.description ?? '',
    retainer_start: project?.retainer_start ?? '',
    retainer_end: project?.retainer_end ?? '',
    retainer_status: project?.retainer_status ?? 'active',
    start_date: project?.start_date ?? '',
    due_date: project?.due_date ?? '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      client_id: form.client_id,
      type: form.type as Project['type'],
      stage: form.stage as Project['stage'],
      billing_type: form.billing_type as Project['billing_type'],
      value: parseFloat(form.value) || 0,
      one_time_value: parseFloat(form.one_time_value) || 0,
      description: form.description || null,
      retainer_start: form.retainer_start || null,
      retainer_end: form.retainer_end || null,
      retainer_status: form.retainer_status as Project['retainer_status'],
      start_date: form.start_date || null,
      due_date: form.due_date || null,
    };
    if (project) {
      await supabase.from('projects').update(payload).eq('id', project.id);
      router.refresh();
    } else {
      const { data } = await supabase.from('projects').insert(payload).select('id').single();
      router.push(`/projects/${data?.id}`);
    }
    setSaving(false);
  }

  async function del() {
    if (!project || !confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', project.id);
    router.push('/projects');
  }

  const showRetainer = form.billing_type === 'retainer-monthly' || form.billing_type === 'hybrid';

  return (
    <form onSubmit={save}>
      <div className="form-group">
        <label className="form-label">Project Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Client *</label>
          <select className="form-input" value={form.client_id} onChange={e => set('client_id', e.target.value)} required>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Stage</label>
          <select className="form-input" value={form.stage} onChange={e => set('stage', e.target.value)}>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Billing Type</label>
          <select className="form-input" value={form.billing_type} onChange={e => set('billing_type', e.target.value)}>
            <option value="one-time">One-time</option>
            <option value="retainer-monthly">Retainer (Monthly)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{showRetainer ? 'Monthly Value' : 'Value'}</label>
          <input className="form-input" type="number" min="0" step="0.01"
            value={form.value} onChange={e => set('value', e.target.value)} />
        </div>
        {form.billing_type === 'hybrid' && (
          <div className="form-group">
            <label className="form-label">One-time Value</label>
            <input className="form-input" type="number" min="0" step="0.01"
              value={form.one_time_value} onChange={e => set('one_time_value', e.target.value)} />
          </div>
        )}
      </div>
      {showRetainer && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Retainer Start</label>
            <input className="form-input" type="date" value={form.retainer_start} onChange={e => set('retainer_start', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Retainer End</label>
            <input className="form-input" type="date" value={form.retainer_end} onChange={e => set('retainer_end', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.retainer_status} onChange={e => set('retainer_status', e.target.value)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input className="form-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : project ? 'Save Changes' : 'Create Project'}
        </button>
        {project && (
          <button type="button" className="btn btn-danger" onClick={del}>Delete</button>
        )}
      </div>
    </form>
  );
}
