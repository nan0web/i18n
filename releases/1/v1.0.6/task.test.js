import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extract } from '../../../src/extract.js'
import I18nDb from '../../../src/I18nDb.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8'))

describe('v1.0.6 — I18n Parser and Lang Options', () => {
	it('extract handles options properly without matching values inside options array', () => {
		const content = `
			static properties = {
				status: {
					label: 'Status',
					value: 'Static status value',
					options: [
						{ label: 'Active', value: 'active' },
						{ label: 'Inactive', value: 'inactive' }
					]
				}
			}
		`
		const keys = extract(content)
		assert.ok(keys.includes('Status'))
		assert.ok(keys.includes('Static status value'))
		assert.ok(keys.includes('Active'))
		assert.ok(keys.includes('Inactive'))
		assert.ok(!keys.includes('active'))
		assert.ok(!keys.includes('inactive'))
	})

	it('I18nDb.getLangOptions supports array format and object format', () => {
		const i18nObj = new I18nDb({ db: {}, langs: { uk: 'Українська', en: { label: 'English' } } })
		const optsObj = i18nObj.getLangOptions()
		assert.deepEqual(optsObj, [
			{ value: 'uk', label: 'Українська' },
			{ value: 'en', label: 'English' },
		])

		const i18nArr = new I18nDb({ db: {}, langs: [{ value: 'es', label: 'Español' }] })
		const optsArr = i18nArr.getLangOptions()
		assert.deepEqual(optsArr, [{ value: 'es', label: 'Español' }])
	})

	it('bin/sync.js uses _t.json if --json provided', async () => {
		const bin = readFileSync(path.join(__dirname, '../../../bin/sync.js'), 'utf-8')
		assert.ok(bin.includes('args.json'))
	})

	it('package.json version matches 1.0.6+', () => {
		assert(
			['1.0.6', '1.1.0', '1.1.1', '1.2.0', '1.3.0', '1.4.0'].includes(pkg.version),
			`expected 1.0.6, 1.1.0, 1.1.1, 1.2.0, 1.3.0 or 1.4.0, got ${pkg.version}`,
		)
	})
})
