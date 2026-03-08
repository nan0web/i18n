/**
 * List of Model-as-Schema fields to extract.
 * @type {string[]}
 */
export const EXTRACT_FIELDS = [
	'help*',
	'label*',
	'title*',
	'placeholder*',
	'message*',
	'value*',
	'error*',
]

/**
 * Information about the extraction logic for external tools.
 */
export const extractInfo = {
	fields: EXTRACT_FIELDS,
	functions: ['t'],
	comments: ['// t("key")'],
	ignore: {
		value: ['inside options: [...] arrays'],
	},
}

/**
 * Extracts translation keys from source code.
 * Supports:
 * - t('key') calls
 * - Static model properties: help: 'key', label: 'key', title: 'key', placeholder: 'key', message: 'key'
 * - Comments: // t('key')
 *
 * @param {string} content - Source code content.
 * @returns {string[]} Sorted array of unique keys.
 */
export function extract(content) {
	const fields = EXTRACT_FIELDS.map((s) => s.replace('*', '[a-zA-Z0-9_]*')).join('|')
	const regexes = [
		/\bt\(['"`](.*?)['"`]\)/g,
		new RegExp(`\\b(?:${fields}):\\s*['"\`](.*?)['"\`]`, 'g'),
		/\/\/\s*t\(['"`](.*?)['"`]\)/g,
	]

	const keys = new Set()

	let optionsRanges = []
	let index = 0
	while (index < content.length) {
		const substr = content.substring(index)
		const optMatch = substr.match(/\boptions\s*:\s*\[/)
		if (!optMatch) break

		let start = index + (optMatch.index || 0)
		let bodyStart = start + optMatch[0].length - 1
		let bracketCount = 1
		let i = bodyStart + 1

		let inString = false
		let quoteChar = ''
		while (i < content.length && bracketCount > 0) {
			const char = content[i]
			if (inString) {
				if (char === quoteChar && content[i - 1] !== '\\') {
					inString = false
				}
			} else {
				if (char === "'" || char === '"' || char === '`') {
					inString = true
					quoteChar = char
				} else if (char === '[') {
					bracketCount++
				} else if (char === ']') {
					bracketCount--
				}
			}
			i++
		}
		optionsRanges.push([start, i])
		index = i
	}

	for (let rIndex = 0; rIndex < regexes.length; rIndex++) {
		const re = regexes[rIndex]
		let match
		while ((match = re.exec(content)) !== null) {
			const key = match[1]
			if (rIndex === 1) {
				const fullMatch = match[0]
				if (fullMatch.startsWith('value')) {
					const matchStart = match.index
					const inOptions = optionsRanges.some(
						([start, end]) => matchStart >= start && matchStart <= end,
					)
					if (inOptions) continue // Skip value inside options: [...]
				}
			}
			keys.add(key)
		}
	}

	return [...keys].sort()
}

/**
 * Extracts translation keys directly from Model-as-Schema classes.
 * This is the **primary** extraction method.
 *
 * Models must be exported classes with static properties containing
 * fields like `help`, `label*`, `error*`, `placeholder*`, `title*`, `message*`, `value*`.
 *
 * @param {Record<string, Function>|Function[]} models - Object or array of Model classes.
 * @returns {string[]} Sorted array of unique keys.
 *
 * @example
 * import { Language } from './domain/Language.js'
 * import { extractFromModels } from '@nan0web/i18n'
 *
 * const keys = extractFromModels({ Language })
 * // → ['Invalid locale format', 'Language icon', 'Language title', 'Locale', 'Locale not found']
 */
export function extractFromModels(models) {
	const fieldPatterns = EXTRACT_FIELDS.map((s) => {
		const base = s.replace('*', '')
		return base
	})

	const keys = new Set()
	const classList = Array.isArray(models) ? models : Object.values(models)

	for (const Model of classList) {
		if (!Model || typeof Model !== 'function') continue

		for (const [, meta] of Object.entries(Model)) {
			if (!meta || typeof meta !== 'object') continue

			for (const [fieldName, fieldValue] of Object.entries(meta)) {
				if (typeof fieldValue !== 'string') continue

				const matches = fieldPatterns.some((prefix) => fieldName.startsWith(prefix))
				if (!matches) continue

				// Skip 'value' inside options arrays (same rule as extract())
				// Not needed here because we're iterating static properties, not options arrays.
				keys.add(fieldValue)
			}

			// Also check nested options for label* fields (but skip value* inside options)
			if (Array.isArray(meta.options)) {
				for (const opt of meta.options) {
					if (!opt || typeof opt !== 'object') continue
					for (const [optKey, optVal] of Object.entries(opt)) {
						if (typeof optVal !== 'string') continue
						const matches = fieldPatterns.some((prefix) => optKey.startsWith(prefix))
						// Ignore value* inside options (consistent with extract())
						if (matches && !optKey.startsWith('value')) {
							keys.add(optVal)
						}
					}
				}
			}
		}
	}

	return [...keys].sort()
}

export default extract
