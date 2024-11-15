import { WorkerClass, WorkerOptions } from './monaco.js';

/**
 * Creates {@link WorkerOptions} using dynamically imported Vite modules.
 * As the `?worker` import-syntax is only supported for userland code, the imports have to be done manually.
 * To aid in importing, the {@link ViteWorkerUrl} enum can be used.
 *
 * @param editor the editor worker
 * @param css the css worker
 * @param html the html worker
 * @param json the json worker
 * @param typescript the typescript worker
 * @returns the imported workers, needed for the editor
 */
export async function createViteWorkerOptions(
    editor: Promise<unknown>,
    css: Promise<unknown>,
    html: Promise<unknown>,
    json: Promise<unknown>,
    typescript: Promise<unknown>,
): Promise<WorkerOptions> {
    const [editorWorker, cssWorker, jsonWorker, htmlWorker, tsWorker] =
        (await Promise.all([
            editor,
            css,
            json,
            html,
            typescript,
        ])) as WorkerClass[];

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
