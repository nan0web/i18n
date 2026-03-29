# Release v1.4.0: Break Circular Dependency & Stabilize I18nDb

[English](./task.en.md) | [Українська](./task.md)

## Mission

Eliminate the circular dependency `@nan0web/core ↔ @nan0web/i18n` and stabilize hierarchical translation loading in `I18nDb`.

### Problem
`@nan0web/core` depended on `@nan0web/i18n` (via `createT`), and `@nan0web/i18n` depended on `@nan0web/core` (via `Model`). This created a circular dependency that broke ESM resolution on Node.js v25+.

### Solution
1. Base `Model` class moved to `@nan0web/types` (v1.7.0).
2. `@nan0web/core` re-exports `Model` for backward compatibility.
3. `@nan0web/i18n` depends only on `@nan0web/types`, not on `@nan0web/core`.

## Acceptance Criteria

- [ ] `@nan0web/core` is absent from `dependencies` and `devDependencies` of `@nan0web/i18n`
- [ ] `Language` model imports `Model` from `@nan0web/types`
- [ ] `@nan0web/types` dependency version is `^1.7.0`+
- [ ] `I18nDb.loadT` builds paths via explicit join (no `db.resolveSync`)
- [ ] `I18nDb.createT` uses `db.absolute()` for proper locale URI resolution
- [ ] Hierarchical loading works correctly (parent → child fallback)
- [ ] `knip` finds no unused dependencies

## Architecture Audit

- [x] Ecosystem indices reviewed? (Yes)
- [x] Analogues exist in packages? (This is the base i18n package)
- [x] Data sources: Model-as-Schema, YAML vocabularies
- [x] UI standard compliance? (N/A — infrastructure release)
