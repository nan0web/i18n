#!/usr/bin/env node
/**
 * Postinstall hint — non-invasive shell completion setup guide
 */
const SHELL = process.env.SHELL || ''
const isZsh = SHELL.includes('zsh')
const shell = isZsh ? 'zsh' : 'bash'
const rc = isZsh ? '~/.zshrc' : '~/.bashrc'

console.log('')
console.log('  📦 @nan0web/i18n installed successfully!')
console.log('')
console.log('  💡 Enable shell completion:')
console.log(`     source <(i18n completion ${shell})`)
console.log('')
console.log(`  🔧 Make it permanent — add to ${rc}:`)
console.log(`     if command -v i18n >/dev/null 2>&1; then`)
console.log(`       source <(i18n completion ${shell})`)
console.log(`     fi`)
console.log('')
