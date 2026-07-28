#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(root, "bin", "buildable.mjs");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

const toolDefinitions = [
  {
    name: "buildable_plan",
    description: "Classify an app idea and return a local-first Buildable phase plan/app spec with exact references to load.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The app idea prompt to plan." },
        workspace: { type: "string", description: "Optional project folder to run from. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        files: { type: "array", items: { type: "string" }, description: "Optional explicit user reference files or screenshots to preserve in appSpec.referenceInputs." },
        withAuth: { type: "boolean", description: "Opt into Buildable's local/mock auth shape behind an auth seam." },
        authProvider: { type: "string", description: "Optional user-named auth provider to keep behind the auth seam." },
        noWrite: { type: "boolean", description: "Only return the plan; do not write .buildable/phase-plan files." },
        toon: { type: "boolean", description: "Compatibility alias: return the compact TOON contract instead of JSON. Plain plan still writes .buildable/phase-plan.toon automatically." },
        verbose: { type: "boolean", description: "Return the full plan JSON including the planMarkdown render. Default is compact JSON (planMarkdown dropped)." }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    name: "buildable_generate",
    description: "Create a runnable local starter or plan-only instruction pack from a prompt. Writes files to the selected workspace/output.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        workspace: { type: "string", description: "Project folder to run from. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        files: { type: "array", items: { type: "string" }, description: "Optional explicit user reference files or screenshots to preserve in the generated app spec." },
        out: { type: "string", description: "Optional output folder. If omitted, Buildable creates a folder from the app name." },
        name: { type: "string", description: "Optional app name for branding generated starters." },
        planPack: { type: "boolean", description: "Write a plan-only pack for planned templates." },
        augment: { type: "boolean", description: "Plan into an existing app without copying starter source." },
        withAuth: { type: "boolean", description: "Opt into Buildable's local/mock auth shape behind an auth seam." },
        authProvider: { type: "string", description: "Optional user-named auth provider to keep behind the auth seam." },
        force: { type: "boolean", description: "Continue when questions or non-empty output would otherwise stop generation." }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    name: "buildable_design",
    description: "Create a UI/UX design brief from a prompt or current Buildable app spec. Can be used before, after, or during implementation.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Optional design prompt, app idea, page, or component to design." },
        workspace: { type: "string", description: "Workspace folder. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        page: { type: "string", description: "Optional page/surface focus, such as login, dashboard, checkout, or settings." },
        write: { type: "boolean", description: "Write .buildable/design-brief.json and .buildable/design-brief.md into the workspace." }
      },
      additionalProperties: false
    }
  },
  {
    name: "buildable_review",
    description: "Audit the current app against its Buildable app spec, expected files, quality checks, and local-first guardrails.",
    inputSchema: {
      type: "object",
      properties: {
        workspace: { type: "string", description: "App folder to review. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        build: { type: "boolean", description: "Also run installed typecheck/build scripts when dependencies are present." },
        strict: { type: "boolean", description: "Fail on non-local-first drift instead of warning." }
      },
      additionalProperties: false
    }
  },
  {
    name: "buildable_init",
    description: "Create local .buildable workspace config. Use existing=true inside an existing app.",
    inputSchema: {
      type: "object",
      properties: {
        workspace: { type: "string", description: "Workspace folder to initialize. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        existing: { type: "boolean", description: "Profile an existing app without overwriting code." }
      },
      additionalProperties: false
    }
  },
  {
    name: "buildable_status",
    description: "Inspect a Buildable workspace and return the current workflow stage plus recommended next command. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        workspace: { type: "string", description: "Workspace folder to inspect. Defaults to BUILDABLE_WORKSPACE or current process cwd." }
      },
      additionalProperties: false
    }
  },
  {
    name: "buildable_list",
    description: "List bundled archetypes and runnable/planned template status.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "buildable_check",
    description: "Verify Buildable local assets, adapter files, plugin metadata, and template references.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "buildable_eval",
    description: "Run deterministic Buildable fixtures and report routing, spec quality, and context-load efficiency.",
    inputSchema: {
      type: "object",
      properties: {
        compare: { type: "boolean", description: "Include guided-vs-raw prompt comparison." }
      },
      additionalProperties: false
    }
  },
  {
    name: "buildable_preview",
    description: "Optional visual preview loop for a running web app. Requires Playwright installed in the app or Buildable.",
    inputSchema: {
      type: "object",
      properties: {
        workspace: { type: "string", description: "App folder to write preview artifacts into. Defaults to BUILDABLE_WORKSPACE or current process cwd." },
        url: { type: "string", description: "Local URL to render. Defaults to http://localhost:3000." }
      },
      additionalProperties: false
    }
  }
];

