# Block: Web Workflow Empty State

The honest state every list, table, dashboard, and filtered result needs. Distinguishes "nothing yet" from "nothing matches" and always offers a way forward.

## When to use

- first-run empty state (no records created yet)
- filtered-empty state (search/filters match nothing)
- deleted / archive / saved-only views with no items
- error recovery after a failed local operation

## Data shape

```ts
type Props = {
  variant: "empty" | "filtered" | "error";
  entity: string;              // domain noun: "leads", "recipes", "posts"
  onPrimary?: () => void;       // create / clear filters / retry
  primaryLabel?: string;
};
```

## Required states (this block IS a state, so cover the variants)

- **empty** — "No {entity} yet" + a create/import/load-sample action
- **filtered** — "No {entity} match your filters" + a visible **Clear filters** action
- **error** — "Couldn't load {entity}" + a **Retry** action (local ops only)
- never show a bare "No data" with no path forward

## Accessibility

- announce dynamic empties with `role="status"` so screen readers hear the change
- the recovery action is a real `<button>`/`<a>`, focusable and labeled
- sufficient contrast on the muted copy (it's still text, not decoration)

## Responsive

- keep it compact and centered within the content area, not full-viewport in dense tools
- never let an illustration or padding push the surrounding layout wider

## Code sketch

```tsx
<div role="status" className="rounded-md border border-dashed p-8 text-center text-sm text-slate-500">
  <p>{variant === "filtered" ? `No ${entity} match your filters.` : `No ${entity} yet.`}</p>
  {onPrimary && <button type="button" onClick={onPrimary}>{primaryLabel}</button>}
</div>
```

## Adapt to the app spec

- [ ] write domain-specific copy (use the entity noun, not "items")
- [ ] always include a recovery action: create, clear filters, reset search, load sample data
- [ ] distinguish true-empty from filtered-empty (different copy + action)
- [ ] keep it visually quiet in operator tools; reserve illustration for consumer apps

## Avoid

- "No data" as the only copy
- large marketing-style illustrations inside compact apps
- empty states that hide or replace the primary action
- the same copy for empty and filtered-empty
