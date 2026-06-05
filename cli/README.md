# Buildable CLI

Standalone local CLI wrapper for enhanced prompting, local starter generation, and validation of Buildable's local agent assets.

The CLI is intentionally dependency-free and file-based. It reads this repository, emits enhanced prompts and JSON specs for agents, and avoids hosted services.

## Install

From the repository root:

```bash
npm install
npm link
buildable check
```

Without a global link:

```bash
node ./bin/buildable.mjs check
```

## Commands

```bash
buildable help
buildable list
buildable list --json
buildable plan "build me a todo app"
buildable init --existing
buildable generate "build me a todo app"
buildable generate "build me a CRM" --plan-pack
buildable review
buildable check
buildable check --json
```

## What `plan` Emits

`buildable plan` prints an enhanced prompt and app spec with:

- the original prompt
- a lightweight classification
- an `enhancedPrompt` agents can use directly
- selected target platform and archetype
- stack, template spec path, template status, and generation mode
- expected screens, entities, features, sample data, and acceptance criteria
- local reference files for the agent to read next
- no-hosted-features guardrails

Archetype classification is tag-routed through `core/archetype-registry.json`; agents should not scan every file in `knowledge/archetypes/`.

Example:

```bash
buildable plan "Build a mobile habit tracker"
```

Use `plan` when the user wants direction before files are created. It is the no-code prompting layer: classify, choose the right references, identify questions, then let Claude, Codex, Cursor, or another agent implement from the spec.

## Reference Loading Contract

Agents should use `plan` as the routing source:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

The same rule is emitted in every plan as `appSpec.referenceLoadingContract`.

## What `check` Verifies

`buildable check` verifies that the local install surface is usable:

- required root, CLI, adapter, Cursor, and Codex plugin files exist
- required core skills and evaluation files exist
- archetype registry entries have tags and matching knowledge files
- template spec files are readable
- template references point to existing local files
- Codex plugin skills and resources resolve locally
- every file a plan can reference is *available* to the Codex plugin (the manifest exposes `knowledge/` and `templates/`), and `check` verifies that coverage

### Available to the plugin vs loaded by the agent

These are two different things. The Codex manifest *exposes* `knowledge/` and `templates/` so any `appSpec.references` target can be resolved — that is availability. It does **not** mean the agent loads those directories. At runtime the agent loads only the exact files in `appSpec.references`, per `core/reference-loading-contract.md`. The token-efficiency story is about what is *loaded*, not what is *available*.

## Fresh Start

Use `generate` when there is no app yet:

```bash
buildable generate "Build me a todo app"
cd taskflow
buildable review
```

`generate` selects a template and writes `buildable-app-spec.json` plus `BUILDABLE_NOTES.md` for Codex, Claude, Cursor, or another local agent. If `--out` is omitted, it creates a folder from the app name, such as `TaskFlow` -> `./taskflow`. If the selected template is runnable, it copies starter files. If the selected template is planned, rerun with `--plan-pack` to write a plan-only `IMPLEMENTATION_PLAN.md` instruction pack instead of claiming runnable code exists.

Use `generate` when the user wants Buildable to create the local starting point instead of asking the agent to reproduce template structure from the plan alone.

Current runnable starter coverage:

- runnable web: `templates/web/task-manager`, `templates/web/crm`, `templates/web/dashboard`, `templates/web/marketplace`, `templates/web/notes`, `templates/web/ecommerce-admin`
- runnable mobile: `templates/mobile/habit-tracker`, `templates/mobile/booking`, `templates/mobile/task-manager`
- planned instruction packs: `templates/web/generic-app`, `templates/mobile/generic-app`, plus dedicated mobile packs for expense tracker, travel planner, fitness tracker, meal planner, chat app, subscription tracker, maintenance request, and field service

## Existing App

Use `init --existing` when the user already has an app:

```bash
cd my-existing-app
buildable init --existing
buildable plan "Add a CRM lead tracker"
buildable review
```

This profiles the app and writes local Buildable context without copying a full template over existing code.

## V1 Principle

The CLI should orchestrate local files, enhanced prompts, and agent-readable specs. It should not require hosted services or overrule the coding agent's repo-aware implementation decisions.

## Oversteering Rule

Buildable may strongly define expected product shape for common app types. It must not silently choose architecture-changing features such as auth, databases, payments, collaboration, external APIs, notifications, maps, camera access, or deployment.

## Current Scope

- `init` creates local Buildable workspace context.
- `plan` performs lightweight prompt classification and emits an app spec with references.
- `generate` copies runnable local starters or writes plan-only instruction packs, then writes an app spec.
- `review` audits local prototypes against app spec structure, source representation, and local-first guardrails, then writes `.buildable/review-report.md`.
- `check` verifies that core Buildable files, template references, template statuses, and scoped plugin resources exist.
- `list` prints bundled template specs with runnable/planned status for quick inspection.
