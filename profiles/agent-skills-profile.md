# Agent Skills profile (Portable Soul binding)

Portable Soul skill export uses the open [Agent Skills](https://agentskills.io) format (`SKILL.md` in a directory) as its reference workflow binding, with a required sidecar provenance record.

## Bundle layout

```
skills/
└── {skill-name}/
    ├── SKILL.md
    ├── provenance.json
    └── references/           # OPTIONAL — supporting docs
        └── *.md
```

## SKILL.md requirements

Per Agent Skills conventions, `SKILL.md` MUST include YAML frontmatter with at least:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | **MUST** | Skill identifier (matches directory name) |
| `description` | **MUST** | When to load this skill |

Portable Soul does not add required fields to `SKILL.md` frontmatter. All provenance lives in `provenance.json`.

## provenance.json

Each skill directory MUST contain `provenance.json` validating against [`entity.provenance.schema.json`](../schemas/entity.provenance.schema.json) with:

- `entity_type`: **MUST** be `skill`
- `content`: **MUST** be the full UTF-8 text of `SKILL.md` (including frontmatter)
- `content_hash`: SHA-256 of `content` per SPEC §Content hashes

### Version lineage

When a skill is amended, producers MUST:

1. Create a new `entity_id` (content changed → new hash).
2. Set `prov.generated_by.activity` to `urn:psoul:activity:skill.amend`.
3. Include `derived_from` entry with `kind: skill` or `kind: prior_version` pointing to the prior skill entity URI.

### Example provenance.json

```json
{
  "entity_id": "urn:psoul:entity:b7e4f2a19c3d5860",
  "entity_type": "skill",
  "content": "---\nname: triage-incident\n...",
  "content_hash": "sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
  "prov": {
    "generated_by": {
      "activity": "urn:psoul:activity:skill.amend",
      "agent": { "type": "software", "id": "urn:psoul:agent:core-principal-09e" },
      "on_behalf_of": { "type": "person", "id": "user:jdoe" }
    },
    "derived_from": [
      {
        "source": "urn:psoul:entity:a1b2c3d4e5f67890",
        "kind": "prior_version"
      },
      {
        "source": "urn:psoul:session:2026-06-14T17:22:00Z#turn-12",
        "kind": "conversation"
      }
    ],
    "generated_at": "2026-06-15T09:30:00Z",
    "in_context": "urn:psoul:workspace:incident-response"
  }
}
```

## References subdirectory

Files under `references/` are supporting material. If exported, each file SHOULD have its own provenance record in `memory/graph.jsonld` or as a separate OKF concept in `knowledge/`.

## Assertions

License and data-class claims about a skill MUST appear in `assertions/entities.json` (or equivalent bundle assertions file), NOT in `provenance.json` or `SKILL.md`.

## Import behavior

Importers MUST:

1. Validate `provenance.json` against schema.
2. Verify `content_hash` matches on-disk `SKILL.md`.
3. Install skill to the target skills directory preserving `name`.
4. Preserve full lineage; accumulate conflicting assertions without resolution.

## Export filter example

"Export every skill Entity with a `license: portable` assertion" — filter on assertions, include matching `skills/{name}/` trees with full provenance.
