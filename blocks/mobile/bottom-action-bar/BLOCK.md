# Block: Mobile Bottom Action Bar

One dominant action kept in the thumb zone at the bottom of a mobile screen. Expo + React Native + NativeWind.

## When to use

- the screen has a single clear primary action: add task, book appointment, save expense, complete job, log habit
- review/confirm screens where the commit action should be unmissable

## Data shape

```ts
type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  status?: "idle" | "saving" | "success" | "error";
  secondary?: { label: string; onPress: () => void };  // only when truly needed
};
```

## Required states

- **idle** — the primary action, full-width, high contrast
- **disabled** — clearly inert (e.g. required fields incomplete), not just faded into invisibility
- **saving** — spinner/label swap; the button stays put, no layout shift
- **success / error** — brief confirmation or an inline error the user can recover from

## Accessibility

- `accessibilityRole="button"`, a clear `accessibilityLabel`, and `accessibilityState={{ disabled, busy }}`
- target height ≥ 48px; the label is text, not an icon alone
- never trap the action behind the keyboard — see safe area below

## Responsive & safe area

- pin to the bottom and add `paddingBottom: insets.bottom` (via `useSafeAreaInsets`) so it clears the home indicator
- the scroll container above must reserve space (`contentContainerStyle` bottom padding) so the bar never covers the last row
- when a keyboard can appear, lift the bar with `KeyboardAvoidingView` instead of letting the keyboard hide it

## Code sketch

```tsx
<View style={{ paddingBottom: insets.bottom + 8 }} className="absolute inset-x-0 bottom-0 bg-white px-4 pt-3 border-t border-slate-200">
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled, busy: status === "saving" }}
    disabled={disabled || status === "saving"}
    onPress={onPress}
    className="h-12 items-center justify-center rounded-xl bg-blue-600"
  >
    <Text className="text-base font-semibold text-white">{status === "saving" ? "Saving…" : label}</Text>
  </Pressable>
</View>
```

## Adapt to the app spec

- [ ] keep exactly one dominant action; add a secondary only when essential
- [ ] respect safe areas and reserve scroll padding so it never covers content
- [ ] wire disabled / saving / success / error to the real workflow
- [ ] put destructive actions elsewhere, never in the primary slot

## Avoid

- stacking many buttons at the bottom
- hiding destructive actions in the primary slot
- floating controls that overlap important content
- a bar that the keyboard covers on input screens
