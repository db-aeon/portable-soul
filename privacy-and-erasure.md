# Privacy and erasure

Portable Soul provenance is simultaneously a portability mechanism and a granular profile of how a person or organization thinks. This document normatively extends SPEC.md §4.2 and §Erasure.

## Inspectability (SHOULD)

Conformant systems SHOULD:

1. Expose provenance capture settings to the **subject** (the person or org being profiled).
2. Allow the subject to list Entities memorized about or by them.
3. Allow the subject to export all provenance describing them (see Subject export).

## Subject export (SHOULD)

Conformant systems SHOULD provide an export that includes:

- All Entities where `generated_by.on_behalf_of` references the subject, OR
- All Entities with an assertion where `asserted_by` references the subject.

The export MUST use the standard `.soul` bundle format with full lineage attached.

## Selective disclosure (SHOULD)

When proving lineage without exposing full context, conformant systems SHOULD support:

1. **Export filters** — e.g. export only Entities with `license: portable` assertion.
2. **Redaction manifest** — a sidecar listing paths and fields omitted from the bundle, with reasons.
3. **Partial session references** — `derived_from` may reference session URIs without bundling full transcript content.

Zero-knowledge proofs and cryptographic selective disclosure are out of scope for 0.5.0-draft but MAY be specified in a future extension.

## Tombstoning (MUST for erasure requests)

When a subject requests erasure of memorized content, conformant systems MUST NOT silently delete lineage. They MUST create a **tombstone** Entity or amend the Entity in place:

```json
{
  "entity_id": "urn:psoul:entity:9f2c4a1b8e3d7f60",
  "entity_type": "fact",
  "content": null,
  "content_hash": "sha256:…",
  "prov": {
    "generated_by": {
      "activity": "urn:psoul:activity:erasure.tombstone",
      "agent": { "type": "software", "id": "urn:psoul:agent:core-principal-09e" },
      "on_behalf_of": { "type": "person", "id": "user:jdoe" }
    },
    "derived_from": [
      { "source": "urn:psoul:entity:9f2c4a1b8e3d7f60", "kind": "prior_version" }
    ],
    "generated_at": "2026-06-15T14:00:00Z",
    "erasure": {
      "erased_at": "2026-06-15T14:00:00Z",
      "erased_by": { "type": "person", "id": "user:jdoe" },
      "reason": "subject_request"
    }
  }
}
```

### Tombstone content hash

`content_hash` for a tombstone MUST be computed over the canonical JSON:

```json
{"tombstone":true,"entity_id":"urn:psoul:entity:…","erased_at":"…"}
```

### Export of tombstones

Tombstoned Entities MAY be included in exports (lineage preserved, content null) or excluded via export filter. Importers MUST accept tombstones and MUST NOT resurrect erased content from other bundle artifacts.

## Redaction manifest

When a bundle omits artifacts for privacy, it MAY include `redaction.json` at the bundle root:

```json
{
  "spec_version": "0.5.0-draft",
  "omissions": [
    {
      "path": "memory/graph.jsonld",
      "entity_ids": ["urn:psoul:entity:abc123…"],
      "reason": "third_party_pii",
      "redacted_at": "2026-06-15T14:05:00Z"
    }
  ]
}
```

Importers MUST NOT treat omissions as deletion of lineage in the source system — only as non-export of those artifacts.

## Third-party data

Provenance in `derived_from` may reference third-party conversations or documents. Exporters SHOULD redact third-party PII from bundled content while preserving URI references where possible.

## Surveillance caution (normative reminder)

Implementers MUST document in their privacy policy that provenance capture creates a high-fidelity behavioral profile. Portable Soul makes that profile **exportable** — which is a feature for portability and a risk for misuse.
