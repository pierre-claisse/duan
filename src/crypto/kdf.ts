// Argon2id key derivation. Parameters must match scripts/build-secrets.mjs:
//   - algorithm: Argon2id
//   - m_cost   : 19_456 KiB
//   - t_cost   : 2
//   - parallel : 1
//   - dkLen    : 32 (output key for AES-256-GCM)
//
// `@noble/hashes/argon2` is a pure-JS implementation: slower than WASM
// (~200ms) but runs once per login and works the same under Node and browser.
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { KEY_BYTES } from "./aesGcm";

const ARGON2_M_KIB = 19_456;
const ARGON2_T_COST = 2;
const ARGON2_P_COST = 1;
export const SALT_BYTES = 16;

export async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  if (salt.length !== SALT_BYTES) {
    throw new Error(`Argon2 salt must be ${SALT_BYTES} bytes, got ${salt.length}`);
  }
  const out = await argon2idAsync(password, salt, {
    t: ARGON2_T_COST,
    m: ARGON2_M_KIB,
    p: ARGON2_P_COST,
    dkLen: KEY_BYTES,
  });
  return new Uint8Array(out);
}
