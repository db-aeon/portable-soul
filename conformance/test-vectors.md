# Test vectors

Expected outcomes for [`tools/verify.mjs`](../tools/verify.mjs). Run from `portable-soul/tools/` after `npm install`.

## Positive vector: reference-bundle

**Path:** `../examples/reference-bundle/`

**Expected:** Exit code `0`

**Checks that MUST pass:**

| Check ID | Description |
|----------|-------------|
| `manifest.schema` | `manifest.json` validates |
| `artifact.integrity` | All 8 artifacts match `artifact_index` hashes |
| `agent.schema` | `agent.yaml` validates |
| `okf.provenance` | Both knowledge files have required `prov_*` fields |
| `okf.hash` | `prov_content_hash` matches markdown body |
| `skill.provenance` | `provenance.json` validates |
| `skill.hash` | `content_hash` matches `SKILL.md` |
| `memory.graph` | `graph.jsonld` validates |
| `provenance.no-ownership` | No forbidden fields in provenance records |

**Known entity IDs (content-derived):**

| Entity | ID |
|--------|-----|
| Preference (OKF) | `urn:psoul:entity:35698febaf1bf3ef` |
| Triage playbook (OKF) | `urn:psoul:entity:3607810065c1af98` |
| triage-incident skill | `urn:psoul:entity:f9ddd401cb64a131` |

**Conflicting assertions preserved on preference entity:**

- `license: portable` (org:acme-corp)
- `license: internal-only` (user:legal-reviewer)

## Negative vector: bad-hash

**Path:** `../examples/nonconformant/bad-hash/`

**Expected:** Exit code `1`

**First failing check:** `artifact.integrity` — SHA-256 mismatch on `knowledge/bad.md`

## Negative vector: hidden-ownership

**Path:** `../examples/nonconformant/hidden-ownership/`

**Expected:** Exit code `1`

**First failing check:** `provenance.no-ownership` — `license` field in `memory/entity.json`

Note: manifest hash for this fixture is intentionally invalid; verifier reports manifest/integrity errors before or alongside ownership check depending on check order.

## Negative vector: missing-okf-prov

**Path:** `../examples/nonconformant/missing-okf-prov/`

**Expected:** Exit code `1`

**First failing check:** `okf.provenance` — missing `prov_entity_id` and related fields

## CI invocation

```bash
cd portable-soul/tools
npm install
node verify.mjs ../examples/reference-bundle/ --json
node verify.mjs ../examples/nonconformant/bad-hash/ --json || true
node verify.mjs ../examples/nonconformant/hidden-ownership/ --json || true
node verify.mjs ../examples/nonconformant/missing-okf-prov/ --json || true
```

## Regenerating reference-bundle hashes

After editing reference bundle content:

```bash
node portable-soul/tools/build-manifest.mjs portable-soul/examples/reference-bundle/
```

Then re-run verify and update entity ID table in this file if content changed.
