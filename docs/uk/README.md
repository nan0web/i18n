# @nan0web/i18n

Цей документ доступний у інших мовах:
- [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](../../README.md)

Мінімальний, нуль-залежний i18n помічник для проектів на Java•Script.
Він надає стандартний англійський словник та просту фабрику `createT` для
створення функцій перекладу будь-якою мовою.

## Встановлення
```bash
npm install @nan0web/i18n
```

## Використання з визначенням локалі

Для обробки кількох словників, можна створити завантажувач словника за допомогою утиліти `i18n`:
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

Для перекладів, що зберігаються у базі даних, з ієрархічним завантаженням, використовуйте клас `I18nDb`:
```js
import { MemoryDB } from "@nan0web/test"
import { I18nDb } from "@nan0web/i18n"
// Можна використовувати будь-яке розширення "@nan0web/db"
const db = new MemoryDB({
  predefined: new Map([
    ['data/uk/_/t.json', { 'Welcome!': 'Ласкаво просимо!', 'Home': 'Дім' }],
    ['data/uk/apps/topup-tel/_/t.json', { 'Top-up Telephone': 'Поповнення телефону', 'Home': 'Головна' }]
  ])
})
await db.connect()
const i18n = new I18nDb({ db, locale: 'uk', tPath: '_/t.json', dataDir: "data" })
const t = await i18n.createT('uk', 'apps/topup-tel')

console.info(t('Top-up Telephone')) // ← "Поповнення телефону"
console.info(t('Welcome!')) // ← "Ласкаво просимо!" (успадковано)
console.info(t('Home')) // ← "Головна" (має пріоритет перед успадкованим)
```
## Видобування ключових слів

Також можна видобути ключі перекладів безпосередньо з коду:
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
Створює функцію перекладу, прив'язану до наданого словника.

* **Параметри**
  * `vocab` – об'єкт з відображенням англійських ключів на локалізовані рядки.

* **Повертає**
  * `function t(key, vars?)` – функцію перекладу.

#### Функція перекладу `t(key, vars?)`
* **Параметри**
  * `key` – початковий англійський рядок.
  * `vars` – (необов'язково) об'єкт зі значеннями заповнювачів, наприклад `{ name: 'John' }`.
* **Поведінка**
  * Шукає `key` у наданому словнику.
  * Якщо ключ відсутній – повертає початковий `key`.
  * Замінює заповнювачі форми `{заповнювач}` на значення з `vars`.

### `i18n(mapLike)`
Утиліта для вибору відповідного словника за локаллю.

* **Параметри**
  * `mapLike` – об'єкт, що містить відображення локалей.

* **Повертає**
  * функцію, яка приймає рядок локалі та необов'язковий стандартний словник.

## CLI Песочниця

Також існує CLI песочниця для прямого випробування бібліотеки:
```bash
# Клонуйте репозиторій та запустіть CLI песочницю
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run playground
```

## Java•Script

Використовує `d.ts` для автозаповнення.

## Внески

Готові зробити внесок? [Дивіться тут](../../CONTRIBUTING.md)

## Ліцензія

ISC – дивіться файл [LICENSE](../../LICENSE).
