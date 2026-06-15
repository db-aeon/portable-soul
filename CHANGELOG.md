# Changelog

## [0.6.0-draft] — 2026-06-15

### Added

- **Conformance tiers** — Level 0 (start here), Level 1 (full), Level 2 (enterprise)
- [GETTING-STARTED.md](GETTING-STARTED.md) — first export in 30 minutes
- [CHECKLIST.md](CHECKLIST.md) — procurement pass/fail rubric (replaces "scorecard" framing)
- Level 0 reference bundle: `examples/reference-bundle-l0/`
- Minimal schemas: `agent.manifest.minimal.schema.json`
- Sovereignty vocabulary: `user_sovereign`, `org_proprietary`, `portable`, `shared_team`
- Verifier `--level 0|1|2` flag
- `sovereignty` assertion claim type

### Changed

- README restructured around four pillars and tiers
- SPEC.md shortened; tier requirements upfront
- `bundle.manifest.schema.json` — relaxed IDs at Level 0; `conformance_level` field
- `agent.manifest.schema.json` — Level 1; plain `agent_id` strings allowed
- Level 0 provenance: four fields (`prov_created_at`, `prov_created_by`, `prov_source`, + recommended `prov_sovereignty`)
- Memory graph optional at Level 0, required at Level 1
- C2PA and erasure deferred to Level 2
- `build-manifest.mjs` simplified; accepts `--level`

### Unchanged

- Level 1 reference bundle structure (updated to 0.6.0-draft version strings)
- W3C PROV, OKF, Agent Skills as export formats
- Anti-gatekeeping principle

## [0.5.0-draft] — 2026-06-15

Initial structured specification with JSON Schemas, reference bundle, and verifier.

## [0.4.0-draft] — 2026-06-14

Initial community review prose draft.
