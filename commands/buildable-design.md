---
description: Create a Buildable UI/UX design brief from a prompt or current app spec.
argument-hint: <design prompt> [--page <surface>]
allowed-tools: Bash(node:*), Bash(buildable:*), Read, Edit, Write
---

Create a Buildable design brief for: **$ARGUMENTS**

1. Run the design command:

   ```bash
   buildable design "$ARGUMENTS" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" design "$ARGUMENTS"
   ```

   Use `--page "login"` or similar when the user asks for a specific page/component. Add `--write` only when the user wants the brief saved into the current app workspace.

2. If a `buildable-app-spec.json` exists, treat it as the app context. Otherwise, let `design` classify the prompt.

3. Use the returned design brief as the UI/UX source of truth: design system profile, color tokens, typography, spacing, motion, component emphasis, anti-patterns, and references.

4. Treat `buildable design` as UI/UX-only. Do not add backend code, databases, auth, payments, hosted infrastructure, telemetry, or deployment from this command.

5. Load only the references listed in the brief. Do not load all templates or all design playbooks.

6. Apply the brief to the requested app, page, or component while preserving the existing stack and local-first guardrails.

7. End by asking whether the user is satisfied with the UI/UX direction and mockup-data plan. If yes, offer the brief's `nextSuggestedCommand` (usually `buildable generate "<prompt>"`) as the build phase. Do not generate unless the user asked for building too.
