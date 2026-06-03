<div align="center">
<img width="1927" height="816" alt="ChatGPT Image Jun 3, 2026, 03_08_16 AM" src="https://github.com/user-attachments/assets/3d356b2e-6c44-4c99-bbc7-7c6f488c0c01" />

### ⭐ Stars are appreciated!

**Local-first AI app-builder brain for Claude Code, Codex, and Cursor.**

Buildable gives your coding agent the product intelligence that hosted no-code builders (Lovable, Replit Agent, Base44, Emergent) hide behind their infrastructure — archetypes, golden templates, UI/UX playbooks, and a review loop — so it goes from a vague prompt to a polished prototype, using only a small slice of context per request.

It does **not** replace your agent or run as a hosted platform. It is a file-based skills/plugin package that runs locally. Buildable is independent and is not affiliated with, endorsed by, or sponsored by those products.


<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Works with Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-darkorange)](https://claude.ai/code)
[![Works with Codex](https://img.shields.io/badge/Codex-Plugin-blue)](https://chatgpt.com/codex)
[![Works with Cursor](https://img.shields.io/badge/Cursor-Plugin-black)](https://cursor.sh)
[![Expo React Native](https://img.shields.io/badge/Target-Expo%20React%20Native-4630EB)](https://expo.dev)

<br />
</div>


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
- [Templates catalog](#templates-catalog)
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
buildable plan "Build me a task manager"
buildable generate "Build me a task manager"
cd taskflow
buildable review
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

This auto-discovers the planner, web-builder, mobile-builder, and reviewer skills and registers these slash commands:

| Command | What it does |
| --- | --- |
| `/buildable-plan` | Classify a prompt and print an app spec |
| `/buildable-generate` | Copy a runnable starter or write a plan pack |
| `/buildable-review` | Audit a prototype (`--build` runs typecheck/build) |
| `/buildable-preview` | Optional: render the running app, screenshot it, catch runtime errors |
| `/buildable-init` | Make the current workspace Buildable-aware |

### Cursor

Use the slash commands in `.cursor/commands/` plus the rule at `.cursor/rules/buildable.mdc`.

### Codex

Load `.codex-plugin/plugin.json`.

## CLI commands

| Command | Purpose |
| --- | --- |
| `buildable plan "<prompt>"` | Classify a prompt and print the app spec as JSON |
| `buildable generate "<prompt>" [--out <dir>]` | Copy a runnable starter; defaults to a folder from the app name (`--plan-pack` for planned, `--name "X"` to brand, `--augment` to plan into an existing app) |
| `buildable review [path] [--build]` | Audit the current app by default; optional path reviews another folder, optional `--build` runs typecheck/build |
| `buildable preview [path] --url <url>` | Optional: render the running app in a headless browser; screenshot + catch runtime errors |
| `buildable init [--existing]` | Create `.buildable` config for a workspace |
| `buildable check` | Verify local assets, adapters, and template references |
| `buildable list` | List archetypes and runnable/planned template status |
| `buildable eval [--compare]` | Score classification, efficiency, and spec quality (`--compare` vs a raw prompt) |

`plan` emits an `enhancedPrompt` and `appSpec` with the selected archetype, target, stack, template, references, expected features, acceptance criteria, and no-hosted-feature guardrails. Matching uses compact tags in `core/archetype-registry.json`, so the agent classifies against one small registry instead of reading every archetype file.

### Three local workflows

- **`init`** — make a workspace Buildable-aware. Use `--existing` inside an app to profile the repo without overwriting code.
- **`generate`** — create a runnable starter, or a `--plan-pack` instruction pack for planned templates. If `--out` is omitted, Buildable creates a folder from the app name.
- **`review`** — judge and improve the result against the app spec and local-first guardrails.

### Plan vs generate

- **Use `plan` when you want direction first.** It classifies the prompt, selects the archetype/template, lists the exact references the agent should load, and asks questions only for architecture-changing choices.
- **Use `generate` when you want local files created.** It runs the same planning step, then copies the selected runnable starter or writes a plan pack. Agents like Claude, Codex, and Cursor can execute from `plan`, but `generate` saves them from recreating the starter structure by hand.

### Review

`buildable review` audits the app spec, structure, and local-first guardrails. Add `--build` only when you also want it to run installed typecheck/build scripts. This is the core check after generating or editing an app.

<details>
<summary><strong>Optional: visual preview</strong> (for headless/CI or agents without a screenshot tool)</summary>

Most of the time you can just open `localhost` yourself, and agents that already have a screenshot/preview tool (such as Claude Code's preview) should use that. `buildable preview` exists for the cases that have neither — a fully autonomous or CI run that still needs to know whether the page actually renders. Start the dev server, then:

```bash
buildable preview --url http://localhost:3000
```

It loads the page in a headless browser (Playwright — optional, resolved from the app or Buildable), writes `.buildable/preview.png`, and fails on a blank render or uncaught runtime errors — the visual issues `tsc`/`build` can't see. It is the only feature that needs a browser binary, so it stays optional and skips gracefully when Playwright is absent. It targets browser-rendered web apps today; native mobile visual checks would need a simulator and remain future work.

</details>

## Templates

Golden templates are Buildable's approved starting points. They come in two levels:

- **Runnable starters** copy real, build-verified source into the user's local folder.
- **Planned template packs** do not copy app source yet; they write a scoped `IMPLEMENTATION_PLAN.md`, `buildable-app-spec.json`, and reference list so Claude, Codex, Cursor, or another agent can implement the app without reading every template.

| Template | Target | Status |
| --- | --- | --- |
| `templates/web/task-manager` | web | ✅ runnable |
| `templates/web/crm` | web | ✅ runnable |
| `templates/web/dashboard` | web | ✅ runnable |
| `templates/web/marketplace` | web | ✅ runnable |
| `templates/web/notes` | web | ✅ runnable |
| `templates/web/ecommerce-admin` | web | ✅ runnable |
| `templates/mobile/habit-tracker` | mobile | ✅ runnable |
| `templates/mobile/booking` | mobile | ✅ runnable |
| `templates/mobile/task-manager` | mobile | ✅ runnable |
| `templates/web/generic-app` | web | 📝 planned fallback |
| `templates/mobile/expense-tracker` | mobile | 📝 planned |
| `templates/mobile/travel-planner` | mobile | 📝 planned |
| `templates/mobile/fitness-tracker` | mobile | 📝 planned |
| `templates/mobile/meal-planner` | mobile | 📝 planned |
| `templates/mobile/chat-app` | mobile | 📝 planned |
| `templates/mobile/subscription-tracker` | mobile | 📝 planned |
| `templates/mobile/maintenance-request` | mobile | 📝 planned |
| `templates/mobile/field-service` | mobile | 📝 planned |
| `templates/mobile/generic-app` | mobile | 📝 planned fallback |

- **Default web stack:** Next.js, TypeScript, Tailwind CSS, shadcn-style patterns, local/mock data.
- **Default mobile stack:** Expo, React Native, TypeScript, NativeWind, Expo Router, local/mock data.

### Fresh start vs existing app

```bash
# Fresh: copy a runnable starter and an app spec
buildable generate "Build me a todo app"
cd taskflow
buildable review

# Existing: profile the app and get guidance without overwriting code
cd my-existing-app
buildable init --existing
buildable plan "Add a booking workflow to this app"
buildable review
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
templates/      Golden templates (9 runnable starters + 10 planned specs)
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

## Templates catalog

See [TEMPLATES.md](TEMPLATES.md) for the full list of archetypes, golden templates, UI/UX playbooks, rubrics, and simple contribution instructions.

## License

MIT — see [LICENSE](LICENSE).
