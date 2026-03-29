# Release v1.4.0: Розрив циклічної залежності та стабілізація I18nDb

[English](./task.en.md) | [Українська](./task.md)

## Місія

Ліквідація циклічної залежності `@nan0web/core ↔ @nan0web/i18n` та стабілізація ієрархічного завантаження перекладів у `I18nDb`.

### Проблема
`@nan0web/core` залежав від `@nan0web/i18n` (через `createT`), а `@nan0web/i18n` залежав від `@nan0web/core` (через `Model`). Це створювало циркулярну залежність, яка ламала ESM-резолв у Node.js v25+.

### Рішення
1. Базовий клас `Model` перенесено в `@nan0web/types` (v1.7.0).
2. `@nan0web/core` реекспортує `Model` для зворотної сумісності.
3. `@nan0web/i18n` залежить тільки від `@nan0web/types`, не від `@nan0web/core`.

## Acceptance Criteria

- [ ] `@nan0web/core` відсутній у `dependencies` та `devDependencies` пакета `@nan0web/i18n`
- [ ] `Language` модель імпортує `Model` з `@nan0web/types`
- [ ] `@nan0web/types` у залежностях має версію `^1.7.0`+
- [ ] `I18nDb.loadT` будує шляхи через explicit join (без `db.resolveSync`)
- [ ] `I18nDb.createT` використовує `db.absolute()` для правильного формування локалізованого URI
- [ ] Ієрархічне завантаження працює коректно (parent → child fallback)
- [ ] `knip` не знаходить зайвих залежностей

## Architecture Audit

- [x] Чи прочитано Індекси екосистеми? (Так)
- [x] Чи існують аналоги в пакетах? (Це базовий пакет i18n)
- [x] Джерела даних: Model-as-Schema, YAML vocabularies
- [x] Чи відповідає UI-стандарту? (N/A — інфраструктурний реліз)
