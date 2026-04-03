#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { extractInfo } from '../extract.js'

/**
 * @function info
 * @description Outputs formatting and extraction scheme for this project.
 */
export default async function info() {
	console.info('\n🔍 i18n Extraction Logic Info')
	console.info('---')
	console.info(`🔠 Model-as-Schema fields : ${extractInfo.fields.join(', ')}`)
	console.info(`🪝  Functions              : ${extractInfo.functions.join(', ')}`)
	console.info(`💬 Comments               : ${extractInfo.comments.join(', ')}`)

	if (extractInfo.ignore) {
		console.info(`\n🚫 Ignored Contexts:`)
		for (const [key, rules] of Object.entries(extractInfo.ignore)) {
			console.info(`   - ${key}: ${rules.join(', ')}`)
		}
	}
	console.info('')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	info().catch(console.error)
}
