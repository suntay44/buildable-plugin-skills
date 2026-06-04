"use client";

import { useMemo, useState } from "react";
import { TaskComposer } from "@/components/task-composer";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { TaskSummary } from "@/components/task-summary";
import { sampleTasks } from "@/lib/sample-tasks";
import { filterTasks } from "@/lib/task-utils";
import type { Task, TaskFilters as TaskFilterState } from "@/types/task";

const defaultFilters: TaskFilterState = {
  status: "all",
  priority: "all",
  query: ""
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [filters, setFilters] = useState<TaskFilterState>(defaultFilters);

  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  function updateTask(nextTask: Task) {
    setTasks((current) => current.map((task) => (task.id === nextTask.id ? nextTask : task)));
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-meadow">Local-first prototype</p>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">TaskFlow</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Capture work, filter what matters, and keep the core task lifecycle visible without accounts, services, or setup.
              </p>
            </div>
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-meadow">
              {visibleTasks.length} visible of {tasks.length} tasks
            </p>
          </div>
        </header>

        <TaskSummary tasks={tasks} />

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="grid min-w-0 gap-4">
            <TaskComposer onCreate={(task) => setTasks((current) => [task, ...current])} />
            <TaskFilters filters={filters} onChange={setFilters} />
          </div>
          <TaskList
            tasks={visibleTasks}
            allTasksCount={tasks.length}
            filters={filters}
            onUpdate={updateTask}
            onDelete={(id) => setTasks((current) => current.filter((task) => task.id !== id))}
            onClearFilters={() => setFilters(defaultFilters)}
          />
        </div>
      </div>
    </main>
  );
}
