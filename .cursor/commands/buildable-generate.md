# Buildable Generate

Generate a local-first prototype from a prompt.

Run (add `--out <dir>`; for planned templates add `--plan-pack`):

```bash
node ./bin/buildable.mjs generate "<prompt>" --out ./out
```

If the CLI reports architecture-changing choices, ask the user first. Read `buildable-app-spec.json`, load only `appSpec.references`, and adapt the starter (or implement the plan pack) to the request. Keep data local/mock. Do not add auth, billing, databases, telemetry, or deployment unless requested. When code exists, verify the build and run the Buildable review.
