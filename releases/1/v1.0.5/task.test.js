import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8'))

describe('v1.0.5 — Fix transitive dependency @nan0web/log', () => {
	it('@nan0web/db is in dependencies', () => {
		assert.ok(
			pkg.dependencies && pkg.dependencies['@nan0web/db'],
			'Missing @nan0web/db in dependencies',
		)
	})

	it('@nan0web/event is in dependencies', () => {
		assert.ok(
			pkg.dependencies && pkg.dependencies['@nan0web/event'],
			'Missing @nan0web/event in dependencies',
		)
	})

	it('@nan0web/db version is explicit (not workspace:)', () => {
		const ver = pkg.dependencies['@nan0web/db']
		assert.ok(!ver.startsWith('workspace:'), 'Version should be explicit (e.g. ^1.0.2)')
	})

	it('@nan0web/event version is explicit (not workspace:)', () => {
		const ver = pkg.dependencies['@nan0web/event']
		assert.ok(!ver.startsWith('workspace:'), 'Version should be explicit (e.g. ^1.0.0)')
	})
})
