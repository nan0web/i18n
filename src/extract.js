export function extract(content, regex = /\bt\(['"`](.*?)['"`]\)/g) {
	let match
	const keys = []
	while ((match = regex.exec(content)) !== null) {
		keys.push(match[1])
	}
	return [...new Set(keys)].sort()
}

export default extract
