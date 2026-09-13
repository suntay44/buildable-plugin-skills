# Installing Buildable Locally

Buildable provides local-first planning, prototype generation, and review. Install only the integration you need; the CLI, Claude Code plugins, Codex plugins, Cursor rules, and skill uploads are different installation surfaces.

## Requirements and public source

- Node.js 22.13+ for bundled scripts; Git for GitHub marketplace/clone installs.
- A supported local agent or terminal. No Buildable account or API key is required.
- A checkout is required for the CLI/manual adapters, but marketplace installs fetch their own copy.

Start in a directory where `buildable-plugin-skills` does not already exist:

```bash
git clone https://github.com/suntay44/buildable-plugin-skills.git
cd buildable-plugin-skills
node ./bin/buildable.mjs check
```

The CLI has no runtime dependencies or installation lifecycle scripts. `npm install` at the repository root is optional; generated Next.js/Expo apps have their own dependencies.

## CLI: global or project-local

From the checkout, install the global executable:

```bash
npm link
buildable check
```

Use an existing writable npm prefix; if the default prefix is not writable, choose a user-owned one instead of using `sudo` or `--force`:

```bash
npm link --prefix "$HOME/.local"
export PATH="$HOME/.local/bin:$PATH"
```

A link depends on the checkout staying in place. From another workspace, `buildable` reads bundled resources from that checkout and writes app files into your working directory.

Without a global command, call the script by absolute path:

```bash
node "/absolute/path/to/buildable-plugin-skills/bin/buildable.mjs" plan "Build me a CRM" --compact
```

For a project-local npm installation from the public source:

```bash
npm install --save-dev 'git+https://github.com/suntay44/buildable-plugin-skills.git'
./node_modules/.bin/buildable check
```

This intentionally updates the target project's package manifest/lockfile. The package is private and not published to the npm registry; do not use `npm install @buildable/local-builder` as a registry install. `npm pack` from a checkout also produces an installable `.tgz` containing the runtime resources.

## Claude Code

In Claude Code:

```text
/plugin marketplace add suntay44/buildable-plugin-skills
/plugin install buildable@buildable
```

Equivalent terminal commands:

```bash
claude plugin marketplace add https://github.com/suntay44/buildable-plugin-skills.git
claude plugin install buildable@buildable --scope user
claude plugin details buildable@buildable
claude mcp list
```

For a team-shared project install, run the install command with `--scope project` inside that project. Use `--scope local` for private project settings. These scopes use `.claude/settings.json` and `.claude/settings.local.json`, respectively; user installs use the Claude configuration directory. A custom `CLAUDE_CONFIG_DIR` relocates user settings and plugins.

Restart Claude Code after installation or updates. The seven commands are `/buildable:buildable-plan`, `/buildable:buildable-design`, `/buildable:buildable-generate`, `/buildable:buildable-status`, `/buildable:buildable-review`, `/buildable:buildable-preview`, and `/buildable:buildable-init`. Bare `/buildable-*` names apply to standalone project command copies, not plugin installs. `claude plugin details` inventories the commands and four skills; `/help` confirms their names in the running UI.

