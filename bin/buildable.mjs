#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { referenceInputsFromArgs as buildReferenceInputsFromArgs } from "../core/reference-inputs.mjs";

// Never surface a raw Node stack trace to users. Set DEBUG=1 to see the full trace.
function reportFatal(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`buildable: ${message}`);
  if (process.env.DEBUG && error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  console.error('Run "buildable help" for usage, or re-run with DEBUG=1 for details.');
  process.exit(1);
}
process.on("uncaughtException", reportFatal);
process.on("unhandledRejection", reportFatal);

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const command = process.argv[2];
const parsedArgs = parseArgs(process.argv.slice(3));
const input = parsedArgs.positionals.join(" ").trim();
const flags = parsedArgs.flags;
const jsonOutput = flags.has("--json");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const archetypeRegistry = JSON.parse(readFileSync(join(root, "core/archetype-registry.json"), "utf8"));
const designSystemRegistry = JSON.parse(readFileSync(join(root, "core/design-system-registry.json"), "utf8"));
const blockRegistry = JSON.parse(readFileSync(join(root, "blocks/registry.json"), "utf8"));
// Hosted/non-local-first dependencies that should not appear in a prototype unless the user
// asked for them — aligned with the ask-vs-build policy and appSpec.mustNotInclude. Matched
// as whole tokens (see hasTagPhrase) so "stripe" does not flag "striped".
const localFirstDriftTerms = [
  // hosting / deployment
  "cloud preview", "hosted deployment", "vercel", "netlify", "fly.io", "render.com",
  // payments / billing
  "billing", "stripe", "paddle", "lemonsqueezy", "checkout session",
  // auth / accounts
  "authentication", "oauth", "login", "sign in", "sign up", "next-auth", "clerk", "auth0",
  // hosted databases / backend-as-a-service
  "managed database", "supabase", "firebase", "firestore", "mongodb", "postgres", "postgresql", "mysql", "prisma", "planetscale", "dynamodb",
  // telemetry / analytics
  "telemetry", "posthog", "sentry", "segment.io"
];
const templateStatuses = ["planned", "starter", "runnable"];
const referenceLoadingContract = [
  "Do not load all templates.",
  "Run buildable plan.",
  "Load only appSpec.references.",
  "Load starter source only for the selected template."
];
const askFirstRules = [
  { kind: "auth", pattern: /\b(auth|login|sign in|sign up|user account|user accounts|member account|member accounts|client account|client accounts|user management)\b/, question: "Do you want auth/accounts, or should this stay single-user and local-first for now?" },
  { pattern: /\b(database|db|postgres|supabase|firebase|mysql|sqlite|persistence|persisted)\b/, question: "Do you want a database, or should this use local/mock data for the prototype?" },
  { pattern: /\b(payment|payments|billing|stripe|checkout|payment collection|bank sync)\b/, question: "Do you want payments/billing included, or should they be left out of this prototype?" },
  { pattern: /\b(team|collaboration|collaborative|multi-user|roles|permissions)\b/, question: "Should this support teams/collaboration, or stay single-user for now?" },
  { pattern: /\b(api|external api|integration|sync|webhook|webhooks)\b/, question: "Which external APIs or integrations should be used, if any?" },
  { pattern: /\b(notification|notifications|push|email|sms)\b/, question: "Should notifications be included, and through which channel?" },
  { pattern: /\b(map|maps|camera|geolocation|location|upload|file picker|device permission)\b/, question: "Which device permissions or location features should be included?" },
  { pattern: /\b(deploy|deployment|hosting|hosted|vercel|netlify|fly.io|cloud)\b/, question: "Do you want deployment/hosting guidance, or should Buildable keep this local-only?" }
];
const ambiguousIntentRules = [
  {
    pattern: /\b(restaurant|cafe|coffee shop|bar|food truck|bakery)\b/,
    intentPattern: /\b(website|landing|menu|reservation|booking|ordering|order|delivery|inventory|management|admin|dashboard|pos|app|mobile)\b/,
    question: "For this restaurant, what do you want to build first: an informational website/menu, an ordering or reservation flow, or an inventory/management system?"
  },
  {
    pattern: /\b(real estate|property|rental|apartment|homes?)\b/,
    intentPattern: /\b(website|landing|listing|marketplace|crm|dashboard|portal|management|booking|app|mobile)\b/,
    question: "For this real-estate idea, should Buildable plan a public listing website, an agent CRM, a client portal, or a property-management dashboard?"
  },
  {
    pattern: /\b(clinic|medical|dental|doctor|healthcare|spa|salon|wellness)\b/,
    intentPattern: /\b(website|landing|booking|appointment|intake|portal|dashboard|management|app|mobile)\b/,
    question: "For this service business, should Buildable plan a public website, a booking/appointment flow, an intake form, or an operations dashboard?"
  }
];

function usage() {
  console.log(`Buildable ${packageJson.version}

Local-first AI app builder brain for Codex Desktop, Claude Code, Cursor, and CLI workflows.

Usage:
  buildable plan "Build me a todo app"
  buildable plan "Build me a todo app" --with-auth
  buildable plan "Use this screenshot for a CRM" --file ./crm-mockup.png
  buildable design "Build me a CRM website"
  buildable generate "Build me a todo app"
  buildable generate "Build me a lightweight CRM" --name "LeadDesk"
  buildable init --existing
  buildable status
  buildable review
  buildable mcp
  buildable check
  buildable list
  buildable help

Commands:
  init [--existing]             Create .buildable config for a workspace.
  status [path] [--json]        Inspect a workspace and suggest the next Buildable command.
  plan <prompt> [--file <path>] [--no-write]
                                Classify a prompt and print a top-down local app spec as JSON.
                                --file/--reference/--screenshot records explicit user references;
                                --with-auth records local/mock auth shape; --with-auth-provider names a provider;
                                saves .buildable/phase-plan.md/json/toon by default; --no-write only prints.
                                --compact prints slim JSON (drops the planMarkdown render).
  design [prompt] [--page <name>] [--write]
                                Produce an interchangeable UI/UX design brief. Uses the current
                                app spec when present, or classifies the prompt when not.
  generate <prompt> [--out <dir>] Create a runnable starter, or use --plan-pack for planned templates.
                                  Defaults to a folder from the app name. Add --name "X" to brand it,
                                  or --augment to plan into an existing app.
  review [path] [--build] [--strict]
                                Audit the current app by default. --build also runs typecheck/build;
                                --strict fails (not just warns) on local-first guardrail drift.
  preview [path] --url <url>    Render the running app in a headless browser; screenshot + catch runtime errors.
  mcp                           Start the Buildable MCP stdio server for desktop/agent tool clients.
  check [--json]                Verify local assets, adapter files, and template references.
  list [--json]                 List bundled archetypes plus runnable/planned template status.
  eval [--json]                 Score classification fixtures and report context-load efficiency.
  help                          Show this help text.

Local-first stance:
  Buildable reads files from this repository and emits specs for local agents. It does not
  require accounts, telemetry, cloud previews, managed databases, or hosted template services.

Install/use docs:
  README.md
  docs/install.md
  cli/README.md
`);
}

function parseArgs(rawArgs) {
  const result = {
    flags: new Set(),
    values: {},
    positionals: []
  };
  const valueFlags = new Set(["--out", "--mode", "--name", "--url", "--page", "--target", "--spec", "--file", "--reference", "--screenshot", "--with-auth-provider"]);
  const multiValueFlags = new Set(["--file", "--reference", "--screenshot"]);

  function setValue(name, value) {
    const key = name.slice(2);
    if (multiValueFlags.has(name)) {
      result.values[key] = [...(Array.isArray(result.values[key]) ? result.values[key] : []), value];
    } else {
      result.values[key] = value;
    }
  }

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg.startsWith("--")) {
      const [name, inlineValue] = arg.split("=", 2);
      result.flags.add(name);

      if (inlineValue !== undefined) {
        setValue(name, inlineValue);
      } else if (valueFlags.has(name) && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
        setValue(name, rawArgs[index + 1]);
        index += 1;
      }
    } else {
      result.positionals.push(arg);
    }
  }

  return result;
}

function tokensFor(value) {
  return String(value).toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function hasTagPhrase(text, phrase) {
  const tokens = tokensFor(phrase);
  if (tokens.length === 0) return false;
  const pattern = new RegExp(`(^|[^a-z0-9])${tokens.join("[^a-z0-9]+")}([^a-z0-9]|$)`, "i");
  return pattern.test(text);
}

function uniqueValues(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim() !== "").map((value) => value.trim()))];
}

function referenceInputsFromArgs(args = parsedArgs, cwd = process.cwd()) {
  return buildReferenceInputsFromArgs(args, cwd);
}

const authIntentCue = /\b(auth|authentication|login|log in|sign in|sign-in|signin|sign up|sign-up|signup|user management|user accounts?|member accounts?|client accounts?|protected route|protected routes|session|sessions)\b/i;
const authProviderCue = /\b(clerk|auth0|next-auth|nextauth|better-auth|lucia|supabase auth|firebase auth)\b/i;
const authProviderFlags = [
  ["--with-clerk", "clerk"],
  ["--with-auth0", "auth0"],
  ["--with-next-auth", "next-auth"],
  ["--with-supabase-auth", "supabase auth"],
  ["--with-firebase-auth", "firebase auth"]
];

function normalizedAuthProvider(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase().replace(/_/g, "-");
  if (!normalized) return null;
  if (normalized === "nextauth") return "next-auth";
  if (normalized === "supabase") return "supabase auth";
  if (normalized === "firebase") return "firebase auth";
  return normalized;
}

function authIntentFor(prompt, args = parsedArgs) {
  const providerFlag = normalizedAuthProvider(args.values?.["with-auth-provider"]);
  if (args.flags?.has("--with-auth") || args.flags?.has("--with-local-auth") || providerFlag) return true;
  if (authProviderFlags.some(([flag]) => args.flags?.has(flag))) return true;
  return authIntentCue.test(prompt) || authProviderCue.test(prompt);
}

function classify(prompt) {
  const normalized = prompt.toLowerCase();
  const requestedMobile = /\b(mobile|iphone|android|expo|react native)\b/.test(normalized);
  const requestedWeb = /\b(web|website|next|next.js|browser)\b/.test(normalized);
  const scored = archetypeRegistry.archetypes
    .map((entry) => ({
      entry,
      score: entry.tags.reduce((score, tag) => score + (hasTagPhrase(normalized, tag) ? Math.max(1, tokensFor(tag).length) : 0), 0)
    }))
    .sort((a, b) => b.score - a.score);
  const selected = scored[0]?.score > 0 ? scored[0].entry : archetypeRegistry.archetypes.find((entry) => entry.id === "task-manager");
  // An explicit "web"/"mobile" in the prompt is authoritative; otherwise use the archetype default.
  const explicitTarget = requestedMobile !== requestedWeb && (requestedMobile || requestedWeb);
  const target = explicitTarget ? (requestedMobile ? "mobile" : "web") : selected.defaultTarget;

  const architectureQuestions = askFirstRules
    .filter((rule) => rule.pattern.test(normalized))
    .filter((rule) => !(rule.kind === "auth" && authIntentFor(normalized)))
    .map((rule) => rule.question);
  const directionQuestions = ambiguousIntentRules
    .filter((rule) => rule.pattern.test(normalized) && !rule.intentPattern.test(normalized))
    .map((rule) => rule.question);
  const questions = uniqueValues([...directionQuestions, ...architectureQuestions]);

  return {
    target,
    explicitTarget,
    archetype: selected.id,
    complexity: "simple-prototype",
    questionsNeeded: questions.length > 0,
    questions,
    clarificationNeeded: directionQuestions.length > 0,
    confidence: scored[0]?.score > 0 ? "high" : "medium"
  };
}

function templateFor(classification) {
  const templates = listTemplates();
  const sameTarget = (entry) => entry.target === classification.target;
  // Dedicated template for this archetype on the requested platform.
  const dedicated = templates.find((entry) => entry.archetype === classification.archetype && sameTarget(entry));
  // Same-platform generic pack — the safe fallback that never crosses target.
  const genericSameTarget = templates.find((entry) => entry.archetype === "generic-app" && sameTarget(entry));
  return dedicated ?? genericSameTarget ?? templates[0];
}

function appNameFor(archetype) {
  return archetypeRegistry.archetypes.find((entry) => entry.id === archetype)?.name ?? "BuildableApp";
}

