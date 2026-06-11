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
  { pattern: /\b(auth|login|sign in|sign up|account|accounts|user management)\b/, question: "Do you want auth/accounts, or should this stay single-user and local-first for now?" },
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
  buildable plan "Build me a todo app" --write
  buildable plan "Use this screenshot for a CRM" --file ./crm-mockup.png --write
  buildable design "Build me a CRM website"
  buildable generate "Build me a todo app"
  buildable generate "Build me a lightweight CRM" --name "LeadDesk"
  buildable init --existing
  buildable review
  buildable mcp
  buildable check
  buildable list
  buildable help

Commands:
  init [--existing]             Create .buildable config for a workspace.
  plan <prompt> [--file <path>] [--write]
                                Classify a prompt and print a top-down local app spec as JSON.
                                --file/--reference/--screenshot records explicit user references;
                                --write also saves .buildable/phase-plan.md/json.
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
  const valueFlags = new Set(["--out", "--mode", "--name", "--url", "--page", "--target", "--spec", "--file", "--reference", "--screenshot"]);
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

  const architectureQuestions = askFirstRules.filter((rule) => rule.pattern.test(normalized)).map((rule) => rule.question);
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
    Conversation: ["title", "participants", "lastMessageAt", "unreadCount"],
    Course: ["title", "description", "progress", "status"],
    Event: ["title", "date", "location", "status"],
    Invoice: ["number", "clientName", "amount", "status", "dueDate"],
    Job: ["title", "company", "location", "status", "postedAt"],
    Lead: ["name", "company", "email", "stage", "value", "nextAction"],
    Lesson: ["title", "description", "duration", "order", "status"],
    Listing: ["title", "description", "category", "priceLabel", "location", "status"],
    MenuItem: ["name", "description", "price", "category", "available"],
    Message: ["conversationId", "sender", "body", "sentAt", "read"],
    Metric: ["label", "value", "delta", "trend"],
    Note: ["title", "body", "tags", "updatedAt"],
    Order: ["number", "customerName", "status", "total"],
    Place: ["name", "location", "notes", "category"],
    Product: ["name", "sku", "price", "stock", "status"],
    Project: ["title", "description", "status", "dueDate"],
    Question: ["label", "type", "required", "options"],
    Response: ["submittedAt", "answers", "status"],
    Section: ["title", "subtitle", "body", "ctaLabel", "order"],
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

