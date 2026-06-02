# Buildable Review

Audit a generated prototype against its Buildable app spec and local-first guardrails.

Run (add `--build` to also run typecheck/build when deps are installed):

```bash
node ./bin/buildable.mjs review ./path-to-app
```

Read `.buildable/review-report.md`, load only files named by reported issues, and fix blocking issues first (missing entities/features, hosted-feature drift, build failures) then polish. Report what changed and whether the review now passes.
