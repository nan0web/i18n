/** @typedef {'en' | 'en_GB' | 'en_US' | 'uk' | 'uk_UA'} Locale */
export class Language {
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
    /** @param {Partial<Language>} [data] */
    constructor(data?: Partial<Language>);
    /** @type {string} */
    title: string;
    /** @type {Locale} */
    locale: Locale;
    /** @type {string} */
    icon: string;
}
export type Locale = "en" | "en_GB" | "en_US" | "uk" | "uk_UA";