Claude uses `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and the root `.mcp.json`. Its MCP arguments use `${CLAUDE_PLUGIN_ROOT}` to locate the installed script while retaining the app working directory.

## Codex

With Codex CLI 0.153.4 (the version used for the installation audit):

```bash
codex plugin marketplace add https://github.com/suntay44/buildable-plugin-skills.git
codex plugin marketplace list
codex plugin add buildable@buildable
codex plugin list --marketplace buildable
codex mcp list --json
```

Adding a marketplace only registers the source. If your CLI lacks `plugin add`, install Buildable from the corresponding marketplace in the desktop Plugins directory. Start a new task to refresh discovery. Use the Buildable planner/web-builder/mobile-builder/reviewer skills or the `buildable_*` MCP tools; do not assume Claude's slash-command names exist in Codex.

Codex uses `.agents/plugins/marketplace.json` and `.codex-plugin/plugin.json`. Its separate `.codex-plugin/mcp.json` sets a plugin-relative working directory so Node can find the bundled script. App-specific tool calls therefore require an absolute `workspace`, for example:

```json
{"prompt":"Build me a CRM","workspace":"/absolute/path/to/my app"}
```

Alternatively set `BUILDABLE_WORKSPACE` for a manually configured server. Never use the installed plugin cache as an app workspace. Codex 0.153.4 does not expand Claude's plugin-root placeholder in MCP arguments.

User configuration normally lives in `~/.codex`; `CODEX_HOME` selects a custom configuration directory. The tested `plugin add` CLI has no Claude-style `--scope project` option. Use project MCP configuration for a project-specific integration, subject to Codex's project trust rules, rather than copying Claude settings.

## Cursor rules and commands

Buildable currently ships `.cursor/commands/` and `.cursor/rules/buildable.mdc`, not `.cursor-plugin/plugin.json` or a Cursor marketplace catalog. Use the existing manual integration or MCP; do not install the Claude/Codex manifests as Cursor plugins.

Open the checkout in Cursor, or copy the **individual** command files and rule into your app's `.cursor/commands/` and `.cursor/rules/`. Preserve existing files: inspect conflicts and merge deliberately; do not replace the destination directories. For example, this copy refuses an existing file (including a symlink):

```bash
node --input-type=module -e '
import { copyFileSync, constants } from "node:fs";
copyFileSync(process.argv[1], process.argv[2], constants.COPYFILE_EXCL);
' "/absolute/path/to/buildable-plugin-skills/.cursor/commands/buildable-plan.md" "/absolute/path/to/my app/.cursor/commands/buildable-plan.md"
```

Create the destination directories first. Repeat for the other selected commands and rule. Cursor documents global commands in `~/.cursor/commands/`; use the same collision-safe procedure there if desired. UI discovery was not tested in this audit.

Keep the full checkout available. If the global `buildable` executable is unavailable, configure the agent's command environment with:

```bash
export BUILDABLE_ROOT="/absolute/path/to/buildable-plugin-skills"
```

Relative paths such as `core/classifier.md` and every `appSpec.references` entry belong to that Buildable root, not the app workspace. Current project files and explicit user reference inputs belong to the app. A shell export is available only to processes launched from that environment.

## Instructions-only Claude adapter

Read `adapters/claude/CLAUDE.md` from the full checkout, or merge its instructions into your existing project `CLAUDE.md`. Do not copy over or replace a user-owned `CLAUDE.md`, and do not symlink it to an editable shared checkout. Record the absolute Buildable root alongside the instructions so relative bundled references can be resolved.

## Manual MCP: Claude Desktop, Cursor, and Codex

This optional bridge exposes ten local tools: `buildable_plan`, `buildable_design`, `buildable_generate`, `buildable_status`, `buildable_review`, `buildable_init`, `buildable_list`, `buildable_check`, `buildable_eval`, and `buildable_preview`.

Merge a server entry into the existing configuration; do not replace the whole file or overwrite an existing `buildable` entry without reviewing it. Use an absolute script path and an explicit app workspace. Do not copy the plugin's variable-based MCP file into standalone client configuration.

Claude Desktop's local `claude_desktop_config.json` and Cursor's project `.cursor/mcp.json` or global `~/.cursor/mcp.json` use JSON:

```json
{
  "mcpServers": {
    "buildable": {
      "command": "node",
      "args": ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"],
      "env": {"BUILDABLE_WORKSPACE": "/absolute/path/to/my app"}
    }
  }
}
```

Codex uses TOML in `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`), or a trusted project's `.codex/config.toml`:

```toml
[mcp_servers.buildable]
command = "node"
args = ["/absolute/path/to/buildable-plugin-skills/bin/buildable-mcp.mjs"]
env = { BUILDABLE_WORKSPACE = "/absolute/path/to/my app" }
```

If the GUI cannot find Node on PATH, use the absolute executable path returned by `command -v node`. Restart/reload the client and inspect its MCP tools. `claude mcp list` may exit zero while reporting a failed connection; inspect the health result, not only the exit code. Buildable tool failures appear as MCP `isError` responses; the long-running stdio server stays alive.

## Archives and skill uploads

| Artifact | What it supports |
| --- | --- |
| GitHub **Code → Download ZIP** / release source ZIP | Extract the enclosing repository folder into a new directory. Run the CLI there or register that extracted folder as a local Codex/Claude marketplace. It contains no `.git`, so `git pull` is not an update method. |
| npm `.tgz` from `npm pack` | Global/project-local npm installation of the CLI and resources. Not a UI plugin or skill upload. |
| Platform-specific plugin ZIP | A separately prepared archive matching the target UI's manifest/layout and runtime requirements. This repository does not currently publish or verify such a release asset. |
| Individual `skills/<name>/` ZIP | Not a self-contained Buildable installation: the skills depend on sibling `core/`, `knowledge/`, `templates/`, `blocks/`, and scripts. Uploading just a skill folder loses those dependencies. |

Claude's custom skill uploader expects one skill folder with `SKILL.md` and its resources. Cowork organization plugin uploads are a different flow; current official documentation also requires private/internal repositories for organization GitHub sync, so this public URL is not a valid source for that admin flow. No skill/plugin upload UI was tested. A local stdio CLI/MCP package does not automatically work in a cloud-only surface.

Do not extract ZIPs over an existing project or plugin install. Use a new directory, validate it, then switch the local integration. A ZIP extracted inside an unrelated Git repository is still not a Buildable Git checkout; do not run Git updates there.

## Repeat installation, update, and uninstall

Use each platform's own manager. Re-adding the same source is unnecessary; inspect the existing entry first. These commands manage Buildable only:

```bash
# Codex: refresh the marketplace, then reinstall the selected plugin.
codex plugin marketplace upgrade buildable
codex plugin add buildable@buildable
codex plugin remove buildable@buildable
# Optional, once no plugins from it are needed:
codex plugin marketplace remove buildable

