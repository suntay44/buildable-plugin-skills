# Buildable Local AI App Builder Plan

## Vision

Buildable is an open-source, local-first AI app builder for developer users.

The goal is to bring the "prompt to polished working prototype" experience of tools like Lovable.dev, Emergent.sh, Replit Agent, and Base44 into desktop and CLI-based developer environments such as Codex, Claude, Cursor, and a standalone CLI.

Buildable is not a hosted no-code website builder. It is a local builder brain that helps AI coding agents generate better apps faster by giving them strong product patterns, templates, UI/UX rules, and validation workflows.

## Core Thesis

Do not rely on vague prompt magic.

Buildable should behave more like a local app-generation compiler:

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

For example:

```txt
Build me a todo app
```

Should not start from a blank slate. Buildable should already know that a polished todo app needs:

- task creation
- edit, delete, and complete actions
- filters
- search or grouping
- empty state
- sample data
- responsive layout
- accessible inputs
- clear visual hierarchy

## Why This Can Compete With Hosted Builders

Hosted builders feel magical because they reduce the search space.

They already know:

- common app structures
- good UI defaults
- expected screens
- likely data models
- runtime assumptions
- validation loops
- what a good enough prototype means

A raw coding agent has to figure all of that out from scratch.

Buildable gives local agents the same advantage by shipping:

- curated app archetypes
- golden templates
- UI/UX playbooks
- prompt enhancement rules
- generation checklists
- review and fixer workflows

## V1 Goal

Generate polished local prototypes for common app categories in under 30 to 90 minutes.

V1 should feel dramatically better than generic Claude, Codex, or Cursor prompting for common apps.

V1 does not need to support arbitrary enterprise software. It should be opinionated and excellent at common prototype categories.

## Supported V1 App Types

- Todo / task manager
- CRM
- SaaS analytics dashboard
- Habit tracker
- Booking / appointment app
- Marketplace
- Notes / knowledge app
- Ecommerce/admin app

## Default Stacks

### Web

- Next.js
- TypeScript
- Tailwind CSS
- shadcn-style component patterns
- Local/mock data by default

### Mobile

- Expo
- React Native
- TypeScript
- NativeWind
- Expo Router when appropriate
- Local/mock data by default

## Non-Goals For V1

Do not include hosted platform features in v1:

- user accounts for the builder
- billing
- credits
- cloud previews
- managed databases
- Fly machines
- hosted deployments
- telemetry
- central template database

Those can exist later as optional extensions, but the first version should work locally.

## Local Smartness Model

Buildable's intelligence comes from bundled knowledge, not user memory.

### Layer 1: Bundled Brain

The repo ships curated knowledge:

```txt
knowledge/
  archetypes/
  data-models/
  screen-graphs/
  ui-patterns/
  design-playbooks/
  quality-rubrics/
```

### Layer 2: Golden Templates

The repo ships strong starting points:

```txt
templates/
  web/
    task-manager/
    crm/
    dashboard/
    marketplace/
  mobile/
    habit-tracker/
    task-manager/
    booking/
```

### Layer 3: Local Repo Awareness

The agent reads the current project:

- `package.json`
- framework
- routes
- components
- styling system
- existing conventions

### Layer 4: Optional Local Memory

Memory is only for preferences, not intelligence.

It can remember:

- preferred stack
- preferred UI density
- preferred styling flavor
- whether the user likes auth by default
- whether to ask before adding backend features

It should not be required for good output.

## Bundled Brain Strategy

The bundled brain should be small enough to load selectively but rich enough to make common apps feel high quality.

Each archetype should define:

- what the app is for
- default screens
- default entities
- default interactions
- common refinements
- what not to add unless requested
- acceptance criteria

Each UI pattern should define:

- when to use it
- expected components
- empty/loading/error states
- accessibility requirements
- mobile and desktop behavior

Each design playbook should define:

- visual tone
- spacing and density
- layout style
- typography guidance
- color usage
- common mistakes to avoid

## Golden Templates

Golden templates are the quality anchor.

They should be hand-curated, polished starter implementations or reference structures for common app categories. The model adapts them instead of inventing everything from scratch.

V1 golden templates:

- web task manager
- web CRM
- web SaaS dashboard
- web marketplace
- mobile habit tracker
- mobile task manager
- mobile booking app

Templates should include:

- file structure
- component structure
- sample data
- key interactions
- responsive behavior
- styling conventions
- test or validation hints

## Generation Flow

### 1. Classify Prompt

Input:

```txt
Build me a todo app
```

Classifier returns:

```json
{
  "target": "web",
  "archetype": "task-manager",
  "complexity": "simple-prototype",
  "questionsNeeded": false
}
```

### 2. Generate App Spec

Buildable creates a concrete app spec:

```json
{
  "name": "TaskFlow",
  "screens": ["dashboard"],
  "entities": ["task"],
  "features": [
    "create task",
    "edit task",
    "delete task",
    "mark complete",
    "filter by status",
    "show empty state"
  ],
  "dataMode": "local-state",
  "style": "modern productivity app"
}
```

