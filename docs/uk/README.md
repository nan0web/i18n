# @nan0web/i18n

Мініатюрний i18n-помічник без залежностей для Java•Script проєктів.
Надає стандартний англійський словник та просту фабрику `createT` для
генерації функцій перекладу будь-якою мовою.

|Назва пакета|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Покриття тестами|Можливості|Версія Npm|
|---|---|---|---|---|---|
|[@nan0web/i18n](https://github.com/nan0web/i18n/) |🟢 `100%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/i18n/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/i18n/blob/main/docs/uk/README.md) |- |✅ d.ts 📜 system.md 🛡️ i18n inspect |1.5.0 |

## Встановлення

Як встановити через npm?
```bash
npm install @nan0web/i18n
```

Як встановити через pnpm?
```bash
pnpm add @nan0web/i18n
```

Як встановити через yarn?
```bash
yarn add @nan0web/i18n
```

## Використання з визначенням локалі

Як працювати з кількома словниками?
```js
import { i18n, createT } from "@nan0web/i18n"

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

### 1. Парадигма «Тільки Модель» (v1.1.0+)
**Весь текст для перекладу повинен жити у експортованих класах Моделей.**
Рядкові літерали у викликах `t()` **заборонені**.

```js
// ✅ Правильно — ключ із Моделі
t(Language.title.help)

// ❌ Заборонено — захардкоджений рядок
t('Language title')
```

### 2. Децентралізація та простори імен
Щоб уникнути колізій між сотнями пакетів, використовуємо **крапкову нотацію**:
- `ui-cli.Pick a color`
- `core.User age`

### 3. Принцип «Чиста Модель»
Моделі — це структури даних. Вони не повинні знати про поточну мову інтерфейсу:
- **У Моделі**: `static title = { help: "Language title" }` — це ключ i18n
- **В UI/Адаптері**: `t(Language.title.help)` — розв'язка відбувається тут
- **Обов'язковий експорт**: кожна Модель з i18n-полями **має бути** `export class`

### 4. Каскадний фолбек
Якщо переклад відсутній, система слідує алгоритму довіри:
1. **Пошук у локальному словнику** продукту.
2. **Пошук у батьківських словниках** (через сегменти `I18nDb`).
3. **Оригінальний ключ із Моделі** (як останній фолбек).

### 5. Архітектурна цілісність (v1.5.0+)
Використовуйте `i18n inspect` для впевненості, що:
- В `t()` не використовуються захардкоджені рядки.
- Усі ключі, що використовуються в UI, присутні у словнику.
- У словниках немає зайвих ключів, що не використовуються.

Як обробляти переклади з відсутніми ключами?
```js
import { i18n, createT } from "@nan0web/i18n"
const getVocab = i18n({ en: { 'Welcome!': 'Welcome, {name}!' } })
const en = { 'Welcome!': 'Welcome, {name}!' }

const t = createT(getVocab('unknown', en))
console.info(t('Welcome!', { name: 'Fallback' })) // ← "Welcome, Fallback!"
```

## Використання з базою даних

`I18nDb` підтримує ієрархічне завантаження (Локальний → Батьківський → Кореневий) та простори імен.

Як використовувати переклади з бази даних з ієрархічним завантаженням, просторами імен та фолбеком?
```js
import DB from "@nan0web/db"
import { I18nDb } from "@nan0web/i18n"

const db = new DB({
	predefined: new Map([
		['data/uk/_/t', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
		['data/uk/index', { title: 'Головна' }],
		[
			'data/uk/apps/topup-tel/_/t',
			{
				Amount: 'Сума',
				Telephone: 'Номер телефону',
				Home: 'Головна',
			},
		],
		['data/uk/apps/topup-tel/index', { title: 'Поповнити телефон' }]
	]),
})

/**
 * @property {string} tel Телефон.
 * @property {number} amount Сума поповнення.
 */
class TopupModel extends Model {
	static tel = { help: 'Telephone', default: '' }
	static amount = { help: 'Amount', default: 33 }
	static UI = {
		home: 'Home',
		welcome: 'Welcome!',
	}
}

await db.connect()
const i18n = new I18nDb({ db, locale: 'uk', dataDir: 'data' })
let t = await i18n.createT('uk', 'apps/topup-tel/index')

console.info(t(TopupModel.tel.help)) // ← "Номер телефону"
console.info(t(TopupModel.amount.help)) // ← "Сума"
// Welcome! успадковується з uk/_/t
console.info(t('Welcome!')) // ← "Ласкаво просимо!"
console.info(t('Home')) // ← "Головна"

t = await i18n.createT('uk', 'index')
console.info(t('Welcome!')) // ← "Ласкаво просимо!"
console.info(t('Home')) // ← "Дім"
```

## Витяг ключів

### `extractFromModels(models)` — Основний (v1.1.0+)

Витягує ключі i18n безпосередньо з експортованих класів Моделей.
Підтримує як **camelCase** (`errorInvalid`, `helpAlt`), так і **snake_case** (`error_invalid`, `help_alt`).

Поля для витягу: `help*`, `label*`, `title*`, `placeholder*`, `message*`, `error*`, `value*`.

Як витягти ключі перекладу з класів Моделей?
```js
import { extractFromModels } from "@nan0web/i18n"
import { Language } from "./domain/Language.js"

const keys = extractFromModels({ Language })
console.info(keys)
// ← ['Invalid locale format', 'Language icon', 'Language title', 'Locale', 'Locale not found']
```

Імена полів camelCase та snake_case підтримуються однаково:

extractFromModels підтримує поля camelCase та snake_case
```js
class UserModel {
	static email = {
		help: 'Email address',
		errorInvalid: 'Invalid email',
		error_required: 'Email is required',
		labelShort: 'Email',
		placeholder: 'user@example.com',
	}
}
const keys = extractFromModels({ UserModel })
console.info(keys)
```

### `extract(content)` — Застарілий (сканування вихідного коду)

> ⚠️ Застарілий на користь `extractFromModels()`. Збережено для зворотної сумісності.

Як витягти ключі перекладу з вихідного коду? (застарілий)
```js
import { extract } from "@nan0web/i18n"
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
Починаючи з v1.1.0, делегує до `@nan0web/types` `TFunction`, яка підтримує
ICU-сумісну плюралізацію (`$count`, `$ordinal`) та правила, залежні від локалі.

* **Параметри**
  * `vocab` – об'єкт, що відображає англійські ключі на локалізовані рядки.
  * `locale` – (необов'язковий, за замовчуванням `'en'`) локаль для правил множини.

* **Повертає**
  * `function t(key, vars?)` – функцію перекладу.

#### Функція перекладу `t(key, vars?)`
* **Параметри**
  * `key` – оригінальний англійський рядок (з `Model.field.help`).
  * `vars` – (необов'язковий) об'єкт зі значеннями заповнювачів, наприклад `{ name: 'John' }`.
* **Поведінка**
  * Шукає `key` у наданому словнику.
  * Якщо ключ відсутній, повертає оригінальний `key`.
  * Замінює заповнювачі виду `{placeholder}` значеннями з `vars`.

### `extractFromModels(models)` *(v1.1.0+)*
Витягує ключі перекладу безпосередньо з класів Model-as-Schema.

* **Параметри**
  * `models` – об'єкт або масив експортованих класів Моделей.

* **Повертає**
  * `string[]` – відсортований масив унікальних ключів.

### Методи `I18nDb` *(v1.1.0+)*
  * `extractKeysFromModels(models?)` → `Set<string>`
  * `auditModels(models?)` → `Map<locale, {missing, unused}>`
  * `syncModels(targetUri?, opts?)` → записує відсутні ключі у t

### Застарілі методи
  * ~~`extractKeysFromCode(srcPath)`~~ → використовуйте `extractKeysFromModels()`
  * ~~`auditTranslations(srcPath)`~~ → використовуйте `auditModels()`
  * ~~`syncTranslations(targetUri, opts)`~~ → використовуйте `syncModels()`

### `i18n(mapLike)`
Утиліта для вибору відповідного словника перекладу за локаллю.

* **Параметри**
  * `mapLike` – об'єкт, що містить відображення локалей.

* **Повертає**
  * функцію, яка приймає рядок локалі та необов'язковий словник за замовчуванням.

## CLI

Пакет `@nan0web/i18n` надає інтерфейс командного рядка для управління перекладами.

### Встановлення

Якщо встановлено глобально:
```bash
npm install -g @nan0web/i18n
```
Або через `npx`:
```bash
npx i18n <команда>
```

### Команди

#### `i18n generate`
Генерує Java•Script кеш-файли з джерела правди. Корисно для веб-збірок (Vite/Webpack), щоб уникнути парсингу YAML/JSON під час виконання.

- **Опції**
  - `--data <dir>` – Директорія даних, що містить `{locale}/_/t` (за замовчуванням: `./data`)
  - `--out <dir>` – Директорія виводу для `.js` файлів (за замовчуванням: `./src/i18n`)

```bash
npx i18n generate --data ./my-data --out ./src/translations
```

#### `i18n audit`
Аудит i18n-ключів за допомогою `extractKeysFromModels()` — знаходить відсутні або невикористані переклади.

#### `i18n inspect` *(v1.5.0+)*
Виконує детермінований архітектурний аудит за допомогою Regex-парсингу:
- Виявляє заборонені захардкоджені рядки у викликах `t()`.
- Сканує класи Моделей на відповідність архітектурним стандартам.
- Перевіряє наявність ключів у файлах словників.

```bash
npx i18n inspect --domain=src/domain --vocab=data/uk/_/t.nan0 --ui=src/ui
```

#### `i18n sync`
Синхронізує переклади, використовуючи ключі Моделей як єдине джерело правди.

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

Як зробити внесок? — [дивіться тут](../../CONTRIBUTING.md)

## CLI Пісочниця

Як запустити CLI пісочницю для тестування бібліотеки напряму?
```bash
# Клонуйте репозиторій та запустіть CLI пісочницю
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run play
```

## Java•Script

Використовує `d.ts` для надання підказок автодоповнення.

## Ліцензія

Як ліцензується? — файл [ISC LICENSE](../../LICENSE).
