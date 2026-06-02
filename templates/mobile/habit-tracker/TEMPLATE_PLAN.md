# Mobile Habit Tracker Golden Template Plan

## Product Shape

A daily-use mobile utility for checking off habits and seeing progress.

## Proposed File Structure

```txt
app/
  _layout.tsx
  index.tsx
  progress.tsx
components/
  habit-card.tsx
  habit-composer.tsx
  progress-grid.tsx
  streak-summary.tsx
lib/
  sample-habits.ts
  habit-utils.ts
types/
  habit.ts
```

## Required Features

- today's habit list
- complete/uncomplete habit
- create habit
- current streak summary
- weekly progress grid
- first-use empty state

## Validation Hints

- Touch targets are comfortable.
- Check-in state changes are obvious.
- No push notifications or account sync unless requested.

