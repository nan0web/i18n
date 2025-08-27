# @nan0web/i18n

A tiny, zero‑dependency i18n helper for Java•Script projects.
It provides a default English dictionary and a simple `createT` factory to
generate translation functions for any language.

## Install
```bash
npm install @nan0web/i18n
```

## Usage with Locale Detection

For handling multiple dictionaries, you can create a vocab loader using the `i18n` utility:
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
## Usage with Database

For database-backed translations with hierarchical loading, use the `I18nDb` class:
```js
import { MemoryDB } from "@nan0web/test"
import { I18nDb } from "@nan0web/i18n"
// You can use any extension of "@nan0web/db"
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
console.info(t('Welcome!')) // ← "Ласкаво просимо!" (inherited)
console.info(t('Home')) // ← "Головна" (prioritized over inherited)
```
## Keywords extractions

You can also extract translation keys directly from your source code:
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
Creates a translation function bound to the supplied vocabulary.

* **Parameters**
  * `vocab` – an object mapping English keys to localized strings.

* **Returns**
  * `function t(key, vars?)` – a translation function.

#### Translation function `t(key, vars?)`
* **Parameters**
  * `key` – the original English string.
  * `vars` – (optional) an object with placeholder values, e.g. `{ name: 'John' }`.
* **Behaviour**
  * Looks up `key` in the provided vocabulary.
  * If the key is missing, returns the original `key`.
  * Replaces placeholders of the form `{placeholder}` with values from `vars`.

### `i18n(mapLike)`
Utility function to select the appropriate vocabulary dictionary by locale.

* **Parameters**
  * `mapLike` – an object containing locale mappings.

* **Returns**
  * a function that accepts a locale string and optional default dictionary.

## CLI Playground

There is also a CLI sandbox playground to try the library directly:
```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run playground
```

## Java•Script

Uses `d.ts` to provide autocomplete hints.

## Contributing

Ready to contribute [check here](./CONTRIBUTING.md)

## License

ISC – see the [LICENSE](./LICENSE) file.
