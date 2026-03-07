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
