# Claude Adapter

The Claude adapter exposes Buildable as a Claude Code plugin (auto-discovered skills and slash commands) and as local repository context.

## Install As A Claude Code Plugin

Buildable ships a plugin manifest at `.claude-plugin/plugin.json` and a marketplace at `.claude-plugin/marketplace.json`. From Claude Code:

```txt
/plugin marketplace add /absolute/path/to/Buildable
/plugin install buildable@buildable
```

This registers the slash commands — `/buildable-plan`, `/buildable-generate`, `/buildable-review`, `/buildable-preview`, `/buildable-init` — and auto-discovers the planner, web-builder, mobile-builder, and reviewer skills from `skills/*/SKILL.md`.

## Local Setup (Instructions Only)

If you prefer plain project instructions instead of installing the plugin:

1. Copy or symlink `adapters/claude/CLAUDE.md` into the Claude Code project instructions you want to use.
2. Keep this Buildable repository available locally so Claude can read `core/`, `knowledge/`, `templates/`, `skills/`, and `evals/`.
3. Run `buildable check` from this repository before relying on the adapter.
4. Optionally run `buildable plan "<prompt>"` and give Claude the generated spec before code generation.

## Included Behavior

- include the planner workflow
- reference bundled knowledge selectively
- provide generated app specs before code generation
- keep output local-first

## Guardrail

Do not introduce builder accounts, billing, cloud previews, managed databases, hosted deployments, telemetry, or central template services unless the user explicitly requests them.
