import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const cli = join(root, "bin/buildable.mjs");
const mcp = join(root, "bin/buildable-mcp.mjs");

function run(args, options = {}) {
  const commandArgs = [...args];
  if (commandArgs[0] === "plan" && !options.cwd && !commandArgs.includes("--write") && !commandArgs.includes("--no-write")) {
    commandArgs.push("--no-write");
  }
  return spawnSync(process.execPath, [cli, ...commandArgs], {
    cwd: options.cwd ?? root,
    encoding: "utf8"
  });
}

function jsonFrom(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("plan emits documented app spec fields", () => {
  const result = run(["plan", "Build me a todo app"]);
  const payload = jsonFrom(result);
  const spec = payload.appSpec;

  assert.equal(payload.artifactType, "buildable-phase-plan");
  assert.equal(payload.workflowStage, "decision");
  assert.equal(payload.commandRole, "plan");
  assert.equal(payload.planContractVersion, "audit-first-v1");
  assert.ok(payload.consumedBy.includes("buildable generate"));
  assert.equal(typeof payload.enhancedPrompt, "string");
  assert.match(payload.enhancedPrompt, /local-first web task-manager prototype/);
  assert.match(payload.enhancedPrompt, /Do not add/);
  assert.match(payload.enhancedPrompt, /Design system: Focused productivity/);
  assert.match(payload.enhancedPrompt, /UI\/UX rules:/);
  assert.match(payload.enhancedPrompt, /do not load all templates/i);
  assert.match(payload.enhancedPrompt, /load only appSpec\.references/i);

  for (const field of [
    "name",
    "target",
    "archetype",
    "complexity",
    "stack",
    "screens",
    "entities",
    "features",
    "sampleData",
    "mockData",
    "style",
    "designSystem",
    "blocks",
    "template",
    "templateStatus",
    "generationMode",
    "references",
    "referenceInputs",
    "referenceLoadingContract",
    "mustNotInclude",
    "acceptanceCriteria",
    "questionsNeeded",
    "questions",
    "planAudit",
    "promptRefinement",
    "localOnly"
  ]) {
    assert.ok(field in spec, `missing ${field}`);
  }

  assert.equal(spec.target, "web");
  assert.equal(spec.archetype, "task-manager");
  assert.equal(spec.templateStatus, "runnable");
  assert.equal(spec.generationMode, "runnable-starter");
  assert.equal(spec.localOnly, true);
  assert.equal(spec.questionsNeeded, false);
  assert.deepEqual(spec.questions, []);
  assert.equal(spec.mockData.strategy, "realistic-local-seed-data");
  assert.ok(spec.mockData.rules.some((rule) => rule.includes("domain-specific")));
  assert.ok(spec.mockData.entities.some((entity) => entity.name === "Task" && entity.minimumRecords >= 6));
  assert.equal(spec.designSystem.profile, "focused-productivity");
  assert.equal(spec.designSystem.styleName, "Focused productivity");
  assert.equal(spec.designSystem.palette.primary, "slate");
  assert.equal(spec.designSystem.visualTone, "calm, direct, repeat-use product UI");
  assert.ok(spec.designSystem.typography.mood);
  assert.ok(spec.designSystem.layoutRules.some((rule) => rule.includes("core workflow")));
  assert.ok(spec.designSystem.componentRules.some((rule) => rule.includes("status chips")));
  assert.ok(spec.designSystem.accessibility.includes("focus-visible states"));
  assert.ok(Array.isArray(spec.blocks));
  assert.ok(spec.blocks.some((block) => block.id === "web/entity-form"));
  assert.ok(spec.blocks.some((block) => block.id === "web/empty-state"));
  assert.ok(spec.references.includes("knowledge/design-playbooks/ui-quality.md"));
  assert.ok(spec.references.includes("knowledge/design-playbooks/design-system-selection.md"));
  assert.deepEqual(spec.referenceInputs, []);
  assert.deepEqual(spec.referenceLoadingContract, [
    "Do not load all templates.",
    "Run buildable plan.",
    "Load only appSpec.references.",
    "Load starter source only for the selected template."
  ]);
  assert.ok(Array.isArray(payload.phasePlan));
  assert.ok(payload.phasePlan.some((phase) => phase.id === "design"));
  assert.ok(payload.phasePlan.some((phase) => phase.id === "mock-data"));
  assert.equal(spec.planAudit.mode, "audit-first");
  assert.ok(spec.planAudit.checks.some((check) => check.id === "references"));
  assert.ok(spec.planAudit.checks.some((check) => check.id === "review"));
  assert.equal(spec.promptRefinement.mode, "optional");
  assert.ok(spec.promptRefinement.optionalQuestions.length >= 2);
  assert.ok(spec.promptRefinement.optionalQuestions.some((entry) => entry.id === "task_intelligence"));
  assert.match(payload.enhancedPrompt, /Optional refinement questions/);
  assert.match(payload.enhancedPrompt, /Selected micro-blocks/);
  assert.match(payload.planMarkdown, /# Buildable Phase Plan/);
  assert.match(payload.planMarkdown, /Audit-First Build Contract/);
  assert.match(payload.planMarkdown, /Selected Micro-Blocks/);
  assert.match(payload.planMarkdown, /Mock Data Guidance/);
  assert.match(payload.planMarkdown, /Optional Refinement Questions/);
});

test("plan selects compatible micro-blocks without loading unrelated blocks", () => {
  const crm = jsonFrom(run(["plan", "Create a CRM website for tracking leads"]));

  assert.equal(crm.appSpec.archetype, "crm");
  assert.equal(crm.appSpec.target, "web");
  assert.equal(crm.appSpec.template, "templates/web/crm/template-spec.json");
  const blockIds = crm.appSpec.blocks.map((block) => block.id);
  assert.ok(blockIds.includes("web/filterable-table"));
  assert.ok(blockIds.includes("web/detail-panel"));
  assert.ok(blockIds.includes("web/stat-card-grid"));
  assert.ok(blockIds.includes("web/entity-form"));
  assert.ok(blockIds.includes("web/empty-state"));
  assert.ok(!blockIds.some((id) => id.startsWith("mobile/")));
  assert.ok(crm.appSpec.references.includes("blocks/web/filterable-table/BLOCK.md"));
  assert.ok(crm.appSpec.references.includes("blocks/web/detail-panel/BLOCK.md"));
  assert.ok(!crm.appSpec.references.includes("blocks/mobile/list-with-filters/BLOCK.md"));
  for (const block of crm.appSpec.blocks) {
    for (const reference of block.references) {
      assert.ok(crm.appSpec.references.includes(reference), `${reference} is loaded through appSpec.references`);
    }
  }

  const mobile = jsonFrom(run(["plan", "Build me a mobile task manager"]));
  const mobileBlocks = mobile.appSpec.blocks.map((block) => block.id);
  assert.ok(mobileBlocks.includes("mobile/list-with-filters"));
  assert.ok(mobileBlocks.includes("mobile/bottom-action-bar"));
  assert.ok(mobileBlocks.includes("mobile/empty-state"));
  assert.ok(!mobileBlocks.some((id) => id.startsWith("web/")));
});

test("plan preserves explicit user reference files without reading everything", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-reference-inputs-"));
  const screenshot = join(workspace, "crm-mockup.png");
  const requirements = join(workspace, "requirements.md");
  writeFileSync(screenshot, "not a real png but enough for metadata\n");
  writeFileSync(requirements, "# Requirements\nUse a dense leads table.\n");

  const payload = jsonFrom(run([
    "plan",
    "Build a CRM from these references",
    "--screenshot",
    screenshot,
    "--file",
    requirements,
  ], { cwd: workspace }));

  assert.equal(payload.appSpec.referenceInputs.length, 2);
  const screenshotInput = payload.appSpec.referenceInputs.find((input) => input.path === screenshot);
  const requirementsInput = payload.appSpec.referenceInputs.find((input) => input.path === requirements);
  assert.equal(screenshotInput.kind, "screenshot");
  assert.equal(screenshotInput.exists, true);
  assert.match(screenshotInput.inspectInstruction, /Inspect visually/);
  assert.equal(requirementsInput.kind, "document");
  assert.match(payload.enhancedPrompt, /User reference inputs:/);
  assert.match(payload.planMarkdown, /User Reference Inputs/);
  assert.ok(!payload.appSpec.promptRefinement.optionalQuestions.some((entry) => entry.id === "references"));
  assert.match(readFileSync(join(workspace, ".buildable/phase-plan.md"), "utf8"), /crm-mockup\.png/);
});

test("plan routes UI/UX design systems by archetype and target", () => {
  const crm = jsonFrom(run(["plan", "Build me a CRM dashboard"]));
  assert.equal(crm.appSpec.designSystem.profile, "operator-dashboard");
  assert.equal(crm.appSpec.designSystem.density, "dense");
  assert.ok(crm.appSpec.designSystem.layoutRules.some((rule) => rule.includes("sortable lists")));

  const mobile = jsonFrom(run(["plan", "Build me a mobile habit tracker"]));
  assert.equal(mobile.appSpec.target, "mobile");
  assert.equal(mobile.appSpec.designSystem.profile, "mobile-utility");
  assert.equal(mobile.appSpec.designSystem.density, "thumb-friendly");
  assert.ok(mobile.appSpec.designSystem.componentRules.some((rule) => rule.includes("44px")));
});

test("design emits an interchangeable UI/UX brief from a prompt", () => {
  const payload = jsonFrom(run(["design", "CRM website with dark mode", "--json"]));

  assert.equal(payload.recommendedWorkflow, "Plan > Design > Generate > Review");
  assert.equal(payload.scope, "ui-ux-only");
  assert.match(payload.boundary, /front-end UI\/UX direction only/);
  assert.ok(payload.nonGoals.includes("no backend implementation"));
  assert.ok(payload.nonGoals.includes("no database or persistence decision"));
  assert.equal(payload.nextSuggestedCommand, 'buildable generate "CRM website with dark mode"');
  assert.match(payload.satisfactionQuestion, /Are you satisfied with this UI\/UX direction/);
  assert.equal(payload.mockDataGuidance.strategy, "realistic-local-seed-data");
  assert.ok(payload.mockDataGuidance.entities.some((entity) => entity.name === "Lead"));
  assert.equal(payload.app.archetype, "crm");
  assert.equal(payload.app.target, "web");
  assert.equal(payload.designSystem.profile, "operator-dashboard");
  assert.equal(payload.designTokens.colors.background, "#020617");
  assert.ok(payload.uiRules.some((rule) => rule.includes("tables")));
  assert.ok(payload.references.includes("knowledge/design-playbooks/design-system-selection.md"));
  assert.match(payload.handoffPrompt, /Design the LeadDesk crm app/);
  assert.match(payload.handoffPrompt, /UI\/UX-only design brief/);
  assert.match(payload.handoffPrompt, /do not create backend services/i);
  assert.match(payload.handoffPrompt, /primary #818CF8/);
});

test("plan asks product-direction questions for vague business prompts", () => {
  const restaurant = jsonFrom(run(["plan", "I have a restaurant"]));

  assert.equal(restaurant.classification.archetype, "restaurant");
  assert.equal(restaurant.classification.clarificationNeeded, true);
  assert.equal(restaurant.appSpec.questionsNeeded, true);
  assert.equal(restaurant.appSpec.promptRefinement.mode, "blocking-first");
  assert.ok(restaurant.appSpec.questions.some((question) => question.includes("informational website")));
  assert.equal(restaurant.phasePlan.find((phase) => phase.id === "clarify")?.status, "required");
  assert.equal(restaurant.phasePlan.find((phase) => phase.id === "mock-data")?.status, "blocked-until-clarified");
  assert.equal(restaurant.phasePlan.find((phase) => phase.id === "design")?.status, "blocked-until-clarified");
  assert.match(restaurant.enhancedPrompt, /Pause before design\/generation/);

  const clearRestaurant = jsonFrom(run(["plan", "Build a restaurant menu website"]));
  assert.equal(clearRestaurant.classification.archetype, "restaurant");
  assert.equal(clearRestaurant.classification.clarificationNeeded, false);
});

test("plan writes a markdown phase plan by default", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-plan-write-"));
  const payload = jsonFrom(run(["plan", "Build me a CRM website"], { cwd: workspace }));

  assert.equal(payload.written.markdown, ".buildable/phase-plan.md");
  assert.equal(payload.written.toon, ".buildable/phase-plan.toon");
  assert.ok(existsSync(join(workspace, ".buildable/phase-plan.md")));
  assert.ok(existsSync(join(workspace, ".buildable/phase-plan.json")));
  assert.ok(existsSync(join(workspace, ".buildable/phase-plan.toon")));
  assert.match(readFileSync(join(workspace, ".buildable/phase-plan.md"), "utf8"), /Plan > Design > Generate > Review/);
  const toon = readFileSync(join(workspace, ".buildable/phase-plan.toon"), "utf8");
  assert.match(toon, /buildable_plan:/);
  assert.match(toon, /checks\[\d+\]\{id,status,gate\}:/);
  assert.match(toon, /selected\[\d+\]\{id,role,reason\}:/);
  assert.match(toon, /references\[\d+\]:/);
});

test("plan --compact and --toon shrink the agent-facing output", () => {
  const full = run(["plan", "Build me a CRM", "--no-write"]).stdout;
  const compact = run(["plan", "Build me a CRM", "--no-write", "--compact"]).stdout;
  const toon = run(["plan", "Build me a CRM", "--no-write", "--toon"]).stdout;

  // Default still carries the human planMarkdown render (back-compat).
  assert.match(full, /"planMarkdown": "# Buildable Phase Plan/);

  // Compact drops the planMarkdown render but keeps the structured spec + a file pointer.
  const compactJson = JSON.parse(compact);
  assert.equal(compactJson.planMarkdown, undefined);
  assert.equal(compactJson.planMarkdownFile, ".buildable/phase-plan.md");
  assert.equal(compactJson.appSpec.archetype, "crm");
  assert.ok(compact.length < full.length);

  // TOON is the compact contract, not JSON, and is dramatically smaller.
  assert.match(toon, /^buildable_plan:/);
  assert.match(toon, /format: toon-style-v1/);
  assert.ok(toon.length < full.length / 3);
});

test("mcp buildable_plan returns compact by default, full with verbose, toon on request", () => {
  const call = (args) => {
    const input =
      [
        JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } } }),
        JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
        JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "buildable_plan", arguments: { prompt: "Build me a CRM", noWrite: true, ...args } } })
      ].join("\n") + "\n";
    const res = spawnSync(process.execPath, [mcp], { cwd: root, encoding: "utf8", input });
    const msg = res.stdout.trim().split("\n").map((line) => JSON.parse(line)).find((m) => m.id === 2);
    return msg.result.content[0].text;
  };

  const def = call({});
  const verbose = call({ verbose: true });
  const toon = call({ toon: true });

  assert.ok(!/planMarkdown":\s*"#/.test(def), "default MCP plan drops the planMarkdown render");
  assert.ok(/planMarkdown":\s*"#/.test(verbose), "verbose MCP plan keeps the full render");
  assert.ok(/buildable_plan:/.test(toon) && toon.length < def.length / 2, "toon is the smallest");
  assert.ok(def.length < verbose.length, "compact default is smaller than verbose");
});

