---
name: buildable-planner
description: Use when turning an app idea prompt into a Buildable classification, ask-vs-build decision, selected archetype, reference set, and concrete local-first app spec.
---

# Buildable Planner Skill

Use this skill to classify prompts, choose an archetype, decide whether questions are needed, and produce an app spec.

## Inputs

- user prompt
- optional existing repository context
- optional local preferences

Resolve all referenced paths from the Buildable plugin or repository root.

## Activation

Use Buildable only for app planning, app generation, UI/UX product guidance, or prototype review. Do not activate globally for unrelated coding tasks.

## Reference Loading Contract

Mandatory order:

1. Run `buildable plan "<prompt>"` when available.
2. Load only `appSpec.references`.
3. Do not load all templates.
4. Do not load whole `knowledge/` or `templates/` directories.
5. Load starter source only for the selected template and only when generating or editing it.

Use `knowledge/INDEX.md` and `templates/INDEX.md` only for discovery when the CLI is unavailable.

## Workflow

0. Prefer `buildable plan "<prompt>"` when the CLI is available.
1. Use `core/archetype-registry.json` tags for lightweight matching before opening archetype docs.
2. Apply `core/ask-vs-build-policy.md`.
3. Apply `core/activation-policy.md`.
4. Load the selected `knowledge/archetypes/<archetype>.md`.
5. Load matching files from `knowledge/data-models/` and `knowledge/screen-graphs/` when they exist.
6. Select the best `templates/<target>/<archetype>/template-spec.json`.
7. Produce an app spec using `core/app-spec-schema.md`.
8. Include explicit non-goals to prevent hosted feature drift.

## Reference Selection

Load only what the selected app needs. Do not browse all archetype files. For a todo prompt, prefer:

- `knowledge/archetypes/task-manager.md`
- `knowledge/data-models/task-manager.md`
- `knowledge/screen-graphs/task-manager.md`
- `templates/web/task-manager/template-spec.json`
- `templates/web/task-manager/TEMPLATE_PLAN.md`

## Output

Return:

- classification
- app spec
- references the builder should load next
- questions only if required by policy
