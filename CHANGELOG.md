# Changelog

All notable changes to Buildable are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Run `npm run version:bump -- <patch|minor|major>` to cut a release; it moves the
Unreleased section here and syncs the version across every plugin manifest.

## [Unreleased]

### Added

- Runnable web `notes` golden starter (two-pane workspace) with build verification, CI, and an eval fixture.
- Runnable web `ecommerce-admin` golden starter (overview/products/orders) with build verification, CI, and an eval fixture.
- Runnable mobile `booking` golden starter (Expo stepped flow: service → slot → details → confirmation) with typecheck CI.
- Data models and screen graphs for `notes`, `blog-cms`, `job-board`, `ecommerce-admin`, and `inventory-manager`.
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

[Unreleased]: https://github.com/buildable/buildable/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/buildable/buildable/releases/tag/v0.1.0
