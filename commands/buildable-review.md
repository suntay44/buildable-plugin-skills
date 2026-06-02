---
description: Audit a generated prototype against its Buildable app spec, archetype expectations, and local-first guardrails.
argument-hint: [path-to-app]
allowed-tools: Bash(node:*), Bash(buildable:*), Read, Edit
---

Review the prototype at: **${ARGUMENTS:-.}**

1. Run the Buildable reviewer:

   ```bash
   buildable review "${ARGUMENTS:-.}" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" review "${ARGUMENTS:-.}"
   ```

   Add `--build` to also run the project's typecheck/build scripts when dependencies are installed.

2. Read the generated `.buildable/review-report.md`. Load only the files named by reported issues.

3. Fix blocking issues first (missing entities, missing features, hosted-feature drift, build failures), then polish issues. Keep changes local-first.

4. Report what you fixed and any residual risks. If the review now passes, say so plainly.
