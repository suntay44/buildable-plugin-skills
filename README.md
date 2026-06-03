# Buildable

**Local-first AI app-builder brain for Claude Code, Codex, and Cursor.**

Buildable gives your coding agent the product intelligence that hosted no-code builders (Lovable, Replit Agent, Base44, Emergent) hide behind their infrastructure — archetypes, golden templates, UI/UX playbooks, and a review loop — so it goes from a vague prompt to a polished prototype, using only a small slice of context per request.

It does **not** replace your agent or run as a hosted platform. It is a file-based skills/plugin package that runs locally.

---

## Contents

- [Why Buildable](#why-buildable)
- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Install as a plugin](#install-as-a-plugin)
- [CLI commands](#cli-commands)
- [Templates](#templates)
- [How much it guides](#how-much-it-guides)
- [Token efficiency](#token-efficiency)
- [Supported app types](#supported-app-types)
- [Non-goals](#non-goals)
- [Repository map](#repository-map)
- [Contributing](#contributing)
- [License](#license)

---

## Why Buildable

A raw coding agent starts every app from a blank slate. Hosted builders feel magical because they already know what a "todo app" or "CRM" should contain. Buildable packages that same knowledge locally:

- **Curated archetypes** — 55 app types with default screens, entities, and interactions.
- **Golden templates** — runnable, build-verified starters the agent adapts instead of inventing.
- **UI/UX playbooks** — patterns for forms, tables, filters, empty states, and responsive layout.
- **Plan + review loop** — a CLI that classifies prompts, emits an app spec, and audits the result.
- **Progressive loading** — the agent reads only the references a prompt needs, not the whole repo.

## How it works

```txt
user prompt
  → buildable plan      classify → archetype → app spec + references
  → agent implements    adapt the golden template locally (mock data by default)
  → buildable review    audit structure, features, guardrails, and (optionally) the build
  → agent fixes issues
```

Buildable guides product structure but leaves implementation to your agent and your repo conventions.

## Quick start

```bash
npm install
npm link
buildable check
buildable plan "Build me a lightweight CRM"
buildable generate "Build me a todo app" --out ./taskflow
buildable review ./taskflow --build
```

Prefer not to link a global command? Run through Node:

```bash
node ./bin/buildable.mjs check
node ./bin/buildable.mjs plan "Build me a mobile habit tracker"
```

See [docs/install.md](docs/install.md) for Codex Desktop, Claude Code, Cursor, and CLI setup notes.

## Install as a plugin

### Claude Code

Buildable ships a plugin manifest (`.claude-plugin/plugin.json`) and a local marketplace (`.claude-plugin/marketplace.json`):

```txt
/plugin marketplace add /absolute/path/to/Buildable
/plugin install buildable@buildable
```

This auto-discovers the planner, web-builder, mobile-builder, and reviewer skills and registers four slash commands:

| Command | What it does |
| --- | --- |
| `/buildable-plan` | Classify a prompt and print an app spec |
| `/buildable-generate` | Copy a runnable starter or write a plan pack |
| `/buildable-review` | Audit a prototype (`--build` runs typecheck/build) |
| `/buildable-init` | Make the current workspace Buildable-aware |

### Cursor

Use the slash commands in `.cursor/commands/` plus the rule at `.cursor/rules/buildable.mdc`.

### Codex

Load `.codex-plugin/plugin.json`.

## CLI commands

| Command | Purpose |
| --- | --- |
| `buildable plan "<prompt>"` | Classify a prompt and print the app spec as JSON |
| `buildable generate "<prompt>" --out <dir>` | Copy a runnable starter (`--plan-pack` for planned templates) |
| `buildable review [path] [--build]` | Audit a prototype; `--build` runs typecheck/build |
| `buildable init [--existing]` | Create `.buildable` config for a workspace |
| `buildable check` | Verify local assets, adapters, and template references |
| `buildable list` | List archetypes and runnable/planned template status |
| `buildable eval` | Score classification fixtures and context-load efficiency |

`plan` emits an `enhancedPrompt` and `appSpec` with the selected archetype, target, stack, template, references, expected features, acceptance criteria, and no-hosted-feature guardrails. Matching uses compact tags in `core/archetype-registry.json`, so the agent classifies against one small registry instead of reading every archetype file.

### Three local workflows

- **`init`** — make a workspace Buildable-aware. Use `--existing` inside an app to profile the repo without overwriting code.
- **`generate`** — create a runnable starter, or a `--plan-pack` instruction pack for planned templates.
- **`review`** — judge and improve the result against the app spec and local-first guardrails.

## Templates

Runnable starters copy real, build-verified source. Planned templates write a `--plan-pack` instruction pack instead.

| Template | Target | Status |
| --- | --- | --- |
| `templates/web/task-manager` | web | ✅ runnable |
| `templates/web/crm` | web | ✅ runnable |
| `templates/web/dashboard` | web | ✅ runnable |
| `templates/web/marketplace` | web | ✅ runnable |
| `templates/web/notes` | web | ✅ runnable |
| `templates/web/ecommerce-admin` | web | ✅ runnable |
| `templates/mobile/habit-tracker` | mobile | ✅ runnable |
| `templates/web/generic-app`, others | web/mobile | 📝 planned |

- **Default web stack:** Next.js, TypeScript, Tailwind CSS, shadcn-style patterns, local/mock data.
- **Default mobile stack:** Expo, React Native, TypeScript, NativeWind, Expo Router, local/mock data.

### Fresh start vs existing app

```bash
# Fresh: copy a runnable starter and an app spec
buildable generate "Build me a todo app" --out ./taskflow

# Existing: profile the app and get guidance without overwriting code
cd my-existing-app
buildable init --existing
buildable plan "Add a booking workflow to this app"
buildable review .
```

## How much it guides

Buildable applies three levels of guidance so it reduces blank-page ambiguity without overstepping.

- **Defaults (applied automatically)** — task managers get create/edit/delete/complete/reopen; dashboards get metrics, charts/tables, filters, empty states; forms get labels and validation; prototypes get meaningful sample data; local/mock data is the default.
- **Recommendations (agent may adapt)** — task priority/due dates/tags, CRM stage summaries, dashboard date ranges, mobile-first touch layouts.
- **Ask first (never decided silently)** — auth, database/persistence, payments, collaboration/roles, external APIs, notifications, maps/camera/device permissions, deployment. `buildable generate` pauses when these appear in a prompt unless you force it.

## Token efficiency

Buildable is built for progressive loading — agents should never load the whole repository:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

This rule ships in every plan as `appSpec.referenceLoadingContract` (source: `core/reference-loading-contract.md`). `buildable eval` measures it: across the golden fixtures, each plan loads **~9 references ≈ 9% of the bundled brain**, so roughly **90% of context tokens are saved** versus loading everything. Discovery without reading every file goes through `knowledge/INDEX.md` and `templates/INDEX.md`.

## Supported app types

V1 targets common prototype categories, all tag-matched via `core/archetype-registry.json`:

- **Productivity** — task manager, notes/knowledge, project management, time/expense/invoice trackers, calendars
- **Business** — CRM, SaaS dashboard, marketplace, ecommerce/admin, inventory, hiring, helpdesk, knowledge base
- **Sites** — landing pages, portfolios, blogs/CMS, restaurants, real estate, job boards, directories, docs
- **Lifestyle/mobile** — habit/fitness trackers, booking, travel, meal/recipe, personal finance, subscriptions
- **Community** — forums, chat, membership, volunteer, events, donations, surveys/forms
- **Operations** — property management, field service, asset tracking, maintenance, clinic intake

## Non-goals

Buildable V1 does **not** include billing, builder accounts, cloud previews, managed databases, hosted deployments, telemetry, or central template services. Those may become optional extensions later — the core works from a local repository.

## Repository map

```txt
core/           Prompt classification, app spec, workflow, ask-vs-build policy
knowledge/      Archetypes, data models, screen graphs, UI patterns, playbooks, rubrics
templates/      Golden templates (5 runnable starters + planned specs)
skills/         Agent skills: planner, web-builder, mobile-builder, reviewer
commands/       Claude Code slash commands
adapters/       Codex, Claude, Cursor integration notes
bin/            Dependency-free CLI entrypoint
scripts/        Maintenance scripts (starter config sync)
.claude-plugin/ Claude Code plugin manifest + local marketplace
.codex-plugin/  Codex Desktop plugin manifest
.cursor/        Cursor rule and slash commands
evals/          Prompts, fixtures, and scoring rubric (buildable eval)
examples/       Generated reference apps
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: contribute concrete builder intelligence (archetypes, templates, UI patterns, eval fixtures), keep everything local-first, and include a fixture prompt + acceptance checklist.

## License

MIT — see [LICENSE](LICENSE).
