import { resolveAliases, resolveDefaults } from '@nan0web/types'

/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA'} Locale */

export class Language {
	static title = {
		help: 'Language title',
		default: '',
	}
	static locale = {
		help: 'Locale',
		errorNotFound: 'Locale not found',
		errorInvalidFormat: 'Invalid locale format',
		/** @type {Locale} */
		default: 'en_GB',
		validate: (str) => /^[a-z]{2}(_[A-Z]{2})?$/.test(str) || Language.locale.errorInvalidFormat,
	}
	static icon = {
		help: 'Language icon',
		default: '🇬🇧',
	}

	/** @type {string} */
	title = Language.title.default
	/** @type {Locale} */
	locale = Language.locale.default
	/** @type {string} */
	icon = Language.icon.default

	/** @param {Partial<Language>} [data] */
	constructor(data = {}) {
		data = resolveAliases(Language, data)
		Object.assign(this, resolveDefaults(Language, data))
	}
}
