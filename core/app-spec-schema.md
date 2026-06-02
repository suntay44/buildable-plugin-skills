# App Spec Schema

The app spec is the build contract between planner, builder, reviewer, and fixer.

## Schema

```json
{
  "name": "TaskFlow",
  "target": "web",
  "archetype": "task-manager",
  "complexity": "simple-prototype",
  "stack": {
    "framework": "Next.js",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "data": "local-state"
  },
  "screens": [
    {
      "id": "dashboard",
      "purpose": "Create, review, filter, and complete tasks"
    }
  ],
  "entities": [
    {
      "name": "Task",
      "fields": [
        "id",
        "title",
        "description",
        "status",
        "priority",
        "dueDate",
        "tags",
        "createdAt"
      ]
    }
  ],
  "features": [
    "create task",
    "edit task",
    "delete task",
    "mark complete",
    "filter by status",
    "search tasks",
    "show empty state"
  ],
  "sampleData": "meaningful",
  "style": "modern productivity app",
  "template": "templates/web/task-manager/template-spec.json",
  "templateStatus": "runnable",
  "generationMode": "runnable-starter",
  "references": [
    "knowledge/archetypes/task-manager.md",
    "knowledge/data-models/task-manager.md",
    "knowledge/screen-graphs/task-manager.md",
    "templates/web/task-manager/TEMPLATE_PLAN.md"
  ],
  "referenceLoadingContract": [
    "Do not load all templates.",
    "Run buildable plan.",
    "Load only appSpec.references.",
    "Load starter source only for the selected template."
  ],
  "mustNotInclude": [
    "auth unless requested",
    "database unless requested",
    "billing",
    "cloud deployment"
  ],
  "acceptanceCriteria": [
    "first screen is usable immediately",
    "all core task actions work locally",
    "empty state is present",
    "layout works on mobile and desktop"
  ],
  "questionsNeeded": false,
  "questions": []
}
```

## Rules

- Keep specs concrete enough that a builder can generate code without asking for visual taste preferences.
- Prefer local/mock data until the prompt explicitly asks for persistence, accounts, collaboration, or integration.
- Include `referenceLoadingContract` so agents keep Buildable context loading lightweight.
- Include `mustNotInclude` to prevent hosted-platform drift.
- Include `templateStatus` and `generationMode` so builders know whether `generate` produced runnable code or a plan-only instruction pack.
- Entity fields should be concrete enough for builders and reviewers to recognize the domain model in source files.
- Set `questionsNeeded` when architecture-changing choices require user direction.
- Acceptance criteria should be testable by a reviewer.

## Machine Schema

The JSON Schema form lives at `core/schemas/app-spec.schema.json`. The CLI also performs lightweight built-in validation so `buildable plan` and `buildable generate` stay usable without extra dependencies.
