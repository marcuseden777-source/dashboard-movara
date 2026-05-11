import { createClient } from '@/lib/supabase/server';
import type { Task } from '@/lib/types';
import Kanban from '@/components/Kanban';
import TasksClient from './TasksClient';

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from('tasks').select('*, projects(name, client_id, clients(name))').order('position'),
    supabase.from('projects').select('id, name').order('name'),
  ]);

  const ts = (tasks ?? []) as Task[];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <TasksClient projects={projects ?? []} />
      </div>
      <Kanban tasks={ts} />
    </div>
  );
}
