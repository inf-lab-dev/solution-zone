const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Decodes the given `buffer` from utf8.
 *
 * @param buffer the buffer to decode
 * @returns the decoded utf8 string
 */
const decodeFromUtf8 = (buffer: AllowSharedBufferSource) =>
    decoder.decode(buffer);

/**
 * Encodes the given `data` to utf8.
 *
 * @param data the data to encode
 * @returns the encoded buffer
 */
const encodeToUtf8 = (data: string) => encoder.encode(data);

/**
 * Decodes the given `base64` back into a {@link Uint8Array}.
 * We can't use the built-in functions as they fail with large strings.
 *
 * @param base64 the base64 to decode
 * @returns the decoded buffer
 */
const decodeFromBase64 = (base64: string) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

/**
 * Encodes the given `buffer` to base64.
 * We can't use the built-in functions as they fail with large strings.
 *
 * @param buffer the buffer to encode
 * @returns the encoded buffer
 */
const encodeToBase64 = (buffer: Iterable<number>) =>
    btoa(
        new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
        ),
    );

/**
 * Imports the given `key` as {@link CryptoKey}.
 *
 * @param key the key to import
 * @returns the imported key
 */
async function importKey(key: string): Promise<CryptoKey> {
    const keyMaterial = encodeToUtf8(key);

    return crypto.subtle.importKey('raw', keyMaterial, 'PBKDF2', false, [
        'deriveKey',
    ]);
}

/**
 * Derives an encryption key from the given `passwordKey`.
 *
 * @param passwordKey the key to derive the encryption key from
 * @param salt the salt to use to harden against rainbow tables
 * @param usage the usage of this key, either for encryption or decryption
 * @returns the derived key
 */
async function deriveKey(
    passwordKey: CryptoKey,
    salt: Uint8Array,
    usage: KeyUsage,
): Promise<CryptoKey> {
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 250_000, hash: 'SHA-256' },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        [usage],
    );
}

/**
 * Encryptes the given `plainText` with the specified `password`.
 *
 * @param password the password to use for encryption
 * @param plainText the plaintext to encrypt
 * @returns the ciphertext
 */
export async function encrypt(
    password: string,
    plainText: string,
): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // random, 96-bit IV

    const passwordKey = await importKey(password);
    const key = await deriveKey(passwordKey, salt, 'encrypt');

    const cipherText = new Uint8Array(
        await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            key,
            encodeToUtf8(plainText),
        ),
    );

    const payload = new Uint8Array(
        salt.byteLength + iv.byteLength + cipherText.byteLength,
    );

    payload.set(salt, 0);
    payload.set(iv, salt.byteLength);
    payload.set(cipherText, salt.byteLength + iv.byteLength);

    return encodeToBase64(payload);
}

/**
 * Decrypts the given `payloadText` with the specified `password`.
 *
 * @param password the password to use for decryption
 * @param plainText the encrypted payload, seemingly the ciphertext
 * @returns the plaintext
 */
export async function decrypt(
    password: string,
    payloadText: string,
): Promise<string> {
    const payload = decodeFromBase64(payloadText);

    const salt = payload.slice(0, 16);
    const iv = payload.slice(16, 16 + 12);
    const cipherText = payload.slice(16 + 12);

    const passwordKey = await importKey(password);
    const key = await deriveKey(passwordKey, salt, 'decrypt');

    const plainText = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherText,
    );

    return decodeFromUtf8(plainText);
}
