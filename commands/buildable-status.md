---
description: Inspect the current Buildable workspace and suggest the next command without writing files.
argument-hint: [optional-path-to-app]
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Inspect the selected workspace by default. If a path is provided, inspect: **${ARGUMENTS}**

1. Run the Buildable status inspector:

   ```bash
   if command -v buildable >/dev/null 2>&1; then
     buildable status "${ARGUMENTS:-.}"
   else
     node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" status "${ARGUMENTS:-.}"
   fi
   ```

2. Treat the output as the current workflow handoff:
   - If no plan exists, suggest `/buildable:buildable-plan`.
   - If scope is blocked, ask the listed questions before design/generate.
   - If a plan exists, use `/buildable:buildable-design`.
   - If design is ready and no app is generated, use `/buildable:buildable-generate`.
   - If generated files exist, use `/buildable:buildable-review`.

3. Do not load unrelated templates or references. `status` is read-only; it tells you where the workspace is, not what to build.
