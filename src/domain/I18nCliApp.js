import { Model } from '@nan0web/types'
import audit from '../cli/audit.js'
import sync from '../cli/sync.js'
import info from '../cli/info.js'
import generate from '../cli/generate.js'
import inspect from '../cli/inspect.js'
import { completionScript, zshCompletionScript } from '../cli/completion.js'

/**
 * Main application model for i18n CLI toolkit.
 */
export class I18nCliApp extends Model {
    static UI = {
        title: 'i18n Universal Toolkit',
        description: '0HCnAI Zero-Hallucination Subagent without LLM'
    }

    static command = { 
        default: 'help', 
        positional: true,
        options: ['audit', 'sync', 'info', 'generate', 'inspect', 'completion', 'help'] 
    }

    static json = { default: false }
    static data = { default: './data' }
    static out = { default: './src/i18n' }
    static domain = { default: 'src/domain' }
    static vocab = { default: 'play/data/uk/_/t.nan0' }
    static ui = { default: 'src/ui' }
    static components = { default: 'src/components' }
    static shell = { default: 'bash', positional: true }

    async *run() {
        const d = /** @type {any} */ (this);
        switch (d.command) {
            case 'audit':
                await audit()
                break
            case 'info':
                await info()
                break
            case 'sync':
                await sync({ json: d.json })
                break
            case 'generate':
                await generate({ data: d.data, out: d.out })
                break
            case 'inspect':
                await inspect({ domain: d.domain, ui: d.ui, vocab: d.vocab, components: d.components })
                break
            case 'completion':
                if (d.shell === 'zsh') {
                    yield { type: 'log', level: 'info', message: zshCompletionScript }
                } else {
                    yield { type: 'log', level: 'info', message: completionScript }
                }
                break
            default:
                yield { type: 'log', level: 'error', message: 'Usage: i18n <audit|sync|generate|inspect|completion>' }
                yield { type: 'log', level: 'info', message: `
Commands:
  info               Show current extraction logic and fields
  audit              Audit i18n keys
  sync               Sync translations
    --json           Sync into t.json instead of t.yaml
  generate           Generate JS cache from YAML
    --data <dir>     Data directory (default: ./data)
    --out <dir>      Output directory (default: ./src/i18n)
  inspect            Audit Model-as-Schema i18n keys
    --domain <dir>   Domain models dir (default: ./src/domain)
    --vocab <file>   Vocab file (default: play/data/uk/_/t.nan0)
    --ui <dir>       UI components dir (default: ./src/ui)
    --components <dir> Additional components dir (default: ./src/components)
  completion [shell] Generate shell completion script (bash|zsh)
` }
                return { status: 'error' }
        }

        return { status: 'ok' }
    }
}
