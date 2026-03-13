# Release v1.2.0: Move Translations to `data/*/t.yaml`

[English](./task.en.md) | [Ukrainian](./task.md)

## Mission
Remove `src/vocabs` and move system translation storage to YAML format in the `data` directory.
All translations should be stored in `t.yaml` files according to the locale structure.

## Acceptance Criteria
- [ ] `src/vocabs` directory is removed.
- [ ] Existing translations from `src/vocabs/uk.js` migrated to `data/uk/t.yaml`.
- [ ] `I18nDb` by default uses `t.yaml` for loading and syncing.
- [ ] `bin/generate.js` updated for new paths.
- [ ] `bin/sync.js` updated to use YAML by default.
- [ ] All tests pass (`npm test`).

## Architecture Audit
- [x] ECO indexes read? (Yes, `packages/i18n/project.md`)
- [x] Analogs in packages? (No, this is base i18n package)
- [x] Data sources: YAML.
- [ ] UI Standard compliance? (N/A, logic/CLI package)
