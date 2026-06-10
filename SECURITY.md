# Security Policy

## Supported Versions

Buildable is distributed from this repository. Security fixes land on `main` and
are cut into the next tagged release. Always run the latest release.

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's
[private vulnerability reporting](https://github.com/suntay44/buildable-plugin-skills/security/advisories/new)
(the **Security** tab → **Report a vulnerability**). Include:

- a description of the issue and its impact,
- steps to reproduce or a proof of concept,
- the affected command, file, or template.

You can expect an initial acknowledgement within 7 days. Once a fix is ready, it
ships in a tagged release and the advisory is published with credit (unless you
prefer to remain anonymous).

## Scope and Threat Model

Buildable is **local-first and dependency-free**. It ships no runtime npm
dependencies, requires no accounts, sends no telemetry, and contacts no hosted
services. The CLI reads files in this repository and writes generated starters
into a local output directory you choose.

The areas most relevant to security review are:

- **Process execution** — `buildable mcp` starts a local stdio MCP server, and
  `buildable review --build` / `buildable preview` invoke local toolchains
  (typecheck/build, optional Playwright). These run with your permissions on
  your machine.
- **File writes** — `generate` and `init` write into the target output folder.
- **Generated starters** — runnable templates pull standard public npm packages
  (Next.js, Expo, Tailwind) when *you* run `npm install`; those are outside
  Buildable's own dependency surface.

Out of scope: vulnerabilities in third-party frameworks the generated apps
depend on (report those upstream), and issues that require an already-compromised
local machine.
