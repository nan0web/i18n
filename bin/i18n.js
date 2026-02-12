#!/usr/bin/env node

import audit from './audit.js'
import sync from './sync.js'
import generate from './generate.js'
import { completionScript, zshCompletionScript } from './completion.js'

const command = process.argv[2]

function parseArgs() {
	const args = {}
	for (let i = 3; i < process.argv.length; i++) {
		const arg = process.argv[i]
		if (arg.startsWith('--') && process.argv[i + 1]) {
			args[arg.slice(2)] = process.argv[++i]
		}
	}
	return args
}

switch (command) {
	case 'audit':
		await audit()
		break
	case 'sync':
		await sync()
		break
	case 'generate':
		await generate(parseArgs())
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
		console.error('Usage: i18n <audit|sync|generate|completion>')
		console.error('')
		console.error('Commands:')
		console.error('  audit              Audit i18n keys')
		console.error('  sync               Sync translations')
		console.error('  generate           Generate JS cache from YAML')
		console.error('    --data <dir>     Data directory (default: ./data)')
		console.error('    --out <dir>      Output directory (default: ./src/i18n)')
		console.error('  completion [shell] Generate shell completion script (bash|zsh)')
		process.exit(1)
}
