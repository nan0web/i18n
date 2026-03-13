import { beforeEach, describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import DB from '@nan0web/db'
import I18nDb from './I18nDb.js'

const predefined = new Map([
	['data/uk/_/t', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
	[
		'data/uk/apps/topup-tel/_/t',
		{ 'Top-up Telephone': 'Поповнення телефону', Home: 'Головна' },
	],
])
const i18nDbOptions = {
	locale: 'uk',
	dataDir: 'data',
	srcDir: 'src',
}

describe('I18nDb', () => {
	/** @type {DB} */
	let db
	/** @type {I18nDb} */
	let i18n

	beforeEach(async () => {
		// Create a completely new db instance
		db = new DB({ predefined })
		await db.connect()
		i18n = new I18nDb({ ...i18nDbOptions, db })
		await i18n.connect()
	})

	it('should translate strings using vocabulary from DB', async () => {
		const t = await i18n.createT('uk', 'apps/topup-tel')
		assert.equal(t('Top-up Telephone'), 'Поповнення телефону')
	})

	it('should inherit translations from parent directories', async () => {
		const t = await i18n.createT('uk', 'apps/topup-tel')
		assert.equal(t('Welcome!'), 'Ласкаво просимо!')
	})

	it('should prioritize translations from current path over inherited', async () => {
		const t = await i18n.createT('uk', 'apps/topup-tel')
		assert.equal(t('Home'), 'Головна')
	})

	it('should use inherited translation for keys not present in current path', async () => {
		const t = await i18n.createT('uk', 'apps/other')
		assert.equal(t('Welcome!'), 'Ласкаво просимо!')
		assert.equal(t('Home'), 'Дім')
	})

	it('should emit i18nchange event when locale changes', async () => {
		let fired = false
		i18n.emitter.on('i18nchange', () => {
			fired = true
		})

		await i18n.setLocale('en')
		assert.equal(fired, true)
	})

	it('should not conflict with same keys in different locations', async () => {
		const t1 = await i18n.createT('uk', 'apps/topup-tel')
		const t2 = await i18n.createT('uk')

		assert.equal(t1('Home'), 'Головна')
		assert.equal(t2('Home'), 'Дім')
	})

	it('should reset vocabularies when the instance is recreated', async () => {
		// create T function in one instance
		const t1 = await i18n.createT('uk', 'apps/topup-tel')
		assert.equal(t1('Top-up Telephone'), 'Поповнення телефону')

		// recreate DB and I18n instance
		db = new DB({
			predefined: new Map([
				['data/uk/_/t', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
				[
					'data/uk/apps/topup-tel/_/t',
					{ 'Top-up Telephone': 'Поповнення телефону [updated]', Home: 'Головна [updated]' },
				],
			]),
		})
		await db.connect()
		i18n = new I18nDb({
			db,
			locale: 'uk',
			dataDir: 'data',
			srcDir: 'src',
			langs: { uk: true, en: true },
		})

		// create T again
		const t2 = await i18n.createT('uk', 'apps/topup-tel')
		assert.equal(t2('Top-up Telephone'), 'Поповнення телефону [updated]')
		assert.equal(t2('Home'), 'Головна [updated]')
	})

	it('should syncModels new keys with useKeyAsDefault', async () => {
		class FeatureModel {
			static feature = { label: 'New Feature' }
			static another = { label: 'Another New Key' }
		}

		const i18nSync = new I18nDb({
			...i18nDbOptions,
			db,
			langs: [{ locale: 'uk', title: 'Українська' }],
			models: { FeatureModel },
			useKeyAsDefault: true,
		})
		await i18nSync.connect()
		await i18nSync.syncModels('apps/topup-tel')

		const ukVocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(ukVocab['New Feature'], 'New Feature')
		assert.equal(ukVocab['Another New Key'], 'Another New Key')
	})

	it('should syncModels new keys with empty string by default', async () => {
		class EmptyModel {
			static item = { label: 'Sync Empty Key' }
		}

		const i18nSync = new I18nDb({
			...i18nDbOptions,
			db,
			langs: [{ locale: 'uk', title: 'Українська' }],
			models: { EmptyModel },
			useKeyAsDefault: false,
		})
		await i18nSync.connect()
		await i18nSync.syncModels('apps/topup-tel')

		const ukVocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(ukVocab['Sync Empty Key'], '')
	})

	it('should not update existing translations via syncModels', async () => {
		class UpdateModel {
			static feature = { label: 'New Feature' }
			static another = { label: 'Another New Key' }
		}

		// Pre-set an existing translation
		await db.saveDocument('data/uk/apps/topup-tel/_/t', {
			'Top-up Telephone': 'Поповнення телефону',
			Home: 'Головна',
			'New Feature': 'Поповнення',
		})

		const i18nSync = new I18nDb({
			...i18nDbOptions,
			db,
			langs: [{ locale: 'uk', title: 'Українська' }],
			models: { UpdateModel },
		})
		await i18nSync.connect()
		await i18nSync.syncModels('apps/topup-tel')

		const vocab = await db.loadDocument('data/uk/apps/topup-tel/_/t')
		assert.equal(vocab['New Feature'], 'Поповнення') // unchanged
		assert.equal(vocab['Another New Key'], '') // added with empty default
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
		const dbWithError = new DB({ predefined })
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

	it('should auditModels and return missing and unused keys', async () => {
		class AuditModel {
			static usedField = { label: 'Used Key' }
			static anotherField = { label: 'Another Used Key' }
		}

		const map = new Map(predefined)
		map.set('data/uk/_/t', {
			'Used Key': 'Використаний ключ',
			'Unused Key': 'Невикористаний ключ',
		})

		const localDb = new DB({ predefined: map })
		await localDb.connect()

		const i18nAudit = new I18nDb({
			...i18nDbOptions,
			db: localDb,
			langs: [{ locale: 'uk', title: 'Українська' }],
			models: { AuditModel },
		})
		await i18nAudit.connect()

		const result = await i18nAudit.auditModels()
		const uk = result.get('uk')
		assert.deepEqual(uk.missing, ['Another Used Key'])
		assert.deepEqual(uk.unused, ['Unused Key'])
	})

	it('should syncModels for all locales', async () => {
		class GlobalModel {
			static item = { label: 'Global Key' }
		}

		const map = new Map(predefined)
		map.set('data/_/langs', [
			{ locale: 'uk', title: 'Ukrainian' },
			{ locale: 'en', title: 'English' }
		])

		const localDb = new DB({ predefined: map })
		await localDb.connect()

		const i18nSync = new I18nDb({
			...i18nDbOptions,
			db: localDb,
			models: { GlobalModel },
		})
		await i18nSync.connect()
		await i18nSync.syncModels()

		const enVocab = await localDb.loadDocument('data/en/_/t')
		const ukVocab = await localDb.loadDocument('data/uk/_/t')

		assert.equal(enVocab['Global Key'], '')
		assert.equal(ukVocab['Global Key'], '')
	})
})
