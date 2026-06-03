import type { Task, TaskFilters, TaskPriority, TaskStatus } from "@/types/task";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done"
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export const priorityColors: Record<TaskPriority, string> = {
  low: "#2f8f6f",
  medium: "#c98a24",
  high: "#d95f43"
};

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  const query = filters.query.trim().toLowerCase();
  return tasks.filter((task) => {
    const statusMatch = filters.status === "all" || task.status === filters.status;
    const priorityMatch = filters.priority === "all" || task.priority === filters.priority;
    const queryMatch = query.length === 0 || task.title.toLowerCase().includes(query) || task.notes.toLowerCase().includes(query);
    return statusMatch && priorityMatch && queryMatch;
  });
}

export function taskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    active: tasks.filter((task) => task.status !== "done").length,
    done: tasks.filter((task) => task.status === "done").length
  };
}

export function nextStatus(status: TaskStatus): TaskStatus {
  return status === "done" ? "todo" : "done";
}

export function createTaskId() {
  return `task-${Date.now().toString(36)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
