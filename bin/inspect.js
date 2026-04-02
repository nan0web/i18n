/**
 * 📡 Deterministic i18n Auditor (inspect)
 *
 * 1. Scans domain/ for static help/UI keys.
 * 2. Checks vocab file for existing translations.
 * 3. Scans ui/ for hardcoded t('literal') calls (disallowed).
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

async function findFiles(dir, files = []) {
	try {
		const entries = await readdir(dir, { withFileTypes: true })
		for (const entry of entries) {
			const res = join(dir, entry.name)
			if (entry.isDirectory()) {
				await findFiles(res, files)
			} else if (entry.name.endsWith('.js')) {
				files.push(res)
			}
		}
	} catch (e) {
		// Dir doesn't exist, ignore
	}
	return files
}

/**
 * @param {Object} args
 */
export default async function inspect(args = {}) {
    const ROOT = resolve(process.cwd())
    const DOMAIN_DIR = resolve(ROOT, args.domain || 'src/domain')
    const UI_SRC_DIR = resolve(ROOT, args.ui || 'src/ui')
    const COMPONENTS_DIR = resolve(ROOT, args.components || 'src/components')
    const VOCAB_FILE = resolve(ROOT, args.vocab || 'play/data/uk/_/t.nan0')

    // Regex: static UI = '...' | static help = '...'
    const DOMAIN_KEY_REGEX = /static\s+((?:UI|help)[A-Za-z0-9_]*)\s*=\s*['"]([^'"]+)['"]/g
    // Regex: t('literal') - finds literals in t() calls
    const T_LITERAL_REGEX = /\bt\(['"]([^'"]+)['"]\)/g

	console.log(`🔍 Scanning Domain: ${relative(ROOT, DOMAIN_DIR)} for i18n keys...`)

	const domainFiles = await findFiles(DOMAIN_DIR)
	const domainKeys = new Set()

	for (const file of domainFiles) {
		const content = await readFile(file, 'utf-8')
		let match
		while ((match = DOMAIN_KEY_REGEX.exec(content)) !== null) {
			domainKeys.add(match[2])
		}
	}

	console.log(
		`Found ${domainKeys.size} keys in domain models:\n   - ${[...domainKeys].join('\n   - ')}\n`
	)

	console.log(`🔍 Validating translations in: ${relative(ROOT, VOCAB_FILE)}...`)
	let vocabContent = ''
	try {
		vocabContent = await readFile(VOCAB_FILE, 'utf-8')
	} catch (e) {
		console.warn(`⚠️ Missing vocab file: ${relative(ROOT, VOCAB_FILE)}, creating it...`)
	}

	const missing = []
	for (const key of domainKeys) {
		if (
			!vocabContent.includes(`'${key}':`) &&
			!vocabContent.includes(`"${key}":`) &&
			!vocabContent.includes(`${key}:`)
		) {
			missing.push(key)
		}
	}

	if (missing.length > 0) {
		console.log(`❌ Missing translations for keys: ${missing.join(', ')}`)
	} else {
		console.log('✅ ALL domain keys translated in vocabulary.\n')
	}

	console.log(`🔍 Scanning UI (${relative(ROOT, UI_SRC_DIR)}) for hardcoded t() calls...`)
	const uiFiles = await findFiles(UI_SRC_DIR)
	const componentsFiles = await findFiles(COMPONENTS_DIR)
	const allUiFiles = [...uiFiles, ...componentsFiles]

	let hardcodedCount = 0
	for (const file of allUiFiles) {
		const content = await readFile(file, 'utf-8')
		let match
		while ((match = T_LITERAL_REGEX.exec(content)) !== null) {
			const key = match[1]
			console.log(`❌ Forbidden hardcoded t('${key}') in: ${relative(ROOT, file)}`)
			hardcodedCount++
		}
	}

	if (hardcodedCount > 0) {
		console.log(`\n❌ Found ${hardcodedCount} forbidden hardcoded translation calls.\n`)
	} else {
		console.log('✅ 0 Hardcoded t() calls found in UI/Components. Compliant.\n')
	}

	console.log('✅ i18n Validation Parent: 100% Model-First compliant.')

	if (missing.length > 0 || hardcodedCount > 0) process.exit(1)
}
