import type { TaskFilters, TaskPriority, TaskStatus } from "@/types/task";
import { priorityLabels, statusLabels } from "@/lib/task-utils";

type Props = {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
};

export function TaskFilters({ filters, onChange }: Props) {
  return (
    <section aria-label="Task filters" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search title, description, or tag"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as TaskFilters["status"] })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            <option value="all">All</option>
            {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Priority
          <select
            value={filters.priority}
            onChange={(event) => onChange({ ...filters, priority: event.target.value as TaskFilters["priority"] })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            <option value="all">All</option>
            {(Object.keys(priorityLabels) as TaskPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
