#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import DBFS from '@nan0web/db-fs'
import I18nDb from '../src/I18nDb.js'

/**
 * @function sync
 * @description Syncs translations from src/ into data/ ** /_/t.json for the default locale.
 * @returns {Promise<void>}
 */
export default async function sync() {
	const db = new DBFS()
	await db.connect()

	const i18n = new I18nDb({ db, locale: 'uk', tPath: '_/t.json', dataDir: 'data', srcDir: 'src' })
	await i18n.connect()

	await i18n.syncTranslationsAll()

	console.info('✅ Translations synced from src/ into data/**/_/t.json')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	sync().catch(console.error)
}