function appNameFromPrompt(prompt) {
  const match = prompt.match(/\b(?:called|named|titled)\s+["']?([A-Za-z][\w][\w .&'-]{0,38}?)["']?(?:\.|,|$|\s(?:app|application|that|which|for|to|with)\b)/i);
  if (!match) return null;
  return match[1].trim().replace(/[ .]+$/, "");
}

function chosenAppName(prompt, fallback) {
  const flagName = typeof parsedArgs.values.name === "string" ? parsedArgs.values.name.trim() : "";
  if (flagName) return flagName;
  return appNameFromPrompt(prompt) ?? fallback;
}

function renameAppInDir(target, fromName, toName) {
  if (!fromName || !toName || fromName === toName) return 0;
  let changed = 0;
  for (const file of scanTextFiles(target)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes(fromName)) continue;
    writeFileSync(file, text.split(fromName).join(toName));
    changed += 1;
  }
  return changed;
}

function fieldNameFor(label) {
  const cleaned = String(label).replace(/[`.;:]/g, "").trim();
  if (/^[a-z][a-zA-Z0-9]*$/.test(cleaned)) return cleaned;

  const tokens = tokensFor(cleaned);
  if (tokens.length === 0) return null;
  return tokens
    .map((token, index) => (index === 0 ? token : `${token[0].toUpperCase()}${token.slice(1)}`))
    .join("");
}

function fieldsFromArchetypeDoc(archetype, entityName) {
  const path = join(root, `knowledge/archetypes/${archetype}.md`);
  if (!existsSync(path)) return [];

  const text = readFileSync(path, "utf8");
  const entityPattern = new RegExp(`^-\\s+\`?${entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`?\\s*:\\s*(.+)$`, "im");
  const match = text.match(entityPattern);
  if (!match) return [];

  return uniqueValues(
    match[1]
      .replace(/\.$/, "")
      .split(/,|\band\b/)
      .map((field) => fieldNameFor(field))
      .filter(Boolean)
  );
}

function inferredFieldsFor(archetype, entityName, registered) {
  const explicit = fieldsFromArchetypeDoc(archetype, entityName);
  if (explicit.length > 0) return uniqueValues(["id", ...explicit, "createdAt", "updatedAt"]);

  const fieldsByEntity = {
    Booking: ["serviceId", "slotId", "customerName", "customerEmail", "notes", "status"],
    CartItem: ["productId", "name", "quantity", "unitPrice", "variant", "status"],
    ChartBlock: ["title", "type", "metric", "groupBy", "dateRange", "order"],
    Conversation: ["title", "participants", "lastMessageAt", "unreadCount"],
    Course: ["title", "description", "progress", "status"],
    Dose: ["medicationId", "scheduledAt", "status", "takenAt", "notes"],
    Event: ["title", "date", "location", "status"],
    InspectionItem: ["section", "label", "status", "severity", "notes", "photoPlaceholder"],
    InventoryItem: ["name", "sku", "category", "quantity", "reorderLevel", "unitCost", "location"],
    Invoice: ["number", "clientName", "amount", "status", "dueDate"],
    Issue: ["title", "area", "severity", "status", "notes"],
    Job: ["title", "company", "location", "status", "postedAt"],
    JournalEntry: ["mood", "summary", "tags", "prompt", "entryDate"],
    Lead: ["name", "company", "email", "stage", "value", "nextAction"],
    Lesson: ["title", "description", "duration", "order", "status"],
    Listing: ["title", "description", "category", "priceLabel", "location", "status"],
    Medication: ["name", "dosage", "schedule", "instructions", "refillDate", "status"],
    MenuItem: ["name", "description", "price", "category", "available"],
    Message: ["conversationId", "sender", "body", "sentAt", "read"],
    Metric: ["label", "value", "delta", "trend"],
    Note: ["title", "body", "tags", "updatedAt"],
    Order: ["number", "customerName", "status", "total"],
    Place: ["name", "location", "notes", "category"],
    Post: ["title", "slug", "excerpt", "body", "author", "category", "status", "publishedAt"],
    Product: ["name", "sku", "price", "stock", "status"],
    Recipe: ["name", "description", "category", "ingredients", "steps", "prepMinutes", "servings", "dietTags", "saved"],
    Project: ["title", "description", "status", "dueDate"],
    Question: ["label", "type", "required", "options"],
    Report: ["title", "description", "owner", "status", "dateRange", "updatedAt"],
    Response: ["submittedAt", "answers", "status"],
    Section: ["title", "subtitle", "body", "ctaLabel", "order"],
    ShoppingItem: ["name", "category", "quantity", "checked", "notes", "storeSection"],
    Subscription: ["service", "cost", "billingPeriod", "renewalDate", "status", "category"],
    Task: ["title", "description", "status", "priority", "dueDate", "tags"],
    Ticket: ["subject", "customerName", "priority", "status", "assignee"],
    Trip: ["destination", "startDate", "endDate", "notes", "status"]
  };

  const featureFields = [];
  for (const feature of registered.features ?? []) {
    if (/\bcategory|categories\b/i.test(feature)) featureFields.push("category");
    if (/\bfilter|filters\b/i.test(feature)) featureFields.push("status");
    if (/\bsearch\b/i.test(feature)) featureFields.push("name");
    if (/\bdetail|description\b/i.test(feature)) featureFields.push("description");
    if (/\bdate|calendar|renewal|due\b/i.test(feature)) featureFields.push("date");
    if (/\bsummary|total|cost|price|amount|value\b/i.test(feature)) featureFields.push("amount");
  }

  return uniqueValues(["id", ...(fieldsByEntity[entityName] ?? []), ...featureFields, "createdAt", "updatedAt"]);
}

function defaultsFor(archetype) {
  const defaults = {
    "task-manager": {
      screens: [{ id: "dashboard", purpose: "Create, review, filter, and complete tasks" }],
      entities: [
        {
          name: "Task",
          fields: ["id", "title", "description", "status", "priority", "dueDate", "tags", "createdAt", "updatedAt"]
        }
      ],
      features: ["create task", "edit task", "delete task", "mark complete", "reopen task", "filter by status", "filter by priority", "search tasks", "show empty state"],
      sampleData: "meaningful",
      style: "modern productivity app",
      acceptanceCriteria: [
        "first screen is usable immediately",
        "all core task actions work locally",
        "empty and filtered-empty states are present",
        "layout works on mobile and desktop",
        "no hosted services are required"
      ]
    },
    crm: {
      screens: [{ id: "pipeline", purpose: "Track leads, pipeline stages, and next actions" }],
      entities: [{ name: "Lead", fields: ["id", "name", "company", "email", "stage", "value", "source", "nextAction", "lastContactedAt"] }],
      features: ["create lead", "edit lead", "move lead between stages", "filter by stage", "search leads", "record next action"],
      sampleData: "meaningful",
      style: "admin dashboard",
      acceptanceCriteria: ["pipeline is populated", "lead stage changes update totals", "filters and search combine", "no hosted services are required"]
    },
    dashboard: {
      screens: [{ id: "overview", purpose: "Review metrics, trends, and recent events" }],
      entities: [{ name: "Metric", fields: ["id", "label", "value", "delta", "trend"] }],
      features: ["metric cards", "date range control", "trend region", "event table", "status filtering", "empty data state"],
      sampleData: "meaningful",
      style: "modern SaaS dashboard",
      acceptanceCriteria: ["metrics have context", "filters update visible data", "table empty state exists", "no hosted services are required"]
    },
    "habit-tracker": {
      screens: [{ id: "today", purpose: "Check off habits and review progress" }],
      entities: [{ name: "Habit", fields: ["id", "name", "frequency", "targetDays", "color", "createdAt"] }],
      features: ["create habit", "complete habit", "reopen habit", "show streak", "weekly progress", "empty state"],
      sampleData: "meaningful",
      style: "mobile utility",
      acceptanceCriteria: ["touch targets are comfortable", "check-in state is visible", "progress is clear", "no hosted services are required"]
    },
    booking: {
      screens: [{ id: "booking-flow", purpose: "Choose service, time slot, details, and confirmation" }],
      entities: [{ name: "Booking", fields: ["id", "serviceId", "slotId", "customerName", "customerEmail", "notes"] }],
      features: ["select service", "select slot", "enter details", "validate required fields", "show confirmation"],
      sampleData: "meaningful",
      style: "mobile utility",
      acceptanceCriteria: ["selected service and time remain visible", "required fields are labeled", "confirmation state exists", "no hosted services are required"]
    },
    marketplace: {
      screens: [{ id: "browse", purpose: "Browse listings, filter results, inspect details, and submit inquiry" }],
      entities: [{ name: "Listing", fields: ["id", "title", "description", "category", "priceLabel", "location", "rating", "sellerId", "tags"] }],
      features: ["browse listings", "search listings", "filter listings", "view detail", "save listing", "submit inquiry", "filtered empty state"],
      sampleData: "meaningful",
      style: "modern marketplace",
      acceptanceCriteria: ["browse screen is populated", "filters work", "inquiry state is visible", "no hosted services are required"]
    },
    "landing-page": {
      screens: [{ id: "home", purpose: "Single scroll page: hero, features, social proof, pricing, FAQ, closing CTA" }],
      entities: [{ name: "Section", fields: ["id", "kind", "title", "subtitle", "ctaLabel", "ctaHref", "order"] }],
      features: ["hero", "features", "social proof", "pricing", "faq", "closing cta", "responsive nav"],
      sampleData: "meaningful",
      style: "modern marketing website",
      acceptanceCriteria: [
        "the offer and primary CTA are obvious in the first viewport",
        "exactly one pricing tier is highlighted",
        "nav collapses to an accessible menu on mobile",
        "copy is concrete product copy, no placeholder text",
        "no hosted services are required"
      ]
    },
    portfolio: {
      screens: [
        { id: "home", purpose: "Hero, featured work, about, contact CTA" },
        { id: "work", purpose: "Project grid with tag filter and case study previews" }
      ],
      entities: [{ name: "Project", fields: ["id", "title", "summary", "role", "year", "tags", "featured"] }],
      features: ["project grid", "tag filter", "case study preview", "about section", "contact cta", "filtered empty state"],
      sampleData: "meaningful",
      style: "editorial portfolio",
      acceptanceCriteria: [
        "hero states who and what within the first viewport",
        "projects filter by tag with a filtered-empty state",
        "project summaries are concrete outcomes",
        "contact CTA is reachable from hero and footer",
        "no hosted services are required"
      ]
    },
    "blog-cms": {
      screens: [
        { id: "post-list", purpose: "Browse, search, and filter posts by status and category" },
        { id: "post-editor", purpose: "Create and edit a post with metadata and status" }
      ],
      entities: [{ name: "Post", fields: ["id", "title", "slug", "excerpt", "body", "author", "category", "tags", "status", "publishedAt", "updatedAt"] }],
      features: ["create post", "edit post", "publish post", "filter drafts", "search posts", "empty state"],
      sampleData: "meaningful",
      style: "content product",
      acceptanceCriteria: [
        "post list distinguishes drafts from published",
        "editor round-trips title, body, and metadata",
        "search and status filter combine",
        "empty and filtered-empty states exist",
        "no hosted services are required"
      ]
    },
    "recipe-app": {
      screens: [
        { id: "recipe-list", purpose: "Browse recipe cards with search and category/diet filters" },
        { id: "recipe-detail", purpose: "Ingredients, ordered steps, servings, and save action" }
      ],
      entities: [{ name: "Recipe", fields: ["id", "name", "description", "category", "ingredients", "steps", "prepMinutes", "cookMinutes", "servings", "dietTags", "saved"] }],
      features: ["recipe cards", "ingredient search", "category filter", "diet filter", "detail view", "save recipe", "filtered empty state"],
      sampleData: "meaningful",
      style: "content app",
      acceptanceCriteria: [
        "cards read well without photos",
        "search matches ingredients, not just titles",
        "saved view has its own empty state",
        "detail steps are numbered and scannable",
        "no hosted services are required"
      ]
    },
    "job-board": {
      screens: [
        { id: "jobs", purpose: "Browse, search, and filter job postings by type, location, and remote" },
        { id: "job-detail", purpose: "Job detail with apply form and confirmation" }
      ],
      entities: [{ name: "Job", fields: ["id", "title", "company", "location", "type", "remote", "salaryLabel", "description", "tags", "postedAt"] }],
      features: ["job list", "search jobs", "filter by type", "filter remote", "view detail", "save job", "apply with confirmation", "filtered empty state"],
      sampleData: "meaningful",
      style: "marketplace dashboard",
      acceptanceCriteria: [
        "job list is populated and newest-first",
        "type / remote filters combine with search",
        "filtered-empty state has a clear-filters action",
        "apply flow shows a confirmation state",
        "no hosted services are required"
      ]
    },
    "inventory-manager": {
      screens: [
        { id: "inventory", purpose: "Stock table with category/location filters, low-stock highlighting, and quantity adjustment" },
        { id: "item-detail", purpose: "Item detail with receive/consume quantity adjustment" }
      ],
      entities: [{ name: "InventoryItem", fields: ["id", "name", "sku", "category", "quantity", "reorderLevel", "unitCost", "location", "updatedAt"] }],
      features: ["stock table", "search items", "category filter", "low-stock view", "adjust quantity", "total inventory value", "filtered empty state"],
      sampleData: "meaningful",
      style: "operations dashboard",
      acceptanceCriteria: [
        "stock table is populated with quantities and value",
        "low-stock items are highlighted and filterable",
        "receive / consume adjusts quantity and updates totals",
        "filtered-empty state exists",
        "no hosted services are required"
      ]
    }
  };

  const registered = archetypeRegistry.archetypes.find((entry) => entry.id === archetype);
  if (!registered) return defaults["task-manager"];

  return defaults[archetype] ?? {
    screens: registered.screens.map((id) => ({ id, purpose: `${registered.name} ${id} workflow` })),
    entities: registered.entities.map((name) => ({ name, fields: inferredFieldsFor(archetype, name, registered) })),
    features: registered.features,
    sampleData: "meaningful",
    style: registered.style,
    acceptanceCriteria: [
      "first screen is usable immediately",
      "core workflow works locally",
      "empty state is present",
      "layout works on mobile and desktop",
      "no hosted services are required"
    ]
  };
}

function designSystemFor(classification, defaults, prompt) {
  const profiles = designSystemRegistry.profiles ?? [];
  const matched = profiles.find((profile) => profile.matches?.includes(classification.archetype));
  const fallback = profiles.find((profile) => profile.id === (classification.target === "mobile" ? "mobile-utility" : "focused-productivity"));
  const profile = matched ?? fallback ?? profiles[0];
  const palette = { ...(profile.palette ?? {}) };
  const typography = { ...(profile.typography ?? {}) };
  const layoutRules = [...(profile.layoutRules ?? [])];
  const componentRules = [...(profile.componentRules ?? [])];
  const accessibility = [...(profile.accessibility ?? [])];
  const avoid = [...(profile.avoid ?? [])];

  if (/\bdark\b|\bdark mode\b/i.test(prompt)) {
    palette.intent = `${palette.intent}; support dark mode with equivalent contrast`;
    componentRules.push("include light/dark token pairs instead of hard-coded one-off colors");
  }
  if (/\bminimal|minimalist|clean\b/i.test(prompt)) {
    layoutRules.push("use fewer surfaces and stronger whitespace, while keeping workflow actions visible");
    avoid.push("hiding required controls for the sake of minimalism");
  }
  if (/\bluxury|premium|high-end\b/i.test(prompt)) {
    typography.mood = `${typography.mood}; elevated spacing and restrained contrast`;
    avoid.push("flashy effects that make the product feel less trustworthy");
  }
  if (/\bplayful|fun|colorful\b/i.test(prompt)) {
    palette.intent = `${palette.intent}; allow a brighter accent only if semantic states stay clear`;
    avoid.push("confusing playful color with status color");
  }

  return {
    profile: profile.id,
    styleName: profile.styleName ?? defaults.style,
    visualTone: profile.visualTone ?? defaults.style,
    palette,
    typography,
    density: profile.density ?? (classification.target === "mobile" ? "thumb-friendly" : "comfortable"),
    layoutRules: uniqueValues(layoutRules).slice(0, 5),
    componentRules: uniqueValues(componentRules).slice(0, 5),
    motion: profile.motion ?? "subtle feedback-only transitions",
    accessibility: uniqueValues(accessibility).slice(0, 5),
    avoid: uniqueValues(avoid).slice(0, 5)
  };
}

function designPromptLine(designSystem) {
  if (!designSystem) return "Design system: follow the selected Buildable UI/UX playbooks.";
  const paletteIntent = designSystem.palette?.intent ?? "clear semantic color roles";
  const typographyMood = designSystem.typography?.mood ?? "readable product typography";
  return `Design system: ${designSystem.styleName}; tone: ${designSystem.visualTone}; palette: ${paletteIntent}; typography: ${typographyMood}; density: ${designSystem.density}; motion: ${designSystem.motion}.`;
}

function designRulesLine(designSystem) {
  if (!designSystem) return "UI/UX rules: clear hierarchy, polished spacing, responsive behavior, accessible controls, and useful empty states.";
  const layoutRules = (designSystem.layoutRules ?? []).slice(0, 3).join("; ");
  const componentRules = (designSystem.componentRules ?? []).slice(0, 3).join("; ");
  const avoid = (designSystem.avoid ?? []).slice(0, 3).join("; ");
  return `UI/UX rules: ${layoutRules}. Components: ${componentRules}. Avoid: ${avoid}.`;
}

function mockDataFor(defaults) {
  return {
    strategy: "realistic-local-seed-data",
    recordsPerEntity: "6-10",
    rules: [
      "Use domain-specific names, labels, statuses, dates, and amounts instead of generic placeholders.",
      "Include enough variety to exercise filters, search, sorting, status chips, summaries, and empty states.",
      "Include at least one edge-case record such as overdue, high priority, low stock, cancelled, draft, or inactive when relevant.",
      "Keep all data local/mock unless the user explicitly approves persistence or external integrations."
    ],
    entities: (defaults.entities ?? []).map((entity) => ({
      name: entity.name,
      minimumRecords: 6,
      fieldsToPopulate: (entity.fields ?? []).filter((field) => !["id", "createdAt", "updatedAt"].includes(field)).slice(0, 8)
    })),
    requiredStates: ["populated", "empty", "filtered-empty", "loading-or-saving", "error-or-validation"]
  };
}

function promptHasAny(prompt, words) {
  const normalized = prompt.toLowerCase();
  return words.some((word) => hasTagPhrase(normalized, word));
}

function archetypeRefinementQuestion(archetype) {
  const questions = {
    "task-manager": {
      id: "task_intelligence",
      question: "Should this feel like a simple todo list, or a smart assistant that suggests what to do next?",
      why: "This changes sorting, reminder behavior, and the first-screen hierarchy.",
      defaultAnswer: "Smart assistant with Today, Next, Later, and Focus Mode."
    },
    crm: {
      id: "pipeline_shape",
      question: "Is this CRM for a solo workflow, a sales team pipeline, or a client-service follow-up system?",
      why: "This changes stage labels, metrics, ownership fields, and dashboard density.",
      defaultAnswer: "Sales team pipeline with leads, stages, next actions, and value summaries."
    },
    dashboard: {
      id: "decision_loop",
      question: "What decision should the dashboard help the user make in the first 30 seconds?",
      why: "This decides the KPI order, chart types, filters, and empty states.",
      defaultAnswer: "Show what changed, what needs attention, and what action to take next."
    },
    marketplace: {
      id: "marketplace_side",
      question: "Should the first prototype optimize for buyers discovering listings or sellers managing listings?",
      why: "This changes navigation, primary screens, filters, and sample data.",
      defaultAnswer: "Buyer discovery first, with enough seller data to make listings realistic."
    },
    notes: {
      id: "organization_model",
      question: "Should notes be organized by folders, tags, projects, or search-first capture?",
      why: "This changes the sidebar, editor metadata, filters, and empty states.",
      defaultAnswer: "Tags plus search-first capture."
    },
    "habit-tracker": {
      id: "motivation_style",
      question: "Should progress feel streak-based, goal-based, or gentle/non-punitive?",
      why: "This changes stats, copy, reminders, and success states.",
      defaultAnswer: "Gentle streaks with weekly progress and no shame-heavy overdue states."
    },
    booking: {
      id: "booking_actor",
      question: "Is the booking flow mainly for customers self-booking, staff managing appointments, or both?",
      why: "This changes screens, availability data, calendar density, and confirmation states.",
      defaultAnswer: "Customer self-booking with a compact staff overview."
    },
    "ecommerce-admin": {
      id: "operations_focus",
      question: "Should the admin prioritize product catalog work, order fulfillment, or inventory exceptions?",
      why: "This changes the dashboard, table columns, filters, and action priority.",
      defaultAnswer: "Order fulfillment first, with product and inventory summaries."
    }
  };
  return questions[archetype] ?? {
    id: "primary_workflow",
    question: "What is the one workflow that must feel excellent in the first prototype?",
    why: "This keeps the generated app focused instead of becoming a broad but shallow demo.",
    defaultAnswer: "Make the first screen support the most common daily workflow end-to-end."
  };
}

function promptRefinementFor(prompt, classification, defaults, appSpec) {
  const optionalQuestions = [];

  if (!promptHasAny(prompt, ["for customers", "for clients", "for students", "for teams", "for staff", "for admins", "for myself", "internal", "public"])) {
    optionalQuestions.push({
      id: "audience",
      question: "Who is the first real user: you/internal staff, customers, clients, students, or a team?",
      why: "This changes navigation, copy, density, sample data, and permissions assumptions.",
      defaultAnswer: appSpec.target === "mobile" ? "A single owner using it repeatedly on mobile." : "An internal operator using it repeatedly on desktop and mobile."
    });
  }

  optionalQuestions.push(archetypeRefinementQuestion(classification.archetype));

  if ((appSpec.referenceInputs ?? []).length === 0) {
    optionalQuestions.push({
      id: "references",
      question: "Do you have a screenshot, brand guide, existing app, or competitor example I should use as a reference?",
      why: "Explicit references let the agent inspect only the files you choose instead of guessing visual/product direction.",
      defaultAnswer: "No external references; use the selected Buildable design system and realistic mock data."
    });
  }

  const trimmedQuestions = optionalQuestions.slice(0, 3);
  return {
    mode: classification.questionsNeeded ? "blocking-first" : "optional",
    instruction: classification.questionsNeeded
      ? "Ask blocking questions before design or generate. Then use optional questions only if the user wants to sharpen the plan."
      : "Ask up to two optional questions if the user seems undecided; otherwise proceed with the defaults below.",
    assumptions: [
      `Prototype stays local-first with ${appSpec.dataMode} and realistic mock data.`,
      `Use the ${appSpec.designSystem.styleName} design profile unless the user gives a stronger visual reference.`,
      `${defaults.features[0]} is treated as the first critical workflow.`
    ],
    optionalQuestions: trimmedQuestions,
    nextPromptExample: `Keep this plan, but ${trimmedQuestions[0]?.defaultAnswer ?? "make the primary workflow sharper"}.`
  };
}

function planAuditFor(appSpec) {
  const checks = [
    {
      id: "scope",
      status: appSpec.questionsNeeded ? "blocked" : "ready",
      gate: appSpec.questionsNeeded ? "Answer blocking questions before design or generate." : "Scope is concrete enough to generate."
    },
    {
      id: "template",
      status: appSpec.templateStatus === "runnable" ? "ready" : "plan-pack",
      gate: appSpec.templateStatus === "runnable" ? "Runnable starter can be copied." : "Use --plan-pack; no runnable starter exists yet."
    },
    {
      id: "references",
      status: "ready",
      gate: "Load only appSpec.references and explicit appSpec.referenceInputs."
    },
    {
      id: "mock-data",
      status: "ready",
      gate: `${appSpec.mockData.recordsPerEntity} local records per entity plus populated, empty, filtered-empty, loading/saving, and error states.`
    },
    {
      id: "ui-ux",
      status: "ready",
      gate: `Use ${appSpec.designSystem.styleName}; avoid ${appSpec.designSystem.avoid.slice(0, 2).join(" and ")}.`
    },
    {
      id: "local-first",
      status: "ready",
      gate: `Do not add ${appSpec.mustNotInclude.join(", ")}.`
    },
    {
      id: "auth",
      status: appSpec.auth?.requested ? "requested" : "not-requested",
      gate: appSpec.auth?.requested ? appSpec.auth.rule : "Do not add auth unless requested."
    },
    {
      id: "persistence",
      status: appSpec.persistence?.requested ? "requested" : "not-requested",
      gate: appSpec.persistence?.requested ? appSpec.persistence.rule : "Keep data in local/mock state unless persistence is requested."
    },
    {
      id: "review",
      status: "required-after-generate",
      gate: "Run buildable review and fix blocking issues before handoff."
    }
  ];

  return {
    mode: "audit-first",
    instruction: "Builders must read this plan before editing. Treat failed or blocked audit checks as gates, not suggestions.",
    checks,
    failurePolicy: [
      "If scope is blocked, ask appSpec.questions before generating.",
      "If template is plan-pack, do not claim runnable source was generated.",
      "If a named auth/backend provider appears outside its seam, fix before handoff.",
      "If review fails, repair and rerun review."
    ]
  };
}

function phasePlanFor(plan) {
  const promptArg = JSON.stringify(plan.prompt);
  const authArgs = authCommandArgsFor(plan.prompt, plan.appSpec.auth);
  const phases = [
    {
      id: "clarify",
      title: "Clarify Product Direction",
      status: plan.appSpec.questionsNeeded ? "required" : "complete",
      goal: plan.appSpec.questionsNeeded
        ? "Ask the user the listed questions before design or generation."
        : "No blocking product-direction questions detected.",
      questions: plan.appSpec.questions
    },
    {
      id: "plan",
      title: "Plan App Structure",
      status: "complete",
      command: `buildable plan ${promptArg}${authArgs}`,
      goal: "Use the selected archetype, target, stack, screens, entities, features, references, guardrails, and compact design system."
    },
    {
      id: "mock-data",
      title: "Prepare Mock Data",
      status: plan.appSpec.questionsNeeded ? "blocked-until-clarified" : "ready",
      goal: "Create realistic local seed data for the selected entities before judging the UI.",
      guidance: plan.appSpec.mockData
    },
    {
      id: "design",
      title: "Design UI/UX",
      status: plan.appSpec.questionsNeeded ? "blocked-until-clarified" : "ready",
      command: `buildable design ${promptArg} --write`,
      goal: "Deepen appSpec.designSystem into concrete UI/UX tokens, page rules, component states, and mockup-data presentation guidance."
    },
    {
      id: "build",
      title: "Build Local Prototype",
      status: plan.appSpec.questionsNeeded ? "blocked-until-clarified" : "ready",
      command: plan.appSpec.templateStatus === "runnable"
        ? `buildable generate ${promptArg}${authArgs}`
        : `buildable generate ${promptArg}${authArgs} --plan-pack`,
      goal: "Generate or implement the local prototype using the selected template and design brief. Keep data local/mock by default."
    },
    {
      id: "review",
      title: "Review And Fix",
      status: "ready-after-build",
      command: "buildable review",
      goal: "Audit app spec coverage, local-first guardrails, accessibility, responsive layout, state coverage, and build health."
    }
  ];

  return phases;
}

function authCommandArgsFor(prompt, auth) {
  if (!auth?.requested) return "";
  if (auth.userNamedProvider && !authProviderCue.test(prompt)) return ` --with-auth-provider ${JSON.stringify(auth.userNamedProvider)}`;
  if (!authIntentCue.test(prompt) && !authProviderCue.test(prompt)) return " --with-auth";
  return "";
}

function blockSummaryLine(blocks) {
  return blocks?.length
    ? `Selected micro-blocks: ${blocks.map((block) => `${block.id} (${block.role})`).join(", ")}. Use these as reusable UI/product guidance; do not load unselected blocks.`
    : "Selected micro-blocks: none.";
}

function planMarkdownFor(plan) {
  const phases = plan.phasePlan ?? phasePlanFor(plan);
  return `# Buildable Phase Plan

Prompt:

${plan.prompt}

Recommended workflow: Plan > Design > Generate > Review

## Direction

- app: ${plan.appSpec.name}
- target: ${plan.appSpec.target}
- archetype: ${plan.appSpec.archetype}
- stack: ${plan.appSpec.stack.framework}, ${plan.appSpec.stack.language}, ${plan.appSpec.stack.styling}
- template: ${plan.appSpec.template}
- template status: ${plan.appSpec.templateStatus}

## Clarifying Questions

${plan.appSpec.questions.length ? plan.appSpec.questions.map((question) => `- ${question}`).join("\n") : "- None"}

## Audit-First Build Contract

${plan.appSpec.planAudit.checks.map((check) => `- ${check.id}: ${check.status} — ${check.gate}`).join("\n")}

## Selected Micro-Blocks

${plan.appSpec.blocks.length ? plan.appSpec.blocks.map((block) => `- ${block.id}: ${block.reason}\n  - needs: ${block.needs.join("; ")}`).join("\n") : "- None"}

## Optional Refinement Questions

${plan.appSpec.promptRefinement.optionalQuestions.length ? plan.appSpec.promptRefinement.optionalQuestions.map((entry) => `- ${entry.question}\n  - default: ${entry.defaultAnswer}`).join("\n") : "- None"}

## Design Included In Plan

- profile: ${plan.appSpec.designSystem.profile}
- style: ${plan.appSpec.designSystem.styleName}
- tone: ${plan.appSpec.designSystem.visualTone}
- density: ${plan.appSpec.designSystem.density}

Run \`buildable design ${JSON.stringify(plan.prompt)} --write\` only when you want a deeper UI/UX brief with concrete tokens and page/component rules.

## Mock Data Guidance

- strategy: ${plan.appSpec.mockData.strategy}
- records per entity: ${plan.appSpec.mockData.recordsPerEntity}

${plan.appSpec.mockData.rules.map((rule) => `- ${rule}`).join("\n")}

${plan.appSpec.auth?.requested ? `## Auth Shape\n\n- ${plan.appSpec.auth.rule}\n- states: ${plan.appSpec.auth.states.join(", ")}\n\n` : ""}${plan.appSpec.persistence?.requested ? `## Persistence\n\n- ${plan.appSpec.persistence.rule}\n\n` : ""}## User Reference Inputs

${plan.appSpec.referenceInputs.length ? plan.appSpec.referenceInputs.map((input) => `- ${input.kind}: ${input.path}${input.exists ? "" : " (missing)"}`).join("\n") : "- None"}

When these exist, inspect only these user-provided files or screenshots in addition to \`appSpec.references\`.

## Phases

${phases.map((phase, index) => {
  const lines = [`${index + 1}. ${phase.title} (${phase.status})`, `   - Goal: ${phase.goal}`];
  if (phase.command) lines.push(`   - Command: \`${phase.command}\``);
  if (phase.questions?.length) lines.push(...phase.questions.map((question) => `   - Question: ${question}`));
  return lines.join("\n");
}).join("\n\n")}

