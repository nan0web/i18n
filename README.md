# @nan0web/i18n

A tiny, zero‑dependency i18n helper for Java•Script projects.
It provides a default English dictionary and a simple `createT` factory to
generate translation functions for any language.

## Install
```bash
npm install @nan0web/i18n
```

## Usage

tDefault is just for example, usually there is no need to use it
```js
import tDefault, { createT } from '@nan0web/i18n'
import uk from './src/uk.js'   // Ukrainian dictionary

// ✅ Default (English) translation function
console.info(tDefault('Welcome!', { name: 'Anna' }))
// → "Welcome, Anna!"

// ✅ Create a Ukrainian translation function
const t = createT(uk)

console.info(t('Welcome!', { name: 'Іван' }))
// → "Вітаємо у пісочниці, Іван!"

// ✅ Missing key falls back to the original key
console.info(t('NonExistingKey'))
// → "NonExistingKey"
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

### Default export
The default export is a translation function that uses the built‑in English
dictionary (`defaultVocab`). It is ready to use without any setup.

## Adding a New Language
Create a new module (e.g., `src/fr.js`) that exports a dictionary:

```js
export default {
  "Welcome!": "Bienvenue, {name}!",
  "Submit": "Envoyer",
  // …other keys
}
```
Then generate a translation function:

```js
import fr from './src/fr.js'
const t = createT(fr)
```

## Testing
Run the bundled tests with:

```bash
npm test
```
The test suite covers default behaviour, placeholder substitution and fallback
logic.

## Contributing

Ready to contribute [check here](./CONTRIBUTING.md)

## License
ISC – see the [LICENSE](./LICENSE) file.

LICENSE file exists
