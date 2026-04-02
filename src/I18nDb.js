import { createT } from '@nan0web/types'
import extract, { extractFromModels } from './extract.js'
import event from '@nan0web/event'

/**
 * @typedef {import("@nan0web/types").TFunction} TFunction
 */

/**
 * I18nDb — i18n manager that uses DB for loading vocabs
 * Supports hierarchical loading, reactive updates and configurable t path.
 */
export default class I18nDb {
	/** @type {import('@nan0web/db').default} */
	db
	/**
	 * @type {string}
	 * @deprecated - use models with the provided data models with meta fields
	 */
	srcDir
	/** @type {string} */
	locale
	/** @type {string} */
	tPath
	/** @type {string} */
	langsPath
	/** @type {string} */
	dataDir
	/** @type {Record<string, Record<string, string>>|Array<{value?: string, label?: string, locale?: string, title?: string}>} */
	langs
	/** @type {Record<string, Function>|Function[]} */
	models
	/** @type {boolean} */
	useKeyAsDefault
	/** @type {import('@nan0web/event/types/types/index.js').EventBus} */
	emitter
	/** @type {Map<string, Record<string,string>>} */
	_cache
	/** @type {Map<string, TFunction>} */
	_tFunctions

	/**
	 * Creates an instance of I18nDb.
	 * @param {Object} input
	 * @param {import("@nan0web/db").default} input.db
	 * @param {string} [input.locale="en"]
	 * @param {string} [input.tPath] - path suffix to look for translation files (default: _/t)
	 * @param {string} [input.langsPath] - path of the languages config (default: _/langs)
	 * @param {import("@nan0web/event/types/types/index.js").EventBus} [input.emitter]
	 * @param {string} [input.dataDir="data"]
	 * @param {string} [input.srcDir="src"]
	 * @param {string} [input.useKeyAsDefault=false]
	 * @param {Record<string, Record<string, string>>|Array<{value?: string, label?: string, locale?: string, title?: string}>} [input.langs={}]
	 * @param {Record<string, Function>|Function[]} [input.models={}] - Model-as-Schema classes for key extraction
	 */
	constructor(input) {
		const {
			db,
			emitter,
			locale = 'en',
			dataDir = 'data',
			srcDir = 'src',
			langs = {},
			models = {},
			useKeyAsDefault = false,
		} = input

		this.db = db
		this.locale = locale
		this.tPath = input.tPath ?? (db?.Directory?.FILE ? `${db.Directory.FILE}/t` : '_/t')
		this.langsPath =
			input.langsPath ?? (db?.Directory?.FILE ? `${db.Directory.FILE}/langs` : '_/langs')
		this.dataDir = dataDir.endsWith('/') ? dataDir.slice(0, -1) : dataDir
		this.srcDir = srcDir.endsWith('/') ? srcDir.slice(0, -1) : srcDir
		this.langs = langs
		this.models = models
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
		this.langs = (await this.db.loadDocument(this.dataPath + this.langsPath, null)) || this.langs
	}

	/**
	 * Get list of available locales
	 * @returns {string[]}
	 */
	get locales() {
		if (Array.isArray(this.langs)) {
			return this.langs.map((l) => /** @type {string} */ (l.locale || l.value || ''))
		}
		return Object.keys(this.langs)
	}

	/**
	 * Returns available locales as array of options: { value, label }
	 * @returns {Array<{value: string, label: string}>}
	 */
	getLangOptions() {
		if (Array.isArray(this.langs)) {
			return this.langs.map((l) => ({
				value: /** @type {string} */ (l.locale || l.value || ''),
				label: /** @type {string} */ (l.title || l.label || l.locale || l.value || ''),
			}))
		}
		// Fallback for object format { uk: { label: 'Українська' } } or { uk: 'Українська' }
		return Object.entries(this.langs).map(([value, data]) => ({
			value,
			label: (data && typeof data === 'object' ? data.label : data) || value,
		}))
	}

	/**
	 * Get the data path with trailing slash
	 * @returns {string}
	 */
	get dataPath() {
		return this.dataDir + '/'
	}

	/**
	 * Get the source path with trailing slash
	 * @returns {string}
	 */
	get srcPath() {
		return this.srcDir + '/'
	}

