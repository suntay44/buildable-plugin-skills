# Buildable Design

Create a UI/UX design brief from a prompt or the current Buildable app spec.

Run:

```bash
buildable design "<prompt>" 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" design "<prompt>"
```

Use `--page "login"` or similar for a specific surface. Add `--dark` (or say "dark mode" in the prompt) to make the dark palette the active theme. Add `--write` only when the user wants `.buildable/design-brief.json` and `.buildable/design-brief.md` saved into the workspace.

If `buildable-app-spec.json` exists, keep that app context. Otherwise, let `design` classify the prompt. Load only the references listed in the design brief and apply the tokens/rules to the requested app, page, or component.

`buildable design` is UI/UX-only. Do not add backend code, databases, auth, payments, hosted infrastructure, telemetry, or deployment from this command. End by asking whether the user is satisfied with the UI/UX direction and mockup-data plan. If yes, offer the brief's `nextSuggestedCommand` as the build phase.
