# Buildable

Buildable is an open-source, local-first product-intelligence layer for Codex, Claude Code, Cursor, and CLI workflows.

It acts like an enhanced prompter and skills/plugin package for building web and native mobile app prototypes. Buildable does not replace the coding agent. It gives the agent better product context, stronger defaults, selected references, local templates, and review criteria.

The objective is to bring some of the “no-code AI builder” intelligence from tools like Lovable, Replit Agent, Base44, and Emergent into local developer workflows without becoming a hosted platform.

Buildable helps local coding agents move from a vague prompt to a more accurate implementation plan by packaging the product intelligence that hosted builders usually hide behind their infrastructure:

- curated app archetypes
- tag-based archetype matching
- golden template plans
- UI and UX playbooks
- prompt classification, enhanced prompts, and app specs
- review and fixer workflows

Buildable is not a hosted no-code platform. The first version is intentionally local, file-based, and agent-friendly.

## Product Model

Buildable should strongly guide product structure while avoiding unnecessary control over implementation.

```txt
user prompt
-> Buildable enhanced prompt and app spec
-> Codex/Claude/Cursor implements locally
-> Buildable review checks the result
-> agent fixes issues
```

It should not become:

```txt
user prompt
-> Buildable silently makes every architecture and design decision
-> hosted platform generates and deploys the app
```

## Enhanced Prompting Without Oversteering

Buildable uses three levels of guidance.

**Defaults**

Safe product expectations that should be applied automatically:

- task managers need create/edit/delete/complete/reopen flows
- dashboards need metrics, charts/tables, filters, and empty states
- forms need labels, validation, and accessible controls
- prototypes need meaningful sample data
- local/mock data is the default

**Recommendations**

Useful product refinements that agents can adapt:

- task priority, due dates, and tags
- CRM pipeline stage summaries
- dashboard date ranges and recent event tables
- mobile-first touch layout for habit and booking flows

**Ask First**

Architecture-changing choices that Buildable should not decide silently:

- auth
- database
- payments
- collaboration
- external APIs
- notifications
- maps/camera/device permissions
- deployment

The intended behavior is conservative: Buildable reduces blank-page ambiguity, but the coding agent still follows the user’s repo conventions and makes implementation decisions in context.

## Reference Loading Contract

Buildable is designed for progressive loading:

```txt
skill metadata
-> short SKILL.md workflow
-> knowledge/template indexes
-> exact files listed in appSpec.references
-> starter source only when generating or editing that template
```

Agents should not load the whole repository into context. The preferred path is:

```bash
buildable plan "<prompt>"
```

Then load only the `references` returned by the app spec. The indexes at `knowledge/INDEX.md` and `templates/INDEX.md` exist for discovery without reading every archetype, pattern, or starter file.

Mandatory agent rule:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

The same rule is emitted in every plan as `appSpec.referenceLoadingContract`. The source contract lives at `core/reference-loading-contract.md`.

## Activation And Approval

Buildable should not run as global background context. Use it only for app planning, app generation, UI/UX product guidance, or prototype review.

Buildable should ask for direction before architecture-changing features:

- auth/accounts
- databases/persistence
- payments/billing
- collaboration/roles
- external APIs/integrations
- notifications
- maps/camera/device permissions
- deployment/hosting

`buildable generate` pauses when these appear in the prompt unless the user explicitly forces generation.

## Install Locally

Buildable can be used directly from this repository. No hosted account, cloud preview service, telemetry endpoint, managed database, or central template service is required.

```bash
npm install
npm link
buildable check
buildable plan "Build me a lightweight CRM"
```

If you prefer not to link a global command, run the CLI through Node:

```bash
node ./bin/buildable.mjs check
node ./bin/buildable.mjs plan "Build me a mobile habit tracker"
```

See [docs/install.md](docs/install.md) for Codex Desktop, Claude Code, Cursor, and CLI setup notes.

## Install As A Claude Code Plugin

Buildable ships a Claude Code plugin manifest (`.claude-plugin/plugin.json`) and a local marketplace (`.claude-plugin/marketplace.json`). From Claude Code:

```txt
/plugin marketplace add /absolute/path/to/Buildable
/plugin install buildable@buildable
```

This auto-discovers the planner, web-builder, mobile-builder, and reviewer skills and registers four slash commands:

```txt
/buildable-plan      classify a prompt and print an app spec
/buildable-generate  copy a runnable starter or write a plan pack
/buildable-review    audit a prototype (add --build to run typecheck/build)
/buildable-init      make the current workspace Buildable-aware
```

Cursor users get the same commands from `.cursor/commands/` plus the rule at `.cursor/rules/buildable.mdc`. Codex users load `.codex-plugin/plugin.json`.

## CLI Quick Start

```bash
buildable help
buildable list
buildable check
buildable check --json
buildable eval
buildable plan "Build a marketplace for local services"
buildable generate "Build me a todo app" --out ./taskflow
buildable generate "Build me a CRM" --out ./crm
buildable review ./taskflow --build
```

