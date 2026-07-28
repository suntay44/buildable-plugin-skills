#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const starter = resolve(process.argv[2] ?? ".");
const packageJson = JSON.parse(readFileSync(resolve(starter, "package.json"), "utf8"));
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

// Next 16.2.12 currently bundles PostCSS 8.4.31 and installs Sharp 0.34.x.
// Stable Next has no patched release yet, so keep this narrow, time-bounded
// exception visible while failing every other high/critical production finding.
const nextStableException = {
  next: "16.2.12",
  expires: "2026-10-31",
  packages: new Set(["next", "postcss", "sharp"]),
  advisories: new Set([
    "https://github.com/advisories/GHSA-qx2v-qp2m-jg93",
    "https://github.com/advisories/GHSA-6g55-p6wh-862q",
    "https://github.com/advisories/GHSA-r28c-9q8g-f849",
    "https://github.com/advisories/GHSA-f88m-g3jw-g9cj"
  ])
};

const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  cwd: starter,
  encoding: "utf8"
});

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || result.stdout || "npm audit did not return JSON");
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};

function resolveAdvisories(packageName, seen = new Set()) {
  if (seen.has(packageName)) return [];
  seen.add(packageName);
  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability) return [];

  const resolved = [];
  for (const advisory of vulnerability.via ?? []) {
    if (typeof advisory === "string") {
      resolved.push(...resolveAdvisories(advisory, seen));
    } else if (severityRank[advisory.severity] >= severityRank.high) {
      resolved.push(advisory);
    }
  }
  return resolved;
}

const findings = [];
const findingKeys = new Set();
for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
  if (severityRank[vulnerability.severity] < severityRank.high) continue;
  const advisories = resolveAdvisories(packageName);
  if (advisories.length === 0) {
    findings.push({
      package: packageName,
      severity: vulnerability.severity,
      title: "High-severity vulnerability without resolvable advisory metadata",
      url: null
    });
    continue;
  }
  for (const advisory of advisories) {
    const key = `${packageName}:${advisory.url}`;
    if (findingKeys.has(key)) continue;
    findingKeys.add(key);
    findings.push({
      package: packageName,
      severity: advisory.severity,
      title: advisory.title,
      url: advisory.url
    });
  }
}

const hasPinnedNext = packageJson.dependencies?.next === nextStableException.next;
const exceptionCurrent = new Date() <= new Date(`${nextStableException.expires}T23:59:59Z`);
const allowed = [];
const blocked = [];

for (const finding of findings) {
  if (
    hasPinnedNext &&
    exceptionCurrent &&
    nextStableException.packages.has(finding.package) &&
    nextStableException.advisories.has(finding.url)
  ) {
    allowed.push(finding);
  } else {
    blocked.push(finding);
  }
}

if (blocked.length > 0) {
  console.error(`Starter production audit failed with ${blocked.length} unexpected high/critical advisory finding(s):`);
  for (const finding of blocked) {
    console.error(`  - [${finding.severity}] ${finding.package}: ${finding.title} (${finding.url})`);
  }
  process.exit(1);
}

if (allowed.length > 0) {
  console.warn(
    `Starter production audit passed with ${allowed.length} reviewed Next ${nextStableException.next} advisory exception(s); ` +
      `exception expires ${nextStableException.expires}.`
  );
} else {
  console.log("Starter production audit passed with no high or critical advisories.");
}