test("plan --no-write only prints JSON", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-plan-no-write-"));
  const payload = jsonFrom(run(["plan", "Build me a CRM website", "--no-write"], { cwd: workspace }));

  assert.equal(payload.written, undefined);
  assert.ok(!existsSync(join(workspace, ".buildable/phase-plan.md")));
  assert.ok(!existsSync(join(workspace, ".buildable/phase-plan.json")));
  assert.ok(!existsSync(join(workspace, ".buildable/phase-plan.toon")));
});

test("design can run mid-session from an existing app spec and write a brief", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-design-"));
  const out = join(workspace, "taskflow");

  jsonFrom(run(["generate", "Build me a task manager", "--out", out, "--json"], { cwd: workspace }));
  const payload = jsonFrom(run(["design", "design this login page too", "--page", "login", "--write", "--json"], { cwd: out }));

  assert.equal(payload.source, "app-spec");
  assert.equal(payload.app.archetype, "task-manager");
  assert.equal(payload.focus, "login");
  assert.equal(payload.written.json, ".buildable/design-brief.json");
  assert.ok(existsSync(join(out, ".buildable/design-brief.json")));
  assert.ok(existsSync(join(out, ".buildable/design-brief.md")));
  assert.match(readFileSync(join(out, ".buildable/design-brief.md"), "utf8"), /focus: login/);
});

