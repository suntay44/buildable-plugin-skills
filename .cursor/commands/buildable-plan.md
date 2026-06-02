# Buildable Plan

Classify an app idea and produce a local-first Buildable app spec.

Run:

```bash
node ./bin/buildable.mjs plan "<prompt>"
```

Then follow `appSpec.referenceLoadingContract`: do not load all templates, load only `appSpec.references`, and load starter source only for the selected template. If `appSpec.questionsNeeded` is true, ask the listed architecture questions before building. Summarize archetype, target, stack, screens, and key features.
