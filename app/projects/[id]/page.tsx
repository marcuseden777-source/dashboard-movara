import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fmtMoney, fmtDate, projectFinancials } from '@/lib/finance';
import type { Document, Expense } from '@/lib/types';
import ProjectForm from './ProjectForm';

interface Props { params: Promise<{ id: string }> }

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  if (id === 'new') {
    const { data: clients } = await supabase.from('clients').select('id, name').order('name');
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">New Project</h1>
          <Link href="/projects" className="btn btn-ghost">← Back</Link>
        </div>
        <div className="card" style={{ maxWidth: 640 }}>
          <ProjectForm project={null} clients={clients ?? []} />
        </div>
      </div>
    );
  }

  const [
    { data: project },
    { data: clients },
    { data: tasks },
    { data: docs },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('projects').select('*, clients(name)').eq('id', id).single(),
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('tasks').select('*').eq('project_id', id).order('position'),
    supabase.from('documents').select('*, clients(name)').eq('project_id', id).order('date', { ascending: false }),
    supabase.from('expenses').select('*'),
  ]);

  if (!project) notFound();

  const ds = (docs ?? []) as Document[];
  const es = (expenses ?? []) as Expense[];
  const fin = projectFinancials(project, ds, es);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <div className="muted">{project.clients?.name ?? '—'} · {project.stage}</div>
        </div>
        <Link href="/projects" className="btn btn-ghost">← Back</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">{fmtMoney(fin.revenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Costs</div>
          <div className="stat-value">{fmtMoney(fin.allocatedCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Profit</div>
          <div className="stat-value">{fmtMoney(fin.profit)}</div>
        </div>
        {fin.roi != null && (
          <div className="stat-card">
            <div className="stat-label">ROI</div>
            <div className="stat-value">{fin.roi.toFixed(0)}%</div>
          </div>
        )}
      </div>

      <div className="two-col">
        <div className="card">
          <h2 className="section-title">Project Details</h2>
          <ProjectForm project={project} clients={clients ?? []} />
        </div>

        <div>
          <div className="section-header">
            <h2 className="section-title">Tasks ({tasks?.length ?? 0})</h2>
            <Link href={`/tasks?project_id=${id}`} className="btn btn-ghost btn-sm">View in Kanban →</Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <div className="list">
              {tasks.map(t => (
                <div key={t.id} className="list-row">
                  <div>
                    <div className="list-row-title">{t.title}</div>
                    {t.due_date && <div className="muted">{fmtDate(t.due_date)}</div>}
                  </div>
                  <span className={`tag tag-${t.status}`}>{t.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No tasks</div>
          )}

          <div className="section-header" style={{ marginTop: 24 }}>
            <h2 className="section-title">Documents</h2>
          </div>
          {ds.length > 0 ? (
            <div className="list">
              {ds.map(d => (
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
          ) : (
            <div className="empty-state">No documents</div>
          )}
        </div>
      </div>
    </div>
  );
}
