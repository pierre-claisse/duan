// Single-password secret envelope.
//
// The bundle ships ONE encrypted blob in `public/secrets.json`:
//
//   blob = AES-GCM-encrypt({ pat }, Argon2id(password))
//
// The professor types her password in the LoginScreen; if it decrypts the
// blob she gets the GitHub PAT (read+write on the blog + agenda data repos).
// The plaintext PAT stays in memory only — never localStorage, never disk.
//
// Repo coordinates are NOT secret and live in src/config.ts; only the PAT is
// encrypted here.
import { base64ToBytes } from "./base64";
import { aesGcmDecrypt } from "./aesGcm";
import { deriveKey } from "./kdf";

export interface EncryptedBlob {
  salt: string; // base64, 16 bytes
  nonce: string; // base64, 12 bytes
  ciphertext: string; // base64, opaque length
}

export interface SecretsFile {
  version: 1;
  blob: EncryptedBlob;
}

export interface Secrets {
  pat: string;
}

async function decrypt(
  password: string,
  blob: EncryptedBlob,
): Promise<Uint8Array | null> {
  const salt = base64ToBytes(blob.salt);
  const nonce = base64ToBytes(blob.nonce);
  const ct = base64ToBytes(blob.ciphertext);
  const key = await deriveKey(password, salt);
  return aesGcmDecrypt(key, nonce, ct);
}

/**
 * Try to unlock the secrets blob with `password`. Returns the decrypted
 * secrets on success, or `null` when the password is wrong (auth-tag
 * mismatch) or the payload is malformed.
 */
export async function tryUnlock(
  password: string,
  file: SecretsFile,
): Promise<Secrets | null> {
  const plain = await decrypt(password, file.blob);
  if (!plain) return null;
  try {
    const obj = JSON.parse(new TextDecoder().decode(plain)) as Secrets;
    if (typeof obj.pat !== "string" || obj.pat.length === 0) return null;
    return { pat: obj.pat };
  } catch {
    return null;
  }
}