test("design can continue from the saved phase plan", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-plan-design-"));

  jsonFrom(run(["plan", "Build me a CRM with login"], { cwd: workspace }));
  const payload = jsonFrom(run(["design", "--json"], { cwd: workspace }));

  assert.equal(payload.source, "app-spec");
  assert.equal(payload.prompt, "Build me a CRM with login");
  assert.equal(payload.app.archetype, "crm");
  assert.equal(payload.app.target, "web");
  assert.ok(payload.referenceInputs.length === 0);
  assert.equal(payload.focus, "login");
  assert.match(payload.handoffPrompt, /login surface/);
});

test("plan asks questions for architecture-changing prompts", () => {
  const result = run(["plan", "Build me a todo app with auth and Stripe payments"]);
  const payload = jsonFrom(result);

  assert.equal(payload.classification.questionsNeeded, true);
  assert.equal(payload.appSpec.questionsNeeded, true);
  assert.ok(payload.appSpec.questions.some((question) => question.includes("payments")));
  assert.equal(payload.appSpec.auth?.requested, true);
  assert.equal(payload.appSpec.auth.userNamedProvider, null);
  assert.ok(payload.appSpec.references.includes("knowledge/auth/auth-shape.md"));
  assert.ok(payload.appSpec.references.includes("knowledge/auth/auth-seam.md"));
  assert.match(payload.enhancedPrompt, /Auth requested/);
  assert.match(payload.enhancedPrompt, /Pause before design\/generation/);
});

test("subscription tracker does not ask billing unless payments are explicit", () => {
  const tracker = jsonFrom(run(["plan", "Build a subscription tracker for renewal dates and monthly costs"]));
  assert.equal(tracker.appSpec.archetype, "subscription-tracker");
  assert.equal(tracker.appSpec.questionsNeeded, false);
  assert.deepEqual(tracker.appSpec.questions, []);
  assert.deepEqual(
    tracker.appSpec.entities.find((entity) => entity.name === "Subscription")?.fields,
    ["id", "service", "cost", "billingPeriod", "renewalDate", "status", "category", "createdAt", "updatedAt"]
  );

  const billing = jsonFrom(run(["plan", "Build a subscription tracker with Stripe checkout"]));
  assert.equal(billing.appSpec.archetype, "subscription-tracker");
  assert.equal(billing.appSpec.questionsNeeded, true);
  assert.ok(billing.appSpec.questions.some((question) => question.includes("payments")));
});

test("tag classifier uses phrase boundaries instead of substring matches", () => {
  const result = run(["plan", "Build a platform for creator onboarding"]);
  const payload = jsonFrom(result);

  assert.equal(payload.appSpec.archetype, "onboarding-checklist");
  assert.notEqual(payload.appSpec.archetype, "survey-form");
});

test("tag classifier handles confusing overlap prompts without broad scans", () => {
  const restaurantDashboard = jsonFrom(run(["plan", "Build a restaurant staff scheduling dashboard"]));
  assert.equal(restaurantDashboard.appSpec.target, "web");
  assert.equal(restaurantDashboard.appSpec.archetype, "dashboard");
  assert.equal(restaurantDashboard.appSpec.questionsNeeded, false);
  assert.ok(restaurantDashboard.appSpec.references.includes("knowledge/archetypes/dashboard.md"));
  assert.ok(!restaurantDashboard.appSpec.references.includes("knowledge/archetypes/restaurant.md"));

  const realEstateCrm = jsonFrom(run(["plan", "Build a real estate CRM for agents"]));
  assert.equal(realEstateCrm.appSpec.archetype, "real-estate");
  assert.notEqual(realEstateCrm.appSpec.archetype, "crm");
  assert.ok(realEstateCrm.appSpec.references.includes("knowledge/archetypes/real-estate.md"));

  const productFeedback = jsonFrom(run(["plan", "Build a product feedback board"]));
  assert.equal(productFeedback.appSpec.archetype, "product-feedback");
  assert.notEqual(productFeedback.appSpec.archetype, "survey-form");

  const mobileExpense = jsonFrom(run(["plan", "Build a mobile expense tracker for receipts"]));
  assert.equal(mobileExpense.appSpec.target, "mobile");
  assert.equal(mobileExpense.appSpec.archetype, "expense-tracker");
  assert.equal(mobileExpense.appSpec.template, "templates/mobile/expense-tracker/template-spec.json");
});

test("generate pauses when architecture questions are required", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-approval-"));
  const result = run(["generate", "Build me a todo app with Stripe payments", "--out", join(workspace, "payments-app")], { cwd: workspace });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /architecture-changing choices/);
  assert.match(result.stderr, /payments/);
});

test("mobile task manager selects mobile Expo template", () => {
  const result = run(["plan", "Build me a mobile task manager"]);
  const payload = jsonFrom(result);

  assert.equal(payload.appSpec.target, "mobile");
  assert.equal(payload.appSpec.stack.framework, "Expo");
  assert.equal(payload.appSpec.template, "templates/mobile/task-manager/template-spec.json");
});

test("tag registry routes web archetypes to selected knowledge and generic template", () => {
  const result = run(["plan", "Build a local business directory website"]);
  const payload = jsonFrom(result);

  assert.equal(payload.appSpec.target, "web");
  assert.equal(payload.appSpec.archetype, "directory-site");
  assert.equal(payload.appSpec.template, "templates/web/generic-app/template-spec.json");
  assert.ok(payload.appSpec.references.includes("knowledge/archetypes/directory-site.md"));
  assert.ok(!payload.appSpec.references.includes("knowledge/archetypes/task-manager.md"));
});