## Reference Loading Contract

${plan.appSpec.referenceLoadingContract.map((rule) => `- ${rule}`).join("\n")}
`;
}

function toonValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r?\n/g, " ").replace(/,/g, ";").trim();
}

function toonList(name, values, indent = "") {
  const items = values.map(toonValue);
  return `${indent}${name}[${items.length}]: ${items.join(",")}`;
}

function toonTable(name, fields, rows, indent = "") {
  const body = rows
    .map((row) => `${indent}  ${fields.map((field) => toonValue(row[field])).join(",")}`)
    .join("\n");
  return `${indent}${name}[${rows.length}]{${fields.join(",")}}:${rows.length ? `\n${body}` : ""}`;
}

function planToonFor(plan) {
  const spec = plan.appSpec;
  const lines = [
    "buildable_plan:",
    `  format: toon-style-v1`,
    `  source_of_truth: .buildable/phase-plan.json`,
    `  prompt: ${toonValue(plan.prompt)}`,
    `  workflow: Plan > Design > Generate > Review`,
    "  app:",
    `    name: ${toonValue(spec.name)}`,
    `    target: ${toonValue(spec.target)}`,
    `    archetype: ${toonValue(spec.archetype)}`,
    `    template: ${toonValue(spec.template)}`,
    `    templateStatus: ${toonValue(spec.templateStatus)}`,
    `    generationMode: ${toonValue(spec.generationMode)}`,
    "  stack:",
    `    framework: ${toonValue(spec.stack.framework)}`,
    `    language: ${toonValue(spec.stack.language)}`,
    `    styling: ${toonValue(spec.stack.styling)}`,
    `    data: ${toonValue(spec.stack.data ?? spec.dataMode)}`,
    "  design:",
    `    profile: ${toonValue(spec.designSystem.profile)}`,
    `    styleName: ${toonValue(spec.designSystem.styleName)}`,
    `    density: ${toonValue(spec.designSystem.density)}`,
    `    tone: ${toonValue(spec.designSystem.visualTone)}`,
    toonList("avoid", spec.designSystem.avoid, "    "),
    "  blocks:",
    toonTable("selected", ["id", "role", "reason"], spec.blocks, "    "),
    "  audit:",
    toonTable("checks", ["id", "status", "gate"], spec.planAudit.checks, "    "),
    "  product:",
    toonTable("screens", ["id", "purpose"], spec.screens, "    "),
    toonTable("entities", ["name", "fields"], spec.entities.map((entity) => ({ name: entity.name, fields: (entity.fields ?? []).join("|") })), "    "),
    toonList("features", spec.features, "    "),
    toonList("acceptanceCriteria", spec.acceptanceCriteria, "    "),
    "  mockData:",
    `    recordsPerEntity: ${toonValue(spec.mockData.recordsPerEntity)}`,
    toonTable("entities", ["name", "minimumRecords", "fields"], spec.mockData.entities.map((entity) => ({ name: entity.name, minimumRecords: entity.minimumRecords, fields: (entity.fieldsToPopulate ?? []).join("|") })), "    "),
    toonList("requiredStates", spec.mockData.requiredStates, "    "),
    "  questions:",
    toonList("blocking", spec.questions, "    "),
    toonTable("optional", ["id", "question", "defaultAnswer"], spec.promptRefinement.optionalQuestions, "    "),
    "  loading:",
    toonList("references", spec.references, "    "),
    toonTable("referenceInputs", ["kind", "path", "exists"], spec.referenceInputs, "    "),
    toonList("contract", spec.referenceLoadingContract, "    "),
    "  guardrails:",
    toonList("mustNotInclude", spec.mustNotInclude, "    ")
  ];
  return `${lines.join("\n")}\n`;
}

// Agent-facing plan view: drop planMarkdown (a human render of phasePlan + appSpec
// that an agent does not need to re-parse) and point at the .md file instead.
// ~20% smaller than the full plan JSON with no loss of structured information.
function compactPlan(plan) {
  const { planMarkdown, ...rest } = plan;
  return { ...rest, planMarkdownFile: plan.written?.markdown ?? ".buildable/phase-plan.md" };
}

function enhancedPromptFor(originalPrompt, appSpec) {
  const features = appSpec.features.join(", ");
  const screens = appSpec.screens.map((screen) => screen.id).join(", ");
  const guardrails = appSpec.mustNotInclude.join(", ");
  const referenceInputs = appSpec.referenceInputs?.length
    ? `User reference inputs: ${appSpec.referenceInputs.map((input) => `${input.kind} ${input.path}`).join(", ")}. Inspect only these provided files/screenshots, extract relevant requirements and UI cues, and do not load unrelated files.`
    : null;

  return [
    `User request: ${originalPrompt}`,
    "",
    `Build a local-first ${appSpec.target} ${appSpec.archetype} prototype named ${appSpec.name}.`,
    `Use the ${appSpec.stack.framework} stack from the selected Buildable template when applicable.`,
    `Expected screens: ${screens}.`,
    `Expected product behavior: ${features}.`,
    `Use ${appSpec.sampleData} sample data and follow this product style: ${appSpec.style}.`,
    designPromptLine(appSpec.designSystem),
    designRulesLine(appSpec.designSystem),
    blockSummaryLine(appSpec.blocks),
    `Mock data guidance: ${appSpec.mockData.recordsPerEntity} realistic local records per entity; include populated, empty, filtered-empty, loading/saving, and validation/error states.`,
    appSpec.persistence?.requested
      ? `Persistence requested: ${appSpec.persistence.rule} Follow knowledge/data-layer/persistence-ladder.md and put storage behind the repository seam in knowledge/data-layer/repository-pattern.md.`
      : null,
    appSpec.auth?.requested
      ? `Auth requested: ${appSpec.auth.rule} Follow knowledge/auth/auth-shape.md and knowledge/auth/auth-seam.md; do not scatter provider SDK calls through screens.`
      : null,
    `Reference loading contract: ${referenceLoadingContract.join(" ")}`,
    referenceInputs,
    `Do not add: ${guardrails}.`,
    "For existing apps, adapt to the current project conventions and do not overwrite unrelated user code.",
    appSpec.questionsNeeded ? "Pause before design/generation and ask the user the listed product-direction or architecture questions." : "Proceed without asking for visual taste preferences.",
    appSpec.promptRefinement?.optionalQuestions?.length
      ? `Optional refinement questions: ${appSpec.promptRefinement.optionalQuestions.map((entry) => entry.question).join(" ")} Use defaults if the user wants to proceed.`
      : null,
    "After implementation, run Buildable review and fix blocking issues before final handoff."
  ].filter(Boolean).join("\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

// Local-first persistence is opt-in: only when the prompt asks to save/persist/remember data.
// Default to the lowest local rung behind the repository seam; a hosted backend is allowed only
// when the user names one (recorded as userNamedBackend so review can allow that one vendor).
// Strong, unambiguous persistence signals.
const persistenceStrongCue = /\b(persist(?:s|ed|ing|ence)?|databases?|local\s?storage|indexeddb|sqlite|offline|survives? (?:a )?(?:refresh|reload)|don'?t lose)\b/i;
// A save/store/keep/remember verb close to a data-ish object (avoids "save time", "save money").
const persistenceVerbObjectCue = /\b(sav(?:e|es|ed|ing)|stor(?:e|es|ed|ing)|keep(?:s|ing)?|remember(?:s|ing)?)\b[^.?!]{0,24}\b(data|state|changes|progress|work|tasks?|records?|items?|notes?|entries|leads?|history|settings|between sessions|across sessions)\b/i;
const namedBackendCue = /\b(supabase|firebase|firestore|postgres|postgresql|mysql|mongodb|planetscale|dynamodb|prisma)\b/i;

function persistenceFor(prompt) {
  if (!persistenceStrongCue.test(prompt) && !persistenceVerbObjectCue.test(prompt)) return null;
  const named = namedBackendCue.exec(prompt);
  return {
    requested: true,
    defaultLayer: "browser-local",
    vendorNeutral: true,
    userNamedBackend: named ? named[1].toLowerCase() : null,
    references: ["knowledge/data-layer/persistence-ladder.md", "knowledge/data-layer/repository-pattern.md"],
    rule: named
      ? `User named ${named[1].toLowerCase()}: place it at the remote rung behind the repository seam so the app still runs locally and stays swappable.`
      : "Default to local browser/file storage behind a repository seam; do not add a hosted database unless the user names one."
  };
}

function authFor(prompt, args = parsedArgs) {
  const providerFromFlag = normalizedAuthProvider(args.values?.["with-auth-provider"]);
  const providerFromBooleanFlag = authProviderFlags.find(([flag]) => args.flags?.has(flag))?.[1] ?? null;
  const providerFromPrompt = authProviderCue.exec(prompt)?.[1] ?? null;
  const userNamedProvider = normalizedAuthProvider(providerFromFlag ?? providerFromBooleanFlag ?? providerFromPrompt);
  const requested = Boolean(args.flags?.has("--with-auth") || args.flags?.has("--with-local-auth") || userNamedProvider || authIntentCue.test(prompt));
  if (!requested) return null;
  return {
    requested: true,
    defaultMode: userNamedProvider ? "provider-behind-seam" : "local-mock",
    vendorNeutral: true,
    userNamedProvider,
    references: ["knowledge/auth/auth-shape.md", "knowledge/auth/auth-seam.md", "knowledge/ui-patterns/auth-screens.md"],
    states: ["signed-out", "signing-in", "authenticated", "error", "signed-out-after-timeout"],
    rule: userNamedProvider
      ? `User named ${userNamedProvider}: keep provider calls behind the auth seam and keep a local/mock auth adapter for development.`
      : "Model auth locally first: session state, protected-route shape, sign-in/sign-out UI, and mock users behind an auth seam. Do not add a hosted provider unless the user names one."
  };
}

function microBlocksFor(appContext, limit = 5) {
  const usedRoles = new Set();
  return (blockRegistry.blocks ?? [])
    .filter((block) => block.target === appContext.target)
    .map((block) => {
      const archetypeMatch = block.fitsArchetypes?.includes(appContext.archetype) ? 4 : 0;
      const designMatch = block.fitsDesignProfiles?.includes(appContext.designSystem.profile) ? 2 : 0;
      const tagMatch = (block.tags ?? []).some((tag) => hasTagPhrase(appContext.prompt, tag)) ? 1 : 0;
      return { block, score: archetypeMatch + designMatch + tagMatch };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.block.id.localeCompare(b.block.id))
    .filter(({ block }) => {
      if (usedRoles.has(block.role)) return false;
      usedRoles.add(block.role);
      return true;
    })
    .slice(0, limit)
    .map(({ block }) => ({
      id: block.id,
      name: block.name,
      role: block.role,
      target: block.target,
      reason: `${block.name} fits ${appContext.archetype} as a ${block.role} block.`,
      needs: block.needs ?? [],
      references: block.references ?? []
    }));
}

function specFor(prompt, options = {}) {
  const classification = classify(prompt);
  const template = templateFor(classification);
  const templatePath = join(root, template.path);
  const templateSpec = existsSync(templatePath)
    ? JSON.parse(readFileSync(templatePath, "utf8"))
    : { references: [] };
  // The classified target is authoritative; templateFor already returns a same-target template.
  const target = classification.target;
  const defaults = defaultsFor(classification.archetype);
  const designSystem = designSystemFor(classification, defaults, prompt);
  const blocks = microBlocksFor({
    prompt,
    target,
    archetype: classification.archetype,
    designSystem
  });
  const archetypeReference = `knowledge/archetypes/${classification.archetype}.md`;
  const designSelectionReference = "knowledge/design-playbooks/design-system-selection.md";
  const references = [...(templateSpec.references ?? [])];
  if (existsSync(join(root, archetypeReference)) && !references.includes(archetypeReference)) {
    references.unshift(archetypeReference);
  }
  if (existsSync(join(root, designSelectionReference)) && !references.includes(designSelectionReference)) {
    references.push(designSelectionReference);
  }
  for (const block of blocks) {
    for (const ref of block.references ?? []) {
      if (existsSync(join(root, ref)) && !references.includes(ref)) references.push(ref);
    }
  }

  const persistence = persistenceFor(prompt);
  if (persistence) {
    for (const ref of persistence.references) {
      if (existsSync(join(root, ref)) && !references.includes(ref)) references.push(ref);
    }
  }
  const auth = authFor(prompt);
  if (auth) {
    for (const ref of auth.references) {
      if (existsSync(join(root, ref)) && !references.includes(ref)) references.push(ref);
    }
  }

  // Default guardrails forbid unrequested databases. If the user named a backend, allow that one
  // vendor (behind the seam) by dropping the blanket managed-database ban for this spec.
  const mustNotInclude = [
    auth ? null : "auth unless requested",
    "billing",
    "cloud previews",
    persistence?.userNamedBackend ? null : "managed databases",
    "hosted deployment",
    "telemetry"
  ].filter(Boolean);

  const appSpec = {
      name: appNameFor(classification.archetype),
      target,
      archetype: classification.archetype,
      complexity: classification.complexity,
      stack: templateSpec.stack,
      screens: defaults.screens,
      entities: defaults.entities,
      features: defaults.features,
      sampleData: defaults.sampleData,
      mockData: mockDataFor(defaults),
      style: defaults.style,
      designSystem,
      blocks,
      template: template.path,
      templateStatus: templateSpec.status ?? template.status,
      generationMode: templateSpec.status === "runnable" ? "runnable-starter" : "plan-only",
      expectedFiles: templateSpec.expectedFiles ?? [],
      references,
      referenceInputs: options.referenceInputs ?? [],
      referenceLoadingContract,
      dataMode: templateSpec.stack?.data ?? "local-state",
      persistence,
      auth,
      starter: templateSpec.starter,
      mustNotInclude,
      acceptanceCriteria: defaults.acceptanceCriteria,
      localOnly: true,
      questionsNeeded: classification.questionsNeeded,
      questions: classification.questions,
      nextStep: templateSpec.status === "runnable"
        ? "Load the listed references, then generate from the selected runnable starter."
        : "Load the listed references and use the selected template plan as an instruction pack; no runnable starter exists yet."
    };
  appSpec.planAudit = planAuditFor(appSpec);
  appSpec.promptRefinement = promptRefinementFor(prompt, classification, defaults, appSpec);

  const plan = {
    artifactType: "buildable-phase-plan",
    workflowStage: "decision",
    commandRole: "plan",
    planContractVersion: "audit-first-v1",
    prompt,
    classification,
    enhancedPrompt: enhancedPromptFor(prompt, appSpec),
    appSpec,
    consumedBy: ["buildable design", "buildable generate", "buildable review"]
  };
  plan.phasePlan = phasePlanFor(plan);
  plan.planMarkdown = planMarkdownFor(plan);
  return plan;
}

function validateAppSpec(spec) {
  const issues = [];
  const required = ["name", "target", "archetype", "complexity", "stack", "screens", "entities", "features", "sampleData", "mockData", "style", "designSystem", "blocks", "template", "templateStatus", "generationMode", "references", "referenceInputs", "referenceLoadingContract", "mustNotInclude", "acceptanceCriteria", "questionsNeeded", "questions", "planAudit", "promptRefinement"];

  for (const field of required) {
    if (spec[field] === undefined || spec[field] === null) issues.push(`app spec missing ${field}`);
  }

  if (!["web", "mobile"].includes(spec.target)) issues.push(`app spec has invalid target ${spec.target}`);
  if (!Array.isArray(spec.screens) || spec.screens.length === 0) issues.push("app spec screens must be a non-empty array");
  if (!Array.isArray(spec.entities) || spec.entities.length === 0) issues.push("app spec entities must be a non-empty array");
  if (Array.isArray(spec.entities)) {
    for (const entity of spec.entities) {
      if (!entity?.name) issues.push("app spec entity missing name");
      if (!Array.isArray(entity?.fields) || entity.fields.length < 4) {
        issues.push(`app spec entity ${entity?.name ?? "<unknown>"} must include at least 4 concrete fields`);
      }
    }
  }
  if (!Array.isArray(spec.features) || spec.features.length === 0) issues.push("app spec features must be a non-empty array");
  if (!Array.isArray(spec.referenceInputs)) {
    issues.push("app spec referenceInputs must be an array");
  } else {
    for (const input of spec.referenceInputs) {
      if (!input?.path) issues.push("app spec reference input missing path");
      if (!input?.kind) issues.push(`app spec reference input ${input?.path ?? "<unknown>"} missing kind`);
      if (!input?.inspectInstruction) issues.push(`app spec reference input ${input?.path ?? "<unknown>"} missing inspectInstruction`);
    }
  }
  if (!spec.mockData || typeof spec.mockData !== "object") {
    issues.push("app spec mockData must be an object");
  } else {
    if (!spec.mockData.strategy) issues.push("app spec mockData missing strategy");
    if (!Array.isArray(spec.mockData.rules) || spec.mockData.rules.length === 0) issues.push("app spec mockData.rules must be a non-empty array");
    if (!Array.isArray(spec.mockData.entities) || spec.mockData.entities.length === 0) issues.push("app spec mockData.entities must be a non-empty array");
  }
  if (!spec.designSystem || typeof spec.designSystem !== "object") {
    issues.push("app spec designSystem must be an object");
  } else {
    for (const field of ["profile", "styleName", "visualTone", "palette", "typography", "density", "motion"]) {
      if (spec.designSystem[field] === undefined || spec.designSystem[field] === null) {
        issues.push(`app spec designSystem missing ${field}`);
      }
    }
    for (const field of ["layoutRules", "componentRules", "accessibility", "avoid"]) {
      if (!Array.isArray(spec.designSystem[field]) || spec.designSystem[field].length === 0) {
        issues.push(`app spec designSystem.${field} must be a non-empty array`);
      }
    }
  }
  if (!templateStatuses.includes(spec.templateStatus)) issues.push(`app spec has invalid templateStatus ${spec.templateStatus}`);
  if (!["runnable-starter", "plan-only"].includes(spec.generationMode)) issues.push(`app spec has invalid generationMode ${spec.generationMode}`);
  if (!Array.isArray(spec.blocks)) {
    issues.push("app spec blocks must be an array");
  } else {
    const registryIds = new Set((blockRegistry.blocks ?? []).map((block) => block.id));
    for (const block of spec.blocks) {
      if (!block?.id) issues.push("app spec block missing id");
      if (block?.id && !registryIds.has(block.id)) issues.push(`app spec references unknown block ${block.id}`);
      if (!Array.isArray(block?.references) || block.references.length === 0) issues.push(`app spec block ${block?.id ?? "<unknown>"} must include references`);
      for (const reference of block?.references ?? []) {
        if (!existsSync(join(root, reference))) issues.push(`app spec block ${block.id} missing reference ${reference}`);
        if (Array.isArray(spec.references) && !spec.references.includes(reference)) {
          issues.push(`app spec references must include selected block reference ${reference}`);
        }
      }
    }
  }
  if (!Array.isArray(spec.references)) issues.push("app spec references must be an array");
  if (!Array.isArray(spec.referenceLoadingContract)) issues.push("app spec referenceLoadingContract must be an array");
  for (const rule of referenceLoadingContract) {
    if (Array.isArray(spec.referenceLoadingContract) && !spec.referenceLoadingContract.includes(rule)) {
      issues.push(`app spec referenceLoadingContract missing rule: ${rule}`);
    }
  }
  if (!Array.isArray(spec.acceptanceCriteria) || spec.acceptanceCriteria.length === 0) issues.push("app spec acceptanceCriteria must be a non-empty array");
  if (typeof spec.questionsNeeded !== "boolean") issues.push("app spec questionsNeeded must be a boolean");
  if (!Array.isArray(spec.questions)) issues.push("app spec questions must be an array");
  if (!spec.planAudit || !Array.isArray(spec.planAudit.checks) || spec.planAudit.checks.length === 0) {
    issues.push("app spec planAudit.checks must be a non-empty array");
  }
  if (!spec.promptRefinement || !Array.isArray(spec.promptRefinement.optionalQuestions)) {
    issues.push("app spec promptRefinement.optionalQuestions must be an array");
  }

  return issues;
}

function validateTemplateSpec(spec, path) {
  const issues = [];
  const required = ["name", "target", "archetype", "stack", "status", "references"];
  const templateDir = dirname(path);
  const planPath = `${templateDir}/TEMPLATE_PLAN.md`;

  for (const field of required) {
    if (spec[field] === undefined || spec[field] === null) issues.push(`${path}: missing ${field}`);
  }

  if (!["web", "mobile"].includes(spec.target)) issues.push(`${path}: invalid target ${spec.target}`);
  if (!templateStatuses.includes(spec.status)) issues.push(`${path}: invalid status ${spec.status}`);
  if (!Array.isArray(spec.references)) issues.push(`${path}: references must be an array`);
  if (!existsSync(join(root, planPath))) issues.push(`${path}: missing adjacent TEMPLATE_PLAN.md`);
  if (Array.isArray(spec.references) && !spec.references.includes(planPath)) {
    issues.push(`${path}: references must include adjacent ${planPath}`);
  }
  if (spec.status === "runnable" && (!spec.starter || !existsSync(join(root, spec.starter)))) {
    issues.push(`${path}: runnable template is missing starter directory`);
  }

  return issues;
}

function validateArchetypeRegistry(registry) {
  const issues = [];
  const ids = new Set();
  const required = ["id", "name", "defaultTarget", "tags", "style", "screens", "entities", "features"];

  if (!registry || !Array.isArray(registry.archetypes) || registry.archetypes.length === 0) {
    return ["core/archetype-registry.json: archetypes must be a non-empty array"];
  }

  for (const entry of registry.archetypes) {
    const label = entry?.id ? `core/archetype-registry.json:${entry.id}` : "core/archetype-registry.json:<missing-id>";

    for (const field of required) {
      if (entry?.[field] === undefined || entry?.[field] === null) issues.push(`${label}: missing ${field}`);
    }

    if (typeof entry?.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      issues.push(`${label}: id must be kebab-case`);
    } else if (ids.has(entry.id)) {
      issues.push(`${label}: duplicate id`);
    } else {
      ids.add(entry.id);
    }

    if (!["web", "mobile"].includes(entry?.defaultTarget)) issues.push(`${label}: invalid defaultTarget`);

    for (const field of ["tags", "screens", "entities", "features"]) {
      if (!Array.isArray(entry?.[field]) || entry[field].length === 0) {
        issues.push(`${label}: ${field} must be a non-empty array`);
      } else if (entry[field].some((value) => typeof value !== "string" || value.trim() === "")) {
        issues.push(`${label}: ${field} must contain non-empty strings`);
      }
    }

    if (Array.isArray(entry?.tags)) {
      if (entry.tags.length < 3) issues.push(`${label}: tags must include at least 3 prompt-matching terms`);
      if (new Set(entry.tags.map((tag) => tag.toLowerCase())).size !== entry.tags.length) {
        issues.push(`${label}: duplicate tag`);
      }
    }

    if (entry?.id && !existsSync(join(root, `knowledge/archetypes/${entry.id}.md`))) {
      issues.push(`${label}: missing knowledge/archetypes/${entry.id}.md`);
    }
  }

  return issues;
}

function validateBlockRegistry(registry) {
  const issues = [];
  const ids = new Set();
  const required = ["id", "name", "target", "role", "fitsArchetypes", "fitsDesignProfiles", "tags", "needs", "references"];

  if (!registry || !Array.isArray(registry.blocks) || registry.blocks.length === 0) {
    return ["blocks/registry.json: blocks must be a non-empty array"];
  }

  const archetypeIds = new Set(archetypeRegistry.archetypes.map((entry) => entry.id));
  const profileIds = new Set((designSystemRegistry.profiles ?? []).map((entry) => entry.id));

  for (const block of registry.blocks) {
    const label = block?.id ? `blocks/registry.json:${block.id}` : "blocks/registry.json:<missing-id>";
    for (const field of required) {
      if (block?.[field] === undefined || block?.[field] === null) issues.push(`${label}: missing ${field}`);
    }
    if (block?.id) {
      if (ids.has(block.id)) issues.push(`${label}: duplicate id`);
      ids.add(block.id);
    }
    if (block?.target && !["web", "mobile"].includes(block.target)) issues.push(`${label}: invalid target ${block.target}`);
    for (const field of ["fitsArchetypes", "fitsDesignProfiles", "tags", "needs", "references"]) {
      if (!Array.isArray(block?.[field]) || block[field].length === 0) issues.push(`${label}: ${field} must be a non-empty array`);
    }
    for (const archetype of block?.fitsArchetypes ?? []) {
      if (!archetypeIds.has(archetype)) issues.push(`${label}: unknown archetype ${archetype}`);
    }
    for (const profile of block?.fitsDesignProfiles ?? []) {
      if (!profileIds.has(profile)) issues.push(`${label}: unknown design profile ${profile}`);
    }
    for (const reference of block?.references ?? []) {
      if (!existsSync(join(root, reference))) issues.push(`${label}: missing reference ${reference}`);
    }
  }

  return issues;
}

function validateDesignSystemRegistry(registry) {
  const issues = [];
  const ids = new Set();
  const required = ["id", "matches", "target", "styleName", "visualTone", "palette", "typography", "density", "layoutRules", "componentRules", "motion", "accessibility", "avoid"];

  if (!registry || !Array.isArray(registry.profiles) || registry.profiles.length === 0) {
    return ["core/design-system-registry.json: profiles must be a non-empty array"];
  }

  const foundations = registry.foundations;
  if (!foundations || typeof foundations !== "object") {
    issues.push("core/design-system-registry.json: foundations object is required");
  } else {
    for (const key of ["spacingScale", "typeScale", "radiusScale", "motion", "color", "accessibility", "tokenUsageContract"]) {
      if (foundations[key] === undefined || foundations[key] === null) {
        issues.push(`core/design-system-registry.json: foundations.${key} is required`);
      }
    }
    if (!Array.isArray(foundations.tokenUsageContract) || foundations.tokenUsageContract.length === 0) {
      issues.push("core/design-system-registry.json: foundations.tokenUsageContract must be a non-empty array");
    }
  }

  for (const profile of registry.profiles) {
    const label = profile?.id ? `core/design-system-registry.json:${profile.id}` : "core/design-system-registry.json:<missing-id>";

    for (const field of required) {
      if (profile?.[field] === undefined || profile?.[field] === null) issues.push(`${label}: missing ${field}`);
    }

    if (typeof profile?.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.id)) {
      issues.push(`${label}: id must be kebab-case`);
    } else if (ids.has(profile.id)) {
      issues.push(`${label}: duplicate id`);
    } else {
      ids.add(profile.id);
    }

    if (!["web", "mobile"].includes(profile?.target)) issues.push(`${label}: invalid target`);

    for (const field of ["matches", "layoutRules", "componentRules", "accessibility", "avoid"]) {
      if (!Array.isArray(profile?.[field]) || profile[field].length === 0) {
        issues.push(`${label}: ${field} must be a non-empty array`);
      } else if (profile[field].some((value) => typeof value !== "string" || value.trim() === "")) {
        issues.push(`${label}: ${field} must contain non-empty strings`);
      }
    }

    if (!profile?.palette?.intent || !profile?.typography?.mood) {
      issues.push(`${label}: palette.intent and typography.mood are required`);
    }
  }

  const coveredArchetypes = new Set(registry.profiles.flatMap((profile) => profile.matches ?? []));
  for (const entry of archetypeRegistry.archetypes) {
    if (!coveredArchetypes.has(entry.id)) {
      issues.push(`core/design-system-registry.json: no design profile covers ${entry.id}`);
    }
  }

  return issues;
}

function templateSpecPaths() {
  const targets = ["templates/web", "templates/mobile"];
  return targets.flatMap((targetDir) => {
    const absoluteTarget = join(root, targetDir);
    if (!existsSync(absoluteTarget)) return [];
    return readdirSync(absoluteTarget, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${targetDir}/${entry.name}/template-spec.json`)
      .filter((path) => existsSync(join(root, path)));
  });
}

