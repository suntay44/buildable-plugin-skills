# Web SaaS Dashboard Golden Template Plan

## Product Shape

One operational analytics dashboard with metric cards, trend regions, filters, and an events table.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  date-range-control.tsx
  metric-card.tsx
  metric-grid.tsx
  trend-panel.tsx
  events-table.tsx
lib/
  sample-metrics.ts
  dashboard-utils.ts
types/
  dashboard.ts
```

## Required Features

- metric cards with deltas
- date range selector
- trend visualization region
- event/status table
- status filtering
- empty state for no matching events
- simulated loading or skeleton state if useful

## Sample Data

Include 4 to 6 metrics, 10 to 20 trend points, and 8 to 12 event rows.

## Validation Hints

- Metrics and tables change when filters change.
- Charts have labels and context.
- The dashboard stays information-dense without becoming decorative.

