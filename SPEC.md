# Portable Soul Specification

**Version:** 0.6.0-draft  
**Status:** Proposal for Community Review  
**Home:** [github.com/db-aeon/portable-soul](https://github.com/db-aeon/portable-soul)

---

## Abstract

Portable Soul standardizes how AI systems declare their architecture, track where knowledge comes from, and export it in open formats. The spec is **tiered**: implement Level 0 first, add Level 1 when you need full harness transparency and memory graphs.

---

## 1. Introduction

### 1.1 Problem

Generalist models are becoming commodities. The moat is the **learning loop** — private evaluations, localized memory, skills that compound with every interaction. If that loop lives inside a proprietary harness, swapping the LLM doesn't help. You still lose your token capital when you leave.

### 1.2 Solution

Four pillars (see [README.md](README.md)):

1. **Nutrition label** — `agent.yaml`
2. **Provenance + sovereignty tags** — who created what; filterable export metadata
3. **`.soul` export** — OKF + Agent Skills + (Level 1+) JSON-LD memory graph
4. **Portability checklist** — binary pass/fail ([CHECKLIST.md](CHECKLIST.md))

### 1.3 Conformance tiers

| Level | Audience | Required |
|-------|----------|----------|
| **0** | Anyone exporting skills/knowledge | `manifest.json`, OKF and/or skills, basic provenance |
| **1** | Platforms, serious builders | + full `agent.yaml`, W3C PROV, memory graph, assertions |
| **2** | Enterprise | + erasure, optional signing ([privacy-and-erasure.md](privacy-and-erasure.md)) |

**Start here:** [GETTING-STARTED.md](GETTING-STARTED.md)

### 1.4 Non-goals

- Arbitrate IP disputes
- Mandate a specific harness or memory engine
- Require proprietary signers or certification authorities
- Enforce sovereignty tags as system locks (tags are export metadata)

### 1.5 External standards

| Standard | Role |
|----------|------|
| [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog) | Knowledge export |
| [Agent Skills](https://agentskills.io) | Workflow export |
| [W3C PROV](https://www.w3.org/TR/prov-overview/) | Level 1+ lineage |
| [C2PA](https://c2pa.org/) | Level 2 optional signing |

---

## 2. Terminology

RFC 2119 keywords apply. See [glossary.md](glossary.md).

**Sovereignty tag** — export metadata classifying who the knowledge belongs to: `user_sovereign`, `org_proprietary`, `portable`, `shared_team`. Recommended at Level 0; assertions layer at Level 1.

---

## 3. Level 0 — Export something portable

### 3.1 Bundle layout

```
bundle/
├── manifest.json          # REQUIRED
├── knowledge/**/*.md      # OKF markdown (optional if skills present)
├── skills/*/SKILL.md      # Agent Skills (optional if knowledge present)
└── agent.yaml             # OPTIONAL minimal nutrition label
```

At least one of `knowledge/` or `skills/` MUST be present.

### 3.2 manifest.json

MUST validate against [`schemas/bundle.manifest.schema.json`](schemas/bundle.manifest.schema.json).

- `spec_version`: `0.6.0-draft`
- `conformance_level`: `0`
- `bundle_id`, `source_agent_id`: plain strings (URNs optional)
- `artifact_index`: path, sha256, bytes for every file except `manifest.json`

### 3.3 Basic provenance (knowledge)

OKF `type` plus four fields in YAML frontmatter:

| Field | Description |
|-------|-------------|
| `prov_created_at` | ISO 8601 UTC |
| `prov_created_by` | Actor id (e.g. `user:jdoe`) |
| `prov_source` | Source reference (e.g. `session:turn-12`, `manual`) |
| `prov_sovereignty` | RECOMMENDED: `user_sovereign`, `org_proprietary`, `portable`, `shared_team` |

### 3.4 Basic provenance (skills)

Provenance MAY live in `SKILL.md` frontmatter (same four fields) OR in optional `provenance.json`.

### 3.5 Minimal agent.yaml

If present, MUST validate against [`schemas/agent.manifest.minimal.schema.json`](schemas/agent.manifest.minimal.schema.json).

### 3.6 Level 0 exclusions

- Memory graph: OPTIONAL
- Full W3C PROV: OPTIONAL
- `urn:psoul:` URIs: OPTIONAL
- C2PA signing: OPTIONAL

---

## 4. Level 1 — Declare the harness

Everything in Level 0, plus:

### 4.1 Full agent.yaml

MUST validate against [`schemas/agent.manifest.schema.json`](schemas/agent.manifest.schema.json). Declares orchestration, models, memory, tools, connectors, interfaces.

### 4.2 Full provenance

Knowledge MUST use extended OKF frontmatter per [profiles/okf-profile.md](profiles/okf-profile.md). Skills MUST include `provenance.json` per [profiles/agent-skills-profile.md](profiles/agent-skills-profile.md).

### 4.3 Memory graph

MUST export `memory/graph.jsonld` — structured JSON-LD with PROV vocabulary. Raw embedding dumps alone are insufficient; lineage MUST travel with facts.

Reference profile: [profiles/memory-graph.context.jsonld](profiles/memory-graph.context.jsonld). Temporal graph memory systems (e.g. open-source graph recall frameworks) are non-normative examples.

### 4.4 Assertions layer

Sovereignty and license claims MUST appear in `assertions/entities.json`, NOT in provenance records. Conflicting claims are preserved side by side.

Suggested assertion:

```json
{ "claim": "sovereignty", "value": "user_sovereign", "asserted_by": { "type": "person", "id": "user:jdoe" }, "asserted_at": "..." }
```

### 4.5 Identity (Level 1)

`entity_id` SHOULD use `urn:psoul:entity:{hash-prefix}` per [uri-schemes.md](uri-schemes.md). Plain strings remain valid at Level 0.

---

## 5. Level 2 — Enterprise hardening

Everything in Level 1, plus:

- Tombstoning and subject export per [privacy-and-erasure.md](privacy-and-erasure.md)
- Optional C2PA or self-issued signing (anti-gatekeeping: no proprietary CA required)
- `assertions/entities.json` REQUIRED

---

## 6. Import semantics

Importers MUST preserve lineage, accumulate assertions without silent conflict resolution, and honor tombstones.

---

## 7. Conformance verification

```bash
node tools/verify.mjs <bundle> --level 0
node tools/verify.mjs <bundle> --level 1
```

See [conformance/criteria.md](conformance/criteria.md) and [CHECKLIST.md](CHECKLIST.md).

---

## 8. Security considerations

- `agent.yaml` may expose internal endpoints — restrict access
- Bundles are high-fidelity behavioral profiles — treat as sensitive
- Validate bundle paths stay within root on import

---

## Appendix A — Schema index

| Schema | Level |
|--------|-------|
| `bundle.manifest.schema.json` | 0+ |
| `agent.manifest.minimal.schema.json` | 0 |
| `agent.manifest.schema.json` | 1+ |
| `entity.provenance.schema.json` | 1+ |
| `assertion.schema.json` | 1+ |
| `memory-graph.schema.json` | 1+ |

## Appendix B — Reference bundles

- Level 0: [`examples/reference-bundle-l0/`](examples/reference-bundle-l0/)
- Level 1: [`examples/reference-bundle/`](examples/reference-bundle/)

## Appendix C — Changelog

[CHANGELOG.md](CHANGELOG.md)

## Appendix D — Full 0.5 detail

Level 1 requirements subsume the detailed 0.5.0-draft design. URI schemes, erasure, and profile bindings remain in their dedicated documents.
