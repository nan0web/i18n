export function p(text) {
	if (text === undefined || text === null) {
		console.info()
		return
	}
	console.info(text)
}

export function errorMsg(text) {
	console.error(text)
}

export function highlight(text) {
	console.success(text)
}
