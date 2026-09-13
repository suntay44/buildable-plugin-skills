#!/usr/bin/env node
// Opt-in: real native clients, no model calls, only disposable homes/configs.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const client = process.argv[2];
if (!["codex", "claude"].includes(client)) {
  console.error("Usage: node scripts/smoke-native-install.mjs codex|claude (client must be installed on PATH)");
  process.exit(1);
}
const root = fileURLToPath(new URL("..", import.meta.url));
const temp = realpathSync(mkdtempSync(join(tmpdir(), "buildable native install ")));
for (const dir of ["home", "codex config", "claude config", "xdg config", "app workspace", "source", "npm cache"]) mkdirSync(join(temp, dir));
const workspace = join(temp, "app workspace");
writeFileSync(join(workspace, "user-owned.txt"), "keep");
writeFileSync(join(temp, "npmrc"), "");
writeFileSync(join(temp, "global-npmrc"), "");
// Do not inherit account tokens, user config locations, or Git configuration.
const env = {
  PATH: process.env.PATH,
  HOME: join(temp, "home"),
  CODEX_HOME: join(temp, "codex config"),
  CLAUDE_CONFIG_DIR: join(temp, "claude config"),
  XDG_CONFIG_HOME: join(temp, "xdg config"),
  XDG_CACHE_HOME: join(temp, "xdg cache"),
  XDG_DATA_HOME: join(temp, "xdg data"),
  TMPDIR: temp,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: join(temp, "gitconfig"),
  GIT_TERMINAL_PROMPT: "0",
  npm_config_userconfig: join(temp, "npmrc"),
  npm_config_globalconfig: join(temp, "global-npmrc"),
  npm_config_cache: join(temp, "npm cache"),
  DISABLE_AUTOUPDATER: "1",
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1"
};
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: workspace, env, encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024, ...options });
  assert.equal(result.status, 0, `${command} ${args.join(" ")}\n${result.error?.message ?? ""}\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
function cli(...args) { return run(client, args); }
function checkInstalledMcp(command, args, cwd, serverEnv = {}) {
  const messages = [
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "buildable-smoke", version: "1" } } },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "buildable_plan", arguments: { prompt: "Build a CRM", workspace, noWrite: true } } }
  ];
  const responses = run(command, args, { cwd, env: { ...env, ...serverEnv }, input: messages.map(JSON.stringify).join("\n") + "\n" }).trim().split("\n").map(JSON.parse);
  assert.ok(responses.find(response => response.id === 2)?.result?.tools.some(tool => tool.name === "buildable_plan"));
  const plan = responses.find(response => response.id === 3)?.result;
  assert.equal(plan?.isError, false);
  assert.equal(plan.structuredContent.result.appSpec.archetype, "crm");
}
async function checkCodexDiscovery() {
  const child = spawn("codex", ["app-server", "--stdio"], { cwd: workspace, env, stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map();
  let id = 0;
  let errors = "";
  child.stderr.on("data", chunk => { errors = (errors + chunk).slice(-4000); });
  const lines = createInterface({ input: child.stdout });
  lines.on("line", line => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    pending.get(message.id)?.(message);
  });
  function request(method, params) {
    return new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`${method} timed out: ${errors}`)); }, 45000);
      pending.set(requestId, message => {
        clearTimeout(timer); pending.delete(requestId);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      });
      child.stdin.write(JSON.stringify({ id: requestId, method, params }) + "\n");
    });
  }
  try {
    await request("initialize", { clientInfo: { name: "buildable-smoke", version: "1" }, capabilities: { experimentalApi: true } });
    child.stdin.write(JSON.stringify({ method: "initialized" }) + "\n");
    const skills = await request("skills/list", { cwds: [workspace], forceReload: true });
    const names = skills.data.flatMap(row => row.skills.map(skill => skill.name));
    for (const name of ["buildable-planner", "buildable-web-builder", "buildable-mobile-builder", "buildable-reviewer"]) assert.ok(names.includes(name) || names.includes(`buildable:${name}`), `Skill not discovered: ${name}; found ${names.join(", ")}`);
    const started = await request("thread/start", { cwd: workspace, ephemeral: true });
    const status = await request("mcpServerStatus/list", { threadId: started.thread.id });
    assert.ok(status.data.some(server => Object.keys(server.tools ?? {}).some(name => name.includes("buildable_plan"))), "Native Codex runtime did not discover Buildable MCP tools");
  } finally {
    lines.close(); child.kill();
    await new Promise(resolve => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      const timer = setTimeout(() => child.kill("SIGKILL"), 5000);
      child.once("exit", () => { clearTimeout(timer); resolve(); });
    });
  }
}

try {
  console.log(`Testing ${cli("--version").trim()} with isolated configs`);
  const packed = JSON.parse(run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", temp], { cwd: root }))[0];
  run("tar", ["-xzf", join(temp, packed.filename), "-C", join(temp, "source")]);
  const source = join(temp, "source", "package");
  cli("plugin", "marketplace", "add", source);
  const install = client === "codex" ? ["add", "buildable@buildable"] : ["install", "buildable@buildable", "--scope", "user"];
  cli("plugin", ...install);
  cli("plugin", ...install);
  console.log("PASS fresh and repeated installation from packed local source");
  if (client === "codex") {
    const listing = JSON.parse(cli("plugin", "list", "--json"));
    assert.ok(listing.installed.some(plugin => plugin.pluginId === "buildable@buildable" && plugin.enabled));
    const servers = JSON.parse(cli("mcp", "list", "--json"));
    const server = servers.find(server => server.name.includes("buildable"));
    assert.ok(server, "Native Codex MCP config missing");
    checkInstalledMcp(server.transport.command, server.transport.args, server.transport.cwd, server.transport.env);
    await checkCodexDiscovery();
    // Codex upgrades Git marketplaces only; local sources are reinstalled.
    const upgrade = spawnSync(client, ["plugin", "marketplace", "upgrade", "buildable"], { cwd: workspace, env, encoding: "utf8", timeout: 60000 });
    assert.equal(upgrade.status, 1);
    assert.match(upgrade.stderr, /not configured as a Git marketplace/);
    console.log("PASS Codex rejects Git-only upgrade for a local marketplace");
    cli("plugin", ...install);
    cli("plugin", "remove", "buildable@buildable");
    assert.ok(!JSON.parse(cli("plugin", "list", "--json")).installed.some(plugin => plugin.pluginId === "buildable@buildable"));
  } else {
    const installed = JSON.parse(cli("plugin", "list", "--json")).find(plugin => plugin.id === "buildable@buildable");
    assert.ok(installed?.enabled);
    const details = cli("plugin", "details", "buildable@buildable");
    assert.match(details, /buildable-plan/);
    assert.match(cli("mcp", "list"), /buildable.*Connected/);
    const config = installed.mcpServers.buildable;
    checkInstalledMcp(config.command, config.args.map(arg => arg.replaceAll("${CLAUDE_PLUGIN_ROOT}", installed.installPath)), workspace, config.env);
    cli("plugin", "marketplace", "update", "buildable");
    cli("plugin", "update", "buildable@buildable", "--scope", "user");
    cli("plugin", "uninstall", "buildable@buildable", "--scope", "user");
    assert.ok(!JSON.parse(cli("plugin", "list", "--json")).some(plugin => plugin.id === "buildable@buildable"));
  }
  console.log(`PASS native discovery, installed MCP plan call, ${client === "claude" ? "same-version refresh" : "local reinstall"} and uninstall`);
  cli("plugin", "marketplace", "remove", "buildable");
  assert.equal(readFileSync(join(workspace, "user-owned.txt"), "utf8"), "keep");
  console.log("PASS user-owned sentinel preserved (no UI or host-model evaluation)");
} catch (error) {
  console.error(`Native installation smoke failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
