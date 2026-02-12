import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import FS from '@nan0web/db-fs'
import { NoConsole } from '@nan0web/log'
import { DocsParser, runSpawn, DatasetParser } from '@nan0web/test'
import { createT, extract, i18n, I18nDb } from './index.js'

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument(path.join(__dirname, '../package.json'), {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

async function testCompletion() {
	it('shell completion logic works', async () => {
		const response = await runSpawn('node', [
			path.join(__dirname, '../bin/i18n.js'),
			'completion',
			'zsh',
		])
		assert.ok(response.code === 0, 'i18n completion zsh should exit cleanly')
		assert.ok(response.text.includes('compdef'), 'zsh completion should include compdef')
		assert.ok(response.text.includes('_i18n'), 'zsh completion should define _i18n function')

		const bashResponse = await runSpawn('node', [
			path.join(__dirname, '../bin/i18n.js'),
			'completion',
			'bash',
		])
		assert.ok(bashResponse.code === 0, 'i18n completion bash should exit cleanly')
		assert.ok(
			bashResponse.text.includes('complete -F'),
			'bash completion should register via complete -F',
		)
	})
}

/**
 * Core test suite that also serves as the source for README generation.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/i18n
	 *
	 * A tiny, zero‑dependency i18n helper for Java•Script projects.
	 * It provides a default English dictionary and a simple `createT` factory to
	 * generate translation functions for any language.
	 *
	 * |Package name|[Status](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Documentation|Test coverage|Features|Npm version|
	 * |---|---|---|---|---|---|
	 * |[@nan0web/i18n](https://github.com/nan0web/i18n/) |🟡 `83.8%` |🧪 [English 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/i18n/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/i18n/blob/main/docs/uk/README.md) |- |✅ d.ts 📜 system.md 🕹️ playground |1.0.3 |
	 *
	 * ## Installation
	 */
	it('How to install with npm?', () => {
		/**
		 * ```bash
		 * npm install @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/i18n')
	})

	/**
	 * @docs
	 */
	it('How to install with pnpm?', () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/i18n')
	})

	/**
	 * @docs
	 */
	it('How to install with yarn?', () => {
		/**
		 * ```bash
		 * yarn add @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, '@nan0web/i18n')
	})

	/**
	 * @docs
	 * ## Usage with Locale Detection
	 */
	it('How to handle multiple dictionaries?', () => {
		//import { i18n, createT } from "@nan0web/i18n"

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

		assert.deepEqual(console.output(), [
			['info', 'Welcome, Alice!'],
			['info', 'Вітаю, Богдан!'],
			['info', 'Привіт, Саша!'],
			['info', 'Вітаємо, Марія!'],
		])
	})

	/**
	 * @docs
	 * > Translation is not just internationalization.
	 * > It's the discovery of another reality through language.
	 *
	 * ---
	 *
	 * ## 🏛️ Core i18n Architecture
	 *
	 * ### 1. Decentralization & Namespacing
	 * To avoid collisions between hundreds of packages, we use **dot notation**:
	 * - `ui-cli.Pick a color`
	 * - `core.User age`
	 * This keeps vocabularies isolated yet accessible to a global aggregator.
	 *
	 * ### 2. "Pure Model" Principle
	 * Models are data structures. They shouldn't know about the current UI language:
	 * - **In Model**: `help: "Unique user name"` (this is a key)
	 * - **In UI/Adapter**: `t(model.help)` (resolution happens here)
	 *
	 * ### 3. Cascading Fallback
	 * If a translation is missing, the system follows a trust algorithm:
	 * 1. **Look in local vocabulary** of the product.
	 * 2. **Look in parent vocabularies** (via `I18nDb` segments).
	 * 3. **English variant** (as the base development language).
	 * 4. **Original Key** (as a final fallback).
	 */
	it('How to handle translations with missing keys?', () => {
		//import { i18n, createT } from "@nan0web/i18n"
		const getVocab = i18n({ en: { 'Welcome!': 'Welcome, {name}!' } })
		const en = { 'Welcome!': 'Welcome, {name}!' }

		const t = createT(getVocab('unknown', en))
		console.info(t('Welcome!', { name: 'Fallback' })) // ← "Welcome, Fallback!"

		assert.deepEqual(console.output(), [['info', 'Welcome, Fallback!']])
	})

	/**
	 * @docs
	 * ## Usage with Database
	 *
	 * `I18nDb` supports hierarchical loading (Local -> Parent -> Root) and namespacing.
	 */
	it('How to use database-backed translations with hierarchical loading, namespacing and fallback?', async () => {
		//import DB from "@nan0web/db"
		//import { I18nDb } from "@nan0web/i18n"
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
		assert.deepEqual(console.output(), [
			['info', 'Гучність'],
			['info', 'Поповнення телефону'],
			['info', 'Ласкаво просимо!'],
			['info', 'Головна'],
		])
	})

	/**
	 * @docs
	 * ## Keywords extractions
	 */
	it('How to extract translation keys directly from your source code?', () => {
		//import { extract } from "@nan0web/i18n"
		const content = `
		console.log(t("Hello, {name}!"))
		const menu = ["First", "Second"] // t("First"), t("Second")
		`
		const keys = extract(content)
		console.info(keys) // ← ["First", "Hello, {name}!", "Second"]
		assert.deepEqual(console.output(), [['info', ['First', 'Hello, {name}!', 'Second']]])
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### `createT(vocab)`
	 * Creates a translation function bound to the supplied vocabulary.
	 *
	 * * **Parameters**
	 *   * `vocab` – an object mapping English keys to localized strings.
	 *
	 * * **Returns**
	 *   * `function t(key, vars?)` – a translation function.
	 *
	 * #### Translation function `t(key, vars?)`
	 * * **Parameters**
	 *   * `key` – the original English string.
	 *   * `vars` – (optional) an object with placeholder values, e.g. `{ name: 'John' }`.
	 * * **Behaviour**
	 *   * Looks up `key` in the provided vocabulary.
	 *   * If the key is missing, returns the original `key`.
	 *   * Replaces placeholders of the form `{placeholder}` with values from `vars`.
	 *
	 * ### `i18n(mapLike)`
	 * Utility function to select the appropriate vocabulary dictionary by locale.
	 *
	 * * **Parameters**
	 *   * `mapLike` – an object containing locale mappings.
	 *
	 * * **Returns**
	 *   * a function that accepts a locale string and optional default dictionary.
	 *
	 * ## CLI
	 *
	 * The `@nan0web/i18n` package provides a command-line interface for managing translations.
	 *
	 * ### Installation
	 *
	 * If installed globally:
	 * ```bash
	 * npm install -g @nan0web/i18n
	 * ```
	 * Or use via `npx`:
	 * ```bash
	 * npx i18n <command>
	 * ```
	 *
	 * ### Commands
	 *
	 * #### `i18n generate`
	 * Generates Java•Script cache files from YAML source of truth. This is useful for web bundles (Vite/Webpack) to avoid parsing YAML at runtime.
	 *
	 * - **Options**
	 *   - `--data <dir>` – Data directory containing `{locale}/_/t.yaml` (default: `./data`)
	 *   - `--out <dir>` – Output directory for `.js` files (default: `./src/i18n`)
	 *
	 * ```bash
	 * npx i18n generate --data ./my-data --out ./src/translations
	 * ```
	 *
	 * #### `i18n audit`
	 * Audits i18n keys and finds missing or unused translations.
	 *
	 * #### `i18n sync`
	 * Syncs translations between vocabularies.
	 *
	 * #### `i18n completion`
	 * Generates a shell completion script for bash or zsh.
	 *
	 * - **Usage**
	 * ```bash
	 * # For bash
	 * source <(i18n completion bash)
	 *
	 * # For zsh
	 * source <(i18n completion zsh)
	 * ```
	 *
	 * **Permanent Setup (Zsh):**
	 * Add this to your `~/.zshrc`:
	 * ```zsh
	 * if command -v i18n >/dev/null 2>&1; then
	 *   source <(i18n completion zsh)
	 * fi
	 * ```
	 */
	it('How to contribute? - [check here](./CONTRIBUTING.md)', async () => {
		assert.equal(pkg.scripts?.precommit, 'npm test')
		assert.equal(pkg.scripts?.prepush, 'npm test')
		assert.equal(pkg.scripts?.prepare, 'husky')
		const text = await fs.loadDocument(path.join(__dirname, '../CONTRIBUTING.md'))
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})

	/**
	 * @docs
	 * ## CLI Playground
	 */
	it('How to run a CLI sandbox playground to try the library directly?', async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/i18n.git
		 * cd i18n
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play).includes('node play'))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, 'git command fails (e.g., not in a git repo)')
		assert.ok(response.text.trim().endsWith(':nan0web/i18n.git'))
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it('Uses `d.ts` to provide autocomplete hints.', () => {
		assert.equal(pkg.types, 'types/index.d.ts')
		assert.ok(String(pkg.scripts?.build).split(' ').includes('tsc'))
	})

	/**
	 * @docs
	 * ## License
	 */
	it('How to license? - [ISC LICENSE](./LICENSE) file.', async () => {
		/** @docs */
		const text = await fs.loadDocument(path.join(__dirname, '../LICENSE'))
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', () => {
	testRender()
	testCompletion()
})

describe('Rendering README.md', async () => {
	let text = ''
	const format = new Intl.NumberFormat('en-US').format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument(path.join(__dirname, '../README.md'), text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(path.join(__dirname, '../.datasets/README.dataset.jsonl'), dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument('README.md')
		assert.ok(text.includes('## License'))
	})
})
