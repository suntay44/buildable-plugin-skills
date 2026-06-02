---
description: Classify an app idea and produce a local-first Buildable app spec (archetype, stack, screens, entities, features, references).
argument-hint: <app idea prompt>
allowed-tools: Bash(node:*), Bash(buildable:*), Read
---

Run Buildable planning for the request: **$ARGUMENTS**

1. Run the CLI to get a concrete app spec:

   ```bash
   buildable plan "$ARGUMENTS" 2>/dev/null || node "${CLAUDE_PLUGIN_ROOT:-.}/bin/buildable.mjs" plan "$ARGUMENTS"
   ```

2. Follow `appSpec.referenceLoadingContract` exactly:
   - Do not load all templates.
   - Load only `appSpec.references`.
   - Load starter source only for the selected template.

3. If `appSpec.questionsNeeded` is true, ask the user the listed architecture questions before building.

4. Summarize the plan for the user: archetype, target, stack, screens, key features, and which references you will load next. Do not start writing app code yet unless the user asked you to build.
