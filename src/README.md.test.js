import { describe, it, before, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db-fs'
import { NoConsole } from "@nan0web/log"
import { DocsParser } from "@nan0web/test"
import tDefault, { createT } from './i18n.js'
import uk from './uk.js'

const fs = new DB()
let pkg
let originalConsole

// Load package.json once before tests
before(async () => {
	originalConsole = console
	const doc = await fs.loadDocument('package.json', {})
	pkg = doc || {}
})

beforeEach(() => {
	console = new NoConsole()
})

after(() => {
	console = originalConsole
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender () {
	/**
	 * @docs
	 * # @nan0web/i18n
	 *
	 * A tiny, zero‑dependency i18n helper for Java•Script projects.
	 * It provides a default English dictionary and a simple `createT` factory to
	 * generate translation functions for any language.
	 *
	 * ## Install
	 * ```bash
	 * npm install @nan0web/i18n
	 * ```
	 *
	 * ## Usage
	 */
	it("tDefault is just for example, usually there is no need to use it", () => {
		//import tDefault, { createT } from '@nan0web/i18n'
		//import uk from './src/uk.js'   // Ukrainian dictionary

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
		assert.deepStrictEqual(console.output(), [
			"Welcome, Anna!", "Вітаємо у пісочниці, Іван!", "NonExistingKey"
		].map(el => (["info", el])))
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
	 * ### Default export
	 * The default export is a translation function that uses the built‑in English
	 * dictionary (`defaultVocab`). It is ready to use without any setup.
	 *
	 * ## Adding a New Language
	 * Create a new module (e.g., `src/fr.js`) that exports a dictionary:
	 *
	 * ```js
	 * export default {
	 *   "Welcome!": "Bienvenue, {name}!",
	 *   "Submit": "Envoyer",
	 *   // …other keys
	 * }
	 * ```
	 * Then generate a translation function:
	 *
	 * ```js
	 * import fr from './src/fr.js'
	 * const t = createT(fr)
	 * ```
	 *
	 * ## Testing
	 * Run the bundled tests with:
	 *
	 * ```bash
	 * npm test
	 * ```
	 * The test suite covers default behaviour, placeholder substitution and fallback
	 * logic.
	 *
	 * ## Contributing
	 */
	it("Ready to contribute [check here](./CONTRIBUTING.md)", async () => {
		/** @docs */
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes('# Contributing'))
	})
	/**
	 * @docs
	 * ## License
	 * ISC – see the [LICENSE](./LICENSE) file.
	 */
	it('LICENSE file exists', async () => {
		/** @docs */
		const text = await fs.loadDocument('LICENSE')
		assert.ok(String(text).includes('ISC'))
	})

	it('package.json scripts contain required commands', () => {
		const scripts = pkg.scripts || {}
		assert.ok(scripts.build, 'Missing "build" script')
		assert.ok(scripts.test, 'Missing "test" script')
		// pre-commit can be defined as "pre-commit" or as a husky hook; we check both keys
		assert.ok(
			scripts['pre-commit'] || scripts.precommit,
			'Missing "pre-commit" script'
		)
	})
}

describe('README.md testing', testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
