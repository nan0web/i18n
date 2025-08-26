/**
 * Default English translation dictionary (fallback/default).
 *
 * Keys correspond to the original English UI strings.
 */
export const defaultVocab = {
	"Welcome!": "Welcome, {name}!",
	"Try to use keys as default text": "This way it is no need to create default (English) version vocab",
}

/**
 * Creates a translation function bound to a specific vocabulary.
 *
 * @param {Object<string,string>} vocab - Mapping from keys to localized strings.
 * @returns {(key:string, vars?:Object<string,string|number>)=>string} Translation function.
 *
 * The returned function looks up the key in the supplied vocabulary.
 * If the key is missing, it returns the original key.
 * Placeholders in the form `{name}` are replaced by values from the `vars` object.
 *
 * Example:
 *   const t = createT({ "Hello {name}": "{name}, вітаю!" })
 *   t("Hello {name}", { name: "Іван" }) // → "Іван, вітаю!"
 */
export function createT(vocab) {
	return function t(key, vars = {}) {
		const template = Object.prototype.hasOwnProperty.call(vocab, key) ? vocab[key] : key
		return template.replace(/{([^}]+)}/g, (_, name) =>
			Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
		)
	}
}

/**
 * Selects appropriate vocabulary dictionary by locale.
 *
 * @param {Array<readonly [string, string]> | Record<string, string> | Map<string, string>} mapLike
 * @returns {(locale: string, defaultValue: Object<string, string>) => Object<string, string>}
 */
export function i18n(mapLike) {
	let map = new Map()
	if (mapLike instanceof Map) {
		// Good
		map = mapLike
	}
	else if (Array.isArray(mapLike)) {
		const entries = mapLike
		map = new Map(entries)
	}
	else if ("object" === typeof mapLike) {
		map = new Map(Object.entries(mapLike))
	}
	else {
		throw new TypeError([
			"Map-like input required",
			"- Array<readonly [string, string]>",
			"- Record<string, string>",
			"- Map<string, string>",
		].join("\n"))
	}
	for (const [key] of map.entries()) {
		if (5 === key.length) {
			map.set(key.replace(/[^a-zA-Z]+/, ""), key)
		}
		if (key.length > 2) {
			const short = key.slice(0, 2)
			if (!map.has(short)) {
				map.set(short, key)
			}
		}
		// @todo add the fallback for non-localized languages, for instance:
		// en-GB, en-US - if these are defined and the current locale en-NZ
		// the first with en-* must be used
		// I think to sort by keys (a.length - b.length) and check if does not match
		// long key, try first 2 chars.
	}

	return (locale = "en-GB", defaultValue = {}) => {
		locale = locale.replace(/[^a-zA-Z]+/, "")
		if (map.has(locale)) {
			const value = map.get(locale)
			return "string" === typeof value ? map.get(value) : value
		}
		locale = locale.slice(0, 2)
		if (map.has(locale)) {
			const value = map.get(locale)
			return "string" === typeof value ? map.get(value) : value
		}
		return defaultValue
	}
}

export default i18n
