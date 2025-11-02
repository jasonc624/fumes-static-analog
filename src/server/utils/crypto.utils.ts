import { compare, genSalt, hash } from "bcrypt";
import { createDecipheriv, randomBytes, createCipheriv } from "crypto";
import { getSecret } from './secret-manager.utils';

// Nodejs encryption with CTR
const algorithm = "aes-256-ctr";
const inputEncoding = "utf8";
const outputEncoding = "hex";

// Cache for cipher key to avoid repeated Secret Manager calls
let cachedCipherKey: string | null = null;

/**
 * Get cipher key from Secret Manager or environment variable
 * Uses caching to avoid repeated calls to Secret Manager
 */
async function getCipherKey(): Promise<string> {
  if (cachedCipherKey) {
    return cachedCipherKey;
  }

  try {
    // First try environment variable for local development
    if (process.env['CIPHER_CRYPTO_KEY']) {
      console.log('Using CIPHER_CRYPTO_KEY from environment variable');
      cachedCipherKey = process.env['CIPHER_CRYPTO_KEY'];
      return cachedCipherKey;
    }

    // Fall back to Secret Manager
    console.log('Attempting to retrieve CIPHER_CRYPTO_KEY from Secret Manager...');
    cachedCipherKey = await getSecret('CIPHER_CRYPTO_KEY', "1");
    console.log('Successfully retrieved CIPHER_CRYPTO_KEY from Secret Manager');
    return cachedCipherKey;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful troubleshooting information
    let troubleshootingTips = '\n\nTroubleshooting:\n';
    
    if (errorMessage.includes('PERMISSION_DENIED')) {
      troubleshootingTips += '1. Your Firebase service account needs Secret Manager permissions\n';
      troubleshootingTips += '2. Run: ./fix-secret-manager-permissions.sh (after setting your service account email)\n';
      troubleshootingTips += '3. Or add CIPHER_CRYPTO_KEY to your .env file as a temporary workaround\n';
    } else if (errorMessage.includes('NOT_FOUND')) {
      troubleshootingTips += '1. The secret CIPHER_CRYPTO_KEY may not exist in Google Secret Manager\n';
      troubleshootingTips += '2. Create it in Google Cloud Console > Secret Manager\n';
      troubleshootingTips += '3. Or add CIPHER_CRYPTO_KEY to your .env file\n';
    } else {
      troubleshootingTips += '1. Check that GOOGLE_CLOUD_PROJECT_ID=837415164337 is set in your .env\n';
      troubleshootingTips += '2. Verify your Firebase service account credentials are correct\n';
      troubleshootingTips += '3. As a fallback, add CIPHER_CRYPTO_KEY to your .env file\n';
    }
    
    throw new Error(`Failed to retrieve CIPHER_CRYPTO_KEY: ${errorMessage}${troubleshootingTips}`);
  }
}

/**
 * Encrypt a string using AES-256-CTR
 * @param str - The string to encrypt
 * @returns Promise<string> - The encrypted string in format "iv:encryptedText"
 */
export async function encryptString(str: string): Promise<string> {
  const CIPHER_KEY = await getCipherKey();
  const iv = Buffer.from(randomBytes(16));
  const cipher = createCipheriv(algorithm, CIPHER_KEY, iv);
  let crypted = cipher.update(str, inputEncoding, outputEncoding);
  crypted += cipher.final("hex");
  return `${iv.toString("hex")}:${crypted.toString()}`;
}

/**
 * Decrypt a string using AES-256-CTR
 * @param value - The encrypted string in format "iv:encryptedText"
 * @returns Promise<string> - The decrypted string
 */
export async function decryptString(value: string): Promise<string> {
  const CIPHER_KEY = await getCipherKey();
  const textParts = value.split(":");
  // Extract the IV from the first half of the value
  const IV = Buffer.from(textParts.shift()!, outputEncoding);
  // Extract the encrypted text without the IV
  const encryptedText = Buffer.from(textParts.join(":"), outputEncoding);
  // Decipher the string
  const decipher = createDecipheriv(algorithm, CIPHER_KEY, IV);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString(inputEncoding);
}

/**
 * Decrypt a base64 encoded string
 * @param value - The base64 encoded encrypted string
 * @returns Promise<string> - The decrypted string
 */
export async function decryptStringBase64(value: string): Promise<string> {
  const decodedValue = Buffer.from(value, 'base64').toString('utf-8');
  return await decryptString(decodedValue);
}

/**
 * Check if a string is AES encrypted (weak check based on format)
 * @param encryptedString - The string to check
 * @returns Promise<boolean> - True if the string appears to be AES encrypted
 */
export async function isAesEncryptedString(encryptedString: string): Promise<boolean> {
  try {
    // Weak way to check but oh well.
    if (encryptedString.includes(":")) {
      const aes = encryptedString.split(":");
      return aes[0].length % 16 === 0;
    } else {
      return false;
    }
  } catch (error) {
    // An error occurred during decryption, indicating that the string was not AES encrypted
    return false;
  }
}

/**
 * Generate a hash for a password using bcrypt
 * @param password - The password to hash
 * @param saltRounds - The number of salt rounds (default: 10)
 * @returns Promise<string> - The hashed password
 */
export async function getHash(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  const salt = await genSalt(saltRounds);
  return hash(password, salt);
}

/**
 * Compare a password with a hash using bcrypt
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if the password matches the hash
 */
export async function compareHash(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}