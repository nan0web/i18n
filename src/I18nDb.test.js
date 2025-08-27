import { beforeEach, describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { MemoryDB } from '@nan0web/test'
import I18nDb from './I18nDb.js'

const predefined = new Map([
	['data/_/langs.json', { uk: "Ukrainian" }],
	['data/uk/_/t.json', { 'Welcome!': 'Ласкаво просимо!', 'Home': 'Дім' }],
	['data/uk/apps/topup-tel/_/t.json', { 'Top-up Telephone': 'Поповнення телефону', 'Home': 'Головна' }]
])
const i18nDbOptions = {
	locale: 'uk',
	tPath: '_/t',
	dataDir: 'data',
	srcDir: 'src',
}

describe('I18nDb', () => {
	/** @type {MemoryDB} */
	let db
	/** @type {I18nDb} */
	let i18n

	beforeEach(async () => {
		// Create a completely new db instance
		db = new MemoryDB({ predefined })
		await db.connect()
		i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()
	})

	it('should translate strings using vocabulary from DB', async () => {
		const t = await i18n.createT("uk", 'apps/topup-tel')
		assert.equal(t('Top-up Telephone'), 'Поповнення телефону')
	})

	it('should inherit translations from parent directories', async () => {
		const t = await i18n.createT("uk", 'apps/topup-tel')
		assert.equal(t('Welcome!'), 'Ласкаво просимо!')
	})

	it('should prioritize translations from current path over inherited', async () => {
		const t = await i18n.createT("uk", 'apps/topup-tel')
		assert.equal(t('Home'), 'Головна')
	})

	it('should use inherited translation for keys not present in current path', async () => {
		const t = await i18n.createT("uk", 'apps/other')
		assert.equal(t('Welcome!'), 'Ласкаво просимо!')
		assert.equal(t('Home'), 'Дім')
	})

	it('should emit i18nchange event when locale changes', async () => {
		let fired = false
		i18n.emitter.on('i18nchange', () => { fired = true })

		await i18n.setLocale('en')
		assert.equal(fired, true)
	})

	it('should not conflict with same keys in different locations', async () => {
		const t1 = await i18n.createT("uk", 'apps/topup-tel')
		const t2 = await i18n.createT('uk')

		assert.equal(t1('Home'), 'Головна')
		assert.equal(t2('Home'), 'Дім')
	})

	it('should reset vocabularies when the instance is recreated', async () => {
		// create T function in one instance
		const t1 = await i18n.createT("uk", 'apps/topup-tel')
		assert.equal(t1('Top-up Telephone'), 'Поповнення телефону')

		// recreate DB and I18n instance
		db = new MemoryDB({
			predefined: new Map([
				['data/uk/_/t', { 'Welcome!': 'Ласкаво просимо!', 'Home': 'Дім' }],
				['data/uk/apps/topup-tel/_/t', { 'Top-up Telephone': 'Поповнення телефону [updated]', 'Home': 'Головна [updated]' }]
			])
		})
		await db.connect()
		i18n = new I18nDb({
			db,
			locale: 'uk',
			tPath: '_/t',
			dataDir: 'data',
			srcDir: 'src',
			langs: { 'uk': true, 'en': true }
		})

		// create T again
		const t2 = await i18n.createT("uk", 'apps/topup-tel')
		assert.equal(t2('Top-up Telephone'), 'Поповнення телефону [updated]')
		assert.equal(t2('Home'), 'Головна [updated]')
	})

	it('should sync new translation keys with empty string values', async () => {
		// Mock some code content with translation keys
		const map = new Map(predefined)
		map.set('src/example.js', `t("New Feature")\nt("Another New Key")`)
		const db = new MemoryDB({ predefined: map })
		await db.connect()

		const i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()
		await i18n.syncTranslations('apps/topup-tel', { useKeyAsDefault: true })

		// Check each locale's vocab
		const ukVocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(ukVocab['New Feature'], "New Feature")
		assert.equal(ukVocab['Another New Key'], "Another New Key")
	})

	it('should sync new translation keys with keys as default when enabled', async () => {
		const map = new Map(predefined)
		// Mock some code content with translation keys
		map.set('src/example.js', `t("New Feature")\nt("Another New Key")`)
		const db = new MemoryDB({ predefined: map })
		await db.connect()

		const i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()
		await i18n.syncTranslations('apps/topup-tel', { useKeyAsDefault: true })

		const ukVocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(ukVocab['New Feature'], 'New Feature')
		assert.equal(ukVocab['Another New Key'], 'Another New Key')
	})

	it('should not update existing translations', async () => {
		const map = new Map(predefined)
		// Mock some code content with translation keys
		map.set('src/example.js', `t("New Feature")\nt("Another New Key")`)
		const db = new MemoryDB({ predefined: map })
		await db.connect()

		const i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()

		await db.saveDocument('data/uk/apps/topup-tel/_/t', { 'New Feature': 'Поповнення' })
		await i18n.syncTranslations('apps/topup-tel')

		const vocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(vocab['New Feature'], 'Поповнення') // unchanged
		assert.equal(vocab['Another New Key'], "") // added
	})

	it('should switch locale and return translation function', async () => {
		const t = await i18n.switchTo('uk', 'apps/topup-tel')
		assert.equal(typeof t, 'function')
		assert.equal(t('Top-up Telephone'), 'Поповнення телефону')
	})

	it('should emit error event when loadT fails', async () => {
		let errorEmitted = false
		let emittedError = null

		// Create a db that will throw an error
		const dbWithError = new MemoryDB({ predefined })
		dbWithError.loadDocument = async (path) => {
			if (path.includes('missing')) {
				throw new Error('File not found')
			}
			return db.loadDocument(path)
		}
		await dbWithError.connect()

		const i18nWithError = new I18nDb({ ...i18nDbOptions, db: dbWithError })
		await i18nWithError.connect()
		i18nWithError.emitter.on('error', (err) => {
			errorEmitted = true
			emittedError = err.data
		})

		await i18nWithError.loadT('/missing/path')
		assert.equal(errorEmitted, true)
		assert.equal(emittedError.message, 'File not found')
	})

	it('should audit translations and return missing and unused keys', async () => {
		const map = new Map(predefined)
		map.set('src/example.js', `t("Used Key")\nt("Another Used Key")`)
		map.set('data/uk/_/t.json', { 'Used Key': 'Використаний ключ', 'Unused Key': 'Невикористаний ключ' })

		const db = new MemoryDB({ predefined: map })
		await db.connect()

		const i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()

		const result = await i18n.auditTranslations()
		const uk = result.get("uk")
		assert.deepEqual(uk.missing, ['Another Used Key'])
		assert.deepEqual(uk.unused, ['Unused Key'])
	})

	it('should sync translations for all locales', async () => {
		const map = new Map(predefined)
		map.set('data/_/langs.json', { uk: "Ukrainian", en: "English" })
		map.set('src/example.js', `t("Global Key")`)

		const db = new MemoryDB({ predefined: map })
		await db.connect()

		const i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()

		await i18n.syncTranslations()

		// Check each locale's vocab
		const enVocab = await db.loadDocument('data/en/_/t')
		const ukVocab = await db.loadDocument('data/uk/_/t')

		assert.equal(enVocab['Global Key'], "")
		assert.equal(ukVocab['Global Key'], "")
	})
})
