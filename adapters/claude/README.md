# Claude Adapter

The Claude adapter exposes Buildable as a Claude Code plugin (auto-discovered skills and slash commands) and as local repository context.

## Install As A Claude Code Plugin

Buildable ships a plugin manifest at `.claude-plugin/plugin.json` and a marketplace at `.claude-plugin/marketplace.json`. From Claude Code:

```txt
/plugin marketplace add suntay44/buildable-plugin-skills
/plugin install buildable@buildable
```

This registers the slash commands — `/buildable:buildable-plan`, `/buildable:buildable-design`, `/buildable:buildable-generate`, `/buildable:buildable-review`, `/buildable:buildable-preview`, `/buildable:buildable-init` — and auto-discovers the planner, web-builder, mobile-builder, and reviewer skills from `skills/*/SKILL.md`.

## Claude Desktop / MCP Setup

Claude Desktop uses local MCP tools rather than Claude Code slash commands. Register the bundled server in Claude Desktop's local MCP settings:

```json
{
  "mcpServers": {
    "buildable": {
      "command": "node",
      "args": ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"],
      "env": {
        "BUILDABLE_WORKSPACE": "/absolute/path/to/your-app"
      }
    }
  }
}
```

Claude Desktop will expose `buildable_plan`, `buildable_design`, `buildable_generate`, `buildable_review`, `buildable_init`, `buildable_list`, `buildable_check`, `buildable_eval`, and `buildable_preview` as tools. They call the same local Buildable engine as the CLI.

## Local Setup (Instructions Only)

If you prefer plain project instructions instead of installing the plugin:

1. Merge the instructions in `adapters/claude/CLAUDE.md` into your existing project context; do not replace or symlink over a user-owned `CLAUDE.md`. Record the absolute Buildable checkout path.
2. Keep this Buildable repository available locally so Claude can read `core/`, `knowledge/`, `templates/`, `skills/`, and `evals/`.
3. Run `buildable check` from this repository before relying on the adapter.
4. Optionally run `buildable plan "<prompt>"` and give Claude the generated phase plan/spec before code generation.

See [scope, update, uninstall, and archive guidance](../../docs/install.md).

## Included Behavior

- include the planner workflow
- reference bundled knowledge selectively
- provide generated app specs before code generation
- keep output local-first

## Guardrail

Do not introduce builder accounts, billing, cloud previews, managed databases, hosted deployments, telemetry, or central template services unless the user explicitly requests them.
