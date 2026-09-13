---
name: buildable-planner
description: Plan or classify a Buildable app idea into an archetype, ask-vs-build decision, phase plan, references, mock-data guidance, and local-first app spec. Use for Buildable product planning and ambiguous app-build requests; do not use for ordinary coding, debugging, or generic project planning.
---

# Buildable Planner Skill

Produce a local-first app spec and phase plan from the user's prompt, explicit reference files, and relevant existing-project context. Resolve bundled paths from the Buildable plugin or repository root.

## CLI Workflow

1. Run `buildable plan "<prompt>" --compact`. This retains the structured spec and phases while omitting the duplicate Markdown render; full `.buildable/phase-plan.json`, `.md`, and compact `.toon` files are still saved. Use `--no-write` only for terminal-only inspection. For MCP, use `buildable_plan` with its compact default.
2. Pass explicit user files with `--file <path>`, `--reference <path>`, or `--screenshot <path>`; inspect `appSpec.referenceInputs` without pasting file contents into the prompt. For requested auth use `--with-auth`; record a named provider with `--with-auth-provider <provider>`. Keep auth local/mock behind a seam unless a provider is named.
3. Use the returned classification, `appSpec`, and `phasePlan` as the planning result. Do not repeat classification or reopen registries/policies already applied by the CLI. Load only needed files from `appSpec.references`; load selected starter source only when generating or editing it. Never scan whole knowledge/template directories or unselected templates.
4. Check `appSpec.planAudit` gates and ask blocking `appSpec.questions` when `questionsNeeded` is true before design or generation. Otherwise ask at most one or two `promptRefinement.optionalQuestions` only when the answer materially changes the plan; use defaults when the user wants to proceed.
5. Summarize the plan once using the output guidance below. Keep implementation within the user's request; a planning-only request does not start app code. The included design system is sufficient to proceed; run `buildable design` only when a deeper UI/UX brief is useful.

## CLI-Unavailable Fallback

Only when the CLI is unavailable, build the spec manually:

- Match `core/archetype-registry.json` tags, then apply `core/ask-vs-build-policy.md` and `core/activation-policy.md`. Use `knowledge/INDEX.md` and `templates/INDEX.md` only for discovery.
- Load the selected archetype, matching data-model/screen-graph files when present, and the best target-specific template spec. Preserve runnable versus plan-only status.
- Select design guidance from `core/design-system-registry.json` and compatible micro-blocks from `blocks/registry.json`; include only selected references.
- Follow `core/app-spec-schema.md`: include realistic `mockData` and state coverage, explicit `referenceInputs`, `promptRefinement` assumptions/questions/defaults, `planAudit` gates, and requested auth/persistence seams. Keep data local/mock and state non-goals explicitly.
- Include clarify, plan, mock-data, design, build, and review phases with blockers and completion criteria tied to the selected screens, features, and acceptance criteria.

## Output And Handoff

Give a short decision summary: app direction, target/stack, screens and key behavior, non-goals, design/mock-data approach, blockers or important assumptions, and the next actionable phase. Link the saved plan instead of repeating the full app spec, audit checks, reference list, and phase plan in chat; expand those details when requested. On revisions, retain the accepted direction and constraints, update the saved plan, and summarize what changed.

For planning-only requests, end with one satisfaction checkpoint: revise in Buildable Planner if needed, or continue with Buildable Web Builder/Mobile Builder for the selected target. If the user already asked to build and there are no blockers, continue to that builder without another approval checkpoint.

The builder should read `.buildable/phase-plan.toon` first for compact context, then retrieve omitted details from `.buildable/phase-plan.json` as needed (for example, full design rules or expected files). TOON is a summary; JSON remains the source of truth. Reuse the saved plan rather than re-planning unchanged requirements, and load only selected `appSpec.references`, explicit user reference inputs, and necessary starter/project source.
