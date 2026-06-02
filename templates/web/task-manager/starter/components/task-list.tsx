"use client";

import { TaskCard } from "@/components/task-card";
import type { Task, TaskFilters } from "@/types/task";

type Props = {
  tasks: Task[];
  allTasksCount: number;
  filters: TaskFilters;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
};

export function TaskList({ tasks, allTasksCount, filters, onUpdate, onDelete, onClearFilters }: Props) {
  const filtered = filters.query || filters.status !== "all" || filters.priority !== "all";

  if (allTasksCount === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        body="Create your first task above. Buildable templates include this state so generated apps do not feel unfinished after data changes."
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match these filters"
        body="Clear the active search or filters to return to your full task list."
        action={filtered ? <button onClick={onClearFilters} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">Clear filters</button> : null}
      />
    );
  }

  return (
    <section aria-label="Tasks" className="grid gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </section>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
