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

	const i18n = new I18nDb({ db, dataDir: 'data', srcDir: 'src' })
	await i18n.connect()

	const resultMap = await i18n.auditTranslations()

	for (const locale of i18n.locales) {
		i18n.locale = locale
		const result = resultMap.get(locale)
		const missing = result?.missing || []
		const unused = result?.unused || []

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