function phasePlanFor(plan) {
  const promptArg = JSON.stringify(plan.prompt);
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
      command: `buildable plan ${promptArg}`,
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
        ? `buildable generate ${promptArg}`
        : `buildable generate ${promptArg} --plan-pack`,
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

function planMarkdownFor(plan) {
  const phases = plan.phasePlan ?? phasePlanFor(plan);
  return `# Buildable Phase Plan

Prompt:

${plan.prompt}

Recommended workflow: Plan > Design > Build > Review

## Direction

- app: ${plan.appSpec.name}
- target: ${plan.appSpec.target}
- archetype: ${plan.appSpec.archetype}
- stack: ${plan.appSpec.stack.framework}, ${plan.appSpec.stack.language}, ${plan.appSpec.stack.styling}
- template: ${plan.appSpec.template}
- template status: ${plan.appSpec.templateStatus}

## Clarifying Questions

${plan.appSpec.questions.length ? plan.appSpec.questions.map((question) => `- ${question}`).join("\n") : "- None"}

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

## User Reference Inputs

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
    `Mock data guidance: ${appSpec.mockData.recordsPerEntity} realistic local records per entity; include populated, empty, filtered-empty, loading/saving, and validation/error states.`,
    `Reference loading contract: ${referenceLoadingContract.join(" ")}`,
    referenceInputs,
    `Do not add: ${guardrails}.`,
    "For existing apps, adapt to the current project conventions and do not overwrite unrelated user code.",
    appSpec.questionsNeeded ? "Pause before design/generation and ask the user the listed product-direction or architecture questions." : "Proceed without asking for visual taste preferences.",
    "After implementation, run Buildable review and fix blocking issues before final handoff."
  ].filter(Boolean).join("\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
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
  const archetypeReference = `knowledge/archetypes/${classification.archetype}.md`;
  const designSelectionReference = "knowledge/design-playbooks/design-system-selection.md";
  const references = [...(templateSpec.references ?? [])];
  if (existsSync(join(root, archetypeReference)) && !references.includes(archetypeReference)) {
    references.unshift(archetypeReference);
  }
  if (existsSync(join(root, designSelectionReference)) && !references.includes(designSelectionReference)) {
    references.push(designSelectionReference);
  }

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
      template: template.path,
      templateStatus: templateSpec.status ?? template.status,
      generationMode: templateSpec.status === "runnable" ? "runnable-starter" : "plan-only",
      expectedFiles: templateSpec.expectedFiles ?? [],
      references,
      referenceInputs: options.referenceInputs ?? [],
      referenceLoadingContract,
      dataMode: templateSpec.stack?.data ?? "local-state",
      starter: templateSpec.starter,
      mustNotInclude: [
        "auth unless requested",
        "billing",
        "cloud previews",
        "managed databases",
        "hosted deployment",
        "telemetry"
      ],
      acceptanceCriteria: defaults.acceptanceCriteria,
      localOnly: true,
      questionsNeeded: classification.questionsNeeded,
      questions: classification.questions,
      nextStep: templateSpec.status === "runnable"
        ? "Load the listed references, then generate from the selected runnable starter."
        : "Load the listed references and use the selected template plan as an instruction pack; no runnable starter exists yet."
    };

  const plan = {
    prompt,
    classification,
    enhancedPrompt: enhancedPromptFor(prompt, appSpec),
    appSpec
  };
  plan.phasePlan = phasePlanFor(plan);
  plan.planMarkdown = planMarkdownFor(plan);
  return plan;
}

function validateAppSpec(spec) {
  const issues = [];
  const required = ["name", "target", "archetype", "complexity", "stack", "screens", "entities", "features", "sampleData", "mockData", "style", "designSystem", "template", "templateStatus", "generationMode", "references", "referenceInputs", "referenceLoadingContract", "mustNotInclude", "acceptanceCriteria", "questionsNeeded", "questions"];

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
    "knowledge/archetypes/task-manager.md",
    "knowledge/design-playbooks/design-system-selection.md",
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
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "commands/buildable-plan.md",
    "commands/buildable-design.md",
    "commands/buildable-generate.md",
    "commands/buildable-review.md",
    "commands/buildable-init.md",
    "commands/buildable-preview.md",
    "evals/fixtures.json"
  ];
  const missing = required.filter((path) => !existsSync(join(root, path)));
  const templateIssues = [];
  const registryIssues = validateArchetypeRegistry(archetypeRegistry);
  const designSystemIssues = validateDesignSystemRegistry(designSystemRegistry);
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
    for (const skill of plugin.skills ?? []) {
      const skillPath = relative(root, join(root, ".codex-plugin", skill.path));
      if (!existsSync(join(root, skillPath))) {
        pluginIssues.push(`missing skill ${skill.name}: ${skill.path}`);
      }
    }
    const resourceRoots = (plugin.resources ?? []).map((resource) => relative(root, join(root, ".codex-plugin", resource)));
    for (const resource of plugin.resources ?? []) {
      if (!existsSync(join(root, relative(root, join(root, ".codex-plugin", resource))))) {
        pluginIssues.push(`missing resource ${resource}`);
      }
    }
    // The manifest must expose every file a plan can reference (loading discipline is
    // enforced at runtime by appSpec.referenceLoadingContract, not by withholding files).
    const covered = (reference) => resourceRoots.some((res) => reference === res || reference.startsWith(`${res}/`));
    const planReferences = new Set();
    for (const template of templates) {
      for (const reference of readJson(template.path).references ?? []) planReferences.add(reference);
    }
    for (const entry of archetypeRegistry.archetypes) planReferences.add(`knowledge/archetypes/${entry.id}.md`);
    planReferences.add("knowledge/design-playbooks/design-system-selection.md");
    for (const reference of planReferences) {
      if (!covered(reference)) pluginIssues.push(`codex resources do not expose ${reference}`);
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
    templateIssues.length === 0 &&
    pluginIssues.length === 0 &&
    claudePluginIssues.length === 0;
  const payload = {
    ok,
    root,
    checked: {
      requiredFiles: required.length,
      archetypes: archetypeRegistry.archetypes.length,
      templateSpecs: templates.length,
      runnableTemplates: templateStatusCounts.runnable ?? 0,
      plannedTemplates: templateStatusCounts.planned ?? 0,
      codexPlugin: Boolean(plugin),
      claudePlugin: existsSync(join(root, ".claude-plugin/plugin.json"))
    },
    missing,
    registryIssues,
    designSystemIssues,
    templateIssues,
    pluginIssues,
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
    console.log(`  template specs: ${templates.length} (${templateStatusCounts.runnable ?? 0} runnable, ${templateStatusCounts.planned ?? 0} planned)`);
    console.log("  Codex plugin metadata: present");
    console.log(`  Claude plugin metadata: ${payload.checked.claudePlugin ? "present" : "absent"}`);
    console.log("  hosted services required: no");
  } else {
    console.error("Buildable local install check failed.");
    for (const path of missing) console.error(`  missing: ${path}`);
    for (const issue of registryIssues) console.error(`  registry: ${issue}`);
    for (const issue of templateIssues) console.error(`  template: ${issue}`);
    for (const issue of pluginIssues) console.error(`  plugin: ${issue}`);
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
  // The "discoverable brain" an agent could naively load: all knowledge docs plus
  // every template plan/spec. Buildable's contract loads only a slice of this.
  return directoryBytes("knowledge", [".md"]) + directoryBytes("templates", [".md", ".json"]);
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

function runEval() {
  const fixturesPath = join(root, "evals/fixtures.json");
  if (!existsSync(fixturesPath)) {
    console.error("Missing evals/fixtures.json");
    process.exitCode = 1;
    return;
  }

  const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8")).fixtures ?? [];
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
  const payload = {
    ok: passed === results.length,
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
    results
  };

  if (flags.has("--compare")) {
    const keys = ["references", "features", "entityFields", "acceptanceCriteria", "screens"];
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

    if (payload.comparison) {
      const { buildable } = payload.comparison.perPromptAverage;
      console.log("");
      console.log("Guided vs raw prompt (per prompt, on average):");
      console.log(`  Buildable: ${buildable.features} features · ${buildable.entityFields} typed entity fields · ${buildable.references} curated references · ${buildable.acceptanceCriteria} acceptance criteria`);
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

## Build Steps

1. Read \`buildable-app-spec.json\`.
2. Follow \`appSpec.referenceLoadingContract\`.
3. Load only the references listed above.
4. Build a local ${plan.appSpec.target} prototype that implements the listed screens, entities, features, and acceptance criteria.
5. Use local/mock data by default.
6. Run \`buildable review\` and fix blocking issues before handoff.

Do not add accounts, billing, cloud previews, managed databases, telemetry, or hosted deployment unless explicitly requested.
`;
}

const designTokenPresets = {
  "focused-productivity": {
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
  const wantsDark = /\bdark\b|\bdark mode\b/i.test(prompt) && preset.darkColors;
  return {
    colors: wantsDark ? preset.darkColors : preset.colors,
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
  const colorLines = Object.entries(brief.designTokens.colors).map(([key, value]) => `- ${key}: ${value}`).join("\n");
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

${colorLines}

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
    recommendedWorkflow: "Plan > Design > Build > Review",
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
    satisfactionQuestion: `Are you satisfied with this UI/UX direction and mockup-data plan? If yes, I can move to the build phase with \`${`buildable generate ${JSON.stringify(prompt)}`}\`.`
  };
}

function findNearestAppSpec(workspace) {
  const direct = findAppSpec(workspace);
  if (direct) return direct;
  return null;
}

function design() {
  const targetValue = parsedArgs.values.target ?? ".";
  const target = isAbsolute(targetValue) ? targetValue : join(process.cwd(), targetValue);
  const specValue = parsedArgs.values.spec;
  const specPath = specValue
    ? (isAbsolute(specValue) ? specValue : join(process.cwd(), specValue))
    : findNearestAppSpec(target);
  const appSpec = specPath && existsSync(specPath) ? JSON.parse(readFileSync(specPath, "utf8")) : null;
  const prompt = input || (appSpec ? `Design ${appSpec.name}` : "");

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
    brief.written = {
      json: ".buildable/design-brief.json",
      markdown: ".buildable/design-brief.md"
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
  return {
    json: ".buildable/phase-plan.json",
    markdown: ".buildable/phase-plan.md"
  };
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

  const plan = specFor(input, { referenceInputs: referenceInputsFromArgs() });
  if (plan.classification.questionsNeeded && !flags.has("--force")) {
    console.error("This prompt includes architecture-changing choices. Answer these before generation:");
    for (const question of plan.classification.questions) console.error(`- ${question}`);
    console.error("Use buildable plan to inspect the app spec, or rerun generate with --force if the prompt already provides the needed direction.");
    process.exitCode = 1;
    return;
  }
  // Smarter naming: a --name flag or "called/named X" in the prompt brands the app.
  const defaultName = plan.appSpec.name;
  const appName = chosenAppName(input, defaultName);
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
    renamedFiles = renameAppInDir(outDir, defaultName, appName);
  } else {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "IMPLEMENTATION_PLAN.md"), augment ? augmentPlanFor(plan) : implementationPlanFor(plan));
  }

  const mode = augment ? "generated-augment" : hasRunnableStarter ? "generated-starter" : "generated-instruction-pack";

  mkdirSync(join(outDir, ".buildable"), { recursive: true });
  writeJson(join(outDir, "buildable-app-spec.json"), plan.appSpec);
  writeJson(join(outDir, ".buildable", "config.json"), {
    version: packageJson.version,
    mode,
    appName,
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

  for (const file of textFiles) {
    if (
      file.endsWith("BUILDABLE_NOTES.md") ||
      file.endsWith("BUILDABLE_TEMPLATE.md") ||
      file.endsWith("IMPLEMENTATION_PLAN.md") ||
      file.endsWith("buildable-app-spec.json")
    ) {
      continue;
    }
    const text = readFileSync(file, "utf8").toLowerCase();
    for (const term of localFirstDriftTerms) {
      // Whole-token match so "stripe" doesn't flag "striped", "login" doesn't flag "blogin", etc.
      if (hasTagPhrase(text, term)) {
        const message = `Non-local-first term "${term}" appears in ${relative(target, file)}.`;
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
    checkedAt: new Date().toISOString()
  };

  mkdirSync(join(target, ".buildable"), { recursive: true });
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
`
  );

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Buildable review ${report.ok ? "passed" : "failed"} for ${target}`);
    console.log(`  issues: ${issues.length}`);
    console.log(`  warnings: ${warnings.length}`);
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
} else if (command === "plan") {
  if (!input) {
    console.error('Missing prompt. Example: buildable plan "Build me a todo app"');
    process.exitCode = 1;
  } else {
    const plan = specFor(input, { referenceInputs: referenceInputsFromArgs() });
    if (flags.has("--write")) plan.written = writePhasePlanFiles(plan);
    console.log(JSON.stringify(plan, null, 2));
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
