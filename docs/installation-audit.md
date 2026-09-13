# Buildable installation audit — 2026-09-08

## Scope and provenance

Reviewed repository instructions, Codex and Claude manifests/marketplaces, command adapters, package allowlist, release workflow, maintenance scripts, tests, README, and installation guide. There is no standalone Buildable bootstrap/install/uninstall script: Git, npm, and each platform's plugin manager perform installation. The existing plan → optional design → generate/adapt → review workflow is preserved.

The public GitHub URL was cloned anonymously at **`6a7078c5cea335dc1eb46bdc2c5283a24ae55b9e`**, package **1.0.1**, matching local HEAD. Tests distinguish that published snapshot from uncommitted local fixes. Earlier compact-planning edits in the working tree were preserved. No real installed plugins, credentials, account settings, or unrelated repositories were changed. No commits, pushes, tags, or releases were created.

Environment: macOS 26.2 arm64, Node 22.22.3, Codex CLI 0.153.4, Claude Code 2.1.224. All installations used temporary homes, custom Codex/Claude configurations, npm prefixes/caches, and app folders; paths deliberately contained spaces. Default configuration locations were also exercised under a temporary HOME. No model/API calls or account login were needed. Codex emitted a temporary-directory helper-alias warning in the default-HOME test; plugin installation and MCP operation still succeeded.

## Findings, ranked by severity

### P1 — Installed MCP server could not start outside the checkout (fixed)

Published [`.mcp.json`](../.mcp.json:6) used `node ./bin/buildable-mcp.mjs` without a working directory. Both native managers installed successfully, but the script was resolved against an unrelated app. Claude reported `Failed to connect`; executing Codex's resolved configuration returned exit 1 with `MODULE_NOT_FOUND`. The initial Codex app-server inventory had no tools or server metadata for Buildable. `buildable check` nevertheless passed because it checked packaged paths, not process startup.

The shared configuration was inappropriate for these clients. Claude expands `${CLAUDE_PLUGIN_ROOT}` in MCP arguments. Codex 0.153.4 does not; it does resolve a relative MCP `cwd` against the installed plugin. Fixed by retaining a Claude-specific root `.mcp.json` and adding [`.codex-plugin/mcp.json`](../.codex-plugin/mcp.json:1), selected by the Codex manifest. The Codex server requires an explicit app workspace to avoid accidentally writing into its cache; see [workspace validation](../bin/buildable-mcp.mjs:223).

Verification: native Claude MCP health connected; native Codex app-server discovered all ten tools; a real tool call using the native-resolved installed configuration wrote the plan into the app, leaving the plugin cache unchanged. Native configuration parsing was tested, not inferred from manifest syntax. A direct server-map format was used for Codex after its documented snake_case wrapper was not discovered by the tested client.

### P2 — Command fallback hid failures and ran a second copy (fixed)

All seven Claude commands and seven Cursor commands used `buildable … 2>/dev/null || node …`. A synthetic installed command printed an error and exited 42; the published status wrapper discarded that error, ran the bundled copy, and exited 0. Mutating commands could also be retried after partial work.

The [command adapters](../commands/buildable-status.md:12) now check executable availability first and preserve the selected program's error/status. Fallback still works when no global command exists. Regression tests execute the actual documented snippets and verify both paths.

### P2 — Installation and discovery instructions conflated platforms (fixed)

The README's quick start omitted cloning the public repository. Claude plugin commands were shown as `/buildable-plan` instead of `/buildable:buildable-plan`. Codex instructions stopped at marketplace registration even though the tested CLI supports installation. Cursor was labeled a plugin despite shipping only manual rules/commands and MCP, with neither a Cursor-native manifest nor a Cursor catalog.

Corrected [README](../README.md:139), adapter notes, and [installation guide](install.md). The guide now distinguishes user/project/local scopes, global/project-local npm, Codex's custom home, Claude's custom config directory, namespaced commands, and GUI versus CLI verification. It does not invent a Cursor package or migrate existing command names.

### P2 — Manual setup could overwrite instructions or resolve the wrong repository (fixed in guidance)

The instructions recommended copying/symlinking `CLAUDE.md` and copying Cursor directories into another app without conflict handling. Relative `core/` and `knowledge/` references still assumed the Buildable checkout. These were unsafe/ambiguous instructions, not a destructive automated installer discovered in this repository.

The guide now requires merging user instructions, uses a collision-refusing copy example, and records the absolute Buildable root. ZIP extraction uses a fresh directory. Git updates require confirming the exact checkout root, origin, and clean status; a nested ZIP directory must not accidentally target its parent Git repository.

### P3 — Archive and lifecycle coverage was missing (fixed in guidance/tests)

There was no clear distinction among GitHub source ZIPs, npm tarballs, UI plugin ZIPs, and individual skill uploads. An isolated Buildable skill folder lacks the sibling scripts/references it requires. The release workflow currently publishes release notes and GitHub source archives, not a verified platform plugin ZIP.

