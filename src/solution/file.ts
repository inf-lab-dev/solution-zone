import { decrypt, encrypt } from './encryption';

/**
 * A solution that has been encrypted.
 */
export interface EncryptedSolution {
    /**
     * The version of the file.
     */
    version: EncryptionVersion;

    /**
     * The unencrypted programming language of this solution.
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

/**
 * A solution that has been successfully decrypted.
 */
export interface DecryptedSolution {
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

/**
 * A range of numbers `from` (inclusive) `to` (inclusive).
 */
export type NumberRange = [from: number, to: number];

/**
 * The version of the file format.
 */
export const enum EncryptionVersion {
    /**
     * The first version, here we go!
     */
    V_1 = '1.0',
}

/**
 * Encrypts the given `solution` with the specified `key`.
 * This process ensures, that the returned, {@link EncryptedSolution} will
 * always have the newest supported {@link EncryptionVersion}.
 *
 * @param key the symmetric key to use for encrypting
 * @param solution the previously decrypted solution that should be encrypted
 * @returns the encrypted solution
 */
export async function encryptFile(
    key: string,
    { language, code, annotations }: DecryptedSolution,
): Promise<EncryptedSolution> {
    const jsonAnnotations = JSON.stringify(annotations);

    return {
        version: EncryptionVersion.V_1,

        language,
        code: await encrypt(key, code),
        annotations: await encrypt(key, jsonAnnotations),
    };
}

/**
 * Decrypts the given `solution` with the specified `key`.
 * This process respects the {@link EncryptedSolution}s `version` property.
 *
 * @param key the symmetric key to use for decrypting
 * @param solution the solution to decrypt
 * @returns the decrypted solution
 * @throws {TypeError} if the given `solution` has an unknown {@link EncryptedSolution.version}
 */
export async function decryptFile(
    key: string,
    { version, language, code, annotations }: EncryptedSolution,
): Promise<DecryptedSolution> {
    // version 0 did not have an explicit version specifier (but works like v1)
    if (version === EncryptionVersion.V_1 || version === undefined) {
        const decryptedAnnotations = await decrypt(key, annotations);

        return {
            language,
            code: await decrypt(key, code),
            annotations: JSON.parse(decryptedAnnotations),
        };
    }

    throw new TypeError(
        `Coult not decrypt solution file with version unknown '${version}'.`,
    );
}
