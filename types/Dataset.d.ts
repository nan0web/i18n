export default class Dataset {
	constructor({ lang, pkgName }: { lang?: string | undefined; pkgName: any })
	lang: string
	pkgName: any
	entries: any[]
	/**
	 *
	 * @param {object} entry
	 * @param {string} [entry.instruction]
	 * @param {string} [entry.task]
	 * @param {string} [entry.input=""]
	 * @param {string[]} [entry.context=[]]
	 * @param {string} [entry.proven=`assert-in-${this.pkgName}`]
	 * @param {string[]} [entry.tags=[]]
	 * @param {string} [entry.lang=this.lang]
	 */
	push(entry: {
		instruction?: string | undefined
		task?: string | undefined
		input?: string | undefined
		context?: string[] | undefined
		proven?: string | undefined
		tags?: string[] | undefined
		lang?: string | undefined
	}): void
}
