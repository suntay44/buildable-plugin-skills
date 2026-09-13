import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planProvenance, provenanceWarnings } from "../core/plan-provenance.mjs";

test("provenance tracks only selected guidance and explicit input metadata", t => {
  const root = mkdtempSync(join(tmpdir(), "buildable provenance "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "template.json"), "{}");
  writeFileSync(join(root, "selected.md"), "Selected guidance");
  const spec = { template: "template.json", references: ["selected.md"], referenceInputs: [{ absolutePath: join(root, "brief.md") }] };
  const original = planProvenance(root, "1", spec);
  assert.deepEqual(provenanceWarnings(original, planProvenance(root, "1", spec)), []);
  writeFileSync(join(root, "unrelated.md"), "Unrelated changes");
  assert.deepEqual(planProvenance(root, "1", spec), original);
  writeFileSync(join(root, "selected.md"), "Changed selected guidance");
  assert.match(provenanceWarnings(original, planProvenance(root, "1", spec)).join(" "), /bundled guidance changed/);
  writeFileSync(join(root, "brief.md"), "New explicit input");
  const current = planProvenance(root, "1", spec);
  assert.match(provenanceWarnings(original, current).join(" "), /Reference changed/);
  assert.deepEqual(provenanceWarnings(undefined, current), []);
  assert.ok(!JSON.stringify(current).includes("New explicit input"));
});
