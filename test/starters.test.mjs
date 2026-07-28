import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function runnableStarters(target) {
  const base = join(root, "templates", target);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `templates/${target}/${entry.name}`)
    .filter((dir) => existsSync(join(root, dir, "template-spec.json")))
    .map((dir) => ({ dir, spec: readJson(`${dir}/template-spec.json`) }))
    .filter((entry) => entry.spec.status === "runnable" && entry.spec.starter)
    .map((entry) => entry.spec.starter);
}

const webStarters = runnableStarters("web");
const mobileStarters = runnableStarters("mobile");

test("runnable web starters exist and were discovered", () => {
  assert.ok(webStarters.length >= 4, `expected >= 4 web starters, found ${webStarters.length}`);
});

test("web starters use the supported Next, React, and Tailwind contracts", () => {
  for (const starter of webStarters) {
    const pkg = readJson(`${starter}/package.json`);
    const tailwind = pkg.devDependencies?.tailwindcss ?? "";
    assert.match(pkg.dependencies?.next ?? "", /^16\./, `${starter} must use supported Next 16`);
    assert.match(pkg.dependencies?.react ?? "", /^19\./, `${starter} must use React 19`);
    assert.match(tailwind, /^4\./, `${starter} must pin exact tailwindcss v4, got "${tailwind}"`);

    for (const section of ["dependencies", "devDependencies"]) {
      for (const [name, version] of Object.entries(pkg[section] ?? {})) {
        assert.notEqual(version, "latest", `${starter} must pin ${name}, not "latest"`);
        assert.doesNotMatch(version, /^\^/, `${starter} must avoid caret ranges for ${name}, got "${version}"`);
      }
    }

    const postcss = read(`${starter}/postcss.config.js`);
    assert.match(postcss, /@tailwindcss\/postcss/, `${starter} postcss must use the v4 PostCSS plugin`);

    const globals = read(`${starter}/app/globals.css`);
    assert.match(globals, /@import ["']tailwindcss["']/, `${starter} globals.css must use the v4 CSS import`);
    assert.match(globals, /@config ["']\.\.\/tailwind\.config\.js["']/, `${starter} must load its legacy theme tokens`);
    assert.equal(pkg.scripts?.lint, "eslint .", `${starter} must not use the removed next lint command`);
  }
});

test("web starter tsconfig avoids deprecated-to-error options", () => {
  for (const starter of webStarters) {
    const tsconfig = readJson(`${starter}/tsconfig.json`);
    const target = String(tsconfig.compilerOptions?.target ?? "").toLowerCase();
    // es5 target and baseUrl now error on current TypeScript and break `tsc`.
    assert.notEqual(target, "es5", `${starter} tsconfig target must not be es5`);
    assert.equal(tsconfig.compilerOptions?.baseUrl, undefined, `${starter} tsconfig must not set baseUrl`);
    assert.ok(tsconfig.compilerOptions?.paths?.["@/*"], `${starter} should keep the @/* path alias`);
  }
});

test("web starters share identical framework config (no drift)", () => {
  const canonical = "templates/web/task-manager/starter";
  const sharedFiles = [
    "tsconfig.json",
    "postcss.config.js",
    "next.config.js",
    "next-env.d.ts",
    "eslint.config.mjs",
    "app/globals.css",
    "tailwind.config.js"
  ];

  for (const file of sharedFiles) {
    const expected = read(`${canonical}/${file}`);
    for (const starter of webStarters) {
      assert.equal(read(`${starter}/${file}`), expected, `${starter}/${file} drifted from ${canonical}; run npm run sync:starters`);
    }
  }
});

test("all plugin manifests share the package version", () => {
  const version = readJson("package.json").version;
  assert.match(version, /^\d+\.\d+\.\d+$/, "package version is semver");
  assert.equal(readJson(".claude-plugin/plugin.json").version, version, "claude plugin version");
  assert.equal(readJson(".codex-plugin/plugin.json").version, version, "codex plugin version");

  const marketplace = readJson(".claude-plugin/marketplace.json");
  assert.equal(marketplace.metadata.version, version, "marketplace metadata version");
  for (const plugin of marketplace.plugins) {
    assert.equal(plugin.version, version, `marketplace plugin ${plugin.name} version`);
  }
});

test("mobile starters pin NativeWind exactly and keep the className augmentation", () => {
  assert.ok(mobileStarters.length >= 1, "expected at least one runnable mobile starter");

  for (const starter of mobileStarters) {
    const pkg = readJson(`${starter}/package.json`);
    const nativewind = pkg.dependencies?.nativewind ?? "";
    assert.equal(pkg.dependencies?.expo, "~57.0.8", `${starter} must track Expo SDK 57`);
    assert.match(pkg.dependencies?.reactNative ?? pkg.dependencies?.["react-native"] ?? "", /^0\.86\./);
    assert.match(nativewind, /^4\.2\.\d+$/, `${starter} must pin an exact NativeWind 4.2.x, got "${nativewind}"`);

    const envTypes = read(`${starter}/nativewind-env.d.ts`);
    assert.match(envTypes, /declare module ["']react-native["']/, `${starter} needs a self-contained className augmentation`);
    assert.match(envTypes, /className\?: string/, `${starter} augmentation must declare className`);

    const tailwind = pkg.devDependencies?.tailwindcss ?? "";
    assert.match(tailwind, /^3\./, `${starter} must pin exact tailwindcss v3, got "${tailwind}"`);

    for (const section of ["dependencies", "devDependencies"]) {
      for (const [name, version] of Object.entries(pkg[section] ?? {})) {
        assert.notEqual(version, "latest", `${starter} must pin ${name}, not "latest"`);
        assert.doesNotMatch(version, /^\^/, `${starter} must avoid caret ranges for ${name}, got "${version}"`);
      }
    }
  }
});

test("mobile starter fragments import React for Expo typecheck", () => {
  for (const starter of mobileStarters) {
    const appEntry = `${starter}/app/index.tsx`;
    const source = read(appEntry);
    if (source.includes("<>") || source.includes("<React.Fragment")) {
      assert.match(
        source,
        /^import React(?:,|\s+from)/m,
        `${appEntry} uses a JSX fragment and must import React for Expo's typecheck`
      );
    }
  }
});

test("mobile starters share their Expo and NativeWind framework config", () => {
  const canonical = "templates/mobile/task-manager/starter";
  const sharedFiles = [
    "nativewind-env.d.ts",
    "styles.d.ts",
    "tsconfig.json",
    "babel.config.js",
    "metro.config.js",
    "global.css",
    "tailwind.config.js"
  ];

  for (const file of sharedFiles) {
    const expected = read(`${canonical}/${file}`);
    for (const starter of mobileStarters) {
      assert.equal(read(`${starter}/${file}`), expected, `${starter}/${file} drifted from ${canonical}`);
    }
  }
});
