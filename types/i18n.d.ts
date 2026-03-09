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
    'Welcome!': string;
    'Try to use keys as default text': string;
};
export { createT } from "@nan0web/types";
export default i18n;
export type TFunction = import("@nan0web/types").TFunction;
