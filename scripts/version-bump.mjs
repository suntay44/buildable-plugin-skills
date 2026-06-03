#!/usr/bin/env node
// Bump (or verify) the Buildable version across every manifest in one place.
//
//   node scripts/version-bump.mjs patch|minor|major   # bump and sync all manifests + CHANGELOG
//   node scripts/version-bump.mjs --set 1.2.3          # set an explicit version
//   node scripts/version-bump.mjs --check              # verify all manifests share package.json's version (CI)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Each target: file path + the JSON paths within it that hold a version string.
const targets = [
  { file: "package.json", paths: [["version"]] },
  { file: ".claude-plugin/plugin.json", paths: [["version"]] },
  { file: ".claude-plugin/marketplace.json", paths: [["metadata", "version"], ["plugins", 0, "version"]] },
  { file: ".codex-plugin/plugin.json", paths: [["version"]] }
];

function readJson(file) {
  return JSON.parse(readFileSync(join(root, file), "utf8"));
}

function getAt(object, path) {
  return path.reduce((node, key) => (node == null ? node : node[key]), object);
}

function setAt(object, path, value) {
  const last = path[path.length - 1];
  const parent = path.slice(0, -1).reduce((node, key) => node[key], object);
  parent[last] = value;
}

function currentVersion() {
  return readJson("package.json").version;
}

function bump(version, kind) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Cannot parse semver: ${version}`);
  let [major, minor, patch] = match.slice(1).map(Number);
  if (kind === "major") [major, minor, patch] = [major + 1, 0, 0];
  else if (kind === "minor") [minor, patch] = [minor + 1, 0];
  else if (kind === "patch") patch += 1;
  else throw new Error(`Unknown bump kind: ${kind}`);
  return `${major}.${minor}.${patch}`;
}

function collectVersions() {
  const found = [];
  for (const target of targets) {
    const object = readJson(target.file);
    for (const path of target.paths) {
      found.push({ label: `${target.file} (${path.join(".")})`, version: getAt(object, path) });
    }
  }
  return found;
}

const args = process.argv.slice(2);

if (args.includes("--check")) {
  const expected = currentVersion();
  const drift = collectVersions().filter((entry) => entry.version !== expected);
  if (drift.length > 0) {
    console.error(`Version drift from package.json (${expected}):`);
    for (const entry of drift) console.error(`  - ${entry.label}: ${entry.version}`);
    process.exit(1);
  }
  console.log(`All manifests are at v${expected}.`);
  process.exit(0);
}

const setIndex = args.indexOf("--set");
const nextVersion = setIndex !== -1 ? args[setIndex + 1] : bump(currentVersion(), args[0]);
if (!/^\d+\.\d+\.\d+$/.test(nextVersion ?? "")) {
  console.error("Usage: version-bump.mjs <patch|minor|major> | --set <x.y.z> | --check");
  process.exit(1);
}

for (const target of targets) {
  const object = readJson(target.file);
  for (const path of target.paths) setAt(object, path, nextVersion);
  writeFileSync(join(root, target.file), `${JSON.stringify(object, null, 2)}\n`);
}

// Move the CHANGELOG "Unreleased" section into a dated release heading.
const changelogPath = join(root, "CHANGELOG.md");
if (existsSync(changelogPath)) {
  const today = new Date().toISOString().slice(0, 10);
  let changelog = readFileSync(changelogPath, "utf8");
  if (changelog.includes("## [Unreleased]")) {
    changelog = changelog.replace("## [Unreleased]", `## [Unreleased]\n\n## [${nextVersion}] - ${today}`);
    writeFileSync(changelogPath, changelog);
  }
}

console.log(`Bumped Buildable to v${nextVersion} across ${targets.length} manifests.`);
console.log("Next: review CHANGELOG.md, commit, then tag with `git tag v" + nextVersion + "`.");
