# Template Spec Schema

Template specs describe golden-template assets in a machine-readable way.

## Schema

```json
{
  "name": "web-task-manager",
  "target": "web",
  "archetype": "task-manager",
  "stack": {
    "framework": "Next.js",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "data": "local-state"
  },
  "status": "planned",
  "references": [
    "knowledge/archetypes/task-manager.md",
    "knowledge/data-models/task-manager.md",
    "knowledge/screen-graphs/task-manager.md",
    "templates/web/task-manager/TEMPLATE_PLAN.md"
  ]
}
```

## Required Fields

- `name`: stable template identifier.
- `target`: `web` or `mobile`.
- `archetype`: matching bundled archetype id.
- `stack`: framework, language, styling, and data mode.
- `status`: `planned`, `starter`, or `runnable`.
- `references`: files the planner/builder should load before generation.

## Status Values

- `planned`: template plan exists, but no runnable starter app yet.
- `starter`: partial starter files exist and need adaptation.
- `runnable`: template can be copied and run locally.

## Rules

- References should stay local to the repository.
- Every template should include an adjacent `TEMPLATE_PLAN.md`.
- Do not reference hosted services, remote template registries, cloud previews, managed databases, telemetry, or deployment dependencies.

## Machine Schema

The JSON Schema form lives at `core/schemas/template-spec.schema.json`. The CLI performs dependency-free validation for required fields, valid statuses, adjacent `TEMPLATE_PLAN.md` references, and runnable starter directories.
