# Cursor Adapter

The Cursor adapter exposes Buildable as Cursor rules, prompts, and local template commands.

## Local Setup

1. Open this repository in Cursor, or copy `.cursor/rules/buildable.mdc` into another workspace that should use Buildable.
2. Keep this checkout available so Cursor can read the local `core/`, `knowledge/`, `templates/`, `skills/`, and `evals/` files.
3. Run `buildable check` from this repository root.
4. Use `buildable plan "<prompt>"` when Cursor needs a concrete app spec before generation.

## Included Behavior

- rule files for ask-vs-build policy and generation workflow
- references to archetypes and quality rubrics
- local template spec selection through `buildable plan`

## Guardrail

Cursor should generate local prototypes with mock/local data by default. Do not add billing, accounts, cloud previews, managed databases, telemetry, hosted deployments, or central template services unless explicitly requested.
