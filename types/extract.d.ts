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
export default extract;
