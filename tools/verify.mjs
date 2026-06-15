#!/usr/bin/env node
/**
 * Portable Soul bundle verifier — tiered conformance (Level 0 / 1 / 2).
 * Usage: node verify.mjs <bundle-dir> [--level 0|1|2] [--json]
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { globSync } from "glob";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCHEMAS = path.join(ROOT, "schemas");

const FORBIDDEN_PROVENANCE_KEYS = new Set(["license", "ownership", "data_class"]);
const L0_PROV_FIELDS = ["prov_created_at", "prov_created_by", "prov_source"];
const L1_OKF_PROV_FIELDS = [
  "prov_entity_id",
  "prov_entity_type",
  "prov_content_hash",
  "prov_generated_at",
  "prov_generated_by_activity",
  "prov_generated_by_agent",
  "prov_derived_from",
];
const SOVEREIGNTY_VALUES = new Set(["user_sovereign", "org_proprietary", "portable", "shared_team"]);

function loadSchema(name) {
  const schema = JSON.parse(readFileSync(path.join(SCHEMAS, name), "utf8"));
  delete schema.$schema;
  return schema;
}

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

function sha256Prefixed(data) {
  return `sha256:${sha256Hex(data)}`;
}

function parseArgs(argv) {
  const json = argv.includes("--json");
  const levelIdx = argv.indexOf("--level");
  const level = levelIdx >= 0 ? parseInt(argv[levelIdx + 1], 10) : 0;
  const bundlePath = argv.find(
    (a, i) =>
      !a.startsWith("-") &&
      a !== String(level) &&
      !a.endsWith("verify.mjs") &&
      (levelIdx < 0 || i !== levelIdx + 1),
  );
  return { bundlePath, json, level: Number.isFinite(level) ? level : 0 };
}

function parseMarkdownFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: {}, body: raw };
  return { frontmatter: YAML.parse(raw.slice(4, end)) ?? {}, body: raw.slice(end + 5) };
}

function checkForbiddenProvenance(obj, filePath, results) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_PROVENANCE_KEYS.has(key)) {
      results.push({
        check: "provenance.no-ownership",
        ok: false,
        message: `Forbidden field "${key}" in provenance at ${filePath}`,
      });
    }
    if (typeof obj[key] === "object") checkForbiddenProvenance(obj[key], filePath, results);
  }
}

function runChecks(bundleDir, level) {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);

  const validateManifest = ajv.compile(loadSchema("bundle.manifest.schema.json"));
  const validateAgentMinimal = ajv.compile(loadSchema("agent.manifest.minimal.schema.json"));
  const validateAgentFull = ajv.compile(loadSchema("agent.manifest.schema.json"));
  const validateEntity = ajv.compile(loadSchema("entity.provenance.schema.json"));
  const validateMemory = ajv.compile(loadSchema("memory-graph.schema.json"));

  const results = [];
  const record = (check, ok, message) => results.push({ check, ok, message });

  const manifestPath = path.join(bundleDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    record("manifest.schema", false, "manifest.json not found");
    return results;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    record("manifest.schema", false, `manifest.json parse error: ${e.message}`);
    return results;
  }

  if (validateManifest(manifest)) {
    record("manifest.schema", true, "manifest.json validates");
  } else {
    record("manifest.schema", false, ajv.errorsText(validateManifest.errors));
  }

  const bundleLevel = manifest.conformance_level ?? 0;
  if (bundleLevel < level) {
    record("conformance.level", false, `Bundle declares level ${bundleLevel}, verifying level ${level}`);
  } else {
    record("conformance.level", true, `Bundle level ${bundleLevel} >= verify level ${level}`);
  }

  let integrityOk = true;
  for (const entry of manifest.artifact_index ?? []) {
    const full = path.join(bundleDir, entry.path);
    if (!existsSync(full)) {
      integrityOk = false;
      record("artifact.integrity", false, `Missing artifact: ${entry.path}`);
      continue;
    }
    const data = readFileSync(full);
    if (sha256Hex(data) !== entry.sha256) {
      integrityOk = false;
      record("artifact.integrity", false, `Hash mismatch: ${entry.path}`);
    }
    if (data.length !== entry.bytes) {
      integrityOk = false;
      record("artifact.integrity", false, `Size mismatch: ${entry.path}`);
    }
  }
  if (integrityOk) {
    record("artifact.integrity", true, `All ${manifest.artifact_index?.length ?? 0} artifacts match index`);
  }

  const knowledgeFiles = globSync("knowledge/**/*.md", { cwd: bundleDir, posix: true });
  const skillDirs = globSync("skills/*/", { cwd: bundleDir, posix: true });

  if (knowledgeFiles.length === 0 && skillDirs.length === 0) {
    record("export.content", false, "Bundle must contain knowledge/**/*.md and/or skills/");
  } else {
    record("export.content", true, `${knowledgeFiles.length} knowledge, ${skillDirs.length} skill(s)`);
  }

  // Knowledge provenance
  for (const rel of knowledgeFiles) {
    const full = path.join(bundleDir, rel);
    const { frontmatter, body } = parseMarkdownFrontmatter(readFileSync(full, "utf8"));
    if (!frontmatter.type) {
      record("okf.type", false, `${rel}: missing OKF type`);
    }

    if (level === 0) {
      for (const field of L0_PROV_FIELDS) {
        if (!frontmatter[field]) record("okf.provenance.l0", false, `${rel}: missing ${field}`);
      }
      if (L0_PROV_FIELDS.every((f) => frontmatter[f])) {
        record("okf.provenance.l0", true, `${rel}: Level 0 provenance OK`);
      }
      if (!frontmatter.prov_sovereignty) {
        record("okf.sovereignty", true, `${rel}: prov_sovereignty not set (recommended)`);
      } else if (!SOVEREIGNTY_VALUES.has(frontmatter.prov_sovereignty)) {
        record("okf.sovereignty", false, `${rel}: unknown prov_sovereignty value`);
      } else {
        record("okf.sovereignty", true, `${rel}: sovereignty tag present`);
      }
    } else {
      for (const field of L1_OKF_PROV_FIELDS) {
        if (!frontmatter[field]) record("okf.provenance.l1", false, `${rel}: missing ${field}`);
      }
      const bodyNorm = body.replace(/\r\n/g, "\n");
      if (frontmatter.prov_content_hash && frontmatter.prov_content_hash !== sha256Prefixed(bodyNorm)) {
        record("okf.hash", false, `${rel}: prov_content_hash mismatch`);
      }
      if (L1_OKF_PROV_FIELDS.every((f) => frontmatter[f])) {
        record("okf.provenance.l1", true, `${rel}: Level 1 provenance OK`);
        record("okf.hash", true, `${rel}: content hash OK`);
      }
    }
    checkForbiddenProvenance(frontmatter, rel, results);
  }

  // Skills
  for (const rel of skillDirs) {
    const dir = rel.replace(/\/$/, "");
    const skillMd = path.join(bundleDir, dir, "SKILL.md");
    const provJson = path.join(bundleDir, dir, "provenance.json");

    if (!existsSync(skillMd)) {
      record("skill.present", false, `${dir}: missing SKILL.md`);
      continue;
    }

    const skillRaw = readFileSync(skillMd, "utf8");
    const { frontmatter } = parseMarkdownFrontmatter(skillRaw);

    if (level === 0) {
      const hasFrontmatterProv = L0_PROV_FIELDS.every((f) => frontmatter[f]);
      if (hasFrontmatterProv) {
        record("skill.provenance.l0", true, `${dir}: frontmatter provenance OK`);
      } else if (existsSync(provJson)) {
        record("skill.provenance.l0", true, `${dir}: provenance.json present (optional at L0)`);
      } else {
        record("skill.provenance.l0", false, `${dir}: missing L0 provenance in frontmatter`);
      }
      if (!frontmatter.name) record("skill.metadata", false, `${dir}: missing name in frontmatter`);
    } else {
      if (!existsSync(provJson)) {
        record("skill.provenance.l1", false, `${dir}: missing provenance.json (required at L1)`);
      } else {
        try {
          const prov = JSON.parse(readFileSync(provJson, "utf8"));
          checkForbiddenProvenance(prov, `${dir}/provenance.json`, results);
          if (validateEntity(prov)) {
            record("skill.provenance.l1", true, `${dir}: provenance.json validates`);
          } else {
            record("skill.provenance.l1", false, `${dir}: ${ajv.errorsText(validateEntity.errors)}`);
          }
          if (prov.content_hash !== sha256Prefixed(skillRaw)) {
            record("skill.hash", false, `${dir}: content_hash mismatch`);
          } else {
            record("skill.hash", true, `${dir}: content hash OK`);
          }
        } catch (e) {
          record("skill.provenance.l1", false, `${dir}: parse error`);
        }
      }
    }
  }

  // agent.yaml
  const agentPath = path.join(bundleDir, "agent.yaml");
  if (level === 0) {
    if (existsSync(agentPath)) {
      try {
        const agent = YAML.parse(readFileSync(agentPath, "utf8"));
        if (validateAgentMinimal(agent)) record("agent.schema", true, "agent.yaml (minimal) validates");
        else record("agent.schema", false, ajv.errorsText(validateAgentMinimal.errors));
      } catch (e) {
        record("agent.schema", false, `agent.yaml parse error: ${e.message}`);
      }
    } else {
      record("agent.schema", true, "agent.yaml omitted (optional at L0)");
    }
  } else {
    if (!existsSync(agentPath)) {
      record("agent.schema", false, "agent.yaml required at Level 1+");
    } else {
      try {
        const agent = YAML.parse(readFileSync(agentPath, "utf8"));
        if (validateAgentFull(agent)) record("agent.schema", true, "agent.yaml (full) validates");
        else record("agent.schema", false, ajv.errorsText(validateAgentFull.errors));
      } catch (e) {
        record("agent.schema", false, `agent.yaml parse error: ${e.message}`);
      }
    }
  }

  // Memory graph
  const graphPath = path.join(bundleDir, "memory/graph.jsonld");
  if (level === 0) {
    record("memory.graph", true, "Memory graph optional at Level 0");
  } else if (existsSync(graphPath)) {
    try {
      const graph = JSON.parse(readFileSync(graphPath, "utf8"));
      if (validateMemory(graph)) record("memory.graph", true, "memory/graph.jsonld validates");
      else record("memory.graph", false, ajv.errorsText(validateMemory.errors));
    } catch (e) {
      record("memory.graph", false, `graph parse error: ${e.message}`);
    }
  } else {
    record("memory.graph", false, "memory/graph.jsonld required at Level 1+");
  }

  // Level 2: assertions file
  if (level >= 2) {
    const assertionsPath = path.join(bundleDir, "assertions/entities.json");
    if (existsSync(assertionsPath)) {
      record("assertions.present", true, "assertions/entities.json present");
    } else {
      record("assertions.present", false, "assertions/entities.json required at Level 2");
    }
  }

  // Forbidden ownership in all JSON
  const jsonFiles = globSync("**/*.json", { cwd: bundleDir, posix: true }).filter((f) => f !== "manifest.json");
  let ownershipOk = true;
  for (const rel of jsonFiles) {
    try {
      const data = JSON.parse(readFileSync(path.join(bundleDir, rel), "utf8"));
      const before = results.length;
      checkForbiddenProvenance(data, rel, results);
      if (results.length > before) ownershipOk = false;
    } catch {
      // skip
    }
  }
  if (ownershipOk) record("provenance.no-ownership", true, "No forbidden ownership fields in provenance");

  return results;
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((r) => {
    const key = `${r.check}:${r.ok}:${r.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  const { bundlePath, json, level } = parseArgs(process.argv.slice(2));
  if (!bundlePath) {
    console.error("Usage: node verify.mjs <bundle-dir> [--level 0|1|2] [--json]");
    process.exit(2);
  }

  const resolved = path.resolve(bundlePath);
  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    console.error(`Not a directory: ${resolved}`);
    process.exit(2);
  }

  const results = dedupeResults(runChecks(resolved, level));
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  const ok = failed.length === 0;

  if (json) {
    console.log(JSON.stringify({ level, ok, passed: passed.length, failed: failed.length, results }, null, 2));
  } else {
    console.log(`Portable Soul verify (level ${level}): ${resolved}`);
    console.log(`Result: ${ok ? "PASS" : "FAIL"} (${passed.length} passed, ${failed.length} failed)\n`);
    for (const r of results) {
      console.log(`  [${r.ok ? "ok" : "FAIL"}] ${r.check}: ${r.message}`);
    }
  }

  process.exit(ok ? 0 : 1);
}

main();
