import { existsSync, statSync } from "node:fs";
import { basename, extname, isAbsolute, join } from "node:path";

export function arrayValue(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export function referenceKindFor(filePath, forcedKind = null) {
  if (forcedKind) return forcedKind;
  const extension = extname(filePath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".heic"].includes(extension)) return "image";
  if ([".pdf", ".doc", ".docx", ".md", ".txt", ".csv", ".json", ".yaml", ".yml"].includes(extension)) return "document";
  if ([".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".swift", ".kt", ".java", ".py"].includes(extension)) return "source";
  return "file";
}

export function referenceInstructionFor(kind) {
  if (kind === "screenshot" || kind === "image") {
    return "Inspect visually and extract layout, hierarchy, content, components, colors, density, and interaction clues before design/build. Do not invent unseen details.";
  }
  if (kind === "document") {
    return "Read only the relevant sections and extract requirements, content, constraints, and domain language before design/build.";
  }
  if (kind === "source") {
    return "Inspect only the relevant files or symbols needed to preserve existing patterns before design/build.";
  }
  return "Inspect only the relevant parts needed to honor this user-provided reference.";
}

export function referenceInputsFromArgs(args, cwd = process.cwd()) {
  const candidates = [
    ...arrayValue(args.values.file).map((value) => ({ value, forcedKind: null })),
    ...arrayValue(args.values.reference).map((value) => ({ value, forcedKind: null })),
    ...arrayValue(args.values.screenshot).map((value) => ({ value, forcedKind: "screenshot" }))
  ];

  const seen = new Set();
  return candidates
    .filter(({ value }) => typeof value === "string" && value.trim() !== "")
    .map(({ value, forcedKind }) => {
      const inputPath = value.trim();
      const absolutePath = isAbsolute(inputPath) ? inputPath : join(cwd, inputPath);
      const exists = existsSync(absolutePath);
      const kind = referenceKindFor(inputPath, forcedKind);
      const stat = exists ? statSync(absolutePath) : null;
      return {
        path: inputPath,
        absolutePath,
        name: basename(inputPath),
        kind,
        exists,
        sizeBytes: stat?.isFile() ? stat.size : null,
        inspectInstruction: referenceInstructionFor(kind)
      };
    })
    .filter((entry) => {
      const key = entry.absolutePath;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