test("tag registry routes mobile archetypes to selected dedicated planned template", () => {
  const result = run(["plan", "Build a mobile field service app for technician jobs"]);
  const payload = jsonFrom(result);

  assert.equal(payload.appSpec.target, "mobile");
  assert.equal(payload.appSpec.archetype, "field-service");
  assert.equal(payload.appSpec.template, "templates/mobile/field-service/template-spec.json");
  assert.equal(payload.appSpec.templateStatus, "planned");
  assert.equal(payload.appSpec.generationMode, "plan-only");
  assert.ok(payload.appSpec.references.includes("knowledge/archetypes/field-service.md"));
  assert.ok(payload.appSpec.references.includes("templates/mobile/field-service/TEMPLATE_PLAN.md"));
  assert.ok(payload.appSpec.features.includes("job list"));
});

test("explicit platform keyword is authoritative and never cross-targets", () => {
  // No dedicated mobile CRM -> stays mobile via the same-target generic pack (not web/crm).
  const mobileCrm = jsonFrom(run(["plan", "Build me a mobile CRM"]));
  assert.equal(mobileCrm.appSpec.target, "mobile");
  assert.equal(mobileCrm.appSpec.template, "templates/mobile/generic-app/template-spec.json");

  // Explicit "web" stays web even though the habit-tracker archetype defaults to mobile.
  const webHabit = jsonFrom(run(["plan", "Build me a web habit tracker"]));
  assert.equal(webHabit.appSpec.target, "web");
  assert.equal(webHabit.appSpec.template, "templates/web/generic-app/template-spec.json");

  // Without an explicit keyword, the archetype default still applies.
  assert.equal(jsonFrom(run(["plan", "Build me a habit tracker"])).appSpec.target, "mobile");
  assert.equal(jsonFrom(run(["plan", "Build me a CRM"])).appSpec.target, "web");
});

test("init --existing creates local workspace profile", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-init-"));
  const result = run(["init", "--existing", "--json"], { cwd: workspace });
  const payload = jsonFrom(result);

  assert.equal(payload.mode, "existing-app");
  assert.ok(existsSync(join(workspace, ".buildable/config.json")));
  assert.ok(existsSync(join(workspace, ".buildable/repo-profile.json")));
});

test("generate copies runnable web task-manager starter and review passes", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-generate-"));
  const out = join(workspace, "taskflow");

  const generated = run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });
  const payload = jsonFrom(generated);
  assert.equal(payload.template, "templates/web/task-manager/template-spec.json");
  assert.ok(existsSync(join(out, "app/page.tsx")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));

  const notes = readFileSync(join(out, "BUILDABLE_NOTES.md"), "utf8");
  assert.match(notes, /reference loading contract/i);
  assert.match(notes, /Do not load all templates/);
  assert.match(notes, /Load only `appSpec.references`/);

  const reviewed = run(["review", out, "--json"], { cwd: workspace });
  const report = jsonFrom(reviewed);
  assert.equal(report.ok, true);
  assert.deepEqual(report.issues, []);
});

test("generate defaults output directory from app name", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-default-out-"));
  const out = join(workspace, "taskflow");

  const payload = jsonFrom(run(["generate", "Build me a task manager", "--json"], { cwd: workspace }));
  const config = JSON.parse(readFileSync(join(out, ".buildable/config.json"), "utf8"));

  assert.match(payload.outDir, /taskflow$/);
  assert.equal(payload.appName, "TaskFlow");
  assert.equal(payload.sourcePlan, "inline-prompt-plan");
  assert.equal(payload.sourcePlanPath, null);
  assert.equal(config.artifactType, "buildable-generated-project");
  assert.equal(config.workflowStage, "generated-files");
  assert.equal(config.sourcePlan, "inline-prompt-plan");
  assert.ok(existsSync(join(out, "app/page.tsx")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));
});

test("generate reuses the saved audit-first phase plan when the prompt matches", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-generate-saved-plan-"));
  const prompt = "Build me a task manager";

  const planned = jsonFrom(run(["plan", prompt], { cwd: workspace }));
  planned.appSpec.name = "SavedFlow";
  planned.appSpec.features.push("saved plan only feature");
  writeFileSync(join(workspace, ".buildable/phase-plan.json"), JSON.stringify(planned, null, 2));

  const out = join(workspace, "savedflow");
  const payload = jsonFrom(run(["generate", prompt, "--out", out, "--json"], { cwd: workspace }));
  const spec = JSON.parse(readFileSync(join(out, "buildable-app-spec.json"), "utf8"));
  const config = JSON.parse(readFileSync(join(out, ".buildable/config.json"), "utf8"));
  const page = readFileSync(join(out, "app/page.tsx"), "utf8");

  assert.equal(payload.appName, "SavedFlow");
  assert.equal(payload.sourcePlan, "saved-phase-plan");
  assert.equal(payload.sourcePlanPath, ".buildable/phase-plan.json");
  assert.equal(config.sourcePlan, "saved-phase-plan");
  assert.equal(config.workflowStage, "generated-files");
  assert.equal(spec.name, "SavedFlow");
  assert.ok(spec.features.includes("saved plan only feature"));
  assert.ok(spec.blocks.some((block) => block.id === "web/entity-form"));
  assert.ok(existsSync(join(out, ".buildable/phase-plan.toon")));
  assert.match(page, /SavedFlow/);
  assert.doesNotMatch(page, /TaskFlow/);
});

test("review defaults to the current app workspace", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-review-cwd-"));
  const out = join(workspace, "taskflow");

  jsonFrom(run(["generate", "Build me a task manager", "--json"], { cwd: workspace }));
  const report = jsonFrom(run(["review", "--json"], { cwd: out }));

  assert.equal(report.ok, true);
  assert.equal(report.appSpec, "buildable-app-spec.json");
  assert.ok(existsSync(join(out, ".buildable/review-report.md")));
});

test("mcp server exposes Buildable commands as tools", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-mcp-"));
  const input = [
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "buildable-test", version: "0.0.0" }
      }
    }),
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
    JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "buildable_plan",
        arguments: { prompt: "Build me a mobile habit tracker", workspace, files: ["./README.md"] }
      }
    })
  ].join("\n") + "\n";

  const result = spawnSync(process.execPath, [mcp], {
    cwd: root,
    encoding: "utf8",
    input
  });
  assert.equal(result.status, 0, result.stderr);

  const messages = result.stdout.trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(messages.find((message) => message.id === 1)?.result.serverInfo.name, "buildable");
  assert.ok(messages.find((message) => message.id === 2)?.result.tools.some((tool) => tool.name === "buildable_plan"));
  assert.ok(messages.find((message) => message.id === 2)?.result.tools.some((tool) => tool.name === "buildable_design"));

  const call = messages.find((message) => message.id === 3);
  assert.equal(call.result.isError, false);
  assert.equal(call.result.structuredContent.result.appSpec.archetype, "habit-tracker");
  assert.equal(call.result.structuredContent.result.appSpec.target, "mobile");
  assert.equal(call.result.structuredContent.result.appSpec.referenceInputs[0].path, "./README.md");
  assert.ok(existsSync(join(workspace, ".buildable/phase-plan.json")));
});

