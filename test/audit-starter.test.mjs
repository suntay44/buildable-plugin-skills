import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = fileURLToPath(new URL("../scripts/audit-starter.mjs", import.meta.url));
function audit(t, report, exitCode = 1) {
  const dir = mkdtempSync(join(tmpdir(), "buildable audit report "));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, "bin"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: { next: "16.2.12" } }));
  writeFileSync(join(dir, "report.json"), JSON.stringify(report));
  writeFileSync(join(dir, "bin/npm"), `#!/usr/bin/env node\nprocess.stdout.write(require('node:fs').readFileSync(process.env.AUDIT_REPORT)); process.exit(Number(process.env.AUDIT_EXIT));\n`, { mode: 0o755 });
  return spawnSync(process.execPath, [script, dir], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${join(dir, "bin")}:${process.env.PATH}`, AUDIT_REPORT: join(dir, "report.json"), AUDIT_EXIT: String(exitCode) }
  });
}

test("production audit rejects new critical and previously excepted high advisories", t => {
  const result = audit(t, { vulnerabilities: {
    next: { severity: "critical", via: [
      { severity: "critical", title: "Image optimization RCE", url: "https://github.com/advisories/GHSA-2xp9-vwfh-vxw4" },
      "postcss"
    ] },
    postcss: { severity: "high", via: [{ severity: "high", title: "Former exception", url: "https://github.com/advisories/GHSA-qx2v-qp2m-jg93" }] }
  } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Image optimization RCE/);
  assert.match(result.stderr, /Former exception/);
  assert.doesNotMatch(result.stdout, /passed/);
});

test("production audit fails closed on npm errors and incomplete reports", t => {
  for (const report of [{ error: { code: "ENOAUDIT", summary: "Registry audit endpoint unavailable" } }, {}, null]) {
    const result = audit(t, report);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /did not return a vulnerability report/);
    assert.doesNotMatch(result.stdout, /passed/);
  }
});

test("production audit allows a clean report and lower-severity findings", t => {
  assert.equal(audit(t, { vulnerabilities: {} }, 0).status, 0);
  const result = audit(t, { vulnerabilities: { example: { severity: "moderate", via: [] } } });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /no high or critical advisories/);
});
