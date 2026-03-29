/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA'} Locale */
/**
 * @property {string} title Language title
 * @property {Locale} locale Locale
 * @property {string} icon Language icon
 */
export class Language extends Model {
    static title: {
        help: string;
        default: string;
    };
    static locale: {
        help: string;
        errorNotFound: string;
        errorInvalidFormat: string;
        /** @type {Locale} */
        default: Locale;
        validate: (str: any) => string | true;
    };
    static icon: {
        help: string;
        default: string;
    };
}
export type Locale = "en" | "en_GB" | "en_US" | "uk" | "uk_UA";
import { Model } from '@nan0web/types';
