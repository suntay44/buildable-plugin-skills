---
description: Inspect the current Buildable workspace and suggest the next command without writing files.
argument-hint: [optional-path-to-app]
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Inspect the selected workspace by default. If a path is provided, inspect: **${ARGUMENTS}**

1. Run the Buildable status inspector:

   ```bash
   buildable status "${ARGUMENTS:-.}" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" status "${ARGUMENTS:-.}"
   ```

2. Treat the output as the current workflow handoff:
   - If no plan exists, suggest `/buildable-plan`.
   - If scope is blocked, ask the listed questions before design/generate.
   - If a plan exists, use `/buildable-design`.
   - If design is ready and no app is generated, use `/buildable-generate`.
   - If generated files exist, use `/buildable-review`.

3. Do not load unrelated templates or references. `status` is read-only; it tells you where the workspace is, not what to build.
