---
description: Make the current workspace Buildable-aware by writing a local .buildable config and repo profile.
argument-hint: [--existing]
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Initialize Buildable in the current workspace.

1. For an existing app, profile the repo without overwriting code:

   ```bash
   buildable init --existing 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" init --existing
   ```

   For a fresh workspace, omit `--existing`.

2. Read the generated `.buildable/repo-profile.json` (existing apps) to learn the detected framework, language, and styling so later generation matches the project's conventions.

3. Tell the user the workspace is ready and suggest `/buildable-plan` as the next step.
