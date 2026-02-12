#!/usr/bin/env node

import Logger from '@nan0web/log'
import { createT, defaultVocab } from '../src/i18n.js'
import uk from '../src/vocabs/uk.js'
import I18nDb from '../src/I18nDb.js'
import { MemoryDB } from '@nan0web/test'

console = new Logger()

console.warn(Logger.LOGO)
console.warn('=== @nan0web/i18n CLI Playground ===\n')

// Default English translation
let t = createT(defaultVocab)
console.success('Default English:')
console.info(t('Welcome!', { name: 'Anna' }))
console.info(t('Try to use keys as default text'))
console.info()

// Ukrainian translation
t = createT(uk)
console.success('Ukrainian:')
console.info(t('Welcome!', { name: 'Іван' }))
console.info(t('Try to use keys as default text'))
console.info()

// Fallback example
console.success('Fallback (key not found):')
console.error(t('NonExistingKey'))
console.info()

// I18nDb example
console.success('I18nDb example:')
const db = new MemoryDB({
	predefined: new Map([
		['data/uk/_/t.json', { 'Welcome!': 'Ласкаво просимо!', Home: 'Дім' }],
		[
			'data/uk/apps/topup-tel/_/t.json',
			{ 'Top-up Telephone': 'Поповнення телефону', Home: 'Головна' },
		],
	]),
})
await db.connect()
const i18nDb = new I18nDb({
	db,
	locale: 'uk',
	tPath: '_/t.json',
	dataDir: 'data',
	srcDir: 'src',
	langs: { uk: true, en: true },
})
t = await i18nDb.createT('apps/topup-tel')
console.info(t('Top-up Telephone'))
console.info(t('Welcome!'))
console.info(t('Home'))
console.info()

console.warn('=== End of Playground ===')
