---
description: Classify an app idea and produce a local-first Buildable phase plan and app spec (archetype, stack, screens, entities, features, references).
argument-hint: <app idea prompt>
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Run Buildable planning for the request: **$ARGUMENTS**

1. Run the CLI to get a concrete top-down app spec and phase plan:

   ```bash
   buildable plan "$ARGUMENTS" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" plan "$ARGUMENTS"
   ```

   If the user attached or referenced screenshots/files and the local path is available, pass each one as `--file <path>` or `--screenshot <path>`. Do not paste large file contents into the prompt.
   If the user explicitly wants auth/login/accounts, add `--with-auth` unless the prompt already names the provider. If the user names a provider, use `--with-auth-provider <provider>` so it is recorded on the spec and kept behind the auth seam.

2. Follow `appSpec.referenceLoadingContract` exactly:
   - Do not load all templates.
   - Load only `appSpec.references`.
   - Load starter source only for the selected template.
   - Also inspect only explicit `appSpec.referenceInputs` supplied by the user.

3. If `appSpec.questionsNeeded` is true, ask the user the listed product-direction or architecture questions before running design or generate. For vague business prompts like "I have a restaurant", clarify whether the user wants an informational site/menu, ordering/reservations, or management/inventory first.

4. Summarize the plan for the user: archetype, target, stack, selected design system, mock-data approach, phases, screens, key features, explicit user reference inputs, and which bundled references you will load next. Do not start writing app code yet unless the user asked you to build.

   Then ask questions with restraint:
   - If `appSpec.questionsNeeded` is true, ask the blocking `appSpec.questions` before design or generate.
   - If there are no blockers, ask at most one or two `appSpec.promptRefinement.optionalQuestions` only when they would materially improve the plan.
   - If the user wants to proceed, use the `promptRefinement` defaults instead of asking more questions.

5. End with this lightweight checkpoint: ask whether the user is satisfied with the plan. If not, tell them to continue in Buildable Planner with a revision prompt and update the saved `.buildable/phase-plan.md/json/toon`. If yes, offer the correct next builder skill for the target: Buildable Web Builder for web or Buildable Mobile Builder for mobile. The builder should read the saved plan/spec, use `.buildable/phase-plan.toon` as compact agent context when present, load only `appSpec.references`, and load starter source only for the selected template.
