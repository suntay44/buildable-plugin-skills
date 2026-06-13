# Block: Mobile Empty State

The honest state a mobile screen shows when it starts empty, filters to nothing, or loses local data. Short copy, one obvious action. Expo + React Native + NativeWind.

## When to use

- first-run screens (no records yet)
- no matching search/filter results
- offline / local save recovery

## Data shape

```ts
type Props = {
  variant: "empty" | "filtered" | "error";
  entity: string;             // domain noun: "habits", "expenses", "bookings"
  onPrimary?: () => void;      // create / clear filters / retry
  primaryLabel?: string;
};
```

## Required states (this block IS a state — cover the variants)

- **empty** — "No {entity} yet" + a create/log/add action
- **filtered** — "No {entity} match" + a **Clear filters** affordance
- **error** — "Couldn't load {entity}" + **Retry** (local ops only)
- never a bare "Nothing here" with no path forward

## Accessibility

- the recovery action is a real `Pressable` with `accessibilityRole="button"` and a label
- copy is readable text with sufficient contrast; don't rely on artwork to carry meaning
- if it appears after a user action, it should be reachable by the screen reader in flow

## Responsive & safe area

- center it within the available content area, not the whole device height
- keep it above the fold so it never pushes the primary action (or bottom bar) off-screen
- small, restrained spacing — phones have little room to waste

## Code sketch

```tsx
<View className="flex-1 items-center justify-center px-8">
  <Text className="text-center text-base text-slate-500">
    {variant === "filtered" ? `No ${entity} match.` : `No ${entity} yet.`}
  </Text>
  {onPrimary && (
    <Pressable accessibilityRole="button" onPress={onPrimary} className="mt-4 rounded-xl bg-blue-600 px-5 py-3">
      <Text className="font-semibold text-white">{primaryLabel}</Text>
    </Pressable>
  )}
</View>
```

## Adapt to the app spec

- [ ] keep copy short and domain-specific (use the entity noun)
- [ ] provide exactly one obvious recovery action
- [ ] distinguish true-empty from filtered-empty (different copy + action)
- [ ] include filtered-empty and error variants when the workflow supports filters or saving

## Avoid

- long instructional text
- empty artwork replacing the core action
- generic "Nothing here" copy
- pushing the primary action below the fold
