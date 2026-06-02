# Buildable CRM Starter

A runnable, local-first sales pipeline CRM prototype (Next.js + TypeScript + Tailwind CSS, local state).

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

- Pipeline summary with per-stage counts and deal values
- Create lead, edit via detail panel, delete lead
- Move a lead between stages (new → qualified → proposal → won/lost)
- Search by lead, company, or email; filter by stage and source
- Record the next action and refresh last-contacted
- Stale-lead detection, empty state, and filtered-empty state
- Meaningful sample data across every stage

All data is local React state. No accounts, persistence, payments, or hosted services.