test("generate brands a runnable starter via --name", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-name-"));
  const out = join(workspace, "app");
  const payload = jsonFrom(run(["generate", "Build me a todo app", "--out", out, "--name", "ChoreMaster", "--json"], { cwd: workspace }));

  assert.equal(payload.appName, "ChoreMaster");
  assert.ok(payload.renamedFiles > 0);
  assert.equal(JSON.parse(readFileSync(join(out, "buildable-app-spec.json"), "utf8")).name, "ChoreMaster");
  const page = readFileSync(join(out, "app/page.tsx"), "utf8");
  assert.match(page, /ChoreMaster/);
  assert.doesNotMatch(page, /TaskFlow/);
});

test("generate derives the app name from the prompt", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-name2-"));
  const out = join(workspace, "app");
  const payload = jsonFrom(run(["generate", "Build me a todo app called FocusList", "--out", out, "--json"], { cwd: workspace }));
  assert.equal(payload.appName, "FocusList");
});

test("generate --augment plans into an existing app without copying source", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-augment-"));
  writeFileSync(join(workspace, "package.json"), JSON.stringify({ name: "existing-app", version: "1.0.0" }, null, 2));

  const payload = jsonFrom(run(["generate", "Add a CRM workflow to this app", "--out", workspace, "--augment", "--json"], { cwd: workspace }));
  assert.equal(payload.augment, true);
  assert.equal(payload.mode, "generated-augment");
  assert.equal(payload.runnable, false);
  assert.equal(payload.generationMode, "plan-only");
  assert.ok(existsSync(join(workspace, "IMPLEMENTATION_PLAN.md")));
  assert.ok(existsSync(join(workspace, "buildable-app-spec.json")));
  assert.ok(!existsSync(join(workspace, "app/page.tsx")));
  assert.match(readFileSync(join(workspace, "IMPLEMENTATION_PLAN.md"), "utf8"), /augment/i);
  // existing files are preserved
  assert.equal(JSON.parse(readFileSync(join(workspace, "package.json"), "utf8")).name, "existing-app");
});

test("generate refuses planned templates without explicit plan-pack flag", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-planned-"));
  const out = join(workspace, "expenses");
  const result = run(["generate", "Build me a mobile expense tracker", "--out", out, "--json"], { cwd: workspace });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not runnable yet/);
  assert.match(result.stderr, /--plan-pack/);
  assert.ok(!existsSync(join(out, "IMPLEMENTATION_PLAN.md")));
});

test("generate writes plan-only instruction packs for planned templates when requested", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-plan-pack-"));
  const out = join(workspace, "expenses");
  const result = run(["generate", "Build me a mobile expense tracker", "--out", out, "--plan-pack", "--json"], { cwd: workspace });
  const payload = jsonFrom(result);

  assert.equal(payload.runnable, false);
  assert.equal(payload.templateStatus, "planned");
  assert.equal(payload.generationMode, "plan-only");
  assert.ok(existsSync(join(out, "IMPLEMENTATION_PLAN.md")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));
  assert.ok(!existsSync(join(out, "package.json")));

  const review = run(["review", out, "--json"], { cwd: workspace });
  assert.notEqual(review.status, 0);
  const report = JSON.parse(review.stdout);
  assert.equal(report.ok, false);
  assert.ok(!report.warnings.some((warning) => warning.includes("Non-local-first term") && warning.includes("IMPLEMENTATION_PLAN.md")));
});

test("generate writes dedicated mobile planned packs when requested", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-mobile-plan-pack-"));
  const out = join(workspace, "fieldops");
  const result = run(["generate", "Build a mobile field service app for technician jobs", "--out", out, "--plan-pack", "--json"], { cwd: workspace });
  const payload = jsonFrom(result);

  assert.equal(payload.runnable, false);
  assert.equal(payload.template, "templates/mobile/field-service/template-spec.json");
  assert.equal(payload.templateStatus, "planned");
  assert.equal(payload.generationMode, "plan-only");
  assert.ok(existsSync(join(out, "IMPLEMENTATION_PLAN.md")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));
  assert.match(readFileSync(join(out, "IMPLEMENTATION_PLAN.md"), "utf8"), /field-service/);
});

test("runnable web templates generate, pass review, and surface expected files", () => {
  const cases = [
    { prompt: "Build me a CRM for tracking leads", template: "templates/web/crm/template-spec.json" },
    { prompt: "Build me a SaaS analytics dashboard", template: "templates/web/dashboard/template-spec.json" },
    { prompt: "Build me a marketplace for local services", template: "templates/web/marketplace/template-spec.json" },
    { prompt: "Build me a notes app", template: "templates/web/notes/template-spec.json" },
    { prompt: "Build me an ecommerce admin to manage products and orders", template: "templates/web/ecommerce-admin/template-spec.json" }
  ];

  for (const { prompt, template } of cases) {
    const workspace = mkdtempSync(join(tmpdir(), "buildable-runnable-"));
    const out = join(workspace, "app");
    const generated = jsonFrom(run(["generate", prompt, "--out", out, "--json"], { cwd: workspace }));

    assert.equal(generated.template, template, prompt);
    assert.equal(generated.runnable, true, prompt);
    assert.ok(existsSync(join(out, "app/page.tsx")), `${prompt} page`);

    const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
    assert.equal(report.ok, true, `${prompt} review: ${JSON.stringify(report.issues)}`);
    assert.ok(
      report.checks.some((check) => check.name === "expected-files" && check.status === "pass"),
      `${prompt} expected-files`
    );
  }
});

test("mobile habit tracker is a runnable Expo starter", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-habit-"));
  const out = join(workspace, "habits");
  const generated = jsonFrom(run(["generate", "Build me a mobile habit tracker", "--out", out, "--json"], { cwd: workspace }));

  assert.equal(generated.template, "templates/mobile/habit-tracker/template-spec.json");
  assert.equal(generated.runnable, true);
  assert.ok(existsSync(join(out, "app/index.tsx")));
  assert.ok(existsSync(join(out, "app/_layout.tsx")));

  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(report.ok, true, JSON.stringify(report.issues));
});

test("mobile booking is a runnable Expo starter", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-booking-"));
  const out = join(workspace, "booking");
  const generated = jsonFrom(run(["generate", "Build me a mobile booking app for appointments", "--out", out, "--json"], { cwd: workspace }));

  assert.equal(generated.template, "templates/mobile/booking/template-spec.json");
  assert.equal(generated.runnable, true);
  assert.ok(existsSync(join(out, "app/index.tsx")));
  assert.ok(existsSync(join(out, "components/service-picker.tsx")));

  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(report.ok, true, JSON.stringify(report.issues));
});

test("mobile task manager is a runnable Expo starter", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-mtask-"));
  const out = join(workspace, "tasks");
  const generated = jsonFrom(run(["generate", "Build me a mobile task manager", "--out", out, "--json"], { cwd: workspace }));

  assert.equal(generated.template, "templates/mobile/task-manager/template-spec.json");
  assert.equal(generated.runnable, true);
  assert.ok(existsSync(join(out, "app/index.tsx")));
  assert.ok(existsSync(join(out, "components/task-card.tsx")));

  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(report.ok, true, JSON.stringify(report.issues));
});

test("review surfaces missing expected files for runnable archetypes", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-missing-files-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a CRM for tracking leads", "--out", out, "--json"], { cwd: workspace });
  rmSync(join(out, "components/lead-list.tsx"));

  const result = run(["review", out, "--json"], { cwd: workspace });
  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.ok(report.checks.some((check) => check.name === "expected-files" && check.status === "fail"));
  assert.ok(report.issues.some((issue) => issue.includes("lead-list.tsx")));
});

