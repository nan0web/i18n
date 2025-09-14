/**
 * Creates a translation function bound to a specific vocabulary.
 *
 * @param {Object<string, string> | Map<string, string>} vocab - Mapping from keys to localized strings.
 * @returns {(key:string, vars?:Object<string,string|number>)=>string} Translation function.
 *
 * The returned function looks up the key in the supplied vocabulary.
 * If the key is missing, it returns the original key.
 * Placeholders in the form `{name}` are replaced by values from the `vars` object.
 *
 * Example:
 *   const t = createT({ "Hello {name}": "{name}, вітаю!" })
 *   t("Hello {name}", { name: "Іван" }) // → "Іван, вітаю!"
 */
export function createT(vocab: {
    [x: string]: string;
} | Map<string, string>): (key: string, vars?: {
    [x: string]: string | number;
}) => string;
/**
 * Selects appropriate vocabulary dictionary by locale.
 *
 * @param {Array<readonly [string, string]> | Record<string, Record<string, string>> | Map<string, Record<string, string>>} mapLike
 * @returns {(locale: string, defaultValue: Object<string, string>) => Object<string, string>}
 */
export function i18n(mapLike: Array<readonly [string, string]> | Record<string, Record<string, string>> | Map<string, Record<string, string>>): (locale: string, defaultValue: {
    [x: string]: string;
}) => {
    [x: string]: string;
};
/**
 * Default English translation dictionary (fallback/default).
 *
 * Keys correspond to the original English UI strings.
 */
export const defaultVocab: {
    "Welcome!": string;
    "Try to use keys as default text": string;
};
export default i18n;
