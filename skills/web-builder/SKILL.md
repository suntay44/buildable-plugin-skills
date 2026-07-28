---
name: buildable-web-builder
description: Generate or adapt a local-first Buildable web prototype from an app spec, archetype, UI pattern, design playbook, or golden template. Use for Buildable web/Next.js implementation; do not use for ordinary frontend debugging or unrelated website edits.
---

# Buildable Web Builder Skill

Use this skill to generate or adapt local web prototypes.

Resolve all referenced paths from the Buildable plugin or repository root.

## Reference Loading Contract

Mandatory order:

1. Read the saved planner output first: `.buildable/phase-plan.json` when present, otherwise `buildable-app-spec.json`. Use `.buildable/phase-plan.toon` when present as the compact agent-facing build contract.
2. Load only `appSpec.references`.
3. Load current project files only as needed for the requested change.
4. Do not load all templates.
5. Load starter source only for the selected template and only when generating or editing it.

## Default Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn-style component patterns
- local/mock data

## Workflow

1. Read the saved plan/app spec from the planner handoff.
2. Check `appSpec.planAudit.checks` before editing; treat blocked/failed checks as gates, not suggestions.
3. If `questionsNeeded` is true, ask the user before generating.
4. For fresh starts, prefer `buildable generate "<prompt>"` when a runnable template exists. Add `--out <dir>` only when the user requested a specific folder.
5. Apply `appSpec.designSystem` for visual tone, density, palette intent, layout rules, component rules, accessibility, and anti-patterns.
6. Apply `appSpec.blocks` as reusable micro-template guidance. Selected block docs are references to adapt to the current entity/design system, not generic code to paste blindly.
7. If `appSpec.auth.requested` is true, implement the local/mock auth shape first and keep any named provider behind the auth seam.
8. Load only the references listed in the app spec.
9. If the template is `generic-app`, use the selected archetype reference to shape screens and entities instead of loading unrelated templates.
10. Inspect the local project if generating inside an existing app.
11. Generate or adapt a complete first-screen prototype.
12. Keep data local unless the spec explicitly requires otherwise.
13. Run build/typecheck/lint checks when available.

## Build Order

1. Create typed entities and sample data.
2. Build the primary screen and state operations.
3. Add empty, filtered, and edited states.
4. Apply responsive layout rules.
5. Review against the selected quality rubric.

## Guardrails

- Do not add auth, accounts, billing, cloud previews, managed databases, telemetry, or deployment.
- Do not create marketing landing pages for app requests.
- Do not leave generic placeholder UI.
