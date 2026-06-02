# Web App Quality Rubric

Score each category from 0 to 3.

## Categories

- `Fit`: matches the requested app type and archetype.
- `Completeness`: implements required core interactions.
- `First Screen`: useful immediately with meaningful sample data.
- `State Coverage`: handles empty, active, edited, deleted, and filtered states.
- `Responsiveness`: works on mobile and desktop without overlap or overflow.
- `Accessibility`: labels, keyboard-friendly controls, focus states, contrast.
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
