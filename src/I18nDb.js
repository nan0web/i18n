import { createT } from './i18n.js'
import extract from './extract.js'
import event from '@nan0web/event'

/**
 * I18nDb — i18n manager that uses DB for loading vocabs
 * Supports hierarchical loading, reactive updates and configurable t.json path.
 */
export default class I18nDb {
	/**
	 * Creates an instance of I18nDb.
	 * @param {Object} input
	 * @param {import("@nan0web/db").default} input.db
	 * @param {string} [input.locale="en"]
	 * @param {string} [input.tPath="_/t"] - path suffix to look for translation files
	 * @param {string} [input.langsPath="_/langs"] - path of the languages config that stores Record<locale: string, any>
	 * @param {import("@nan0web/event/types/types/index.js").EventBus} [input.emitter]
	 * @param {string} [input.dataDir="data"]
	 * @param {string} [input.srcDir="src"]
	 * @param {string} [input.useKeyAsDefault=false]
	 * @param {Record<string, Record<string, string>>} [input.langs={}]
	 */
	constructor(input) {
		const {
			db,
			emitter,
			locale = "en",
			tPath = "_/t",
			langsPath = "_/langs",
			dataDir = "data",
			srcDir = "src",
			langs = {},
			useKeyAsDefault = false,
		} = input

		this.db = db
		this.locale = locale
		this.tPath = tPath
		this.langsPath = langsPath
		this.dataDir = dataDir.endsWith("/") ? dataDir.slice(0, -1) : dataDir
		this.srcDir = srcDir.endsWith("/") ? srcDir.slice(0, -1) : srcDir
		this.langs = langs
		this.useKeyAsDefault = Boolean(useKeyAsDefault)

		this._cache = new Map() // key: `${locale}:${uri}`, value: vocab
		this._tFunctions = new Map() // key → t()

		// Configure emitter
		this.emitter = emitter || event()
	}

	/**
	 * Connect to the database and load language definitions
	 * @returns {Promise<void>}
	 */
	async connect() {
		this.langs = await this.db.loadDocument(this.dataPath + this.langsPath)
	}

	/**
	 * Get list of available locales
	 * @returns {string[]}
	 */
	get locales() {
		return Object.keys(this.langs)
	}

	/**
	 * Get the data path with trailing slash
	 * @returns {string}
	 */
	get dataPath() {
		return this.dataDir + "/"
	}

	/**
	 * Get the source path with trailing slash
	 * @returns {string}
	 */
	get srcPath() {
		return this.srcDir + "/"
	}

	/**
	 * Load vocabulary for a given path, inherited from parents.
	 * @param {string} uri
	 * @returns {Promise<Record<string,string>>}
	 */
	async loadT(uri) {
		if (this._cache.has(uri)) return this._cache.get(uri)

		/** @type {Record<string,string>} */
		const vocab = {}
		const fullPath = await this.db.resolve(uri)
		const segments = fullPath.split('/').filter(Boolean)

		// Collect from all parent `.../tPath`
		for (let i = 1; i <= segments.length; i++) {
			const dirPath = [
				this.dataPath, ...segments.slice(0, i), this.tPath
			].filter(Boolean).join('/').replace(/\/{2,}/g, "/")
			try {
				const partial = await this.db.loadDocument(dirPath, {})
				Object.assign(vocab, partial)
			} catch (err) {
				// Continue even if file is missing
				this.emitter.emit("error", err)
			}
		}

		this._cache.set(uri, vocab)
		this._tFunctions.delete(uri) // invalidate t()

		return vocab
	}

	/**
	 * Get translation function for a given context (path).
	 * @param {string} locale
	 * @param {string} uri
	 * @returns {Promise<function>}
	 */
	async createT(locale, uri = "") {
		if (this._tFunctions.has(uri)) return this._tFunctions.get(uri)

		const url = this.db.resolveSync(locale, uri)
		const vocab = await this.loadT(url)
		const t = createT(vocab)
		this._tFunctions.set(uri, t)
		return t
	}

	/**
	 * Change current locale and emit 'i18nchange'
	 * @param {string} locale
	 * @param {string} [atUri="/"] base path for reloading
	 * @returns {Promise<void>}
	 */
	async setLocale(locale, atUri = '/') {
		this.locale = locale
		this._cache.clear()
		this._tFunctions.clear()

		// Reload base vocabulary
		await this.loadT(atUri)

		await this.emitter.emit('i18nchange', { locale, i18n: this })
	}

	/**
	 * Shortcut: switchTo('uk', 'apps/topup-tel')
	 * Equivalent to setLocale + createT
	 * @param {string} locale
	 * @param {string} uri
	 * @returns {Promise<function>}
	 */
	async switchTo(locale, uri = '/') {
		await this.setLocale(locale, uri)
		return this.createT(locale, uri)
	}

	/**
	 * Extract all translation keys from source files using fs.findStream()
	 * @param {string} srcPath - path to source directory (e.g. 'src/')
	 * @returns {Promise<Set<string>>}
	 */
	async extractKeysFromCode(srcPath) {
		const keys = new Set()
		const re = /\.(js|ts|jsx|tsx)$/

		for await (const entry of this.db.findStream(srcPath)) {
			if (!re.test(entry.file.name)) continue // only JS-like files

			const content = await this.db.loadDocument(entry.file.path)
			if (typeof content !== 'string') continue // skip non-string data

			extract(content).forEach(key => keys.add(key))
		}
		return keys
	}

	/**
	 * Audit translations by comparing keys in code with those in DB
	 * @param {string} [srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
	 * @returns {Promise<Map<string, {missing: string[], unused: string[]}>>}
	 */
	async auditTranslations(srcPath = this.srcPath) {
		const codeKeys = await this.extractKeysFromCode(srcPath)
		const map = new Map()
		for (const locale of this.locales) {
			const vocab = await this.loadT(locale)

			const existingKeys = new Set(Object.keys(vocab))
			const missing = [...codeKeys].filter(key => !existingKeys.has(key))
			const unused = Object.keys(vocab).filter(key => !codeKeys.has(key))

			map.set(locale, { missing, unused })
		}
		return map
	}

	/**
	 * Sync translations for all locales by adding new keys from code as empty string values
	 * @param {string} [targetUri] - target path for saving t.json (e.g. 'apps/topup-tel')
	 * @param {Object} [opts] { useKeyAsDefault, srcPath }
	 * @param {string} [opts.srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
	 * @param {Set<string>} [opts.codeKeys] - translation keys
	 * @param {string} [opts.useKeyAsDefault]
	 * @returns {Promise<Record<string,string>>}
	 */
	async syncTranslations(targetUri = "", opts = {}) {
		const {
			useKeyAsDefault = this.useKeyAsDefault,
			srcPath = this.srcPath,
			codeKeys = await this.extractKeysFromCode(srcPath),
		} = opts

		for (const locale of this.locales) {
			const vocab = await this.loadT(`${locale}/${targetUri}`)
			const tJsonPath = [this.dataDir, locale, targetUri, this.tPath].filter(Boolean).join('/')
			let updated = false

			for (const key of codeKeys) {
				if (vocab[key] === undefined) {
					vocab[key] = useKeyAsDefault ? key : ""
					updated = true
				}
			}

			if (updated) {
				await this.db.saveDocument(tJsonPath, vocab)
				this._cache.delete(`${locale}/${targetUri}`)   // clear cache
				this._tFunctions.delete(`${locale}/${targetUri}`) // invalidate t()
			}
		}

		return {}
	}
}
