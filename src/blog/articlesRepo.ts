// Blog persistence. Everything lives in the single PUBLIC blog repo:
//   articles/<slug>.json   — one file per post (full body); the SOURCE OF TRUTH
//   articles/index.json    — a derived manifest, for a fast list view
//
// Robustness model: index.json is just a cache derived from the article files.
//   • Writes keep it in sync incrementally (conflict-safe, with retries).
//   • The professor's list view cross-checks it against the actual files and
//     silently rebuilds + heals it whenever they disagree (half-failed save,
//     out-of-band edit on GitHub, corrupt index…). So no manual "rebuild" is
//     ever needed, and the list can't go stale.
//
// Anonymous visitors read via raw.githubusercontent; the professor (signed in)
// reads + writes via the authenticated Contents API.
import { BLOG } from "../config";
import { readPublicJson } from "../github/publicRead";
import { getFile, putFile, deleteFile, listDir, GithubError } from "../github/client";
import type { Article, ArticleMeta } from "../types";

const INDEX_PATH = "articles/index.json";
const ARTICLES_DIR = "articles";
const articlePath = (slug: string) => `${ARTICLES_DIR}/${slug}.json`;
const MAX_RETRIES = 3;

function toMeta(a: Article): ArticleMeta {
  return { slug: a.slug, title: a.title, date: a.date };
}

function sortByDateDesc(index: ArticleMeta[]): ArticleMeta[] {
  return [...index].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1,
  );
}

/** Read the manifest. A missing or corrupt index yields [] (it will be rebuilt
 *  from the files), never an error. */
async function readIndex(pat: string): Promise<ArticleMeta[]> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH);
  if (!blob) return [];
  try {
    const list = JSON.parse(blob.content) as ArticleMeta[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** PUT a path, re-reading the latest SHA each attempt and retrying on a
 *  concurrent-write conflict (409/422). */
async function putWithRetry(
  pat: string,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const current = await getFile(pat, BLOG.owner, BLOG.repo, path);
    try {
      await putFile(pat, BLOG.owner, BLOG.repo, path, content, current?.sha ?? null, message);
      return;
    } catch (e) {
      lastErr = e;
      if (e instanceof GithubError && e.conflict) continue;
      throw e;
    }
  }
  throw lastErr;
}

const writeIndex = (pat: string, list: ArticleMeta[]) =>
  putWithRetry(pat, INDEX_PATH, JSON.stringify(list, null, 2), "blog: mise à jour de l'index");

/** Slugs that actually exist as files (the source of truth). */
async function listSlugs(pat: string): Promise<string[]> {
  const entries = await listDir(pat, BLOG.owner, BLOG.repo, ARTICLES_DIR);
  return entries
    .filter((e) => e.type === "file" && e.name.endsWith(".json") && e.name !== "index.json")
    .map((e) => e.name.replace(/\.json$/, ""));
}

/** Rebuild the manifest by reading every article file (self-heal path). */
async function deriveIndex(pat: string): Promise<ArticleMeta[]> {
  const slugs = await listSlugs(pat);
  const metas = await Promise.all(
    slugs.map(async (slug) => {
      const blob = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(slug));
      if (!blob) return null;
      try {
        return toMeta(JSON.parse(blob.content) as Article);
      } catch {
        return null;
      }
    }),
  );
  return sortByDateDesc(metas.filter((m): m is ArticleMeta => m !== null));
}

// ── Anonymous (public) reads ───────────────────────────────────────────────

export async function loadIndexPublic(): Promise<ArticleMeta[]> {
  const idx = await readPublicJson<ArticleMeta[]>(BLOG.owner, BLOG.repo, INDEX_PATH);
  return Array.isArray(idx) ? sortByDateDesc(idx) : [];
}

export async function loadArticlePublic(slug: string): Promise<Article | null> {
  return readPublicJson<Article>(BLOG.owner, BLOG.repo, articlePath(slug));
}

// ── Authenticated (professor) reads ────────────────────────────────────────

/** Reads the manifest, cross-checks it against the actual files, and silently
 *  rebuilds + heals index.json when they disagree — so the list is always the
 *  truth, with no manual rebuild. */
export async function loadIndexAuthed(pat: string): Promise<ArticleMeta[]> {
  const [list, slugs] = await Promise.all([readIndex(pat), listSlugs(pat)]);
  const indexSlugs = new Set(list.map((m) => m.slug));
  const inSync = indexSlugs.size === slugs.length && slugs.every((s) => indexSlugs.has(s));
  if (inSync) return sortByDateDesc(list);

  const derived = await deriveIndex(pat);
  try {
    await writeIndex(pat, derived); // heal the manifest for anonymous visitors too
  } catch {
    /* still show the truth even if the heal write fails; it retries next time */
  }
  return derived;
}

export async function loadArticleAuthed(pat: string, slug: string): Promise<Article | null> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(slug));
  if (!blob) return null;
  try {
    return JSON.parse(blob.content) as Article;
  } catch {
    return null;
  }
}

// ── Authenticated (professor) writes ───────────────────────────────────────

export async function saveArticle(pat: string, article: Article): Promise<void> {
  await putWithRetry(
    pat,
    articlePath(article.slug),
    JSON.stringify(article, null, 2),
    `blog: enregistrement de « ${article.title} »`,
  );
  const list = await readIndex(pat);
  const next = sortByDateDesc([...list.filter((m) => m.slug !== article.slug), toMeta(article)]);
  await writeIndex(pat, next);
}

export async function deleteArticle(pat: string, slug: string): Promise<void> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(slug));
  if (blob) {
    await deleteFile(pat, BLOG.owner, BLOG.repo, articlePath(slug), blob.sha, `blog: suppression de ${slug}`);
  }
  const list = await readIndex(pat);
  if (list.some((m) => m.slug === slug)) {
    await writeIndex(pat, list.filter((m) => m.slug !== slug));
  }
}
