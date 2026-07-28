---
name: buildable-mobile-builder
description: Generate or adapt a local-first Buildable mobile prototype from an app spec, archetype, UI pattern, design playbook, or mobile golden template. Use for Buildable Expo/React Native implementation; do not use for ordinary mobile debugging or unrelated React Native edits.
---

# Buildable Mobile Builder Skill

Use this skill to generate or adapt local mobile prototypes.

Resolve all referenced paths from the Buildable plugin or repository root.

## Reference Loading Contract

Mandatory order:

1. Read the saved planner output first: `.buildable/phase-plan.json` when present, otherwise `buildable-app-spec.json`. Use `.buildable/phase-plan.toon` when present as the compact agent-facing build contract.
2. Load only `appSpec.references`.
3. Load current project files only as needed for the requested change.
4. Do not load web templates or unrelated mobile archetypes.
5. Load starter source only for the selected template and only when generating or editing it.

## Default Stack

- Expo
- React Native
- TypeScript
- NativeWind
- Expo Router when appropriate
- local/mock data

## Workflow

1. Read the saved plan/app spec from the planner handoff.
2. Check `appSpec.planAudit.checks` before editing; treat blocked/failed checks as gates, not suggestions.
3. If `questionsNeeded` is true, ask the user before generating.
4. Apply `appSpec.designSystem` for visual tone, density, palette intent, touch layout rules, component rules, accessibility, and anti-patterns.
5. Apply `appSpec.blocks` as reusable micro-template guidance. Selected block docs are references to adapt to the current entity/design system, not generic code to paste blindly.
6. If `appSpec.auth.requested` is true, implement the local/mock auth shape first and keep any named provider behind the auth seam.
7. Load only the references listed in the app spec.
8. If the template is `generic-app`, use the selected archetype reference to shape screens and entities instead of loading unrelated mobile templates.
9. Generate touch-first screens and local state.
10. Validate navigation, touch targets, and state coverage.
11. Run `buildable review` from the selected app workspace when the CLI is available.

## Build Order

1. Create typed entities and local sample data.
2. Build the first mobile screen around the main daily workflow.
3. Add navigation only when the screen graph requires it.
4. Add empty, completed, validation, and confirmation states as appropriate.
5. Review against the selected mobile quality rubric.

## Guardrails

- Do not add accounts, push notifications, external APIs, or backend services unless requested.
- Keep the mobile app runnable locally.
