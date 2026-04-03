import i18n from './i18n.js'
import I18nDb from './I18nDb.js'

/** @typedef {import('@nan0web/types').TFunction} TFunction */

export { I18nDb }
export { defaultVocab } from './i18n.js'
/** Marker for i18n extraction. Returns the key as-is. */
export const t = (key) => key
export { createT } from '@nan0web/types'
export { extract, extractFromModels, extractInfo, EXTRACT_FIELDS } from './extract.js'
export { Language } from './domain/Language.js'

export { i18n }
export default i18n
