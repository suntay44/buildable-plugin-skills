---
name: buildable-reviewer
description: Use when reviewing generated Buildable prototypes for build correctness, UI completeness, state coverage, accessibility, responsiveness, and local-first discipline.
---

# Buildable Reviewer Skill

Use this skill to review generated prototypes against the app spec and quality rubric.

Resolve all referenced paths from the Buildable plugin or repository root.

## Activation

Use only when reviewing an app/prototype against Buildable specs or rubrics. Do not activate globally for ordinary code review.

## Reference Loading Contract

Mandatory order:

1. Run `buildable review <app-path>` when available.
2. Load the app spec and selected rubric.
3. Load only files related to reported issues.
4. Do not load all templates.
5. Do not load unrelated archetypes or starter source.

## Workflow

1. Run `buildable review <app-path>` when the CLI is available. Add `--build` to run the project's typecheck/build scripts when dependencies are installed.
2. Read the app spec and selected quality rubric.
3. Run available build, typecheck, lint, or test commands (or rely on `review --build`).
4. Inspect the generated UI when possible — start the app and run `buildable preview <path> --url <url>` to render it, screenshot it, and catch runtime/visual errors that build checks miss.
5. Check required interactions, state coverage, responsive behavior, and accessibility.
6. Produce a focused fix list.
7. Apply fixes when operating as the active coding agent.

## Review Priorities

- build correctness
- primary workflow
- missing interactions
- empty/loading/error states
- mobile and desktop layout
- accessible form controls
- unnecessary backend or hosted features

## Output Format

Lead with blocking issues, then polish issues, then checks run. If no issues remain, say so and note residual risks.
