# Mobile Subscription Tracker Template Plan

Use this planned template for local-first subscription and renewal tracking prototypes.

## Product Shape

A mobile tracker for recurring services, renewal timing, monthly cost summaries, category filtering, and cancellation notes without payment collection.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `subscriptions`: renewal summary, grouped list, category/status filters.
- `renewal detail`: service cost, billing period, renewal date, notes, status.

## Interaction Checklist

- Add or edit a subscription locally.
- Filter by category or renewal timing.
- Summarize recurring cost.
- Show empty subscription state.

## Validation Hints

- Do not add payment collection, cancellation automation, bank sync, or email reminders unless requested.
- Run `buildable review` after implementation.
