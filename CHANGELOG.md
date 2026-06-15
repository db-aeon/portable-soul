# Changelog

All notable changes to the Portable Soul specification are documented here.

## [0.5.0-draft] — 2026-06-15

### Added

- Full normative [SPEC.md](SPEC.md) with RFC 2119 language
- JSON Schemas: `agent.manifest`, `bundle.manifest`, `entity.provenance`, `assertion`, `memory-graph`
- Format profiles: OKF, Agent Skills, memory-graph JSON-LD context
- Normative [uri-schemes.md](uri-schemes.md) for agents, sessions, workspaces, entities
- [privacy-and-erasure.md](privacy-and-erasure.md): tombstoning, subject export, redaction manifests
- Reference conformant bundle at `examples/reference-bundle/`
- Non-conformant fixtures at `examples/nonconformant/` for negative testing
- Open verifier CLI at `tools/verify.mjs`
- Conformance criteria and test vectors

### Changed (from 0.4.0-draft)

- `agent.yaml` topology is **role-based** (`primary_reasoning_loop`, `sandbox_execution`, etc.) instead of vendor product names
- Added normative sections for **tools/MCP**, **connectors**, and **I/O interfaces**
- Defined **entity taxonomy** and hash-based `entity_id` generation
- Specified concrete **`.soul` bundle layout** with `manifest.json` and `artifact_index`
- Memory interchange defined as **JSON-LD reference profile** (not engine-specific)
- OKF binding defined as a **Portable Soul profile** with `prov_*` frontmatter mapping
- Skills binding requires sidecar **`provenance.json`** with version lineage
- **Import semantics** documented (preserve lineage, accumulate assertions, no arbitration)
- **Erasure/tombstoning** normative model added
- Glossary disambiguates **cognitive bundle** (this spec) from **persona document** (out of scope)

### Unchanged from 0.4.0-draft

- Core thesis: application-layer portability, not model-only portability
- W3C PROV for lineage; assertions layer for ownership/license
- Export formats: OKF, Agent Skills, PROV-compatible memory graph
- Anti-gatekeeping clause for signing and verification
- Provenance-as-surveillance caution

## [0.4.0-draft] — 2026-06-14

Initial community review draft (prose specification with illustrative examples).
