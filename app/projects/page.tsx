import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { fmtMoney } from '@/lib/finance';
import type { Project } from '@/lib/types';
import { STAGES } from '@/lib/types';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  const ps = (projects ?? []) as Project[];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <Link href="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      <div className="pipeline">
        {STAGES.map(stage => {
          const stageProjects = ps.filter(p => p.stage === stage);
          return (
            <div key={stage} className="pipeline-col">
              <div className="pipeline-col-header">
                <span>{stage}</span>
                <span className="pipeline-count">{stageProjects.length}</span>
              </div>
              {stageProjects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="pipeline-card">
                  <div className="pipeline-card-name">{p.name}</div>
                  <div className="pipeline-card-client">{p.clients?.name ?? '—'}</div>
                  <div className="pipeline-card-meta">
                    <span className="tag">{p.type}</span>
                    <span>{fmtMoney(p.value)}</span>
                  </div>
                </Link>
              ))}
              {stageProjects.length === 0 && (
                <div className="pipeline-empty">No projects</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
