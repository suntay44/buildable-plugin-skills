# Buildable Plan

Classify an app idea and produce a local-first app spec and phase plan:

```bash
if command -v buildable >/dev/null 2>&1; then
  buildable plan "<prompt>" --compact
else
  node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" plan "<prompt>" --compact
fi
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the checkout. Compact output retains the structured spec and phases; full JSON, Markdown, and TOON files are still saved.

Pass explicit user files with `--file <path>` or `--screenshot <path>` instead of pasting contents into the prompt. For requested auth/login/accounts use `--with-auth`; for a named provider use `--with-auth-provider <provider>` and keep it behind the auth seam.

Use the CLI result rather than repeating classification. Follow `appSpec.referenceLoadingContract`: load only needed `appSpec.references`, explicit `appSpec.referenceInputs`, and selected starter source when generating or editing it. Do not scan whole knowledge/template directories.

Ask blocking `appSpec.questions` before design or generation when `questionsNeeded` is true. Otherwise ask at most one or two `promptRefinement.optionalQuestions` only if they materially improve the plan; use defaults when the user wants to proceed.

Summarize direction, target/stack, screens/key behavior, non-goals, design/mock-data approach, important assumptions or blockers, and the next phase. Link `.buildable/phase-plan.md` instead of repeating the full spec and references. A deeper `buildable design` pass is optional.

For planning-only requests, ask one satisfaction checkpoint: revise the saved plan in Buildable Planner or continue with Buildable Web Builder/Mobile Builder for the target. Retain accepted constraints on revisions and summarize changes. If the user already asked to build and no blockers remain, continue without another checkpoint. The builder should read `.buildable/phase-plan.toon` first and retrieve omitted details from the JSON source of truth as needed; reuse the saved plan for unchanged requirements.
