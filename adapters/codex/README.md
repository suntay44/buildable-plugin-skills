# Codex Adapter

The Codex adapter packages Buildable as a local plugin with bundled skills, templates, references, and helper scripts.

## Local Setup

1. Keep this repository on disk.
2. Use `.codex-plugin/plugin.json` as the plugin manifest.
3. Run `buildable check` from the repository root to verify skill and resource paths.
4. Ask Codex to use Buildable when planning or generating local app prototypes.

Codex should read from this checkout and generate into the user's local workspace. Buildable does not require a hosted template registry, telemetry endpoint, cloud preview service, or managed database.

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

Future commands can add generation and review once runnable golden templates exist.
