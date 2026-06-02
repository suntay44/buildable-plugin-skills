# Web CRM Golden Template Plan

## Product Shape

One polished sales pipeline workspace for tracking leads locally.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  lead-composer.tsx
  lead-detail-panel.tsx
  lead-filters.tsx
  lead-list.tsx
  pipeline-summary.tsx
lib/
  sample-leads.ts
  crm-utils.ts
types/
  crm.ts
```

## Required Features

- create lead
- edit lead
- move lead between stages
- search by lead or company
- filter by stage and source
- record next action
- show empty stage and filtered empty states

## Sample Data

Include 8 to 12 leads across all pipeline stages with varied deal values, sources, and last-contacted dates.

## Validation Hints

- Stage totals update when a lead moves.
- Search and stage filters combine correctly.
- Detail panel is usable on desktop and stacks cleanly on mobile.

