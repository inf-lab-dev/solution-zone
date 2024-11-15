import { WorkerClass, WorkerOptions } from './monaco';

/**
 * Workers that are imported via Vite.
 */
export interface ViteWorkers {
    /**
     * The editor worker class.
     */
    editor: Promise<WorkerClass>;

    /**
     * The css worker class.
     */
    css: Promise<WorkerClass>;

    /**
     * The html worker class.
     */
    html: Promise<WorkerClass>;

    /**
     * The json worker class.
     */
    json: Promise<WorkerClass>;

    /**
     * The typescript worker class.
     */
    typescript: Promise<WorkerClass>;
}

/**
 * The url to a Vite-based-Worker.
 */
export const enum ViteWorkerUrl {
    /**
     * The editor worker.
     */
    EDITOR = 'monaco-editor/esm/vs/editor/editor.worker?worker',

    /**
     * The css worker.
     */
    CSS = 'monaco-editor/esm/vs/language/css/css.worker?worker',

    /**
     * The html worker.
     */
    HTML = 'monaco-editor/esm/vs/language/html/html.worker?worker',

    /**
     * The json worker.
     */
    JSON = 'monaco-editor/esm/vs/language/json/json.worker?worker',

    /**
     * The typescript worker.
     */
    TYPESCRIPT = 'monaco-editor/esm/vs/language/typescript/ts.worker?worker',
}

/**
 * Creates {@link WorkerOptions} using dynamically imported Vite modules.
 * As the `?worker` import-syntax is only supported for userland code, the imports have to be done manually.
 * To aid in importing, the {@link ViteWorkerUrl} enum can be used.
 *
 * @param workers the imported workers
 * @returns the imported workers, needed for the editor
 */
export async function createViteWorkerOptions({
    editor,
    css,
    html,
    json,
    typescript,
}: ViteWorkers): Promise<WorkerOptions> {
    const [editorWorker, cssWorker, jsonWorker, htmlWorker, tsWorker] =
        await Promise.all([editor, css, json, html, typescript]);

    return {
        editor: editorWorker,

        // Json
        json: jsonWorker,

        // Stylesheets
        css: cssWorker,
        scss: cssWorker,
        less: cssWorker,

        // HTML
        html: htmlWorker,
        handlebars: htmlWorker,
        razor: htmlWorker,

        // JavaScript
        typescript: tsWorker,
        javascript: tsWorker,
    };
}
