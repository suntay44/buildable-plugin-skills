# Forms

## Use When

The app needs creation, editing, filtering, booking, or user-entered configuration.

## Expected Components

- visible labels
- inputs with clear placeholder text
- validation messaging where invalid data is possible
- primary submit action
- secondary cancel/reset action when editing

## Accessibility

- Every `<input>`, `<select>`, and `<textarea>` must be associated with a `<label>` (wrap it, or use `htmlFor`/`id`) or carry an `aria-label`. `buildable review` warns (`accessible-forms`) when controls outnumber labels.
- A visible focus style is required: keep a `:focus-visible` rule in `globals.css`. `buildable review` warns (`focus-styles`) when interactive controls exist with no `focus-visible` styles.
- keyboard submission should work
- disabled states must remain legible

## Empty/Error States

- invalid required fields should explain how to recover
- failed local operations should preserve user-entered text when possible

