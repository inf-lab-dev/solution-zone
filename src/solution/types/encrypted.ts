import type { FileVersion } from './index.js';

/**
 * A solution that has been encrypted.
 */
export interface EncryptedSolution {
    /**
     * The version of the file.
     */
    version: FileVersion;

    /**
     * The title of this solution.
     */
    title: string;

    /**
     * The files belonging to this solution.
     */
    files: EncryptedSolutionFile[];
}

/**
 * A single file inside a solution that is still encrypted.
 */
export interface EncryptedSolutionFile {
    /**
     * The unencrypted name of this file.
     */
    name: string;

    /**
     * The unencrypted programming language of this file.
     */
    language: string;

    /**
     * The encrypted code of this solution.
     */
    code: string;

    /**
     * The encrypted JSON-Array of annotations of this solution.
     */
    annotations: string;
}
