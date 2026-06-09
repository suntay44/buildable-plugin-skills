---
name: buildable-planner
description: Use when turning an app idea prompt into a Buildable classification, ask-vs-build decision, selected archetype, phase plan, reference set, mock-data guidance, and concrete local-first app spec.
---

# Buildable Planner Skill

Use this skill to classify prompts, choose an archetype, decide whether questions are needed, and produce a top-down phase plan plus app spec.

## Inputs

- user prompt
- optional user-provided screenshots, documents, or source files
- optional existing repository context
- optional local preferences

Resolve all referenced paths from the Buildable plugin or repository root.

## Activation

Use Buildable only for app planning, app generation, UI/UX product guidance, or prototype review. Do not activate globally for unrelated coding tasks.

## Reference Loading Contract

Mandatory order:

1. Run `buildable plan "<prompt>"` when available. Use `--file <path>`, `--reference <path>`, or `--screenshot <path>` for explicit user-provided files, and use `--write` when the user wants a workspace phase-plan markdown file.
2. Load only `appSpec.references`.
3. Inspect only explicit `appSpec.referenceInputs` supplied by the user.
4. Do not load all templates.
5. Do not load whole `knowledge/` or `templates/` directories.
6. Load starter source only for the selected template and only when generating or editing it.

Use `knowledge/INDEX.md` and `templates/INDEX.md` only for discovery when the CLI is unavailable.

## Workflow

0. Prefer `buildable plan "<prompt>"` when the CLI is available.
1. Use `core/archetype-registry.json` tags for lightweight matching before opening archetype docs.
2. Apply `core/ask-vs-build-policy.md`.
3. Apply `core/activation-policy.md`.
4. Load the selected `knowledge/archetypes/<archetype>.md`.
5. Load matching files from `knowledge/data-models/` and `knowledge/screen-graphs/` when they exist.
6. Select the best `templates/<target>/<archetype>/template-spec.json`.
7. Select compact UI/UX direction from `core/design-system-registry.json` and include it as `appSpec.designSystem`.
8. Include `appSpec.mockData` with realistic local seed-data guidance and state coverage.
9. Include `appSpec.referenceInputs` when users attach screenshots/files; preserve paths and inspection instructions without pasting file contents into the prompt.
10. Produce an app spec using `core/app-spec-schema.md`.
11. Include a phase plan: clarify if needed, plan, mock data, design, build, review.
12. Include explicit non-goals to prevent hosted feature drift.
13. End with a short satisfaction checkpoint:
   - If the user is not satisfied, ask them to stay in Buildable Planner and revise the saved plan with a prompt such as "Buildable Planner: keep this direction, but make the reminder features stronger."
   - If the user is satisfied, suggest the correct next skill for the target: Buildable Web Builder for web or Buildable Mobile Builder for mobile. The builder must read the saved `.buildable/phase-plan.json` or app spec, then load only `appSpec.references` and the selected starter source.

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
- phase plan
- selected `appSpec.designSystem`
- selected `appSpec.mockData`
- references the builder should load next
- explicit `appSpec.referenceInputs` the builder should inspect
- questions only if required by policy or vague product direction
- one short next-step question: "Are you satisfied with this plan? If not, continue with Buildable Planner to revise it. If yes, continue with Buildable Web Builder/Mobile Builder using the saved plan."
