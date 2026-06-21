// Authenticated CRUD against the GitHub Contents API. Used for the private
// calendar (read+write) and for writing/reading blog articles when the professor
// is signed in. Anonymous public blog reads go through src/github/publicRead.ts.
//
// Every PUT/DELETE carries the blob SHA we last saw (GitHub's optimistic-
// concurrency token). With a single editor a stale SHA is rare; callers re-read
// and retry once on a 409/422.
//
// `cache: "no-store"` on GETs is mandatory: the Contents API ships
// `Cache-Control: private, max-age=60`, which would otherwise let the browser
// serve a pre-write snapshot for up to a minute.

const GITHUB_API = "https://api.github.com";

export class GithubError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly conflict: boolean = false,
  ) {
    super(message);
    this.name = "GithubError";
  }
}

function authHeaders(pat: string): HeadersInit {
  return {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function decodeBase64Utf8(b64: string): string {
  const stripped = b64.replace(/\s/g, "");
  const bin = atob(stripped);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeUtf8Base64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export interface FileBlob {
  content: string; // decoded UTF-8
  sha: string;
}

interface ContentsApiFile {
  content?: string;
  sha?: string;
}

/** GET a file. Returns null on 404 (legitimate "not created yet"). */
export async function getFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
): Promise<FileBlob | null> {
  let resp: Response;
  try {
    resp = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      method: "GET",
      headers: authHeaders(pat),
      cache: "no-store",
    });
  } catch (e) {
    throw new GithubError((e as Error).message);
  }
  if (resp.status === 404) return null;
  if (resp.status === 401 || resp.status === 403)
    throw new GithubError("GitHub a refusé le jeton (PAT).", resp.status);
  if (!resp.ok)
    throw new GithubError((await resp.text().catch(() => resp.statusText)) || resp.statusText, resp.status);

  const body = (await resp.json()) as ContentsApiFile;
  if (typeof body.content !== "string" || typeof body.sha !== "string")
    throw new GithubError("Réponse Contents API incomplète (content/sha).");
  return { content: decodeBase64Utf8(body.content), sha: body.sha };
}

/** Create or update a file. Pass `sha` for updates; null for first creation. */
export async function putFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string | null,
  commitMessage: string,
): Promise<{ sha: string }> {
  const body: Record<string, string> = {
    message: commitMessage,
    content: encodeUtf8Base64(content),
  };
  if (sha) body.sha = sha;

  let resp: Response;
  try {
    resp = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: { ...authHeaders(pat), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new GithubError((e as Error).message);
  }
  if (resp.status === 401 || resp.status === 403)
    throw new GithubError("GitHub a refusé l'écriture (PAT).", resp.status);
  if (resp.status === 409 || resp.status === 422)
    throw new GithubError(`Conflit d'écriture sur ${path}.`, resp.status, true);
  if (!resp.ok)
    throw new GithubError((await resp.text().catch(() => resp.statusText)) || resp.statusText, resp.status);

  const respBody = (await resp.json()) as { content?: { sha?: string } };
  const newSha = respBody.content?.sha;
  if (typeof newSha !== "string")
    throw new GithubError("Réponse PUT sans content.sha.");
  return { sha: newSha };
}

/** Delete a file. `sha` required by GitHub. 404 is treated as success. */
export async function deleteFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  commitMessage: string,
): Promise<void> {
  let resp: Response;
  try {
    resp = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      headers: { ...authHeaders(pat), "Content-Type": "application/json" },
      body: JSON.stringify({ message: commitMessage, sha }),
    });
  } catch (e) {
    throw new GithubError((e as Error).message);
  }
  if (resp.status === 404) return;
  if (resp.status === 401 || resp.status === 403)
    throw new GithubError("GitHub a refusé la suppression (PAT).", resp.status);
  if (resp.status === 409 || resp.status === 422)
    throw new GithubError(`Conflit de suppression sur ${path}.`, resp.status, true);
  if (!resp.ok)
    throw new GithubError((await resp.text().catch(() => resp.statusText)) || resp.statusText, resp.status);
}

export interface DirEntry {
  name: string;
  path: string;
  sha: string;
  type: string;
}

/** List a directory's entries. Returns [] on 404 (directory absent). */
export async function listDir(
  pat: string,
  owner: string,
  repo: string,
  dir: string,
): Promise<DirEntry[]> {
  let resp: Response;
  try {
    resp = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${dir}`, {
      method: "GET",
      headers: authHeaders(pat),
      cache: "no-store",
    });
  } catch (e) {
    throw new GithubError((e as Error).message);
  }
  if (resp.status === 404) return [];
  if (!resp.ok)
    throw new GithubError((await resp.text().catch(() => resp.statusText)) || resp.statusText, resp.status);
  const body = (await resp.json()) as DirEntry[];
  return Array.isArray(body) ? body : [];
}
