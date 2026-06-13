# Buildable Blocks

Blocks are small reusable planning units selected by `buildable plan`.

They are not a code-composition engine yet. A block tells the agent which UI/product pattern is expected, which archetypes it fits, what data shape it needs, and which compact references to load.

Use blocks this way:

1. `buildable plan` selects compatible blocks for the archetype, target, and design profile.
2. The selected blocks appear in `appSpec.blocks`.
3. Block docs are appended to `appSpec.references`.
4. Builders read only the selected block docs, the selected template, and the selected knowledge references.

Do not load every block. Do not copy block examples blindly. Bind the pattern to the current app spec, entities, design system, and starter conventions.
