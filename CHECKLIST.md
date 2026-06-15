# Portability checklist

A binary checklist for procurement teams and developers evaluating AI platforms. No letter grades. No paid certification. Either the platform passes the tier, or it doesn't.

Run the open verifier yourself — no vendor attestation required:

```bash
cd tools && npm install
node verify.mjs <exported-bundle> --level 0   # or --level 1
```

## Level 0 — Export token capital

Minimum bar: can you leave without amnesia?

| # | Check | Pass criteria |
|---|-------|---------------|
| 1 | **Export exists** | Platform produces a `.soul` directory or archive |
| 2 | **Open formats** | Knowledge is OKF markdown and/or skills are `SKILL.md` |
| 3 | **Basic provenance** | Each exported item has who/when/source (four `prov_*` fields) |
| 4 | **Integrity** | `manifest.json` lists files with matching SHA-256 hashes |
| 5 | **Open verification** | Bundle passes `verify.mjs --level 0` without a vendor registry |

**Fail example:** Export is a proprietary JSON blob with no lineage.

## Level 1 — Declare the harness

Blog-complete: transparency + structured provenance.

| # | Check | Pass criteria |
|---|-------|---------------|
| 6 | **Nutrition label** | Runtime or snapshot `agent.yaml` declares models, memory, tools |
| 7 | **Full provenance** | W3C PROV lineage on entities; sovereignty in assertions layer |
| 8 | **Memory graph** | Temporal memory exports as JSON-LD (not raw vectors alone) |
| 9 | **No hidden ownership** | License/sovereignty claims are filterable assertions, not baked-in locks |
| 10 | **Level 1 verify** | Bundle passes `verify.mjs --level 1` |

**Fail example:** Model is swappable but orchestration harness and MCP tools are undeclared.

## Level 2 — Enterprise hardening (optional)

| # | Check | Pass criteria |
|---|-------|---------------|
| 11 | **Erasure** | Subject can tombstone entities; lineage preserved, content redacted |
| 12 | **Signing** | Optional C2PA or self-issued credentials; no proprietary CA required |
| 13 | **Subject export** | Person can export all provenance describing them |

## Quick vendor conversation

Ask these five questions:

1. "Show me a Level 0 `.soul` export of my skills and knowledge."
2. "What's in your `agent.yaml` — models, memory, tools, connectors?"
3. "Can I filter export by sovereignty tag (`user_sovereign` vs `org_proprietary`)?"
4. "If I leave, do I keep provenance — who created what, when?"
5. "Can I verify the bundle with your tool **or** the open Portable Soul verifier?"

If the answer to #1 is no, the platform is a gatekeeper to your token capital.
