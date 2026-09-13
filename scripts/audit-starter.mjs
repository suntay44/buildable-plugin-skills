#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const starter = resolve(process.argv[2] ?? ".");
// Require a package in this directory so npm cannot audit an ancestor project.
try {
  JSON.parse(readFileSync(resolve(starter, "package.json"), "utf8"));
} catch (error) {
  console.error(`Cannot audit starter at ${starter}: ${error.message}`);
  process.exit(1);
}
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  cwd: starter,
  encoding: "utf8",
  timeout: 60000
});

if (result.error || ![0, 1].includes(result.status)) {
  console.error(`npm audit could not complete: ${result.error?.message || result.stderr || `exit ${result.status}`}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || result.stdout || "npm audit did not return JSON");
  process.exit(1);
}

if (report?.error || !report?.vulnerabilities || typeof report.vulnerabilities !== "object" || Array.isArray(report.vulnerabilities)) {
  console.error(`npm audit did not return a vulnerability report: ${report?.error?.summary || report?.error?.code || result.stderr || "missing vulnerabilities object"}`);
  process.exit(1);
}
const vulnerabilities = report.vulnerabilities;

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

if (findings.length > 0) {
  console.error(`Starter production audit failed with ${findings.length} high/critical advisory finding(s):`);
  for (const finding of findings) {
    console.error(`  - [${finding.severity}] ${finding.package}: ${finding.title} (${finding.url})`);
  }
  process.exit(1);
}

console.log("Starter production audit passed with no high or critical advisories.");
