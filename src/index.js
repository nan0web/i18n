import i18n from './i18n.js'
import I18nDb from './I18nDb.js'

/** @typedef {import('./I18nDb.js').TFunction} TFunction */

export { I18nDb }
export { i18n, createT, TFunction, defaultVocab } from './i18n.js'
export { extract, extractFromModels, extractInfo, EXTRACT_FIELDS } from './extract.js'

export default i18n
