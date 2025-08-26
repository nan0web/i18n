#!/usr/bin/env node

import Logger from '@nan0web/log'
import { createT, defaultVocab } from '../src/i18n.js'
import uk from '../src/vocabs/uk.js'

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

console.warn('=== End of Playground ===')
