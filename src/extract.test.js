import { describe, it } from 'node:test'
import extract, { extractFromModels } from './extract.js'
import { Language } from './domain/Language.js'

describe('extract()', () => {
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

	it('should ignore value inside options arrays but extract it elsewhere', () => {
		const content = `
		static properties = {
			status: {
				label: 'Status',
				value: 'Some static value',
				options: [
					{ label: 'Active', value: 'active' },
					{ label: 'Inactive', value: 'inactive' }
				]
			},
			another: {
				value: 'This value should be extracted',
				options: [
					{ label: '[Nested Array test]', value: '[some_val]' }
				]
			}
		}
		`
		const keys = extract(content)
		console.assert(keys.includes('Status'))
		console.assert(keys.includes('Some static value'))
		console.assert(keys.includes('This value should be extracted'))
		console.assert(keys.includes('Active'))
		console.assert(keys.includes('Inactive'))
		console.assert(keys.includes('[Nested Array test]'))
		console.assert(!keys.includes('active'))
		console.assert(!keys.includes('inactive'))
		console.assert(!keys.includes('[some_val]'))
	})

	it('should extract any property starting with error', () => {
		const content = `
		static properties = {
			field: {
				errorNotFound: "Not found",
				errorInvalid: "Invalid value",
				errorICannotUnderstandWhyYouCannotUnderstandMe: "Wat",
				error_custom: "Custom error",
				error: "General error"
			}
		}`
		const keys = extract(content)
		console.assert(keys.includes('Not found'))
		console.assert(keys.includes('Invalid value'))
		console.assert(keys.includes('Wat'))
		console.assert(keys.includes('Custom error'))
		console.assert(keys.includes('General error'))
	})

	it('should extract any dynamic field starting with specified prefixes', () => {
		const content = `
		static properties = {
			field: {
				label_main: "Main Label",
				title_hover: "Hover Title",
				help_inline: "Inline Help",
				placeholder_search: "Search...",
				message_empty: "List is empty",
				error_api: "API failed",
				value_initial: "Initial Value",
				options: [
					{ label_short: "Short", value_inner: "inner" }
				]
			}
		}`
		const keys = extract(content)
		console.assert(keys.includes('Main Label'))
		console.assert(keys.includes('Hover Title'))
		console.assert(keys.includes('Inline Help'))
		console.assert(keys.includes('Search...'))
		console.assert(keys.includes('List is empty'))
		console.assert(keys.includes('API failed'))
		console.assert(keys.includes('Initial Value'))
		console.assert(keys.includes('Short'))
		console.assert(!keys.includes('inner'))
	})
})

describe('extractFromModels()', () => {
	it('should extract keys from a real Language model', () => {
		const keys = extractFromModels({ Language })
		console.assert(keys.includes('Language title'), 'should include Language title')
		console.assert(keys.includes('Locale'), 'should include Locale')
		console.assert(keys.includes('Locale not found'), 'should include Locale not found')
		console.assert(keys.includes('Invalid locale format'), 'should include Invalid locale format')
		console.assert(keys.includes('Language icon'), 'should include Language icon')
		console.assert(keys.length === 5, `expected 5 keys, got ${keys.length}: ${keys}`)
	})

	it('should extract wildcard fields (label_short, error_invalid)', () => {
		class CustomModel {
			static username = {
				label_short: 'User',
				error_invalid: 'Format is wrong',
				help_alt: 'Use your email',
			}
		}
		const keys = extractFromModels({ CustomModel })
		console.assert(keys.includes('User'))
		console.assert(keys.includes('Format is wrong'))
		console.assert(keys.includes('Use your email'))
		console.assert(keys.length === 3)
	})

	it('should extract keys from an array of models', () => {
		const keys = extractFromModels([Language])
		console.assert(keys.includes('Language title'))
		console.assert(keys.length === 5)
	})

	it('should skip non-translatable fields (default, validate, options values)', () => {
		class TestModel {
			static field = {
				help: 'Help text',
				default: 'should_not_be_extracted',
				validate: () => true,
			}
		}
		const keys = extractFromModels({ TestModel })
		console.assert(keys.includes('Help text'))
		console.assert(!keys.includes('should_not_be_extracted'))
		console.assert(keys.length === 1)
	})

	it('should extract label from options but skip value', () => {
		class DropdownModel {
			static role = {
				label: 'Role',
				options: [
					{ label: 'Admin', value: 'admin' },
					{ label: 'Guest', value: 'guest' },
				],
			}
		}
		const keys = extractFromModels({ DropdownModel })
		console.assert(keys.includes('Role'))
		console.assert(keys.includes('Admin'))
		console.assert(keys.includes('Guest'))
		console.assert(!keys.includes('admin'), 'should not include value "admin"')
		console.assert(!keys.includes('guest'), 'should not include value "guest"')
	})

	it('should handle empty or invalid input gracefully', () => {
		console.assert(extractFromModels({}).length === 0)
		console.assert(extractFromModels([]).length === 0)
		console.assert(extractFromModels({ x: null }).length === 0)
		console.assert(extractFromModels({ y: 42 }).length === 0)
	})

	it('should extract from multiple models', () => {
		class A {
			static f1 = { help: 'Help A' }
		}
		class B {
			static f2 = { label: 'Label B', errorX: 'Error B' }
		}
		const keys = extractFromModels({ A, B })
		console.assert(keys.includes('Help A'))
		console.assert(keys.includes('Label B'))
		console.assert(keys.includes('Error B'))
		console.assert(keys.length === 3)
	})
})
