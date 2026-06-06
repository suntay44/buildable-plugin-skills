# Buildable Init

Make the current workspace Buildable-aware without overwriting app code.

Run this inside an existing app:

```bash
buildable init --existing 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" init --existing
```

For a brand-new empty workspace, omit `--existing`. If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Read `.buildable/repo-profile.json` after `--existing`, then use `buildable plan "<prompt>" --write` before generating or editing code.
