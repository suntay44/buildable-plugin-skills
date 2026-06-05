# Buildable Generate

Generate a local-first prototype from a prompt.

Run (add `--out <dir>` only when the user requests a specific folder; for planned templates add `--plan-pack`):

```bash
buildable generate "<prompt>" 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" generate "<prompt>"
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. If the CLI reports architecture-changing choices, ask the user first. Read `buildable-app-spec.json`, load only `appSpec.references`, and adapt the starter (or implement the plan pack) to the request. Keep data local/mock. Do not add auth, billing, databases, telemetry, or deployment unless requested. When code exists, verify the build and run the Buildable review.
