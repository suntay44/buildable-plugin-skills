# Forms & Auth Surface Rubric

Use for create/edit workflows, multi-step flows, intake forms, surveys, and sign-in / sign-up screens. Score each category 0 to 3. Pairs with `knowledge/quality-rubrics/web-app.md` (base), `knowledge/ui-patterns/forms.md`, and the registry `foundations`.

## Categories

- `Labeling`: every control has a visible `<label>` or `aria-label`. `buildable review` warns (`accessible-forms`) on unlabeled controls.
- `Validation`: inline, specific validation messages tied to their field; errors are announced, not color-only.
- `Submission States`: idle, submitting, success, and error states are all handled — no dead button after submit.
- `Field Layout`: logical grouping and order, spacing from the `spacingScale`, single-column on narrow viewports; comfortable 44px touch targets.
- `Focus & Keyboard`: visible focus-visible styles, sensible tab order, Enter submits where expected. Warned by `focus-styles`.
- `Auth Shape (when present)`: local/mock auth by default — session model and protected-route structure without wiring a hosted provider unless explicitly requested.
- `Token Discipline`: inputs, borders, and focus rings use named tokens, not raw hex. `buildable review` warns (`design-tokens`) on palette bypass.
- `Forgiveness`: destructive or irreversible actions confirm; users can recover from mistakes.
- `Local-First`: no hosted auth, no third-party form backend, no captcha service unless explicitly requested.

## Passing Bar

Average at least 2.5 with no score below 2. `Labeling` and `Validation` must each be at least 2.

## Automatic Failures

- controls without labels
- no validation feedback on a form that needs it
- submit button has no submitting/success/error state
- sign-in / sign-up wired to a hosted auth provider that was not requested
- destructive action with no confirmation or recovery
