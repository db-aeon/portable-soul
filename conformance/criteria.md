# Conformance criteria

Portable Soul conformance is binary per property: a system either meets a criterion or does not. Self-attested letter grades are not evidence.

## Bundle conformance (verifiable offline)

These criteria CAN be checked by [`tools/verify.mjs`](../tools/verify.mjs) on a `.soul` bundle.

### C1 — Manifest validity

| | Requirement |
|---|-------------|
| **Conformant** | `manifest.json` validates against `bundle.manifest.schema.json` |
| **Non-conformant** | Missing manifest, invalid schema, or wrong `spec_version` |

### C2 — Artifact integrity

| | Requirement |
|---|-------------|
| **Conformant** | Every `artifact_index` entry exists; SHA-256 and byte size match |
| **Non-conformant** | Missing files, hash mismatch, undeclared files not in index |

### C3 — Composition snapshot

| | Requirement |
|---|-------------|
| **Conformant** | If `agent.yaml` is present, it validates against `agent.manifest.schema.json` |
| **Non-conformant** | Invalid or incomplete composition snapshot |

### C4 — OKF knowledge provenance

| | Requirement |
|---|-------------|
| **Conformant** | Every `knowledge/**/*.md` has OKF `type` plus all required `prov_*` frontmatter fields |
| **Non-conformant** | Missing `type`, missing provenance extensions, or `prov_content_hash` mismatch |

### C5 — Skills provenance

| | Requirement |
|---|-------------|
| **Conformant** | Each `skills/*/` has `SKILL.md` + `provenance.json` validating against schema; `content_hash` matches `SKILL.md` |
| **Non-conformant** | Missing sidecar, hash mismatch, or `entity_type` not `skill` |

### C6 — Memory graph

| | Requirement |
|---|-------------|
| **Conformant** | `memory/graph.jsonld` validates against `memory-graph.schema.json` |
| **Non-conformant** | Missing graph, invalid JSON-LD structure |

### C7 — Provenance integrity (ownership exclusion)

| | Requirement |
|---|-------------|
| **Conformant** | No `license`, `ownership`, or `data_class` fields in provenance records |
| **Non-conformant** | Ownership/license embedded in provenance (enforced as ground truth) |

### C8 — Assertions isolation

| | Requirement |
|---|-------------|
| **Conformant** | License and data-class claims appear only in assertions files |
| **Non-conformant** | Claims only in provenance with no assertion layer |

## Runtime conformance (operational)

These criteria require a live system and CANNOT be fully verified from a bundle alone.

### R1 — Composition transparency

| | Requirement |
|---|-------------|
| **Conformant** | Runtime `agent.yaml` enumerates every model, harness, memory system, tool, and connector in the data path |
| **Non-conformant** | Only model declared; hidden MCP routing; undeclared connector mirrors |

### R2 — Memorization provenance

| | Requirement |
|---|-------------|
| **Conformant** | Every newly memorized Entity gets a lineage record at write time |
| **Non-conformant** | Untraceable vector dumps; batch imports without `derived_from` |

### R3 — Export capability

| | Requirement |
|---|-------------|
| **Conformant** | System can produce a C1–C8 conformant bundle on demand |
| **Non-conformant** | Knowledge/skills/memory locked behind proprietary APIs |

### R4 — Verifiable export (anti-gatekeeping)

| | Requirement |
|---|-------------|
| **Conformant** | Bundle verifiable with open tooling; self-issued signatures accepted |
| **Non-conformant** | Verification requires vendor registry or proprietary signer |

### R5 — Subject rights (SHOULD)

| | Requirement |
|---|-------------|
| **Conformant** | Subject can inspect and export provenance describing them |
| **Non-conformant** | Opaque capture with no export path |

## Negative test fixtures

| Fixture | Violates |
|---------|----------|
| [`examples/nonconformant/bad-hash/`](../examples/nonconformant/bad-hash/) | C2 |
| [`examples/nonconformant/hidden-ownership/`](../examples/nonconformant/hidden-ownership/) | C7 |
| [`examples/nonconformant/missing-okf-prov/`](../examples/nonconformant/missing-okf-prov/) | C4 |

## Reference implementation

The bundle at [`examples/reference-bundle/`](../examples/reference-bundle/) MUST pass all C1–C8 checks.
