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
	const regexes = [
		/\bt\(['"`](.*?)['"`]\)/g,
		/\b(?:help|label|title|placeholder|message|value):\s*['"`](.*?)['"`]/g,
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
				if (fullMatch.startsWith('value:')) {
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

export default extract
