# Web App Quality Rubric

Score each category from 0 to 3.

## Categories

- `Fit`: matches the requested app type and archetype.
- `Completeness`: implements required core interactions.
- `First Screen`: useful immediately with meaningful sample data.
- `State Coverage`: handles empty, active, edited, deleted, and filtered states. `buildable review` warns (`state-coverage`) when the archetype declares an empty/filtered state that is missing from the source.
- `Responsiveness`: works on mobile and desktop without overlap or overflow. Follow `knowledge/ui-patterns/responsive-layouts.md` — pair fixed grid tracks with `minmax(0,1fr)` (never a bare `1fr`), add `min-w-0` to children holding tables/long text, and stack sidebar content instead of using viewport-keyed multi-column grids inside it.
- `Accessibility`: labels, keyboard-friendly controls, focus states, contrast. `buildable review` warns (`accessible-forms`, `focus-styles`) on unlabeled controls or missing `focus-visible` styles.
- `Visual Quality`: hierarchy, spacing, modern product feel, non-generic UI.
- `Code Quality`: clear structure, typed data, simple state, no unnecessary backend.
- `Local-First`: no hosted assumptions, secrets, accounts, billing, or deployment.

## Passing Bar

A generated prototype should average at least 2.5 and have no score below 2.

## Automatic Failures

- does not build
- primary workflow is nonfunctional
- adds hosted platform features not requested
- stores hardcoded secrets
- first screen is mostly placeholder content
- UI looks like generic scaffolding rather than a product prototype
