# Activation Policy

Buildable should not behave like global background context.

Use Buildable only when the user asks for:

- app or feature planning
- website/web app generation
- native mobile app generation
- prototype review
- UI/UX/product guidance for an app
- template-based local generation

Do not activate Buildable for unrelated coding, debugging, shell work, documentation, or general Q&A.

## Approval Boundary

Ask for user direction before adding architecture-changing features:

- auth or accounts
- database or persistence beyond local/mock data
- payments or billing
- team collaboration
- external APIs
- notifications
- maps, camera, file/device permissions
- deployment or hosting

If these appear in the prompt, planning may continue, but generation should pause until the user confirms the intended architecture.

