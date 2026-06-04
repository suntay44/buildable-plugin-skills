# Buildable Generation Notes

Prompt:

Build me a todo app

Template:

templates/web/task-manager/template-spec.json

Next agent steps:

1. Read `buildable-app-spec.json`.
2. Reference loading contract: follow `appSpec.referenceLoadingContract`.
3. Load only `appSpec.references`.
4. Do not load all templates.
5. Load starter source only for this selected template.
6. Adapt this local starter to the user's request.
7. Run `buildable review` after app code exists.

Do not add accounts, billing, cloud previews, managed databases, telemetry, or hosted deployment unless explicitly requested.
