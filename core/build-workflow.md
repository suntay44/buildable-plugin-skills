# Build Workflow

Buildable behaves like a local app-generation compiler.

## 1. Classify

Read the user prompt and produce a routing decision:

- target
- archetype
- complexity
- whether questions are needed

## 2. Generate Enhanced Prompt And App Spec

Turn the prompt and archetype into:

- an enhanced prompt the agent can use directly
- a concrete app spec with screens, entities, features, sample data expectations, non-goals, and acceptance criteria

## 3. Load References

Load only the references needed for the app:

```txt
knowledge/archetypes/<archetype>.md
knowledge/ui-patterns/<needed-pattern>.md
knowledge/design-playbooks/<style>.md
knowledge/quality-rubrics/<target>-app.md
templates/<target>/<archetype>/
```

Template metadata should follow `core/template-spec-schema.md`.

## 4. Generate

Create or adapt a local app from the selected golden template. Use the project conventions when generating inside an existing app.

## 5. Review

Run build/typecheck/lint checks when available. Inspect the generated UI and behavior against the app spec and quality rubric.

## 6. Fix

Fix build failures, missing interactions, empty states, accessibility issues, and responsive layout problems before returning final output.

## Local-First Defaults

- use local state or mock data
- ship sample data
- avoid backend infrastructure unless requested
- avoid hosted deployment assumptions
- keep generated projects easy to inspect and modify
