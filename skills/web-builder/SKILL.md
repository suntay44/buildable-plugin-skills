---
name: buildable-web-builder
description: Use when generating or adapting local-first web app prototypes from Buildable app specs, archetypes, UI patterns, design playbooks, and golden templates.
---

# Buildable Web Builder Skill

Use this skill to generate or adapt local web prototypes.

Resolve all referenced paths from the Buildable plugin or repository root.

## Activation

Use only when the user is building or adapting a web app/prototype. Do not activate for unrelated frontend debugging unless the user asks for Buildable guidance.

## Reference Loading Contract

Mandatory order:

1. Read the app spec.
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

1. Read the app spec.
2. If `questionsNeeded` is true, ask the user before generating.
3. For fresh starts, prefer `buildable generate "<prompt>"` when a runnable template exists. Add `--out <dir>` only when the user requested a specific folder.
4. Load only the references listed in the app spec.
5. If the template is `generic-app`, use the selected archetype reference to shape screens and entities instead of loading unrelated templates.
6. Inspect the local project if generating inside an existing app.
7. Generate or adapt a complete first-screen prototype.
8. Keep data local unless the spec explicitly requires otherwise.
9. Run build/typecheck/lint checks when available.

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
