import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function metadata(path) {
  try {
    const stat = statSync(path);
    return { exists: true, size: stat.size, mtimeMs: stat.mtimeMs };
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return { exists: false };
    throw error;
  }
}

// Fingerprint selected bundled guidance only. Never read user attachment contents.
export function planProvenance(root, version, spec) {
  const hash = createHash("sha256");
  for (const path of [...new Set([spec.template, ...spec.references])].sort()) {
    hash.update(path).update("\0");
    try { hash.update(readFileSync(join(root, path))); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      hash.update("<missing>");
    }
    hash.update("\0");
  }
  return {
    version,
    guidanceHash: hash.digest("hex"),
    inputs: (spec.referenceInputs ?? []).map(input => ({ path: input.absolutePath, ...metadata(input.absolutePath) }))
  };
}

export function provenanceWarnings(previous, current) {
  // Legacy plans remain reusable without inventing a historical baseline.
  if (!previous) return [];
  const warnings = [];
  if (previous.version !== current.version) warnings.push(`Buildable changed (${previous.version} → ${current.version}).`);
  if (previous.guidanceHash !== current.guidanceHash) warnings.push("Selected template or bundled guidance changed.");
  const oldInputs = new Map((previous.inputs ?? []).map(input => [input.path, input]));
  for (const input of current.inputs) {
    if (JSON.stringify(oldInputs.get(input.path)) !== JSON.stringify(input)) warnings.push(`Reference changed: ${input.path}.`);
    oldInputs.delete(input.path);
  }
  for (const path of oldInputs.keys()) warnings.push(`Reference removed from plan: ${path}.`);
  return warnings;
}
