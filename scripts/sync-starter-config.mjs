#!/usr/bin/env node
// Keep the shared, framework-level config identical across every runnable web
// starter. The web task-manager starter is the single source of truth; the other
// web starters must match it byte-for-byte for these files.
//
//   node scripts/sync-starter-config.mjs           # write canonical config into each starter
//   node scripts/sync-starter-config.mjs --check    # verify parity (exit 1 on drift), for CI
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const canonical = "templates/web/task-manager/starter";
const targets = [
  "templates/web/crm/starter",
  "templates/web/dashboard/starter",
  "templates/web/marketplace/starter",
  "templates/web/notes/starter",
  "templates/web/ecommerce-admin/starter",
  "templates/web/landing-page/starter",
  "templates/web/portfolio/starter",
  "templates/web/blog-cms/starter",
  "templates/web/recipe-app/starter",
  "templates/web/job-board/starter",
  "templates/web/inventory-manager/starter"
];
const sharedFiles = ["tsconfig.json", "postcss.config.js", "next.config.js", "next-env.d.ts"];

const checkOnly = process.argv.includes("--check");
const drift = [];
let written = 0;

for (const file of sharedFiles) {
  const source = join(root, canonical, file);
  if (!existsSync(source)) {
    console.error(`Canonical file missing: ${canonical}/${file}`);
    process.exit(1);
  }
  const expected = readFileSync(source, "utf8");

  for (const target of targets) {
    const targetPath = join(root, target, file);
    const actual = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : null;
    if (actual === expected) continue;

    if (checkOnly) {
      drift.push(`${target}/${file}`);
    } else {
      writeFileSync(targetPath, expected);
      written += 1;
    }
  }
}

if (checkOnly) {
  if (drift.length > 0) {
    console.error("Starter config drift detected. Run `npm run sync:starters` to fix:");
    for (const path of drift) console.error(`  - ${path}`);
    process.exit(1);
  }
  console.log(`Starter config in sync across ${targets.length} web starters (${sharedFiles.length} shared files).`);
} else {
  console.log(written === 0 ? "Starter config already in sync." : `Synced ${written} starter config file(s) from ${canonical}.`);
}
