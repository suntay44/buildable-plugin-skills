# Buildable Template Index

Use this file to discover templates without loading starter source code.

## Reference Loading Contract

Mandatory rule for agents:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

The same rule is emitted in every plan as `appSpec.referenceLoadingContract`. The source contract lives at `core/reference-loading-contract.md`.

## Loading Rule

1. Read `template-spec.json` for metadata.
2. Read `TEMPLATE_PLAN.md` for product and file-structure guidance.
3. Load `starter/` source files only when copying, generating, or directly modifying that runnable template.
4. If a template status is `planned`, use `buildable generate --plan-pack` to create a plan-only instruction pack rather than a runnable app.

## Web Templates

- `templates/web/generic-app`: planned fallback for web archetypes without dedicated templates.
- `templates/web/task-manager`: runnable Next.js task manager starter.
- `templates/web/crm`: runnable Next.js sales pipeline CRM starter.
- `templates/web/dashboard`: runnable Next.js SaaS analytics dashboard starter.
- `templates/web/marketplace`: runnable Next.js services marketplace starter.

## Mobile Templates

- `templates/mobile/generic-app`: planned fallback for mobile archetypes without dedicated templates.
- `templates/mobile/habit-tracker`: runnable Expo + NativeWind habit tracker starter.
- `templates/mobile/task-manager`: planned Expo task manager template.
- `templates/mobile/booking`: planned Expo booking template.

## Command Path

Prefer CLI discovery:

```bash
buildable list
buildable plan "<prompt>"
```

`buildable plan` returns the selected template and references. Use that output instead of scanning all templates.

`buildable list` shows runnable versus planned template counts. Runnable templates (web task-manager, CRM, dashboard, marketplace; mobile habit-tracker) copy real source; planned templates are app-spec and `--plan-pack` instruction-pack routes.
