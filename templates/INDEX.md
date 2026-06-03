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
- `templates/web/notes`: runnable Next.js two-pane notes workspace starter.
- `templates/web/ecommerce-admin`: runnable Next.js store-admin starter (overview/products/orders).

## Mobile Templates

- `templates/mobile/generic-app`: planned fallback for mobile archetypes without dedicated templates.
- `templates/mobile/habit-tracker`: runnable Expo + NativeWind habit tracker starter.
- `templates/mobile/booking`: runnable Expo + NativeWind appointment booking starter.
- `templates/mobile/task-manager`: runnable Expo + NativeWind task manager starter.
- `templates/mobile/expense-tracker`: planned Expo + NativeWind expense tracking pack.
- `templates/mobile/travel-planner`: planned Expo + NativeWind itinerary planning pack.
- `templates/mobile/fitness-tracker`: planned Expo + NativeWind workout logging pack.
- `templates/mobile/meal-planner`: planned Expo + NativeWind weekly meal planning pack.
- `templates/mobile/chat-app`: planned Expo + NativeWind local chat interface pack.
- `templates/mobile/subscription-tracker`: planned Expo + NativeWind renewal tracking pack.
- `templates/mobile/maintenance-request`: planned Expo + NativeWind repair request pack.
- `templates/mobile/field-service`: planned Expo + NativeWind technician workflow pack.

## Command Path

Prefer CLI discovery:

```bash
buildable list
buildable plan "<prompt>"
```

`buildable plan` returns the selected template and references. Use that output instead of scanning all templates.

`buildable list` shows runnable versus planned template counts. Runnable templates (web task-manager, CRM, dashboard, marketplace, notes, ecommerce-admin; mobile habit-tracker, booking, task-manager) copy real source; planned templates are app-spec and `--plan-pack` instruction-pack routes.
