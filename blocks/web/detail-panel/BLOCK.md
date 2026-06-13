# Block: Web Detail Panel

Selecting a record reveals its context, metadata, and next action — without losing the list. Pairs with web/filterable-table (list on one side, detail on the other).

## When to use

- CRM lead details, order/product/item details, job candidate or listing details
- note/post previews with edit actions
- any list where a row needs more than a row can hold

## Data shape

```ts
type Props<T> = {
  item: T | null;                         // null => show the empty prompt
  onEdit?: (patch: Partial<T>) => void;
  onAction?: (action: string) => void;     // primary next action(s)
  onClose?: () => void;                    // for drawer/overlay variants
};
```

## Required states

- **empty** — no selection: a short prompt ("Select a record to see details"), not a blank box
- **populated** — heading names the selected entity; fields grouped into sections
- **editing** — inline edit with idle / saving / saved / error feedback when the panel is editable
- **transition** — visible state changes (publish/unpublish, status moves) reflect immediately

## Accessibility

- selected entity name in the heading (`<h2>`)
- as a drawer/side panel: trap focus, restore focus to the trigger on close, `Esc` closes
- group fields with `<dl>` or labeled sections; don't dump every property as a flat list
- destructive actions are visually separated and confirm before acting

## Responsive

- desktop: side panel next to the list (`lg:grid-cols-[2fr_3fr]`, `min-w-0` on both)
- narrow: panel stacks below the list, or becomes a full-width sheet; keep the list reachable
- the most likely next action stays visible without scrolling on common viewports

## Code sketch

```tsx
if (!item) return <aside aria-label="Detail"><p>Select a record to see details.</p></aside>;
return (
  <aside aria-label="Detail">
    <header><h2>{item.title}</h2><PrimaryAction onClick={() => onAction?.("default")} /></header>
    <dl>{/* grouped sections, not every field */}</dl>
    {editable && <EditFields item={item} onEdit={onEdit} /* idle/saving/error */ />}
  </aside>
);
```

## Adapt to the app spec

- [ ] keep the selected entity visible in the heading
- [ ] group fields into meaningful sections instead of dumping every property
- [ ] put the most likely next action near the top
- [ ] include edit, close/back, and state transitions where relevant
- [ ] reuse the list's filter/format utils — don't recompute domain logic here

## Avoid

- modal-only detail views for repeated operator workflows
- hiding destructive actions beside routine ones
- duplicating the table without adding detail value
- losing list context when the panel opens
