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
		new RegExp(`\\b(?:${fields})\\s*[:=]\\s*['"\`](.*?)['"\`]`, 'g'),
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
	const keys = new Set()
	const classList = Array.isArray(models) ? models : Object.values(models)
	const fieldPatterns = EXTRACT_FIELDS.map((f) => new RegExp('^' + f.replace(/\*/g, '.*') + '$'))

	const scanObject = (obj, inUI = false) => {
		if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return

		for (const [propName, propValue] of Object.entries(obj)) {
			// Skip internal/non-schema properties if it's a class
			if (propName === 'prototype' || propName === 'length' || propName === 'name') continue

			if (typeof propValue === 'string') {
				if (inUI) {
					keys.add(propValue)
				} else {
					const matches = fieldPatterns.some((re) => re.test(propName))
					if (matches) keys.add(propValue)
				}
			} else if (propValue && typeof propValue === 'object') {
				// Recursive scan for nested UI or field objects
				// but check if it's an array (options)
				if (Array.isArray(propValue)) {
					if (inUI) {
						// Inside UI*, extract any string in the array
						for (const item of propValue) {
							if (typeof item === 'string') keys.add(item)
							else if (item && typeof item === 'object') scanObject(item, true)
						}
					} else if (propName === 'options') {
						// Handle options array specifically
						for (const opt of propValue) {
							if (!opt || typeof opt !== 'object') continue
							for (const [optKey, optVal] of Object.entries(opt)) {
								if (typeof optVal !== 'string') continue
								// Rule: Skip 'value' inside options to avoid translating database IDs
								if (optKey === 'value' || optKey.startsWith('value')) continue
								const matches = fieldPatterns.some((re) => re.test(optKey))
								if (matches) keys.add(optVal)
							}
						}
					}
				} else {
					// Generic object recursion (mark true if we hit a 'UI' property)
					scanObject(propValue, inUI || propName.toLowerCase().startsWith('ui'))
				}
			}
		}
	}

	for (const Model of classList) {
		if (!Model || typeof Model !== 'function') continue
		scanObject(Model)
	}

	return [...keys].sort()
}

export default extract
