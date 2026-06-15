# Portable Soul

**Version:** 0.5.0-draft  
**Status:** Proposal for Community Review  
**Home:** [github.com/db-aeon/portable-soul](https://github.com/db-aeon/portable-soul)

Portable Soul is a vendor-agnostic specification for declaring how an AI system is composed, recording the provenance of the knowledge it accrues, and exporting that knowledge in portable open formats.

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

This package may be extracted to a dedicated repository. Until then, propose changes via pull request with:

- Schema updates in `schemas/`
- Reference bundle updates when normative behavior changes
- Passing `verify.mjs` on `examples/reference-bundle/`