	/**
	 * Load vocabulary for a given path, inherited from parents.
	 * @param {string} uri
	 * @returns {Promise<Record<string,string>>}
	 */
	async loadT(uri) {
		const cached = this._cache.get(uri)
		if (cached) return cached

		/** @type {Record<string,string>} */
		const vocab = {}

		// Hierarchical loading logic:
		// For uri='uk/apps/topup-tel' and tPath='_/t', it should load:
		// 1. uk/_/t
		// 2. uk/apps/_/t
		// 3. uk/apps/topup-tel/_/t
		const segments = uri.split('/').filter(Boolean)
		const paths = []
		for (let i = 1; i <= segments.length; i++) {
			const subPath = segments.slice(0, i).join('/')
			const path = [this.dataDir, subPath, this.tPath].filter(Boolean).join('/')
			paths.push(path)
		}

		for (const path of paths) {
			try {
				const doc = await this.db.loadDocument(path)
				if (doc) {
					Object.assign(vocab, doc.t ?? doc)
				}
			} catch (err) {
				this.emitter.emit('error', { data: err, uri: path })
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
	 * @returns {Promise<TFunction>}
	 */
	async createT(locale = this.locale, uri = '') {
		const t = this._tFunctions.get(uri)
		if (t) return t

		const url = [locale, uri].filter(Boolean).join('/')
		const vocab = await this.loadT(url)
		const newT = createT(vocab, locale)
		this._tFunctions.set(uri, newT)
		return newT
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

	// ─── Model-First Extraction (v1.1.0+) ────────────────────────────

	/**
	 * Extract translation keys directly from Model-as-Schema classes.
	 * This is the **primary** extraction method.
	 *
	 * @param {Record<string, Function>|Function[]} [models] - defaults to this.models
	 * @returns {Set<string>}
	 */
	extractKeysFromModels(models = this.models) {
		return new Set(extractFromModels(models))
	}

	/**
	 * Audit translations by comparing Model keys with those in DB.
	 * Uses Models as the single source of truth.
	 *
	 * @param {Record<string, Function>|Function[]} [models] - defaults to this.models
	 * @returns {Promise<Map<string, {missing: string[], unused: string[]}>>}
	 */
	async auditModels(models = this.models) {
		const modelKeys = this.extractKeysFromModels(models)
		const map = new Map()
		for (const locale of this.locales) {
			const vocab = await this.loadT(locale)

			const existingKeys = new Set(Object.keys(vocab))
			const missing = [...modelKeys].filter((key) => !existingKeys.has(key))
			const unused = Object.keys(vocab).filter((key) => !modelKeys.has(key))

			map.set(locale, { missing, unused })
		}
		return map
	}

	/**
	 * Sync translations for all locales using Model keys as source of truth.
	 *
	 * @param {string} [targetUri] - target path for saving t.json
	 * @param {Object} [opts]
	 * @param {Record<string, Function>|Function[]} [opts.models] - defaults to this.models
	 * @param {boolean} [opts.useKeyAsDefault]
	 * @returns {Promise<{ codeKeys: string[] }>}
	 */
	async syncModels(targetUri = '', opts = {}) {
		const { models = this.models, useKeyAsDefault = this.useKeyAsDefault } = opts

		const modelKeys = this.extractKeysFromModels(models)

		for (const locale of this.locales) {
			const vocab = await this.loadT(`${locale}/${targetUri}`)
			const tJsonPath = [this.dataDir, locale, targetUri, this.tPath].filter(Boolean).join('/')
			let updated = false

			for (const key of modelKeys) {
				if (vocab[key] === undefined) {
					vocab[key] = useKeyAsDefault ? key : ''
					updated = true
				}
			}

			if (updated) {
				await this.db.saveDocument(tJsonPath, vocab)
				this._cache.delete(`${locale}/${targetUri}`)
				this._tFunctions.delete(`${locale}/${targetUri}`)
			}
		}

		return { codeKeys: [...modelKeys] }
	}

	// ─── @deprecated Legacy File-Scanning Methods ────────────────────

	/**
	 * @deprecated Use `extractKeysFromModels(models)` instead.
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

			extract(content).forEach((key) => keys.add(key))
		}
		return keys
	}

	/**
	 * @deprecated Use `auditModels(models)` instead.
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
			const missing = [...codeKeys].filter((key) => !existingKeys.has(key))
			const unused = Object.keys(vocab).filter((key) => !codeKeys.has(key))

			map.set(locale, { missing, unused })
		}
		return map
	}

	/**
	 * @deprecated Use `syncModels(targetUri, opts)` instead.
	 * Sync translations for all locales by adding new keys from code as empty string values
	 * @param {string} [targetUri] - target path for saving t.json (e.g. 'apps/topup-tel')
	 * @param {Object} [opts] { useKeyAsDefault, srcPath }
	 * @param {string} [opts.srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
	 * @param {Set<string>} [opts.codeKeys] - translation keys
	 * @param {string} [opts.useKeyAsDefault]
	 * @returns {Promise<{ codeKeys: string[] }>}
	 */
	async syncTranslations(targetUri = '', opts = {}) {
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
					vocab[key] = useKeyAsDefault ? key : ''
					updated = true
				}
			}

			if (updated) {
				await this.db.saveDocument(tJsonPath, vocab)
				this._cache.delete(`${locale}/${targetUri}`) // clear cache
				this._tFunctions.delete(`${locale}/${targetUri}`) // invalidate t()
			}
		}

		return { codeKeys: [...codeKeys] }
	}

	/**
	 * @deprecated Use `syncModels('', opts)` instead.
	 * Sync translations for all locales at the root level.
	 *
	 * @param {Object} [opts] Options for syncTranslations.
	 * @returns {Promise<{ codeKeys: string[] }>}
	 */
	async syncTranslationsAll(opts = {}) {
		return this.syncTranslations('', opts)
	}
}
