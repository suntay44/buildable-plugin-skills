# Mobile Field Service Template Plan

Use this planned template for local-first technician workflow prototypes.

## Product Shape

A mobile operations app for today's jobs, customer context, status updates, and job notes without routing, payments, or dispatch integrations.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `jobs`: today's jobs, time windows, priority/status filters, empty-day state.
- `job detail`: customer, service type, location text, notes, and status controls.

## Interaction Checklist

- Filter jobs by status or priority.
- Inspect job details.
- Update job status locally.
- Show empty-day and completed-job states.

## Validation Hints

- Do not add GPS routing, customer messaging, payments, signatures, or dispatch integrations unless requested.
- Run `buildable review` after implementation.
