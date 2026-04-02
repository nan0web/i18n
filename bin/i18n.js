#!/usr/bin/env node

import audit from './audit.js'
import sync from './sync.js'
import info from './info.js'
import generate from './generate.js'
import inspect from './inspect.js'
import { completionScript, zshCompletionScript } from './completion.js'

/**
 * @todo Follow the model-as-schema-and-app (MaSaA) nan•web pattern.
 */

const command = process.argv[2]

function parseArgs() {
	const args = {}
	for (let i = 3; i < process.argv.length; i++) {
		const arg = process.argv[i]
		if (arg.startsWith('--')) {
			const key = arg.slice(2)
			const next = process.argv[i + 1]
			if (next && !next.startsWith('--')) {
				args[key] = next
				i++
			} else {
				args[key] = true
			}
		}
	}
	return args
}

switch (command) {
	case 'audit':
		await audit()
		break
	case 'info':
		await info()
		break
	case 'sync':
		await sync(parseArgs())
		break
	case 'generate':
		await generate(parseArgs())
		break
	case 'inspect':
		await inspect(parseArgs())
		break
	case 'completion':
		const shell = process.argv[3] || 'bash'
		if (shell === 'zsh') {
			console.log(zshCompletionScript)
		} else {
			console.log(completionScript)
		}
		break
	default:
		console.error('Usage: i18n <audit|sync|generate|inspect|completion>')
		console.error('')
		console.error('Commands:')
		console.error('  info               Show current extraction logic and fields')
		console.error('  audit              Audit i18n keys')
		console.error('  sync               Sync translations')
		console.error('    --json           Sync into t.json instead of t.yaml')
		console.error('  generate           Generate JS cache from YAML')
		console.error('    --data <dir>     Data directory (default: ./data)')
		console.error('    --out <dir>      Output directory (default: ./src/i18n)')
		console.error('  inspect            Audit Model-as-Schema i18n keys')
		console.error('    --domain <dir>   Domain models dir (default: ./src/domain)')
		console.error('    --vocab <file>   Vocab file (default: play/data/uk/_/t.nan0)')
		console.error('    --ui <dir>       UI components dir (default: ./src/ui)')
		console.error('    --components <dir> Additional components dir (default: ./src/components)')
		console.error('  completion [shell] Generate shell completion script (bash|zsh)')
		process.exit(1)
}
