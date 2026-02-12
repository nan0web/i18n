# v1.0.4 — Fix missing runtime dependency @nan0web/db-fs

## Mission

Fix `ERR_MODULE_NOT_FOUND: @nan0web/db-fs` when using `npx i18n generate`. The package `@nan0web/db-fs` is used in `bin/*.js` but was listed as a devDependency.

## Changes

1. **Move `@nan0web/db-fs`** from `devDependencies` to `dependencies` in `package.json`.
2. **Bump version** to `1.0.4`.

## Verification

- `task.spec.js`: Verify that `@nan0web/db-fs` is listed in `dependencies`.
