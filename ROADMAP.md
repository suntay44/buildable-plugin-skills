# Roadmap

Buildable's north star: the best **local-first product-intelligence layer** for coding agents — archetypes, golden templates, micro-blocks, and a quality gate that runs in your repo with your agent, no hosted platform.

This roadmap is honest about what works today and what's next. Priorities are **usage-driven**: real prompts from real users decide what gets promoted next, not guesses.

## Today (v1.0.x)

- **15 runnable, build-verified starters** (12 web, 3 mobile) — CI builds and type-checks every one.
- **61 archetypes** recognized and planned — the long tail still emits a full app spec + implementation plan.
- **Micro-block layer** — 8 reusable UI/product blocks (web + mobile), each a full pack (data shape, states, a11y, responsive, code sketch, adaptation checklist, anti-patterns), loaded only when a plan selects them.
- **Design quality as a gate** — token-usage check + surface-specific rubrics + dark-mode token sets.
- **Local-first seams** — persistence ladder and auth-as-a-shape, both vendor-neutral; `review` emits an advisory "what's left to productionize" readiness section.
- **Token-efficient handoffs** — reference-loading contract + compact/TOON plan output.
- **Works across** Claude Code, Codex, and Cursor (slash commands + MCP bridge).

## Next (close the depth gap — usage-driven)

Runnable coverage has grown from 5 at launch to 15 in v1.0. The next promotions, ordered by how often they're actually requested:

- **More runnable mobile starters** — the thinnest area today (3). Likely next: expense-tracker, fitness-tracker, chat-app (knowledge + blocks already exist).
- **Promote high-demand web archetypes** planned → runnable, driven by what users ask for.
- **Per-starter screenshots** as each one lands, for the README gallery.

## Exploring (not committed)

- **Block composition** — assembling a starter from selected blocks instead of adapting one golden template. Only worth building if real usage shows "adapt a starter" isn't enough; it's a significant generator + a binding contract.
- **Deeper long-tail knowledge** (data models + screen graphs) for the remaining planned archetypes.

## Explicitly out of scope (by design)

Buildable stays local-first. It will **not** add hosted previews, managed databases, hosted auth, deployment, telemetry, accounts, or a central template registry. Those are the hosted builders' model and the opposite of why Buildable exists. A user who *names* their own backend/provider is supported — but always behind a swappable seam, never as a platform dependency.

## Contributing

The fastest way to move this roadmap is a new runnable starter or a deepened archetype. See [CONTRIBUTING.md](CONTRIBUTING.md) for the template conventions and the gates a PR must pass.