`plan` emits an agent-readable `enhancedPrompt` and `appSpec` with the selected archetype, target platform, stack, template path, template status, local references, expected features, acceptance criteria, and no-hosted-features guardrails.

Archetype matching uses compact tags in `core/archetype-registry.json`. This is intentional: agents classify against one small registry, then load only the selected archetype doc and the `appSpec.references` returned by `plan`.

Runnable starters now cover the core categories: `templates/web/task-manager`, `templates/web/crm`, `templates/web/dashboard`, `templates/web/marketplace`, and `templates/mobile/habit-tracker` copy real, build-verified source. The remaining bundled templates are planned and require `--plan-pack` to write local implementation instructions instead of source code.

## Command Model

Buildable supports three local workflow commands around agent work:

- `init`: prepares a workspace for Buildable. Use `buildable init --existing` inside an existing app to create `.buildable/config.json`, profile the repo, and give Codex/Claude/Cursor local context without overwriting project code.
- `generate`: creates a fresh local starter when the selected template is runnable. For planned templates, add `--plan-pack` to write a plan-only instruction pack with `buildable-app-spec.json`, selected references, and implementation steps instead of pretending runnable code exists.
- `review`: audits an existing prototype against the app spec, archetype expectations, local file structure, and local-first guardrails. Use this after an agent creates or modifies an app.

In short:

```txt
init     = make a workspace Buildable-aware
generate = create a runnable starter or plan-only instruction pack
review   = judge and improve the result
```

## Fresh Start vs Existing App

Fresh start:

```bash
buildable generate "Build me a todo app" --out ./taskflow
```

For the web task-manager template, this copies a runnable local starter, writes `buildable-app-spec.json`, and gives the agent concrete implementation context. For planned templates, add `--plan-pack` to write an instruction pack that tells the agent what to build locally.

Existing app:

```bash
cd my-existing-app
buildable init --existing
buildable plan "Add a booking workflow to this app"
buildable review .
```

This profiles the app and emits guidance. It does not copy a full template over existing code.

## V1 Focus

Buildable V1 focuses on common prototype categories:

- task manager
- CRM
- SaaS analytics dashboard
- habit tracker
- booking or appointment app
- marketplace
- notes or knowledge app
- ecommerce/admin app
- landing pages and marketing sites
- portfolios
- blogs/CMS tools
- restaurants and local business sites
- real estate/property listings
- job boards
- learning/course apps
- expense, invoice, and time trackers
- project management tools
- support/helpdesk tools
- surveys/forms
- events
- travel, fitness, meal, and recipe apps
- calendars, personal finance, subscriptions, inventory, assets
- property management and field-service operations
- hiring, product feedback, issue tracking, and support knowledge bases
- documentation sites, newsletters, social-link pages, donation pages
- volunteer, membership, onboarding, client portal, podcast, video, clinic intake, maintenance, and directory apps
- community forums and chat apps
- file managers, galleries, and admin panels

Prompt matching uses tags from `core/archetype-registry.json`, so agents do not need to read every archetype file to classify a request.

The default web stack is Next.js, TypeScript, Tailwind CSS, shadcn-style component patterns, and local/mock data.

The default mobile stack is Expo, React Native, TypeScript, NativeWind, Expo Router when appropriate, and local/mock data.

## Non-Goals

Buildable V1 does not include:

- billing
- builder user accounts
- cloud previews
- managed databases
- hosted deployments
- telemetry
- central template services

Those may become optional extensions later. The core should work from a local repository.

## Repository Map

```txt
core/       Prompt classification, app spec, workflow, ask-vs-build policy
knowledge/  Bundled archetypes, UI patterns, design playbooks, rubrics
templates/  Golden templates; web task-manager/crm/dashboard/marketplace and mobile habit-tracker have runnable starters
skills/     Agent skills for planning, web/mobile building, and review
commands/   Claude Code slash commands (plan, generate, review, init)
adapters/   Codex, Claude, Cursor integration notes
bin/        Dependency-free local CLI entrypoint
cli/        CLI usage notes
.cursor/    Cursor rule and slash commands
.codex-plugin/ Codex Desktop plugin manifest
.claude-plugin/ Claude Code plugin manifest and local marketplace
evals/      Prompts, fixtures, and scoring rubric (buildable eval)
examples/   Generated reference apps
```

## Local Generation Loop

```txt
User prompt
-> classify app type
-> select archetype
-> generate app spec
-> apply golden template
-> generate code
-> review output
-> fix issues
```

## Current Status

This repository currently contains the foundational builder brain, multiple web/mobile template specs, agent adapters for Claude Code (plugin + slash commands), Codex, and Cursor, five runnable golden templates (web task-manager, CRM, dashboard, marketplace, and mobile habit-tracker), planned templates that generate instruction packs, a generated task-manager example, schema validation, an automated classification/efficiency eval, and tested local CLI commands for `init`, `plan`, `generate`, `review`, `check`, `list`, and `eval`.
# buildable-plugin-skills
