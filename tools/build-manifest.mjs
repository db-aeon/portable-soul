#!/usr/bin/env node
/**
 * Build manifest.json for a .soul bundle.
 * Usage: node build-manifest.mjs <bundle-dir> [--level 0|1]
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const SPEC_VERSION = "0.6.0-draft";

function parseArgs(argv) {
  const levelFlag = argv.find((a) => a.startsWith("--level"));
  const level = levelFlag ? parseInt(argv[argv.indexOf(levelFlag) + 1], 10) : 0;
  const bundleDir = argv.find(
    (a) => !a.startsWith("-") && !a.endsWith("build-manifest.mjs") && a !== String(level),
  );
  return { bundleDir, level: Number.isFinite(level) ? level : 0 };
}

function sha256Hex(data) {
  return createHash("sha256").update(data).digest("hex");
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

function main() {
  const { bundleDir, level } = parseArgs(process.argv.slice(2));
  if (!bundleDir) {
    console.error("Usage: node build-manifest.mjs <bundle-dir> [--level 0|1]");
    process.exit(1);
  }

  const resolved = path.resolve(bundleDir);
  const allFiles = walkFiles(resolved).sort();
  const artifact_index = allFiles.map((full) => {
    const data = readFileSync(full);
    return {
      path: path.relative(resolved, full).split(path.sep).join("/"),
      sha256: sha256Hex(data),
      bytes: data.length,
    };
  });

  let sourceAgent = "example-assistant";
  const agentPath = path.join(resolved, "agent.yaml");
  if (statSync(agentPath, { throwIfNoEntry: false })) {
    const agentRaw = readFileSync(agentPath, "utf8");
    const m = agentRaw.match(/^agent_id:\s*["']?([^"'\n]+)/m);
    if (m) sourceAgent = m[1].trim();
  }

  const manifest = {
    spec_version: SPEC_VERSION,
    conformance_level: level,
    bundle_id: level >= 1 ? `urn:psoul:bundle:${randomUUID()}` : `bundle-${Date.now()}`,
    created_at: new Date().toISOString(),
    source_agent_id: sourceAgent,
    label: path.basename(resolved),
    artifact_index,
  };

  if (statSync(agentPath, { throwIfNoEntry: false })) {
    manifest.composition_snapshot = "agent.yaml";
  }

  writeFileSync(path.join(resolved, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote manifest.json (level ${level}, ${artifact_index.length} artifacts)`);
}

main();
