# Block: Web Detail Panel

Use when selecting a record should reveal context, metadata, and the next action without losing the list.

Fit:

- CRM lead details
- order/product/item details
- job candidate or listing details
- note/post previews with edit actions

Bind to the app spec:

- Keep the selected entity visible in the heading.
- Group fields into meaningful sections instead of dumping every property.
- Put the most likely next action near the top.
- Include edit, close/back, and state transitions where relevant.
- Preserve keyboard and focus order when implemented as a drawer or side panel.

Avoid:

- modal-only detail views for repeated operator workflows
- hiding destructive actions beside routine actions
- duplicating the table without adding detail value
