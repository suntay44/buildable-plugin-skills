# Buildable Plan

Classify an app idea and produce a local-first Buildable app spec.

Run:

```bash
buildable plan "<prompt>" 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" plan "<prompt>"
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Then follow `appSpec.referenceLoadingContract`: do not load all templates, load only `appSpec.references`, and load starter source only for the selected template. If `appSpec.questionsNeeded` is true, ask the listed architecture questions before building. Summarize archetype, target, stack, screens, and key features.
