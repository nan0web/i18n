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
		/** @type {Locale} */
		default: 'en_GB',
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
		if (data.locale && !/^[a-z]{2}(_[A-Z]{2})?$/.test(data.locale)) {
			throw new Error(`Invalid locale format: ${data.locale}`)
		}
		data = resolveAliases(Language, data)
		Object.assign(this, resolveDefaults(Language, data))
	}
}
