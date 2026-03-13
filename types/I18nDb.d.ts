/**
 * @typedef {import("@nan0web/types").TFunction} TFunction
 */
/**
 * I18nDb — i18n manager that uses DB for loading vocabs
 * Supports hierarchical loading, reactive updates and configurable t.json path.
 */
export default class I18nDb {
    /**
     * Creates an instance of I18nDb.
     * @param {Object} input
     * @param {import("@nan0web/db").default} input.db
     * @param {string} [input.locale="en"]
     * @param {string} [input.tPath] - path suffix to look for translation files (default: _/t.yaml)
     * @param {string} [input.langsPath] - path of the languages config (default: _/langs)
     * @param {import("@nan0web/event/types/types/index.js").EventBus} [input.emitter]
     * @param {string} [input.dataDir="data"]
     * @param {string} [input.srcDir="src"]
     * @param {string} [input.useKeyAsDefault=false]
     * @param {Record<string, Record<string, string>>|Array<{value: string, label: string}>} [input.langs={}]
     * @param {Record<string, Function>|Function[]} [input.models={}] - Model-as-Schema classes for key extraction
     */
    constructor(input: {
        db: import("@nan0web/db").default;
        locale?: string | undefined;
        tPath?: string | undefined;
        langsPath?: string | undefined;
        emitter?: import("@nan0web/event/types/types/index.js").EventBus | undefined;
        dataDir?: string | undefined;
        srcDir?: string | undefined;
        useKeyAsDefault?: string | undefined;
        langs?: Record<string, Record<string, string>> | {
            value: string;
            label: string;
        }[] | undefined;
        models?: Record<string, Function> | Function[] | undefined;
    });
    /** @type {import('@nan0web/db').default} */
    db: import("@nan0web/db").default;
    /**
     * @type {string}
     * @deprecated - use models with the provided data models with meta fields
     */
    srcDir: string;
    /** @type {string} */
    locale: string;
    /** @type {string} */
    tPath: string;
    /** @type {string} */
    langsPath: string;
    /** @type {string} */
    dataDir: string;
    /** @type {Record<string, Record<string, string>>|Array<{value: string, label: string}>} */
    langs: Record<string, Record<string, string>> | Array<{
        value: string;
        label: string;
    }>;
    /** @type {Record<string, Function>|Function[]} */
    models: Record<string, Function> | Function[];
    /** @type {boolean} */
    useKeyAsDefault: boolean;
    /** @type {import('@nan0web/event/types/types/index.js').EventBus} */
    emitter: import("@nan0web/event/types/types/index.js").EventBus;
    /** @type {Map<string, Record<string,string>>} */
    _cache: Map<string, Record<string, string>>;
    /** @type {Map<string, TFunction>} */
    _tFunctions: Map<string, TFunction>;
    /**
     * Connect to the database and load language definitions
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Get list of available locales
     * @returns {string[]}
     */
    get locales(): string[];
    /**
     * Returns available locales as array of options: { value, label }
     * @returns {Array<{value: string, label: string}>}
     */
    getLangOptions(): Array<{
        value: string;
        label: string;
    }>;
    /**
     * Get the data path with trailing slash
     * @returns {string}
     */
    get dataPath(): string;
    /**
     * Get the source path with trailing slash
     * @returns {string}
     */
    get srcPath(): string;
    /**
     * Load vocabulary for a given path, inherited from parents.
     * @param {string} uri
     * @returns {Promise<Record<string,string>>}
     */
    loadT(uri: string): Promise<Record<string, string>>;
    /**
     * Get translation function for a given context (path).
     * @param {string} locale
     * @param {string} uri
     * @returns {Promise<TFunction>}
     */
    createT(locale?: string, uri?: string): Promise<TFunction>;
    /**
     * Change current locale and emit 'i18nchange'
     * @param {string} locale
     * @param {string} [atUri="/"] base path for reloading
     * @returns {Promise<void>}
     */
    setLocale(locale: string, atUri?: string): Promise<void>;
    /**
     * Shortcut: switchTo('uk', 'apps/topup-tel')
     * Equivalent to setLocale + createT
     * @param {string} locale
     * @param {string} uri
     * @returns {Promise<function>}
     */
    switchTo(locale: string, uri?: string): Promise<Function>;
    /**
     * Extract translation keys directly from Model-as-Schema classes.
     * This is the **primary** extraction method.
     *
     * @param {Record<string, Function>|Function[]} [models] - defaults to this.models
     * @returns {Set<string>}
     */
    extractKeysFromModels(models?: Record<string, Function> | Function[]): Set<string>;
    /**
     * Audit translations by comparing Model keys with those in DB.
     * Uses Models as the single source of truth.
     *
     * @param {Record<string, Function>|Function[]} [models] - defaults to this.models
     * @returns {Promise<Map<string, {missing: string[], unused: string[]}>>}
     */
    auditModels(models?: Record<string, Function> | Function[]): Promise<Map<string, {
        missing: string[];
        unused: string[];
    }>>;
    /**
     * Sync translations for all locales using Model keys as source of truth.
     *
     * @param {string} [targetUri] - target path for saving t.json
     * @param {Object} [opts]
     * @param {Record<string, Function>|Function[]} [opts.models] - defaults to this.models
     * @param {boolean} [opts.useKeyAsDefault]
     * @returns {Promise<{ codeKeys: string[] }>}
     */
    syncModels(targetUri?: string, opts?: {
        models?: Record<string, Function> | Function[] | undefined;
        useKeyAsDefault?: boolean | undefined;
    }): Promise<{
        codeKeys: string[];
    }>;
    /**
     * @deprecated Use `extractKeysFromModels(models)` instead.
     * Extract all translation keys from source files using fs.findStream()
     * @param {string} srcPath - path to source directory (e.g. 'src/')
     * @returns {Promise<Set<string>>}
     */
    extractKeysFromCode(srcPath: string): Promise<Set<string>>;
    /**
     * @deprecated Use `auditModels(models)` instead.
     * Audit translations by comparing keys in code with those in DB
     * @param {string} [srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
     * @returns {Promise<Map<string, {missing: string[], unused: string[]}>>}
     */
    auditTranslations(srcPath?: string): Promise<Map<string, {
        missing: string[];
        unused: string[];
    }>>;
    /**
     * @deprecated Use `syncModels(targetUri, opts)` instead.
     * Sync translations for all locales by adding new keys from code as empty string values
     * @param {string} [targetUri] - target path for saving t.json (e.g. 'apps/topup-tel')
     * @param {Object} [opts] { useKeyAsDefault, srcPath }
     * @param {string} [opts.srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
     * @param {Set<string>} [opts.codeKeys] - translation keys
     * @param {string} [opts.useKeyAsDefault]
     * @returns {Promise<{ codeKeys: string[] }>}
     */
    syncTranslations(targetUri?: string, opts?: {
        srcPath?: string | undefined;
        codeKeys?: Set<string> | undefined;
        useKeyAsDefault?: string | undefined;
    }): Promise<{
        codeKeys: string[];
    }>;
    /**
     * @deprecated Use `syncModels('', opts)` instead.
     * Sync translations for all locales at the root level.
     *
     * @param {Object} [opts] Options for syncTranslations.
     * @returns {Promise<{ codeKeys: string[] }>}
     */
    syncTranslationsAll(opts?: any): Promise<{
        codeKeys: string[];
    }>;
}
export type TFunction = import("@nan0web/types").TFunction;
