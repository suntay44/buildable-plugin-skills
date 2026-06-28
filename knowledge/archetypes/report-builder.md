# Report Builder Archetype

Build a local-first reporting workspace for creating, filtering, previewing, and saving report layouts.

## Core Shape

- Report workspace with a selected report, filter controls, and preview blocks.
- Saved reports list with owner/status/date metadata.
- Chart/table block library using local sample metrics.
- Empty report state that invites the first chart/table block.

## Local-First Rules

- Use local mock datasets and saved-view state.
- Do not add warehouse connectors, BI services, export APIs, or scheduled email delivery unless explicitly requested.
- If export is requested, mock the flow locally and note what production integration remains.