const outputSchema = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    exitCode: { anyOf: [{ type: "integer" }, { type: "null" }] },
    workspace: { type: "string" },
    result: {},
    stderr: { type: "string" }
  },
  required: ["ok", "exitCode", "workspace", "result", "stderr"],
  additionalProperties: false
};

const toolMetadata = {
  buildable_plan: {
    title: "Plan a Buildable Prototype",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_generate: {
    title: "Generate a Buildable Prototype",
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
  },
  buildable_design: {
    title: "Create a Buildable Design Brief",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_review: {
    title: "Review a Buildable Prototype",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_init: {
    title: "Initialize a Buildable Workspace",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_status: {
    title: "Inspect Buildable Workflow Status",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_list: {
    title: "List Buildable Templates",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_check: {
    title: "Check the Buildable Installation",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_eval: {
    title: "Evaluate Buildable Routing",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  buildable_preview: {
    title: "Preview a Buildable Web App",
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }
};

const tools = toolDefinitions.map((tool) => ({
  ...tool,
  ...toolMetadata[tool.name],
  outputSchema
}));

function workspaceFor(args = {}) {
  const value = args.workspace ?? process.env.BUILDABLE_WORKSPACE ?? process.cwd();
  return isAbsolute(value) ? value : join(process.cwd(), value);
}

function buildArgs(toolName, args = {}) {
  if (toolName === "buildable_plan") {
    const command = ["plan", args.prompt];
    if (Array.isArray(args.files)) {
      for (const file of args.files) command.push("--file", file);
    }
    if (args.withAuth) command.push("--with-auth");
    if (args.authProvider) command.push("--with-auth-provider", args.authProvider);
    if (args.noWrite) command.push("--no-write");
    // Token-efficient by default: return compact JSON (drops the redundant
    // planMarkdown render). Keep toon:true as a stable 1.0 compatibility alias;
    // the CLI still writes .buildable/phase-plan.toon during normal planning.
    if (args.toon) command.push("--toon");
    else if (!args.verbose) command.push("--compact");
    return command;
  }
  if (toolName === "buildable_generate") {
    const command = ["generate", args.prompt, "--json"];
    if (Array.isArray(args.files)) {
      for (const file of args.files) command.push("--file", file);
    }
    if (args.out) command.push("--out", args.out);
    if (args.name) command.push("--name", args.name);
    if (args.planPack) command.push("--plan-pack");
    if (args.augment) command.push("--augment");
    if (args.withAuth) command.push("--with-auth");
    if (args.authProvider) command.push("--with-auth-provider", args.authProvider);
    if (args.force) command.push("--force");
    return command;
  }
  if (toolName === "buildable_design") {
    const command = ["design", args.prompt ?? "", "--json"];
    if (args.page) command.push("--page", args.page);
    if (args.write) command.push("--write");
    return command;
  }
  if (toolName === "buildable_review") {
    const command = ["review", ".", "--json"];
    if (args.build) command.push("--build");
    if (args.strict) command.push("--strict");
    return command;
  }
  if (toolName === "buildable_init") {
    const command = ["init", "--json"];
    if (args.existing) command.push("--existing");
    return command;
  }
  if (toolName === "buildable_status") return ["status", "--json"];
  if (toolName === "buildable_list") return ["list", "--json"];
  if (toolName === "buildable_check") return ["check", "--json"];
  if (toolName === "buildable_eval") {
    const command = ["eval", "--json"];
    if (args.compare) command.push("--compare");
    return command;
  }
  if (toolName === "buildable_preview") {
    const command = ["preview", ".", "--json"];
    if (args.url) command.push("--url", args.url);
    return command;
  }
  throw new Error(`Unknown tool: ${toolName}`);
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function runBuildable(toolName, args = {}) {
  if ((toolName === "buildable_plan" || toolName === "buildable_generate") && !args.prompt) {
    throw new Error(`${toolName} requires a prompt.`);
  }

  const cwd = ["buildable_list", "buildable_check", "buildable_eval"].includes(toolName) ? root : workspaceFor(args);
  if (!existsSync(cwd)) throw new Error(`Workspace does not exist: ${cwd}`);

  const result = spawnSync(process.execPath, [cli, ...buildArgs(toolName, args)], {
    cwd,
    encoding: "utf8",
    timeout: toolName === "buildable_preview" ? 120000 : 600000
  });
  const stdout = (result.stdout ?? "").trim();
  const stderr = (result.stderr ?? "").trim();
  const parsed = stdout ? parseMaybeJson(stdout) : null;
  return {
    ok: result.status === 0,
    exitCode: result.status,
    workspace: cwd,
    result: parsed,
    stderr
  };
}

function response(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function errorResponse(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error })}\n`);
}

function toolResult(payload) {
  return {
    isError: !payload.ok,
    structuredContent: payload,
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

function validateToolArguments(tool, args) {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new TypeError("Tool arguments must be an object.");
  }
  const schema = tool.inputSchema;
  for (const field of schema.required ?? []) {
    if (args[field] === undefined) throw new TypeError(`Missing required tool argument: ${field}`);
  }
  if (schema.additionalProperties === false) {
    for (const field of Object.keys(args)) {
      if (!schema.properties?.[field]) throw new TypeError(`Unknown tool argument: ${field}`);
    }
  }
  for (const [field, value] of Object.entries(args)) {
    const property = schema.properties?.[field];
    if (!property || value === undefined) continue;
    if (property.type === "array") {
      if (!Array.isArray(value) || (property.items?.type === "string" && value.some((entry) => typeof entry !== "string"))) {
        throw new TypeError(`Tool argument ${field} must be an array of strings.`);
      }
    } else if (property.type && typeof value !== property.type) {
      throw new TypeError(`Tool argument ${field} must be a ${property.type}.`);
    }
  }
}

let initializeResponded = false;
let clientReady = false;

async function handle(message) {
  if (!message || typeof message !== "object") return;
  const { id, method, params = {} } = message;
  const isNotification = id === undefined || id === null;

  try {
    if (method === "initialize") {
      if (initializeResponded) {
        errorResponse(id, -32600, "Initialize may only be requested once.");
        return;
      }
      if (typeof params.protocolVersion !== "string") {
        errorResponse(id, -32602, "initialize requires params.protocolVersion.");
        return;
      }
      const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(params.protocolVersion)
        ? params.protocolVersion
        : LATEST_PROTOCOL_VERSION;
      initializeResponded = true;
      response(id, {
        protocolVersion,
        serverInfo: {
          name: "buildable",
          title: "Buildable Local App Builder",
          version: packageJson.version,
          description: "Plan, generate, inspect, and review local-first web and mobile prototypes.",
          websiteUrl: "https://github.com/suntay44/buildable-plugin-skills"
        },
        capabilities: { tools: { listChanged: false } },
        instructions:
          "Use buildable_plan before generation, load only appSpec.references, and use buildable_review after implementation."
      });
      return;
    }
    if (method === "ping") {
      if (!isNotification) response(id, {});
      return;
    }
    if (method === "notifications/initialized") {
      if (initializeResponded) clientReady = true;
      return;
    }
    if (method === "notifications/cancelled") return;
    if (!clientReady) {
      if (!isNotification) errorResponse(id, -32002, "Server is not initialized.");
      return;
    }
    if (method === "tools/list") {
      response(id, { tools });
      return;
    }
    if (method === "tools/call") {
      const tool = tools.find((entry) => entry.name === params.name);
      if (!tool) {
        errorResponse(id, -32602, `Unknown tool: ${params.name}`);
        return;
      }
      try {
        validateToolArguments(tool, params.arguments ?? {});
      } catch (error) {
        errorResponse(id, -32602, error instanceof Error ? error.message : String(error));
        return;
      }
      response(id, toolResult(runBuildable(params.name, params.arguments ?? {})));
      return;
    }
    if (!isNotification) errorResponse(id, -32601, `Method not found: ${method}`);
  } catch (error) {
    if (!isNotification) errorResponse(id, -32000, error instanceof Error ? error.message : String(error));
  }
}

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", (line) => {
  if (!line.trim()) return;
  try {
    void handle(JSON.parse(line));
  } catch (error) {
    errorResponse(null, -32700, error instanceof Error ? error.message : String(error));
  }
});
