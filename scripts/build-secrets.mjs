// Build-time encryption of the GitHub PAT. Reads env vars (set as GitHub
// Actions secrets), produces `public/secrets.json`, which Vite copies into the
// deployed `dist/`. The file is gitignored.
//
//   SYNC_PAT       fine-grained PAT with Contents read+write on the blog and
//                  agenda data repos
//   SYNC_PASSWORD  the professor's password; she types it to unlock editing
//
// Argon2id + AES-GCM parameters MUST match src/crypto/{kdf,aesGcm}.ts.
// Run locally for development with both vars in the environment; CI runs it via
// .github/workflows/deploy.yml.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { argon2idAsync } from "@noble/hashes/argon2.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(HERE, "..", "public", "secrets.json");

const ARGON2 = { t: 2, m: 19_456, p: 1, dkLen: 32 };
const SALT_BYTES = 16;
const NONCE_BYTES = 12;

function envOrFail(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

function randomBytes(n) {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function deriveKey(password, salt) {
  return new Uint8Array(await argon2idAsync(password, salt, ARGON2));
}

async function aesGcmEncrypt(rawKey, nonce, plain) {
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plain);
  return new Uint8Array(ct);
}

async function wrap(password, payload) {
  const salt = randomBytes(SALT_BYTES);
  const nonce = randomBytes(NONCE_BYTES);
  const key = await deriveKey(password, salt);
  const ct = await aesGcmEncrypt(key, nonce, payload);
  return {
    salt: bytesToBase64(salt),
    nonce: bytesToBase64(nonce),
    ciphertext: bytesToBase64(ct),
  };
}

async function main() {
  const pat = envOrFail("SYNC_PAT");
  const password = envOrFail("SYNC_PASSWORD");

  const blob = await wrap(
    password,
    new TextEncoder().encode(JSON.stringify({ pat })),
  );
  const out = { version: 1, blob };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${OUT_PATH} (${(JSON.stringify(out).length / 1024).toFixed(2)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
