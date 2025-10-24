# @nan0web/i18n

Мінімалістичний, беззалежний i18n‑помічник для проєктів на JavaScript.
Надає словник за замовчуванням англійською та просту фабрику `createT` для
створення функцій перекладу будь‑якою мовою.

|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Тестове покриття|Фічі|Версія npm|
|---|---|---|---|---|
|🟢 `99.7%`|🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/i18n/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/i18n/blob/main/docs/uk/README.md)|🟢 `100.0%`|✅ d.ts 📜 system.md 🕹️ playground|—|

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

const en = { "Welcome!": "Welcome, {name}!" }
const uk = { "Welcome!": "Вітаю, {name}!" }
const ukRU = { "Welcome!": "Привіт, {name}!" }
const ukCA = { "Welcome!": "Вітаємо, {name}!" }

const getVocab = i18n({ en, uk, 'uk-RU': ukRU, 'uk-CA': ukCA })

let t = createT(getVocab('en', en))
console.info(t('Welcome!', { name: 'Alice' })) // ← "Welcome, Alice!"

t = createT(getVocab('uk', en))
console.info(t('Welcome!', { name: 'Богдан' })) // ← "Вітаю, Богдан!"

t = createT(getVocab('uk-RU', en))
console.info(t('Welcome!', { name: 'Саша' })) // ← "Привіт, Саша!"

t = createT(getVocab('uk-CA', en))
console.info(t('Welcome!', { name: 'Марія' })) // ← "Вітаємо, Марія!"

t = createT(getVocab('unknown', en))
console.info(t('Welcome!', { name: 'Fallback' })) // ← "Welcome, Fallback!"
```

## Використання з базою даних

Як використати переклади, що зберігаються в БД, із ієрархічним завантаженням, за допомогою класу `I18nDb`?
```js
import { MemoryDB } from "@nan0web/test"
import { I18nDb } from "@nan0web/i18n"
// Можна використовувати будь‑яке розширення "@nan0web/db"
const db = new MemoryDB({
  predefined: new Map([
    ['data/uk/_/t.json', { 'Welcome!': 'Ласкаво просимо!', 'Home': 'Дім' }],
    ['data/uk/apps/topup-tel/_/t.json', { 'Top-up Telephone': 'Поповнення телефону', 'Home': 'Головна' }]
  ])
})
await db.connect()
const i18nDb = new I18nDb({ db, locale: 'uk', tPath: '_/t.json', dataDir: "data" })
const t = await i18nDb.createT('apps/topup-tel')

console.info(t('Top-up Telephone')) // ← "Поповнення телефону"
console.info(t('Welcome!')) // ← "Ласкаво просимо!" (успадковано)
console.info(t('Home')) // ← "Головна" (пріоритет над успадкованим)
```

## Видобування ключових слів

Як видобути ключі перекладу безпосередньо з вашого коду?
```js
const content = `
console.log(t("Hello, {name}!"))
const menu = ["First", "Second"] // t("First"), t("Second")
`
const keys = extract(content)
console.info(keys) // ← ["First", "Hello, {name}!", "Second"]
```

## API

### `createT(vocab)`
Створює функцію перекладу, прив’язану до переданого словника.

* **Параметри**
  * `vocab` – об’єкт, що мапить англійські ключі на локалізовані рядки.

* **Повертає**
  * `function t(key, vars?)` – функція перекладу.

#### Функція перекладу `t(key, vars?)`
* **Параметри**
  * `key` – оригінальний англійський рядок.
  * `vars` – (необов’язково) об’єкт з підстановками, напр. `{ name: 'John' }`.
* **Поведінка**
  * Шукає `key` у словнику.
  * Якщо ключ відсутній – повертає сам `key`.
  * Замінює шаблони виду `{placeholder}` на значення з `vars`.

### `i18n(mapLike)`
Утиліта для вибору відповідного словника за локаллю.

* **Параметри**
  * `mapLike` – об’єкт, що містить мапування локалей.

* **Повертає**
  * функцію, яка приймає рядок локалі та необов’язковий словник‑за‑замовчуванням.

## CLI Песочниця

Як запустити CLI‑песочницю, щоб протестувати бібліотеку безпосередньо?
```bash
# Клонувати репозиторій та запустити CLI‑песочницю
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run play
```

## JavaScript

Використовує `d.ts` для автодоповнення типів.

## Внески

Як зробити внесок? — [перегляньте тут](./CONTRIBUTING.md)

## Ліцензія

Як ліцензувати? — файл [ISC LICENSE](./LICENSE).

