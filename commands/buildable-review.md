---
description: Audit the current prototype against its Buildable app spec, archetype expectations, and local-first guardrails.
argument-hint: [optional-path-to-app]
allowed-tools: Bash(node:*), Bash(buildable:*), Read, Edit
---

Review the selected workspace by default. If a path is provided, review: **${ARGUMENTS}**

1. Run the Buildable reviewer:

   ```bash
   buildable review $ARGUMENTS 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" review $ARGUMENTS
   ```

   Add `--build` only when the user wants the reviewer to also run the project's typecheck/build scripts and dependencies are installed.

2. Read the generated `.buildable/review-report.md`. Load only the files named by reported issues.

3. Fix blocking issues first (missing entities, missing features, hosted-feature drift, build failures), then polish issues. Keep changes local-first.

4. Report what you fixed and any residual risks. If the review now passes, say so plainly.
