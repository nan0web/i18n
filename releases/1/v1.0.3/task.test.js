import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8'))

describe('v1.0.3 — Fix package publishing', () => {
	it('version is 1.0.3', () => {
		assert.equal(pkg.version, '1.0.3')
	})

	it('files array includes bin/**/*.js', () => {
		assert.ok(pkg.files.includes('bin/**/*.js'), 'bin/**/*.js must be in files')
	})

	it('bin entry points to bin/i18n.js', () => {
		assert.equal(pkg.bin.i18n, 'bin/i18n.js')
	})

	it('bin/i18n.js exists and is importable', async () => {
		const { existsSync } = await import('node:fs')
		const binPath = new URL('../../../bin/i18n.js', import.meta.url)
		assert.ok(existsSync(binPath), 'bin/i18n.js must exist')
	})

	it('bin/generate.js exists', async () => {
		const { existsSync } = await import('node:fs')
		const genPath = new URL('../../../bin/generate.js', import.meta.url)
		assert.ok(existsSync(genPath), 'bin/generate.js must exist')
	})

	it('bin/audit.js exists', async () => {
		const { existsSync } = await import('node:fs')
		const auditPath = new URL('../../../bin/audit.js', import.meta.url)
		assert.ok(existsSync(auditPath), 'bin/audit.js must exist')
	})

	it('stale scripts/ directory does not exist', async () => {
		const { existsSync } = await import('node:fs')
		const scriptsDir = new URL('../../../scripts/', import.meta.url)
		assert.ok(!existsSync(scriptsDir), 'scripts/ directory must not exist')
	})
})
