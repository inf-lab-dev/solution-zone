import type { NumberRange } from './index.js';

/**
 * A solution that has been successfully decrypted.
 */
export interface DecryptedSolution {
    /**
     * The title of this solution.
     */
    title: string;

    /**
     * The files belonging to this solution.
     */
    files: DecryptedSolutionFile[];
}

/**
 * A single file inside a solution that is still encrypted.
 */
export interface DecryptedSolutionFile {
    /**
     * The name of this file.
     */
    name: string;

    /**
     * The programming language of this solution.
     */
    language: string;

    /**
     * The code of this solution.
     */
    code: string;

    /**
     * The annotations of this solution.
     */
    annotations: DecryptedAnnotation[];
}

/**
 * An annotation that has been successfully decrypted.
 */
export interface DecryptedAnnotation {
    /**
     * The comment that is associated with the annotation.
     * Should be treated as plain-text, although it should be properly escaped.
     */
    comment: string;

    /**
     * The lines of this annotation.
     */
    line: NumberRange;

    /**
     * The columns of this annotation.
     */
    column: NumberRange;
}
