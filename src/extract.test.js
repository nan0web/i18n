import { describe, it } from "node:test"
import extract from "./extract.js"

describe("extract()", () => {
	it('should extract keys from t("...") calls', () => {
		const content = `
    t("Welcome!")
    t('Hello {name}', { name: 'World' })
    t(\`Goodbye {name}\`, { name: 'World' })
  `
		const keys = extract(content)
		console.assert(keys.includes('Welcome!'))
		console.assert(keys.includes('Hello {name}'))
		console.assert(keys.includes('Goodbye {name}'))
	})

	it('should extract keys from comments like // t("...")', () => {
		const content = `
    // t("Commented key")
    /* t("Multiline commented key") */
  `
		const keys = extract(content)
		console.assert(keys.includes('Commented key'))
		console.assert(keys.includes('Multiline commented key'))
	})

	it('should extract unique keys only', () => {
		const content = `
    t("Duplicate")
    t('Duplicate')
  `
		const keys = extract(content)
		console.assert(keys.length === 1)
		console.assert(keys[0] === 'Duplicate')
	})

	it('should return empty array if no keys found', () => {
		const content = `
    console.log("No translation keys here")
    const x = 10
  `
		const keys = extract(content)
		console.assert(keys.length === 0)
	})

	it('should handle strings with quotes inside', () => {
		const content = `
    t("Don't worry")
    t('Say "hello"')
    t(\`Backtick "\` and '\` quotes\`)
  `
		const keys = extract(content)
		console.assert(keys.includes("Don't worry"))
		console.assert(keys.includes('Say "hello"'))
		console.assert(keys.includes('Backtick "` and \'` quotes'))
	})

})
