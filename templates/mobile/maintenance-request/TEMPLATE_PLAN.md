# Mobile Maintenance Request Template Plan

Use this planned template for local-first repair or facility request prototypes.

## Product Shape

A mobile request tracker for issues, locations, status, priority, and local timeline notes without tenant accounts or dispatch workflows.

## Expected Structure

```txt
app/
components/
lib/
types/
```

## Required Screens

- `requests`: status-filtered request list, priority chips, quick create action.
- `request detail`: location, priority, notes, timeline, status update.

## Interaction Checklist

- Create a request with title, location, priority, and notes.
- Filter by status.
- Update priority or status locally.
- Show empty request state.

## Validation Hints

- Do not add photo uploads, technician dispatch, notifications, or tenant accounts unless requested.
- Run `buildable review` after implementation.