test("review flags responsive-layout risk and runnable starters pass it", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-layout-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  // The shipped starter must not trip the heuristic.
  const clean = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(clean.checks.find((check) => check.name === "responsive-layout").status, "pass");

  // A fixed track paired with a bare 1fr is flagged — as a warning, not a failure.
  writeFileSync(join(out, "components/bad-grid.tsx"), 'export function Bad() { return <div className="grid lg:grid-cols-[320px_1fr]" />; }\n');
  const flagged = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(flagged.ok, true);
  assert.equal(flagged.checks.find((check) => check.name === "responsive-layout").status, "warn");
  assert.ok(flagged.warnings.some((w) => w.includes("Responsive-layout risk") && w.includes("bad-grid.tsx") && w.includes("minmax(0,1fr)")));
});

test("review grades accessibility and state coverage", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-quality-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  // The shipped starter passes the quality checks.
  const clean = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  const status = (name) => clean.checks.find((check) => check.name === name)?.status;
  assert.equal(status("accessible-forms"), "pass");
  assert.equal(status("focus-styles"), "pass");
  assert.equal(status("state-coverage"), "pass");

  // Several unlabeled controls outnumber labels and are flagged (as a warning, not a failure).
  const naked = Array.from({ length: 5 }, (_, i) => `<input placeholder="x${i}" />`).join("");
  writeFileSync(join(out, "components/naked.tsx"), `export function Naked() { return <form>${naked}</form>; }\n`);
  const flagged = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(flagged.ok, true);
  assert.equal(flagged.checks.find((check) => check.name === "accessible-forms").status, "warn");
  assert.ok(flagged.warnings.some((w) => w.includes("missing a <label> or aria-label")));
});

test("review design-tokens passes clean starters and warns on palette sprawl", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-tokens-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a SaaS analytics dashboard", "--out", out, "--json"], { cwd: workspace });

  // A single shared surface tint (bg-[#f7f8fb]) is fine; the shipped starter passes.
  const clean = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(clean.checks.find((check) => check.name === "design-tokens").status, "pass");

  // Palette sprawl (multiple raw bracket hexes + inline style hex) is flagged, non-blocking.
  writeFileSync(
    join(out, "components/sprawl.tsx"),
    'export function Sprawl() { return <div className="bg-[#123456] text-[#abcdef] border-[#999999]" style={{ color: "#ff0000" }}>x</div>; }\n'
  );
  const flagged = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(flagged.ok, true);
  assert.equal(flagged.checks.find((check) => check.name === "design-tokens").status, "warn");
  assert.ok(flagged.warnings.some((w) => w.includes("bypass the token palette")));
});

test("design layers a specialized rubric by surface profile", () => {
  const cases = [
    ["Build me a SaaS analytics dashboard", "knowledge/quality-rubrics/data-dense.md"],
    ["Build me a todo app", "knowledge/quality-rubrics/forms-auth.md"],
    ["Build me a landing page for a startup", "knowledge/quality-rubrics/content-marketing.md"]
  ];
  for (const [prompt, rubric] of cases) {
    const payload = jsonFrom(run(["design", prompt, "--json"]));
    assert.ok(payload.references.includes("knowledge/quality-rubrics/web-app.md"), `${prompt} keeps base rubric`);
    assert.ok(payload.references.includes(rubric), `${prompt} layers ${rubric}`);
  }
});

test("design-system registry exposes a foundations token contract", () => {
  const registry = JSON.parse(readFileSync(join(root, "core/design-system-registry.json"), "utf8"));
  const f = registry.foundations;
  assert.ok(f && typeof f === "object", "foundations object present");
  for (const key of ["spacingScale", "typeScale", "radiusScale", "motion", "color", "accessibility", "tokenUsageContract"]) {
    assert.ok(f[key] !== undefined && f[key] !== null, `foundations.${key} present`);
  }
  assert.ok(Array.isArray(f.tokenUsageContract) && f.tokenUsageContract.length > 0, "tokenUsageContract non-empty");
  // check validates the registry, so a well-formed foundations block keeps check green.
  assert.equal(run(["check", "--json"]).status, 0);
});

test("every design profile ships a complete dark palette", () => {
  const COLOR_KEYS = [
    "background", "surface", "surfaceMuted", "foreground", "mutedForeground",
    "primary", "primaryForeground", "accent", "border", "success", "warning", "danger", "focus"
  ];
  const prompts = [
    "Build me a todo app",
    "Build me a CRM",
    "Build me a landing page for a startup",
    "Build me a marketplace for local services",
    "Build me a mobile habit tracker",
    "Build me a mobile chat app",
    "Build me a restaurant website",
    "Build me a blog"
  ];
  const seen = new Set();
  for (const prompt of prompts) {
    const light = jsonFrom(run(["design", prompt, "--json"]));
    const dark = jsonFrom(run(["design", prompt, "--dark", "--json"]));
    const profile = light.designSystem.profile;
    seen.add(profile);

    assert.equal(dark.designTokens.theme, "dark", `${profile} --dark sets theme`);
    for (const key of COLOR_KEYS) {
      assert.ok(dark.designTokens.colorsDark?.[key], `${profile} dark.${key} present`);
    }
    // --dark swaps the active palette to the dark set, which differs from light.
    assert.equal(dark.designTokens.colors.background, dark.designTokens.colorsDark.background);
    assert.notEqual(light.designTokens.colors.background, dark.designTokens.colors.background, `${profile} dark differs from light`);
    // The default (light) brief still exposes both sets so an agent can wire a toggle.
    assert.equal(light.designTokens.theme, "light");
    assert.ok(light.designTokens.colorsLight?.background && light.designTokens.colorsDark?.background, `${profile} exposes both palettes`);
  }
  assert.ok(seen.size >= 8, `covered ${seen.size} distinct profiles, expected >= 8`);
});

test("plan opts into local-first persistence only when asked", () => {
  const asked = jsonFrom(run(["plan", "Build me a todo app that saves my data", "--json"]));
  assert.equal(asked.appSpec.persistence?.requested, true);
  assert.equal(asked.appSpec.persistence.userNamedBackend, null);
  assert.ok(asked.appSpec.references.includes("knowledge/data-layer/persistence-ladder.md"));
  assert.ok(asked.appSpec.references.includes("knowledge/data-layer/repository-pattern.md"));
  assert.match(asked.enhancedPrompt, /Persistence requested/);

  const plain = jsonFrom(run(["plan", "Build me a todo app", "--json"]));
  assert.equal(plain.appSpec.persistence, null);
  assert.ok(!plain.appSpec.references.some((r) => r.includes("data-layer")));

  // A marketing "save money" phrase is not a persistence ask.
  const decoy = jsonFrom(run(["plan", "Build me a landing page to save money on ads", "--json"]));
  assert.equal(decoy.appSpec.persistence, null);
});

test("plan opts into auth shape only when explicitly asked", () => {
  const login = jsonFrom(run(["plan", "Build me a CRM with login", "--json"]));
  assert.equal(login.appSpec.auth?.requested, true);
  assert.equal(login.appSpec.auth.defaultMode, "local-mock");
  assert.equal(login.appSpec.auth.userNamedProvider, null);
  assert.equal(login.appSpec.questionsNeeded, false);
  assert.ok(login.appSpec.references.includes("knowledge/auth/auth-shape.md"));
  assert.ok(login.appSpec.references.includes("knowledge/auth/auth-seam.md"));
  assert.ok(!login.appSpec.mustNotInclude.includes("auth unless requested"));
  assert.match(login.enhancedPrompt, /Auth requested/);
  assert.match(login.planMarkdown, /Auth Shape/);

  const flag = jsonFrom(run(["plan", "Build me a todo app", "--with-auth", "--json"]));
  assert.equal(flag.appSpec.auth?.requested, true);
  assert.ok(flag.phasePlan.some((phase) => phase.command?.includes("--with-auth")));

  const finance = jsonFrom(run(["plan", "Build me a personal finance app with accounts", "--json"]));
  assert.equal(finance.appSpec.auth, null);
  assert.equal(finance.appSpec.questionsNeeded, false);
});

