# Templates

Buildable templates are the local starting points the plugin gives Claude, Codex, Cursor, or CLI agents after `buildable plan` classifies a prompt.

The flow is:

1. **Archetypes** define what kind of app the user is asking for.
2. **Golden templates** are the approved Buildable starting points for those archetypes.
3. **Runnable starters** copy real app source into the user's local folder.
4. **Planned template packs** provide an app spec and implementation plan when a full runnable starter does not exist yet.
5. **UI/UX playbooks** give the selected agent design and quality guidance without loading the whole repository.

## Archetypes

Archetypes live in `knowledge/archetypes/` and are matched through compact tags in `core/archetype-registry.json`.

| Web | Mobile |
| --- | --- |
| `task-manager` | `habit-tracker` |
| `crm` | `booking` |
| `dashboard` | `expense-tracker` |
| `marketplace` | `travel-planner` |
| `notes` | `fitness-tracker` |
| `ecommerce-admin` | `meal-planner` |
| `landing-page` | `chat-app` |
| `portfolio` | `subscription-tracker` |
| `blog-cms` | `maintenance-request` |
| `restaurant` | `field-service` |
| `real-estate` |  |
| `job-board` |  |
| `learning-platform` |  |
| `invoice-manager` |  |
| `time-tracker` |  |
| `project-management` |  |
| `support-helpdesk` |  |
| `survey-form` |  |
| `event-planner` |  |
| `recipe-app` |  |
| `community-forum` |  |
| `file-manager` |  |
| `media-gallery` |  |
| `admin-panel` |  |
| `calendar-planner` |  |
| `personal-finance` |  |
| `inventory-manager` |  |
| `asset-tracker` |  |
| `property-management` |  |
| `hiring-tracker` |  |
| `product-feedback` |  |
| `bug-tracker` |  |
| `knowledge-base` |  |
| `documentation-site` |  |
| `newsletter` |  |
| `social-link-bio` |  |
| `donation-page` |  |
| `volunteer-management` |  |
| `membership-directory` |  |
| `onboarding-checklist` |  |
| `client-portal` |  |
| `podcast-site` |  |
| `video-library` |  |
| `clinic-intake` |  |
| `directory-site` |  |

## Golden Templates

Golden templates are Buildable's approved starting points. Runnable templates copy real starter source. Planned templates provide an app spec and implementation plan pack.

### Runnable Web Starters

- `templates/web/task-manager`
- `templates/web/crm`
- `templates/web/dashboard`
- `templates/web/marketplace`
- `templates/web/notes`
- `templates/web/ecommerce-admin`

### Runnable Mobile Starters

- `templates/mobile/habit-tracker`
- `templates/mobile/booking`
- `templates/mobile/task-manager`

### Planned Template Packs

- `templates/web/generic-app`
- `templates/mobile/expense-tracker`
- `templates/mobile/travel-planner`
- `templates/mobile/fitness-tracker`
- `templates/mobile/meal-planner`
- `templates/mobile/chat-app`
- `templates/mobile/subscription-tracker`
- `templates/mobile/maintenance-request`
- `templates/mobile/field-service`
- `templates/mobile/generic-app`

## UI/UX Playbooks

Agents should load only the playbooks referenced by `appSpec.references`.

### Design Playbooks

- `knowledge/design-playbooks/admin-dashboard.md`
- `knowledge/design-playbooks/mobile-utility.md`
- `knowledge/design-playbooks/modern-saas.md`
- `knowledge/design-playbooks/productivity.md`
- `knowledge/design-playbooks/ui-quality.md`

### UI Patterns

- `knowledge/ui-patterns/action-bars.md`
- `knowledge/ui-patterns/charts.md`
- `knowledge/ui-patterns/empty-states.md`
- `knowledge/ui-patterns/filters.md`
- `knowledge/ui-patterns/forms.md`
- `knowledge/ui-patterns/modals.md`
- `knowledge/ui-patterns/navigation.md`
- `knowledge/ui-patterns/responsive-layouts.md`
- `knowledge/ui-patterns/tables.md`

### Quality Rubrics

- `knowledge/quality-rubrics/web-app.md`
- `knowledge/quality-rubrics/mobile-app.md`

## How To Contribute

1. Add concrete builder intelligence: an archetype, template, UI pattern, rubric, fixture prompt, or generated reference notes.
2. Include the matching registry entry, expected app spec, acceptance checklist, and non-goals.
3. For runnable templates, include `template-spec.json`, `TEMPLATE_PLAN.md`, and a self-contained `starter/` that passes typecheck/build.
4. Run `npm test`, `npm run check`, `npm run eval`, and `npm run config:check` before opening a PR.
5. Keep the core local-first: no hosted platform requirements, billing, accounts, managed databases, telemetry, or deployment dependencies.
