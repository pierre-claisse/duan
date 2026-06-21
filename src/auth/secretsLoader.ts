// Fetches the encrypted secrets bundle shipped with the app and tries to unlock
// it with the professor's password. The bundle is generated at build time by
// scripts/build-secrets.mjs and is absent during plain local dev (the public
// Home/Blog pages work without it; only sign-in needs it).
import { tryUnlock, type SecretsFile, type Secrets } from "../crypto";

const SECRETS_PATH = "secrets.json";

let filePromise: Promise<SecretsFile> | null = null;

async function fetchSecretsFile(): Promise<SecretsFile> {
  if (filePromise) return filePromise;
  filePromise = (async () => {
    // `import.meta.env.BASE_URL` is inlined by Vite with the configured base
    // (e.g. "/duan/"). Keep it written literally so the substitution works.
    const url = `${import.meta.env.BASE_URL}${SECRETS_PATH}`;
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      filePromise = null; // allow a retry after a transient failure
      throw new Error(
        `Impossible de charger ${SECRETS_PATH} (HTTP ${resp.status}). ` +
          `Le bundle de secrets n'a peut-être pas été généré.`,
      );
    }
    return (await resp.json()) as SecretsFile;
  })();
  return filePromise;
}

/** Returns the decrypted secrets, or null when the password is wrong. */
export async function unlock(password: string): Promise<Secrets | null> {
  const file = await fetchSecretsFile();
  return tryUnlock(password, file);
}
