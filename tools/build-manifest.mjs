#!/usr/bin/env node
/**
 * Build manifest.json for a .soul bundle and fix OKF prov_content_hash placeholders.
 * Usage: node build-manifest.mjs <bundle-dir>
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const bundleDir = process.argv[2];
if (!bundleDir) {
  console.error("Usage: node build-manifest.mjs <bundle-dir>");
  process.exit(1);
}

const SPEC_VERSION = "0.5.0-draft";
const BUNDLE_ID = "urn:psoul:bundle:550e8400-e29b-41d4-a716-446655440000";
const SOURCE_AGENT = "urn:psoul:agent:core-principal-09e";

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

function sha256Prefixed(data) {
  return `sha256:${sha256Hex(data)}`;
}

function entityId(entityType, content) {
  const payload = JSON.stringify({ content, entity_type: entityType });
  return `urn:psoul:entity:${sha256Hex(payload).slice(0, 16)}`;
}

function parseMarkdownFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { frontmatter: "", body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: "", body: raw };
  return {
    frontmatter: raw.slice(4, end),
    body: raw.slice(end + 5),
  };
}

function updateOkfFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseMarkdownFrontmatter(raw);
  const bodyNorm = body.replace(/\r\n/g, "\n");
  const hash = sha256Prefixed(bodyNorm);

  const entityTypeMatch = frontmatter.match(/^prov_entity_type:\s*(.+)$/m);
  const entityType = entityTypeMatch ? entityTypeMatch[1].trim() : "document";
  const eid = entityId(entityType, bodyNorm);

  let updatedFm = frontmatter
    .replace(/^prov_content_hash:.*$/m, `prov_content_hash: "${hash}"`)
    .replace(/^prov_entity_id:.*$/m, `prov_entity_id: "${eid}"`);

  const out = `---\n${updatedFm}\n---\n${bodyNorm}`;
  writeFileSync(filePath, out, "utf8");
  return { eid, hash, body: bodyNorm };
}

function walkFiles(dir, base = dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) entries.push(...walkFiles(full, base));
    else if (name !== "manifest.json") entries.push(full);
  }
  return entries;
}

// Fix OKF knowledge files
const knowledgeDir = path.join(bundleDir, "knowledge");
for (const f of walkFiles(knowledgeDir)) {
  if (f.endsWith(".md")) updateOkfFile(f);
}

// Build skill provenance.json
const skillMdPath = path.join(bundleDir, "skills/triage-incident/SKILL.md");
const skillContent = readFileSync(skillMdPath, "utf8");
const skillHash = sha256Prefixed(skillContent);
const skillEntityId = entityId("skill", skillContent);

const skillProv = {
  entity_id: skillEntityId,
  entity_type: "skill",
  content: skillContent,
  content_hash: skillHash,
  prov: {
    generated_by: {
      activity: "urn:psoul:activity:skill.amend",
      agent: { type: "software", id: SOURCE_AGENT },
      on_behalf_of: { type: "person", id: "user:jdoe" },
    },
    derived_from: [
      { source: "urn:psoul:entity:a1b2c3d4e5f67890", kind: "prior_version" },
      { source: "urn:psoul:session:2026-06-14T17:22:00Z#turn-12", kind: "conversation" },
    ],
    generated_at: "2026-06-15T09:30:00Z",
    in_context: "urn:psoul:workspace:incident-response",
  },
};
writeFileSync(
  path.join(bundleDir, "skills/triage-incident/provenance.json"),
  JSON.stringify(skillProv, null, 2) + "\n",
  "utf8",
);

// Update memory graph placeholders for preference entity
const graphPath = path.join(bundleDir, "memory/graph.jsonld");
const prefPath = path.join(bundleDir, "knowledge/concepts/preference-okf.md");
const { eid: prefEid, hash: prefHash } = updateOkfFile(prefPath);
const triagePath = path.join(bundleDir, "knowledge/concepts/incident-triage.md");
const { eid: triageEid, hash: triageHash } = updateOkfFile(triagePath);

let graphRaw = readFileSync(graphPath, "utf8");
graphRaw = graphRaw
  .replace(/urn:psoul:entity:f9923a1b2c3d4e5f/g, prefEid)
  .replace(/urn:psoul:entity:8f3a2b1c9d4e5f60/g, triageEid)
  .replace(/sha256:PLACEHOLDER/g, (match, offset) => {
    const before = graphRaw.slice(0, offset);
    if (before.includes(prefEid) && !before.includes(triageEid)) return prefHash;
    return triageHash;
  });
// Fix hashes more precisely
const graph = JSON.parse(graphRaw.replace(/sha256:PLACEHOLDER/g, prefHash));
for (const node of graph.graph) {
  if (node["@id"] === prefEid) node.content_hash = prefHash;
  if (node["@id"] === triageEid) node.content_hash = triageHash;
  if (node["@id"] === skillEntityId) {
    node["@id"] = skillEntityId;
    node.content_hash = skillHash;
  } else if (node.entityType === "skill") {
    node["@id"] = skillEntityId;
    node.content_hash = skillHash;
  }
}
writeFileSync(graphPath, JSON.stringify(graph, null, 2) + "\n", "utf8");

// Update assertions entity ids
const assertionsPath = path.join(bundleDir, "assertions/entities.json");
let assertions = JSON.parse(readFileSync(assertionsPath, "utf8"));
assertions = assertions.map((block) => {
  if (block.entity_id === "urn:psoul:entity:f9923a1b2c3d4e5f") return { ...block, entity_id: prefEid };
  if (block.entity_id === "urn:psoul:entity:8f3a2b1c9d4e5f60") return { ...block, entity_id: triageEid };
  return block;
});
writeFileSync(assertionsPath, JSON.stringify(assertions, null, 2) + "\n", "utf8");

// Build artifact index
const allFiles = walkFiles(bundleDir).sort();
const artifact_index = allFiles.map((full) => {
  const data = readFileSync(full);
  const rel = path.relative(bundleDir, full).split(path.sep).join("/");
  return {
    path: rel,
    sha256: sha256Hex(data),
    bytes: data.length,
  };
});

const manifest = {
  spec_version: SPEC_VERSION,
  bundle_id: BUNDLE_ID,
  created_at: "2026-06-15T12:00:00Z",
  source_agent_id: SOURCE_AGENT,
  label: "reference-bundle",
  composition_snapshot: "agent.yaml",
  export_filter: {
    description: "Entities with license:portable assertion",
    assertion_claim: "license",
    assertion_value: "portable",
  },
  artifact_index,
};

writeFileSync(path.join(bundleDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Wrote manifest.json with ${artifact_index.length} artifacts`);
console.log(`Preference entity: ${prefEid}`);
console.log(`Triage entity: ${triageEid}`);
console.log(`Skill entity: ${skillEntityId}`);
