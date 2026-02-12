import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import i18n, { createT } from './i18n.js'
import uk from './vocabs/uk.js'

describe('i18n', () => {
	it('should return defaultValue when locale is not found', () => {
		const t = i18n({})
		const result = t('en-NZ', { 'Welcome!': 'Welcome!' })
		assert.deepStrictEqual(result, { 'Welcome!': 'Welcome!' })
	})

	it('should handle locale fallbacks for en-* locales', () => {
		const vocab = {
			'en-GB': { 'Welcome!': 'Welcome, GB!' },
			'en-US': { 'Welcome!': 'Welcome, US!' },
		}
		const t = i18n(vocab)

		// Should use en-GB when en-NZ is requested (since en-GB is first in entries)
		const result = t('en-NZ', {})
		assert.deepStrictEqual(result, { 'Welcome!': 'Welcome, GB!' })
	})

	it('should return vocabulary for exact locale match', () => {
		const vocab = {
			'uk-UA': { 'Welcome!': 'Ласкаво просимо!' },
		}
		const t = i18n(vocab)

		const result = t('uk-UA', {})
		assert.deepStrictEqual(result, { 'Welcome!': 'Ласкаво просимо!' })
	})

	it('should handle mixed input types (array, object, map)', () => {
		// Test with array
		const arrayVocab = [
			['en-GB', { 'Welcome!': 'Welcome, GB!' }],
			['en-US', { 'Welcome!': 'Welcome, US!' }],
		]
		const t1 = i18n(arrayVocab)
		assert.deepStrictEqual(t1('en-GB'), { 'Welcome!': 'Welcome, GB!' })

		// Test with object
		const objectVocab = {
			'en-GB': { 'Welcome!': 'Welcome, GB!' },
			'en-US': { 'Welcome!': 'Welcome, US!' },
		}
		const t2 = i18n(objectVocab)
		assert.deepStrictEqual(t2('en-US'), { 'Welcome!': 'Welcome, US!' })

		// Test with Map
		const mapVocab = new Map([
			['en-GB', { 'Welcome!': 'Welcome, GB!' }],
			['en-US', { 'Welcome!': 'Welcome, US!' }],
		])
		const t3 = i18n(mapVocab)
		assert.deepStrictEqual(t3('en-GB'), { 'Welcome!': 'Welcome, GB!' })
	})

	it('translates Ukrainian with placeholder', () => {
		const t = createT(uk)
		assert.equal(t('Welcome!', { name: 'I' }), 'Вітаємо у пісочниці, I!')
	})

	it('falls back to key when missing', () => {
		const t = createT(uk)
		assert.equal(t('MissingKey', {}), 'MissingKey')
	})

	it('handles multiple placeholders', () => {
		const vocab = { Greet: 'Hello {first} {last}!' }
		const t = createT(vocab)
		assert.equal(t('Greet', { first: 'John', last: 'Doe' }), 'Hello John Doe!')
	})
})
