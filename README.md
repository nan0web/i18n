# @nan0web/i18n

A tiny, zero‑dependency i18n helper for Java•Script projects.
It provides a default English dictionary and a simple `createT` factory to
generate translation functions for any language.

|Package name|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
|---|---|---|---|---|---|
|[@nan0web/i18n](https://github.com/nan0web/i18n/) |🟢 `100%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/i18n/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/i18n/blob/main/docs/uk/README.md) |- |✅ d.ts 📜 system.md 🕹️ playground |1.1.0 |

## Installation

How to install with npm?
```bash
npm install @nan0web/i18n
```

How to install with pnpm?
```bash
pnpm add @nan0web/i18n
```

How to install with yarn?
```bash
yarn add @nan0web/i18n
```

## Usage with Locale Detection

How to handle multiple dictionaries?
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
> Translation is not just internationalization.
> It's the discovery of another reality through language.

---

## 🏛️ Core i18n Architecture

### 1. Model-Only Paradigm (v1.1.0+)
**All translatable text must live in exported Model classes.**
String literals in `t()` calls are **forbidden**.

```js
// ✅ Correct — key from Model
t(Language.title.help)

// ❌ Forbidden — hardcoded string
t('Language title')
```

### 2. Decentralization & Namespacing
To avoid collisions between hundreds of packages, we use **dot notation**:
- `ui-cli.Pick a color`
- `core.User age`

### 3. "Pure Model" Principle
Models are data structures. They shouldn't know about the current UI language:
- **In Model**: `static title = { help: "Language title" }` — this is the i18n key
- **In UI/Adapter**: `t(Language.title.help)` — resolution happens here
- **Mandatory Export**: every Model with i18n fields **must** be `export class`

### 4. Cascading Fallback
If a translation is missing, the system follows a trust algorithm:
1. **Look in local vocabulary** of the product.
2. **Look in parent vocabularies** (via `I18nDb` segments).
3. **Original Key from the Model** (as a final fallback).

How to handle translations with missing keys?
```js
import { i18n, createT } from "@nan0web/i18n"
const getVocab = i18n({ en: { 'Welcome!': 'Welcome, {name}!' } })
const en = { 'Welcome!': 'Welcome, {name}!' }
const t = createT(getVocab('unknown', en))
console.info(t('Welcome!', { name: 'Fallback' })) // ← "Welcome, Fallback!"
```
## Usage with Database

`I18nDb` supports hierarchical loading (Local -> Parent -> Root) and namespacing.

How to use database-backed translations with hierarchical loading, namespacing and fallback?
```js
import DB from "@nan0web/db"
import { I18nDb } from "@nan0web/i18n"
const db = new DB({
	predefined: new Map([
		['data/uk/_/t.json', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
		[
			'data/uk/apps/topup-tel/_/t.json',
			{
				'ui-cli.Volume': 'Гучність',
				'Top-up Telephone': 'Поповнення телефону',
				Home: 'Головна',
			},
		],
	]),
})
await db.connect()
const i18n = new I18nDb({ db, locale: 'uk', tPath: '_/t.json', dataDir: 'data' })
const t = await i18n.createT('uk', 'apps/topup-tel')
console.info(t('ui-cli.Volume')) // ← "Гучність" (namespaced)
console.info(t('Top-up Telephone')) // ← "Поповнення телефону"
console.info(t('Welcome!')) // ← "Ласкаво просимо!" (inherited fallback)
console.info(t('Home')) // ← "Головна" (prioritized local)
```
## Key Extraction

### `extractFromModels(models)` — Primary (v1.1.0+)

Extracts i18n keys directly from exported Model classes.
Supports both **camelCase** (`errorInvalid`, `helpAlt`) and **snake_case** (`error_invalid`, `help_alt`).

Extractable fields: `help*`, `label*`, `title*`, `placeholder*`, `message*`, `error*`, `value*`.

How to extract translation keys from Model classes?
```js
import { extractFromModels } from "@nan0web/i18n"
import { Language } from "./domain/Language.js"
const keys = extractFromModels({ Language })
console.info(keys)
// ← ['Invalid locale format', 'Language icon', 'Language title', 'Locale', 'Locale not found']
```

CamelCase and snake_case field names are both supported:

extractFromModels supports camelCase and snake_case fields
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

### `extract(content)` — Legacy (source code scanning)

> ⚠️ Deprecated in favor of `extractFromModels()`. Retained for backward compatibility.

How to extract translation keys from source code? (legacy)
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
Creates a translation function bound to the supplied vocabulary.
Since v1.1.0, delegates to `@nan0web/types` `TFunction` which supports
ICU-like plurals (`$count`, `$ordinal`) and locale-aware rules.

* **Parameters**
  * `vocab` – an object mapping English keys to localized strings.
  * `locale` – (optional, default `'en'`) locale for plural rules.

* **Returns**
  * `function t(key, vars?)` – a translation function.

#### Translation function `t(key, vars?)`
* **Parameters**
  * `key` – the original English string (from `Model.field.help`).
  * `vars` – (optional) an object with placeholder values, e.g. `{ name: 'John' }`.
* **Behaviour**
  * Looks up `key` in the provided vocabulary.
  * If the key is missing, returns the original `key`.
  * Replaces placeholders of the form `{placeholder}` with values from `vars`.

### `extractFromModels(models)` *(v1.1.0+)*
Extracts translation keys directly from Model-as-Schema classes.

* **Parameters**
  * `models` – object or array of exported Model classes.

* **Returns**
  * `string[]` – sorted array of unique keys.

### `I18nDb` Methods *(v1.1.0+)*
  * `extractKeysFromModels(models?)` → `Set<string>`
  * `auditModels(models?)` → `Map<locale, {missing, unused}>`
  * `syncModels(targetUri?, opts?)` → writes missing keys to t.json

### Deprecated Methods
  * ~~`extractKeysFromCode(srcPath)`~~ → use `extractKeysFromModels()`
  * ~~`auditTranslations(srcPath)`~~ → use `auditModels()`
  * ~~`syncTranslations(targetUri, opts)`~~ → use `syncModels()`

### `i18n(mapLike)`
Utility function to select the appropriate vocabulary dictionary by locale.

* **Parameters**
  * `mapLike` – an object containing locale mappings.

* **Returns**
  * a function that accepts a locale string and optional default dictionary.

## CLI

The `@nan0web/i18n` package provides a command-line interface for managing translations.

### Installation

If installed globally:
```bash
npm install -g @nan0web/i18n
```
Or use via `npx`:
```bash
npx i18n <command>
```

### Commands

#### `i18n generate`
Generates Java•Script cache files from YAML source of truth. This is useful for web bundles (Vite/Webpack) to avoid parsing YAML at runtime.

- **Options**
  - `--data <dir>` – Data directory containing `{locale}/_/t.yaml` (default: `./data`)
  - `--out <dir>` – Output directory for `.js` files (default: `./src/i18n`)

```bash
npx i18n generate --data ./my-data --out ./src/translations
```

#### `i18n audit`
Audits i18n keys using `extractKeysFromModels()` and finds missing or unused translations.

#### `i18n sync`
Syncs translations using Model keys as the single source of truth.

#### `i18n completion`
Generates a shell completion script for bash or zsh.

- **Usage**
```bash
# For bash
source <(i18n completion bash)

# For zsh
source <(i18n completion zsh)
```

**Permanent Setup (Zsh):**
Add this to your `~/.zshrc`:
```zsh
if command -v i18n >/dev/null 2>&1; then
  source <(i18n completion zsh)
fi
```

How to contribute? - [check here](./CONTRIBUTING.md)

## CLI Playground

How to run a CLI sandbox playground to try the library directly?
```bash
# Clone the repository and run the CLI playground
git clone https://github.com/nan0web/i18n.git
cd i18n
npm install
npm run play
```

## Java•Script

Uses `d.ts` to provide autocomplete hints.

## License

How to license? - [ISC LICENSE](./LICENSE) file.
