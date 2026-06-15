# Conformance criteria (tiered)

## Level 0 — Export token capital

Verified by `node verify.mjs <bundle> --level 0`.

| ID | Criterion |
|----|-----------|
| L0-1 | `manifest.json` validates (`spec_version: 0.6.0-draft`) |
| L0-2 | All `artifact_index` entries match SHA-256 and byte size |
| L0-3 | At least one of `knowledge/**/*.md` or `skills/*/SKILL.md` |
| L0-4 | Knowledge files have OKF `type` + `prov_created_at`, `prov_created_by`, `prov_source` |
| L0-5 | Skills have L0 provenance in frontmatter (or optional `provenance.json`) |
| L0-6 | No `license`/`ownership`/`data_class` in provenance records |
| L0-7 | `agent.yaml` optional; if present, validates minimal schema |

**Golden bundle:** [`examples/reference-bundle-l0/`](../examples/reference-bundle-l0/)

## Level 1 — Declare the harness

Verified by `node verify.mjs <bundle> --level 1`. Includes all Level 0 checks where applicable.

| ID | Criterion |
|----|-----------|
| L1-1 | Full `agent.yaml` validates |
| L1-2 | OKF knowledge has full `prov_*` extensions + content hash |
| L1-3 | Each skill has `provenance.json` validating entity schema |
| L1-4 | `memory/graph.jsonld` present and validates |
| L1-5 | Sovereignty/license in assertions only, not provenance |

**Golden bundle:** [`examples/reference-bundle/`](../examples/reference-bundle/)

## Level 2 — Enterprise

Level 1 plus:

| ID | Criterion |
|----|-----------|
| L2-1 | `assertions/entities.json` present |
| L2-2 | Erasure/tombstone support documented per privacy profile |

## Negative fixtures

| Fixture | Fails |
|---------|-------|
| `nonconformant/bad-hash/` | L0-2 |
| `nonconformant/hidden-ownership/` | L0-6 |
| `nonconformant/missing-okf-prov/` | L0-4 |

See [CHECKLIST.md](../CHECKLIST.md) for procurement-facing language.
