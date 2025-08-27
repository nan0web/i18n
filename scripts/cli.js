#!/usr/bin/env node

import audit from './i18n-audit.js'
import sync from './i18n-sync.js'

const command = process.argv[2]

switch (command) {
	case 'audit':
		await audit()
		break
	case 'sync':
		await sync()
		break
	default:
		console.error('Usage: i18n <audit|sync>')
		process.exit(1)
}
