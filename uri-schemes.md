# URI schemes

Portable Soul uses the reserved URN namespace `urn:psoul:` for identifiers that MUST be stable across export and import. Systems MAY use additional URI schemes in `derived_from` references when the source is external (HTTP, `mailto:`, etc.).

## Agent identifiers

```
urn:psoul:agent:{slug}
```

- `{slug}`: lowercase alphanumeric plus hyphens; 3–64 characters.
- Example: `urn:psoul:agent:core-principal-09e`
- Assigned by the deploying organization; MUST be unique within the exporter's namespace.

## Entity identifiers

```
urn:psoul:entity:{hash-prefix}
```

- `{hash-prefix}`: first 16 hex characters of SHA-256 over the **canonical entity payload** (see SPEC.md §Entity identity).
- Example: `urn:psoul:entity:9f2c4a1b8e3d7f60`
- A content amendment MUST produce a new `entity_id` with `derived_from` linking to the prior entity.

## Implementation identifiers

```
urn:psoul:impl:{slug}
```

- Identifies a harness, memory engine, or tool implementation for declaration purposes.
- Example: `urn:psoul:impl:example-harness`

## Session references

```
urn:psoul:session:{iso8601-utc}#{fragment}
```

- `{iso8601-utc}`: session start timestamp, UTC, `YYYY-MM-DDTHH:mm:ssZ` (no sub-second precision required).
- `{fragment}`: turn or message identifier within the session.
- Examples:
  - `urn:psoul:session:2026-06-14T17:22:00Z#turn-12`
  - `urn:psoul:session:2026-06-14T17:22:00Z#msg-a4f2`

## Workspace references

```
urn:psoul:workspace:{slug}
```

- `{slug}`: lowercase alphanumeric plus hyphens; 1–64 characters.
- Example: `urn:psoul:workspace:incident-response`

## Activity type identifiers

```
urn:psoul:activity:{verb}
```

- Core verbs (closed set): `memory.retain`, `memory.recall`, `memory.reflect`, `skill.author`, `skill.amend`, `knowledge.extract`, `knowledge.generalize`, `import.merge`, `export.filter`, `erasure.tombstone`
- Extension: `urn:psoul:activity:x-{vendor-slug}-{verb}` for custom activities (non-normative naming convention).

## Bundle identifiers

```
urn:psoul:bundle:{uuid}
```

- `{uuid}`: RFC 4122 UUID string (lowercase hex with hyphens).
- Example: `urn:psoul:bundle:550e8400-e29b-41d4-a716-446655440000`

## Person and organization actors

In provenance and assertions, human and org actors use prefixed opaque IDs:

| Prefix | Example | Meaning |
|--------|---------|---------|
| `user:` | `user:jdoe` | Person (opaque to spec; may map to SSO subject) |
| `org:` | `org:acme-corp` | Organization |
| `service:` | `service:mail-sync` | Named internal service |

Systems SHOULD NOT embed PII (email, legal name) in these IDs within exported bundles unless the subject has consented to that export.

## Content hashes

Content integrity uses the `sha256:` prefix:

```
sha256:{64-hex-chars}
```

Example: `sha256:9f2c4a1b8e3d7f6012345678abcdef0123456789abcdef0123456789abcdef01`

## External references in `derived_from`

When lineage points outside the Portable Soul namespace, `source` MUST be a valid URI and `kind` SHOULD classify it:

| `kind` | Example source |
|--------|----------------|
| `conversation` | `urn:psoul:session:…#turn-N` |
| `document` | `https://example.com/docs/runbook.md` |
| `connector` | `urn:psoul:connector:mail/thread-8821` |
| `import` | `urn:psoul:bundle:…` |
| `skill` | `urn:psoul:entity:…` (prior skill entity) |
