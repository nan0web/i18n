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
		const template = Object.hasOwn(vocab, key) ? vocab[key] : key
		return template.replace(/{([^}]+)}/g, (_, name) =>
			Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
		)
	}
}

/**
 * Selects appropriate vocabulary dictionary by locale.
 *
 * @param {Array<readonly [string, string]> | Record<string, Record<string, string>> | Map<string, Record<string, string>>} mapLike
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

	const normalize = key => key.replace(/[^a-zA-Z]+/g, "")

	// Preprocess map to handle locale fallbacks
	const processedMap = new Map()
	for (const [key, value] of map.entries()) {
		const cleanKey = normalize(key)
		if ([2, 4].includes(cleanKey.length)) {
			processedMap.set(cleanKey, value)
		}
		if (key.length > 2) {
			const short = key.slice(0, 2)
			if (!processedMap.has(short)) {
				processedMap.set(short, value)
			}
		}
	}

	return (locale = "en-GB", defaultValue = {}) => {
		locale = normalize(locale)
		if (processedMap.has(locale)) {
			const value = processedMap.get(locale)
			return "string" === typeof value ? processedMap.get(value) : value
		}
		locale = locale.slice(0, 2)
		if (processedMap.has(locale)) {
			const value = processedMap.get(locale)
			return "string" === typeof value ? processedMap.get(value) : value
		}
		return defaultValue
	}
}

export default i18n
