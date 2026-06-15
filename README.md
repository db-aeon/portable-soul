# Portable Soul

**Version:** 0.6.0-draft  
**Status:** Proposal for Community Review  
**Home:** [github.com/db-aeon/portable-soul](https://github.com/db-aeon/portable-soul)

Model swap alone doesn't solve lock-in. The learning loop — harness, orchestrator, memory, tools — is where token capital compounds. Portable Soul is an open specification for declaring that stack, tracking where knowledge came from, and exporting it in formats you can take anywhere. The goal is simple: data, learnings, and compounding knowledge belong to the *users* of agentic systems — not whoever holds the box.

**Start here:** [GETTING-STARTED.md](GETTING-STARTED.md) — export your first `.soul` bundle in 30 minutes.

## Four pillars

### 1. Nutrition label (`agent.yaml`)

Declare what's under the hood: orchestration harness, LLM endpoints, memory systems, tools, and connectors. No black boxes. Optional at Level 0; required at Level 1.

### 2. Provenance and sovereignty boundaries

Every piece of exported knowledge carries lineage — who created it, when, from what source. Sovereignty tags (`user_sovereign`, `org_proprietary`, `portable`, `shared_team`) are first-class export metadata you can filter on. They are claims, not locks — but they resolve the "cognitive BYOD" problem before it starts.

### 3. The `.soul` export archive

Hit export; get a verifiable bundle using open 2026 standards:

| Content | Format |
|---------|--------|
| Context & playbooks | [OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog) markdown |
| Executable skills | [Agent Skills](https://agentskills.io) `SKILL.md` |
| Memory (Level 1+) | PROV-compatible JSON-LD graph — structured lineage, not raw embedding dumps |

### 4. Portability checklist

Binary pass/fail checks for vendors and builders — no letter grades, no proprietary verifier. See [CHECKLIST.md](CHECKLIST.md).

## Conformance tiers

| Tier | What you ship | Verify |
|------|---------------|--------|
| **Level 0** | `manifest.json` + OKF knowledge and/or skills with basic provenance | `verify.mjs --level 0` |
| **Level 1** | + full `agent.yaml`, W3C PROV, memory graph, assertions | `verify.mjs --level 1` |
| **Level 2** | + erasure/tombstoning, optional signing (enterprise) | Spec + privacy profile |

## Quick start

```bash
cd tools && npm install
node verify.mjs ../examples/reference-bundle-l0 --level 0
node verify.mjs ../examples/reference-bundle --level 1
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [GETTING-STARTED.md](GETTING-STARTED.md) | First export in 30 minutes |
| [CHECKLIST.md](CHECKLIST.md) | Procurement pass/fail rubric |
| [SPEC.md](SPEC.md) | Normative specification (tiered) |
| [examples/reference-bundle-l0/](examples/reference-bundle-l0/) | Level 0 golden bundle |
| [examples/reference-bundle/](examples/reference-bundle/) | Level 1 golden bundle |

## Design principles

1. **Start small** — Level 0 is useful on day one.
2. **Record lineage, don't adjudicate ownership** — provenance is fact; sovereignty tags are filterable claims.
3. **Open formats only** — OKF, Agent Skills, PROV JSON-LD.
4. **No new gate** — verify with open tooling; self-issued credentials OK.

## License

Specification text and schemas: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).  
Verifier tooling: MIT.

## Contributing

Pull requests welcome. Level 0 changes must pass `verify.mjs --level 0` on `examples/reference-bundle-l0/`. Level 1 changes must also pass `--level 1` on `examples/reference-bundle/`.
