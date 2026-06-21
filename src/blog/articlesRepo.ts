// Blog persistence. Everything lives in the single PUBLIC blog repo:
//   articles/<slug>.json   — one file per post (full body)
//   articles/index.json    — lightweight manifest for the list view
//
// Anonymous visitors read via raw.githubusercontent; the professor (signed in)
// reads + writes via the authenticated Contents API.
import { BLOG } from "../config";
import { readPublicJson } from "../github/publicRead";
import { getFile, putFile, deleteFile, listDir, GithubError } from "../github/client";
import type { Article, ArticleMeta } from "../types";

const INDEX_PATH = "articles/index.json";
const articlePath = (slug: string) => `articles/${slug}.json`;

function toMeta(a: Article): ArticleMeta {
  return { slug: a.slug, title: a.title, date: a.date };
}

function sortByDateDesc(index: ArticleMeta[]): ArticleMeta[] {
  return [...index].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1,
  );
}

async function readIndex(pat: string): Promise<{ list: ArticleMeta[]; sha: string | null }> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH);
  if (!blob) return { list: [], sha: null };
  try {
    const list = JSON.parse(blob.content) as ArticleMeta[];
    return { list: Array.isArray(list) ? list : [], sha: blob.sha };
  } catch {
    return { list: [], sha: blob.sha };
  }
}

async function writeIndex(pat: string, list: ArticleMeta[], sha: string | null): Promise<void> {
  const content = JSON.stringify(list, null, 2);
  try {
    await putFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH, content, sha, "blog: mise à jour de l'index");
  } catch (e) {
    if (e instanceof GithubError && e.conflict) {
      const latest = await getFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH);
      await putFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH, content, latest?.sha ?? null, "blog: mise à jour de l'index");
      return;
    }
    throw e;
  }
}

// ── Anonymous (public) reads ───────────────────────────────────────────────

export async function loadIndexPublic(): Promise<ArticleMeta[]> {
  const idx = await readPublicJson<ArticleMeta[]>(BLOG.owner, BLOG.repo, INDEX_PATH);
  return Array.isArray(idx) ? sortByDateDesc(idx) : [];
}

export async function loadArticlePublic(slug: string): Promise<Article | null> {
  return readPublicJson<Article>(BLOG.owner, BLOG.repo, articlePath(slug));
}

// ── Authenticated (professor) reads + writes ───────────────────────────────

export async function loadIndexAuthed(pat: string): Promise<ArticleMeta[]> {
  return (await readIndex(pat)).list;
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

/** Write the post file, then refresh the index manifest. */
export async function saveArticle(pat: string, article: Article): Promise<void> {
  const existing = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(article.slug));
  await putFile(
    pat,
    BLOG.owner,
    BLOG.repo,
    articlePath(article.slug),
    JSON.stringify(article, null, 2),
    existing?.sha ?? null,
    `blog: enregistrement de « ${article.title} »`,
  );
  const { list, sha } = await readIndex(pat);
  const next = sortByDateDesc([...list.filter((m) => m.slug !== article.slug), toMeta(article)]);
  await writeIndex(pat, next, sha);
}

export async function deleteArticle(pat: string, slug: string): Promise<void> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(slug));
  if (blob) {
    await deleteFile(pat, BLOG.owner, BLOG.repo, articlePath(slug), blob.sha, `blog: suppression de ${slug}`);
  }
  const { list, sha } = await readIndex(pat);
  if (list.some((m) => m.slug === slug)) {
    await writeIndex(pat, list.filter((m) => m.slug !== slug), sha);
  }
}

/** Regenerate index.json from the actual post files (drift recovery). */
export async function rebuildIndex(pat: string): Promise<ArticleMeta[]> {
  const entries = await listDir(pat, BLOG.owner, BLOG.repo, "articles");
  const metas: ArticleMeta[] = [];
  for (const e of entries) {
    if (e.type !== "file" || !e.name.endsWith(".json") || e.name === "index.json") continue;
    const blob = await getFile(pat, BLOG.owner, BLOG.repo, e.path);
    if (!blob) continue;
    try {
      metas.push(toMeta(JSON.parse(blob.content) as Article));
    } catch {
      /* skip malformed file */
    }
  }
  const next = sortByDateDesc(metas);
  const { sha } = await readIndex(pat);
  await writeIndex(pat, next, sha);
  return next;
}
