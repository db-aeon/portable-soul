# Getting started

Export your first portable `.soul` bundle in about 30 minutes. No graph database, no URNs, no cryptography — just open files with basic provenance.

## What you're building

A folder (or `.tar.gz`) that contains:

- `manifest.json` — file list with SHA-256 hashes
- `knowledge/` — OKF markdown files **or** `skills/` — Agent Skills directories
- Optional `agent.yaml` — a simple "nutrition label" for your stack

That's **Level 0** conformance. Enough to move skills and context off a closed platform without cognitive amnesia.

## Step 1 — Create a knowledge file

```markdown
---
type: Playbook
title: "My first portable knowledge"
prov_created_at: "2026-06-15T12:00:00Z"
prov_created_by: "user:me"
prov_source: "manual"
prov_sovereignty: user_sovereign
---
# My heuristic

Always document agent workflows as SKILL.md, not proprietary JSON.
```

Required OKF field: `type`. Required provenance: the four `prov_*` fields above. `prov_sovereignty` is recommended — use `user_sovereign`, `org_proprietary`, `portable`, or `shared_team`.

## Step 2 — Create a skill (optional)

```
skills/my-skill/
└── SKILL.md
```

```markdown
---
name: my-skill
description: When to load this skill.
prov_created_at: "2026-06-15T12:00:00Z"
prov_created_by: "user:me"
prov_source: "manual"
prov_sovereignty: user_sovereign
---

# My Skill

Steps go here.
```

At Level 0, provenance can live in `SKILL.md` frontmatter — no `provenance.json` required.

## Step 3 — Optional nutrition label

`agent.yaml` is optional at Level 0:

```yaml
spec_version: "0.6.0-draft"
conformance_level: 0
agent_id: "my-assistant"
models:
  - provider: ExampleCloud
    endpoint: gpt-4o
memory:
  - name: my-memory
    exportable: true
```

## Step 4 — Build manifest

```bash
cd tools && npm install
node build-manifest.mjs ../examples/my-first-bundle --level 0
```

`build-manifest.mjs` walks the directory, hashes every file, and writes `manifest.json`.

## Step 5 — Verify

```bash
node verify.mjs ../examples/my-first-bundle --level 0
```

Pass = Level 0 conformant. Ship the folder or `tar -czf my-export.soul.tar.gz -C my-first-bundle .`

## Next steps (Level 1)

When you need full harness transparency, W3C PROV lineage, memory graph export, and sovereignty assertions:

- See [`examples/reference-bundle/`](examples/reference-bundle/) (Level 1 reference)
- Run `node verify.mjs ../examples/reference-bundle --level 1`
- Read [SPEC.md](SPEC.md) § Conformance tiers

## Sovereignty tags

Tags describe **who the knowledge belongs to** — they are export metadata, not locks the platform enforces:

| Value | Typical use |
|-------|-------------|
| `user_sovereign` | Personal heuristics, coding style, preferences |
| `org_proprietary` | Source code patterns, customer data workflows |
| `portable` | Safe to move across vendors |
| `shared_team` | Team playbooks, shared across org |

Filter exports: "give me everything tagged `portable` or `user_sovereign`."
