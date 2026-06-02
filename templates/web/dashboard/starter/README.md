# Buildable SaaS Dashboard Starter

A runnable, local-first SaaS analytics dashboard prototype (Next.js + TypeScript + Tailwind CSS, local mock data).

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run build
```

## What's Included

- Metric cards with deltas and trend direction
- Date range control (7d / 30d / 90d) that reshapes the trend
- Trend region rendered as a dependency-free inline SVG line + area
- Recent account event table with status filtering
- Empty states for both the trend (narrow range) and filtered event table
- Event-health rollup counts

All data is local mock data. No accounts, persistence, payments, or hosted services.
