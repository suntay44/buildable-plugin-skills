# Block: Web Workflow Empty State

Use when a list, table, dashboard, or filtered result can have no visible records.

Fit:

- first-run empty state
- filtered-empty state
- deleted/archive views
- error recovery after local operations

Bind to the app spec:

- Write domain-specific copy.
- Include a recovery action: create, clear filters, reset search, or load sample data.
- Distinguish true empty from filtered-empty.
- Keep it visually quiet in operator tools.

Avoid:

- "No data" as the only copy
- large marketing-style illustrations inside compact apps
- empty states that hide the primary action
