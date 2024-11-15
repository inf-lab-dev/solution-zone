import type * as monaco from 'monaco-editor';

/**
 * The options to use when creating a new editor.
 */
export interface Options {
    /**
     * The options for monacos workers.
     */
    worker: WorkerOptions;

    /**
     * The element to bind the editor to.
     */
    element: HTMLElement;

    /**
     * The actual options to pass to {@link monaco.editor.create}.
     */
    options: monaco.editor.IStandaloneEditorConstructionOptions;
}

/**
 * The options for workers.
 */
export interface WorkerOptions {
    /**
     * The main editor worker.
     */
    editor: WorkerClass;

    /**
     * Any worker for an abitiary language, if none is present the {@link editor} will be used.
     */
    [label: string]: WorkerClass;
}

/**
 * Any class that can be instantiated to be a {@link Worker}.
 */
export interface WorkerClass {
    /**
     * Instantiates the worker.
     */
    new (): Worker;
}

/**
 * The editor that has been created which consists of the library and the actual editor.
 */
export type Editor = [typeof monaco, monaco.editor.IStandaloneCodeEditor];

/**
 * Initializes the {@link self.MonacoEnvironment} with the necessary `getWorker` function that instantiates the
 * correct worker according to the options.
 *
 * @param options the worker options
 */
function initializeEnvironment(options: WorkerOptions) {
    self.MonacoEnvironment = {
        getWorker(_: unknown, label: string) {
            if (label in options) {
                return new options[label]();
            }

            return new options.editor();
        },
    };
}

/**
 * Creates a new monaco editor and imports the editor itself.
 * This can be helpful, as monaco editor is _not SSR compatible_.
 *
 * @param options the options to use when creating the editor
 * @returns the created editor and the monaco library that has been loaded
 */
export async function createEditor({
    worker,
    element,
    options,
}: Options): Promise<Editor> {
    const monaco = await import('monaco-editor');

    initializeEnvironment(worker);

    const editor = monaco.editor.create(element, options);

    return [monaco, editor];
}

/**
 * Creates {@link WorkerOptions} using Vite's special `?worker` import functionality.
 * Therefore, you should only call this function if your are actually bundeling with Vite.
 *
 * @returns the imported workers, needed for the editor
 */
export async function createViteWorkerOptions(): Promise<WorkerOptions> {
    const editorWorker = await import(
        // @ts-expect-error this only works in vite environment
        'monaco-editor/esm/vs/editor/editor.worker?worker'
    );
    const cssWorker = await import(
        // @ts-expect-error this only works in vite environment
        'monaco-editor/esm/vs/language/css/css.worker?worker'
    );
    const htmlWorker = await import(
        // @ts-expect-error this only works in vite environment
        'monaco-editor/esm/vs/language/html/html.worker?worker'
    );
    const jsonWorker = await import(
        // @ts-expect-error this only works in vite environment
        'monaco-editor/esm/vs/language/json/json.worker?worker'
    );
    const tsWorker = await import(
        // @ts-expect-error this only works in vite environment
        'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
    );

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
