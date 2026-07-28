# Cursor Adapter

The Cursor adapter exposes Buildable as Cursor rules, prompts, and local template commands.

## Local Setup

1. Open this repository in Cursor, or copy `.cursor/rules/buildable.mdc` into another workspace that should use Buildable.
2. Keep this checkout available so Cursor can read the local `core/`, `knowledge/`, `templates/`, `skills/`, and `evals/` files.
3. Run `buildable check` from this repository root.
4. Use `buildable plan "<prompt>"` when Cursor needs a concrete phase plan before generation.

## MCP Setup

Cursor can also use Buildable through local MCP tools. Add this to `.cursor/mcp.json` in the app workspace, or to `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "buildable": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"],
      "env": {
        "BUILDABLE_WORKSPACE": "${workspaceFolder}"
      }
    }
  }
}
```

Cursor will expose the same Buildable actions as tools such as `buildable_plan`, `buildable_design`, `buildable_generate`, and `buildable_review`.

## Included Behavior

- rule files for ask-vs-build policy and generation workflow
- references to archetypes and quality rubrics
- local template spec selection through `buildable plan`
- MCP tool access for Cursor Agent / CLI surfaces that do not run slash commands directly

## Guardrail

Cursor should generate local prototypes with mock/local data by default. Do not add billing, accounts, cloud previews, managed databases, telemetry, hosted deployments, or central template services unless explicitly requested.
