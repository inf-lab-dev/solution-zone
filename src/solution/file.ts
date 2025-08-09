import { decrypt, encrypt } from './encryption.js';
import { DecryptedSolution } from './types/decrypted.js';
import { EncryptedSolution } from './types/encrypted.js';
import { FileVersion } from './types/index.js';

/**
 * Encrypts the given `solution` with the specified `key`.
 * This process ensures, that the returned, {@link FileVersion} will
 * always have the newest supported {@link FileVersion}.
 *
 * @param key the symmetric key to use for encrypting
 * @param solution the previously decrypted solution that should be encrypted
 * @returns the encrypted solution
 */
export async function encryptFile(
    key: string,
    { title, files }: DecryptedSolution,
): Promise<EncryptedSolution> {
    return {
        version: FileVersion.V_1,
        title,
        files: await Promise.all(
            files.map(async ({ name, language, code, annotations }) => {
                const jsonAnnotations = JSON.stringify(annotations);

                return {
                    name,
                    language,
                    code: await encrypt(key, code),
                    annotations: await encrypt(key, jsonAnnotations),
                };
            }),
        ),
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
    encryptedSolution: EncryptedSolution,
): Promise<DecryptedSolution> {
    // version 0 did not have an explicit version specifier (but works like v1)
    if (
        encryptedSolution.version === FileVersion.V_1 ||
        encryptedSolution.version === undefined
    ) {
        // V1 Compat mode
        const v1Solution = encryptedSolution as unknown as {
            language: string;
            annotations: string;
            code: string;
        };

        const decryptedAnnotations = await decrypt(key, v1Solution.annotations);

        return {
            title: 'Untitled',

            files: [
                {
                    name: 'unnamed',

                    language: v1Solution.language,
                    code: await decrypt(key, v1Solution.code),
                    annotations: JSON.parse(decryptedAnnotations),
                },
            ],
        };
    } else if (encryptedSolution.version === FileVersion.V_2) {
        return {
            ...encryptedSolution,

            files: await Promise.all(
                encryptedSolution.files.map(
                    async ({ name, language, code, annotations }) => {
                        const decryptedAnnotations = await decrypt(
                            key,
                            annotations,
                        );

                        return {
                            name,
                            language,
                            code: await decrypt(key, code),
                            annotations: JSON.parse(decryptedAnnotations),
                        };
                    },
                ),
            ),
        };
    }

    throw new TypeError(
        `Coult not decrypt solution file with version unknown '${encryptedSolution.version}'.`,
    );
}
