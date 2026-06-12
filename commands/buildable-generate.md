---
description: Generate a local-first prototype from a prompt — copies a runnable Buildable starter or writes a plan-only instruction pack.
argument-hint: <app idea prompt> [--out <dir>]
allowed-tools: Bash(node:*), Bash(buildable:*), Read, Edit, Write
---

Generate a Buildable prototype for: **$ARGUMENTS**

1. Plan first, then generate. If `.buildable/phase-plan.json` exists and the prompt matches, generation reuses that saved audit-first plan. For runnable templates this copies a polished starter; for planned templates add `--plan-pack`:

   ```bash
   buildable generate "$ARGUMENTS" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" generate "$ARGUMENTS"
   ```

   - If the CLI reports the prompt has architecture-changing choices, ask the user those questions, then rerun with `--force` only if the prompt already answers them.
   - If the CLI reports the template is not runnable yet, rerun with `--plan-pack` to write an instruction pack.
   - Add `--name "App Name"` to brand the generated app, or pass a name in the prompt ("...called FocusList").
   - Add `--with-auth` when the user explicitly wants login/accounts but did not include it in the prompt. Use `--with-auth-provider <provider>` only when the user names a provider.
   - To add a feature to an **existing** app instead of scaffolding a new one, use `--augment` (writes a plan that adapts to the current project without overwriting code).

2. Read `buildable-app-spec.json` in the output directory and load only `appSpec.references`. Use `.buildable/phase-plan.toon` when present as the compact build contract for audit gates, references, screens, entities, features, and guardrails.

3. Adapt the starter (or implement the plan pack) to the user's specific request. Keep data local/mock by default. Do not add auth, billing, databases, telemetry, or deployment unless explicitly requested.

4. When code exists, verify it builds, then run `/buildable-review` on the output directory and fix blocking issues before handoff.
