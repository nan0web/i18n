import test from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const TMP_DIR = join(process.cwd(), '.tmp_release_test')
const DOMAIN_DIR = join(TMP_DIR, 'domain')
const UI_DIR = join(TMP_DIR, 'ui')
const VOCAB_FILE = join(TMP_DIR, 't.nan0')

test('Release v1.5.0: i18n Universal Inspector (MaSaA v2)', async (t) => {
    // Setup environment
    await mkdir(TMP_DIR, { recursive: true })
    await mkdir(DOMAIN_DIR, { recursive: true })
    await mkdir(UI_DIR, { recursive: true })

    t.after(async () => {
        await rm(TMP_DIR, { recursive: true, force: true })
    })

    await t.test('it should extract keys from domain models', async () => {
        const modelFile = join(DOMAIN_DIR, 'TestModel.js')
        await writeFile(modelFile, `
            export default class TestModel {
                static UI = 'test.label'
                static help = 'test.help'
            }
        `)

        await writeFile(VOCAB_FILE, `
            'test.label': 'Label',
            'test.help': 'Help'
        `)

        // Should pass if vocab has all keys
        try {
            const out = execSync(`node bin/i18n.js inspect --domain=${DOMAIN_DIR} --vocab=${VOCAB_FILE} --ui=${UI_DIR}`, { encoding: 'utf-8' })
            assert.ok(out.includes('Found 2 keys in domain models'))
            assert.ok(out.includes('All domain keys translated in vocabulary'))
        } catch (e) {
            assert.fail('Should not fail with present translations: ' + (e.stdout || e.message))
        }
    })

    await t.test('it should detect missing translations', async () => {
        await writeFile(VOCAB_FILE, `'only.one': 'Key'`)
        
        try {
            execSync(`node bin/i18n.js inspect --domain=${DOMAIN_DIR} --vocab=${VOCAB_FILE} --ui=${UI_DIR}`, { encoding: 'utf-8', stdio: 'pipe' })
            assert.fail('Should fail on missing translations')
        } catch (e) {
            assert.equal(e.status, 1)
            assert.ok(e.stdout.includes('Missing translations for keys'))
        }
    })

    await t.test('it should detect forbidden hardcoded t() calls in UI', async () => {
         // Reset vocab to be valid
         await writeFile(VOCAB_FILE, `
            'test.label': 'Label',
            'test.help': 'Help'
        `)

        // Clear UI_DIR
        await rm(UI_DIR, { recursive: true, force: true })
        await mkdir(UI_DIR, { recursive: true })

        const uiFile = join(UI_DIR, 'Component.js')
        await writeFile(uiFile, `
            const label = t('Hardcoded Literal')
        `)

        try {
            execSync(`node bin/i18n.js inspect --domain=${DOMAIN_DIR} --vocab=${VOCAB_FILE} --ui=${UI_DIR}`, { encoding: 'utf-8', stdio: 'pipe' })
            assert.fail('Should fail on hardcoded t() calls')
        } catch (e) {
            assert.equal(e.status, 1)
            assert.ok(e.stdout.includes('Hardcoded Literal'))
        }
    })

    await t.test('it should allow only compliant t() calls (e.g. t(Model.UI.key))', async () => {
        // Clear UI_DIR
        await rm(UI_DIR, { recursive: true, force: true })
        await mkdir(UI_DIR, { recursive: true })

        const uiFile = join(UI_DIR, 'Component.js')
        await writeFile(uiFile, `
            const label = t(TestModel.UI)
        `)

        try {
            const out = execSync(`node bin/i18n.js inspect --domain=${DOMAIN_DIR} --vocab=${VOCAB_FILE} --ui=${UI_DIR}`, { encoding: 'utf-8' })
            assert.ok(out.includes('0 Hardcoded t() or forbidden t() usage found'))
        } catch (e) {
            assert.fail('Should not fail on compliant t() call: ' + (e.stdout || e.message))
        }
    })
})

