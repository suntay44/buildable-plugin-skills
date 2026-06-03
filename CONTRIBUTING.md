# Contributing

Buildable contributions should add **concrete builder intelligence**, not vague prompting advice.

## What to contribute

- A new archetype (`knowledge/archetypes/<id>.md` + a registry entry)
- A golden template or template plan
- A UI pattern or design playbook
- An eval fixture or prompt
- A quality-rubric improvement
- A generated reference app or screenshot notes

## What every contribution should include

- A fixture prompt
- An expected app spec
- An acceptance checklist
- Notes on what should **not** be added unless requested

## Template contributions

Include both of:

- `template-spec.json` — following `core/template-spec-schema.md`
- `TEMPLATE_PLAN.md` — file structure, required features, sample data, and validation hints

If the template is `runnable`, also:

- Add a self-contained `starter/` that passes `npm run typecheck` and `npm run build`
- List `expectedFiles` in `template-spec.json` so `buildable review` can check structure
- Reuse the canonical web config via `npm run sync:starters` (don't hand-edit shared config)

## Before opening a PR

- `npm test` — full test suite
- `npm run check` — assets, adapters, and references
- `npm run eval` — classification + context-load efficiency
- `npm run config:check` — starter config has not drifted

## Local-first rule

V1 contributions **must** preserve local-first behavior. Do not add to the core builder:

- Hosted platform requirements
- Billing or accounts
- Managed databases
- Telemetry
- Deployment dependencies
