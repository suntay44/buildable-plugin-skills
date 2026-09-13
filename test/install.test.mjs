import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
function sandbox(t) {
  const dir = mkdtempSync(join(tmpdir(), 'buildable install test '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ['home', 'app', 'prefix', 'cache']) mkdirSync(join(dir, name));
  writeFileSync(join(dir, 'npmrc'), '');
  const env = { ...process.env, HOME: join(dir, 'home'), npm_config_cache: join(dir, 'cache'),
    npm_config_userconfig: join(dir, 'npmrc'), npm_config_prefix: join(dir, 'prefix') };
  delete env.BUILDABLE_WORKSPACE;
  delete env.BUILDABLE_REQUIRE_WORKSPACE;
  return { dir, env, app: join(dir, 'app') };
}
function run(command, args, cwd, env, extra = {}) {
  return spawnSync(command, args, { cwd, env, encoding: 'utf8', timeout: 60000, ...extra });
}
function success(result) {
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result.stdout;
}
function rpc(script, cwd, env, name, args = {}) {
  const messages = [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'install-test', version: '1' } } },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name, arguments: args } }
  ];
  const output = success(run(process.execPath, [script], cwd, env, { input: messages.map(JSON.stringify).join('\n') + '\n' }));
  return output.trim().split('\n').map(JSON.parse).find(x => x.id === 2);
}

test('actual npm package installs globally and locally with scripts, references, and MCP intact', t => {
  const { dir, env, app } = sandbox(t);
  const packed = JSON.parse(success(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', dir], root, env)))[0];
  const tarball = join(dir, packed.filename);
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'user-app', private: true, scripts: { keep: 'echo user-owned' } }));
  for (const global of [false, true]) {
    success(run('npm', ['install', ...(global ? ['--global'] : ['--save-dev']), '--ignore-scripts', '--no-audit', '--no-fund', tarball], app, env));
    const packageRoot = global ? join(dir, 'prefix/lib/node_modules/@buildable/local-builder') : join(app, 'node_modules/@buildable/local-builder');
    const cli = join(packageRoot, 'bin/buildable.mjs');
    const checked = JSON.parse(success(run(process.execPath, [cli, 'check', '--json'], app, env)));
    assert.equal(checked.ok, true);
    const plan = JSON.parse(success(run(process.execPath, [cli, 'plan', 'Build me a CRM', '--compact', '--no-write'], app, env)));
    for (const ref of plan.appSpec.references) assert.ok(readFileSync(join(packageRoot, ref)).length, ref);
    const result = rpc(join(packageRoot, 'bin/buildable-mcp.mjs'), app, env, 'buildable_plan', { prompt: 'Build me a CRM', noWrite: true });
    assert.equal(result.result.isError, false);
    assert.equal(result.result.structuredContent.result.appSpec.archetype, 'crm');
    const out = join(dir, global ? 'global generated app' : 'local generated app');
    success(run(process.execPath, [cli, 'generate', 'Build me a todo app', '--out', out], app, env));
    assert.ok(existsSync(join(out, 'package.json')));
    writeFileSync(join(out, 'user-owned.txt'), 'keep');
    const refused = run(process.execPath, [cli, 'generate', 'Build me a CRM', '--out', out], app, env);
    assert.notEqual(refused.status, 0);
    assert.equal(readFileSync(join(out, 'user-owned.txt'), 'utf8'), 'keep');
    success(run('npm', ['uninstall', ...(global ? ['--global'] : ['--save-dev']), '--ignore-scripts', '--no-audit', '--no-fund', '@buildable/local-builder'], app, env));
    assert.ok(!existsSync(packageRoot));
  }
  assert.equal(JSON.parse(readFileSync(join(app, 'package.json'))).scripts.keep, 'echo user-owned');
});

test('platform MCP configs launch real bundled scripts and Codex requires an app workspace', t => {
  const { dir, env, app } = sandbox(t);
  const claude = JSON.parse(readFileSync(join(root, '.mcp.json'))).mcpServers.buildable;
  // Emulate only the documented path substitution; client integration is audited separately.
  const claudeScript = claude.args[0].replace('${CLAUDE_PLUGIN_ROOT}', root.replace(/\/$/, ''));
  assert.equal(rpc(claudeScript, app, env, 'buildable_status').result.isError, false);
  const codex = JSON.parse(readFileSync(join(root, '.codex-plugin/mcp.json'))).buildable;
  const cwd = join(root, codex.cwd);
  const codexEnv = { ...env, ...codex.env };
  const missing = rpc(join(cwd, codex.args[0]), cwd, codexEnv, 'buildable_plan', { prompt: 'Build me a CRM' });
  assert.ok(missing.error);
  assert.match(missing.error.message, /workspace/);
  const relative = rpc(join(cwd, codex.args[0]), cwd, codexEnv, 'buildable_plan', { prompt: 'Build me a CRM', workspace: '.' });
  assert.ok(relative.error);
  assert.match(relative.error.message, /absolute/);
  const planned = rpc(join(cwd, codex.args[0]), cwd, codexEnv, 'buildable_plan', { prompt: 'Build me a CRM', workspace: app });
  assert.equal(planned.result.isError, false);
  assert.ok(existsSync(join(app, '.buildable/phase-plan.json')));
  assert.equal(rpc(join(cwd, codex.args[0]), cwd, codexEnv, 'buildable_check').result.isError, false);
});

test('command fallback preserves an installed CLI failure and uses the bundle only when absent', t => {
  const { dir, env, app } = sandbox(t);
  const bin = join(dir, 'fake bin'); mkdirSync(bin);
  const fake = join(bin, 'buildable');
  writeFileSync(fake, '#!/bin/sh\necho intentional-failure >&2\nexit 42\n', { mode: 0o755 });
  symlinkSync(process.execPath, join(bin, 'node'));
  for (const folder of ['commands', '.cursor/commands']) {
    const snippet = readFileSync(join(root, folder, 'buildable-status.md'), 'utf8').match(/```bash\n([\s\S]*?)\n\s*```/)[1];
    const commandEnv = { ...env, PATH: bin, CLAUDE_PLUGIN_ROOT: root, BUILDABLE_ROOT: root, ARGUMENTS: '.' };
    const failed = run('/bin/bash', ['-c', snippet], app, commandEnv);
    assert.equal(failed.status, 42);
    assert.match(failed.stderr, /intentional-failure/);
    assert.equal(failed.stdout, '');
    rmSync(fake);
    assert.match(success(run('/bin/bash', ['-c', snippet], app, commandEnv)), /Buildable workspace status/);
    writeFileSync(fake, '#!/bin/sh\necho intentional-failure >&2\nexit 42\n', { mode: 0o755 });
  }
});
