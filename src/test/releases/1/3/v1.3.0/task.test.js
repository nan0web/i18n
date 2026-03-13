import { test, it, describe } from 'node:test'
import assert from 'node:assert/strict'
import { extractFromModels } from '../../../../../extract.js'

describe('Release v1.3.0: Model-First Extraction (extractFromModels)', () => {
	it('should flat extract all strings from nested properties inside a static UI block', () => {
		class TestModel {
			static UI = {
                // Should extract everything inside
				genericMessage: 'Action required',
				actions: [
					{ title: 'Confirm Action' },
					'Maybe Later' // string in array
				],
				deep: {
					level: {
						hint: 'You are very deep'
					}
				}
			}

            static notUI = {
                label: 'This should be extracted because it is label',
                genericMessage: 'This should NOT be extracted because it is outside UI'
            }
		}

		const keys = extractFromModels({ TestModel })
        
		assert.equal(keys.includes('Action required'), true, 'Should extract genericMessage from UI block')
		assert.equal(keys.includes('Confirm Action'), true, 'Should flat extract from objects in UI arrays')
		assert.equal(keys.includes('Maybe Later'), true, 'Should flat extract raw strings in UI arrays')
		assert.equal(keys.includes('You are very deep'), true, 'Should flat extract deeply nested UI values')
		assert.equal(keys.includes('This should be extracted because it is label'), true, 'Should extract standard fields outside UI')
		assert.equal(keys.includes('This should NOT be extracted because it is outside UI'), false, 'Should ignore random fields outside UI')
	})
})
