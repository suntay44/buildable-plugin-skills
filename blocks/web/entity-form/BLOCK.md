# Block: Web Entity Form

Use when the app creates or edits an entity locally.

Fit:

- create lead, task, note, product, job, post, listing
- edit record details
- quick-add plus expanded edit forms

Bind to the app spec:

- Include only fields needed for the MVP workflow.
- Use labels, helper text when helpful, validation messages, and visible save/cancel states.
- Keep selects and chips tied to realistic domain values.
- Support saving, saved, validation error, and cancel/close states.

Avoid:

- unlabeled inputs
- huge forms when quick-add is enough
- silently ignoring invalid fields
- adding auth, payments, or backend persistence from the form block alone
