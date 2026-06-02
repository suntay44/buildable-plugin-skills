# Reference Loading Contract

Every Buildable agent must follow this contract before reading bundled knowledge or templates:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

## Rationale

Buildable is a plugin/skills package. It should make Codex, Claude, Cursor, and CLI workflows more accurate without making user sessions heavy.

## Allowed Loading

- `skills/*/SKILL.md` when the skill triggers.
- `knowledge/INDEX.md` or `templates/INDEX.md` for discovery.
- Exact files listed in `appSpec.references`.
- Current project files needed for the requested change.
- Selected starter source only when generating, reviewing, or modifying that template.

## Disallowed Loading

- All templates before planning.
- All archetypes before classification.
- Whole `knowledge/` or `templates/` directories.
- Starter source for unselected templates.
- Reference files unrelated to the selected target, archetype, or review issue.

