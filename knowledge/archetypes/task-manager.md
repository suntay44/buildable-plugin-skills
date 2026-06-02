# Task Manager Archetype

## Purpose

A task manager helps a user capture, organize, prioritize, and complete work.

## Default Target

Web unless the prompt clearly asks for a mobile app.

## Default Screens

- `dashboard`: task creation, task list, search, filters, status summary, and empty state.

Optional screens only when requested:

- `task-detail`
- `calendar`
- `settings`
- `team`

## Default Entity

```ts
type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
  createdAt: string;
};
```

## Required Interactions

- create a task
- edit a task
- delete a task
- mark complete
- reopen completed task
- filter by status
- search by title or description
- show an empty state when filters match no tasks
- preserve a clear visual distinction between active and completed work

## Useful Refinements

- priority grouping
- due-soon section
- quick stats
- inline editing for simple changes
- tags or categories

## Do Not Add Unless Requested

- user accounts
- teams or collaboration
- database
- notifications
- calendar sync
- billing
- deployment

## Acceptance Criteria

- The first screen is useful without setup.
- Sample tasks demonstrate different statuses, priorities, due dates, and tags.
- A new task can be created with accessible inputs.
- Existing tasks can be edited and deleted.
- Completing a task updates visible stats and list state.
- Filters and search can combine without breaking the empty state.
- The layout works well on mobile and desktop.

