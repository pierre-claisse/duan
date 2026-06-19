// Blog persistence. Layout in the PUBLIC blog repo:
//   articles/<slug>.json   — one file per article (full body)
//   articles/index.json    — lightweight manifest for the list view
//
// Anonymous visitors read via raw.githubusercontent (loadIndexPublic /
// loadArticlePublic). The professor, signed in, reads + writes via the
// authenticated Contents API (drafts included). A write updates the article
// file then the index; rebuildIndex() regenerates the manifest from the files
// if the two ever drift.
import { BLOG } from "../config";
import { readPublicJson } from "../github/publicRead";
import { getFile, putFile, deleteFile, listDir, GithubError } from "../github/client";
import type { Article, ArticleMeta } from "../types";

const INDEX_PATH = "articles/index.json";
const articlePath = (slug: string) => `articles/${slug}.json`;

function toMeta(a: Article): ArticleMeta {
  return { slug: a.slug, title: a.title, date: a.date, published: a.published };
}

function sortIndex(index: ArticleMeta[]): ArticleMeta[] {
  // Most recent publication date first; tie-break by slug for stability.
  return [...index].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1,
  );
}

// ── Anonymous (public) reads ───────────────────────────────────────────────

export async function loadIndexPublic(): Promise<ArticleMeta[]> {
  const idx = await readPublicJson<ArticleMeta[]>(BLOG.owner, BLOG.repo, INDEX_PATH);
  return Array.isArray(idx) ? sortIndex(idx) : [];
}

export async function loadArticlePublic(slug: string): Promise<Article | null> {
  return readPublicJson<Article>(BLOG.owner, BLOG.repo, articlePath(slug));
}

// ── Authenticated (professor) reads + writes ───────────────────────────────

export interface LoadedIndex {
  index: ArticleMeta[];
  sha: string | null;
}

export async function loadIndexAuthed(pat: string): Promise<LoadedIndex> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH);
  if (!blob) return { index: [], sha: null };
  try {
    const idx = JSON.parse(blob.content) as ArticleMeta[];
    return { index: Array.isArray(idx) ? sortIndex(idx) : [], sha: blob.sha };
  } catch {
    return { index: [], sha: blob.sha };
  }
}

export interface LoadedArticle {
  article: Article;
  sha: string;
}

export async function loadArticleAuthed(
  pat: string,
  slug: string,
): Promise<LoadedArticle | null> {
  const blob = await getFile(pat, BLOG.owner, BLOG.repo, articlePath(slug));
  if (!blob) return null;
  try {
    return { article: JSON.parse(blob.content) as Article, sha: blob.sha };
  } catch {
    return null;
  }
}

async function putIndex(
  pat: string,
  index: ArticleMeta[],
  sha: string | null,
): Promise<string> {
  const content = JSON.stringify(index, null, 2);
  try {
    return (await putFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH, content, sha, "blog: mise à jour de l'index")).sha;
  } catch (e) {
    if (e instanceof GithubError && e.conflict) {
      const latest = await getFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH);
      return (await putFile(pat, BLOG.owner, BLOG.repo, INDEX_PATH, content, latest?.sha ?? null, "blog: mise à jour de l'index")).sha;
    }
    throw e;
  }
}

export interface SaveResult {
  articleSha: string;
  indexSha: string;
  index: ArticleMeta[];
}

/** Write the article file, then refresh the index manifest. */
export async function saveArticle(
  pat: string,
  article: Article,
  articleSha: string | null,
  index: ArticleMeta[],
  indexSha: string | null,
): Promise<SaveResult> {
  const res = await putFile(
    pat,
    BLOG.owner,
    BLOG.repo,
    articlePath(article.slug),
    JSON.stringify(article, null, 2),
    articleSha,
    `blog: enregistrement de « ${article.title} »`,
  );
  const nextIndex = sortIndex([
    ...index.filter((m) => m.slug !== article.slug),
    toMeta(article),
  ]);
  const newIndexSha = await putIndex(pat, nextIndex, indexSha);
  return { articleSha: res.sha, indexSha: newIndexSha, index: nextIndex };
}

export interface DeleteResult {
  indexSha: string;
  index: ArticleMeta[];
}

export async function deleteArticle(
  pat: string,
  slug: string,
  articleSha: string,
  index: ArticleMeta[],
  indexSha: string | null,
): Promise<DeleteResult> {
  await deleteFile(pat, BLOG.owner, BLOG.repo, articlePath(slug), articleSha, `blog: suppression de ${slug}`);
  const nextIndex = index.filter((m) => m.slug !== slug);
  const newIndexSha = await putIndex(pat, nextIndex, indexSha);
  return { indexSha: newIndexSha, index: nextIndex };
}

/** Regenerate index.json from the actual article files (drift recovery). */
export async function rebuildIndex(
  pat: string,
  indexSha: string | null,
): Promise<DeleteResult> {
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
  const nextIndex = sortIndex(metas);
  const newIndexSha = await putIndex(pat, nextIndex, indexSha);
  return { indexSha: newIndexSha, index: nextIndex };
}
