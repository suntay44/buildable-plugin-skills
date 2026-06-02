# Prompt Classifier

The classifier turns a raw user prompt into a small routing decision for the builder.

## Output Shape

```json
{
  "target": "web",
  "archetype": "task-manager",
  "complexity": "simple-prototype",
  "questionsNeeded": false,
  "questions": [],
  "confidence": "high"
}
```

## Targets

- `web`: Next.js, TypeScript, Tailwind CSS, local/mock data by default.
- `mobile`: Expo, React Native, TypeScript, NativeWind, local/mock data by default.

If the prompt does not specify web or mobile, default to `web` unless the requested behavior is clearly mobile-native, such as camera, push notifications, or on-device habit check-ins.

## Archetype Mapping

Use `core/archetype-registry.json` as the compact routing source. Match the prompt against registry `tags` first with boundary-aware phrase matching, so `task` matches `task list` but not unrelated substrings inside longer words. Do not read every archetype markdown file just to classify a prompt.

After selecting an archetype:

1. Load only `knowledge/archetypes/<selected-id>.md`.
2. Load the selected template spec and only its listed references.
3. Fall back to `generic-app` for the target when no dedicated template exists.

Core examples:

- todo, todos, task list, kanban-lite, personal productivity: `task-manager`
- leads, pipeline, contacts, deals, sales tracker: `crm`
- metrics, charts, KPIs, admin analytics: `dashboard`
- habits, streaks, routines: `habit-tracker`
- appointments, booking, availability, scheduling: `booking`
- sellers, buyers, listings, services marketplace: `marketplace`
- notes, docs, knowledge base, personal wiki: `notes`
- ecommerce admin, inventory, orders, catalog: `ecommerce-admin`

## Complexity

- `simple-prototype`: one primary screen, local state, sample data.
- `polished-prototype`: multiple screens or richer workflow, still local/mock by default.
- `architecture-needed`: auth, database, external APIs, payment collection or billing infrastructure, collaboration, maps, camera, notifications, or deployment.

## Ask-Vs-Build

Set `questionsNeeded` to `true` only when an answer changes architecture or product behavior. Otherwise use the archetype defaults.

Subscription tracker prompts are a product-domain match, not a billing-infrastructure request. Ask about payments only when the prompt explicitly mentions payment collection, checkout, Stripe, bank sync, or billing infrastructure.
