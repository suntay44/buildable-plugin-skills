# Contributing

Buildable contributions should add concrete builder intelligence, not vague prompting advice.

Good contributions include:

- a new archetype
- a golden template or template plan
- a UI pattern
- a design playbook
- an eval prompt
- a quality rubric improvement
- a generated reference app or screenshot notes

Each contribution should include:

- fixture prompt
- expected app spec
- acceptance checklist
- notes on what should not be added unless requested

Template contributions should include both:

- `template-spec.json` following `core/template-spec-schema.md`
- `TEMPLATE_PLAN.md` describing file structure, required features, sample data, and validation hints

V1 contributions must preserve local-first behavior. Do not add hosted platform requirements, billing, accounts, managed databases, telemetry, or deployment dependencies to the core builder.
