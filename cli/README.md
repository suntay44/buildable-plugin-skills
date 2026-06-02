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
buildable generate "build me a todo app" --out ./taskflow
buildable generate "build me a CRM" --out ./crm-plan --plan-pack
buildable review ./taskflow
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
- plugin resources stay scoped to indexes, contracts, schemas, and selected template specs rather than broad directories

## Fresh Start

Use `generate` when there is no app yet:

```bash
buildable generate "Build me a todo app" --out ./taskflow
buildable review ./taskflow
```

`generate` selects a template and writes `buildable-app-spec.json` plus `BUILDABLE_NOTES.md` for Codex, Claude, Cursor, or another local agent. If the selected template is runnable, it copies starter files. If the selected template is planned, rerun with `--plan-pack` to write a plan-only `IMPLEMENTATION_PLAN.md` instruction pack instead of claiming runnable code exists.

Current runnable starter coverage:

- runnable: `templates/web/task-manager`
- planned instruction packs: generic web/mobile, CRM, dashboard, marketplace, mobile task-manager, habit tracker, and booking

## Existing App

Use `init --existing` when the user already has an app:

```bash
cd my-existing-app
buildable init --existing
buildable plan "Add a CRM lead tracker"
buildable review .
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
