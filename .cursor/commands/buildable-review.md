# Buildable Review

Audit a generated prototype against its Buildable app spec and local-first guardrails.

Run from the app workspace (add `--build` to also run typecheck/build when deps are installed):

```bash
buildable review 2>/dev/null || node "${BUILDABLE_ROOT:?Set BUILDABLE_ROOT to your Buildable checkout}/bin/buildable.mjs" review
```

If `buildable` is not globally linked, set `BUILDABLE_ROOT` to the local Buildable checkout. Pass a path only when reviewing another folder. Read `.buildable/review-report.md`, load only files named by reported issues, and fix blocking issues first (missing entities/features, hosted-feature drift, build failures) then polish. Relay the advisory **Readiness** section (mocked data, mock/no auth, no deploy) as the honest "what's left to ship" summary — guidance only; do not auto-add a backend or auth provider unless the user asks. Report what changed and whether the review now passes.
