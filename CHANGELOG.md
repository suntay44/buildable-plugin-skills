# Changelog

All notable changes to Buildable are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Run `npm run version:bump -- <patch|minor|major>` to cut a release; it moves the
Unreleased section here and syncs the version across every plugin manifest.

## [Unreleased]

### Added

- Design token foundations in `core/design-system-registry.json`: shared spacing, type, radius, elevation, and motion scales, accessibility contrast targets, and a token-usage contract that `buildable check` now validates.
- `buildable review` `design-tokens` check: warns when components bypass the theme palette (inline-style hex or 2+ raw bracket-hex colors in one file), while allowing a single shared surface tint.
- Three surface-specific quality rubrics — `content-marketing`, `data-dense`, and `forms-auth` — layered onto the base rubric by `buildable design` based on the selected design profile.
- `buildable design` brief now emits the token-usage contract so agents build from named tokens, not ad-hoc values.
- Dark-mode palettes for every design profile (previously only one). `buildable design --dark` (or a "dark mode" prompt) activates the dark theme, and every brief now ships both light and dark token sets plus a `theme` label so agents can wire a light/dark toggle. A test guarantees no profile ships an incomplete dark palette.

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

[Unreleased]: https://github.com/suntay44/buildable-plugin-skills/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.2.0
[0.1.0]: https://github.com/suntay44/buildable-plugin-skills/releases/tag/v0.1.0
