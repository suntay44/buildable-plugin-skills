---
description: Classify an app idea and produce a local-first Buildable phase plan and app spec (archetype, stack, screens, entities, features, references).
argument-hint: <app idea prompt>
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Run Buildable planning for the request: **$ARGUMENTS**

1. Run the CLI to get a concrete top-down app spec and phase plan:

   ```bash
   buildable plan "$ARGUMENTS" --write 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" plan "$ARGUMENTS" --write
   ```

   If the user attached or referenced screenshots/files and the local path is available, pass each one as `--file <path>` or `--screenshot <path>`. Do not paste large file contents into the prompt.

2. Follow `appSpec.referenceLoadingContract` exactly:
   - Do not load all templates.
   - Load only `appSpec.references`.
   - Load starter source only for the selected template.
   - Also inspect only explicit `appSpec.referenceInputs` supplied by the user.

3. If `appSpec.questionsNeeded` is true, ask the user the listed product-direction or architecture questions before running design or generate. For vague business prompts like "I have a restaurant", clarify whether the user wants an informational site/menu, ordering/reservations, or management/inventory first.

4. Summarize the plan for the user: archetype, target, stack, selected design system, mock-data approach, phases, screens, key features, explicit user reference inputs, and which bundled references you will load next. Do not start writing app code yet unless the user asked you to build.

5. End with this lightweight checkpoint: ask whether the user is satisfied with the plan. If not, tell them to continue in Buildable Planner with a revision prompt and update the saved `.buildable/phase-plan.md/json`. If yes, offer the correct next builder skill for the target: Buildable Web Builder for web or Buildable Mobile Builder for mobile. The builder should read the saved plan/spec, load only `appSpec.references`, and load starter source only for the selected template.
