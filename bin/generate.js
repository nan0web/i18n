#!/usr/bin/env node
/**
 * Generate i18n JS cache from YAML source of truth
 *
 * Usage: i18n generate [--data ./data] [--out ./src/i18n]
 *
 * Scans data/{locale}/_/t.yaml and writes {out}/{locale}.js
 * This is a build-time cache for Vite/web bundles.
 * CLI apps load translations directly via DBFS at runtime.
 */
import fs from 'node:fs'
import path from 'node:path'
import DBFS from '@nan0web/db-fs'

const HEADER = `/**
 * ⚠️ GENERATED FILE — DO NOT EDIT MANUALLY
 * Source of truth: data/%LOCALE%/_/t.yaml
 * Regenerate: npx i18n generate
 */`

function generateJS(locale, translations) {
	const header = HEADER.replace('%LOCALE%', locale)
	const entries = Object.entries(translations)
		.map(([key, value]) => {
			const escapedValue = String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
			return `\t'${key}': '${escapedValue}',`
		})
		.join('\n')

	return `${header}\nexport default {\n${entries}\n}\n`
}

export default async function generate(options = {}) {
	const cwd = process.cwd()
	const dataDir = path.resolve(cwd, options.data || 'data')
	const outDir = path.resolve(cwd, options.out || 'src/i18n')

	if (!fs.existsSync(dataDir)) {
		console.error(`❌ Data directory not found: ${dataDir}`)
		process.exit(1)
	}

	fs.mkdirSync(outDir, { recursive: true })

	const db = new DBFS({ root: dataDir })

	// Find all locales with _/t.yaml
	const locales = fs.readdirSync(dataDir).filter((d) => {
		if (d === '_') return false
		const tPath = path.join(dataDir, d, '_', 't.yaml')
		return fs.existsSync(tPath)
	})

	let generated = 0

	for (const locale of locales) {
		const translations = await db.loadDocument(`${locale}/_/t.yaml`)
		const jsContent = generateJS(locale, translations)
		const outPath = path.join(outDir, `${locale}.js`)

		fs.writeFileSync(outPath, jsContent, 'utf8')
		console.log(
			`✅ ${locale}: ${Object.keys(translations).length} keys → ${path.relative(cwd, outPath)}`,
		)
		generated++
	}

	if (generated === 0) {
		console.warn('⚠️ No locales found with _/t.yaml in', dataDir)
	} else {
		console.log(`\n✨ Generated ${generated} locale(s)`)
	}

	return generated
}
