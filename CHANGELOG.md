# Changelog

All notable changes to Buildable are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Run `npm run version:bump -- <patch|minor|major>` to cut a release; it moves the
Unreleased section here and syncs the version across every plugin manifest.

## [Unreleased]

### Added

- `buildable status` and `buildable_status` MCP tool: a read-only workspace inspector that reports the current Buildable workflow stage and recommends the next command.
- Canonical Codex marketplace metadata at `.agents/plugins/marketplace.json`, richer current-schema plugin metadata, and up-to-date skill interface definitions.
- Skill-activation eval coverage for direct, indirect, incomplete, negative, and edge prompts, including explicit checks that unrelated work activates no Buildable skill.
- Dependabot coverage for the root package and all web/mobile starter workspaces, plus a production dependency audit gate for generated starters.
- TOON handoff files are now built into the normal workflow beyond planning: `buildable design --write` writes `.buildable/design-brief.toon`, and `buildable review` writes `.buildable/review-report.toon`.
- Six planned template packs and matching archetypes: web `ecommerce-storefront`, web `report-builder`, mobile `shopping-list`, mobile `mood-journal`, mobile `medication-reminder`, and mobile `property-inspection`.
- Four focused UI/UX playbooks: commerce, reporting workspaces, mobile health utilities, and mobile field operations.

### Changed

- Updated the Codex plugin and MCP server to the current plugin manifest and MCP 2025-11-25 contracts, including lifecycle enforcement, structured output schemas, tool annotations, and input validation.
- Refreshed the supported runtime to Node.js 22.13+, CI to the current Node.js 24 LTS line with current checkout/setup/release actions, web starters to Next.js 16/React 19/Tailwind CSS 4, and mobile starters to Expo 57/React Native 0.86.
- Reworked the README and installation docs with answer-first project copy, exact Codex marketplace commands, a focused FAQ, current counts, and clearer local-first answers for search and answer engines.
- Updated the README proof strip to match the current 79-test suite.
- README and CLI docs now present TOON as an automatic compact handoff from plain `buildable plan`, not as a separate command users need to remember.
- The MCP `buildable_plan` `toon: true` argument remains supported as a stable compatibility alias, even though the main docs now prefer automatic `.toon` handoff files.
- Template coverage is now 15 runnable starters plus 16 planned packs across 61 recognized archetypes.

## [1.0.1] - 2026-06-14

### Fixed

- **`blocks/` was missing from the npm `files` allowlist** — the CLI reads `blocks/registry.json` at startup, so an `npm install` tarball would have crashed on launch (the same bug class that broke CI earlier; the git/marketplace install was unaffected). Added `blocks/` to `files`; verified `npm pack` now ships the registry + all 8 `BLOCK.md`.
- **App-spec schema completeness** — the 1.0 "stable contract" schema was missing five fields the CLI actually emits (`expectedFiles`, `dataMode`, `persistence`, `starter`, `nextStep`), including `persistence`, which `review` reads. The schema now documents every emitted field.

### Added

