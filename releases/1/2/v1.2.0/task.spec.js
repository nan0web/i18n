import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import DB from '@nan0web/db'
import I18nDb from '../../../../src/I18nDb.js'

describe('Release v1.2.0: Move Translations to data/*/t.yaml', () => {
	it('I18nDb should use t.yaml as default tPath', () => {
		const i18n = new I18nDb({ db: { Directory: { FILE: '_' } } })
		assert.strictEqual(i18n.tPath, '_/t')
	})

	it('should load translations from data/uk/t.yaml by default', async () => {
		const predefined = new Map([
			['data/_/langs.json', { uk: 'Ukrainian' }],
			['data/uk/_/t', { Hello: 'Привіт' }],
		])
		const db = new DB({ predefined })
		await db.connect()
		const i18n = new I18nDb({ db, dataDir: 'data' })
		await i18n.connect()

		const t = await i18n.createT('uk')
		assert.strictEqual(t('Hello'), 'Привіт')
	})

	it('should sync into data/uk/t.yaml by default', async () => {
		const predefined = new Map([['data/_/langs.json', { uk: 'Ukrainian' }]])
		const db = new DB({ predefined })
		await db.connect()

		class TestModel {
			static field = { help: 'Sync Me' }
		}

		const i18n = new I18nDb({ db, dataDir: 'data', models: { TestModel } })
		await i18n.connect()

		await i18n.syncModels()

		const vocab = await db.loadDocument('data/uk/_/t')
		assert.strictEqual(vocab['Sync Me'], '')
	})
})