test("auth allows a user-named provider behind the seam, still flags others", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-auth-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a CRM with Clerk login", "--out", out, "--json"], { cwd: workspace });

  const spec = JSON.parse(readFileSync(join(out, "buildable-app-spec.json"), "utf8"));
  assert.equal(spec.auth.userNamedProvider, "clerk");
  assert.ok(!spec.mustNotInclude.includes("auth unless requested"), "auth request drops the blanket auth ban");

  writeFileSync(join(out, "components/auth-service.tsx"), 'export const authService = "clerk adapter behind auth seam";\n');
  writeFileSync(join(out, "components/extra.tsx"), 'export const b = "also wires auth0 directly";\n');
  const report = JSON.parse(run(["review", out, "--strict", "--json"], { cwd: workspace }).stdout);
  const all = [...report.issues, ...report.warnings].join("\n");
  assert.ok(!all.includes('"clerk"'), "user-named auth provider is allowed");
  assert.ok(all.includes('"auth0"'), "an un-named auth provider is still flagged");
});

test("review warns when auth provider calls are not behind an auth seam", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-auth-seam-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a CRM with Clerk login", "--out", out, "--json"], { cwd: workspace });

  writeFileSync(join(out, "components/login.tsx"), 'export const note = "calls clerk from the screen";\n');
  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  const seam = report.checks.find((c) => c.name === "auth-seam");
  assert.equal(seam.status, "warn");
  assert.ok(report.warnings.some((w) => w.includes("auth seam")));
});

test("persistence allows a user-named backend behind the seam, still flags others", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-persist-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a CRM that saves leads to my Supabase", "--out", out, "--force", "--json"], { cwd: workspace });

  const spec = JSON.parse(readFileSync(join(out, "buildable-app-spec.json"), "utf8"));
  assert.equal(spec.persistence.userNamedBackend, "supabase");
  assert.ok(!spec.mustNotInclude.includes("managed databases"), "named backend drops the blanket ban");

  writeFileSync(join(out, "components/backend.tsx"), 'export const a = "uses supabase as the user backend";\n');
  writeFileSync(join(out, "components/extra.tsx"), 'export const b = "also wires firebase";\n');
  const report = JSON.parse(run(["review", out, "--strict", "--json"], { cwd: workspace }).stdout);
  const all = [...report.issues, ...report.warnings].join("\n");
  assert.ok(!all.includes('"supabase"'), "user-named backend is allowed");
  assert.ok(all.includes('"firebase"'), "an un-named backend is still flagged");
});

test("review emits an advisory readiness section without affecting pass/fail", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-readiness-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  // Advisory only — a clean prototype still passes.
  assert.equal(report.ok, true);
  const byArea = Object.fromEntries(report.readiness.map((item) => [item.area, item]));
  assert.equal(byArea.data.status, "in-memory");
  assert.equal(byArea.auth.status, "none");
  assert.equal(byArea.deployment.status, "none");
  assert.match(byArea.data.note, /persistence ladder/);
  assert.match(byArea.auth.note, /--with-auth/);

  // A local storage seam upgrades the data advisory to "local", still passing.
  writeFileSync(join(out, "lib/repository.ts"), 'export const save = (v) => localStorage.setItem("k", v);\n');
  const withStore = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(withStore.readiness.find((item) => item.area === "data").status, "local");
});

test("review warns when persistence has storage calls without a seam", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-seam-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app that saves my data", "--out", out, "--json"], { cwd: workspace });

  // Storage primitive with no repository wrapper.
  writeFileSync(join(out, "components/store.tsx"), 'export function save(v) { localStorage.setItem("k", v); }\n');
  const report = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  const seam = report.checks.find((c) => c.name === "persistence-seam");
  assert.equal(seam.status, "warn");
  assert.ok(report.warnings.some((w) => w.includes("repository seam")));
});

test("review --strict fails on local-first guardrail drift", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-strict-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  // Clean starter passes even in strict mode.
  assert.equal(jsonFrom(run(["review", out, "--strict", "--json"], { cwd: workspace })).ok, true);

  // Inject a hosted-feature term.
  writeFileSync(join(out, "components/hosted.tsx"), 'export const note = "configure billing and a managed database";\n');

  // Default: warning only, review still passes.
  const lenient = jsonFrom(run(["review", out, "--json"], { cwd: workspace }));
  assert.equal(lenient.ok, true);
  assert.ok(lenient.warnings.some((w) => w.includes("Non-local-first term")));

  // Strict: blocking failure (non-zero exit, issue recorded).
  const strict = run(["review", out, "--strict", "--json"], { cwd: workspace });
  assert.notEqual(strict.status, 0);
  const report = JSON.parse(strict.stdout);
  assert.equal(report.ok, false);
  assert.ok(report.issues.some((issue) => issue.includes("Non-local-first term")));
});

test("review --strict catches BaaS/auth/payment drift, not just billing", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-strict2-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  for (const term of ["supabase", "stripe", "login", "firebase", "next-auth"]) {
    writeFileSync(join(out, "components/drift.tsx"), `export const note = "uses ${term} for the backend";\n`);
    const strict = run(["review", out, "--strict", "--json"], { cwd: workspace });
    assert.notEqual(strict.status, 0, `${term} should fail --strict`);
    assert.ok(JSON.parse(strict.stdout).issues.some((issue) => issue.includes(`"${term}"`)), `${term} issue recorded`);
  }
});

test("review --strict scans beyond starter-sized apps and includes jsx/html", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-strict-scan-"));
  const out = join(workspace, "app");
  run(["generate", "Build me a todo app", "--out", out, "--json"], { cwd: workspace });

  const filler = join(out, "components", "filler");
  mkdirSync(filler, { recursive: true });
  for (let index = 0; index < 120; index += 1) {
    writeFileSync(join(filler, `filler-${String(index).padStart(3, "0")}.tsx`), `export const filler${index} = "${index}";\n`);
  }

  mkdirSync(join(out, "zz-late"), { recursive: true });
  writeFileSync(join(out, "zz-late", "late-drift.jsx"), 'export const drift = "uses supabase";\n');
  writeFileSync(join(out, "zz-late", "late-drift.html"), "<div>stripe checkout</div>\n");

  const strict = run(["review", out, "--strict", "--json"], { cwd: workspace });
  assert.notEqual(strict.status, 0);
  const report = JSON.parse(strict.stdout);
  assert.equal(report.ok, false);
  assert.ok(report.issues.some((issue) => issue.includes("supabase") && issue.includes("late-drift.jsx")));
  assert.ok(report.issues.some((issue) => issue.includes("stripe") && issue.includes("late-drift.html")));
});

