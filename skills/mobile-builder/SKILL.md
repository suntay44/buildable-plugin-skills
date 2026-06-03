---
name: buildable-mobile-builder
description: Use when generating or adapting local-first Expo and React Native prototypes from Buildable app specs, archetypes, UI patterns, design playbooks, and mobile golden templates.
---

# Buildable Mobile Builder Skill

Use this skill to generate or adapt local mobile prototypes.

Resolve all referenced paths from the Buildable plugin or repository root.

## Activation

Use only when the user is building or adapting a native mobile app/prototype. Do not activate for unrelated React Native debugging unless the user asks for Buildable guidance.

## Reference Loading Contract

Mandatory order:

1. Read the app spec.
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

1. Read the app spec.
2. If `questionsNeeded` is true, ask the user before generating.
3. Load only the references listed in the app spec.
4. If the template is `generic-app`, use the selected archetype reference to shape screens and entities instead of loading unrelated mobile templates.
5. Generate touch-first screens and local state.
6. Validate navigation, touch targets, and state coverage.
7. Run `buildable review` from the selected app workspace when the CLI is available.

## Build Order

1. Create typed entities and local sample data.
2. Build the first mobile screen around the main daily workflow.
3. Add navigation only when the screen graph requires it.
4. Add empty, completed, validation, and confirmation states as appropriate.
5. Review against the selected mobile quality rubric.

## Guardrails

- Do not add accounts, push notifications, external APIs, or backend services unless requested.
- Keep the mobile app runnable locally.
