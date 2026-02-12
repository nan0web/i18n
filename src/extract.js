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
		/\b(?:help|label|title|placeholder|message):\s*['"`](.*?)['"`]/g,
		/\/\/\s*t\(['"`](.*?)['"`]\)/g
	]

	const keys = new Set()

	for (const re of regexes) {
		let match
		while ((match = re.exec(content)) !== null) {
			keys.add(match[1])
		}
	}

	return [...keys].sort()
}

export default extract
