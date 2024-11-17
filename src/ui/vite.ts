import { WorkerOptions } from './monaco.js';

/**
 * A module that houses a worker.
 */
export interface WorkerModule {
    /**
     * The default export, the worker url.
     */
    default: string;
}

/**
 * Creates {@link WorkerOptions} using dynamically imported Vite modules.
 * As the `?worker&url` import-syntax is only supported for userland code, the imports have to be done manually.
 *
 * The `typescript` worker parameter is optional, as in various Nuxt and Vite environments the typescript worker cannot be loaded
 * reliably due to a Vite/Rollup bug. Thus it is just skipped then.
 *
 * @param editor the editor worker
 * @param css the css worker
 * @param html the html worker
 * @param json the json worker
 * @param typescript the typescript worker if one should be loaded
 * @returns the imported workers, needed for the editor
 */
export async function createViteWorkerOptions(
    editor: Promise<WorkerModule>,
    css: Promise<WorkerModule>,
    html: Promise<WorkerModule>,
    json: Promise<WorkerModule>,
    typescript?: Promise<WorkerModule>,
): Promise<WorkerOptions> {
    const [
        { default: editorWorker },
        { default: cssWorker },
        { default: jsonWorker },
        { default: htmlWorker },
        { default: tsWorker },
    ] = await Promise.all([
        editor,
        css,
        json,
        html,
        typescript ?? Promise.resolve({ default: null }),
    ]);

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
        ...(tsWorker
            ? {
                  typescript: tsWorker,
                  javascript: tsWorker,
              }
            : {}),
    };
}
