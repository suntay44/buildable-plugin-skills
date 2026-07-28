# Eval Rubric

Score generated prototypes from 0 to 3 in each category.

## Categories

- `Prompt Fit`: app matches the user request and selected archetype.
- `Core Workflow`: primary user actions work end to end.
- `Prototype Polish`: first screen feels intentionally designed.
- `State Coverage`: sample, empty, filtered, edited, deleted, and completed states are handled.
- `Responsive UX`: mobile and desktop layouts are usable.
- `Accessibility`: controls are labeled, keyboard-friendly, and legible.
- `Code Quality`: clear structure, typed data, no unnecessary complexity.
- `Local-First Discipline`: no unrequested auth, billing, cloud, database, telemetry, or deployment.

## Passing Bar

- average score of 2.5 or higher
- no category below 2
- no automatic failure

## Automatic Failures

- app does not build
- primary workflow does not work
- first screen is mostly placeholder content
- hosted platform features were added without request
- hardcoded secrets are present

## Automated Eval

`buildable eval` runs the deterministic fixtures in `evals/fixtures.json` and scores three things:

- **Routing correctness**: each prompt resolves to the expected archetype and target, and the generated app spec validates.
- **Context-load efficiency**: the share of the bundled brain (`knowledge/` + template plans/specs) each plan actually loads via `appSpec.references`. Lower is better — it is the measurable form of the reference-loading contract and the "maximum output, minimal tokens" goal.
- **Spec quality** (0–1): how concrete each generated app spec is — entities with real fields, feature depth, screens, acceptance criteria, and guardrails. Higher is better; the suite tracks the average and minimum so regressions in spec richness are visible.
- **Skill activation**: prompts in `evals/skill-activation.json` cover direct, indirect, incomplete, negative, and edge cases. The activation contract must select the expected Buildable skill—or deliberately select none—without treating ordinary coding and review work as Buildable requests.

Run it with:

```bash
buildable eval
buildable eval --json
buildable eval --compare    # guided vs raw-prompt baseline
```

`--compare` reports, per prompt on average, the concrete structure Buildable supplies (features, typed entity fields, curated references, acceptance criteria) versus a raw prompt that supplies none — while loading only a small share of the bundled brain.

The suite fails if any routing fixture misroutes, produces an invalid spec, references a missing file, or if any skill-activation case selects the wrong skill.
