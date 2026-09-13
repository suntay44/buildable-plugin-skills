# Small planning and validation improvements

Follow-up to the [installation audit](installation-audit.md), September 11, 2026. These are local, unpublished changes. Buildable remains a dependency-free, local-first planner/generator/reviewer with the existing Plan → Design → Generate → Review workflow.

## Findings and changes

| Severity | Finding | Small fix and benefit |
| --- | --- | --- |
| Medium | “CRM without login” requested auth | `bin/buildable.mjs` excludes simple negated auth phrases before opt-in detection. Affirmative clauses and explicit flags still work; unnecessary auth UI/references are avoided. This is bounded phrase handling, not general natural-language negation. |
| Medium | Missing explicit reference files were labeled ready | `planAuditFor` now emits an advisory warning with the missing paths. The input remains visible in JSON/TOON and generation warns on stderr. No-reference plans still pass normally. |
| Medium | Prompt-only saved-plan reuse hid changed context | `core/plan-provenance.mjs` fingerprints selected bundled guidance and records version/input metadata. Reuse warns on changes and refreshes input existence while retaining accepted decisions. Legacy plans remain compatible. |
| Low | Tied keyword scores claimed high confidence | Classification now includes a short match/fallback reason and medium confidence for ties. Existing route order is preserved. |
| Low | Native installation checks were manual audit evidence | `scripts/smoke-native-install.mjs` and `.github/workflows/native-install.yml` provide repeatable, opt-in real-client checks with isolated homes/configs and packed source. |

Provenance reads only selected bundled files and attachment metadata, never attachment contents or the entire corpus. Metadata can miss content changes that preserve size/modification time, and it does not recursively track directory contents. The guidance fingerprint covers selected template metadata and references, not every starter source file. Warnings are advisory: review changed context before using a saved decision. They are not proof that a reference was inspected or that the generated app meets its requirements.

## Validation matrix

| Path | Result | Evidence and limits |
| --- | --- | --- |
| Automated CLI/package/MCP regressions | Pass | 89 tests, including installed global/local npm packages and regression cases for missing inputs, saved decisions, legacy plans, verification errors, auth exclusions and selected-file provenance. |
| Deterministic planning evaluation | Pass | 30 fixtures (previously 22), including ambiguous intent, tied domains, fallback, negative/positive auth and mobile override. Optional assertions check questions, auth and confidence. |
| Deterministic skill activation evaluation | Pass | 27 fixtures; tests the local heuristic, not a host model's skill selection. |
| Catalog/reference/config/version checks | Pass | `check`, `config:check`, `version:check`; repository version remains 1.0.1. |
| Codex 0.153.4, macOS native CLI/app-server | Pass | Packed local-source fresh/repeat install, namespaced skill discovery, runtime MCP discovery, actual installed MCP plan call, reinstall/removal and preserved user file. Git-only marketplace upgrade correctly rejects a local source with exit 1. |
| Claude Code 2.1.224, macOS native CLI | Pass | Packed local-source fresh/repeat install, command inventory, native MCP health, actual installed MCP plan call, same-version refresh/removal and preserved user file. |
| Public GitHub with these new fixes | Untested/unpublished | The public version and its known installation failures are recorded separately in the original audit. Local checks do not change that version. |
| New GitHub Actions workflow on Linux | Untested | Workflow added but not pushed or dispatched. Public npm availability of both pinned client versions checked. |
| Cursor UI, Claude interactive command invocation, upload UIs | Untested in this follow-up | No UI or upload compatibility claim. Platform-specific manual installation guidance remains in `docs/install.md`. |
| Real host-model accuracy, session tokens, repeated reads | Untested | Byte ratios and deterministic fixtures are proxies, not measured model behavior or total token savings. |

## Reproduce locally

From this checkout:

```bash
npm test
npm run check
npm run eval
npm run config:check
npm run version:check
node scripts/smoke-native-install.mjs codex
node scripts/smoke-native-install.mjs claude
```

Native scripts require the named client on `PATH`; missing clients or failed checks exit nonzero. They create and remove their own temporary directories, use custom config paths containing spaces, and make no model calls. They do not install clients or use your actual installed plugins. The opt-in workflow installs explicitly versioned clients only on its disposable runner. These smoke checks complement the broader audit; they do not cover every public Git update, project scope or upload UI.

Use these commands to exercise planning without writing workspace files:

```bash
node ./bin/buildable.mjs plan "Build a CRM without login" --compact --no-write
node ./bin/buildable.mjs plan "Build a mobile task manager" --toon --no-write
```

For normal installation, follow the exact platform commands in [Installing Buildable](install.md). Public-link installation continues to fetch published 1.0.1 until a release is authorized.

## Further improvements worth measuring

1. Benchmark representative web/mobile/auth plans with a named tokenizer and record repeated reads in real sessions. This would test whether compact output reduces total context, including follow-up reads.
2. Run a small opt-in host-model evaluation for skill activation and task completion. It would test actual relevance and usefulness beyond the deterministic routing suite.
3. Consider an even smaller response only after those measurements show duplicated prose remains costly; preserve full JSON and test information loss against task completion.
4. Add a narrow adapter consistency check if instructions continue to drift. Keep each platform's path and command rules distinct.
5. Package Cursor-native or upload-ready distributions only when there is demand and the actual UI can be tested.

No version bump, commit, push, tag, publication or CI dispatch was performed. Publishing still requires review, an authorized version/changelog update, checks, release, and retesting the resulting public GitHub commit.
