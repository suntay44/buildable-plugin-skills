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

test("web starters pin Tailwind v3 and avoid the v4 PostCSS break", () => {
  for (const starter of webStarters) {
    const pkg = readJson(`${starter}/package.json`);
    const tailwind = pkg.devDependencies?.tailwindcss ?? "";
    // Tailwind v4 moved its PostCSS plugin and config model, which breaks the
    // @tailwind directives + tailwind.config.ts these starters use.
    assert.match(tailwind, /^[\^~]?3\./, `${starter} must pin tailwindcss v3, got "${tailwind}"`);

    for (const dep of ["typescript", "postcss", "autoprefixer"]) {
      assert.notEqual(pkg.devDependencies?.[dep], "latest", `${starter} must pin ${dep}, not "latest"`);
    }

    const postcss = read(`${starter}/postcss.config.js`);
    assert.match(postcss, /tailwindcss:/, `${starter} postcss must use the v3 tailwindcss plugin`);
    assert.doesNotMatch(postcss, /@tailwindcss\/postcss/, `${starter} must not use the v4 PostCSS plugin`);

    const globals = read(`${starter}/app/globals.css`);
    assert.match(globals, /@tailwind base;/, `${starter} globals.css must use v3 @tailwind directives`);
    assert.doesNotMatch(globals, /@import ["']tailwindcss["']/, `${starter} must not use the v4 CSS import`);
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
  const sharedFiles = ["tsconfig.json", "postcss.config.js", "next.config.js", "next-env.d.ts"];

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
    // NativeWind 4.2.x's transitive type package does not hoist on a clean install,
    // so the documented reference leaves className untyped. Pin the known-good build.
    assert.match(nativewind, /^4\.1\.\d+$/, `${starter} must pin an exact NativeWind 4.1.x, got "${nativewind}"`);

    const envTypes = read(`${starter}/nativewind-env.d.ts`);
    assert.match(envTypes, /declare module ["']react-native["']/, `${starter} needs a self-contained className augmentation`);
    assert.match(envTypes, /className\?: string/, `${starter} augmentation must declare className`);

    const tailwind = pkg.devDependencies?.tailwindcss ?? "";
    assert.match(tailwind, /^[\^~]?3\./, `${starter} must pin tailwindcss v3, got "${tailwind}"`);
  }
});
