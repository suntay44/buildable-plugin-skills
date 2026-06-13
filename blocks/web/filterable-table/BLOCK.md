# Block: Web Filterable Table

Use when the app has a primary entity that users scan, search, sort, filter, and act on repeatedly.

Fit:

- data-dense web apps
- CRM leads, inventory items, orders, jobs, posts, products, records
- operator dashboards where comparison matters

Bind to the app spec:

- Use the primary entity name in the table title and empty states.
- Include search plus 2-4 filters based on real fields such as status, stage, category, owner, date, or priority.
- Show 5-7 useful columns maximum on desktop; collapse secondary fields into a subtitle on narrow screens.
- Include row-level action affordances without hiding the main workflow.
- Include populated, empty, filtered-empty, loading, and error states.

Avoid:

- generic `Name / Status / Date` tables when the domain has richer fields
- color-only status signals
- horizontal overflow that hides primary actions
- filters far away from the table they affect