# Claude Code: update metadata, then the installed plugin at its actual scope.
claude plugin marketplace update buildable
claude plugin update buildable@buildable --scope user
claude plugin uninstall buildable@buildable --scope user
# Optional, once no plugins from it are needed:
claude plugin marketplace remove buildable
```

Substitute `project` or `local` for a Claude install in that scope and run from that project. Restart the agent after changes. Do not delete shared config files or entire plugin caches to refresh one plugin.

For a Git checkout/global npm link, first confirm `git -C "/absolute/path/to/buildable-plugin-skills" rev-parse --show-toplevel` identifies exactly that checkout, `remote get-url origin` points to the Buildable repository, and `status --short` is clean. Only then run `git -C "/absolute/path/to/buildable-plugin-skills" pull --ff-only`. Stop on conflicts or local edits. A link automatically uses updated checkout files; no force/reset is needed. For source ZIPs, extract a newer copy separately and relink to it.

Remove a global npm link with `npm uninstall -g @buildable/local-builder` using the same prefix used for installation. Remove a project dependency with `npm uninstall --save-dev @buildable/local-builder` from that project. For manually copied rules/commands, remove only files you installed that are still unchanged; preserve user edits. Remove only the Buildable server entry from manually configured MCP clients.

## Verify the installed resources

Run from a separate app workspace, using the installed command or absolute script path:

```bash
buildable check
buildable plan "Build me a task manager" --compact
buildable generate "Build me a task manager"
cd taskflow
buildable status
buildable review
```

For build validation, install dependencies inside the generated app before `buildable review --build`. Generation refuses non-empty output by default; do not bypass that protection with `--force`. Use `buildable init --existing` and `generate --augment` for existing apps.

Read the saved plan, selected `appSpec.references`, and explicit user inputs only. Reuse accepted plans, deepen design when useful, and run review after implementation. `check` validates packaged assets; a passing check does not prove client discovery or MCP startup. See [the installation audit](installation-audit.md) for exactly what was tested.

## Official platform references

- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins) and [local plugin testing](https://developers.openai.com/plugins/deploy/connect-chatgpt).
- [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference) and [marketplace lifecycle](https://code.claude.com/docs/en/plugin-marketplaces).
- [Cursor plugin formats](https://cursor.com/docs/plugins), [commands/skills](https://cursor.com/help/customization/skills), and [MCP configuration](https://cursor.com/docs/context/mcp).
- [Claude custom skill packaging](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) and [organization plugin uploads](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization).
