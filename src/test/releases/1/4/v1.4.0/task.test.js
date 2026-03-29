import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../../../../../')
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

describe('Release v1.4.0: Break Circular Dependency & Stabilize I18nDb', () => {
	// ── 1. @nan0web/core MUST NOT be in dependencies ─────────────────
	it('@nan0web/core is absent from dependencies', () => {
		const deps = pkg.dependencies || {}
		assert.equal(deps['@nan0web/core'], undefined,
			'@nan0web/core must not be in dependencies')
	})

	it('@nan0web/core is absent from devDependencies', () => {
		const devDeps = pkg.devDependencies || {}
		assert.equal(devDeps['@nan0web/core'], undefined,
			'@nan0web/core must not be in devDependencies')
	})

	// ── 2. Language model imports Model from @nan0web/types ──────────
	it('Language model imports Model from @nan0web/types, not @nan0web/core', () => {
		const languageSrc = readFileSync(
			resolve(root, 'src/domain/Language.js'), 'utf-8'
		)
		assert.ok(
			languageSrc.includes("from '@nan0web/types'"),
			'Language.js should import from @nan0web/types'
		)
		assert.equal(
			languageSrc.includes("from '@nan0web/core'"), false,
			'Language.js must NOT import from @nan0web/core'
		)
	})

	// ── 3. @nan0web/types dependency version ─────────────────────────
	it('@nan0web/types version is ^1.7.0 or higher', () => {
		const version = (pkg.dependencies || {})['@nan0web/types']
		assert.ok(version, '@nan0web/types must be in dependencies')
		// Extract minor version number from semver like ^1.7.0
		const match = version.match(/\d+\.(\d+)/)
		assert.ok(match && Number(match[1]) >= 7,
			`@nan0web/types version should be ^1.7.0+, got ${version}`)
	})

	// ── 4. I18nDb.loadT uses explicit path join ──────────────────────
	it('I18nDb.loadT does not use db.resolveSync for path building', () => {
		const i18nDbSrc = readFileSync(
			resolve(root, 'src/I18nDb.js'), 'utf-8'
		)
		// loadT method should use explicit join, not resolveSync
		const loadTSection = i18nDbSrc.slice(
			i18nDbSrc.indexOf('async loadT('),
			i18nDbSrc.indexOf('async createT(')
		)
		assert.equal(
			loadTSection.includes('resolveSync'), false,
			'loadT should not use db.resolveSync — use explicit path join instead'
		)
		assert.ok(
			loadTSection.includes('.join('),
			'loadT should use .join() for path construction'
		)
	})

	// ── 5. I18nDb.createT uses db.absolute() ─────────────────────────
	it('I18nDb.createT uses db.absolute() for locale URI', () => {
		const i18nDbSrc = readFileSync(
			resolve(root, 'src/I18nDb.js'), 'utf-8'
		)
		const createTSection = i18nDbSrc.slice(
			i18nDbSrc.indexOf('async createT('),
			i18nDbSrc.indexOf('async setLocale(')
		)
		assert.ok(
			createTSection.includes('.absolute('),
			'createT should use db.absolute() for locale path resolution'
		)
	})

	// ── 6. Hierarchical loading works (functional test) ──────────────
	it('hierarchical loading merges parent and child vocabularies', async () => {
		const DB = (await import('@nan0web/db')).default
		const { I18nDb } = await import('../../../../../../src/index.js')

		const db = new DB({
			predefined: new Map([
				['data/uk/_/t', { 'Welcome': 'Ласкаво просимо' }],
				['data/uk/pages/_/t', { 'Home': 'Головна' }],
				['data/uk/pages/about/_/t', { 'About': 'Про нас' }],
			]),
		})
		await db.connect()

		const i18n = new I18nDb({ db, locale: 'uk', dataDir: 'data' })
		const t = await i18n.createT('uk', 'pages/about')

		assert.equal(t('Welcome'), 'Ласкаво просимо', 'Should inherit from root uk/_/t')
		assert.equal(t('Home'), 'Головна', 'Should inherit from uk/pages/_/t')
		assert.equal(t('About'), 'Про нас', 'Should load from uk/pages/about/_/t')
	})

	// ── 7. knip clean ────────────────────────────────────────────────
	it('knip.json does not list @nan0web/core in ignoreDependencies', () => {
		let knipConfig
		try {
			knipConfig = JSON.parse(readFileSync(
				resolve(root, 'knip.json'), 'utf-8'
			))
		} catch {
			// knip.json may not exist — that's fine
			return
		}
		const ignored = knipConfig.ignoreDependencies || []
		assert.equal(
			ignored.includes('@nan0web/core'), false,
			'knip.json should not ignore @nan0web/core'
		)
	})
})
