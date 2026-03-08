# @nan0web/i18n — Model-First i18n Architecture

> Цей документ є авторитетним описом архітектурного принципу **"Тексти тільки з моделей"**.
> Посилання з: [`nan.web/system.md`](../../system.md) § Універсальна Локалізація, п.4

---

## Принцип

**Всі написи UI визначаються виключно у Моделях (Model-as-Schema).**

```
✅ Model.field.help → t(Model.field.help) → UI-рендер

❌ t('hardcoded string') — КАТЕГОРИЧНО ЗАБОРОНЕНО
❌ Не-експортовані моделі з ключами перекладу
```

Ніякого hardcoded тексту у:

- Адаптерах (CLI, Web, Electron)
- IDE (Master IDE, Sovereign Workbench)
- Sandbox (OlmuiInspector)
- Scaffold / layout коді
- Docs-site генераторах

## Обов'язковий Експорт Моделей

> **Правило**: Кожна модель, що містить поля для перекладу (`help`, `label*`, `error*`, `placeholder*`, `title*`, `message*`), **ОБОВ'ЯЗКОВО** має бути **експортована** (`export class`).

Без `export` команда `npx i18n sync` не зможе імпортувати файл і зібрати ключі.

### Конкретний приклад

**1. Модель домену** — `src/domain/Language.js`:

```js
// ✅ ПРАВИЛЬНО: export class
export class Language {
  static title = {
    help: 'Language title', // ← i18n key
    default: '',
  }
  static locale = {
    help: 'Locale', // ← i18n key
    errorNotFound: 'Locale not found', // ← i18n key
    errorInvalidFormat: 'Invalid locale format', // ← i18n key
    default: 'en_GB',
    validate: (str) => /^[a-z]{2}(_[A-Z]{2})?$/.test(str) || Language.locale.errorInvalidFormat,
  }
  static icon = {
    help: 'Language icon', // ← i18n key
    default: '🇬🇧',
  }
}
```

**2. UI повідомлення адаптера** — `play/main.js`:

```js
// ✅ ПРАВИЛЬНО: export class (навіть якщо це просто UI-тексти)
export class PlaygroundMessages {
  static banner = { help: '=== @nan0web/i18n CLI Playground ===' }
  static intro = { help: 'Demonstrating translated Model-as-Schema...' }
  static footer = { help: 'Check the play/ folder for examples.' }
}
```

**3. Використання в адаптері** — нуль рядкових літералів:

```js
import { Language } from './src/domain/Language.js'
import { PlaygroundMessages } from './play/main.js'

// ✅ Всі t() — лише з Model references
p(t(PlaygroundMessages.intro.help))
p(t(Language.title.help))
p(t(Language.locale.errorNotFound))

// ❌ ЗАБОРОНЕНО:
// p(t('Language title'))
// p('Some hardcoded string')
```

**4. Результат `npx i18n sync`** — `data/uk/_/t.yaml`:

```yaml
# Автоматично зібрані ключі з Моделей:
Language title: Назва мови
Locale: Локаль
Locale not found: Локаль не знайдено
Invalid locale format: Невірний формат локалі
Language icon: Іконка мови
=== @nan0web/i18n CLI Playground ===: === CLI-пісочниця @nan0web/i18n ===
```

## Джерело ключів

`@nan0web/i18n` автоматично збирає ключі з:

1. **Експортованих Моделей домену** — `export class Model { static field = { help: '...' } }`
2. **Експортованих UI Messages** — `export class ViewMessages { static title = { help: '...' } }`

Це **єдині** два джерела для перекладних ключів. Все інше — ЗАБОРОНЕНО.

### Поля, що підлягають екстракції

Екстрактор шукає _значення_ полів, чиї імена починаються з:

| Поле           | Призначення                                    |
| -------------- | ---------------------------------------------- |
| `help*`        | Підказка / опис                                |
| `label*`       | Мітка елемента                                 |
| `placeholder*` | Placeholder інпута                             |
| `title*`       | Заголовок                                      |
| `message*`     | Повідомлення                                   |
| `error*`       | Повідомлення про помилку                       |
| `value*`       | Значення (окрім `value` всередині `options[]`) |

## $search — Пошукові теги (per-language)

Кожна мова зберігає локалізовані пошукові теги для компонентів:

```yaml
$Button:
  $search: 'кнопка натиснути дія клік submit'
  label:
    default: Click Me
  variant:
    - primary
    - secondary
```

### Правила

- Поля з префіксом `$` — **мета-поля**. Вони не потрапляють у `propTypes` / `defaultProps`
- `$search` використовується IDE/Sandbox для пошуку будь-якою мовою
- Кожна локаль має свої теги: `uk/$Component.$search` ≠ `en/$Component.$search`

## Каскадний Fallback

```
1. Локальний словник продукту → t.json
2. Батьківський словник → _/t.json
3. Кореневий словник → uk/_/t.json
4. Оригінальний ключ з Моделі (як текст за замовчанням)
```

## Аудит

```bash
# Перевірка покриття перекладів
npx i18n audit

# Синхронізація ключів з коду
npx i18n sync
```

`extract()` знаходить ключі в **експортованих Моделях** → `auditTranslations()` порівнює з наявними перекладами → `syncTranslations()` додає відсутні.

---

> **АрхіТехноМаг**: "Якщо модель не експортована — її ключі невидимі для світу. Неекспортована модель — це закрите слово."

_Оновлено: 08.03.2026_
