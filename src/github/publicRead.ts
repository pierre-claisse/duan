// Anonymous reads of the PUBLIC blog repo via raw.githubusercontent.com.
// No token, no rate limit (CDN-served, cached ~5 min). Used for visitor-facing
// blog pages. A freshly written file may 404 here for a short while until the
// CDN catches up — acceptable for a blog.
import { BRANCH } from "../config";

export async function readPublicText(
  owner: string,
  repo: string,
  path: string,
  branch: string = BRANCH,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const resp = await fetch(url, { cache: "no-store" });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`Lecture publique ${path} : HTTP ${resp.status}`);
  return resp.text();
}

export async function readPublicJson<T>(
  owner: string,
  repo: string,
  path: string,
): Promise<T | null> {
  const text = await readPublicText(owner, repo, path);
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
