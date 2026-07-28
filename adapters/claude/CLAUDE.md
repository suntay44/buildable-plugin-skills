# Buildable Claude Instructions

Use Buildable when the user asks for a local app prototype or prompt-to-app generation.

## Local Context

Buildable is local repository context, not a hosted builder. Prefer `buildable plan "<prompt>"` when a concrete phase plan/app spec would help, then read only the relevant local files named by the spec.

## Workflow

1. Read `core/classifier.md`.
2. Apply `core/ask-vs-build-policy.md`.
3. Create an app spec using `core/app-spec-schema.md`.
4. Load the selected archetype, data model, screen graph, UI patterns, design playbook, quality rubric, and template plan.
5. Generate locally using mock/local data.
6. Review and fix before final response.

## Guardrail

Buildable V1 is not a hosted platform. Do not add builder accounts, billing, cloud previews, managed databases, telemetry, hosted deployments, central template services, or deployment features unless the user explicitly asks.
