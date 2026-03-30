import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

// Key must be 32 bytes for AES-256, provided as a 64-char hex string.
const DEV_KEY = 'a'.repeat(64); // 32-byte fallback for development only — never use in production

const getKey = (): Buffer => {
	const hexKey = process.env.ENCRYPTION_KEY ?? DEV_KEY;
	return Buffer.from(hexKey, 'hex');
};

/**
 * Encrypts a plain-text string using AES-256-GCM.
 * Returns a colon-delimited string: `iv:authTag:ciphertext` (all hex-encoded).
 */
export const encrypt = (text: string): string => {
	const key = getKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();

	return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
};

/**
 * Decrypts a string produced by `encrypt`.
 * Expects `iv:authTag:ciphertext` format (all hex-encoded).
 */
export const decrypt = (encryptedText: string): string => {
	const parts = encryptedText.split(':');
	if (parts.length !== 3) {
		throw new Error('Invalid encrypted text format. Expected iv:authTag:ciphertext');
	}

	const [ivHex, authTagHex, ciphertextHex] = parts;
	const key = getKey();
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const ciphertext = Buffer.from(ciphertextHex, 'hex');

	const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
	return decrypted.toString('utf8');
};
