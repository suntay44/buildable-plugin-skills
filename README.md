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
- [What it is](#what-it-is-and-when-to-use-it)
- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Install as a plugin](#install-as-a-plugin)
- [CLI commands](#cli-commands)
- [Slash commands and MCP](#slash-commands-and-mcp)
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
- **UI/UX system guidance** — compact design profiles plus patterns for forms, tables, filters, empty states, and responsive layout.
- **Plan + review loop** — a CLI that classifies prompts, emits an app spec, and audits the result.
- **Progressive loading** — the agent reads only the references a prompt needs, not the whole repo.

## What it is (and when to use it)

Buildable is a **product-structure compiler, compact UI/UX brain, and quality gate** for your coding agent: it decides *what* to build (archetype → screens, entities, features, states), gives the app a selected `designSystem`, copies a **runnable, build-verified starter**, and **reviews** the result (build, layout, accessibility, state coverage, local-first). It is not a hosted builder.

| | Buildable | Design plugins (e.g. Frontend Design) | Hosted builders (Lovable, v0, Replit) |
| --- | :---: | :---: | :---: |
| Decides product structure | ✅ | — | ✅ |
| Runnable, build-verified code | ✅ | — | hosted |
| Reviews / grades the output | ✅ | — | — |
| Local — your repo, your agent | ✅ | ✅ | — |
| Gives UI/UX direction | ✅ | ✅ | ✅ |
| Deep brand/art direction | guided | ✅ | ✅ |

**Pairs with dedicated design skills:** Buildable decides what to build, gives compact product-specific UI/UX direction, and proves it works; add a design skill when you want high-end brand exploration, custom art direction, or multiple visual concepts.

- **Use it when** you want consistent, real prototypes for common app types — fast, in your own stack, no lock-in.
- **Skip it when** you need a one-off component or throwaway script; a raw agent is enough.

## How it works

```txt
user prompt
  → buildable plan      clarify if needed → archetype → phase plan + app spec + references
  → buildable design    expand UI/UX direction into concrete tokens + mockup data + page rules
  → agent implements    adapt the golden template locally (mock data by default)
  → buildable review    audit structure, features, guardrails, and (optionally) the build
  → agent fixes issues
```

The recommended flow is **Plan > Design > Build > Review**. `plan` is the top-down phase map: it chooses the archetype/template, asks product-direction questions when the prompt is vague, includes compact `appSpec.designSystem`, and can write `.buildable/phase-plan.md` with `--write`. After planning, the agent should ask whether the user is satisfied. If not, stay in Buildable Planner and revise the saved plan; if yes, hand off to Buildable Web Builder or Buildable Mobile Builder, which reads the saved plan/spec and loads only the selected references. `design` deepens the plan into concrete UI/UX tokens, page rules, and realistic mockup-data guidance. `design` is interchangeable: use it before planning to explore direction, after planning to sharpen the UI, during implementation for a specific page/component, or before review as a polish brief.

## Quick start

```bash
npm install
npm link
buildable check
buildable plan "Build me a task manager" --write
buildable plan "Use this screenshot for a CRM" --file ./crm-mockup.png --write
buildable design "Build me a task manager"
buildable generate "Build me a task manager"
cd taskflow
buildable review
```

Prefer not to link a global command? Run through Node:

```bash
node ./bin/buildable.mjs check
node ./bin/buildable.mjs plan "Build me a mobile habit tracker" --write
```

See [docs/install.md](docs/install.md) for Codex Desktop, Claude Code, Cursor, and CLI setup notes.

## Install as a plugin

### Claude Code

Buildable ships a plugin manifest (`.claude-plugin/plugin.json`) and a local marketplace (`.claude-plugin/marketplace.json`):

```txt
/plugin marketplace add suntay44/buildable-plugin-skills
/plugin install buildable@buildable
```

This auto-discovers the planner, web-builder, mobile-builder, and reviewer skills and registers these slash commands:

| Command | What it does |
| --- | --- |
| `/buildable-plan` | Classify a prompt and print an app spec |
| `/buildable-design` | Create a UI/UX design brief from a prompt or current app spec |
| `/buildable-generate` | Copy a runnable starter or write a plan pack |
| `/buildable-review` | Audit a prototype (`--build` runs typecheck/build) |
| `/buildable-preview` | Optional: render the running app, screenshot it, catch runtime errors |
| `/buildable-init` | Make the current workspace Buildable-aware |

### Cursor

Use the slash commands in `.cursor/commands/` plus the rule at `.cursor/rules/buildable.mdc`.

### Codex

Load `.codex-plugin/plugin.json` when your Codex surface supports local plugins/skills. For desktop or tool clients that cannot run project slash commands directly, register the MCP bridge shown below.

## CLI commands

| Command | Purpose |
| --- | --- |
| `buildable plan "<prompt>" [--file <path>] [--write]` | Classify a prompt, preserve explicit screenshots/files as `appSpec.referenceInputs`, ask product-direction questions when needed, and print a top-down phase plan/app spec as JSON (`--write` saves `.buildable/phase-plan.md/json`) |
| `buildable design "<prompt>" [--page <surface>] [--write]` | Produce a UI/UX-only brief with concrete tokens, mockup-data guidance, and page/component rules; can use the current app spec |
| `buildable generate "<prompt>" [--out <dir>]` | Copy a runnable starter; defaults to a folder from the app name (`--plan-pack` for planned, `--name "X"` to brand, `--augment` to plan into an existing app) |
| `buildable review [path] [--build]` | Audit the current app by default; optional path reviews another folder, optional `--build` runs typecheck/build |
| `buildable preview [path] --url <url>` | Optional: render the running app in a headless browser; screenshot + catch runtime errors |
| `buildable init [--existing]` | Create `.buildable` config for a workspace |
| `buildable mcp` | Start the optional Buildable MCP stdio bridge for desktop/agent clients |
| `buildable check` | Verify local assets, adapters, and template references |
| `buildable list` | List archetypes and runnable/planned template status |
| `buildable eval [--compare]` | Score classification, efficiency, and spec quality (`--compare` vs a raw prompt) |

`plan` emits an `enhancedPrompt` and `appSpec` with the selected archetype, target, stack, template, design system, references, expected features, acceptance criteria, explicit user `referenceInputs`, and no-hosted-feature guardrails. Matching uses compact tags in `core/archetype-registry.json`, so the agent classifies against one small registry instead of reading every archetype file.

### Three local workflows

- **`init`** — make a workspace Buildable-aware. Use `--existing` inside an app to profile the repo without overwriting code.
- **`plan`** — create or revise the product direction. If the user is not satisfied, keep using Planner with a revision prompt like `Buildable Planner: keep this direction, but make reminders stronger`. If satisfied, hand off to the target builder.
- **`design`** — create a UI/UX-only design brief with realistic mockup-data guidance. Use it after `plan`, before `generate`, or mid-session for a page like `--page login`. It suggests the next `buildable generate` command, but agents should first ask whether the user is satisfied with the design direction.
- **`generate`** — create a runnable starter, or a `--plan-pack` instruction pack for planned templates. If `--out` is omitted, Buildable creates a folder from the app name.
- **`review`** — judge and improve the result against the app spec and local-first guardrails.

### Plan vs generate

- **Use `plan` when you want direction first.** It classifies the prompt, selects the archetype/template, lists the exact references the agent should load, outlines phases, and asks questions for product-direction or architecture-changing choices.
- **Revise in Planner until the direction feels right.** The planner should ask "Are you satisfied with this plan?" If no, revise the saved `.buildable/phase-plan.md/json`; if yes, continue with Buildable Web Builder or Buildable Mobile Builder using the saved plan/spec.
- **Use `--file`, `--reference`, or `--screenshot` when the user gives examples.** Buildable stores those paths in `appSpec.referenceInputs` so the agent can inspect only the explicit screenshots/files plus `appSpec.references`.
- **Use `design` when you want UI/UX direction sharpened.** It turns the selected `designSystem` into concrete colors, typography, spacing, motion, component emphasis, anti-patterns, and mockup-data guidance. It can run from a prompt or from an existing `buildable-app-spec.json`. It does not create backend, database, auth, payment, or deployment decisions.
- **Use `generate` when you want local files created.** It runs the same planning step, then copies the selected runnable starter or writes a plan pack. Agents like Claude, Codex, and Cursor can execute from `plan`, but `generate` saves them from recreating the starter structure by hand.

### Review

`buildable review` audits the app spec, source representation, local-first guardrails, responsive-layout risk, accessibility signals, and state coverage. Add `--build` only when you also want it to run installed typecheck/build scripts. It is a static/local quality gate, not a replacement for manual QA, browser screenshots, or real device/simulator checks when visuals matter.

## Slash Commands and MCP

Buildable is command-first. Use the lightest integration your agent surface supports:

- **Terminal / CLI:** run `buildable plan`, `buildable design`, `buildable generate`, `buildable review`, and the other commands above.
- **Project slash commands/rules:** Claude Code uses `/buildable-*`; Cursor uses `.cursor/commands/` and `.cursor/rules/buildable.mdc`; Codex can load the plugin manifest when local plugins are supported.
- **MCP bridge:** use `buildable mcp` only for desktop or agent tool clients that cannot run those project commands directly. The client sees local tools named `buildable_plan`, `buildable_design`, `buildable_generate`, `buildable_review`, `buildable_init`, `buildable_list`, `buildable_check`, `buildable_eval`, and `buildable_preview`.

MCP does not load the whole Buildable brain. Each tool calls the same CLI engine, which returns a compact plan/spec and the exact `appSpec.references` the agent should inspect. Keep `BUILDABLE_WORKSPACE` pointed at the app folder you want the desktop client to work in.

Example local MCP config:

```json
{
  "mcpServers": {
    "buildable": {
      "command": "node",
      "args": ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"],
      "env": {
        "BUILDABLE_WORKSPACE": "/absolute/path/to/your-app"
      }
    }
  }
}
```

Use that shape in Claude Desktop's local MCP settings, Cursor's `.cursor/mcp.json` / `~/.cursor/mcp.json`, or the equivalent Codex MCP config. For Codex config TOML, the same server is typically:

```toml
[mcp_servers.buildable]
command = "node"
args = ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"]
env = { BUILDABLE_WORKSPACE = "/absolute/path/to/your-app" }
```

This makes the same Buildable actions available in desktop apps, but the UI may show them as tools instead of slash commands. If a desktop app already supports project slash commands or a local plugin install, prefer that; use MCP as the compatibility bridge.

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

Only templates marked `✅ runnable` are copied by `buildable generate` without extra flags. Templates marked `📝 planned` need `buildable generate "<prompt>" --plan-pack`; that writes instructions and specs, not runnable source.

### What it generates

Real, unedited output — each rendered straight from a single prompt against its runnable starter:

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/web-task-manager.png" alt="Generated task manager"><br><sub><code>buildable generate "Build me a todo app"</code></sub></td>
    <td width="50%"><img src="docs/screenshots/web-crm.png" alt="Generated CRM"><br><sub><code>buildable generate "Build me a CRM for tracking leads"</code></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/web-dashboard.png" alt="Generated SaaS dashboard"><br><sub><code>buildable generate "Build me a SaaS analytics dashboard"</code></sub></td>
    <td width="50%"><img src="docs/screenshots/web-marketplace.png" alt="Generated services marketplace"><br><sub><code>buildable generate "Build me a marketplace for local services"</code></sub></td>
  </tr>
</table>

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
buildable plan "Add a booking workflow to this app" --write
buildable review
```

## How much it guides

Buildable applies three levels of guidance so it reduces blank-page ambiguity without overstepping.

- **Defaults (applied automatically)** — task managers get create/edit/delete/complete/reopen; dashboards get metrics, charts/tables, filters, empty states; forms get labels and validation; prototypes get meaningful sample data; local/mock data is the default.
- **Design system (applied automatically)** — every plan includes `appSpec.designSystem`: visual tone, palette intent, typography mood, density, layout rules, component rules, motion, accessibility, and anti-patterns. Run `buildable design` only when you want a deeper UI/UX brief.
- **Mockup data (applied automatically)** — every plan includes `appSpec.mockData`: 6-10 realistic local records per entity, domain-specific values, edge cases, and populated/empty/filtered/loading/error states so the design can be judged honestly before backend work exists.
- **Recommendations (agent may adapt)** — task priority/due dates/tags, CRM stage summaries, dashboard date ranges, mobile-first touch layouts, and product-specific UI choices.
- **Ask first (never decided silently)** — unclear product direction, auth, database/persistence, payments, collaboration/roles, external APIs, notifications, maps/camera/device permissions, deployment. `buildable plan "I have a restaurant"` asks what kind of restaurant product to build; `buildable generate` pauses when architecture-changing choices appear in a prompt unless you force it.

## Token efficiency

Agents load only the references a prompt needs (the `appSpec.referenceLoadingContract`), never the whole repo. Across the golden prompts, each plan loads **~9% of the bundled-brain reference bytes — about 91% less than loading the whole brain** — while still specifying, on average, **6 features, 9 typed entity fields, and 4 acceptance criteria** that a raw prompt gives you none of. (This measures Buildable's *bundled context*, not your total Claude/Codex session tokens.) Prove it yourself:

```bash
buildable eval --compare
```

## Supported app types

~55 common categories — task managers, CRMs, dashboards, marketplaces, notes, ecommerce admin, booking, habit/fitness trackers, blogs, job boards, inventory, and more (tag-matched via `core/archetype-registry.json`). See the full list and which are runnable in **[CONTRIBUTING.md](CONTRIBUTING.md)**.

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full list of archetypes, golden templates, UI/UX playbooks, rubrics, and simple contribution instructions.

## License

MIT — see [LICENSE](LICENSE).
