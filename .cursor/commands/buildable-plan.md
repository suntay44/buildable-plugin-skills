# Buildable Plan

Classify an app idea and produce a local-first Buildable phase plan and app spec.

Run:

```bash
buildable plan "<prompt>" --write 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" plan "<prompt>" --write
```

If the user attached or referenced screenshots/files and the local path is available, pass each one as `--file <path>` or `--screenshot <path>`. Do not paste large file contents into the prompt.

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Then follow `appSpec.referenceLoadingContract`: do not load all templates, load only `appSpec.references`, load starter source only for the selected template, and inspect only explicit `appSpec.referenceInputs` supplied by the user. If `appSpec.questionsNeeded` is true, ask the listed product-direction or architecture questions before design or generate. For vague business prompts like "I have a restaurant", clarify whether the user wants an informational site/menu, ordering/reservations, or management/inventory first. Summarize archetype, target, stack, selected design system, mock-data approach, phases, screens, key features, and explicit user reference inputs.
