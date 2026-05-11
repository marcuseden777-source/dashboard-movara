'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/Modal';
import { PRIORITIES, TASK_STATUSES } from '@/lib/types';

interface Props {
  projects: { id: string; name: string }[];
}

export default function TasksClient({ projects }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    project_id: '',
    status: 'todo' as string,
    priority: 'Medium' as string,
    due_date: '',
    description: '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('tasks').insert({
      title: form.title,
      project_id: form.project_id || null,
      status: form.status as 'todo',
      priority: form.priority as 'Medium',
      due_date: form.due_date || null,
      description: form.description || null,
      notes: null,
      position: 0,
    });
    setOpen(false);
    setForm({ title: '', project_id: '', status: 'todo', priority: 'Medium', due_date: '', description: '' });
    setSaving(false);
    router.refresh();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Task</button>
      {open && (
        <Modal title="New Task" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-input" value={form.project_id} onChange={e => set('project_id', e.target.value)}>
                  <option value="">— None —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {TASK_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create Task'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
