# Test vectors

Run from `tools/` after `npm install`.

## Level 0 — reference-bundle-l0

```bash
node verify.mjs ../examples/reference-bundle-l0 --level 0
```

**Expected:** exit `0`

## Level 1 — reference-bundle

```bash
node verify.mjs ../examples/reference-bundle --level 1
```

**Expected:** exit `0`

## Negative fixtures

```bash
node verify.mjs ../examples/nonconformant/bad-hash --level 0        # exit 1
node verify.mjs ../examples/nonconformant/hidden-ownership --level 0 # exit 1
node verify.mjs ../examples/nonconformant/missing-okf-prov --level 0 # exit 1
```

## Regenerate manifests

```bash
node build-manifest.mjs ../examples/reference-bundle-l0 --level 0
node build-manifest.mjs ../examples/reference-bundle --level 1
```

## CI

```bash
npm install
node verify.mjs ../examples/reference-bundle-l0 --level 0 --json
node verify.mjs ../examples/reference-bundle --level 1 --json
```
