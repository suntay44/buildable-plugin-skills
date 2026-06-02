# Field Service Archetype

## Purpose

Coordinate mobile service jobs, technician workflows, and job status.

## Default Screens

- `jobs`: today’s job list and status filters.
- `job detail`: customer context, location text, notes, and status.

## Entities

- `ServiceJob`: customer, serviceType, timeWindow, status, priority, notes.

## Required Interactions

- Filter jobs, update status, inspect details, and show empty-day states.

## Do Not Add Unless Requested

- GPS routing, customer messaging, payments, signatures, or dispatch integrations.
