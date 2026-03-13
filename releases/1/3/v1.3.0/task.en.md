# Release v1.3.0: Model-First Extraction

[English](./task.en.md) | [Українська](./task.md)

## Mission
Implementation of architectural requests regarding `extractFromModels()`:
1. Collection of translation keys from all live `Model-as-Schema` objects (`static` fields).
2. "Flat" extraction from all nested objects and arrays inside static properties starting with `UI` (e.g. `UI`, `uiConfig`, `ui_text`).

## Acceptance Criteria
- [x] The `extractFromModels` function iterates over the `static` fields of models.
- [x] Extracts dynamic predefined keys (`help`, `label*`, `error*`, `placeholder*`, etc.) outside of UI sections.
- [x] Collects all text values inside properties that start with `UI` (regardless of nesting level and key name).
- [x] Contract tests in `task.spec.js` pass successfully.

## Architecture Audit
- [x] Read ecosystem indices? (Yes)
- [x] Existing analogs in packages? (No, this is the core i18n package)
- [x] Data sources: Model-as-Schema classes.
- [x] Adheres to UI standards? (N/A)