function listTemplates() {
  return templateSpecPaths().map((path) => {
    const spec = readJson(path);
    return {
      name: spec.name,
      target: spec.target,
      archetype: spec.archetype,
      status: spec.status,
      path
    };
  });
}

function list() {
  const templates = listTemplates();
  const templateStatusCounts = templates.reduce((counts, template) => {
    counts[template.status] = (counts[template.status] ?? 0) + 1;
    return counts;
  }, {});
  const payload = {
    package: packageJson.name,
    version: packageJson.version,
    generation: {
      runnableTemplates: templateStatusCounts.runnable ?? 0,
      plannedTemplates: templateStatusCounts.planned ?? 0,
      plannedGenerateMode: "plan-only instruction pack"
    },
    archetypes: archetypeRegistry.archetypes.map((entry) => ({
      id: entry.id,
      target: entry.defaultTarget,
      tags: entry.tags
    })),
    templates
  };

  if (jsonOutput) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Buildable ${packageJson.version}`);
  console.log("");
  console.log(`Bundled archetypes: ${payload.archetypes.length} tag-routed app types`);
  console.log(`Runnable templates: ${payload.generation.runnableTemplates}`);
  console.log(`Planned templates: ${payload.generation.plannedTemplates} (generate --plan-pack writes a plan-only instruction pack)`);
  console.log("");
  console.log("Bundled template specs:");
  for (const template of payload.templates) {
    console.log(`  - ${template.archetype} (${template.target}, ${template.status})`);
    console.log(`    ${template.path}`);
  }
}

function check() {
  const required = [
    "README.md",
    "package.json",
    "bin/buildable.mjs",
    "bin/buildable-mcp.mjs",
    ".mcp.json",
    "cli/README.md",
    "docs/install.md",
    "core/classifier.md",
    "core/archetype-registry.json",
    "core/design-system-registry.json",
    "core/reference-inputs.mjs",
    "core/reference-loading-contract.md",
    "core/ask-vs-build-policy.md",
    "core/app-spec-schema.md",
    "core/schemas/archetype-registry.schema.json",
    "core/schemas/app-spec.schema.json",
    "core/schemas/template-spec.schema.json",
    "blocks/registry.json",
    "blocks/README.md",
    "blocks/schema/block-registry.schema.json",
    "knowledge/archetypes/task-manager.md",
    "knowledge/design-playbooks/design-system-selection.md",
    "knowledge/auth/auth-shape.md",
    "knowledge/auth/auth-seam.md",
    "knowledge/data-models/task-manager.md",
    "knowledge/screen-graphs/task-manager.md",
    "templates/web/task-manager/template-spec.json",
    "skills/planner/SKILL.md",
    "skills/web-builder/SKILL.md",
    "skills/mobile-builder/SKILL.md",
    "skills/reviewer/SKILL.md",
    "evals/rubric.md",
    "adapters/codex/README.md",
    "adapters/claude/README.md",
    "adapters/claude/CLAUDE.md",
    "adapters/cursor/README.md",
    ".cursor/rules/buildable.mdc",
    ".cursor/commands/buildable-plan.md",
    ".cursor/commands/buildable-design.md",
    ".cursor/commands/buildable-status.md",
    ".codex-plugin/plugin.json",
    ".agents/plugins/marketplace.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "commands/buildable-plan.md",
    "commands/buildable-design.md",
    "commands/buildable-generate.md",
    "commands/buildable-review.md",
    "commands/buildable-init.md",
    "commands/buildable-preview.md",
    "commands/buildable-status.md",
    "evals/fixtures.json",
    "evals/skill-activation.json"
  ];
  const missing = required.filter((path) => !existsSync(join(root, path)));
  const templateIssues = [];
  const registryIssues = validateArchetypeRegistry(archetypeRegistry);
  const designSystemIssues = validateDesignSystemRegistry(designSystemRegistry);
  const blockIssues = validateBlockRegistry(blockRegistry);
  const templates = listTemplates();
  const templateStatusCounts = templates.reduce((counts, template) => {
    counts[template.status] = (counts[template.status] ?? 0) + 1;
    return counts;
  }, {});

  for (const template of templates) {
    const spec = readJson(template.path);
    const references = spec.references ?? [];
    templateIssues.push(...validateTemplateSpec(spec, template.path));

    for (const reference of references) {
      if (!existsSync(join(root, reference))) {
        templateIssues.push(`${template.path}: missing reference ${reference}`);
      }
    }
  }

  const plugin = existsSync(join(root, ".codex-plugin/plugin.json"))
    ? readJson(".codex-plugin/plugin.json")
    : null;
  const pluginIssues = [];
  if (plugin) {
    if (plugin.name !== "buildable") pluginIssues.push("plugin name must be buildable");
    if (plugin.version !== packageJson.version) {
      pluginIssues.push(`plugin version ${plugin.version ?? "(missing)"} does not match package ${packageJson.version}`);
    }
    if (typeof plugin.author !== "object" || !plugin.author?.name) {
      pluginIssues.push("plugin author must be an object with a name");
    }
    if (plugin.schema_version !== undefined || plugin.display_name !== undefined || plugin.resources !== undefined) {
      pluginIssues.push("plugin manifest contains retired schema fields");
    }
    const manifestPath = (value, field) => {
      if (typeof value !== "string" || !value.startsWith("./")) {
        pluginIssues.push(`${field} must be a plugin-root path beginning with ./`);
        return null;
      }
      const resolved = join(root, value.slice(2));
      if (!existsSync(resolved)) pluginIssues.push(`${field} path does not exist: ${value}`);
      return resolved;
    };
    const skillsRoot = manifestPath(plugin.skills, "skills");
    if (skillsRoot) {
      for (const skill of ["planner", "web-builder", "mobile-builder", "reviewer"]) {
        if (!existsSync(join(skillsRoot, skill, "SKILL.md"))) {
          pluginIssues.push(`missing bundled skill ${skill}`);
        }
      }
    }
    const mcpPath = manifestPath(plugin.mcpServers, "mcpServers");
    if (mcpPath && existsSync(mcpPath)) {
      const mcpConfig = JSON.parse(readFileSync(mcpPath, "utf8"));
      const servers = mcpConfig.mcpServers ?? mcpConfig.mcp_servers ?? mcpConfig;
      if (!servers.buildable || typeof servers.buildable.command !== "string") {
        pluginIssues.push("bundled MCP config is missing the buildable stdio server");
      }
    }
    const installSurface = plugin.interface;
    for (const field of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
      if (typeof installSurface?.[field] !== "string" || !installSurface[field].trim()) {
        pluginIssues.push(`interface.${field} must be a non-empty string`);
      }
    }
    if (!Array.isArray(installSurface?.capabilities) || installSurface.capabilities.length === 0) {
      pluginIssues.push("interface.capabilities must be a non-empty array");
    }
    if (!Array.isArray(installSurface?.defaultPrompt) || installSurface.defaultPrompt.length === 0) {
      pluginIssues.push("interface.defaultPrompt must contain at least one starter prompt");
    }
  }

  const codexMarketplaceIssues = [];
  if (existsSync(join(root, ".agents/plugins/marketplace.json"))) {
    const marketplace = readJson(".agents/plugins/marketplace.json");
    if (!marketplace.name || !marketplace.interface?.displayName) {
      codexMarketplaceIssues.push("marketplace requires name and interface.displayName");
    }
    for (const entry of marketplace.plugins ?? []) {
      const source = typeof entry.source === "string" ? entry.source : entry.source?.path;
      if (typeof source !== "string" || !source.startsWith("./") || !existsSync(join(root, source))) {
        codexMarketplaceIssues.push(`marketplace plugin ${entry.name}: invalid local source ${source ?? "(missing)"}`);
      }
      if (!entry.policy?.installation || !entry.policy?.authentication || !entry.category) {
        codexMarketplaceIssues.push(`marketplace plugin ${entry.name}: missing install policy or category`);
      }
    }
  }

  const claudePluginIssues = [];
  if (existsSync(join(root, ".claude-plugin/marketplace.json"))) {
    const marketplace = readJson(".claude-plugin/marketplace.json");
    for (const plugin of marketplace.plugins ?? []) {
      const source = plugin.source ?? "./";
      if (!existsSync(join(root, source))) {
        claudePluginIssues.push(`marketplace plugin ${plugin.name}: source ${source} does not exist`);
      }
    }
    if (!existsSync(join(root, ".claude-plugin/plugin.json"))) {
      claudePluginIssues.push("missing .claude-plugin/plugin.json referenced by the marketplace");
    }
    // Slash commands are auto-discovered from commands/; ensure the directory is present.
    if (!existsSync(join(root, "commands"))) {
      claudePluginIssues.push("missing commands/ directory for Claude slash commands");
    }
    // Skills are auto-discovered from skills/*/SKILL.md.
    for (const skill of ["planner", "web-builder", "mobile-builder", "reviewer"]) {
      if (!existsSync(join(root, `skills/${skill}/SKILL.md`))) {
        claudePluginIssues.push(`missing skills/${skill}/SKILL.md`);
      }
    }
  }

  const ok =
    missing.length === 0 &&
    registryIssues.length === 0 &&
    designSystemIssues.length === 0 &&
    blockIssues.length === 0 &&
    templateIssues.length === 0 &&
    pluginIssues.length === 0 &&
    codexMarketplaceIssues.length === 0 &&
    claudePluginIssues.length === 0;
  const payload = {
    ok,
    root,
    checked: {
      requiredFiles: required.length,
      archetypes: archetypeRegistry.archetypes.length,
      blocks: blockRegistry.blocks?.length ?? 0,
      templateSpecs: templates.length,
      runnableTemplates: templateStatusCounts.runnable ?? 0,
      plannedTemplates: templateStatusCounts.planned ?? 0,
      codexPlugin: Boolean(plugin),
      codexMarketplace: existsSync(join(root, ".agents/plugins/marketplace.json")),
      claudePlugin: existsSync(join(root, ".claude-plugin/plugin.json"))
    },
    missing,
    registryIssues,
    designSystemIssues,
    blockIssues,
    templateIssues,
    pluginIssues,
    codexMarketplaceIssues,
    claudePluginIssues
  };

  if (jsonOutput) {
    const output = JSON.stringify(payload, null, 2);
    if (ok) {
      console.log(output);
    } else {
      console.error(output);
    }
  } else if (ok) {
    console.log("Buildable local install check passed.");
    console.log(`  root: ${root}`);
    console.log(`  required files: ${required.length}`);
    console.log(`  archetypes: ${archetypeRegistry.archetypes.length}`);
    console.log(`  blocks: ${blockRegistry.blocks?.length ?? 0}`);
    console.log(`  template specs: ${templates.length} (${templateStatusCounts.runnable ?? 0} runnable, ${templateStatusCounts.planned ?? 0} planned)`);
    console.log("  Codex plugin metadata: present");
    console.log(`  Claude plugin metadata: ${payload.checked.claudePlugin ? "present" : "absent"}`);
    console.log("  hosted services required: no");
  } else {
    console.error("Buildable local install check failed.");
    for (const path of missing) console.error(`  missing: ${path}`);
    for (const issue of registryIssues) console.error(`  registry: ${issue}`);
    for (const issue of designSystemIssues) console.error(`  design-system: ${issue}`);
    for (const issue of blockIssues) console.error(`  blocks: ${issue}`);
    for (const issue of templateIssues) console.error(`  template: ${issue}`);
    for (const issue of pluginIssues) console.error(`  plugin: ${issue}`);
    for (const issue of codexMarketplaceIssues) console.error(`  codex-marketplace: ${issue}`);
    for (const issue of claudePluginIssues) console.error(`  claude-plugin: ${issue}`);
  }

  if (!ok) {
    process.exitCode = 1;
  }
}

function directoryBytes(relativeDir, extensions) {
  const absolute = join(root, relativeDir);
  if (!existsSync(absolute)) return 0;
  let total = 0;

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && (!extensions || extensions.some((ext) => entry.name.endsWith(ext)))) {
        total += statSync(full).size;
      }
    }
  }

  walk(absolute);
  return total;
}

function corpusBytes() {
  // The "discoverable brain" an agent could naively load: all blocks/knowledge docs plus
  // every template plan/spec. Buildable's contract loads only a selected slice.
  return directoryBytes("blocks", [".md", ".json"]) + directoryBytes("knowledge", [".md"]) + directoryBytes("templates", [".md", ".json"]);
}

function referencedBytes(references) {
  return references.reduce((total, reference) => {
    const absolute = join(root, reference);
    return existsSync(absolute) && statSync(absolute).isFile() ? total + statSync(absolute).size : total;
  }, 0);
}

function specQualityScore(appSpec) {
  // Deterministic 0..1 measure of how concrete/complete a generated app spec is.
  const entities = appSpec.entities ?? [];
  const components = {
    entitiesConcrete: entities.length === 0 ? 0 : entities.filter((entity) => (entity.fields ?? []).length >= 4).length / entities.length,
    featureDepth: Math.min(1, (appSpec.features?.length ?? 0) / 6),
    hasScreens: (appSpec.screens?.length ?? 0) > 0 ? 1 : 0,
    hasAcceptance: (appSpec.acceptanceCriteria?.length ?? 0) >= 3 ? 1 : 0,
    hasGuardrails: (appSpec.mustNotInclude?.length ?? 0) > 0 ? 1 : 0
  };
  const values = Object.values(components);
  const score = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { score: Number(score.toFixed(3)), components };
}

function classifySkillActivation(prompt) {
  const normalized = String(prompt ?? "").trim().toLowerCase();
  if (!normalized) return null;

  const explicitSkills = [
    ["buildable-planner", /\$?buildable[- ]planner/],
    ["buildable-web-builder", /\$?buildable[- ]web[- ]builder/],
    ["buildable-mobile-builder", /\$?buildable[- ]mobile[- ]builder/],
    ["buildable-reviewer", /\$?buildable[- ]reviewer/]
  ];
  for (const [skill, pattern] of explicitSkills) {
    if (pattern.test(normalized)) return skill;
  }

  const buildableContext = /\bbuildable\b|\.buildable\/|app spec|phase-plan\.(json|toon)|local-first (app|prototype)/.test(normalized);
  const reviewIntent = /\b(review|audit|check|assess|validate)\b/.test(normalized);
  const reviewScope = /\b(prototype|app|workflow|state coverage|accessibility|responsiveness|quality rubric|local-first)\b/.test(normalized);
  if (buildableContext && reviewIntent && reviewScope) return "buildable-reviewer";

  const buildIntent = /\b(build|generate|implement|adapt|create)\b/.test(normalized);
  const mobileTarget = /\b(mobile|expo|react native|touch-first)\b/.test(normalized);
  const webTarget = /\b(web|next\.?js|dashboard|responsive)\b/.test(normalized);
  if (buildableContext && buildIntent && mobileTarget) return "buildable-mobile-builder";
  if (buildableContext && buildIntent && webTarget) return "buildable-web-builder";

  const planningIntent = /\b(plan|planning|classify|classification|archetype|app spec|phase plan|product idea)\b/.test(normalized);
  const appIdea = /\b(app|prototype|product idea)\b/.test(normalized);
  const targetIsUnclear = /\b(do not know|not sure|unsure|whether)\b.*\b(web|mobile)\b/.test(normalized);
  if ((planningIntent && appIdea) || targetIsUnclear || (buildIntent && appIdea && !mobileTarget && !webTarget)) {
    return "buildable-planner";
  }

  return null;
}

function runEval() {
  const fixturesPath = join(root, "evals/fixtures.json");
  const activationPath = join(root, "evals/skill-activation.json");
  if (!existsSync(fixturesPath) || !existsSync(activationPath)) {
    if (!existsSync(fixturesPath)) console.error("Missing evals/fixtures.json");
    if (!existsSync(activationPath)) console.error("Missing evals/skill-activation.json");
    process.exitCode = 1;
    return;
  }

  const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8")).fixtures ?? [];
  const activationCases = JSON.parse(readFileSync(activationPath, "utf8")).cases ?? [];
  const totalCorpus = corpusBytes();
  const results = [];

  for (const fixture of fixtures) {
    const { appSpec, classification } = specFor(fixture.prompt);
    const specIssues = validateAppSpec(appSpec);
    const missingReferences = appSpec.references.filter((reference) => !existsSync(join(root, reference)));
    const loadedBytes = referencedBytes(appSpec.references);

    const failures = [];
    if (fixture.archetype && classification.archetype !== fixture.archetype) {
      failures.push(`archetype ${classification.archetype} != ${fixture.archetype}`);
    }
    if (fixture.target && appSpec.target !== fixture.target) {
      failures.push(`target ${appSpec.target} != ${fixture.target}`);
    }
    if (specIssues.length > 0) failures.push(`spec: ${specIssues.join("; ")}`);
    if (missingReferences.length > 0) failures.push(`missing references: ${missingReferences.join(", ")}`);

    const quality = specQualityScore(appSpec);
    results.push({
      prompt: fixture.prompt,
      archetype: classification.archetype,
      target: appSpec.target,
      references: appSpec.references.length,
      loadedBytes,
      contextLoadRatio: totalCorpus > 0 ? Number((loadedBytes / totalCorpus).toFixed(4)) : 0,
      specQuality: quality.score,
      specQualityComponents: quality.components,
      guidance: {
        references: appSpec.references.length,
        blocks: appSpec.blocks.length,
        features: appSpec.features.length,
        entityFields: (appSpec.entities ?? []).reduce((sum, entity) => sum + (entity.fields ?? []).length, 0),
        acceptanceCriteria: (appSpec.acceptanceCriteria ?? []).length,
        screens: (appSpec.screens ?? []).length
      },
      ok: failures.length === 0,
      failures
    });
  }

  const passed = results.filter((result) => result.ok).length;
  const avgReferences = results.length ? results.reduce((sum, r) => sum + r.references, 0) / results.length : 0;
  const avgRatio = results.length ? results.reduce((sum, r) => sum + r.contextLoadRatio, 0) / results.length : 0;
  const avgQuality = results.length ? results.reduce((sum, r) => sum + r.specQuality, 0) / results.length : 0;
  const activationResults = activationCases.map((fixture) => {
    const actualSkill = classifySkillActivation(fixture.prompt);
    return {
      ...fixture,
      actualSkill,
      ok: actualSkill === fixture.expectedSkill
    };
  });
  const activationPassed = activationResults.filter((result) => result.ok).length;
  const activationCategoryCounts = activationResults.reduce((counts, result) => {
    counts[result.category] = (counts[result.category] ?? 0) + 1;
    return counts;
  }, {});
  const activationSkillCounts = activationResults.reduce((counts, result) => {
    const skill = result.expectedSkill ?? "none";
    counts[skill] = (counts[skill] ?? 0) + 1;
    return counts;
  }, {});
  const payload = {
    ok: passed === results.length && activationPassed === activationResults.length,
    fixtures: results.length,
    passed,
    failed: results.length - passed,
    corpusBytes: totalCorpus,
    efficiency: {
      avgReferencesLoaded: Number(avgReferences.toFixed(1)),
      avgContextLoadRatio: Number(avgRatio.toFixed(4)),
      avgContextSavedPercent: Number(((1 - avgRatio) * 100).toFixed(1))
    },
    specQuality: {
      avgScore: Number(avgQuality.toFixed(3)),
      minScore: results.length ? Number(Math.min(...results.map((r) => r.specQuality)).toFixed(3)) : 0
    },
    skillActivation: {
      fixtures: activationResults.length,
      passed: activationPassed,
      failed: activationResults.length - activationPassed,
      categoryCounts: activationCategoryCounts,
      skillCounts: activationSkillCounts,
      results: activationResults
    },
    results
  };

  if (flags.has("--compare")) {
    const keys = ["references", "blocks", "features", "entityFields", "acceptanceCriteria", "screens"];
    const average = (key) => (results.length ? Number((results.reduce((sum, r) => sum + r.guidance[key], 0) / results.length).toFixed(1)) : 0);
    const buildable = Object.fromEntries(keys.map((key) => [key, average(key)]));
    // A raw prompt with no Buildable layer supplies none of this structure.
    const raw = Object.fromEntries(keys.map((key) => [key, 0]));
    payload.comparison = {
      baseline: "raw prompt (no Buildable guidance)",
      perPromptAverage: { buildable, raw },
      guidanceAddedPerPrompt: keys.reduce((sum, key) => sum + buildable[key], 0),
      contextCostVsLoadEverything: {
        buildable: `${(avgRatio * 100).toFixed(1)}% of the brain`,
        loadEverything: "100% of the brain"
      }
    };
  }

  if (jsonOutput) {
    const output = JSON.stringify(payload, null, 2);
    if (payload.ok) console.log(output);
    else console.error(output);
  } else {
    console.log(`Buildable eval: ${passed}/${results.length} fixtures passed`);
    console.log("");
    for (const result of results) {
      const status = result.ok ? "pass" : "FAIL";
      console.log(`  [${status}] ${result.prompt}`);
      console.log(`         ${result.archetype} (${result.target}) · ${result.references} refs · ${(result.contextLoadRatio * 100).toFixed(1)}% of corpus · spec quality ${result.specQuality}`);
      for (const failure of result.failures) console.log(`         - ${failure}`);
    }
    console.log("");
    console.log(`Avg references loaded per plan: ${payload.efficiency.avgReferencesLoaded}`);
    console.log(`Avg bundled-brain bytes loaded: ${(payload.efficiency.avgContextLoadRatio * 100).toFixed(1)}% (${payload.efficiency.avgContextSavedPercent}% less than loading the whole brain)`);
    console.log(`Avg spec quality: ${payload.specQuality.avgScore} (min ${payload.specQuality.minScore})`);
    console.log(`Skill activation: ${activationPassed}/${activationResults.length} fixtures passed`);
    for (const result of activationResults.filter((entry) => !entry.ok)) {
      console.log(`  [FAIL] ${result.prompt}`);
      console.log(`         expected ${result.expectedSkill ?? "none"}, got ${result.actualSkill ?? "none"}`);
    }

    if (payload.comparison) {
      const { buildable } = payload.comparison.perPromptAverage;
      console.log("");
      console.log("Guided vs raw prompt (per prompt, on average):");
      console.log(`  Buildable: ${buildable.features} features · ${buildable.entityFields} typed entity fields · ${buildable.blocks} selected blocks · ${buildable.references} curated references · ${buildable.acceptanceCriteria} acceptance criteria`);
      console.log("  Raw prompt: 0 of each (the agent starts from a blank slate)");
      console.log(`  ...delivered while loading ${payload.comparison.contextCostVsLoadEverything.buildable} instead of 100%.`);
    }
  }

  if (!payload.ok) process.exitCode = 1;
}

function detectRepoProfile(workspace) {
  const packagePath = join(workspace, "package.json");
  const profile = {
    workspace,
    detectedAt: new Date().toISOString(),
    hasPackageJson: existsSync(packagePath),
    framework: "unknown",
    language: "unknown",
    styling: "unknown"
  };

  if (profile.hasPackageJson) {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    if (deps.next) profile.framework = "Next.js";
    if (deps.expo) profile.framework = "Expo";
    if (deps.typescript) profile.language = "TypeScript";
    if (deps.tailwindcss) profile.styling = "Tailwind CSS";
    if (deps.nativewind) profile.styling = "NativeWind";
  }

  return profile;
}

function init() {
  const workspace = process.cwd();
  const buildableDir = join(workspace, ".buildable");
  mkdirSync(buildableDir, { recursive: true });

  const existing = flags.has("--existing");
  const profile = detectRepoProfile(workspace);
  const config = {
    version: packageJson.version,
    mode: existing ? "existing-app" : "fresh-start",
    localOnly: true,
    buildableRoot: root,
    createdAt: new Date().toISOString(),
    guardrails: {
      noHostedFeaturesByDefault: true,
      dataMode: "local-or-mock"
    }
  };

  writeJson(join(buildableDir, "config.json"), config);
  if (existing) writeJson(join(buildableDir, "repo-profile.json"), profile);
  writeFileSync(
    join(buildableDir, "BUILDABLE_NOTES.md"),
    `# Buildable Workspace Notes

Mode: ${config.mode}

Use Buildable as local agent context. For existing apps, adapt code conservatively and do not overwrite project structure.

Guardrails:

- no accounts unless requested
- no billing
- no cloud previews
- no managed databases
- no telemetry
- no hosted deployment by default
`
  );

  const payload = {
    ok: true,
    workspace,
    mode: config.mode,
    files: [
      ".buildable/config.json",
      existing ? ".buildable/repo-profile.json" : null,
      ".buildable/BUILDABLE_NOTES.md"
    ].filter(Boolean)
  };

  console.log(jsonOutput ? JSON.stringify(payload, null, 2) : `Initialized Buildable workspace (${config.mode}) at ${workspace}`);
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function statusPathInfo(workspace, relativePath) {
  const absolutePath = join(workspace, relativePath);
  return {
    path: relativePath,
    exists: existsSync(absolutePath)
  };
}

function quoteCommandPrompt(prompt, fallback = "<describe your app>") {
  return JSON.stringify(prompt || fallback);
}

function workspaceStatus(workspace) {
  const packagePath = join(workspace, "package.json");
  const configPath = join(workspace, ".buildable", "config.json");
  const phasePlanPath = join(workspace, ".buildable", "phase-plan.json");
  const appSpecPath = findAppSpec(workspace);
  const designBriefPath = join(workspace, ".buildable", "design-brief.md");
  const reviewReportPath = join(workspace, ".buildable", "review-report.md");
  const implementationPlanPath = join(workspace, "IMPLEMENTATION_PLAN.md");

  const config = readJsonIfExists(configPath);
  const phasePlan = readJsonIfExists(phasePlanPath);
  const appSpecDocument = appSpecPath ? readJsonIfExists(appSpecPath) : null;
  const appSpec = appSpecDocument?.appSpec ?? appSpecDocument ?? phasePlan?.appSpec ?? null;
  const appSpecIssues = appSpec ? validateAppSpec(appSpec) : [];
  const expectedFiles = Array.isArray(appSpec?.expectedFiles) ? appSpec.expectedFiles : [];
  const missingExpectedFiles = expectedFiles.filter((path) => !existsSync(join(workspace, path)));
  const presentExpectedFiles = expectedFiles.filter((path) => existsSync(join(workspace, path)));
  const hasDesignBrief = existsSync(designBriefPath);
  const hasReviewReport = existsSync(reviewReportPath);
  const isBuildablePluginRepo =
    existsSync(join(workspace, "bin", "buildable.mjs")) &&
    existsSync(join(workspace, "core", "archetype-registry.json")) &&
    existsSync(join(workspace, "templates"));
  const generated =
    Boolean(appSpecPath) &&
    (config?.workflowStage === "generated-files" ||
      config?.artifactType === "buildable-generated-project" ||
      existsSync(join(workspace, "BUILDABLE_TEMPLATE.md")) ||
      existsSync(implementationPlanPath) ||
      presentExpectedFiles.length > 0);
  const initializedExisting = config?.mode === "existing-app";
  const blocked = Boolean(appSpec?.questionsNeeded || phasePlan?.classification?.questionsNeeded);

  let stage = "uninitialized";
  if (initializedExisting && !phasePlan && !appSpecPath) stage = "initialized-existing-app";
  if (phasePlan && !blocked) stage = "planned";
  if (hasDesignBrief && !generated && !blocked) stage = "design-ready";
  if (generated && !hasReviewReport) stage = missingExpectedFiles.length > 0 ? "generated-incomplete" : "needs-review";
  if (generated && hasReviewReport) stage = "reviewed";
  if (blocked) stage = "blocked-needs-questions";
  if (isBuildablePluginRepo) stage = "buildable-plugin-repo";

  const prompt = phasePlan?.prompt ?? null;
  let nextCommand = `buildable plan ${quoteCommandPrompt(null)}`;
  let nextReason = "No Buildable plan or generated app was found in this workspace.";

  if (stage === "buildable-plugin-repo") {
    nextCommand = "buildable check";
    nextReason = "This is the Buildable plugin repository; run self-checks before publishing changes.";
  } else if (stage === "initialized-existing-app") {
    nextCommand = 'buildable plan "<describe the workflow to add>"';
    nextReason = "The existing app is initialized but has no saved Buildable plan yet.";
  } else if (stage === "blocked-needs-questions") {
    nextCommand = prompt ? `buildable plan ${quoteCommandPrompt(prompt)}` : `buildable plan ${quoteCommandPrompt(null)}`;
    nextReason = "The saved plan has blocking product-direction or architecture questions.";
  } else if (stage === "planned") {
    nextCommand = "buildable design --write";
    nextReason = "A plan exists; write a concrete UI/UX brief before generation when visual direction matters.";
  } else if (stage === "design-ready") {
    nextCommand = prompt ? `buildable generate ${quoteCommandPrompt(prompt)}` : `buildable generate ${quoteCommandPrompt(null)}`;
    nextReason = "The design brief is ready and no generated app files were detected.";
  } else if (stage === "generated-incomplete") {
    nextCommand = "buildable review";
    nextReason = "Generated app spec exists, but some expected files are missing; run review to get the fix list.";
  } else if (stage === "needs-review") {
    nextCommand = "buildable review";
    nextReason = "Generated app files were detected and no review report was found.";
  } else if (stage === "reviewed") {
    nextCommand = "buildable review";
    nextReason = "A review report exists; rerun review after fixes or further changes.";
  }

  return {
    ok: true,
    workspace,
    stage,
    readOnly: true,
    files: {
      config: statusPathInfo(workspace, ".buildable/config.json"),
      phasePlan: statusPathInfo(workspace, ".buildable/phase-plan.json"),
      phasePlanToon: statusPathInfo(workspace, ".buildable/phase-plan.toon"),
      designBrief: statusPathInfo(workspace, ".buildable/design-brief.md"),
      designBriefToon: statusPathInfo(workspace, ".buildable/design-brief.toon"),
      appSpec: {
        path: appSpecPath ? relative(workspace, appSpecPath) : "buildable-app-spec.json",
        exists: Boolean(appSpecPath)
      },
      buildableTemplate: statusPathInfo(workspace, "BUILDABLE_TEMPLATE.md"),
      implementationPlan: statusPathInfo(workspace, "IMPLEMENTATION_PLAN.md"),
      packageJson: {
        path: "package.json",
        exists: existsSync(packagePath)
      },
      reviewReport: statusPathInfo(workspace, ".buildable/review-report.md"),
      reviewReportToon: statusPathInfo(workspace, ".buildable/review-report.toon")
    },
    plan: phasePlan ? {
      prompt: phasePlan.prompt ?? null,
      artifactType: phasePlan.artifactType ?? null,
      workflowStage: phasePlan.workflowStage ?? null
    } : null,
    app: appSpec ? {
      name: appSpec.name,
      target: appSpec.target,
      archetype: appSpec.archetype,
      template: appSpec.template,
      templateStatus: appSpec.templateStatus,
      generationMode: appSpec.generationMode,
      references: Array.isArray(appSpec.references) ? appSpec.references.length : 0,
      blocks: Array.isArray(appSpec.blocks) ? appSpec.blocks.map((block) => block.id) : [],
      questionsNeeded: Boolean(appSpec.questionsNeeded),
      questions: appSpec.questions ?? [],
      expectedFiles: {
        total: expectedFiles.length,
        present: presentExpectedFiles.length,
        missing: missingExpectedFiles
      },
      appSpecValid: appSpecIssues.length === 0,
      appSpecIssues
    } : null,
    next: {
      command: nextCommand,
      reason: nextReason
    }
  };
}

function printWorkspaceStatus(payload) {
  console.log("Buildable workspace status");
  console.log("");
  console.log(`Workspace: ${payload.workspace}`);
  console.log(`Stage: ${payload.stage}`);
  console.log("");
  console.log(`Plan: ${payload.files.phasePlan.exists ? "found" : "missing"}`);
  console.log(`Plan TOON: ${payload.files.phasePlanToon.exists ? "found" : "missing"}`);
  console.log(`Design brief: ${payload.files.designBrief.exists ? "found" : "missing"}`);
  console.log(`Design TOON: ${payload.files.designBriefToon.exists ? "found" : "missing"}`);
  console.log(`App spec: ${payload.files.appSpec.exists ? (payload.app?.appSpecValid ? "valid" : "invalid") : "missing"}`);
  if (payload.app) {
    console.log(`App: ${payload.app.name} (${payload.app.target} ${payload.app.archetype})`);
    console.log(`Template: ${payload.app.templateStatus} ${payload.app.template}`);
    console.log(`References: ${payload.app.references} selected`);
    console.log(`Blocks: ${payload.app.blocks.length ? payload.app.blocks.join(", ") : "none"}`);
    if (payload.app.expectedFiles.total > 0) {
      console.log(`Expected files: ${payload.app.expectedFiles.present}/${payload.app.expectedFiles.total} present`);
      if (payload.app.expectedFiles.missing.length > 0) {
        console.log(`Missing: ${payload.app.expectedFiles.missing.join(", ")}`);
      }
    }
    if (payload.app.questionsNeeded) {
      console.log("Questions:");
      for (const question of payload.app.questions) console.log(`  - ${question}`);
    }
  }
  console.log(`Review: ${payload.files.reviewReport.exists ? "found" : "not recorded"}`);
  console.log(`Review TOON: ${payload.files.reviewReportToon.exists ? "found" : "missing"}`);
  console.log("");
  console.log("Recommended next step:");
  console.log(`  ${payload.next.command}`);
  console.log(`  ${payload.next.reason}`);
}

function status() {
  const targetValue = parsedArgs.positionals[0] ?? ".";
  const workspace = isAbsolute(targetValue) ? targetValue : join(process.cwd(), targetValue);

  if (!existsSync(workspace) || !statSync(workspace).isDirectory()) {
    console.error(`Status target is not a directory: ${workspace}`);
    process.exitCode = 1;
    return;
  }

  const payload = workspaceStatus(workspace);
  if (jsonOutput) console.log(JSON.stringify(payload, null, 2));
  else printWorkspaceStatus(payload);
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });

  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
    }
  }
}

function directoryHasFiles(path) {
  return existsSync(path) && readdirSync(path).length > 0;
}

function slugFor(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "buildable-app";
}

function implementationPlanFor(plan) {
  return `# Buildable Implementation Pack

Prompt:

${plan.prompt}

Selected template:

- ${plan.appSpec.template}
- status: ${plan.appSpec.templateStatus}
- generation mode: ${plan.appSpec.generationMode}

This template does not include a runnable starter yet. Use this directory as an instruction pack for a local coding agent.

## App Spec Summary

- name: ${plan.appSpec.name}
- target: ${plan.appSpec.target}
- archetype: ${plan.appSpec.archetype}
- stack: ${plan.appSpec.stack.framework}, ${plan.appSpec.stack.language}, ${plan.appSpec.stack.styling}
- data mode: ${plan.appSpec.dataMode}

## References To Load

${plan.appSpec.references.map((reference) => `- ${reference}`).join("\n")}

## Selected Micro-Blocks

${plan.appSpec.blocks.length ? plan.appSpec.blocks.map((block) => `- ${block.id}: ${block.reason}`).join("\n") : "- None"}

## Build Steps

1. Read \`buildable-app-spec.json\`.
2. Follow \`appSpec.referenceLoadingContract\`.
3. Load only the references listed above, including selected block docs.
4. Build a local ${plan.appSpec.target} prototype that implements the listed screens, entities, features, and acceptance criteria.
5. Use local/mock data by default.
6. Run \`buildable review\` and fix blocking issues before handoff.

Do not add accounts, billing, cloud previews, managed databases, telemetry, or hosted deployment unless explicitly requested.
`;
}