- Two guard tests: one asserts every runtime-critical directory (`bin/`, `blocks/`, `core/`, `knowledge/`, `templates/`) is in the npm `files` allowlist; the other asserts the app-spec schema documents every field a plan emits (so the 1.0 contract can't silently drift).

### Removed

- Two empty `examples/` placeholder dirs (`crm`, `dashboard`) that only held "reserved for…" READMEs; `examples/task-manager` remains as the full reference app. Added `blocks/` to the README repository map.

## [1.0.0] - 2026-06-14

### Added

- **Stability commitment.** Declared the stable public surfaces (commands & flags, the `appSpec` shape, the `buildable_*` MCP tools, and the block registry format) in a new README "Stability" section. As of 1.0 these are not renamed or removed without a major (2.0) release; additive changes ship in minor/patch. The app-spec JSON schema now documents this contract.

### Changed

- Non-goals made firm and explicit: Buildable is and will remain a **local plugin/skills layer for coding agents — not a hosted product** (no billing, accounts, hosted previews, managed databases, deployment, telemetry, or central registry; your code never leaves your machine).

### Removed

- The deprecated, no-op `write` flag on the MCP `buildable_plan` tool (the design tool's real `--write` is unchanged). Cleaned up before freezing the 1.0 interface.

## [0.3.2] - 2026-06-14

### Added

- `ROADMAP.md` — honest, usage-driven roadmap (today / next / exploring / out-of-scope) that backs the README's "runnable coverage grows release over release" framing and gives contributors a place to plug in.

### Changed

- Enriched all micro-template blocks from ~23-line stubs to fuller packs: the three web blocks (`filterable-table`, `detail-panel`, `empty-state`) and the three mobile blocks (`list-with-filters`, `bottom-action-bar`, `empty-state`, the latter tuned for Expo/React Native + NativeWind with safe-area and keyboard guidance). Each now carries an expected data shape, required states, accessibility rules, responsive behavior, a small code sketch, an adaptation checklist, and bad patterns — and still loads only when a plan selects the block, so the token cost stays scoped (a landing page loads no table guidance; a web plan loads no mobile blocks).
- README leads with proof: the honest-strong "15 runnable, build-verified starters" headlines (with 55 archetypes framed as recognition/planning breadth), a first-screen "proof it's real" strip (CI-built starters, 73 tests, zero deps, eval numbers), and a roadmap note so planned packs read as growing, not unfinished. Bundled-brain figure corrected to the live ~10%.

## [0.3.1] - 2026-06-13

### Added

- Token-efficient plan handoffs: `buildable plan --toon` prints the compact TOON contract (`toon-style-v1`, ~80% smaller than the full plan JSON) and `--compact` prints slim JSON that drops the redundant human `planMarkdown` render (~20% smaller). TOON is built into the CLI — no dependency, no install.
- The MCP `buildable_plan` tool now returns the compact form by default (planMarkdown dropped), with `verbose: true` for the full JSON and `toon: true` for the TOON contract — so desktop/agent clients spend ~20–80% fewer tokens per plan with no loss of structured information.
- `buildable review` now prints an advisory **readiness** section (in the report and on the `readiness` field): a spec-derived "what's left to productionize" list covering data (in-memory / local / named-backend), auth (none / mock / named-provider), and deployment, each pointing at the persistence or auth seam. It is advisory only — it never affects pass/fail and never auto-adds a backend.

### Fixed

- The `blocks/` micro-template directory (registry, schema, and 11 `BLOCK.md` files) was untracked while the CLI loads `blocks/registry.json` at startup, so a fresh install/CI checkout failed with `ENOENT` before any command could run. The blocks pack and its supporting manifests/skills are now committed.

## [0.3.0] - 2026-06-12

### Added

- Six new runnable web golden starters — `landing-page` (single-scroll SaaS marketing page with responsive nav, pricing, FAQ), `portfolio` (filterable project grid with case-study previews), `blog-cms` (two-pane post list + editor with draft/scheduled/published workflow), `recipe-app` (ingredient search, category/diet filters, saved view, detail steps), `job-board` (filterable listings + validated apply flow with confirmation), and `inventory-manager` (summary metrics, low-stock highlighting, receive/consume adjustment) — each build-verified, wired into config sync, CI, and eval fixtures, and passing `review --strict` with zero warnings. Runnable coverage: 9 → 15.
- Deep knowledge (data models + screen graphs) for `landing-page`, `portfolio`, and `recipe-app`; dedicated plan defaults (screens, entities, features, acceptance criteria) for all six new archetypes; `Post`, `Recipe`, and `InventoryItem` entity field inference.

- Design token foundations in `core/design-system-registry.json`: shared spacing, type, radius, elevation, and motion scales, accessibility contrast targets, and a token-usage contract that `buildable check` now validates.
- `buildable review` `design-tokens` check: warns when components bypass the theme palette (inline-style hex or 2+ raw bracket-hex colors in one file), while allowing a single shared surface tint.
- Three surface-specific quality rubrics — `content-marketing`, `data-dense`, and `forms-auth` — layered onto the base rubric by `buildable design` based on the selected design profile.
- `buildable design` brief now emits the token-usage contract so agents build from named tokens, not ad-hoc values.
- Dark-mode palettes for every design profile (previously only one). `buildable design --dark` (or a "dark mode" prompt) activates the dark theme, and every brief now ships both light and dark token sets plus a `theme` label so agents can wire a light/dark toggle. A test guarantees no profile ships an incomplete dark palette.
- Local-first persistence ladder: a new `knowledge/data-layer/` pack (persistence ladder + repository seam). When a prompt asks to save/persist/remember data, the plan opts into local-default persistence (`appSpec.persistence`), adds the data-layer references, and instructs the agent to keep storage behind a vendor-neutral repository seam. A user who names a backend (e.g. Supabase) is allowed that one vendor behind the seam.
- `buildable review` `persistence-seam` check: when persistence is requested, warns on raw storage calls that are not behind a repository seam. The local-first guardrail is now graceful — it allows the backend the user opted into (recorded on the spec) while still flagging un-named hosted vendors, and points drift messages to the seam.
- Auth-as-a-shape (opt-in): `buildable plan --with-auth` (or a login prompt) adds `appSpec.auth` and a `knowledge/auth/` pack (auth shape + seam). The default is local/mock auth — session model, protected-route structure, demo users — with named providers (Clerk, Supabase Auth, …) treated as swappable adapters behind the seam, not screen-level dependencies.
- Audit-first phase plans: `buildable plan` writes reusable decision files `.buildable/phase-plan.md/json/toon` with a `planAudit` and optional `promptRefinement` questions; `generate` reuses the saved audited plan (`sourcePlan: saved-phase-plan`) and writes the compact `.toon` contract into the generated app.
- `buildable design` MCP tool and a desktop MCP bridge (`buildable mcp` / `bin/buildable-mcp.mjs`) exposing all nine commands as MCP tools for Claude Desktop, Codex, and Cursor.
- Three UI patterns the new rubrics grade against — `pricing-tables`, `auth-screens`, and `settings-layouts`; pricing loads with the landing-page template and auth screens load with opt-in auth references.
- The `notes` starter now demonstrates the persistence seam: notes survive a refresh via a `localStorage` repository (`lib/repository.ts`) behind the `Repository` interface, hydration-safe and seeded — the living example of the data-layer ladder.
- Friendly fatal-error handling in the CLI (no raw stack traces; `DEBUG=1` for the full trace) and community-health files (`SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates) with a CI status badge.

## [0.2.0] - 2026-06-10

### Added

- Broader local-first guardrail scan in `buildable review` (and `--strict`): aligned with the ask-vs-build policy, it now flags hosted/BaaS/auth/payment terms (supabase, firebase, postgres, prisma, stripe, next-auth, oauth, login, vercel, …), matched as whole tokens.
- Responsive-layout rulebook (`knowledge/ui-patterns/responsive-layouts.md`) plus a `buildable review` heuristic that warns when a grid pairs a fixed track with a bare `1fr` (the sidebar-overflow bug class) — use `minmax(0,1fr)`.
- `buildable review` quality checks: `accessible-forms` (controls without a label/aria-label), `focus-styles` (no `focus-visible`), and `state-coverage` (declared empty/filtered state missing from source), wired to the web-app rubric and forms playbook.
- Runnable web `notes` golden starter (two-pane workspace) with build verification, CI, and an eval fixture.
- Runnable web `ecommerce-admin` golden starter (overview/products/orders) with build verification, CI, and an eval fixture.
- Runnable mobile `booking` golden starter (Expo stepped flow: service → slot → details → confirmation) with typecheck CI.
- Runnable mobile `task-manager` golden starter (Expo: quick add, complete/edit/delete, search + status/priority filters) with typecheck CI.
- Data models and screen graphs for `notes`, `blog-cms`, `job-board`, `ecommerce-admin`, and `inventory-manager`.
- Visual preview loop: `buildable preview` renders the running app in a headless browser (optional Playwright, graceful fallback), screenshots it, and fails on a blank render or runtime errors; with a `/buildable-preview` command for Claude and Cursor.
- `buildable eval --compare` quantifying the guidance Buildable adds over a raw prompt.
- Smarter `generate`: `--name`/prompt-derived app branding (renames the starter) and `--augment` to plan a feature into an existing app without copying source.
- Deterministic spec-quality score in `buildable eval`.
- Release tooling: `version:bump`/`version:check`, CHANGELOG, and a tag-triggered release workflow.

## [0.1.0] - 2026-06-02

### Added

- Dependency-free `buildable` CLI: `plan`, `generate`, `init`, `review`, `check`, `list`, `eval`.
- Builder brain: 55 tag-routed archetypes plus data models, screen graphs, UI patterns, design playbooks, and quality rubrics.
- Five runnable golden starters: web task-manager, CRM, dashboard, marketplace, and mobile habit-tracker (Expo + NativeWind).
- Real plugin packaging: Claude Code plugin manifest + local marketplace with auto-discovered skills and `/buildable-*` slash commands; matching Cursor commands; Codex manifest.
- `review --build` runs typecheck/build; data-driven `expectedFiles` structure checks.
- `buildable eval` scores classification fixtures and context-load efficiency (~90% of context tokens saved per plan).
- Starter config single-source sync (`npm run sync:starters`) with a drift guard, version-pin guard tests, and a CI workflow that builds every runnable starter.

[Unreleased]: https://github.com/suntay44/buildable-plugin-skills/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v1.0.1
[1.0.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v1.0.0
[0.3.2]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.3.2
[0.3.1]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.3.1
[0.3.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.3.0
[0.2.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.2.0
[0.1.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.1.0
