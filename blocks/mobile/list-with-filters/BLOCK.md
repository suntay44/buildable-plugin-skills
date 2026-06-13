# Block: Mobile List With Filters

The primary mobile workflow: a scrollable list of local records with light search/filtering, tuned for one-handed use. Expo + React Native + NativeWind.

## When to use

- tasks, habits, bookings, expenses, trips, jobs, subscriptions — anything list-first on mobile
- search plus 2–5 common states on a small screen

## Data shape

```ts
type Props<T> = {
  items: T[];
  filters: { query: string; status: "all" | string };
  onFilters: (next: Props<T>["filters"]) => void;
  onSelect?: (id: string) => void;
  renderItem: (item: T) => ReactNode;   // lead with the key status/time/amount
};
// Derive visible rows in a pure util; keep the FlatList data prop cheap.
```

## Required states

- **populated** — `FlatList` of records, most important field readable at a glance
- **empty** — first run, no records (use mobile/empty-state)
- **filtered-empty** — search/chips match nothing, with a clear-filters affordance
- **loading / saving** — lightweight indicator, no layout jump
- **offline / local** — data is local; never block the list on a network call

## Accessibility

- tap targets ≥ 44px; rows and chips are real `Pressable`/`TouchableOpacity`
- `accessibilityRole` on interactive rows; status conveyed by text + shape, not color alone
- filter chips expose selected state via `accessibilityState={{ selected }}`

## Responsive & safe area

- use `FlatList` (not `.map` in a `ScrollView`) so long lists stay smooth
- respect safe areas with `useSafeAreaInsets`; pad `contentContainerStyle` for the bottom action bar
- keep filters near the top without crowding the first screen; horizontal chips scroll, they don't wrap into a wall

## Code sketch

```tsx
<View className="flex-1 bg-[#f7f8fb]" style={{ paddingTop: insets.top }}>
  <FilterChips value={filters.status} onChange={(status) => onFilters({ ...filters, status })} />
  <FlatList
    data={visible}
    keyExtractor={(i) => i.id}
    renderItem={({ item }) => <Pressable onPress={() => onSelect?.(item.id)}>{renderItem(item)}</Pressable>}
    ListEmptyComponent={<MobileEmptyState variant={filters.query ? "filtered" : "empty"} />}
    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 96 }}
  />
</View>
```

## Adapt to the app spec

- [ ] use the domain entity in titles and empty copy
- [ ] prefer segmented control or horizontal chips for 2–5 common states
- [ ] surface the most important status / time / amount in each row
- [ ] keep room at the bottom for mobile/bottom-action-bar (don't let it cover the last row)
- [ ] include empty, filtered-empty, loading, and offline/local states

## Avoid

- desktop-style table layouts on a phone
- too many filters on the first screen
- tiny row actions that are hard to tap
- rendering long lists with `.map` inside a `ScrollView`
