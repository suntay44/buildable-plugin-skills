# Mobile Task Manager Golden Template Plan

## Product Shape

A compact mobile task manager focused on today's work and quick task actions.

## Proposed File Structure

```txt
app/
  _layout.tsx
  index.tsx
components/
  quick-task-input.tsx
  task-card.tsx
  task-filter-bar.tsx
  task-summary.tsx
lib/
  sample-tasks.ts
  task-utils.ts
types/
  task.ts
```

## Required Features

- quick task creation
- complete and reopen task
- edit task
- delete task
- filter by status and priority
- empty and filtered empty states

## Validation Hints

- Actions are visible and tappable.
- Text does not overflow task cards.
- No notifications, sync, or accounts unless requested.

