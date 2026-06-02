# Task Manager Data Model

## Entity: Task

```ts
type TaskStatus = "todo" | "in-progress" | "done";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
```

## Local State Operations

- `createTask(input)`
- `updateTask(id, patch)`
- `deleteTask(id)`
- `completeTask(id)`
- `reopenTask(id)`
- `filterTasks(tasks, filters)`
- `searchTasks(tasks, query)`

## Derived Values

- total tasks
- completed tasks
- active tasks
- overdue tasks
- due today tasks
- high-priority active tasks

## Sample Data Requirements

- Include realistic task titles.
- Include varied statuses and priorities.
- Include due dates that exercise overdue, today, and upcoming states.
- Include enough tags to make filtering feel real.

