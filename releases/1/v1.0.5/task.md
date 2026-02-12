# v1.0.5 — Fix transitive dependency @nan0web/log

## Mission

Fix `ERR_MODULE_NOT_FOUND: Cannot find package '@nan0web/log'` when running `npx @nan0web/i18n generate`.

The root cause: `@nan0web/db-fs` has `@nan0web/db` as a **peerDependency**, and `@nan0web/db` depends on `@nan0web/log`. In the `npx` flat install tree, peer dependencies' own transitive dependencies are not guaranteed to be installed.

## Changes

1. **Add `@nan0web/db`** to `dependencies` — required by `db-fs` at runtime.
2. **Add `@nan0web/event`** to `dependencies` — also a peer dependency of `db-fs`.
3. **Bump version** to `1.0.5`.

## Verification

- `task.spec.js`: Verify that `@nan0web/db` and `@nan0web/event` are in `dependencies`.
- Verify the version is `1.0.5`.
