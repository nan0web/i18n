# v1.0.3 — Fix package publishing (missing `bin/` files)

## Mission

Fix critical publishing bug where `bin/` directory was excluded from npm package,
causing `npx i18n generate` to fail with `ERR_MODULE_NOT_FOUND` in all consuming apps.

## Source

- `REQUESTS.md` — Request #1 from `@industrialbank/branches`
- `REQUESTS.md` — Request #2 from `@industrialbank/credits`

## Changes

1. **`package.json`**: Added `"bin/**/*.js"` to `"files"` array
2. **`package.json`**: Bumped version `1.0.2` → `1.0.3`
3. **Removed**: Empty `scripts/` directory (stale artifact from previous version)

## Verification

```bash
npm pack --dry-run   # verify bin/ files are included
pnpm test            # unit tests pass
```
