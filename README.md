# Portable Soul

**Version:** 0.5.0-draft  
**Status:** Proposal for Community Review  
**Home:** [github.com/db-aeon/portable-soul](https://github.com/db-aeon/portable-soul)

Portable Soul is an open specification for making AI systems' accumulated knowledge portable. Model swap alone is not enough — lock-in now forms in the harness, orchestrator, memory layer, and tools that compound learning over time. This spec defines how to declare that full application stack (`agent.yaml`), record where every piece of knowledge came from (W3C PROV lineage), and export it in vendor-neutral formats: OKF markdown for knowledge, Agent Skills for workflows, and a PROV-compatible graph for memory. Ownership and licensing are modeled as contestable assertions on top of immutable lineage — the spec records facts, it does not adjudicate who owns what. The goal is simple: your system's song should not belong to whoever holds the box.

## Quick start

```bash
# Install verifier dependencies (standalone; no parent repo required)
cd portable-soul/tools && npm install

# Verify the reference bundle
node verify.mjs ../examples/reference-bundle/

# JSON output for CI
node verify.mjs ../examples/reference-bundle/ --json
```

## Contents

| Document | Purpose |
|----------|---------|
| [SPEC.md](SPEC.md) | Normative specification (RFC 2119) |
| [glossary.md](glossary.md) | Term definitions |
| [uri-schemes.md](uri-schemes.md) | Normative URI patterns |
| [privacy-and-erasure.md](privacy-and-erasure.md) | Tombstoning, subject rights, selective disclosure |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [schemas/](schemas/) | JSON Schemas for validation |
| [profiles/](profiles/) | OKF, Agent Skills, and memory-graph bindings |
| [examples/](examples/) | Sample manifests and reference bundle |
| [conformance/](conformance/) | Criteria and test vectors |
| [tools/verify.mjs](tools/verify.mjs) | Open-source conformance verifier |

## Reference bundle

A minimal conformant unpacked bundle lives at [`examples/reference-bundle/`](examples/reference-bundle/). It demonstrates:

- Composition snapshot (`agent.yaml`)
- OKF knowledge with provenance frontmatter
- Agent Skills with `provenance.json`
- PROV-compatible memory graph (JSON-LD)
- Contestable assertions (including conflicting license claims)

## Design principles

1. **Declare the whole application layer** — models, harnesses, orchestrators, memory, tools, and connectors.
2. **Record lineage, don't adjudicate ownership** — W3C PROV for facts; assertions for claims.
3. **Define interfaces, not implementations** — reference bindings are SHOULD-level.
4. **Resist becoming the new gate** — verification with open tooling and self-issued credentials.

## License

Specification text and schemas: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).  
Verifier tooling: MIT (see [tools/package.json](tools/package.json)).

## Contributing

Propose changes via pull request to this repository:

- Schema updates in `schemas/`
- Reference bundle updates when normative behavior changes
- Passing `verify.mjs` on `examples/reference-bundle/`
