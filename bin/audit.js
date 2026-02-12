#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import DBFS from '@nan0web/db-fs'
import { I18nDb } from '@nan0web/i18n'

/**
 * @function audit
 * @description Audits translations for all locales, checking for missing and unused keys.
 * @returns {Promise<void>}
 */
export default async function audit() {
	const db = new DBFS()
	await db.connect()

	const i18n = new I18nDb({ db, tPath: '_/t.json', dataDir: 'data', srcDir: 'src' })
	await i18n.connect()

	for (const locale of i18n.locales) {
		i18n.locale = locale
		const { missing, unused } = await i18n.auditTranslations()

		if (missing.length > 0) {
			console.error(`❌ Missing translations for ${locale}:`, missing)
			process.exit(1)
		}

		if (unused.length > 0) {
			console.warn(`⚠️ Unused translations for ${locale}:`, unused)
		}
	}

	console.info(`✅ All translation keys are present`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	audit().catch((err) => {
		console.error(err)
		process.exit(1)
	})
}
