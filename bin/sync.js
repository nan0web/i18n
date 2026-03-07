#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import DBFS from '@nan0web/db-fs'
import I18nDb from '../src/I18nDb.js'

/**
 * @function sync
 * @description Syncs translations from src/ into data/[locale]/_/t.json for the default locale.
 * @param {Object} args
 * @returns {Promise<void>}
 */
export default async function sync(args = {}) {
	const db = new DBFS()
	await db.connect()

	const tPath = args.yaml ? '_/t.yaml' : '_/t.json'
	const i18n = new I18nDb({ db, tPath, dataDir: 'data', srcDir: 'src' })
	await i18n.connect()

	await i18n.syncTranslationsAll()

	console.info(`✅ Translations synced from src/ into data/**/${tPath}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.includes('--yaml') ? { yaml: true } : {}
	sync(args).catch(console.error)
}
