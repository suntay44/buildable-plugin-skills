import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const cli = join(root, "bin/buildable.mjs");

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
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

  assert.equal(typeof payload.enhancedPrompt, "string");
  assert.match(payload.enhancedPrompt, /local-first web task-manager prototype/);
  assert.match(payload.enhancedPrompt, /Do not add/);
  assert.match(payload.enhancedPrompt, /modern UI quality guidance/);
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
    "style",
    "template",
    "templateStatus",
    "generationMode",
    "references",
    "referenceLoadingContract",
    "mustNotInclude",
    "acceptanceCriteria",
    "questionsNeeded",
    "questions",
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
  assert.ok(spec.references.includes("knowledge/design-playbooks/ui-quality.md"));
  assert.deepEqual(spec.referenceLoadingContract, [
    "Do not load all templates.",
    "Run buildable plan.",
    "Load only appSpec.references.",
    "Load starter source only for the selected template."
  ]);
});

test("plan asks questions for architecture-changing prompts", () => {
  const result = run(["plan", "Build me a todo app with auth and Stripe payments"]);
  const payload = jsonFrom(result);

  assert.equal(payload.classification.questionsNeeded, true);
  assert.equal(payload.appSpec.questionsNeeded, true);
  assert.ok(payload.appSpec.questions.some((question) => question.includes("auth")));
  assert.ok(payload.appSpec.questions.some((question) => question.includes("payments")));
  assert.match(payload.enhancedPrompt, /Pause before generation/);
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

test("generate pauses when architecture questions are required", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-approval-"));
  const result = run(["generate", "Build me a todo app with auth", "--out", join(workspace, "auth-app")], { cwd: workspace });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /architecture-changing choices/);
  assert.match(result.stderr, /auth\/accounts/);
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

  assert.match(payload.outDir, /taskflow$/);
  assert.equal(payload.appName, "TaskFlow");
  assert.ok(existsSync(join(out, "app/page.tsx")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));
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
  const out = join(workspace, "recipes");
  const result = run(["generate", "Build me a recipe app", "--out", out, "--json"], { cwd: workspace });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not runnable yet/);
  assert.match(result.stderr, /--plan-pack/);
  assert.ok(!existsSync(join(out, "IMPLEMENTATION_PLAN.md")));
});

test("generate writes plan-only instruction packs for planned templates when requested", () => {
  const workspace = mkdtempSync(join(tmpdir(), "buildable-plan-pack-"));
  const out = join(workspace, "recipes");
  const result = run(["generate", "Build me a recipe app", "--out", out, "--plan-pack", "--json"], { cwd: workspace });
  const payload = jsonFrom(result);

  assert.equal(payload.runnable, false);
  assert.equal(payload.templateStatus, "planned");
  assert.equal(payload.generationMode, "plan-only");
  assert.ok(existsSync(join(out, "IMPLEMENTATION_PLAN.md")));
  assert.ok(existsSync(join(out, "buildable-app-spec.json")));
  assert.ok(!existsSync(join(out, "package.json")));
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

  for (const command of ["plan", "generate", "review", "init", "preview"]) {
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
  assert.ok(plugin.resources.includes("../knowledge/INDEX.md"));
  assert.ok(plugin.resources.includes("../templates/INDEX.md"));
  assert.ok(!plugin.resources.includes("../knowledge"));
  assert.ok(!plugin.resources.includes("../templates"));
  assert.ok(!plugin.resources.includes("../core"));
});