const designTokenPresets = {
  "focused-productivity": {
    darkColors: {
      background: "#020617",
      surface: "#0F172A",
      surfaceMuted: "#1E293B",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#60A5FA",
      primaryForeground: "#0F172A",
      accent: "#2DD4BF",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#60A5FA"
    },
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#EEF2F7",
      foreground: "#0F172A",
      mutedForeground: "#64748B",
      primary: "#2563EB",
      primaryForeground: "#FFFFFF",
      accent: "#14B8A6",
      border: "#CBD5E1",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#2563EB"
    },
    typography: {
      heading: "Inter or system sans",
      body: "Inter or system sans",
      scale: "12, 14, 16, 18, 24, 32",
      lineHeight: "1.45-1.6"
    },
    spacing: "4px base with 8/12/16/24/32px product spacing",
    radius: "8px controls, 10px panels",
    shadow: "subtle border-first elevation",
    componentEmphasis: ["composer", "status chips", "filters", "list rows", "empty states"]
  },
  "operator-dashboard": {
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#F1F5F9",
      foreground: "#111827",
      mutedForeground: "#6B7280",
      primary: "#4F46E5",
      primaryForeground: "#FFFFFF",
      accent: "#0EA5E9",
      border: "#D1D5DB",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#4F46E5"
    },
    darkColors: {
      background: "#020617",
      surface: "#0F172A",
      surfaceMuted: "#111827",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#818CF8",
      primaryForeground: "#0F172A",
      accent: "#38BDF8",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#818CF8"
    },
    typography: {
      heading: "Inter, Geist, or system sans",
      body: "Inter, Geist, or system sans",
      mono: "JetBrains Mono or ui-monospace for tabular metrics",
      scale: "12, 13, 14, 16, 20, 24, 30",
      lineHeight: "1.4-1.55"
    },
    spacing: "4px base with dense 6/8/12/16/24px dashboard spacing",
    radius: "6px controls, 8px panels",
    shadow: "minimal shadows; prefer borders and tonal surfaces",
    componentEmphasis: ["metric cards", "tables", "filters", "status badges", "detail panels"]
  },
  "modern-saas": {
    darkColors: {
      background: "#0B1120",
      surface: "#111827",
      surfaceMuted: "#1E293B",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#818CF8",
      primaryForeground: "#0F172A",
      accent: "#22D3EE",
      border: "#1F2937",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#818CF8"
    },
    colors: {
      background: "#FFFFFF",
      surface: "#F8FAFC",
      surfaceMuted: "#EEF2FF",
      foreground: "#0F172A",
      mutedForeground: "#64748B",
      primary: "#4F46E5",
      primaryForeground: "#FFFFFF",
      accent: "#06B6D4",
      border: "#E2E8F0",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      focus: "#4F46E5"
    },
    typography: {
      heading: "Inter, Geist, or a crisp brand sans",
      body: "Inter, Geist, or system sans",
      scale: "14, 16, 18, 24, 36, 48, 64",
      lineHeight: "1.2 headings, 1.6 body"
    },
    spacing: "8px base with 24/40/64/96px section spacing",
    radius: "8px components, 12px media, avoid nested card shells",
    shadow: "one restrained elevation level for interactive media/cards",
    componentEmphasis: ["hero", "CTA groups", "feature sections", "social proof", "responsive nav"]
  },
  "marketplace-catalog": {
    darkColors: {
      background: "#1C1917",
      surface: "#292524",
      surfaceMuted: "#231F1D",
      foreground: "#FAFAF9",
      mutedForeground: "#A8A29E",
      primary: "#2DD4BF",
      primaryForeground: "#1C1917",
      accent: "#FB923C",
      border: "#44403C",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#2DD4BF"
    },
    colors: {
      background: "#FAFAF9",
      surface: "#FFFFFF",
      surfaceMuted: "#F5F5F4",
      foreground: "#1C1917",
      mutedForeground: "#78716C",
      primary: "#0F766E",
      primaryForeground: "#FFFFFF",
      accent: "#F97316",
      border: "#D6D3D1",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#0F766E"
    },
    typography: {
      heading: "Inter or system sans",
      body: "Inter or system sans",
      scale: "13, 14, 16, 18, 24, 32",
      lineHeight: "1.45-1.6"
    },
    spacing: "4px base with 12/16/24/32px catalog spacing",
    radius: "8px listings, 6px controls",
    shadow: "light card shadows only on hover/focus",
    componentEmphasis: ["search", "filter chips", "listing cards", "metadata rows", "detail/inquiry panels"]
  },
  "mobile-utility": {
    darkColors: {
      background: "#020617",
      surface: "#0F172A",
      surfaceMuted: "#1E293B",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#60A5FA",
      primaryForeground: "#0F172A",
      accent: "#34D399",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#60A5FA"
    },
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#EEF2F7",
      foreground: "#0F172A",
      mutedForeground: "#64748B",
      primary: "#2563EB",
      primaryForeground: "#FFFFFF",
      accent: "#10B981",
      border: "#CBD5E1",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#2563EB"
    },
    typography: {
      heading: "system sans / platform default",
      body: "system sans / platform default",
      scale: "12, 14, 16, 18, 22, 28",
      lineHeight: "1.35-1.55"
    },
    spacing: "4px base with 12/16/20/24px touch spacing",
    radius: "12px cards, 10px inputs, pill segmented controls",
    shadow: "very soft elevation or border-only surfaces",
    componentEmphasis: ["bottom actions", "segmented controls", "large tap targets", "safe-area spacing", "state feedback"]
  },
  "conversation-mobile": {
    darkColors: {
      background: "#020617",
      surface: "#0F172A",
      surfaceMuted: "#0C4A6E",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#38BDF8",
      primaryForeground: "#0F172A",
      accent: "#7DD3FC",
      border: "#1E3A5F",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#38BDF8"
    },
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#E0F2FE",
      foreground: "#0F172A",
      mutedForeground: "#64748B",
      primary: "#0284C7",
      primaryForeground: "#FFFFFF",
      accent: "#7DD3FC",
      border: "#BAE6FD",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#0284C7"
    },
    typography: {
      heading: "system sans / platform default",
      body: "system sans / platform default",
      scale: "12, 14, 16, 18, 22, 28",
      lineHeight: "1.35-1.55"
    },
    spacing: "4px base with 8/12/16/20px message spacing",
    radius: "18px message bubbles, 12px composer",
    shadow: "no heavy shadows; rely on contrast between message surfaces",
    componentEmphasis: ["message bubbles", "composer", "send button", "timestamps", "keyboard-safe layout"]
  },
  "hospitality-service": {
    darkColors: {
      background: "#1C1917",
      surface: "#292524",
      surfaceMuted: "#231F1D",
      foreground: "#FAF7F2",
      mutedForeground: "#A8A29E",
      primary: "#2DD4BF",
      primaryForeground: "#1C1917",
      accent: "#FBBF24",
      border: "#44403C",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#2DD4BF"
    },
    colors: {
      background: "#FFFBF5",
      surface: "#FFFFFF",
      surfaceMuted: "#F4EDE4",
      foreground: "#1F2937",
      mutedForeground: "#6B7280",
      primary: "#0F766E",
      primaryForeground: "#FFFFFF",
      accent: "#D97706",
      border: "#E7D8C9",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#0F766E"
    },
    typography: {
      heading: "Lora, Fraunces, or a warm brand serif",
      body: "Inter, Raleway, or system sans",
      scale: "14, 16, 18, 24, 36, 48",
      lineHeight: "1.35 headings, 1.6 body"
    },
    spacing: "8px base with 20/32/48/72px content spacing",
    radius: "10px content blocks, 8px controls",
    shadow: "soft editorial shadows for media/cards",
    componentEmphasis: ["booking/contact CTA", "service/menu sections", "hours/location", "confirmation states"]
  },
  "community-content": {
    darkColors: {
      background: "#020617",
      surface: "#0F172A",
      surfaceMuted: "#1E293B",
      foreground: "#F8FAFC",
      mutedForeground: "#94A3B8",
      primary: "#22D3EE",
      primaryForeground: "#0F172A",
      accent: "#A78BFA",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      focus: "#22D3EE"
    },
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceMuted: "#ECFEFF",
      foreground: "#0F172A",
      mutedForeground: "#64748B",
      primary: "#0891B2",
      primaryForeground: "#FFFFFF",
      accent: "#8B5CF6",
      border: "#CBD5E1",
      success: "#16A34A",
      warning: "#D97706",
      danger: "#DC2626",
      focus: "#0891B2"
    },
    typography: {
      heading: "Inter, Source Sans 3, or system sans",
      body: "Inter, Source Sans 3, or system sans",
      scale: "13, 14, 16, 18, 24, 32, 40",
      lineHeight: "1.45-1.7"
    },
    spacing: "4px base with 12/16/24/40px content spacing",
    radius: "8px controls and content cards",
    shadow: "border-first surfaces with rare hover elevation",
    componentEmphasis: ["content lists", "forms", "status/category chips", "search", "contribution empty states"]
  }
};

