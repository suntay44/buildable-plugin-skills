# Job Board Template Plan

Runnable golden starter for the `job-board` archetype: a two-pane board — filterable job list on the left, job detail with an apply form and confirmation on the right.

## Structure

- `app/page.tsx` — client workspace: filter state, selected job, saved jobs, apply flow
- `components/job-filters.tsx` — search, employment-type filter, remote toggle, result count
- `components/job-detail.tsx` — job detail, save toggle, apply form with validation + confirmation state
- `lib/sample-jobs.ts` — 8 realistic postings across types and locations
- `lib/job-utils.ts` — filtering, search, newest-first ordering
- `types/job.ts` — `Job`, `JobFilters`, `Application`

## Acceptance Checklist

- job list populated and newest-first
- type filter + remote toggle + search combine
- filtered-empty state with a clear-filters action
- apply form labels every field, validates, and shows a confirmation state
- save toggle persists in session and has a saved view
- responsive: list + detail stack on mobile without overflow

## Non-Goals

- no accounts, payments, or external job-board APIs — applications stay in local state
