/**
 * A range of numbers `from` (inclusive) `to` (inclusive).
 */
export type NumberRange = [from: number, to: number];

/**
 * The version of the file format.
 */
export const enum FileVersion {
    /**
     * The first version, here we go!
     */
    V_1 = '1.0',

    /**
     * This version added support for multiple files
     * and titles.
     */
    V_2 = '2.0',
}
