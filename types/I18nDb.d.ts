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
     * @param {string} [input.tPath="_/t"] - path suffix to look for translation files
     * @param {string} [input.langsPath="_/langs"] - path of the languages config that stores Record<locale: string, any>
     * @param {import("@nan0web/event/types/types/index.js").EventBus} [input.emitter]
     * @param {string} [input.dataDir="data"]
     * @param {string} [input.srcDir="src"]
     * @param {string} [input.useKeyAsDefault=false]
     * @param {Record<string, Record<string, string>>} [input.langs={}]
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
        langs?: Record<string, Record<string, string>> | undefined;
    });
    db: import("@nan0web/db/types/DB.js").default;
    locale: string;
    tPath: string;
    langsPath: string;
    dataDir: string;
    srcDir: string;
    langs: Record<string, Record<string, string>>;
    useKeyAsDefault: boolean;
    _cache: Map<any, any>;
    _tFunctions: Map<any, any>;
    emitter: import("@nan0web/event/types/types/index.js").EventBus;
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
     * @returns {Promise<function>}
     */
    createT(locale: string, uri?: string): Promise<Function>;
    /**
     * Change current locale and emit 'i18nchange'
     * @param {string} locale
     * @param {string} [atUri="/"] base path for reloading
     * @returns {Promise<void>}
     */
    setLocale(locale: string, atUri?: string | undefined): Promise<void>;
    /**
     * Shortcut: switchTo('uk', 'apps/topup-tel')
     * Equivalent to setLocale + createT
     * @param {string} locale
     * @param {string} uri
     * @returns {Promise<function>}
     */
    switchTo(locale: string, uri?: string): Promise<Function>;
    /**
     * Extract all translation keys from source files using fs.findStream()
     * @param {string} srcPath - path to source directory (e.g. 'src/')
     * @returns {Promise<Set<string>>}
     */
    extractKeysFromCode(srcPath: string): Promise<Set<string>>;
    /**
     * Audit translations by comparing keys in code with those in DB
     * @param {string} [srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
     * @returns {Promise<Map<string, {missing: string[], unused: string[]}>>}
     */
    auditTranslations(srcPath?: string | undefined): Promise<Map<string, {
        missing: string[];
        unused: string[];
    }>>;
    /**
     * Sync translations for all locales by adding new keys from code as empty string values
     * @param {string} [targetUri] - target path for saving t.json (e.g. 'apps/topup-tel')
     * @param {Object} [opts] { useKeyAsDefault, srcPath }
     * @param {string} [opts.srcPath] - path to source directory (e.g. 'src/'), defaults to this.srcDir
     * @param {Set<string>} [opts.codeKeys] - translation keys
     * @param {string} [opts.useKeyAsDefault]
     * @returns {Promise<Record<string,string>>}
     */
    syncTranslations(targetUri?: string | undefined, opts?: {
        srcPath?: string | undefined;
        codeKeys?: Set<string> | undefined;
        useKeyAsDefault?: string | undefined;
    } | undefined): Promise<Record<string, string>>;
}
