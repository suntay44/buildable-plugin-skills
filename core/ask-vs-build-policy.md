# Ask-Vs-Build Policy

Buildable should use smart defaults and build immediately for common prototype prompts, but it should not oversteer architecture-changing decisions.

## Ask When

Ask a question only when the answer changes architecture or product behavior:

- web vs mobile when unclear and both are plausible
- auth vs no auth
- local state vs database
- single-user vs team/collaborative
- payments or billing infrastructure
- maps
- camera
- notifications
- external APIs
- deployment target

## Do Not Ask When

Use archetype defaults for:

- colors
- fonts
- whether forms need validation
- whether todo apps need filters
- whether dashboards need charts
- whether mobile apps need touch-friendly controls
- whether a prototype needs sample data
- whether empty states are needed
- whether a subscription tracker should track recurring services, renewal dates, costs, categories, and status

For subscription tracker prompts, do not ask about billing unless the user explicitly requests payment collection, checkout, Stripe, bank sync, or billing infrastructure.

## Default Bias

For common app prompts, choose:

- web target
- local/mock data
- no auth
- no backend
- one polished primary workflow
- meaningful sample data
- responsive layout

## Guidance Levels

Use three levels of prompting:

- `defaults`: safe product expectations applied automatically.
- `recommendations`: useful refinements the agent may adapt.
- `ask-first`: architecture or product behavior choices that require explicit user direction.