function designTokensFor(designSystem, prompt) {
  const preset = designTokenPresets[designSystem.profile] ?? designTokenPresets["focused-productivity"];
  // Dark mode is requested by an explicit --dark flag or a "dark"/"dark mode" prompt cue.
  // Every profile now ships a complete darkColors set, so this never silently falls back.
  const wantsDark = Boolean((flags.has("--dark") || /\bdark\b|\bdark mode\b/i.test(prompt)) && preset.darkColors);
  return {
    theme: wantsDark ? "dark" : "light",
    colors: wantsDark ? preset.darkColors : preset.colors,
    colorsLight: preset.colors,
    colorsDark: preset.darkColors,
    typography: preset.typography,
    spacing: preset.spacing,
    radius: preset.radius,
    shadow: preset.shadow,
    motion: {
      default: designSystem.motion,
      duration: designSystem.profile.includes("mobile") ? "120-220ms" : "150-250ms",
      easing: "ease-out for entry, ease-in for exit, respect reduced motion"
    },
    components: preset.componentEmphasis
  };
}

// Specialized quality rubric per design profile, layered on top of the base web/mobile rubric.
const surfaceRubricByProfile = {
  "focused-productivity": "knowledge/quality-rubrics/forms-auth.md",
  "operator-dashboard": "knowledge/quality-rubrics/data-dense.md",
  "marketplace-catalog": "knowledge/quality-rubrics/data-dense.md",
  "modern-saas": "knowledge/quality-rubrics/content-marketing.md",
  "community-content": "knowledge/quality-rubrics/content-marketing.md",
  "hospitality-service": "knowledge/quality-rubrics/content-marketing.md"
};

function surfaceRubricFor(designSystem) {
  return surfaceRubricByProfile[designSystem?.profile] ?? null;
}

