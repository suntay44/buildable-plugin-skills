# Mobile Fitness Tracker Template Plan

Use this planned template for local-first workout logging prototypes.

## Product Shape

A mobile fitness log for today's workout, exercise sets/reps, history, and simple progress feedback without wearables or accounts.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `today`: planned workout, set/reps entry, completion state, progress summary.
- `history`: past workouts, exercise summaries, empty state.

## Interaction Checklist

- Log a workout with exercises, sets, reps, and optional weight.
- Mark workout complete.
- Show history and progress summary.
- Keep sample data realistic and local.

## Validation Hints

- Do not add wearable integrations, accounts, or notifications unless requested.
- Run `buildable review` after implementation.
