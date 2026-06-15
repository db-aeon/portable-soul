# Portable Soul Specification

**Version:** 0.5.0-draft  
**Status:** Proposal for Community Review  
**Home:** [portablesoul.org](https://portablesoul.org) (planned)

---

## Abstract

Portable Soul is a vendor-agnostic specification for declaring how an AI system is composed, recording the provenance of the knowledge it accrues, and exporting that knowledge in portable open formats.

Its purpose is to prevent proprietary AI systems from becoming gatekeepers to compounding knowledge. As value migrates up the stack — the harness, the orchestrator, and the memory system — lock-in forms where the learning loop actually compounds. Portable Soul is deliberately neutral on ownership: it provides the evidentiary substrate on which ownership and licensing claims can be made, contested, and honored.

The specification builds on existing open standards: OKF for knowledge, Agent Skills for workflows, W3C PROV for provenance, and C2PA Content Credentials for optional cryptographic signing.

---

## 1. Introduction

### 1.1 Problem statement

Model portability alone is insufficient. A system that exposes swappable models while hiding its harness, orchestration routing, tool layer, and memory infrastructure is not portable — it is a model host with a proprietary cognitive loop.

Portable Soul addresses **application-layer portability**: the ability to declare, audit, export, and re-import the full stack that turns inference into compounding organizational knowledge.

### 1.2 Design principles

1. **Declare the whole application layer, don't obscure it.** Every component in the data path is named in a root manifest.
2. **Record lineage, don't adjudicate ownership.** Provenance is captured as fact. Ownership and license are recorded as contestable assertions.
3. **Define interfaces, not implementations.** The spec mandates guarantees; specific tools are SHOULD-level reference bindings.
4. **Resist becoming the new gate.** Verification MUST be possible with open tooling and self-issued credentials.

### 1.3 Non-goals

Portable Soul does NOT:

- Arbitrate intellectual property disputes
- Mandate a specific memory engine, harness, or cloud provider
- Standardize model fine-tuning or weight formats
- Require centralized registries or certification authorities
- Define agent persona or personality documents (see [glossary.md](glossary.md))
- Require zero-knowledge selective disclosure (deferred to future extensions)

### 1.4 Relationship to external standards

| Standard | Role in Portable Soul |
|----------|----------------------|
| [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog) | Knowledge export binding ([profile](profiles/okf-profile.md)) |
| [Agent Skills](https://agentskills.io) | Workflow export binding ([profile](profiles/agent-skills-profile.md)) |
| [W3C PROV](https://www.w3.org/TR/prov-overview/) | Provenance data model |
| [C2PA](https://c2pa.org/) | Optional signing for text artifacts |

---

## 2. Terminology

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

Defined terms appear in [glossary.md](glossary.md). URI patterns appear in [uri-schemes.md](uri-schemes.md).

---

## 3. URI and identity

### 3.1 URN namespace

Portable Soul reserves the `urn:psoul:` namespace. All normative identifiers defined by this specification MUST use this prefix unless explicitly referencing an external URI in `derived_from`.

### 3.2 Entity identity

An Entity's `entity_id` MUST be:

```
urn:psoul:entity:{hash-prefix}
```

where `{hash-prefix}` is the first 16 lowercase hex characters of SHA-256 over the **canonical entity payload**:

```json
{
  "entity_type": "<entity_type>",
  "content": "<content>"
}
```

Serialization rules:

- JSON object keys in alphabetical order
- `content` as UTF-8 string (for structured content, JSON-stringify with sorted keys)
- No insignificant whitespace
- `content` is `null` for tombstones (see [privacy-and-erasure.md](privacy-and-erasure.md))

When content changes, a new `entity_id` MUST be minted. The prior Entity MUST be referenced in `derived_from` with `kind: prior_version` or `kind: skill`.

### 3.3 Content hashes

`content_hash` MUST use the form `sha256:{64-hex}` over the same material as `content` in the canonical payload, except for tombstones where the hash is computed per [privacy-and-erasure.md](privacy-and-erasure.md).

---

## 4. System composition manifest (`agent.yaml`)

### 4.1 Purpose

Every conformant system MUST expose a root composition manifest declaring its operational footprint. The manifest enables swapping models, harnesses, orchestrators, memory systems, tools, and connectors without breaking the cognitive loop.

### 4.2 Location

- **Runtime:** Systems SHOULD expose `agent.yaml` at a stable URL or path documented to operators.
- **Export:** Bundles MAY include a composition snapshot at `agent.yaml` (see §7).

### 4.3 Schema

`agent.yaml` MUST validate against [`schemas/agent.manifest.schema.json`](schemas/agent.manifest.schema.json).

### 4.4 Required topology

The `topology` object MUST enumerate:

| Section | Requirement |
|---------|-------------|
| `orchestration` | At least one role (`primary_reasoning_loop`, etc.) |
| `models` | Every model and provider in the inference path |
| `memory_systems` | Every system that retains or retrieves memorized state |
| `tools` | REQUIRED when any tool can read/write memorized data |
| `connectors` | REQUIRED when external data feeds memorization |
| `interfaces` | RECOMMENDED — chat, voice, API, scheduled tasks |

### 4.5 Conformance: composition transparency

Any model, harness, orchestrator, memory system, tool, or connector in the memorization data path that is omitted from the manifest is **non-conformant**.

Hidden routing — opaque model selection, undeclared MCP servers, undeclared connector mirrors — MUST be treated as non-conformant.

### 4.6 Example (non-normative)

See [`examples/agent.manifest.example.yaml`](examples/agent.manifest.example.yaml).

---

## 5. Entity taxonomy

### 5.1 Core types (closed set)

| `entity_type` | Description |
|---------------|-------------|
| `fact` | A retained factual statement |
| `preference` | User or org preference |
| `heuristic` | Rule of thumb or decision shortcut |
| `skill` | Agent Skills workflow artifact |
| `workflow` | Multi-step process definition |
| `document` | General document entity |
| `memory_node` | Graph memory node |
| `playbook` | Operational playbook (OKF-aligned) |
| `abstract_concept` | Generalized concept distilled from experience |

### 5.2 Extensions

Implementations MAY use `entity_type` values matching `^x-[a-z0-9-]+$` for domain-specific types. Importers MUST preserve unknown types without rejection.

---

## 6. Provenance

### 6.1 Data model

Portable Soul adopts W3C PROV's three core classes:

- **Entity** — unit of knowledge
- **Activity** — operation that produced it
- **Agent** — responsible actor (human or software)

### 6.2 Provenance record

Every memorized Entity MUST carry a provenance record validating against [`schemas/entity.provenance.schema.json`](schemas/entity.provenance.schema.json).

Minimum fields:

| Field | Requirement |
|-------|-------------|
| `prov.generated_by` | Activity, agent, optional `on_behalf_of` |
| `prov.derived_from` | At least one source reference |
| `prov.generated_at` | ISO 8601 UTC timestamp |
| `content_hash` | Integrity over content |

`prov.in_context` SHOULD reference a workspace URI.

### 6.3 Activity identifiers

Activities SHOULD use `urn:psoul:activity:{verb}` (see [uri-schemes.md](uri-schemes.md)). Core verbs include `memory.retain`, `memory.recall`, `skill.author`, `knowledge.generalize`, `erasure.tombstone`.

### 6.4 Ownership exclusion

`license`, `ownership`, `data_class`, and similar classification fields MUST NOT appear in provenance records. They belong in the assertions layer (§7).

### 6.5 Example (non-normative)

See [`examples/entity.provenance.example.json`](examples/entity.provenance.example.json).

---

## 7. Assertions layer

### 7.1 Purpose

Ownership, license, visibility, and retention are **claims about** Entities — not ground truth the system enforces.

### 7.2 Schema

Assertions MUST validate against [`schemas/assertion.schema.json`](schemas/assertion.schema.json).

### 7.3 Conflict policy

When parties attach different or conflicting claims to the same Entity, conformant systems MUST record all assertions side by side. They MUST NOT silently resolve conflicts.

### 7.4 Export filters

Export filters operate on assertions and provenance, never on a hardcoded ownership field.

Example filter: export every Entity with an assertion `claim: license`, `value: portable`.

### 7.5 Example (non-normative)

See [`examples/assertions.example.json`](examples/assertions.example.json).

---

## 8. Optional cryptographic signing (C2PA)

### 8.1 Scope

Provenance records, assertions, and bundle manifests MAY be signed using [C2PA](https://c2pa.org/) Content Credentials. C2PA v2.3+ covers unstructured text and model outputs.

### 8.2 Anti-gatekeeping (normative)

Portable Soul conformance MUST NOT require a proprietary signer, registry, or certification authority.

Verification of a `.soul` bundle MUST be possible with open tooling and self-issued credentials.

Any trust list or signer hierarchy MUST be optional. A bundle signed with self-issued credentials MUST remain conformant (verifiable as self-attested, never rejected outright).

Signed manifests SHOULD reference signature files in `bundle.manifest.signatures[]`.

---

## 9. Portability — the `.soul` bundle

### 9.1 Definition

A **soul bundle** (or `.soul` bundle) is a directory or archive of provenanced knowledge, skills, and memory importable by any conformant system.

### 9.2 Directory layout

```
bundle/
├── manifest.json              # REQUIRED — bundle index + integrity
├── agent.yaml                 # OPTIONAL — composition snapshot at export
├── redaction.json             # OPTIONAL — privacy omissions
├── knowledge/                 # OKF concepts (see OKF profile)
├── skills/                    # Agent Skills + provenance.json each
├── memory/
│   └── graph.jsonld           # PROV-compatible memory graph
├── assertions/
│   └── entities.json          # Contestable claims (array of assertion docs)
└── signatures/                # OPTIONAL — C2PA or self-issued certs
```

### 9.3 Bundle manifest

`manifest.json` MUST validate against [`schemas/bundle.manifest.schema.json`](schemas/bundle.manifest.schema.json).

`artifact_index` MUST list every file in the bundle (except `manifest.json` itself and optional `signatures/`) with correct SHA-256 hashes and byte sizes.

### 9.4 Archive wrapper

Bundles MAY be distributed as `.tar.gz` or `.zip` archives. The archive root MUST contain `manifest.json` at the top level.

### 9.5 Knowledge export (OKF)

Knowledge MUST export per [profiles/okf-profile.md](profiles/okf-profile.md).

### 9.6 Skills export (Agent Skills)

Skills MUST export per [profiles/agent-skills-profile.md](profiles/agent-skills-profile.md).

### 9.7 Memory export (JSON-LD graph)

Memory MUST export as a PROV-compatible JSON-LD graph per [profiles/memory-graph.context.jsonld](profiles/memory-graph.context.jsonld), validating against [`schemas/memory-graph.schema.json`](schemas/memory-graph.schema.json).

The reference profile supports temporal facts, entity relationships, and activity nodes for retain/recall/reflect — without mandating any specific memory engine.

### 9.8 Conformance: portability

| Requirement | Detail |
|-------------|--------|
| Knowledge | OKF markdown with provenance frontmatter |
| Skills | Agent Skills directories with `provenance.json` |
| Memory | JSON-LD graph with PROV vocabulary |
| Lineage | Every exported artifact carries provenance |

---

## 10. Memory graph reference profile

### 10.1 Node types

| `@type` | Description |
|---------|-------------|
| `psoul:Fact` | Retained fact (extends `prov:Entity`) |
| `psoul:Preference` | Preference entity |
| `psoul:MemoryNode` | Generic graph node |
| `psoul:SessionTurn` | Conversation turn source |
| `prov:Activity` | retain, recall, reflect, etc. |
| `prov:Agent` | Software or human actor |

### 10.2 Edge vocabulary

| Property | Meaning |
|----------|---------|
| `prov:wasDerivedFrom` | Lineage to source entity or session |
| `prov:wasGeneratedBy` | Activity that created the entity |
| `psoul:supersedes` | Newer entity replaces older (extension) |
| `psoul:contradicts` | Conflicting fact (extension) |
| `psoul:recalledIn` | Session where entity was retrieved (extension) |

### 10.3 Dual representation

An Entity MAY appear in both `knowledge/` (OKF) and `memory/graph.jsonld`. `entity_id` and `content_hash` MUST match across representations.

---

## 11. Import semantics

Conformant importers MUST:

1. **Preserve lineage** — import provenance records without stripping `derived_from` chains.
2. **Accumulate assertions** — add new assertions alongside existing; never silently drop conflicts.
3. **Not arbitrate** — importers do not resolve conflicting license or ownership claims.
4. **Verify integrity** — validate `content_hash` and `artifact_index` before integration.
5. **Honor tombstones** — never resurrect erased content from other artifacts.

Importers MAY support `merge` or `replace` modes per artifact type. The mode MUST be documented and MUST NOT delete source lineage in the exporting system.

---

## 12. Erasure and privacy

See [privacy-and-erasure.md](privacy-and-erasure.md) for normative tombstoning, subject export, selective disclosure, and redaction manifests.

Conformant systems SHOULD make provenance capture inspectable by the subject, guarantee subject export of provenance describing them, and support selective disclosure via export filters and redaction manifests.

---

## 13. Conformance

### 13.1 Criteria summary

| Property | Conformant | Non-conformant |
|----------|------------|----------------|
| Composition transparency | `agent.yaml` enumerates full data path | Only model declared; hidden routing |
| Provenance integrity | Every Entity has lineage; ownership in assertions only | Untraceable dumps; enforced ownership fields |
| Portability | OKF + Agent Skills + PROV graph with provenance | Proprietary APIs with no export |
| Verifiable export | Independently verifiable with open tooling | Requires vendor registry/signer |

Full criteria: [conformance/criteria.md](conformance/criteria.md).

### 13.2 Verifier

The reference open verifier at [`tools/verify.mjs`](tools/verify.mjs) implements structural checks. Passing verification is necessary but not sufficient for full operational conformance (e.g. runtime manifest availability is out of scope for bundle-only verification).

### 13.3 Test vectors

See [conformance/test-vectors.md](conformance/test-vectors.md).

---

## 14. Security considerations

### 14.1 Manifest leakage

`agent.yaml` exposes internal infrastructure (endpoints, providers). Operators SHOULD restrict manifest access and redact secrets. Secrets MUST NOT appear in exported bundles.

### 14.2 Bundle tampering

`artifact_index` hashes detect tampering. Signatures (§8) add optional non-repudiation.

### 14.3 Provenance as profiling

Exported provenance constitutes a high-fidelity behavioral profile. Distributors MUST treat bundles as sensitive data. See [privacy-and-erasure.md](privacy-and-erasure.md).

### 14.4 Import risks

Malicious bundles could contain crafted skill content. Importers SHOULD sandbox skill installation and validate all paths stay within bundle root.

---

## Appendix A: Schema index

| Schema | Path |
|--------|------|
| Agent manifest | `schemas/agent.manifest.schema.json` |
| Bundle manifest | `schemas/bundle.manifest.schema.json` |
| Entity provenance | `schemas/entity.provenance.schema.json` |
| Assertions | `schemas/assertion.schema.json` |
| Memory graph | `schemas/memory-graph.schema.json` |

## Appendix B: Reference bundle

A minimal conformant bundle: [`examples/reference-bundle/`](examples/reference-bundle/).

## Appendix C: Changelog

See [CHANGELOG.md](CHANGELOG.md).
