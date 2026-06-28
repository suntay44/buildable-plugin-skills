# Buildable Knowledge Index

Use this file as the first stop for Buildable knowledge. Do not load the entire `knowledge/` directory.

## Reference Loading Contract

Mandatory rule for agents:

```txt
Do not load all templates.
Run buildable plan.
Load only appSpec.references.
Load starter source only for the selected template.
```

The same rule is emitted in every plan as `appSpec.referenceLoadingContract`. The source contract lives at `core/reference-loading-contract.md`.

## Tag-Based Matching

Use `core/archetype-registry.json` for prompt matching. It contains compact tags for each archetype so agents do not need to read every archetype file.

The registry is the only broad archetype list agents should inspect during classification. After a match, load only `knowledge/archetypes/<selected-id>.md`.

## Loading Rule

1. Classify the prompt.
2. Load only the selected archetype.
3. Load the matching data model and screen graph when they exist.
4. Load only UI patterns named by the selected template spec.
5. Load one design playbook and one quality rubric.
6. Load `knowledge/design-playbooks/ui-quality.md` when visual polish is important or the app is user-facing.
7. Load `knowledge/auth/auth-shape.md` and `knowledge/auth/auth-seam.md` only when `appSpec.auth.requested` is true.
8. Load `knowledge/data-layer/persistence-ladder.md` and `knowledge/data-layer/repository-pattern.md` only when `appSpec.persistence.requested` is true.

## Archetypes

- `task-manager`: todos, task lists, productivity, lightweight project tracking.
- `crm`: leads, contacts, pipeline, sales tracking.
- `dashboard`: SaaS metrics, KPIs, analytics, operational dashboards.
- `habit-tracker`: habits, streaks, routines, daily check-ins.
- `booking`: appointments, availability, service scheduling.
- `marketplace`: listings, sellers, buyers, local services.
- `notes`: notes, docs, knowledge bases, personal wikis.
- `ecommerce-admin`: products, inventory, orders, ecommerce operations.
- `landing-page`: marketing sites, SaaS homepages, waitlists.
- `portfolio`: personal sites, work showcases, case studies.
- `blog-cms`: blogs, posts, publishing workflows.
- `restaurant`: menus, hours, hospitality websites.
- `real-estate`: properties, rentals, listing browse.
- `job-board`: jobs, roles, hiring marketplaces.
- `learning-platform`: courses, lessons, training.
- `expense-tracker`: spending, budgets, finance utilities.
- `invoice-manager`: invoices, clients, payment status.
- `time-tracker`: timers, timesheets, billable hours.
- `project-management`: projects, milestones, status.
- `support-helpdesk`: tickets, queues, support inboxes.
- `survey-form`: forms, questionnaires, feedback.
- `event-planner`: events, agendas, RSVPs.
- `travel-planner`: trips, itineraries, saved places.
- `fitness-tracker`: workouts, sets, reps, history.
- `meal-planner`: meals, recipes, groceries.
- `recipe-app`: recipes, ingredients, saved recipes.
- `community-forum`: threads, discussions, replies.
- `chat-app`: inboxes, conversations, messages.
- `file-manager`: files, folders, documents.
- `media-gallery`: photos, albums, media grids.
- `admin-panel`: backoffice records, tables, operations.
- `calendar-planner`: calendars, agendas, scheduled events.
- `personal-finance`: budgets, cash flow, accounts.
- `subscription-tracker`: renewals, recurring bills, monthly costs.
- `inventory-manager`: stock, SKUs, warehouse items.
- `asset-tracker`: equipment, assignments, maintenance.
- `property-management`: tenants, leases, maintenance requests.
- `hiring-tracker`: candidates, interviews, hiring pipelines.
- `product-feedback`: feature requests, roadmap feedback, votes.
- `bug-tracker`: issues, defects, QA triage.
- `knowledge-base`: help centers, FAQs, support articles.
- `documentation-site`: docs sites, guides, API docs.
- `newsletter`: issues, archives, subscriber intent.
- `social-link-bio`: creator links, link-in-bio pages.
- `donation-page`: nonprofit campaigns, fundraisers.
- `volunteer-management`: volunteers, shifts, signups.
- `membership-directory`: member lists and profiles.
- `onboarding-checklist`: setup steps and progress.
- `client-portal`: client project status and next actions.
- `podcast-site`: episodes, show notes, topic browsing.
- `video-library`: videos, categories, watch state.
- `clinic-intake`: intake forms and submission review.
- `maintenance-request`: repair requests and work orders.
- `field-service`: technician jobs and service status.
- `directory-site`: local, vendor, or resource directories.
- `ecommerce-storefront`: product catalogs, carts, storefront shopping flows.
- `report-builder`: saved reports, chart/table blocks, analytics workspaces.
- `shopping-list`: grocery lists, store mode, grouped mobile shopping.
- `mood-journal`: mood check-ins, wellness reflection, local history.
- `medication-reminder`: dose schedules, taken/missed states, medication details.
- `property-inspection`: walkthrough checklists, condition notes, issue summaries.

## Reference Pattern

For a task-manager web prompt, load:

```txt
knowledge/archetypes/task-manager.md
knowledge/data-models/task-manager.md
knowledge/screen-graphs/task-manager.md
knowledge/ui-patterns/forms.md
knowledge/ui-patterns/filters.md
knowledge/ui-patterns/empty-states.md
knowledge/ui-patterns/responsive-layouts.md
knowledge/design-playbooks/productivity.md
knowledge/quality-rubrics/web-app.md
```

For other prompts, use the `references` array from the selected `template-spec.json`.

## Token Discipline

- Prefer `buildable plan "<prompt>"` to get the exact reference list.
- Prefer registry tag matching over reading all archetype files.
- Do not load unrelated archetypes.
- Do not load all UI patterns.
- Do not load runnable starter code unless generating or modifying that template.
- Load UI quality guidance selectively; do not load every design playbook.
