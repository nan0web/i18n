# Release v1.5.0: i18n Universal Inspector (MaSaA v2)

> **Mission**: Implement a deterministic architectural auditor for i18n integrity.

[Ukrainian Version](task.md)

## 🎯 Acceptance Criteria
- [ ] Command `i18n inspect` is available via CLI.
- [ ] Auditor extracts translation keys from `static UI` and `static help` in domain models.
- [ ] Auditor detects forbidden hardcoded strings in UI components (e.g. `t('plain text')` vs `t(MyModel.UI.label)`).
- [ ] Auditor synchronizes extracted keys with the target vocabulary (`t.nan0`).
- [ ] Zero-LLM architecture: Logic must use AST/Regex parsing, not AI calls.

## 📐 Architecture Audit
- [x] Read Ecosystem Indexes? (Yes, /i18n)
- [x] Analogues in packages? (No, this IS the core i18n tool)
- [x] Data sources: YAML (`t.nan0`), JS (models)
- [x] UI Standard: CLI Output
