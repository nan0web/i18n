/**
 * Extracts translation keys from source code.
 * Supports:
 * - t('key') calls
 * - Static model properties: help: 'key', label: 'key', title: 'key', placeholder: 'key', message: 'key'
 * - Comments: // t('key')
 *
 * @param {string} content - Source code content.
 * @returns {string[]} Sorted array of unique keys.
 */
export function extract(content: string): string[];
/**
 * Extracts translation keys directly from Model-as-Schema classes.
 * This is the **primary** extraction method.
 *
 * Models must be exported classes with static properties containing
 * fields like `help`, `label*`, `error*`, `placeholder*`, `title*`, `message*`, `value*`.
 *
 * @param {Record<string, Function>|Function[]} models - Object or array of Model classes.
 * @returns {string[]} Sorted array of unique keys.
 *
 * @example
 * import { Language } from './domain/Language.js'
 * import { extractFromModels } from '@nan0web/i18n'
 *
 * const keys = extractFromModels({ Language })
 * // → ['Invalid locale format', 'Language icon', 'Language title', 'Locale', 'Locale not found']
 */
export function extractFromModels(models: Record<string, Function> | Function[]): string[];
/**
 * List of Model-as-Schema fields to extract.
 * @type {string[]}
 */
export const EXTRACT_FIELDS: string[];
export namespace extractInfo {
    export { EXTRACT_FIELDS as fields };
    export let functions: string[];
    export let comments: string[];
    export namespace ignore {
        let value: string[];
    }
}
export default extract;
