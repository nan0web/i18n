import i18n from './i18n.js'
import I18nDb from './I18nDb.js'

/** @typedef {import('@nan0web/types').TFunction} TFunction */

export { I18nDb }
export { i18n, defaultVocab } from './i18n.js'
export { createT } from '@nan0web/types'
export { extract, extractFromModels, extractInfo, EXTRACT_FIELDS } from './extract.js'

export default i18n
