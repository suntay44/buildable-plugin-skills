export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
};

export type TaskFilters = {
  status: "all" | TaskStatus;
  priority: "all" | TaskPriority;
  query: string;
};
