'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Task } from '@/lib/types';
import { TASK_STATUSES } from '@/lib/types';
import { fmtDate } from '@/lib/finance';

const PRIORITY_COLOR: Record<string, string> = {
  Low: 'var(--muted)',
  Medium: 'var(--warning)',
  High: 'var(--danger)',
};

interface KanbanProps {
  tasks: Task[];
}

export default function Kanban({ tasks }: KanbanProps) {
  const router = useRouter();
  const supabase = createClient();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  async function moveTask(taskId: string, newStatus: Task['status']) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    router.refresh();
  }

  function onDragStart(e: React.DragEvent, taskId: string) {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, colKey: string) {
    e.preventDefault();
    setOver(colKey);
  }

  async function onDrop(e: React.DragEvent, colKey: Task['status']) {
    e.preventDefault();
    if (dragging) {
      await moveTask(dragging, colKey);
    }
    setDragging(null);
    setOver(null);
  }

  return (
    <div className="kanban">
      {TASK_STATUSES.map(({ key, label }) => {
        const colTasks = tasks.filter((t) => t.status === key);
        return (
          <div
            key={key}
            className={`kanban-col${over === key ? ' kanban-col-over' : ''}`}
            onDragOver={(e) => onDragOver(e, key)}
            onDrop={(e) => onDrop(e, key)}
            onDragLeave={() => setOver(null)}
          >
            <div className="kanban-col-header">
              <span>{label}</span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            {colTasks.map((task) => (
              <div
                key={task.id}
                className="kanban-card"
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
              >
                <div className="kanban-card-title">{task.title}</div>
                {task.due_date && (
                  <div className="kanban-card-due">{fmtDate(task.due_date)}</div>
                )}
                {task.priority && (
                  <span
                    className="tag"
                    style={{ color: PRIORITY_COLOR[task.priority], borderColor: PRIORITY_COLOR[task.priority] }}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