The [archive matrix](install.md#archives-and-skill-uploads) now describes the supported boundaries and explains refresh/update/uninstall without deleting shared settings. The new [installation regression tests](../test/install.test.mjs:38) pack and install real artifacts, execute bundled resources, and exercise MCP and error propagation. Existing manifest checks remain useful but are no longer the sole installation evidence.

## Test matrix

**Pass** means executed at the stated layer. **Fail → pass** means reproduced on the public snapshot and retested after local fixes. **Untested** is not a compatibility claim.

| Path or behavior | Result | Evidence / limit |
| --- | --- | --- |
| Anonymous public HTTPS clone | Pass, published | Exact commit recorded above; no credentials |
| README `npm install` / `npm link` | Pass, published | Isolated prefix; global executable worked from another directory |
| Repeated `npm link`, then unlink | Pass, published | Repeat was up to date; global uninstall removed only the package |
| Public GitHub project-local npm dependency | Pass, published | Installed via `git+https`, ran installed `check`, uninstalled |
| Packed npm tarball: global and local | Pass, local fixes | Actual `npm pack` and installs; CLI, selected references, MCP, generation, uninstall |
| Fresh Codex GitHub marketplace/install | Pass, published | Both HTTPS URL and owner/repo shorthand used |
| Codex installed four Buildable skills | Pass, published + fixed | Native app-server `skills/list`; names were `buildable:buildable-*` |
| Codex bundled MCP outside checkout | Fail → pass | Fixed native app-server exposed ten tools; actual installed plan call succeeded |
| Codex default/custom config directories | Pass, local fixes | Temporary HOME and custom CODEX_HOME; spaces in paths |
| Codex project-specific plugin scope | Not supported by tested CLI | No `--scope project`; project MCP is a separate documented integration |
| Fresh Claude GitHub plugin, user/project/local scopes | Pass, published | Actual CLI installation records and uninstall for all three scopes |
| Claude installed component inventory | Pass, published | `plugin details`: seven commands plus four skills |
| Claude namespaced commands in live `/help` UI | Untested | Namespaces checked against official docs and CLI inventory, not interactive invocation |
| Claude bundled MCP outside checkout | Fail → pass | Actual `claude mcp list`: failed connection before; connected after |
| Claude default/custom config directories | Pass, local fixes | Temporary HOME and CLAUDE_CONFIG_DIR; spaces in paths |
| Native manager repeat/refresh/uninstall | Pass, published | Codex upgrade/add/remove; Claude update/uninstall; expected scope behavior |
| Version-changing native update | Pass, isolated synthetic version | Temporary source changed 1.0.1 → 1.0.2; both managers installed 1.0.2; real repo stayed 1.0.1 |
| GitHub source ZIP extraction | Pass, published | Downloaded/extracted exact commit; CLI check; both local marketplaces installed it |
| Prepared plugin ZIP / individual skill upload UI | Untested / not packaged | No upload/account changes; individual skill folders are not self-contained |
| Cursor commands/rules | Partial | Snippets executed and paths checked; actual Cursor discovery/UI not tested |
| Manual absolute-path stdio bridge | Pass at server level | Real initialize/tools calls from another directory; GUI setup not exercised |
| Claude Desktop / ChatGPT desktop/web UI | Untested | Documentation reviewed; no UI installs, settings changes, or cloud runtime claims |
| Wrong/missing plugin install | Pass, published error handling | Both native CLIs returned exit 1 with a useful missing-plugin error |
| Installed command fails with exit 42 | Fail → pass | Error is now visible and status retained; no second execution |
| Missing command with valid bundled fallback | Pass, local fixes | Actual shell snippets worked with no global Buildable executable |
| Non-empty generated destination | Pass, local fixes | Generation refused; sentinel user file preserved |
| Unrelated files during native lifecycle | Pass | Temporary CLAUDE.md, .gitignore, and notes survived installs/removals |
| Existing destination / unrelated Git repository | Pass | Exclusive copy returned EEXIST; clone into existing app returned 128; user file and Git config unchanged |
| Optional Playwright/browser installation | Untested | Existing optional preview workflow was not changed or exercised |
| Windows/Linux installation, proxies, network outage, permission-denied manager paths | Untested | macOS audit only; no broad platform claim |
| Test suite / check / eval / config / versions | Pass | 83 tests; 22 plan fixtures, 27 activation fixtures; consistency checks passed |

Project-scoped plugin installation was tested through Claude's manager; live UI discovery and model behavior were not simulated into a “pass.” Cursor's custom/global configuration behavior beyond the documented paths remains untested.

## Exact commands

The copyable commands, scopes, absolute-path MCP configuration, and lifecycle steps are in [the installation guide](install.md). Minimal public installs are:

```bash
# CLI (new destination)
git clone https://github.com/suntay44/buildable-plugin-skills.git
cd buildable-plugin-skills
npm link
buildable check

# Claude Code
claude plugin marketplace add https://github.com/suntay44/buildable-plugin-skills.git
claude plugin install buildable@buildable --scope user

# Codex 0.153.4
codex plugin marketplace add https://github.com/suntay44/buildable-plugin-skills.git
codex plugin add buildable@buildable
```

These public commands still fetch the published commit until the fixes are released. To inspect local fixes now, use a new isolated config and `plugin marketplace add "/absolute/path/to/this checkout"`; do not overwrite an existing marketplace of the same name. No additional npm runtime dependency was added.

## Improvements to consider next (not implemented in this audit)

This table records the original audit proposals. The subsequent [planning improvements](planning-improvements.md) implement the missing-reference warning, provenance, routing fixtures/reasons, and opt-in native installation smoke checks; its validation is reported separately.

| Priority | Improvement | Why it helps | Small first step / measure |
| --- | --- | --- | --- |
| 1 | Native-client installation smoke tests in CI | Accuracy and usefulness: schema checks missed a completely unusable MCP install | Separate opt-in jobs with pinned Codex/Claude CLIs, temp configs, install → tool discovery → call → remove; report versions |
| 1 | Make missing explicit references visible in the plan audit | Accuracy: `planAuditFor` currently labels references ready even when a user input is missing | Add an advisory missing-input state; verify it does not silently drop the user's request or block valid no-reference plans |
| 1 | Add ambiguous, negated, mixed-domain routing fixtures | Relevance: tag matching can select plausible but wrong archetypes | Add cases such as “CRM without login” and mixed booking/inventory needs; measure routing accuracy and unnecessary questions separately |
| 2 | Record lightweight plan provenance | Accuracy and efficiency: saved-plan reuse compares prompt equality but does not fingerprint bundled versions or input changes | Add optional generator/template version and reference metadata; warn on stale context while retaining accepted user decisions |
| 2 | Measure actual context tokens and duplicate reads | Efficiency: byte/character savings are proxies, not total session-token savings | Benchmark representative web/mobile/auth plans with a named tokenizer; track references and repeated artifact reads |
| 2 | Add an optional smaller agent response | Efficiency: even compact JSON repeats prose in enhancedPrompt, appSpec, and phasePlan | Keep current JSON contract stable; evaluate an opt-in view against field-preservation and task-completion tests |
| 2 | Explain why a template/reference was chosen | Relevance and usefulness: users can correct a wrong route sooner | Return a short match reason and explicit fallback reason; avoid adding the entire registry to context |
| 2 | Validate skill behavior independently from heuristic activation fixtures | Accuracy: the current activation evaluation tests its own classifier, not the host model following SKILL.md | Maintain a small manual/opt-in host evaluation set; distinguish deterministic fixtures from real agent outcomes |
| 3 | Separate Cursor-native and upload-ready distributions if demand warrants | Usefulness: removes manual setup friction without pretending formats are interchangeable | Start with one supported target, package dependencies, and verify its actual UI before advertising support |
| 3 | Reduce copied adapter prose through a small consistency check | Efficiency and accuracy: duplicated lifecycle/naming instructions drift across README and adapters | Keep platform-specific path rules separate; check command names and links against one inventory |

These proposals preserve Buildable's local-first purpose. They do not require a hosted backend, broad architecture change, or loading the full knowledge corpus.

## Publishing still needed

1. Review these local changes alongside the earlier compact-planning edits.
2. When authorized, run `npm run version:bump -- patch`, complete the changelog, and rerun checks. A new version is important for installed plugin caches; this audit did not bump the real repository.
3. Commit/push the reviewed changes only with explicit authorization. Tagging the matching version triggers the existing release workflow; no tag was created here.
4. Retest the public GitHub URL at the new published commit. Local success is not evidence that current public installs contain the fix.
5. Treat a Cursor marketplace submission, ChatGPT directory submission, or plugin/skill ZIP release as separate future work. No npm-registry publication is needed for the current distribution model.

## Official sources checked

- [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins): native manifest/component paths and MCP shapes. [Local plugin testing](https://developers.openai.com/plugins/deploy/connect-chatgpt) describes testing the full installed package. Runtime behavior was verified separately with 0.153.4.
- [Claude plugin reference](https://code.claude.com/docs/en/plugins-reference): namespacing, components, scopes, and `${CLAUDE_PLUGIN_ROOT}`. [Marketplace documentation](https://code.claude.com/docs/en/plugin-marketplaces) and [settings](https://code.claude.com/docs/en/settings) cover installation and custom configuration.
- [Cursor plugin formats](https://cursor.com/docs/plugins), [skills/command migration](https://cursor.com/help/customization/skills), and [MCP configuration](https://cursor.com/docs/mcp): separate plugin formats and local integrations.
- [Claude custom skill packaging](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) and [organization plugin management](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization): skill ZIP versus plugin upload/admin GitHub sync; these UIs were not exercised.
