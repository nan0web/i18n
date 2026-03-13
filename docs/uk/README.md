# @nan0web/i18n

Крихітний i18n-помічник для Java•Script проєктів без залежностей.
Надає англійський словник за замовчуванням та простий `createT` для
генерації функцій перекладу будь-якою мовою.

| Пакет                                             | [Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв) | Документація                                                                                                                                            | Покриття | Можливості                         | Npm   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | ----- |
| [@nan0web/i18n](https://github.com/nan0web/i18n/) | 🟢 `100%`                                                                             | 🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/i18n/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/i18n/blob/main/docs/uk/README.md) | -        | ✅ d.ts 📜 system.md 🕹️ playground | 1.2.0 |

## Встановлення

```bash
npm install @nan0web/i18n
```

```bash
pnpm add @nan0web/i18n
```

```bash
yarn add @nan0web/i18n
```

## Використання з визначенням локалі

Як працювати з кількома словниками?

```js
import { i18n, createT } from '@nan0web/i18n'
const en = { 'Welcome!': 'Welcome, {name}!' }
const uk = { 'Welcome!': 'Вітаю, {name}!' }
const ukRU = { 'Welcome!': 'Привіт, {name}!' }
const ukCA = { 'Welcome!': 'Вітаємо, {name}!' }
const getVocab = i18n({ en, uk, 'uk-RU': ukRU, 'uk-CA': ukCA })
let t = createT(getVocab('en', en))
console.info(t('Welcome!', { name: 'Alice' })) // ← "Welcome, Alice!"
t = createT(getVocab('uk', en))
console.info(t('Welcome!', { name: 'Богдан' })) // ← "Вітаю, Богдан!"
t = createT(getVocab('uk-RU', en))
console.info(t('Welcome!', { name: 'Саша' })) // ← "Привіт, Саша!"
t = createT(getVocab('uk-CA', en))
console.info(t('Welcome!', { name: 'Марія' })) // ← "Вітаємо, Марія!"
```

> Переклад — це не просто інтернаціоналізація.
> Це відкриття іншої реальності через мову.

---

## 🏛️ Основна архітектура i18n

### 1. Парадигма «Тільки з Моделей» (v1.1.0+)

**Увесь текст для перекладу має знаходитися в експортованих класах Моделей.**
Рядкові літерали в викликах `t()` — **заборонені**.

```js
// ✅ Правильно — ключ з Моделі
t(Language.title.help)

// ❌ Заборонено — захардкоджений рядок
t('Language title')
```

### 2. Децентралізація та неймспейси

Для уникнення колізій між сотнями пакетів використовуємо **крапкову нотацію**:

- `ui-cli.Pick a color`
- `core.User age`

### 3. Принцип «Чистих Моделей»

Моделі — це структури даних. Вони не повинні знати про поточну мову UI:

- **У Моделі**: `static title = { help: "Language title" }` — це ключ i18n
- **В UI/Адаптері**: `t(Language.title.help)` — резолюція відбувається тут
- **Обов'язковий експорт**: кожна Модель з i18n-полями **повинна** бути `export class`

### 4. Каскадний Fallback

Якщо переклад відсутній, система виконує алгоритм довіри:

1. **Шукає в локальному словнику** продукту.
2. **Шукає в батьківських словниках** (через сегменти `I18nDb`).
3. **Оригінальний ключ з Моделі** (як фінальний fallback).

Як обробляти переклади з відсутніми ключами?

```js
import { i18n, createT } from '@nan0web/i18n'
const getVocab = i18n({ en: { 'Welcome!': 'Welcome, {name}!' } })
const en = { 'Welcome!': 'Welcome, {name}!' }
const t = createT(getVocab('unknown', en))
console.info(t('Welcome!', { name: 'Fallback' })) // ← "Welcome, Fallback!"
```

## Використання з базою даних

`I18nDb` підтримує ієрархічне завантаження (Локальний → Батьківський → Кореневий) та неймспейси.

```js
import DB from '@nan0web/db'
import { I18nDb } from '@nan0web/i18n'
const db = new DB({
  predefined: new Map([
    ['data/uk/_/t', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
    [
      'data/uk/apps/topup-tel/_/t',
      {
        'ui-cli.Volume': 'Гучність',
        'Top-up Telephone': 'Поповнення телефону',
        Home: 'Головна',
      },
    ],
  ]),
})
await db.connect()
const i18n = new I18nDb({ db, locale: 'uk', dataDir: 'data' })
const t = await i18n.createT('uk', 'apps/topup-tel')
console.info(t('ui-cli.Volume')) // ← "Гучність" (з неймспейсом)
console.info(t('Top-up Telephone')) // ← "Поповнення телефону"
console.info(t('Welcome!')) // ← "Ласкаво просимо!" (успадкований fallback)
console.info(t('Home')) // ← "Головна" (пріоритет локального)
```

## Екстракція ключів

### `extractFromModels(models)` — Основний (v1.1.0+)

Витягує ключі i18n безпосередньо з експортованих класів Моделей.
Підтримує як **camelCase** (`errorInvalid`, `helpAlt`), так і **snake_case** (`error_invalid`, `help_alt`).

Поля для екстракції: `help*`, `label*`, `title*`, `placeholder*`, `message*`, `error*`, `value*`.

```js
import { extractFromModels } from '@nan0web/i18n'
import { Language } from './domain/Language.js'

const keys = extractFromModels({ Language })
// → ['Invalid locale format', 'Language icon', 'Language title', 'Locale', 'Locale not found']
```

CamelCase та snake_case імена полів підтримуються однаково:

```js
class UserModel {
  static email = {
    help: 'Email address',
    errorInvalid: 'Invalid email', // camelCase ✅
    error_required: 'Email is required', // snake_case ✅
    labelShort: 'Email', // camelCase ✅
    placeholder: 'user@example.com', // exact match ✅
  }
}
const keys = extractFromModels({ UserModel })
// → ['Email', 'Email address', 'Email is required', 'Invalid email', 'user@example.com']
```

### `extract(content)` — Застарілий (сканування вихідного коду)

> ⚠️ Застарілий на користь `extractFromModels()`. Залишений для зворотної сумісності.

```js
import { extract } from '@nan0web/i18n'
const content = `
console.log(t("Hello, {name}!"))
const menu = ["First", "Second"] // t("First"), t("Second")
`
const keys = extract(content)
console.info(keys) // ← ["First", "Hello, {name}!", "Second"]
```

## API

### `createT(vocab, locale?)`

Створює функцію перекладу, прив'язану до наданого словника.
Починаючи з v1.1.0, делегує в `@nan0web/types` `TFunction`, який підтримує
ICU-подібні множини (`$count`, `$ordinal`) та правила з урахуванням локалі.

- **Параметри**
  - `vocab` — об'єкт, що відображає англійські ключі на локалізовані рядки.
  - `locale` — (необов'язковий, за замовчуванням `'en'`) локаль для правил множини.

- **Повертає**
  - `function t(key, vars?)` — функцію перекладу.

#### Функція перекладу `t(key, vars?)`

- **Параметри**
  - `key` — оригінальний англійський рядок (з `Model.field.help`).
  - `vars` — (необов'язково) об'єкт зі значеннями плейсхолдерів, напр. `{ name: 'Іван' }`.
- **Поведінка**
  - Шукає `key` у наданому словнику.
  - Якщо ключ відсутній, повертає оригінальний `key`.
  - Замінює плейсхолдери виду `{placeholder}` значеннями з `vars`.

### `extractFromModels(models)` _(v1.1.0+)_

Витягує ключі перекладу безпосередньо з класів Model-as-Schema.

- **Параметри**
  - `models` — об'єкт або масив експортованих класів Моделей.

- **Повертає**
  - `string[]` — відсортований масив унікальних ключів.

### Методи `I18nDb` _(v1.1.0+)_

- `extractKeysFromModels(models?)` → `Set<string>`
- `auditModels(models?)` → `Map<locale, {missing, unused}>`
- `syncModels(targetUri?, opts?)` → записує відсутні ключі в t.json

### Застарілі методи

- ~~`extractKeysFromCode(srcPath)`~~ → використовуйте `extractKeysFromModels()`
- ~~`auditTranslations(srcPath)`~~ → використовуйте `auditModels()`
- ~~`syncTranslations(targetUri, opts)`~~ → використовуйте `syncModels()`

### `i18n(mapLike)`

Утиліта для вибору відповідного словника за локаллю.

- **Параметри**
  - `mapLike` — об'єкт із маппінгом локалей.

- **Повертає**
  - функцію, що приймає рядок локалі та необов'язковий словник за замовчуванням.

## CLI

Пакет `@nan0web/i18n` надає інтерфейс командного рядка для керування перекладами.

### Встановлення

Глобально:

```bash
npm install -g @nan0web/i18n
```

Або через `npx`:

```bash
npx i18n <команда>
```

### Команди

#### `i18n generate`

Генерує Java•Script кеш-файли з YAML джерела істини. Корисно для веб-бандлів (Vite/Webpack), щоб уникнути парсингу YAML під час виконання.

- **Опції**
  - `--data <dir>` — Директорія даних зі структурою `{locale}/_/t` (за замовчуванням: `./data`)
  - `--out <dir>` — Директорія виведення для `.js` файлів (за замовчуванням: `./src/i18n`)

```bash
npx i18n generate --data ./my-data --out ./src/translations
```

#### `i18n audit`

Аудит ключів i18n за допомогою `extractKeysFromModels()` — знаходить відсутні та невикористані переклади.

#### `i18n sync`

Синхронізація перекладів використовуючи ключі Моделей як єдине джерело істини.

#### `i18n completion`

Генерує скрипт автодоповнення для bash або zsh.

- **Використання**

```bash
# Для bash
source <(i18n completion bash)

# Для zsh
source <(i18n completion zsh)
```

**Постійне налаштування (Zsh):**
Додайте це до вашого `~/.zshrc`:

```zsh
if command -v i18n >/dev/null 2>&1; then
  source <(i18n completion zsh)
fi
```

Як зробити внесок? — [тут](./CONTRIBUTING.md)

## CLI Пісочниця

Як запустити CLI-пісочницю, щоб спробувати бібліотеку на практиці?

```bash
# Клонуйте репозиторій та запустіть CLI playground
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run play
```

## Java•Script

Використовує `d.ts` для надання підказок автодоповнення.

## Ліцензія

[ISC LICENSE](./LICENSE)
