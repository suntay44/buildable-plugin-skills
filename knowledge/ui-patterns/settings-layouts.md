# Settings Layouts

## Use When

An app needs a preferences/configuration surface: profile, workspace options, notification toggles, data management.

## Expected Components

- grouped sections with a heading and one-line description per group
- a vertical section nav (sidebar on desktop, select or tabs on mobile) when there are 3+ groups
- per-field controls with visible labels; toggles for booleans, selects for enums
- an explicit save model: either autosave with inline "Saved" feedback, or a sticky save bar that appears on change

## Behavior

- destructive actions (delete data, reset workspace) live in a visually separated danger group and confirm before acting
- unsaved-changes state is visible; navigating away with unsaved edits warns
- every control reflects its current value from state — no write-only settings
- keyboard and screen-reader users can reach and operate every control

## Avoid

- a single wall of unlabeled toggles
- mixing destructive actions inline with routine preferences
- save buttons that give no feedback about what changed
- settings that exist in the UI but are never read by the app
