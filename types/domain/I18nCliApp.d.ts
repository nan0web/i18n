/**
 * Main application model for i18n CLI toolkit.
 */
export class I18nCliApp extends Model {
    static UI: {
        title: string;
        description: string;
    };
    static command: {
        default: string;
        positional: boolean;
        options: string[];
    };
    static json: {
        default: boolean;
    };
    static data: {
        default: string;
    };
    static out: {
        default: string;
    };
    static domain: {
        default: string;
    };
    static vocab: {
        default: string;
    };
    static ui: {
        default: string;
    };
    static components: {
        default: string;
    };
    static shell: {
        default: string;
        positional: boolean;
    };
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    }, {
        status: string;
    }, unknown>;
}
import { Model } from '@nan0web/types';
