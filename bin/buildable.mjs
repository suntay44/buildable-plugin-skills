#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const command = process.argv[2];
const parsedArgs = parseArgs(process.argv.slice(3));
const input = parsedArgs.positionals.join(" ").trim();
const flags = parsedArgs.flags;
const jsonOutput = flags.has("--json");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const archetypeRegistry = JSON.parse(readFileSync(join(root, "core/archetype-registry.json"), "utf8"));
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

function usage() {
  console.log(`Buildable ${packageJson.version}

Local-first AI app builder brain for Codex Desktop, Claude Code, Cursor, and CLI workflows.

Usage:
  buildable plan "Build me a todo app"
  buildable generate "Build me a todo app"
  buildable generate "Build me a lightweight CRM" --name "LeadDesk"
  buildable init --existing
  buildable review
  buildable check
  buildable list
  buildable help

Commands:
  init [--existing]             Create .buildable config for a workspace.
  plan <prompt>                 Classify a prompt and print a local app spec as JSON.
  generate <prompt> [--out <dir>] Create a runnable starter, or use --plan-pack for planned templates.
                                  Defaults to a folder from the app name. Add --name "X" to brand it,
                                  or --augment to plan into an existing app.
  review [path] [--build] [--strict]
                                Audit the current app by default. --build also runs typecheck/build;
                                --strict fails (not just warns) on local-first guardrail drift.
  preview [path] --url <url>    Render the running app in a headless browser; screenshot + catch runtime errors.
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
  const valueFlags = new Set(["--out", "--mode", "--name", "--url"]);

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg.startsWith("--")) {
      const [name, inlineValue] = arg.split("=", 2);
      result.flags.add(name);

      if (inlineValue !== undefined) {
        result.values[name.slice(2)] = inlineValue;
      } else if (valueFlags.has(name) && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
        result.values[name.slice(2)] = rawArgs[index + 1];
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

  const questions = askFirstRules.filter((rule) => rule.pattern.test(normalized)).map((rule) => rule.question);

  return {
    target,
    explicitTarget,
    archetype: selected.id,
    complexity: "simple-prototype",
    questionsNeeded: questions.length > 0,
    questions,
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

function enhancedPromptFor(originalPrompt, appSpec) {
  const features = appSpec.features.join(", ");
  const screens = appSpec.screens.map((screen) => screen.id).join(", ");
  const guardrails = appSpec.mustNotInclude.join(", ");

  return [
    `User request: ${originalPrompt}`,
    "",
    `Build a local-first ${appSpec.target} ${appSpec.archetype} prototype named ${appSpec.name}.`,
    `Use the ${appSpec.stack.framework} stack from the selected Buildable template when applicable.`,
    `Expected screens: ${screens}.`,
    `Expected product behavior: ${features}.`,
    `Use ${appSpec.sampleData} sample data and follow a ${appSpec.style} product style.`,
    "Apply modern UI quality guidance: clear hierarchy, polished spacing, visible core actions, responsive behavior, accessible controls, and non-generic empty states.",
    `Reference loading contract: ${referenceLoadingContract.join(" ")}`,
    `Do not add: ${guardrails}.`,
    "For existing apps, adapt to the current project conventions and do not overwrite unrelated user code.",
    appSpec.questionsNeeded ? "Pause before generation and ask the user the listed architecture questions." : "Proceed without asking for visual taste preferences.",
    "After implementation, run Buildable review and fix blocking issues before final handoff."
  ].join("\n");
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function specFor(prompt) {
  const classification = classify(prompt);
  const template = templateFor(classification);
  const templatePath = join(root, template.path);
  const templateSpec = existsSync(templatePath)
    ? JSON.parse(readFileSync(templatePath, "utf8"))
    : { references: [] };
  // The classified target is authoritative; templateFor already returns a same-target template.
  const target = classification.target;
  const defaults = defaultsFor(classification.archetype);
  const archetypeReference = `knowledge/archetypes/${classification.archetype}.md`;
  const references = [...(templateSpec.references ?? [])];
  if (existsSync(join(root, archetypeReference)) && !references.includes(archetypeReference)) {
    references.unshift(archetypeReference);
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
      style: defaults.style,
      template: template.path,
      templateStatus: templateSpec.status ?? template.status,
      generationMode: templateSpec.status === "runnable" ? "runnable-starter" : "plan-only",
      expectedFiles: templateSpec.expectedFiles ?? [],
      references,
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

  return {
    prompt,
    classification,
    enhancedPrompt: enhancedPromptFor(prompt, appSpec),
    appSpec
  };
}

function validateAppSpec(spec) {
  const issues = [];
  const required = ["name", "target", "archetype", "complexity", "stack", "screens", "entities", "features", "sampleData", "style", "template", "templateStatus", "generationMode", "references", "referenceLoadingContract", "mustNotInclude", "acceptanceCriteria", "questionsNeeded", "questions"];

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
    "cli/README.md",
    "docs/install.md",
    "core/classifier.md",
    "core/archetype-registry.json",
    "core/reference-loading-contract.md",
    "core/ask-vs-build-policy.md",
    "core/app-spec-schema.md",
    "core/schemas/archetype-registry.schema.json",
    "core/schemas/app-spec.schema.json",
    "core/schemas/template-spec.schema.json",
    "knowledge/archetypes/task-manager.md",
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
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "commands/buildable-plan.md",
    "commands/buildable-generate.md",
    "commands/buildable-review.md",
    "commands/buildable-init.md",
    "commands/buildable-preview.md",
    "evals/fixtures.json"
  ];
  const missing = required.filter((path) => !existsSync(join(root, path)));
  const templateIssues = [];
  const registryIssues = validateArchetypeRegistry(archetypeRegistry);
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

  const plan = specFor(input);
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

function scanTextFiles(target, maxFiles = 80) {
  const results = [];
  const ignored = new Set(["node_modules", ".next", ".git", "dist", "build"]);

  function walk(current) {
    if (results.length >= maxFiles) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && /\.(md|json|ts|tsx|js|css)$/.test(entry.name)) results.push(full);
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
  return /\.(ts|tsx|js|jsx|css|html|md)$/.test(file);
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
    console.log(JSON.stringify(specFor(input), null, 2));
  }
} else if (command === "generate") {
  generate();
} else if (command === "review") {
  review();
} else if (command === "preview") {
  runPreview();
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
