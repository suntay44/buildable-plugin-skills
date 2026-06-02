import { taskStats } from "@/lib/task-utils";
import type { Task } from "@/types/task";

export function TaskSummary({ tasks }: { tasks: Task[] }) {
  const stats = taskStats(tasks);
  const items = [
    ["Total", stats.total],
    ["Active", stats.active],
    ["Done", stats.completed],
    ["Overdue", stats.overdue]
  ];

  return (
    <section aria-label="Task summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
      ))}
    </section>
  );
}
