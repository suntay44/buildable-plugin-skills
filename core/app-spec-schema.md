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
  "mockData": {
    "strategy": "realistic-local-seed-data",
    "recordsPerEntity": "6-10",
    "rules": [
      "Use domain-specific names, labels, statuses, dates, and amounts instead of generic placeholders.",
      "Include enough variety to exercise filters, search, sorting, status chips, summaries, and empty states."
    ],
    "entities": [
      {
        "name": "Task",
        "minimumRecords": 6,
        "fieldsToPopulate": ["title", "description", "status", "priority", "dueDate", "tags"]
      }
    ],
    "requiredStates": ["populated", "empty", "filtered-empty", "loading-or-saving", "error-or-validation"]
  },
  "style": "modern productivity app",
  "designSystem": {
    "profile": "focused-productivity",
    "styleName": "Focused productivity",
    "visualTone": "calm, direct, repeat-use product UI",
    "palette": {
      "intent": "neutral surfaces with blue primary actions and status accents",
      "primary": "slate",
      "accent": "blue",
      "status": ["emerald", "amber", "rose"]
    },
    "typography": {
      "mood": "clear system sans",
      "scale": "compact product scale"
    },
    "density": "compact",
    "layoutRules": [
      "make the core workflow visible in the first viewport",
      "keep filters and primary actions near the list they affect"
    ],
    "componentRules": [
      "include clear create/edit/delete or complete actions",
      "show status chips with text labels, not color alone"
    ],
    "motion": "subtle 150-200ms state transitions",
    "accessibility": ["visible labels", "focus-visible states", "keyboard reachable actions"],
    "avoid": ["marketing hero layout inside the app", "decorative cards with no workflow value"]
  },
  "blocks": [
    {
      "id": "web/filterable-table",
      "name": "Filterable Table",
      "role": "entity-list",
      "target": "web",
      "reason": "Filterable Table fits task-manager as an entity-list block.",
      "needs": ["primary entity with status/category/date fields", "6+ realistic records"],
      "references": ["blocks/web/filterable-table/BLOCK.md", "knowledge/ui-patterns/tables.md", "knowledge/ui-patterns/filters.md"]
    }
  ],
  "template": "templates/web/task-manager/template-spec.json",
  "templateStatus": "runnable",
  "generationMode": "runnable-starter",
  "references": [
    "knowledge/archetypes/task-manager.md",
    "knowledge/data-models/task-manager.md",
    "knowledge/screen-graphs/task-manager.md",
    "templates/web/task-manager/TEMPLATE_PLAN.md"
  ],
  "referenceInputs": [
    {
      "path": "./mockup.png",
      "absolutePath": "/Users/me/app/mockup.png",
      "name": "mockup.png",
      "kind": "screenshot",
      "exists": true,
      "sizeBytes": 48211,
      "inspectInstruction": "Inspect visually and extract layout, hierarchy, content, components, colors, density, and interaction clues before design/build. Do not invent unseen details."
    }
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
  "questions": [],
  "planAudit": {
    "mode": "audit-first",
    "instruction": "Builders must read this plan before editing.",
    "checks": [
      {
        "id": "scope",
        "status": "ready",
        "gate": "Scope is concrete enough to generate."
      }
    ],
    "failurePolicy": ["If scope is blocked, ask appSpec.questions before generating."]
  },
  "promptRefinement": {
    "mode": "optional",
    "instruction": "Ask up to two optional questions if the user seems undecided; otherwise proceed with defaults.",
    "assumptions": ["Prototype stays local-first with realistic mock data."],
    "optionalQuestions": [
      {
        "id": "audience",
        "question": "Who is the first real user?",
        "why": "This changes navigation, copy, density, and sample data.",
        "defaultAnswer": "An internal operator using it repeatedly."
      }
    ],
    "nextPromptExample": "Keep this plan, but make the first workflow sharper."
  }
}
```

## Rules

- Keep specs concrete enough that a builder can generate code without asking for visual taste preferences.
- Include `designSystem` so builders get compact UI/UX direction without loading every design playbook.
- Include `blocks` so builders get selected reusable micro-template guidance without scanning every block. Blocks are selected planning guidance, not automatic code composition.
- Include `mockData` so design and build phases use realistic local seed data, not generic placeholders.
- Include `referenceInputs` when users attach screenshots, documents, or files. Keep them separate from bundled `references`; agents should inspect only those explicit user files plus `appSpec.references`.
- Include `auth` only when the user asks for auth/login/accounts or uses an explicit auth flag. Default to local/mock auth shape behind an auth seam; record a named provider only when the user names one.
- Prefer local/mock data until the prompt explicitly asks for persistence, accounts, collaboration, or integration.
- Include `referenceLoadingContract` so agents keep Buildable context loading lightweight.
- Include `mustNotInclude` to prevent hosted-platform drift.
- Include `templateStatus` and `generationMode` so builders know whether `generate` produced runnable code or a plan-only instruction pack.
- Entity fields should be concrete enough for builders and reviewers to recognize the domain model in source files.
- Set `questionsNeeded` when architecture-changing choices require user direction.
- Include `planAudit` so builders and reviewers treat the plan as an audit-first contract before writing code. Checks should cover scope, template status, references, mock data, UI/UX, local-first guardrails, auth/persistence, and review.
- Include `promptRefinement` so agents can ask useful no-code-builder-style follow-up questions without blocking every clear prompt. Blocking questions still live in `questions`; optional refinement questions should include defaults so the user can proceed quickly.
- Acceptance criteria should be testable by a reviewer.

## Machine Schema

The JSON Schema form lives at `core/schemas/app-spec.schema.json`. The CLI also performs lightweight built-in validation so `buildable plan` and `buildable generate` stay usable without extra dependencies.
