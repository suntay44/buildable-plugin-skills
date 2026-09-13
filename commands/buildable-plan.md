---
description: Classify an app idea and produce a local-first Buildable phase plan and app spec (archetype, stack, screens, entities, features, references).
argument-hint: <app idea prompt>
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Run Buildable planning for the request: **$ARGUMENTS**

1. Get the structured spec and phases without the duplicate Markdown render:

   ```bash
   if command -v buildable >/dev/null 2>&1; then
     buildable plan "$ARGUMENTS" --compact
   else
     node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" plan "$ARGUMENTS" --compact
   fi
   ```

   Pass explicit user files as `--file <path>` or `--screenshot <path>` instead of pasting contents into the prompt. For requested auth/login/accounts, use `--with-auth`; for a named provider, use `--with-auth-provider <provider>` and keep it behind the auth seam.

2. Use the CLI result rather than repeating classification. Follow `appSpec.referenceLoadingContract`: load only needed `appSpec.references` and explicit `appSpec.referenceInputs`, and selected starter source only when generating or editing it. Do not scan whole knowledge/template directories.

3. Ask blocking `appSpec.questions` before design or generation when `questionsNeeded` is true. Otherwise ask at most one or two `promptRefinement.optionalQuestions` only if they materially improve the plan; use defaults when the user wants to proceed.

4. Summarize direction, target/stack, screens/key behavior, non-goals, design/mock-data approach, important assumptions or blockers, and the next phase. Link the saved `.buildable/phase-plan.md` instead of repeating the full spec and references. The plan already includes design guidance; a deeper `buildable design` pass is optional.

5. For planning-only requests, ask one satisfaction checkpoint: revise the saved plan in Buildable Planner or continue with Buildable Web Builder/Mobile Builder for the target. On revisions, retain accepted constraints and summarize changes. If the user already asked to build and no blockers remain, continue without another checkpoint. The builder should read `.buildable/phase-plan.toon` first and retrieve omitted details from the JSON source of truth as needed; reuse the saved plan for unchanged requirements.
