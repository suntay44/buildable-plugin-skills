# Codex Adapter

The Codex adapter packages Buildable as a local plugin with bundled skills, templates, references, and helper scripts.

## Local Setup

1. Add this repository as a marketplace source with `codex plugin marketplace add suntay44/buildable-plugin-skills`.
2. Run `codex plugin add buildable@buildable`, then `codex plugin list --marketplace buildable`. For older clients without `plugin add`, install from the desktop Plugins directory.
3. Run `buildable check` from the repository root to verify the marketplace, plugin, skills, and MCP paths.
4. Ask Codex to use Buildable when planning or generating local app prototypes.

Codex reads resources from the installed plugin. Pass an absolute `workspace` to bundled app-specific MCP tools; the server starts from the plugin directory only to resolve its script. See [installation and lifecycle details](../../docs/install.md#codex). Buildable does not require a hosted template registry, telemetry endpoint, cloud preview service, or managed database.

## Desktop / MCP Setup

For Codex surfaces that support local MCP tools, register the bundled server:

```toml
[mcp_servers.buildable]
command = "node"
args = ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"]
env = { BUILDABLE_WORKSPACE = "/absolute/path/to/your-app" }
```

This exposes `buildable_plan`, `buildable_design`, `buildable_generate`, `buildable_status`, `buildable_review`, `buildable_init`, `buildable_list`, `buildable_check`, `buildable_eval`, and `buildable_preview` as tool calls. They are the same engine as the CLI commands, but Codex may display them as tools instead of slash commands.

## Exposed Assets

- expose planner, web-builder, mobile-builder, and reviewer skills
- keep knowledge references in-repo
- let Codex generate into the user's local workspace
- avoid network services or hosted template lookup

## Useful CLI Hooks

- `buildable help`
- `buildable list`
- `buildable check`
- `buildable plan "<prompt>"`
- `buildable design "<prompt>"`
- `buildable generate "<prompt>"`
- `buildable review`
- `buildable preview --url http://localhost:3000`
- `buildable mcp`
