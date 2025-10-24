import { describe, it, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { NoConsole } from "@nan0web/log"
import { DocsParser, MemoryDB, runSpawn, DatasetParser } from "@nan0web/test"
import { createT, extract, i18n, I18nDb } from './index.js'

const fs = new DB()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
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
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/i18n")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/i18n")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/i18n
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/i18n")
	})
	/**
	 * @docs
	 * ## Usage with Locale Detection
	 */
	it('How to handle multiple dictionaries?', () => {
		//import { i18n, createT } from "@nan0web/i18n"

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
		assert.deepEqual(console.output(), [
			["info", "Welcome, Alice!"],
			["info", "Вітаю, Богдан!"],
			["info", "Привіт, Саша!"],
			["info", "Вітаємо, Марія!"],
			["info", "Welcome, Fallback!"],
		])
	})
	/**
	 * @docs
	 * ## Usage with Database
	 */
	it('How to use database-backed translations with hierarchical loading, use the `I18nDb` class?', async () => {
		//import { MemoryDB } from "@nan0web/test"
		//import { I18nDb } from "@nan0web/i18n"
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
		assert.deepEqual(console.output(), [
			["info", "Поповнення телефону"],
			["info", "Ласкаво просимо!"],
			["info", "Головна"]
		])
	})
	/**
	 * @docs
	 * ## Keywords extractions
	 */
	it("How to extract translation keys directly from your source code?", () => {
		const content = `
		console.log(t("Hello, {name}!"))
		const menu = ["First", "Second"] // t("First"), t("Second")
		`
		const keys = extract(content)
		console.info(keys) // ← ["First", "Hello, {name}!", "Second"]
		assert.deepEqual(console.output(), [
			["info", ["First", "Hello, {name}!", "Second"]]
		])
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
	 * ## CLI Playground
	 */
	it("How to run a CLI sandbox playground to try the library directly?", async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/i18n.git
		 * cd i18n
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play).includes("node play"))
		const response = await runSpawn('git', ['remote', 'get-url', 'origin'])
		assert.ok(response.code === 0, "git command fails (e.g., not in a git repo)")
		assert.ok(response.text.trim().endsWith(':nan0web/i18n.git'))
	})
	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` to provide autocomplete hints.", () => {
		assert.equal(pkg.types, "types/index.d.ts")
		assert.ok(String(pkg.scripts?.build).split(" ").includes("tsc"))
	})
	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})
	/**
	 * @docs
	 * ## License
	 */
	it("How to license? - [ISC LICENSE](./LICENSE) file.", async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})
}

describe('README.md testing', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
