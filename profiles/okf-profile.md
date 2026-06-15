# OKF profile (Portable Soul binding)

Portable Soul knowledge export uses the [Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog) v0.1 as its reference knowledge binding. This profile extends OKF with provenance frontmatter required for conformant export.

## Bundle layout

```
knowledge/
├── index.md              # OPTIONAL — bundle overview (OKF convention)
├── log.md                # OPTIONAL — amendment history (OKF convention)
└── concepts/
    └── {slug}.md         # One concept per file
```

## Required OKF fields

Per OKF v0.1, each concept file MUST have:

| Field | Required | Description |
|-------|----------|-------------|
| `type` | **MUST** | OKF concept type string (e.g. `Playbook`, `abstract_concept`, `Metric`) |

## Portable Soul provenance extensions

Each exported concept file MUST include these additional frontmatter fields:

| Field | Required | Maps to PROV |
|-------|----------|--------------|
| `prov_entity_id` | **MUST** | Entity `@id` / `entity_id` |
| `prov_entity_type` | **MUST** | Portable Soul `entity_type` (see SPEC §Entity taxonomy) |
| `prov_content_hash` | **MUST** | `content_hash` |
| `prov_generated_at` | **MUST** | `prov.generated_at` |
| `prov_generated_by_activity` | **MUST** | `prov.generated_by.activity` |
| `prov_generated_by_agent` | **MUST** | `prov.generated_by.agent.id` |
| `prov_derived_from` | **MUST** | First `derived_from.source` (repeatable via list syntax) |
| `prov_in_context` | SHOULD | `prov.in_context` |

### Example frontmatter

```yaml
---
type: Playbook
title: "Infrastructure Incident Root Cause Analysis"
description: "Generalized methodology for tracing container memory leaks."
prov_entity_id: "urn:psoul:entity:a1b2c3d4e5f67890"
prov_entity_type: abstract_concept
prov_content_hash: "sha256:9f2c4a1b8e3d7f6012345678abcdef0123456789abcdef0123456789abcdef01"
prov_generated_at: "2026-04-02T11:14:00Z"
prov_generated_by_activity: "urn:psoul:activity:knowledge.generalize"
prov_generated_by_agent: "urn:psoul:agent:core-principal-09e"
prov_derived_from:
  - "urn:psoul:workspace:incident-response"
prov_in_context: "urn:psoul:workspace:incident-response"
---
```

## Content hash computation

For OKF concept files, `prov_content_hash` MUST be SHA-256 over the **markdown body only** (content after the closing `---` of frontmatter), UTF-8 encoded, normalized to Unix line endings (`\n`).

The `entity_id` MUST be derived per SPEC §Entity identity from:

```json
{
  "entity_type": "<prov_entity_type>",
  "content": "<markdown body>"
}
```

## OKF `log.md` amendments

When a concept is amended, producers SHOULD append to `log.md`:

```markdown
## 2026-06-15 — amended incident-triage
- entity: urn:psoul:entity:NEW_HASH_PREFIX
- derived_from: urn:psoul:entity:OLD_HASH_PREFIX
- activity: urn:psoul:activity:knowledge.generalize
```

## Dual representation

The same conceptual Entity MAY appear both as an OKF markdown file and as a node in `memory/graph.jsonld`. When both are present, `prov_entity_id` and `content_hash` MUST match.

## Import behavior

Importers MUST:

1. Parse frontmatter and validate required fields.
2. Reconstruct a provenance record per `entity.provenance.schema.json`.
3. NOT treat OKF `type` as an ownership or license classification.

## Reference

- OKF specification: [GoogleCloudPlatform/knowledge-catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- Portable Soul schema: [`../schemas/entity.provenance.schema.json`](../schemas/entity.provenance.schema.json)
