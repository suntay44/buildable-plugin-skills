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
const webTargets = [
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
const sharedFiles = [
  "tsconfig.json",
  "postcss.config.js",
  "next.config.js",
  "next-env.d.ts",
  "eslint.config.mjs",
  "app/globals.css",
  "tailwind.config.js"
];
const packageSections = ["scripts", "dependencies", "devDependencies", "overrides"];
const mobileCanonical = "templates/mobile/task-manager/starter";
const mobileTargets = [
  "templates/mobile/habit-tracker/starter",
  "templates/mobile/booking/starter"
];
const mobileSharedFiles = [
  "nativewind-env.d.ts",
  "styles.d.ts",
  "tsconfig.json",
  "babel.config.js",
  "metro.config.js",
  "global.css",
  "tailwind.config.js"
];

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

  for (const target of webTargets) {
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

for (const file of mobileSharedFiles) {
  const source = join(root, mobileCanonical, file);
  const expected = readFileSync(source, "utf8");

  for (const target of mobileTargets) {
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

function syncPackageContract(sourceDir, targetDirs) {
  const sourcePath = join(root, sourceDir, "package.json");
  const sourcePackage = JSON.parse(readFileSync(sourcePath, "utf8"));

  for (const target of targetDirs) {
    const targetPath = join(root, target, "package.json");
    const targetPackage = JSON.parse(readFileSync(targetPath, "utf8"));
    const expectedPackage = { ...targetPackage };
    for (const section of packageSections) expectedPackage[section] = sourcePackage[section];
    const expected = `${JSON.stringify(expectedPackage, null, 2)}\n`;
    const actual = readFileSync(targetPath, "utf8");
    if (actual === expected) continue;

    if (checkOnly) {
      drift.push(`${target}/package.json`);
    } else {
      writeFileSync(targetPath, expected);
      written += 1;
    }
  }
}

syncPackageContract(canonical, webTargets);
syncPackageContract(mobileCanonical, mobileTargets);

if (checkOnly) {
  if (drift.length > 0) {
    console.error("Starter config drift detected. Run `npm run sync:starters` to fix:");
    for (const path of drift) console.error(`  - ${path}`);
    process.exit(1);
  }
  console.log(
    `Starter config in sync across ${webTargets.length + 1} web and ${mobileTargets.length + 1} mobile starters.`
  );
} else {
  console.log(written === 0 ? "Starter config already in sync." : `Synced ${written} starter config file(s) from ${canonical}.`);
}
