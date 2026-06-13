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
buildable plan "build me a todo app" --toon
buildable plan "build me a todo app" --with-auth
buildable plan "use this screenshot for a CRM" --file ./crm-mockup.png
buildable design "build me a CRM website"
buildable design "design this login page" --page login --write
buildable init --existing
buildable generate "build me a todo app"
buildable generate "build me a CRM" --plan-pack
buildable review
buildable mcp
buildable check
buildable check --json
```

## What `plan` Emits

`buildable plan` prints an enhanced prompt and top-down app spec with:

- the original prompt
- a lightweight classification
- an `enhancedPrompt` agents can use directly
- selected target platform and archetype
- stack, template spec path, template status, and generation mode
- expected screens, entities, features, sample data, and acceptance criteria
- selected `blocks` with reusable micro-template guidance and block references
- `planAudit` with audit-first gates for scope, template, references, mock data, UI/UX, local-first rules, auth/persistence, and review
- `promptRefinement` with assumptions, optional sharpening questions, and default answers
- compact `designSystem` guidance with visual tone, palette intent, typography, density, layout/component rules, accessibility, and anti-patterns
- `mockData` guidance for realistic local seed data, populated states, empty states, filtered-empty states, loading/saving states, and validation/error states
- `phasePlan` and `planMarkdown` for the recommended Plan > Design > Generate > Review flow
- `referenceInputs` for explicit user screenshots/files passed with `--file`, `--reference`, or `--screenshot`
- local reference files for the agent to read next
- no-hosted-features guardrails

Archetype classification is tag-routed through `core/archetype-registry.json`; agents should not scan every file in `knowledge/archetypes/`.
If the prompt is too vague to choose product direction, `plan` asks first. For example, `buildable plan "I have a restaurant"` should clarify whether the user wants an informational website/menu, ordering or reservations, or an inventory/management system before design or generation.

Auth is opt-in but no longer means "pick a hosted provider." `buildable plan "Build a CRM with login"` or `--with-auth` adds `appSpec.auth`, `knowledge/auth/auth-shape.md`, and `knowledge/auth/auth-seam.md`. The default is local/mock auth with demo users, session states, protected-route shape, and an auth seam. If the user names a provider, keep it behind that seam and keep a local adapter for development.

Example:

```bash
buildable plan "Build a mobile habit tracker"
```

Use `plan` when the user wants direction before app files are created. It is the no-code prompting layer: classify, choose the right references, select compatible micro-blocks, identify blocking questions, suggest optional refinement questions with defaults, outline the phases, then let Claude, Codex, Cursor, or another agent continue from the spec. It saves `.buildable/phase-plan.json`, `.buildable/phase-plan.md`, and compact `.buildable/phase-plan.toon` in the current workspace by default. Add `--no-write` only when you want terminal output without workspace files.

For token-tight handoffs, `--toon` prints the compact TOON contract (`toon-style-v1`, ~80% smaller than the full JSON) and `--compact` prints slim JSON that drops the human `planMarkdown` render. TOON is built into the CLI — no install. The MCP `buildable_plan` tool returns the compact form by default; pass `verbose: true` for full JSON or `toon: true` for the TOON contract.

After showing a plan, agents should ask blocking questions first when `questionsNeeded` is true. When the plan is otherwise clear, ask at most one or two `promptRefinement.optionalQuestions` if they would improve the result; otherwise state the defaults and continue. If the user is not satisfied, keep using Buildable Planner and revise the saved plan from the user's next prompt, for example: `Buildable Planner: keep this direction, but make reminders stronger`. If yes, continue with Buildable Web Builder or Buildable Mobile Builder. The builder should read the saved plan/spec, then load only `appSpec.references`, explicit `appSpec.referenceInputs`, and the selected starter source.

When a user includes a screenshot, spec document, or existing file as a reference, pass it explicitly:

```bash
buildable plan "Make a CRM from this screenshot" --screenshot ./crm.png
buildable plan "Use this requirements doc" --file ./requirements.md
```

Buildable stores these as `appSpec.referenceInputs`. Agents should inspect only those explicit files plus `appSpec.references`; Buildable does not paste large file contents into the plan.

## What `design` Emits

`buildable design` creates a UI/UX design brief with:

- recommended workflow: `Plan > Design > Generate > Review`
- selected app context from a prompt or the current `buildable-app-spec.json`
- `scope: ui-ux-only`
- explicit non-goals: no backend, database, auth, payments, hosted infrastructure, telemetry, or deployment
- design system profile, visual tone, density, and anti-patterns
- concrete color, typography, spacing, radius, shadow, motion, and component tokens
- mockup-data guidance so the UI can be judged with realistic records and state coverage
- a handoff prompt for the agent
- a `nextSuggestedCommand`, usually `buildable generate "<prompt>"`
- references to load next

Use it interchangeably:

- before `plan` to explore visual direction from a prompt
- after `plan` to deepen `appSpec.designSystem`
- during implementation for one surface, for example `buildable design "design this login page" --page login`
- before `review` as a final polish brief

Add `--write` to save `.buildable/design-brief.json` and `.buildable/design-brief.md` in the current app workspace.

After showing a design brief, agents should ask whether the user is satisfied with the UI/UX direction and mockup-data plan. If yes, offer `nextSuggestedCommand` as the build phase. Users can also skip `design` and go directly from `plan` to `generate`; `plan` already includes compact `appSpec.designSystem` guidance.

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
- every file a plan can reference is *available* to the Codex plugin (the manifest exposes `blocks/`, `knowledge/`, and `templates/`), and `check` verifies that coverage

### Available to the plugin vs loaded by the agent

These are two different things. The Codex manifest *exposes* `blocks/`, `knowledge/`, and `templates/` so any `appSpec.references` target can be resolved — that is availability. It does **not** mean the agent loads those directories. At runtime the agent loads only the exact files in `appSpec.references`, per `core/reference-loading-contract.md`. The token-efficiency story is about what is *loaded*, not what is *available*.

## Slash Commands and MCP Tools

Buildable's lowest-token path is still command-first: run the CLI, Claude Code slash commands, Cursor commands/rules, or a Codex local plugin when that surface supports them. `buildable mcp` is the bridge for desktop and agent clients that support local MCP tools but cannot run repo slash commands directly.

`buildable mcp` starts a zero-dependency stdio MCP server and exposes the same core actions as tools:

- `buildable_plan`
- `buildable_design`
- `buildable_generate`
- `buildable_review`
- `buildable_init`
- `buildable_list`
- `buildable_check`
- `buildable_eval`
- `buildable_preview`

MCP tools call the same CLI engine and return compact JSON/spec output. They do not load all templates; agents should still inspect only `appSpec.references` and explicit `appSpec.referenceInputs`. Configure the server with an absolute path to `bin/buildable-mcp.mjs` and set `BUILDABLE_WORKSPACE` to the app folder the agent should operate on.

## Fresh Start

Use `generate` when there is no app yet:

```bash
buildable generate "Build me a todo app"
cd taskflow
buildable review
```

`generate` selects a template and writes `buildable-app-spec.json` plus `BUILDABLE_NOTES.md` for Codex, Claude, Cursor, or another local agent. If `--out` is omitted, it creates a folder from the app name, such as `TaskFlow` -> `./taskflow`. If the selected template is runnable, it copies starter files. If the selected template is planned, rerun with `--plan-pack` to write a plan-only `IMPLEMENTATION_PLAN.md` instruction pack instead of claiming runnable code exists. Planned packs are useful guidance, but they are not generated app source yet.

When `.buildable/phase-plan.json` exists and the prompt matches, `generate` reuses that saved audit-first plan instead of re-planning. It also writes `.buildable/phase-plan.json` and `.buildable/phase-plan.toon` into the generated app so later sessions can load compact context from the app folder.

Use `generate` when the user wants Buildable to create the local starting point instead of asking the agent to reproduce template structure from the plan alone.

Current runnable starter coverage:

- runnable web: `templates/web/task-manager`, `templates/web/crm`, `templates/web/dashboard`, `templates/web/marketplace`, `templates/web/notes`, `templates/web/ecommerce-admin`, `templates/web/landing-page`, `templates/web/portfolio`, `templates/web/blog-cms`, `templates/web/recipe-app`, `templates/web/job-board`, `templates/web/inventory-manager`
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
- `review` audits local prototypes against app spec structure, source representation, responsive-layout risk, accessibility signals, state coverage, design-token discipline, and local-first guardrails, then writes `.buildable/review-report.md`. It also prints an advisory **readiness** section — a spec-derived "what's left to productionize" list (mocked vs persisted data, mock vs named-provider auth, no deploy) that points at the persistence/auth seams without auto-adding anything. It is a static/local quality gate; use browser or device checks for final visual confidence.
- `mcp` exposes those same commands as local MCP tools for desktop/agent clients that cannot run project slash commands directly.
- `check` verifies that core Buildable files, template references, template statuses, and plugin resource coverage exist.
- `list` prints bundled template specs with runnable/planned status for quick inspection.
