# Mobile Meal Planner Template Plan

Use this planned template for local-first weekly meal planning prototypes.

## Product Shape

A mobile meal planning app with a weekly plan, recipe cards, and grocery list generation using local/mock data.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `week plan`: days, meals, recipe cards, grocery summary.
- `recipe detail`: ingredients, prep notes, assigned days, grocery toggle.

## Interaction Checklist

- Assign meals to days.
- View recipe details.
- Build a local grocery list from planned meals.
- Show empty week and empty grocery states.

## Validation Hints

- Do not add nutrition APIs, grocery delivery integrations, or database persistence unless requested.
- Run `buildable review` after implementation.