### 3. Load Archetype

Load only the references needed for the app:

```txt
knowledge/archetypes/task-manager.md
knowledge/ui-patterns/forms.md
knowledge/ui-patterns/filters.md
knowledge/quality-rubrics/web-app.md
templates/web/task-manager/
```

### 4. Generate Code

The agent creates the app using the selected template, spec, and local project conventions.

### 5. Review

The reviewer checks:

- does it build?
- does the UI look complete?
- are core interactions implemented?
- are empty states present?
- is the layout responsive?
- are controls accessible?
- is there unnecessary complexity?

### 6. Fix

The agent fixes issues before returning final output.

## Ask-Vs-Build Policy

Use smart defaults.

Ask questions only when the answer changes architecture or product behavior.

Ask for:

- auth vs no auth
- local state vs database
- single-user vs team/collaborative
- web vs mobile if unclear
- payments
- maps
- camera
- notifications
- external APIs

Do not ask for:

- colors
- fonts
- generic styling
- whether todo apps should have filters
- whether dashboards should have charts
- whether forms need validation

For common prompts, build immediately.

## Repository Structure

```txt
Buildable/
  README.md
  LICENSE

  core/
    classifier.md
    app-spec-schema.md
    build-workflow.md
    ask-vs-build-policy.md

  knowledge/
    archetypes/
      task-manager.md
      crm.md
      dashboard.md
      marketplace.md
      booking.md
      habit-tracker.md
    ui-patterns/
      forms.md
      filters.md
      tables.md
      modals.md
      empty-states.md
      responsive-layouts.md
    design-playbooks/
      modern-saas.md
      productivity.md
      mobile-utility.md
      admin-dashboard.md
    quality-rubrics/
      web-app.md
      mobile-app.md

  templates/
    web/
      task-manager/
      crm/
      dashboard/
    mobile/
      habit-tracker/
      task-manager/

  skills/
    planner/
      SKILL.md
    web-builder/
      SKILL.md
    mobile-builder/
      SKILL.md
    reviewer/
      SKILL.md

  adapters/
    codex/
    claude/
    cursor/

  cli/
    README.md

  evals/
    prompts.md
    rubric.md

  examples/
    task-manager/
    crm/
    dashboard/
```

## Skills And Adapters Model

### Planner Skill

Responsible for:

- prompt classification
- app archetype selection
- ask-vs-build decision
- app spec generation

### Web Builder Skill

Responsible for:

- Next.js app generation
- responsive layout
- web UI patterns
- local/mock data
- component structure

### Mobile Builder Skill

Responsible for:

- Expo app generation
- navigation patterns
- mobile-first UI
- touch interactions
- NativeWind conventions

### Reviewer Skill

Responsible for:

- build/typecheck guidance
- UI completeness review
- accessibility review
- state coverage review
- missing interaction detection

### Codex Adapter

Ship as a Codex plugin with bundled skills, templates, references, and scripts.

### Claude Adapter

Ship as Claude-compatible skills, project instructions, or MCP notes.

### Cursor Adapter

Ship as Cursor rules, prompts, and template commands.

### CLI Adapter

Ship a standalone CLI wrapper:

```bash
builder init
builder plan "build me a todo app"
builder generate
builder review
```

## Contribution Model

Do not depend on vague community intelligence.

Contributors should add concrete assets:

- new archetype
- new template
- new UI pattern
- new eval prompt
- improved quality rubric
- generated reference app

Every contribution should include:

- fixture prompt
- expected app spec
- generated example or template
- acceptance checklist
- screenshot or notes

Example contribution:

```txt
Add inventory manager archetype
Add web inventory template
Add eval prompt: "Build an inventory tracker for a small warehouse"
Add expected screens: dashboard, item list, item detail, low-stock alerts
```

## V1 Quality Bar

Every generated prototype should include:

- usable first screen
- meaningful sample data
- complete core interactions
- empty state
- error state where relevant
- responsive layout
- accessible controls
- clean file structure
- no unnecessary backend
- no hardcoded secrets
- no generic placeholder UI

## V1 Success Criteria

Buildable succeeds if these prompts produce impressive local prototypes:

```txt
Build me a todo app
Build me a CRM for tracking leads
Build me a mobile habit tracker
Build me a SaaS analytics dashboard
Build me a marketplace for local services
```

Each output should:

- run locally
- look polished
- feel like a real prototype
- include expected interactions
- need less manual prompting than raw Claude, Codex, or Cursor

## Final Positioning

The way to compete with hosted AI builders locally is not to imitate their infrastructure.

It is to package the product intelligence they hide behind the scenes:

```txt
archetypes
+ templates
+ UI/UX rules
+ app specs
+ review loops
+ local agent execution
```

Buildable should be an open-source builder brain that makes desktop and CLI agents dramatically better at creating real apps.