test("codex manifest exposes reference roots and docs explain available vs loaded", () => {
  const plugin = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
  assert.ok(plugin.resources.includes("../knowledge"));
  assert.ok(plugin.resources.includes("../templates"));

  // The CLI docs must explain that exposing a dir is availability, not agent loading,
  // so the "scoped vs broad resources" drift can't silently return.
  const cliDoc = readFileSync(join(root, "cli/README.md"), "utf8");
  assert.match(cliDoc, /available/i);
  assert.match(cliDoc, /appSpec\.references/);
  assert.doesNotMatch(cliDoc, /stay scoped to indexes/);
  assert.doesNotMatch(cliDoc, /scoped plugin resources/);
});

test("copied Cursor commands are portable outside the Buildable repo", () => {
  for (const command of ["plan", "design", "generate", "review", "preview", "init"]) {
    const text = readFileSync(join(root, `.cursor/commands/buildable-${command}.md`), "utf8");
    assert.match(text, /buildable /, `${command} should prefer the global buildable command`);
    assert.match(text, /BUILDABLE_ROOT/, `${command} should document the checkout fallback`);
    assert.doesNotMatch(text, /node \.\/bin\/buildable\.mjs/, `${command} must not assume the current workspace is Buildable`);
  }
});

test("review fails generic app specs that are not represented in source", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-review-generic-"));
  writeFileSync(join(workspace, "package.json"), JSON.stringify({ name: "empty-generic", version: "0.0.0" }, null, 2));
  writeFileSync(
    join(workspace, "buildable-app-spec.json"),
    JSON.stringify(jsonFrom(run(["plan", "Build a local business directory website"])).appSpec, null, 2)
  );

  const result = run(["review", workspace, "--json"], { cwd: workspace });
  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, false);
  assert.equal(report.status, "fail");
  assert.ok(report.checks.some((check) => check.name === "implementation-files" && check.status === "fail"));
  assert.ok(report.checks.some((check) => check.name === "app-spec-entities" && check.status === "fail"));
});

test("review fails when app spec is missing", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-review-nospec-"));
  mkdirSync(join(workspace, "app"));
  writeFileSync(join(workspace, "package.json"), JSON.stringify({ name: "nospec", version: "0.0.0" }, null, 2));
  writeFileSync(join(workspace, "app/page.tsx"), "export default function Page() { return <main />; }\n");

  const result = run(["review", workspace, "--json"], { cwd: workspace });
  assert.notEqual(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.ok(report.issues.some((issue) => issue.includes("No buildable app spec")));
});

test("every registered archetype produces a valid app spec", () => {
  const registry = JSON.parse(readFileSync(join(root, "core/archetype-registry.json"), "utf8"));

  for (const entry of registry.archetypes) {
    const prompt = `Build me a ${entry.id.replace(/-/g, " ")}`;
    const payload = jsonFrom(run(["plan", prompt]));
    const spec = payload.appSpec;

    assert.ok(spec.entities.length > 0, `${entry.id} has entities`);
    for (const entity of spec.entities) {
      assert.ok(
        Array.isArray(entity.fields) && entity.fields.length >= 4,
        `${entry.id} entity ${entity.name} needs >= 4 fields, got ${entity.fields?.length}`
      );
    }
    assert.ok(spec.features.length > 0, `${entry.id} has features`);
    for (const reference of spec.references) {
      assert.ok(existsSync(join(root, reference)), `${entry.id} reference exists: ${reference}`);
    }
  }
});

test("check validates Claude plugin packaging", () => {
  const payload = jsonFrom(run(["check", "--json"]));
  assert.equal(payload.checked.claudePlugin, true);
  assert.equal(payload.claudePluginIssues.length, 0);

  const manifest = JSON.parse(readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8"));
  assert.equal(manifest.name, "buildable");

  const marketplace = JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"));
  assert.ok(marketplace.plugins.some((plugin) => plugin.name === "buildable"));

  for (const command of ["plan", "design", "generate", "review", "init", "preview"]) {
    assert.ok(existsSync(join(root, `commands/buildable-${command}.md`)), `command ${command}`);
  }
});

test("preview degrades gracefully when no headless browser is available", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-preview-"));
  const result = run(["preview", workspace, "--json"], { cwd: workspace });

  // No Playwright installed in the test env: skip cleanly, do not fail.
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "skipped");
  assert.equal(report.ok, true);
  assert.match(report.guidance, /playwright/i);
  assert.ok(existsSync(join(workspace, ".buildable/preview-report.md")));
});

test("check validates template and plugin references", () => {
  const payload = jsonFrom(run(["check", "--json"]));
  assert.equal(payload.ok, true);
  assert.equal(payload.missing.length, 0);
  assert.equal(payload.registryIssues.length, 0);
  assert.equal(payload.templateIssues.length, 0);
  assert.equal(payload.pluginIssues.length, 0);
  assert.equal(payload.claudePluginIssues.length, 0);
  assert.ok(payload.checked.archetypes >= 50);
  assert.ok(payload.checked.runnableTemplates >= 5);
  assert.ok(payload.checked.plannedTemplates >= 1);
});

test("list exposes runnable and planned generation status", () => {
  const payload = jsonFrom(run(["list", "--json"]));
  assert.ok(payload.generation.runnableTemplates >= 5);
  assert.ok(payload.generation.plannedTemplates >= 1);
  assert.equal(payload.generation.plannedGenerateMode, "plan-only instruction pack");
});

test("eval passes all fixtures and reports context-load efficiency", () => {
  const payload = jsonFrom(run(["eval", "--json"]));

  assert.equal(payload.ok, true);
  assert.equal(payload.failed, 0);
  assert.ok(payload.fixtures >= 8);
  assert.ok(payload.corpusBytes > 0);
  // The whole point of the loading contract: each plan loads a small slice of the brain.
  assert.ok(payload.efficiency.avgContextLoadRatio < 0.25, `ratio ${payload.efficiency.avgContextLoadRatio}`);
  assert.ok(payload.results.every((result) => result.references > 0));

  // Spec quality is a tracked metric: generated specs should be concrete.
  assert.ok(payload.specQuality.avgScore >= 0.8, `avg spec quality ${payload.specQuality.avgScore}`);
  assert.ok(payload.specQuality.minScore >= 0.6, `min spec quality ${payload.specQuality.minScore}`);
  assert.ok(payload.results.every((result) => typeof result.specQuality === "number"));
  // Default eval output stays free of the comparison block.
  assert.equal(payload.comparison, undefined);
});

test("eval --compare quantifies guidance added over a raw prompt", () => {
  const payload = jsonFrom(run(["eval", "--compare", "--json"]));

  assert.ok(payload.comparison, "comparison block present");
  const { buildable, raw } = payload.comparison.perPromptAverage;
  assert.ok(buildable.features > 0 && buildable.entityFields > 0 && buildable.references > 0);
  assert.equal(raw.features, 0);
  assert.equal(raw.references, 0);
  assert.ok(payload.comparison.guidanceAddedPerPrompt > 0);
});

test("docs and plugin resources keep low-token scope explicit", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.doesNotMatch(readme, /\/Users\/christianpatricksuntay\/Projects\/Buildable/);
  assert.match(readme, /\[docs\/install\.md\]\(docs\/install\.md\)/);
  assert.match(readme, /runnable starters/);

  const plugin = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
  // The manifest must expose the dirs that appSpec.references resolve from, so plans never
  // point at files the plugin did not ship. Low-token discipline is the runtime contract.
  assert.ok(plugin.resources.includes("../knowledge"));
  assert.ok(plugin.resources.includes("../templates"));
  assert.ok(plugin.resources.includes("../core/reference-loading-contract.md"));
});
