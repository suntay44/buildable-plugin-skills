# Buildable Status

Inspect the current Buildable workspace and suggest the next command without writing files.

Run from the app workspace:

```bash
if command -v buildable >/dev/null 2>&1; then
  buildable status
else
  node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" status
fi
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Use this before continuing a previous session: it reads `.buildable/phase-plan.json`, design brief, app spec, expected files, and review report status, then recommends the next safe command. Do not load unrelated templates; follow the selected plan/references.
