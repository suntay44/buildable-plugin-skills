# Buildable Plan

Classify an app idea and produce a local-first Buildable phase plan and app spec.

Run:

```bash
buildable plan "<prompt>" 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" plan "<prompt>"
```

If the user attached or referenced screenshots/files and the local path is available, pass each one as `--file <path>` or `--screenshot <path>`. Do not paste large file contents into the prompt.

If the user explicitly wants auth/login/accounts, add `--with-auth` unless the prompt already names the provider. If the user names a provider, use `--with-auth-provider <provider>` so it is recorded on the spec and kept behind the auth seam.

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Then follow `appSpec.referenceLoadingContract`: do not load all templates, load only `appSpec.references`, load starter source only for the selected template, and inspect only explicit `appSpec.referenceInputs` supplied by the user. If `appSpec.questionsNeeded` is true, ask the listed product-direction or architecture questions before design or generate. If there are no blockers, ask at most one or two `appSpec.promptRefinement.optionalQuestions` only when they would materially improve the plan; otherwise state the defaults and proceed. For vague business prompts like "I have a restaurant", clarify whether the user wants an informational site/menu, ordering/reservations, or management/inventory first. Summarize archetype, target, stack, selected design system, mock-data approach, phases, screens, key features, optional refinement defaults, and explicit user reference inputs.

End by asking whether the user is satisfied with the plan. If not, keep using Buildable Planner and update the saved `.buildable/phase-plan.md/json/toon` with the requested revision. If yes, offer the target-appropriate next step: Buildable Web Builder for web or Buildable Mobile Builder for mobile. The builder should read the saved plan/spec, use `.buildable/phase-plan.toon` as compact agent context when present, load only `appSpec.references`, and load starter source only for the selected template.
