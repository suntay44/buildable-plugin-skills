import type { Task, TaskFilters, TaskPriority, TaskStatus } from "@/types/task";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done"
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    const statusMatch = filters.status === "all" || task.status === filters.status;
    const priorityMatch = filters.priority === "all" || task.priority === filters.priority;
    const queryMatch =
      query.length === 0 ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query));

    return statusMatch && priorityMatch && queryMatch;
  });
}

export function taskStats(tasks: Task[]) {
  const today = "2026-06-01";

  return {
    total: tasks.length,
    active: tasks.filter((task) => task.status !== "done").length,
    completed: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter((task) => task.status !== "done" && task.dueDate !== null && task.dueDate < today).length
  };
}

export function createTaskId() {
  return `task-${Date.now().toString(36)}`;
}
