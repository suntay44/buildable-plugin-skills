# Installing Buildable Locally

Buildable is a local-first skills, plugin, and CLI repository. Use it as an enhanced prompting and product-intelligence layer for coding agents; do not wire it to a hosted builder, telemetry service, central template registry, managed database, or cloud preview system.

## What it is

Buildable is a **product-structure compiler, compact UI/UX brain, and quality gate** for your coding agent: it decides *what* to build (archetype → screens, entities, features, states), adds `appSpec.designSystem` guidance, copies a runnable, build-verified starter, and reviews the result (build, layout, accessibility, state coverage, local-first). It is not a hosted builder — it runs entirely in your repo and agent, and can pair with dedicated design plugins for deep brand/art direction. See the [README comparison](../README.md#what-it-is-and-when-to-use-it) for details.

## Requirements

- Node.js 18 or newer for the CLI.
- A local checkout of this repository.
- One or more local coding agents: Codex Desktop, Claude Code, Cursor, or a terminal CLI workflow.

## CLI

From the repository root:

```bash
npm install
npm link
buildable check
buildable list
buildable eval
buildable plan "Build me a lightweight CRM"
buildable plan "Use this screenshot for the CRM" --file ./crm-mockup.png
buildable generate "Build me a todo app"
cd taskflow
buildable review --build
```

Without a global command:

```bash
node ./bin/buildable.mjs check
node ./bin/buildable.mjs plan "Build me a mobile booking app"
node ./bin/buildable.mjs init --existing
```

Useful smoke checks:

```bash
npm run smoke
npm run check
npm test
```

## Slash Commands and MCP Tool Setup

Use the lightest local integration your agent supports: CLI commands in a terminal, Claude Code slash commands, Cursor project commands/rules, or a Codex local plugin. Claude Desktop, Codex Desktop, Cursor, and agent CLIs do not all share one slash-command format, so Buildable also ships a bundled stdio MCP bridge for surfaces that need local tools:

```bash
buildable mcp
```

Clients will expose these as tools:

| Tool | Equivalent CLI command |
| --- | --- |
| `buildable_plan` | `buildable plan` |
| `buildable_design` | `buildable design` |
| `buildable_generate` | `buildable generate` |
| `buildable_review` | `buildable review` |
| `buildable_init` | `buildable init` |
| `buildable_list` | `buildable list` |
| `buildable_check` | `buildable check` |
| `buildable_eval` | `buildable eval` |
| `buildable_preview` | `buildable preview` |

Use an absolute path to this checkout:

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

Where to put it:

- **Claude Desktop:** local MCP server settings / `claude_desktop_config.json`.
- **Cursor:** `.cursor/mcp.json` for a project, or `~/.cursor/mcp.json` globally.
- **Codex:** `~/.codex/config.toml` or a trusted project config using the `mcp_servers` TOML shape:

```toml
[mcp_servers.buildable]
command = "node"
args = ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"]
env = { BUILDABLE_WORKSPACE = "/absolute/path/to/your-app" }
```

This is the desktop-safe equivalent of the CLI. The agent may display the actions as tools instead of slash commands, but they call the same Buildable engine. MCP is optional when project slash commands or local plugin loading already work; it is the compatibility bridge for desktop clients that need a local tool protocol.

## Fresh Start vs Existing App

Fresh start:

```bash
buildable generate "Build me a todo app"
cd taskflow
buildable review
```

If `--out` is omitted, Buildable creates a folder from the app name (e.g. `TaskFlow` → `./taskflow`).

Planned template (no runnable starter yet):

```bash
buildable generate "Build me a mobile expense tracker" --plan-pack
```

This writes local implementation instructions, not runnable app source. Only `✅ runnable` templates copy starter code; `📝 planned` templates intentionally stay plan-only until a starter exists.

Existing app:

```bash
cd my-existing-app
buildable init --existing
buildable plan "Add a task manager workflow to this app"
buildable review
```

For existing apps, Buildable should provide context and review guidance. It should not copy a full template over user code unless explicitly run with generation into a separate output directory.

## Codex Desktop

Buildable includes Codex plugin metadata in `.codex-plugin/plugin.json`.

Local setup:

1. Open Codex Desktop against this repository, or add this repository as a local/personal plugin source if your Codex Desktop build supports local plugin installation.
2. Verify that `.codex-plugin/plugin.json` resolves the bundled skills in `skills/` and resources in `core/`, `blocks/`, `knowledge/`, `templates/`, and `evals/`.
3. Run `buildable check` from the repository root.
4. Ask Codex to use Buildable for prompt-to-prototype planning. The plugin should keep generation local and read only the relevant bundled references.

Manual fallback:

Point Codex at `adapters/codex/README.md`, then ask it to follow the listed planner, builder, and reviewer skills from this checkout.

## Claude Code

Buildable ships a Claude Code plugin (`.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`) with auto-discovered skills and slash commands, plus plain instructions at `adapters/claude/CLAUDE.md`.

Plugin setup (recommended):

```txt
/plugin marketplace add suntay44/buildable-plugin-skills
/plugin install buildable@buildable
```

This registers `/buildable-plan`, `/buildable-design`, `/buildable-generate`, `/buildable-review`, `/buildable-preview`, and `/buildable-init`, and loads the planner, web-builder, mobile-builder, and reviewer skills.

Instructions-only setup:

1. Copy or symlink `adapters/claude/CLAUDE.md` into the Claude Code project context you want to use, or paste its contents into that project's Claude instructions.
2. Keep this repository available locally so Claude can read `core/`, `knowledge/`, `templates/`, `skills/`, and `evals/`.
3. Run `buildable plan "<prompt>"` when you want an explicit phase plan and app spec before code generation. It saves `.buildable/phase-plan.md/json/toon` by default.
4. After Claude edits or generates a prototype, `cd` into the app and run `buildable review` (add `--build` to run typecheck/build, `--strict` to fail on local-first drift). Reviewing a different folder by path — `buildable review <app-path>` — also works.

Claude should use mock/local data by default and avoid accounts, billing, hosted previews, telemetry, managed databases, and deployment features unless you explicitly request them.

## Cursor

Buildable includes a Cursor rule at `.cursor/rules/buildable.mdc` and slash commands in `.cursor/commands/`.

Local setup:

1. Open this repository in Cursor, or copy `.cursor/rules/buildable.mdc` and `.cursor/commands/` into another local app workspace that should use Buildable.
2. Keep the Buildable checkout nearby and reference its `core/`, `knowledge/`, `templates/`, and `skills/` paths in your prompt. If you copy the commands into another workspace and do not globally link `buildable`, set `BUILDABLE_ROOT=/path/to/buildable`.
3. Run `buildable plan "<prompt>"` for a concrete phase plan Cursor can follow before generating code. It saves `.buildable/phase-plan.md/json/toon` by default.
4. After Cursor edits or generates a prototype, `cd` into the app and run `buildable review` (passing a path also works for another folder).

The rule is scoped to prompt-to-prototype work and should not push Cursor toward hosted builder features.

## Agent Workflow

For any agent:

```txt
user prompt
-> buildable plan
-> ask product-direction questions when needed
-> ask whether the user is satisfied with the plan
-> if not satisfied, revise with Buildable Planner and update the saved phase plan
-> buildable design after direction is clear
-> use enhancedPrompt + appSpec as implementation context
-> buildable generate when starting fresh, or agent adapts existing app
-> read the selected local references
-> review against the local quality rubric with buildable review
-> fix issues before final response
```

`buildable check --json` is useful for automated verification in scripts or agent setup flows.

## Reference Loading Contract

Every agent should follow this contract:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

This keeps Buildable useful as a plugin/skills package without making user sessions heavy.

The same rule is emitted in every plan as `appSpec.referenceLoadingContract`.

## Oversteering Boundary

Buildable should reduce ambiguity, not hide major decisions.

Use defaults for common product expectations such as filters, empty states, realistic mock data, responsive layout, and accessible forms. When users provide screenshots/files, preserve them as explicit references and inspect only those files. Ask or wait for explicit user direction before choosing vague product intent or adding auth, databases, payments, collaboration, external APIs, notifications, maps, camera access, or deployment.

When a user does ask to save, persist, or remember data, Buildable opts into the local-first persistence ladder (`knowledge/data-layer/`): default to local browser/file storage behind a vendor-neutral repository seam, and add a hosted database only when the user names one — kept behind the same seam so the app still runs locally. `buildable review` allows the backend recorded on the spec while still flagging un-named hosted vendors.

When a user explicitly asks for login, accounts, protected routes, or passes `--with-auth`, Buildable opts into auth-as-a-shape (`knowledge/auth/`): local/mock sessions by default, demo users, signed-out/signed-in/error states, protected UI shape, and a swappable auth seam. A named provider is allowed only when the user names it, and `buildable review` expects provider calls to stay behind that seam.
