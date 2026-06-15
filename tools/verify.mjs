#!/usr/bin/env node
/**
 * Portable Soul bundle verifier — structural conformance checks (C1–C8).
 * Usage: node verify.mjs <bundle-dir> [--json]
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
const REQUIRED_OKF_PROV_FIELDS = [
  "prov_entity_id",
  "prov_entity_type",
  "prov_content_hash",
  "prov_generated_at",
  "prov_generated_by_activity",
  "prov_generated_by_agent",
  "prov_derived_from",
];

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
  const bundlePath = argv.find((a) => !a.startsWith("-") && a !== process.argv[1] && !a.endsWith("verify.mjs"));
  return { bundlePath, json };
}

function parseMarkdownFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fmRaw = raw.slice(4, end);
  const body = raw.slice(end + 5);
  return { frontmatter: YAML.parse(fmRaw) ?? {}, body };
}

function checkForbiddenProvenance(obj, filePath, errors) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_PROVENANCE_KEYS.has(key)) {
      errors.push({
        check: "provenance.no-ownership",
        ok: false,
        message: `Forbidden field "${key}" in provenance at ${filePath}`,
      });
    }
    if (typeof obj[key] === "object") checkForbiddenProvenance(obj[key], filePath, errors);
  }
}

function runChecks(bundleDir) {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);

  const validateManifest = ajv.compile(loadSchema("bundle.manifest.schema.json"));
  const validateAgent = ajv.compile(loadSchema("agent.manifest.schema.json"));
  const validateEntity = ajv.compile(loadSchema("entity.provenance.schema.json"));
  const validateMemory = ajv.compile(loadSchema("memory-graph.schema.json"));

  const results = [];

  function record(check, ok, message) {
    results.push({ check, ok, message });
  }

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
    record("manifest.schema", false, `manifest.json invalid: ${ajv.errorsText(validateManifest.errors)}`);
  }

  // Artifact integrity
  let integrityOk = true;
  for (const entry of manifest.artifact_index ?? []) {
    const full = path.join(bundleDir, entry.path);
    if (!existsSync(full)) {
      integrityOk = false;
      record("artifact.integrity", false, `Missing artifact: ${entry.path}`);
      continue;
    }
    const data = readFileSync(full);
    const hash = sha256Hex(data);
    if (hash !== entry.sha256) {
      integrityOk = false;
      record("artifact.integrity", false, `Hash mismatch: ${entry.path} (expected ${entry.sha256}, got ${hash})`);
    }
    if (data.length !== entry.bytes) {
      integrityOk = false;
      record("artifact.integrity", false, `Size mismatch: ${entry.path} (expected ${entry.bytes}, got ${data.length})`);
    }
  }
  if (integrityOk) {
    record("artifact.integrity", true, `All ${manifest.artifact_index?.length ?? 0} artifacts match index`);
  }

  // agent.yaml
  const agentPath = path.join(bundleDir, "agent.yaml");
  if (existsSync(agentPath)) {
    try {
      const agent = YAML.parse(readFileSync(agentPath, "utf8"));
      if (validateAgent(agent)) {
        record("agent.schema", true, "agent.yaml validates");
      } else {
        record("agent.schema", false, `agent.yaml invalid: ${ajv.errorsText(validateAgent.errors)}`);
      }
    } catch (e) {
      record("agent.schema", false, `agent.yaml parse error: ${e.message}`);
    }
  }

  // OKF knowledge
  const knowledgeFiles = globSync("knowledge/**/*.md", { cwd: bundleDir, posix: true });
  if (knowledgeFiles.length === 0) {
    record("okf.provenance", true, "No knowledge files (optional)");
  } else {
    let okfOk = true;
    for (const rel of knowledgeFiles) {
      const full = path.join(bundleDir, rel);
      const raw = readFileSync(full, "utf8");
      const { frontmatter, body } = parseMarkdownFrontmatter(raw);
      if (!frontmatter.type) {
        okfOk = false;
        record("okf.provenance", false, `${rel}: missing OKF type field`);
      }
      for (const field of REQUIRED_OKF_PROV_FIELDS) {
        if (frontmatter[field] === undefined || frontmatter[field] === null || frontmatter[field] === "") {
          okfOk = false;
          record("okf.provenance", false, `${rel}: missing ${field}`);
        }
      }
      const bodyNorm = body.replace(/\r\n/g, "\n");
      const expectedHash = sha256Prefixed(bodyNorm);
      if (frontmatter.prov_content_hash && frontmatter.prov_content_hash !== expectedHash) {
        okfOk = false;
        record("okf.hash", false, `${rel}: prov_content_hash mismatch`);
      }
    }
    if (okfOk) {
      record("okf.provenance", true, `${knowledgeFiles.length} knowledge file(s) OK`);
      record("okf.hash", true, "Content hashes match markdown bodies");
    }
  }

  // Skills
  const skillDirs = globSync("skills/*/", { cwd: bundleDir, posix: true });
  let skillsOk = true;
  for (const rel of skillDirs) {
    const dir = rel.replace(/\/$/, "");
    const skillMd = path.join(bundleDir, dir, "SKILL.md");
    const provJson = path.join(bundleDir, dir, "provenance.json");
    if (!existsSync(skillMd)) {
      skillsOk = false;
      record("skill.provenance", false, `${dir}: missing SKILL.md`);
      continue;
    }
    if (!existsSync(provJson)) {
      skillsOk = false;
      record("skill.provenance", false, `${dir}: missing provenance.json`);
      continue;
    }
    let prov;
    try {
      prov = JSON.parse(readFileSync(provJson, "utf8"));
    } catch (e) {
      skillsOk = false;
      record("skill.provenance", false, `${dir}: provenance.json parse error`);
      continue;
    }
    checkForbiddenProvenance(prov, provJson, results);
    if (!validateEntity(prov)) {
      skillsOk = false;
      record("skill.provenance", false, `${dir}: ${ajv.errorsText(validateEntity.errors)}`);
    }
    const skillContent = readFileSync(skillMd, "utf8");
    const expectedHash = sha256Prefixed(skillContent);
    if (prov.content_hash !== expectedHash) {
      skillsOk = false;
      record("skill.hash", false, `${dir}: content_hash mismatch`);
    }
  }
  if (skillDirs.length === 0) {
    record("skill.provenance", true, "No skills (optional)");
  } else if (skillsOk) {
    record("skill.provenance", true, `${skillDirs.length} skill(s) OK`);
    record("skill.hash", true, "Skill content hashes match");
  }

  // Memory graph
  const graphPath = path.join(bundleDir, "memory/graph.jsonld");
  if (existsSync(graphPath)) {
    try {
      const graph = JSON.parse(readFileSync(graphPath, "utf8"));
      if (validateMemory(graph)) {
        record("memory.graph", true, "memory/graph.jsonld validates");
      } else {
        record("memory.graph", false, ajv.errorsText(validateMemory.errors));
      }
    } catch (e) {
      record("memory.graph", false, `graph parse error: ${e.message}`);
    }
  } else {
    record("memory.graph", true, "No memory graph (optional)");
  }

  // Scan all JSON for forbidden provenance fields
  const jsonFiles = globSync("**/*.json", { cwd: bundleDir, posix: true }).filter(
    (f) => f !== "manifest.json",
  );
  let ownershipOk = true;
  for (const rel of jsonFiles) {
    const full = path.join(bundleDir, rel);
    try {
      const data = JSON.parse(readFileSync(full, "utf8"));
      const before = results.length;
      checkForbiddenProvenance(data, rel, results);
      if (results.length > before) ownershipOk = false;
    } catch {
      // skip
    }
  }
  if (ownershipOk) {
    record("provenance.no-ownership", true, "No forbidden ownership fields in provenance");
  }

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
  const { bundlePath, json } = parseArgs(process.argv.slice(2));
  if (!bundlePath) {
    console.error("Usage: node verify.mjs <bundle-dir> [--json]");
    process.exit(2);
  }

  const resolved = path.resolve(bundlePath);
  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    console.error(`Not a directory: ${resolved}`);
    process.exit(2);
  }

  const results = dedupeResults(runChecks(resolved));
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  const ok = failed.length === 0;

  if (json) {
    console.log(JSON.stringify({ ok, passed: passed.length, failed: failed.length, results }, null, 2));
  } else {
    console.log(`Portable Soul verify: ${resolved}`);
    console.log(`Result: ${ok ? "PASS" : "FAIL"} (${passed.length} passed, ${failed.length} failed)\n`);
    for (const r of results) {
      console.log(`  [${r.ok ? "ok" : "FAIL"}] ${r.check}: ${r.message}`);
    }
  }

  process.exit(ok ? 0 : 1);
}

main();