// Flag components that bypass the token palette: inline-style hex, or 2+ distinct raw hex
// values in arbitrary Tailwind brackets (palette sprawl). A single shared surface tint is fine.
function designTokenRisks(file, relPath) {
  if (!/\.(tsx|jsx)$/.test(file)) return [];
  const text = readFileSync(file, "utf8");
  const bracketHex = [...new Set((text.match(/(?:bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration)-\[#[0-9a-fA-F]{3,8}\]/g) ?? []))];
  const inlineHex = text.match(/style=(?:\{\{[^}]*#[0-9a-fA-F]{3,8}[^}]*\}\}|"[^"]*#[0-9a-fA-F]{3,8}[^"]*")/g) ?? [];
  const risks = [];
  if (inlineHex.length > 0 || bracketHex.length >= 2) {
    const sample = (inlineHex.length > 0 ? ["inline style hex"] : []).concat(bracketHex.slice(0, 3)).join(", ");
    risks.push(`${relPath}: hard-coded colors bypass the token palette (${sample}); drive color from theme tokens. See core/design-system-registry.json foundations.tokenUsageContract.`);
  }
  return risks;
}

function pageFocusFor(prompt) {
  const explicit = parsedArgs.values.page;
  if (explicit) return explicit;
  const match = prompt.match(/\b(login|sign in|signup|sign up|dashboard|home|landing|checkout|pricing|profile|settings|detail|list|form|modal|table|chart|kanban|calendar)\b/i);
  return match ? match[0].toLowerCase().replace(/\s+/g, "-") : null;
}

function designBriefMarkdown(brief) {
  const colorLines = Object.entries(brief.designTokens.colorsLight ?? brief.designTokens.colors).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  const darkColorLines = Object.entries(brief.designTokens.colorsDark ?? {}).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  return `# Buildable Design Brief

Prompt:

${brief.prompt}

Recommended workflow: ${brief.recommendedWorkflow}
Scope: ${brief.scope}
Next suggested command: ${brief.nextSuggestedCommand}

## Scope

- app: ${brief.app.name}
- target: ${brief.app.target}
- archetype: ${brief.app.archetype}
- focus: ${brief.focus ?? "whole app"}

## Design Command Boundary

${brief.boundary}

Non-goals:

${brief.nonGoals.map((goal) => `- ${goal}`).join("\n")}

## Design System

- profile: ${brief.designSystem.profile}
- style: ${brief.designSystem.styleName}
- tone: ${brief.designSystem.visualTone}
- density: ${brief.designSystem.density}
- motion: ${brief.designSystem.motion}

## Color Tokens

Active theme: ${brief.designTokens.theme}. Both token sets are provided so you can wire a light/dark toggle; map them to CSS variables or your theme config rather than hard-coding hex.

### Light

${colorLines}

### Dark

${darkColorLines}

## Typography

- heading: ${brief.designTokens.typography.heading}
- body: ${brief.designTokens.typography.body}
- scale: ${brief.designTokens.typography.scale}
- line height: ${brief.designTokens.typography.lineHeight}

## Token Usage Rules

${(designSystemRegistry.foundations?.tokenUsageContract ?? []).map((rule) => `- ${rule}`).join("\n")}

## UI Rules

${brief.uiRules.map((rule) => `- ${rule}`).join("\n")}

## Mockup Data

- strategy: ${brief.mockDataGuidance.strategy}
- records per entity: ${brief.mockDataGuidance.recordsPerEntity}

${brief.mockDataGuidance.rules.map((rule) => `- ${rule}`).join("\n")}

## User Reference Inputs

${brief.referenceInputs.length ? brief.referenceInputs.map((input) => `- ${input.kind}: ${input.path}${input.exists ? "" : " (missing)"}`).join("\n") : "- None"}

## Avoid

${brief.avoid.map((rule) => `- ${rule}`).join("\n")}

## Agent Handoff Prompt

${brief.handoffPrompt}

## Next

Ask the user: "${brief.satisfactionQuestion}"
`;
}

function designToonFor(brief) {
  const lines = [
    "buildable_design:",
    "  format: toon-style-v1",
    "  source_of_truth: .buildable/design-brief.json",
    `  prompt: ${toonValue(brief.prompt)}`,
    `  scope: ${toonValue(brief.scope)}`,
    `  boundary: ${toonValue(brief.boundary)}`,
    "  app:",
    `    name: ${toonValue(brief.app.name)}`,
    `    target: ${toonValue(brief.app.target)}`,
    `    archetype: ${toonValue(brief.app.archetype)}`,
    `    focus: ${toonValue(brief.focus ?? "whole app")}`,
    "  design:",
    `    profile: ${toonValue(brief.designSystem.profile)}`,
    `    styleName: ${toonValue(brief.designSystem.styleName)}`,
    `    density: ${toonValue(brief.designSystem.density)}`,
    `    theme: ${toonValue(brief.designTokens.theme)}`,
    toonTable("colors", ["role", "value"], Object.entries(brief.designTokens.colors).map(([role, value]) => ({ role, value })), "    "),
    toonList("components", brief.designTokens.components ?? [], "    "),
    toonList("uiRules", brief.uiRules, "    "),
    toonList("avoid", brief.avoid, "    "),
    "  mockData:",
    `    recordsPerEntity: ${toonValue(brief.mockDataGuidance.recordsPerEntity)}`,
    toonTable("entities", ["name", "minimumRecords", "fields"], (brief.mockDataGuidance.entities ?? []).map((entity) => ({
      name: entity.name,
      minimumRecords: entity.minimumRecords,
      fields: (entity.fieldsToPopulate ?? []).join("|")
    })), "    "),
    toonList("requiredStates", brief.mockDataGuidance.requiredStates ?? [], "    "),
    "  loading:",
    toonList("references", brief.references, "    "),
    toonTable("referenceInputs", ["kind", "path", "exists"], brief.referenceInputs ?? [], "    ")
  ];
  return `${lines.join("\n")}\n`;
}

function designBriefFor(prompt, appSpec = null) {
  const plan = appSpec
    ? {
        prompt,
        classification: {
          target: appSpec.target,
          explicitTarget: false,
          archetype: appSpec.archetype,
          complexity: appSpec.complexity ?? "simple-prototype",
          questionsNeeded: false,
          questions: [],
          confidence: "from-app-spec"
        },
        appSpec
      }
    : specFor(prompt);
  const defaults = appSpec
    ? {
        style: appSpec.style,
        screens: appSpec.screens,
        entities: appSpec.entities,
        features: appSpec.features,
        sampleData: appSpec.sampleData,
        acceptanceCriteria: appSpec.acceptanceCriteria
      }
    : defaultsFor(plan.classification.archetype);
  const designSystem = designSystemFor(plan.classification, defaults, prompt);
  const focus = pageFocusFor(prompt);
  const designTokens = designTokensFor(designSystem, prompt);
  const mockDataGuidance = appSpec?.mockData ?? plan.appSpec.mockData ?? mockDataFor(defaults);
  const references = uniqueValues([
    ...(appSpec?.references ?? plan.appSpec.references ?? []),
    "knowledge/design-playbooks/design-system-selection.md",
    "knowledge/design-playbooks/ui-quality.md",
    plan.appSpec.target === "mobile" ? "knowledge/quality-rubrics/mobile-app.md" : "knowledge/quality-rubrics/web-app.md",
    surfaceRubricFor(designSystem)
  ].filter(Boolean));
  const uiRules = uniqueValues([
    ...designSystem.layoutRules,
    ...designSystem.componentRules,
    ...designSystem.accessibility
  ]);
  const handoffPrompt = [
    `Design ${focus ? `the ${focus} surface` : `the ${plan.appSpec.name} ${plan.appSpec.archetype} app`} using Buildable's ${designSystem.styleName} profile.`,
    "This is a UI/UX-only design brief: do not create backend services, databases, auth, payments, or hosted infrastructure from this command.",
    (plan.appSpec.referenceInputs ?? []).length ? "Inspect the explicit user reference inputs before applying visual direction; do not inspect unrelated files." : null,
    `Use these token roles: background ${designTokens.colors.background}, surface ${designTokens.colors.surface}, foreground ${designTokens.colors.foreground}, primary ${designTokens.colors.primary}, accent ${designTokens.colors.accent}, border ${designTokens.colors.border}.`,
    `Typography: ${designTokens.typography.heading} for headings and ${designTokens.typography.body} for body; scale ${designTokens.typography.scale}.`,
    `Respect the reference loading contract: do not load all templates; load only the references listed in this brief and the current app files needed for the surface.`,
    "Keep the existing stack and component conventions. Do not add auth, billing, hosted databases, telemetry, or deployment unless explicitly requested.",
    "After implementation, run buildable review and fix blocking issues."
  ].filter(Boolean).join(" ");

  return {
    prompt,
    source: appSpec ? "app-spec" : "prompt",
    scope: "ui-ux-only",
    boundary: "The design command produces front-end UI/UX direction only. It may guide layout, visual tokens, interactions, accessibility, copy hierarchy, and component states, but it must not add backend architecture or hosted services.",
    nonGoals: [
      "no backend implementation",
      "no database or persistence decision",
      "no auth/accounts decision",
      "no billing/payments decision",
      "no hosted deployment, cloud preview, telemetry, or managed service"
    ],
    recommendedWorkflow: "Plan > Design > Generate > Review",
    nextSuggestedCommand: `buildable generate ${JSON.stringify(prompt)}`,
    interchangeableUse: [
      "Before plan: explore visual direction from a prompt.",
      "After plan: deepen appSpec.designSystem into concrete tokens.",
      "During build: design a page, state, or component without replanning the app.",
      "Before review: create a polish checklist for the current implementation."
    ],
    app: {
      name: plan.appSpec.name,
      target: plan.appSpec.target,
      archetype: plan.appSpec.archetype,
      stack: plan.appSpec.stack
    },
    focus,
    designSystem,
    designTokens,
    mockDataGuidance,
    referenceInputs: plan.appSpec.referenceInputs ?? [],
    uiRules,
    avoid: designSystem.avoid,
    references,
    referenceLoadingContract,
    handoffPrompt,
    satisfactionQuestion: `Are you satisfied with this UI/UX direction and mockup-data plan? If yes, I can move to generate with \`${`buildable generate ${JSON.stringify(prompt)}`}\`.`
  };
}

function findNearestAppSpec(workspace) {
  const direct = findAppSpec(workspace);
  if (direct) return direct;
  const phasePlan = join(workspace, ".buildable", "phase-plan.json");
  return existsSync(phasePlan) ? phasePlan : null;
}

function design() {
  const targetValue = parsedArgs.values.target ?? ".";
  const target = isAbsolute(targetValue) ? targetValue : join(process.cwd(), targetValue);
  const specValue = parsedArgs.values.spec;
  const specPath = specValue
    ? (isAbsolute(specValue) ? specValue : join(process.cwd(), specValue))
    : (input ? findAppSpec(target) : findNearestAppSpec(target));
  const specDocument = specPath && existsSync(specPath) ? JSON.parse(readFileSync(specPath, "utf8")) : null;
  const appSpec = specDocument?.appSpec ?? specDocument;
  const prompt = input || specDocument?.prompt || (appSpec ? `Design ${appSpec.name}` : "");

  if (!prompt) {
    console.error('Missing prompt or app spec. Example: buildable design "Build me a CRM website"');
    process.exitCode = 1;
    return;
  }

  const brief = designBriefFor(prompt, appSpec);
  const appSpecIssues = appSpec ? validateAppSpec(appSpec) : [];
  if (appSpecIssues.length > 0) brief.appSpecWarnings = appSpecIssues;

  if (flags.has("--write")) {
    mkdirSync(join(target, ".buildable"), { recursive: true });
    writeJson(join(target, ".buildable", "design-brief.json"), brief);
    writeFileSync(join(target, ".buildable", "design-brief.md"), designBriefMarkdown(brief));
    writeFileSync(join(target, ".buildable", "design-brief.toon"), designToonFor(brief));
    brief.written = {
      json: ".buildable/design-brief.json",
      markdown: ".buildable/design-brief.md",
      toon: ".buildable/design-brief.toon"
    };
  }

  if (jsonOutput) {
    console.log(JSON.stringify(brief, null, 2));
  } else {
    console.log(designBriefMarkdown(brief));
    if (brief.written) console.log("Saved: .buildable/design-brief.json and .buildable/design-brief.md");
  }
}

function writePhasePlanFiles(plan, target = process.cwd()) {
  mkdirSync(join(target, ".buildable"), { recursive: true });
  writeJson(join(target, ".buildable", "phase-plan.json"), plan);
  writeFileSync(join(target, ".buildable", "phase-plan.md"), plan.planMarkdown);
  writeFileSync(join(target, ".buildable", "phase-plan.toon"), planToonFor(plan));
  return {
    json: ".buildable/phase-plan.json",
    markdown: ".buildable/phase-plan.md",
    toon: ".buildable/phase-plan.toon"
  };
}

function savedPhasePlanForPrompt(prompt, workspace = process.cwd()) {
  const phasePlanPath = join(workspace, ".buildable", "phase-plan.json");
  if (!existsSync(phasePlanPath)) return null;
  try {
    const plan = JSON.parse(readFileSync(phasePlanPath, "utf8"));
    if (plan?.prompt !== prompt || !plan?.appSpec) return null;
    if (!plan.artifactType) plan.artifactType = "buildable-phase-plan";
    if (!plan.workflowStage) plan.workflowStage = "decision";
    if (!plan.commandRole) plan.commandRole = "plan";
    if (!plan.planContractVersion) plan.planContractVersion = "audit-first-v1";
    if (!plan.consumedBy) plan.consumedBy = ["buildable design", "buildable generate", "buildable review"];
    if (!Array.isArray(plan.appSpec.blocks)) {
      plan.appSpec.blocks = microBlocksFor({
        prompt: plan.prompt,
        target: plan.appSpec.target,
        archetype: plan.appSpec.archetype,
        designSystem: plan.appSpec.designSystem
      });
      for (const block of plan.appSpec.blocks) {
        for (const ref of block.references ?? []) {
          if (existsSync(join(root, ref)) && !plan.appSpec.references.includes(ref)) plan.appSpec.references.push(ref);
        }
      }
    }
    if (!plan.appSpec.planAudit) plan.appSpec.planAudit = planAuditFor(plan.appSpec);
    if (!plan.appSpec.promptRefinement) {
      plan.appSpec.promptRefinement = promptRefinementFor(plan.prompt, plan.classification, defaultsFor(plan.appSpec.archetype), plan.appSpec);
    }
    if (!plan.phasePlan) plan.phasePlan = phasePlanFor(plan);
    if (!plan.planMarkdown) plan.planMarkdown = planMarkdownFor(plan);
    return plan;
  } catch {
    return null;
  }
}

function augmentPlanFor(plan) {
  return `# Buildable Augment Plan

Prompt:

${plan.prompt}

This is an **augment** pack: apply ${plan.appSpec.name} to the EXISTING app in this
directory. Do not scaffold a new project or overwrite unrelated code.

## App Spec Summary

- name: ${plan.appSpec.name}
- target: ${plan.appSpec.target}
- archetype: ${plan.appSpec.archetype}
- data mode: ${plan.appSpec.dataMode}

## References To Load

${plan.appSpec.references.map((reference) => `- ${reference}`).join("\n")}

## Selected Micro-Blocks

${plan.appSpec.blocks.length ? plan.appSpec.blocks.map((block) => `- ${block.id}: ${block.reason}`).join("\n") : "- None"}

## Build Steps

1. Read \`buildable-app-spec.json\` and follow \`appSpec.referenceLoadingContract\`.
2. Inspect the existing project: framework, routing, components, and styling conventions.
3. Add the listed screens, entities, and features using the project's existing patterns and stack.
4. Reuse existing components and design tokens; match the current file structure.
5. Keep local/mock data by default. Do not introduce a new framework or restructure the app.
6. Run \`buildable review\` and fix blocking issues before handoff.

Do not add accounts, billing, cloud previews, managed databases, telemetry, or hosted deployment unless explicitly requested.
`;
}

function generate() {
  if (!input) {
    console.error('Missing prompt. Example: buildable generate "Build me a todo app"');
    process.exitCode = 1;
    return;
  }

  const referenceInputs = referenceInputsFromArgs();
  const authFlagsPresent = flags.has("--with-auth") || flags.has("--with-local-auth") || authProviderFlags.some(([flag]) => flags.has(flag)) || Boolean(parsedArgs.values?.["with-auth-provider"]);
  const canReuseSavedPlan = referenceInputs.length === 0 && !authFlagsPresent;
  const savedPlan = canReuseSavedPlan ? savedPhasePlanForPrompt(input) : null;
  const planSource = savedPlan ? "saved-phase-plan" : "inline-prompt-plan";
  const plan = savedPlan || specFor(input, { referenceInputs });
  if (plan.classification.questionsNeeded && !flags.has("--force")) {
    console.error("This prompt includes architecture-changing choices. Answer these before generation:");
    for (const question of plan.classification.questions) console.error(`- ${question}`);
    console.error("Use buildable plan to inspect the app spec, or rerun generate with --force if the prompt already provides the needed direction.");
    process.exitCode = 1;
    return;
  }
  // Smarter naming: a --name flag or "called/named X" in the prompt brands the app.
  const starterDefaultName = appNameFor(plan.appSpec.archetype);
  const appName = chosenAppName(input, plan.appSpec.name);
  plan.appSpec.name = appName;

  // Augment mode plans into an existing app instead of copying a fresh starter.
  const augment = flags.has("--augment");
  if (augment) plan.appSpec.generationMode = "plan-only";
  const outValue = parsedArgs.values.out ?? (augment ? "." : slugFor(plan.appSpec.name));
  const outDir = isAbsolute(outValue) ? outValue : join(process.cwd(), outValue);
  const templateSpec = readJson(plan.appSpec.template);
  const starter = templateSpec.starter ? join(root, templateSpec.starter) : null;
  const appSpecIssues = validateAppSpec(plan.appSpec);

  if (appSpecIssues.length > 0) {
    console.error(`Generated app spec is invalid: ${appSpecIssues.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const hasRunnableStarter = Boolean(starter && existsSync(starter)) && !augment;

  if (!augment && !Boolean(starter && existsSync(starter)) && !flags.has("--plan-pack")) {
    console.error(`Template ${plan.appSpec.template} is not runnable yet.`);
    console.error("Use buildable plan for JSON output, rerun generate with --plan-pack to write a local instruction pack, or use --augment to plan into an existing app.");
    process.exitCode = 1;
    return;
  }

  if (!augment && directoryHasFiles(outDir) && !flags.has("--force")) {
    console.error(`Output directory already exists and is not empty: ${outDir}`);
    console.error("Use --force to write Buildable files into it, or --augment to plan into an existing app without overwriting code.");
    process.exitCode = 1;
    return;
  }

  let renamedFiles = 0;
  if (hasRunnableStarter) {
    copyDirectory(starter, outDir);
    renamedFiles = renameAppInDir(outDir, starterDefaultName, appName);
  } else {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "IMPLEMENTATION_PLAN.md"), augment ? augmentPlanFor(plan) : implementationPlanFor(plan));
  }

  const mode = augment ? "generated-augment" : hasRunnableStarter ? "generated-starter" : "generated-instruction-pack";

  mkdirSync(join(outDir, ".buildable"), { recursive: true });
  writeJson(join(outDir, "buildable-app-spec.json"), plan.appSpec);
  writeJson(join(outDir, ".buildable", "phase-plan.json"), plan);
  writeFileSync(join(outDir, ".buildable", "phase-plan.toon"), planToonFor(plan));
  writeJson(join(outDir, ".buildable", "config.json"), {
    version: packageJson.version,
    artifactType: "buildable-generated-project",
    workflowStage: "generated-files",
    mode,
    appName,
    sourcePlan: planSource,
    sourcePlanPath: savedPlan ? ".buildable/phase-plan.json" : null,
    localOnly: true,
    buildableRoot: root,
    generatedAt: new Date().toISOString()
  });
  writeFileSync(
    join(outDir, "BUILDABLE_NOTES.md"),
    `# Buildable Generation Notes

Prompt:

${plan.prompt}

Template:

${plan.appSpec.template}

Next agent steps:

1. Read \`buildable-app-spec.json\`.
2. Reference loading contract: follow \`appSpec.referenceLoadingContract\`.
3. Load only \`appSpec.references\`.
4. Do not load all templates.
5. ${hasRunnableStarter ? "Load starter source only for this selected template." : "Use `IMPLEMENTATION_PLAN.md` as a plan-only instruction pack; no runnable starter exists yet."}
6. ${hasRunnableStarter ? "Adapt this local starter to the user's request." : "Implement the app in this directory or apply the plan to an existing local app."}
7. Run \`buildable review\` after app code exists.

Do not add accounts, billing, cloud previews, managed databases, telemetry, or hosted deployment unless explicitly requested.
`
  );

  const payload = {
    ok: true,
    outDir,
    template: plan.appSpec.template,
    templateStatus: plan.appSpec.templateStatus,
    generationMode: plan.appSpec.generationMode,
    mode,
    runnable: hasRunnableStarter,
    augment,
    sourcePlan: planSource,
    sourcePlanPath: savedPlan ? ".buildable/phase-plan.json" : null,
    appName,
    renamedFiles,
    appSpec: "buildable-app-spec.json"
  };

  const summary = augment
    ? `Wrote augment plan for "${appName}" into ${outDir}`
    : `Generated ${payload.runnable ? `local starter "${appName}"` : "plan-only instruction pack"} at ${outDir}`;
  console.log(jsonOutput ? JSON.stringify(payload, null, 2) : summary);
}

function findAppSpec(target) {
  const candidates = [
    join(target, "buildable-app-spec.json"),
    join(target, ".buildable", "app-spec.json")
  ];
  return candidates.find((path) => existsSync(path));
}

function scanTextFiles(target, maxFiles = Number.POSITIVE_INFINITY) {
  const results = [];
  const ignored = new Set(["node_modules", ".next", ".git", ".expo", "dist", "build", "coverage"]);
  const textFilePattern = /\.(md|json|ts|tsx|js|jsx|mjs|cjs|css|html)$/;

  function walk(current) {
    if (results.length >= maxFiles) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && textFilePattern.test(entry.name)) results.push(full);
      if (results.length >= maxFiles) return;
    }
  }

  walk(target);
  return results;
}

function isImplementationFile(target, file) {
  const relativePath = relative(target, file);
  if (relativePath.startsWith(".buildable/")) return false;
  if (["BUILDABLE_NOTES.md", "BUILDABLE_TEMPLATE.md", "IMPLEMENTATION_PLAN.md", "buildable-app-spec.json", "package.json"].includes(relativePath)) return false;
  if (/(^|\/)(next-env\.d\.ts|next\.config\.js|postcss\.config\.js|tailwind\.config\.ts|tsconfig\.json)$/.test(relativePath)) return false;
  return /\.(ts|tsx|js|jsx|mjs|cjs|css|html|md)$/.test(file);
}

function textHasToken(text, token) {
  return hasTagPhrase(text, token);
}

function textHasMeaningfulEntity(text, entity) {
  const fields = (entity.fields ?? []).filter((field) => !["id", "createdAt", "updatedAt"].includes(field));
  const terms = [entity.name, ...fields];
  return terms.some((term) => textHasToken(text, term));
}

function featureCoverage(text, features) {
  return features.filter((feature) => tokensFor(feature).every((token) => textHasToken(text, token)));
}

function addCheck(checks, issues, warnings, name, passed, message, severity = "issue") {
  checks.push({
    name,
    status: passed ? "pass" : severity === "warning" ? "warn" : "fail",
    message
  });

  if (!passed) {
    if (severity === "warning") warnings.push(message);
    else issues.push(message);
  }
}

function responsiveLayoutRisks(file, label) {
  // Flag grid definitions that pair a fixed (px/rem/em) track with a bare `fr`
  // unit. A bare `1fr` is `minmax(auto, 1fr)`, whose `auto` minimum lets wide
  // content (tables, long text) blow the column out and overlap siblings. Use
  // `minmax(0, 1fr)` instead. See knowledge/ui-patterns/responsive-layouts.md.
  if (!/\.(tsx|jsx|css|html)$/.test(file)) return [];
  const text = readFileSync(file, "utf8");
  const specs = [];
  for (const match of text.matchAll(/grid-cols-\[([^\]]+)\]/g)) specs.push(match[1].replace(/_/g, " "));
  for (const match of text.matchAll(/grid-template-columns:\s*([^;]+);/g)) specs.push(match[1]);

  const risks = [];
  for (const spec of specs) {
    if (/minmax\(\s*0/.test(spec)) continue;
    const tracks = spec.trim().split(/\s+/);
    const hasFixed = tracks.some((track) => /\d(?:px|rem|em)\b/.test(track));
    const hasBareFr = tracks.some((track) => /^\d+(?:\.\d+)?fr$/.test(track));
    if (hasFixed && hasBareFr) {
      risks.push(`Responsive-layout risk in ${label}: grid columns "${spec.trim()}" mix a fixed track with a bare fr unit. Use minmax(0,1fr) so wide content cannot overflow the column.`);
    }
  }
  return risks;
}

function runBuildChecks(target, checks, issues, warnings) {
  const pkgPath = join(target, "package.json");
  if (!existsSync(pkgPath)) {
    addCheck(checks, issues, warnings, "build", false, "Cannot run build checks: no package.json.", "warning");
    return;
  }

  const scripts = JSON.parse(readFileSync(pkgPath, "utf8")).scripts ?? {};
  if (!existsSync(join(target, "node_modules"))) {
    addCheck(checks, issues, warnings, "build", false, "Skipped build checks: dependencies not installed. Run npm install, then review --build.", "warning");
    return;
  }

  const runnable = ["typecheck", "build"].filter((scriptName) => scripts[scriptName]);
  if (runnable.length === 0) {
    addCheck(checks, issues, warnings, "build", false, "No typecheck or build script found to run.", "warning");
    return;
  }

  for (const scriptName of runnable) {
    const result = spawnSync("npm", ["run", scriptName], { cwd: target, encoding: "utf8", timeout: 10 * 60 * 1000 });
    const ok = result.status === 0;
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().split("\n").slice(-4).join(" ").slice(0, 400);
    addCheck(
      checks,
      issues,
      warnings,
      `build-${scriptName}`,
      ok,
      ok ? `npm run ${scriptName} passed.` : `npm run ${scriptName} failed: ${output || "see output"}`
    );
  }
}

// Advisory "what's left to productionize" — derived from the spec, never auto-applied.
// Buildable prototypes are local-first by design; this names what is intentionally mocked
// and points at the seam that makes each piece real, without violating the local-first stance.
function readinessFor(appSpec, implementationText) {
  if (!appSpec) return [];
  const items = [];
  const hasLocalStore = /localstorage|indexeddb|asyncstorage|sqlite/.test(implementationText);

  const namedBackend = appSpec.persistence?.userNamedBackend ?? null;
  if (namedBackend) {
    items.push({ area: "data", status: "named-backend", note: `Planned around "${namedBackend}" behind the repository seam. Wire the real adapter (keep a local rung for dev) to ship. See knowledge/data-layer/repository-pattern.md.` });
  } else if (appSpec.persistence?.requested || hasLocalStore) {
    items.push({ area: "data", status: "local", note: "Data persists locally (browser/file storage). For multi-device or shared data, climb to a user-owned remote behind the same seam. See knowledge/data-layer/persistence-ladder.md." });
  } else {
    items.push({ area: "data", status: "in-memory", note: "Data is in-memory mock and resets on refresh. To persist, follow the persistence ladder. See knowledge/data-layer/persistence-ladder.md." });
  }

  const namedProvider = appSpec.auth?.userNamedProvider ?? null;
  if (namedProvider) {
    items.push({ area: "auth", status: "named-provider", note: `Auth is planned around "${namedProvider}" behind the auth seam; wire the real adapter to go live. See knowledge/auth/auth-seam.md.` });
  } else if (appSpec.auth?.requested) {
    items.push({ area: "auth", status: "mock", note: "Auth is local/mock (demo users, session + protected-route shape). Name a provider and wire it behind the seam for real accounts. See knowledge/auth/auth-seam.md." });
  } else {
    items.push({ area: "auth", status: "none", note: "No authentication. If users need accounts, add it with `buildable plan --with-auth` (local/mock first, behind a seam)." });
  }

  items.push({ area: "deployment", status: "none", note: "No deploy/hosting configured — this is a local prototype. Add your own host or a static export when you are ready to ship." });

  return items;
}

function review() {
  const targetValue = parsedArgs.positionals[0] ?? ".";
  const target = isAbsolute(targetValue) ? targetValue : join(process.cwd(), targetValue);
  const issues = [];
  const warnings = [];

  if (!existsSync(target) || !statSync(target).isDirectory()) {
    console.error(`Review target is not a directory: ${target}`);
    process.exitCode = 1;
    return;
  }

  const appSpecPath = findAppSpec(target);
  const appSpec = appSpecPath ? JSON.parse(readFileSync(appSpecPath, "utf8")) : null;
  const checks = [];
  addCheck(
    checks,
    issues,
    warnings,
    "app-spec-present",
    Boolean(appSpec),
    appSpec ? "Buildable app spec found." : "No buildable app spec found. Expected buildable-app-spec.json or .buildable/app-spec.json."
  );

  const hasPackageJson = existsSync(join(target, "package.json"));
  addCheck(checks, issues, warnings, "package-json", hasPackageJson, hasPackageJson ? "package.json found." : "Missing package.json.");

  if (appSpec) {
    const appSpecIssues = validateAppSpec(appSpec);
    addCheck(
      checks,
      issues,
      warnings,
      "app-spec-schema",
      appSpecIssues.length === 0,
      appSpecIssues.length === 0 ? "App spec is valid." : `App spec validation failed: ${appSpecIssues.join("; ")}`
    );

    for (const reference of appSpec.references ?? []) {
      if (!existsSync(join(root, reference))) warnings.push(`App spec reference does not exist in Buildable repo: ${reference}.`);
    }
  }

  const expectedFiles = Array.isArray(appSpec?.expectedFiles) ? appSpec.expectedFiles : [];
  if (expectedFiles.length > 0) {
    const missingFiles = expectedFiles.filter((path) => !existsSync(join(target, path)));
    addCheck(
      checks,
      issues,
      warnings,
      "expected-files",
      missingFiles.length === 0,
      missingFiles.length === 0
        ? `All ${expectedFiles.length} expected ${appSpec.archetype} files are present.`
        : `Missing expected ${appSpec.archetype} files: ${missingFiles.join(", ")}.`
    );
  }

  const textFiles = scanTextFiles(target);
  const implementationFiles = textFiles.filter((file) => isImplementationFile(target, file));
  const implementationText = implementationFiles.map((file) => readFileSync(file, "utf8").toLowerCase()).join("\n");

  if (appSpec) {
    addCheck(
      checks,
      issues,
      warnings,
      "implementation-files",
      implementationFiles.length > 0,
      implementationFiles.length > 0 ? `${implementationFiles.length} implementation files found.` : "No implementation files found for the app spec."
    );

    const missingEntities = (appSpec.entities ?? []).filter((entity) => !textHasMeaningfulEntity(implementationText, entity));
    addCheck(
      checks,
      issues,
      warnings,
      "app-spec-entities",
      missingEntities.length === 0,
      missingEntities.length === 0
        ? "App spec entities are represented in source files."
        : `App spec entities not represented in source files: ${missingEntities.map((entity) => entity.name).join(", ")}.`
    );

    const coveredFeatures = featureCoverage(implementationText, appSpec.features ?? []);
    const minimumFeatures = Math.min(3, appSpec.features?.length ?? 0);
    addCheck(
      checks,
      issues,
      warnings,
      "app-spec-features",
      coveredFeatures.length >= minimumFeatures,
      coveredFeatures.length >= minimumFeatures
        ? `${coveredFeatures.length} app spec features are represented in source files.`
        : `Only ${coveredFeatures.length}/${appSpec.features?.length ?? 0} app spec features are represented in source files.`
    );
  }

  const allowedBackend = appSpec?.persistence?.userNamedBackend ?? null;
  const allowedAuthProvider = appSpec?.auth?.userNamedProvider ?? null;
  const authShapeAllowedTerms = new Set(["authentication", "login", "sign in", "sign up"]);
  for (const file of textFiles) {
    const relativePath = relative(target, file);
    if (
      relativePath.startsWith(".buildable/") ||
      relativePath === "BUILDABLE_NOTES.md" ||
      relativePath === "BUILDABLE_TEMPLATE.md" ||
      relativePath === "IMPLEMENTATION_PLAN.md" ||
      relativePath === "buildable-app-spec.json"
    ) {
      continue;
    }
    const text = readFileSync(file, "utf8").toLowerCase();
    for (const term of localFirstDriftTerms) {
      // The user can opt into one named backend; that vendor is allowed (behind the seam).
      if (allowedBackend && term === allowedBackend) continue;
      // Local/mock auth shape is allowed only when auth was requested; named providers are allowed only when recorded on the spec.
      if (appSpec?.auth?.requested && authShapeAllowedTerms.has(term)) continue;
      if (allowedAuthProvider && term === allowedAuthProvider) continue;
      if (allowedAuthProvider === "next-auth" && term === "next-auth") continue;
      if (allowedAuthProvider === "clerk" && term === "clerk") continue;
      if (allowedAuthProvider === "auth0" && term === "auth0") continue;
      if (allowedAuthProvider === "supabase auth" && term === "supabase") continue;
      if (allowedAuthProvider === "firebase auth" && (term === "firebase" || term === "firestore")) continue;
      // Whole-token match so "stripe" doesn't flag "striped", "login" doesn't flag "blogin", etc.
      if (hasTagPhrase(text, term)) {
        const seamHint = appSpec?.persistence?.requested
          ? " If this is the requested data layer, keep it behind the repository seam (knowledge/data-layer/repository-pattern.md)."
          : "";
        const message = `Non-local-first term "${term}" appears in ${relativePath}.${seamHint}`;
        // --strict turns local-first guardrail drift into a blocking failure.
        if (flags.has("--strict")) issues.push(message);
        else warnings.push(message);
      }
    }
  }

  const layoutRisks = implementationFiles.flatMap((file) => responsiveLayoutRisks(file, relative(target, file)));
  checks.push({
    name: "responsive-layout",
    status: layoutRisks.length === 0 ? "pass" : "warn",
    message:
      layoutRisks.length === 0
        ? "No grid columns at risk of overflowing their track."
        : `${layoutRisks.length} grid(s) pair a fixed track with a bare fr unit; use minmax(0,1fr). See knowledge/ui-patterns/responsive-layouts.md.`
  });
  for (const risk of layoutRisks) warnings.push(risk);

  const tokenRisks = implementationFiles.flatMap((file) => designTokenRisks(file, relative(target, file)));
  checks.push({
    name: "design-tokens",
    status: tokenRisks.length === 0 ? "pass" : "warn",
    message:
      tokenRisks.length === 0
        ? "Components drive color from theme tokens."
        : `${tokenRisks.length} file(s) hard-code colors instead of theme tokens. See core/design-system-registry.json foundations.tokenUsageContract.`
  });
  for (const risk of tokenRisks) warnings.push(risk);

  // When persistence was requested, nudge toward a repository seam rather than ad-hoc storage calls.
  if (appSpec?.persistence?.requested) {
    const hasSeam = /\brepositor(?:y|ies)\b|\badapter\b|createLocalRepository|createRemoteRepository|interface\s+\w*Repository/i.test(implementationText);
    const hasStorage = /localstorage|indexeddb|asyncstorage|sqlite/i.test(implementationText);
    checks.push({
      name: "persistence-seam",
      status: hasSeam || !hasStorage ? "pass" : "warn",
      message:
        hasSeam
          ? "Persistence is routed through a repository seam."
          : hasStorage
            ? "Storage calls found without a repository seam; wrap them so the storage rung stays swappable. See knowledge/data-layer/repository-pattern.md."
            : "Persistence requested; implement it behind the repository seam. See knowledge/data-layer/persistence-ladder.md."
    });
    if (hasStorage && !hasSeam) warnings.push("Storage calls are not behind a repository seam. See knowledge/data-layer/repository-pattern.md.");
  }

  if (appSpec?.auth?.requested) {
    const hasAuthSeam = /\bauth(?:service|adapter|provider|repository|client)\b|\bAuthService\b|\bAuthAdapter\b|\bAuthProvider\b|\bSessionRepository\b|interface\s+\w*Auth|createLocalAuth|createRemoteAuth/i.test(implementationText);
    const hasProviderCall = /\b(clerk|auth0|next-auth|nextauth|supabase|firebase)\b/i.test(implementationText);
    checks.push({
      name: "auth-seam",
      status: hasAuthSeam || !hasProviderCall ? "pass" : "warn",
      message:
        hasAuthSeam
          ? "Auth is routed through an auth seam."
          : hasProviderCall
            ? "Auth provider calls found without an auth seam; wrap them so the provider stays swappable. See knowledge/auth/auth-seam.md."
            : "Auth requested; model session state behind an auth seam. See knowledge/auth/auth-shape.md."
    });
    if (hasProviderCall && !hasAuthSeam) warnings.push("Auth provider calls are not behind an auth seam. See knowledge/auth/auth-seam.md.");
  }

  // Accessibility + state-coverage heuristics (graded, non-blocking warnings).
  const controlCount = (implementationText.match(/<input\b|<select\b|<textarea\b/g) ?? []).length;
  const labelSignals = (implementationText.match(/<label\b|aria-label=/g) ?? []).length;
  const unlabeled = Math.max(0, controlCount - labelSignals);
  checks.push({
    name: "accessible-forms",
    status: controlCount === 0 || unlabeled === 0 ? "pass" : "warn",
    message:
      controlCount === 0
        ? "No web form controls to label."
        : unlabeled === 0
          ? `All ${controlCount} form control(s) appear labeled.`
          : `${unlabeled} of ${controlCount} form control(s) may be missing a <label> or aria-label.`
  });
  if (unlabeled > 0) warnings.push(`${unlabeled} form control(s) may be missing a <label> or aria-label. See knowledge/ui-patterns/forms.md.`);

  const interactiveCount = controlCount + (implementationText.match(/<button\b/g) ?? []).length;
  const hasFocusStyle = /focus-visible|focus:/.test(implementationText);
  checks.push({
    name: "focus-styles",
    status: interactiveCount === 0 || hasFocusStyle ? "pass" : "warn",
    message:
      interactiveCount === 0
        ? "No interactive web controls."
        : hasFocusStyle
          ? "Visible focus styles present."
          : "No focus-visible styles found for interactive controls."
  });
  if (interactiveCount > 0 && !hasFocusStyle) warnings.push("No visible focus styles (focus-visible) found; keyboard users cannot see focus. See knowledge/quality-rubrics/web-app.md.");

  const expectsEmptyState =
    (appSpec?.features ?? []).some((feature) => /\bempty\b|filtered/i.test(feature)) ||
    (appSpec?.acceptanceCriteria ?? []).some((criterion) => /\bempty\b/i.test(criterion));
  const hasEmptyEvidence =
    /border-dashed/.test(implementationText) ||
    /clear filter/.test(implementationText) ||
    /no [a-z]+ (yet|match)/.test(implementationText) ||
    /empty[-\s]?state/.test(implementationText);
  if (appSpec && expectsEmptyState) {
    checks.push({
      name: "state-coverage",
      status: hasEmptyEvidence ? "pass" : "warn",
      message: hasEmptyEvidence
        ? "Empty / filtered-empty state present in source."
        : "Archetype expects an empty/filtered-empty state, but none was found in source."
    });
    if (!hasEmptyEvidence) warnings.push("Expected empty/filtered-empty state not found in source. See knowledge/ui-patterns/empty-states.md.");
  }

  if (flags.has("--build")) {
    runBuildChecks(target, checks, issues, warnings);
  }

  const readiness = readinessFor(appSpec, implementationText);

  const report = {
    ok: issues.length === 0,
    status: issues.length === 0 ? "pass" : "fail",
    target,
    appSpec: appSpecPath ? relative(target, appSpecPath) : null,
    summary: {
      checks: checks.length,
      passed: checks.filter((check) => check.status === "pass").length,
      warned: checks.filter((check) => check.status === "warn").length,
      failed: checks.filter((check) => check.status === "fail").length
    },
    checks,
    issues,
    warnings,
    readiness,
    checkedAt: new Date().toISOString()
  };

  mkdirSync(join(target, ".buildable"), { recursive: true });
  const reviewToon = [
    "buildable_review:",
    "  format: toon-style-v1",
    "  source_of_truth: .buildable/review-report.md",
    `  status: ${toonValue(report.status)}`,
    `  ok: ${toonValue(report.ok)}`,
    `  target: ${toonValue(relative(process.cwd(), target) || ".")}`,
    "  summary:",
    `    checks: ${toonValue(report.summary.checks)}`,
    `    passed: ${toonValue(report.summary.passed)}`,
    `    warned: ${toonValue(report.summary.warned)}`,
    `    failed: ${toonValue(report.summary.failed)}`,
    "  checks:",
    toonTable("items", ["name", "status", "message"], checks, "    "),
    "  issues:",
    toonList("items", issues, "    "),
    "  warnings:",
    toonList("items", warnings, "    "),
    "  readiness:",
    toonTable("items", ["area", "status", "note"], readiness, "    ")
  ].join("\n") + "\n";
  writeFileSync(
    join(target, ".buildable", "review-report.md"),
    `# Buildable Review Report

Status: ${report.ok ? "pass" : "fail"}

## Checks

${checks.length ? checks.map((check) => `- ${check.status}: ${check.name} - ${check.message}`).join("\n") : "- None"}

## Issues

${issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "- None"}

## Warnings

${warnings.length ? warnings.map((warning) => `- ${warning}`).join("\n") : "- None"}

## Readiness (advisory — what's left to productionize)

${readiness.length ? readiness.map((item) => `- ${item.area} (${item.status}): ${item.note}`).join("\n") : "- Not assessed (no app spec found)."}
`
  );
  writeFileSync(join(target, ".buildable", "review-report.toon"), reviewToon);
  report.toon = ".buildable/review-report.toon";

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Buildable review ${report.ok ? "passed" : "failed"} for ${target}`);
    console.log(`  issues: ${issues.length}`);
    console.log(`  warnings: ${warnings.length}`);
    if (readiness.length) {
      console.log("  readiness (advisory — what's left to productionize):");
      for (const item of readiness) console.log(`    - ${item.area}: ${item.note}`);
    }
    console.log("  report: .buildable/review-report.md");
  }

  if (!report.ok) process.exitCode = 1;
}

function writePreviewReport(target, report) {
  mkdirSync(join(target, ".buildable"), { recursive: true });
  writeFileSync(
    join(target, ".buildable", "preview-report.md"),
    `# Buildable Preview Report

Status: ${report.status}
URL: ${report.url}
${report.screenshot ? `Screenshot: ${report.screenshot}` : ""}

## Checks

${(report.checks ?? []).length ? report.checks.map((check) => `- ${check.status}: ${check.name} - ${check.message}`).join("\n") : "- None"}

${report.guidance ? `## Next\n\n${report.guidance}\n` : ""}`
  );
}

async function loadChromium(target) {
  const bases = [join(target, "package.json"), join(root, "package.json")];
  for (const base of bases) {
    for (const pkg of ["playwright", "playwright-core"]) {
      try {
        const resolved = createRequire(base).resolve(pkg);
        const mod = await import(pathToFileURL(resolved).href);
        // Playwright ships CommonJS, so the browser may be under default in ESM interop.
        const chromium = mod.chromium ?? mod.default?.chromium;
        if (chromium) return chromium;
      } catch {
        // not installed at this location; try the next
      }
    }
  }
  return null;
}

async function runPreview() {
  const targetValue = parsedArgs.positionals[0] ?? ".";
  const target = isAbsolute(targetValue) ? targetValue : join(process.cwd(), targetValue);
  const url = parsedArgs.values.url ?? "http://localhost:3000";

  // Headless browser is an optional capability; the core CLI stays dependency-free.
  // Prefer Playwright installed in the target app, then in Buildable itself.
  const chromium = await loadChromium(target);

  if (!chromium) {
    const report = {
      ok: true,
      status: "skipped",
      url,
      target,
      reason: "Playwright is not installed.",
      guidance:
        "Enable the visual preview loop with:\n\n    npm i -D playwright && npx playwright install chromium\n\nThen start the app (e.g. `npm run dev`) and rerun `buildable preview <path> --url <url>`. Agents with their own preview/screenshot tools can use those instead."
    };
    writePreviewReport(target, report);
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("Buildable preview skipped: Playwright is not installed.");
      console.log(report.guidance);
      console.log("  report: .buildable/preview-report.md");
    }
    return;
  }

  const checks = [];
  const consoleErrors = [];
  const pageErrors = [];
  let navOk = false;
  let title = "";
  let bodyLength = 0;
  let screenshot = null;
  let navError = "";

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      navOk = Boolean(response && response.ok());
      title = await page.title();
      bodyLength = await page.evaluate(() => (document.body ? document.body.innerText.trim().length : 0));
      mkdirSync(join(target, ".buildable"), { recursive: true });
      const shotPath = join(target, ".buildable", "preview.png");
      await page.screenshot({ path: shotPath, fullPage: true });
      screenshot = ".buildable/preview.png";
    } catch (error) {
      navError = error instanceof Error ? error.message : String(error);
    }
  } finally {
    await browser.close();
  }

  const blank = bodyLength < 20;
  const add = (name, passed, message) => checks.push({ name, status: passed ? "pass" : "fail", message });
  add("navigation", navOk, navOk ? `Loaded ${url} (title: ${title || "untitled"})` : `Could not load ${url}. ${navError}`.trim());
  add("not-blank", navOk && !blank, blank ? "Rendered page body is empty or nearly empty." : `Rendered ${bodyLength} characters of visible text.`);
  add("no-page-errors", pageErrors.length === 0, pageErrors.length === 0 ? "No uncaught runtime errors." : `Uncaught errors: ${pageErrors.slice(0, 3).join(" | ")}`);
  add("no-console-errors", consoleErrors.length === 0, consoleErrors.length === 0 ? "No console errors." : `Console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);

  const failed = checks.filter((check) => check.status === "fail");
  // Console errors are a warning, not a hard failure.
  const blocking = failed.filter((check) => check.name !== "no-console-errors");
  const report = {
    ok: blocking.length === 0,
    status: blocking.length === 0 ? "pass" : "fail",
    url,
    target,
    title,
    screenshot,
    checks,
    guidance: "Open the screenshot and confirm the first screen looks intentional: visible primary actions, real sample data, and non-generic empty states. Fix anything the screenshot reveals, then rerun."
  };

  writePreviewReport(target, report);

  if (jsonOutput) {
    const output = JSON.stringify(report, null, 2);
    if (report.ok) console.log(output);
    else console.error(output);
  } else {
    console.log(`Buildable preview ${report.status} for ${url}`);
    for (const check of checks) console.log(`  ${check.status}: ${check.name} - ${check.message}`);
    if (screenshot) console.log(`  screenshot: ${screenshot}`);
    console.log("  report: .buildable/preview-report.md");
  }

  if (!report.ok) process.exitCode = 1;
}

if (!command || command === "help" || command === "--help" || command === "-h") {
  usage();
} else if (command === "version" || command === "--version" || command === "-v") {
  console.log(packageJson.version);
} else if (command === "init") {
  init();
} else if (command === "status") {
  status();
} else if (command === "plan") {
  if (!input) {
    console.error('Missing prompt. Example: buildable plan "Build me a todo app"');
    process.exitCode = 1;
  } else {
    const plan = specFor(input, { referenceInputs: referenceInputsFromArgs() });
    if (!flags.has("--no-write")) plan.written = writePhasePlanFiles(plan);
    if (flags.has("--toon")) {
      // Compact TOON contract (~80% smaller than full JSON) for token-tight agent handoffs.
      process.stdout.write(planToonFor(plan));
    } else if (flags.has("--compact")) {
      console.log(JSON.stringify(compactPlan(plan), null, 2));
    } else {
      console.log(JSON.stringify(plan, null, 2));
    }
  }
} else if (command === "design") {
  design();
} else if (command === "generate") {
  generate();
} else if (command === "review") {
  review();
} else if (command === "preview") {
  runPreview();
} else if (command === "mcp") {
  const result = spawnSync(process.execPath, [join(root, "bin", "buildable-mcp.mjs")], { stdio: "inherit" });
  process.exitCode = result.status ?? 0;
} else if (command === "check") {
  check();
} else if (command === "list") {
  list();
} else if (command === "eval") {
  runEval();
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exitCode = 1;
}
