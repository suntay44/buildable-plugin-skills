# Web Task Manager Golden Template Plan

This is the first golden template target for Buildable. It should become a runnable Next.js, TypeScript, and Tailwind CSS starter.

## Product Shape

One polished dashboard that supports the complete task lifecycle locally.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  task-composer.tsx
  task-list.tsx
  task-card.tsx
  task-filters.tsx
  task-summary.tsx
lib/
  sample-tasks.ts
  task-utils.ts
types/
  task.ts
```

## Required Features

- create task
- edit task
- delete task
- complete and reopen task
- filter by status
- filter by priority
- search tasks
- show filtered empty state
- show first-use empty state when all tasks are removed
- responsive mobile and desktop layout

## Sample Data

Include 5 to 7 tasks spanning:

- todo, in-progress, and done
- low, medium, and high priority
- overdue, due today, and later due dates
- at least 3 tags

## UI Layout

Desktop:

- header with app name, concise summary, and primary action area
- left/main column for task composer and task list
- right/support column for stats and filters, if screen width permits

Mobile:

- summary and composer first
- filters in a compact segmented/select layout
- task cards stacked with visible actions

## Validation Hints

- Run typecheck/build.
- Verify the default screen has no placeholder-only content.
- Verify all actions update visible state.
- Verify active filters produce a helpful empty state.

