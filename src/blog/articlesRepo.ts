// Blog persistence with TRUE draft privacy.
//
//   Published posts → PUBLIC blog repo:   articles/<slug>.json + articles/index.json
//   Drafts          → PRIVATE agenda repo: drafts/<slug>.json  + drafts/index.json
//
// A post lives in exactly ONE place at a time. Toggling `published` moves the
// file (and its index entry) between the two repos, so a draft is never present
// in the public repo and is unreachable by raw URL. (The fine-grained PAT only
// has access to these two repos, so the private agenda repo doubles as the
// drafts store.)
//
// Anonymous visitors read the public repo via raw.githubusercontent; the
// professor (signed in) reads/writes both via the authenticated Contents API.
import { AGENDA, BLOG } from "../config";
import { readPublicJson } from "../github/publicRead";
import { getFile, putFile, deleteFile, listDir, GithubError } from "../github/client";
import type { Article, ArticleMeta } from "../types";

interface Place {
  owner: string;
  repo: string;
  dir: string;
  indexPath: string;
}

const PUBLISHED: Place = { ...BLOG, dir: "articles", indexPath: "articles/index.json" };
const DRAFT: Place = { ...AGENDA, dir: "drafts", indexPath: "drafts/index.json" };

const articlePath = (place: Place, slug: string) => `${place.dir}/${slug}.json`;
const placeFor = (published: boolean) => (published ? PUBLISHED : DRAFT);
const otherPlace = (published: boolean) => (published ? DRAFT : PUBLISHED);

function toMeta(a: Article): ArticleMeta {
  return { slug: a.slug, title: a.title, date: a.date, published: a.published };
}

function sortByDateDesc(index: ArticleMeta[]): ArticleMeta[] {
  return [...index].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1,
  );
}

async function readIndex(
  pat: string,
  place: Place,
): Promise<{ list: ArticleMeta[]; sha: string | null }> {
  const blob = await getFile(pat, place.owner, place.repo, place.indexPath);
  if (!blob) return { list: [], sha: null };
  try {
    const list = JSON.parse(blob.content) as ArticleMeta[];
    return { list: Array.isArray(list) ? list : [], sha: blob.sha };
  } catch {
    return { list: [], sha: blob.sha };
  }
}

async function writeIndex(
  pat: string,
  place: Place,
  list: ArticleMeta[],
  sha: string | null,
): Promise<void> {
  const content = JSON.stringify(list, null, 2);
  try {
    await putFile(pat, place.owner, place.repo, place.indexPath, content, sha, "blog: mise à jour de l'index");
  } catch (e) {
    if (e instanceof GithubError && e.conflict) {
      const latest = await getFile(pat, place.owner, place.repo, place.indexPath);
      await putFile(pat, place.owner, place.repo, place.indexPath, content, latest?.sha ?? null, "blog: mise à jour de l'index");
      return;
    }
    throw e;
  }
}

async function removeFromPlace(pat: string, place: Place, slug: string): Promise<void> {
  const blob = await getFile(pat, place.owner, place.repo, articlePath(place, slug));
  if (blob) {
    await deleteFile(pat, place.owner, place.repo, articlePath(place, slug), blob.sha, `blog: retrait de ${slug}`);
  }
  const idx = await readIndex(pat, place);
  if (idx.list.some((m) => m.slug === slug)) {
    await writeIndex(pat, place, idx.list.filter((m) => m.slug !== slug), idx.sha);
  }
}

// ── Anonymous (public) reads ───────────────────────────────────────────────

export async function loadIndexPublic(): Promise<ArticleMeta[]> {
  const idx = await readPublicJson<ArticleMeta[]>(PUBLISHED.owner, PUBLISHED.repo, PUBLISHED.indexPath);
  return Array.isArray(idx) ? sortByDateDesc(idx) : [];
}

export async function loadArticlePublic(slug: string): Promise<Article | null> {
  return readPublicJson<Article>(PUBLISHED.owner, PUBLISHED.repo, articlePath(PUBLISHED, slug));
}

// ── Authenticated (professor) reads ────────────────────────────────────────

/** Merged list for the professor: published posts + private drafts. */
export async function loadProfIndex(pat: string): Promise<ArticleMeta[]> {
  const [pub, draft] = await Promise.all([readIndex(pat, PUBLISHED), readIndex(pat, DRAFT)]);
  return sortByDateDesc([...draft.list, ...pub.list]);
}

/** Load a single post by slug, looking in the public repo then the drafts. */
export async function loadArticleEither(pat: string, slug: string): Promise<Article | null> {
  for (const place of [PUBLISHED, DRAFT]) {
    const blob = await getFile(pat, place.owner, place.repo, articlePath(place, slug));
    if (blob) {
      try {
        return JSON.parse(blob.content) as Article;
      } catch {
        return null;
      }
    }
  }
  return null;
}

// ── Authenticated (professor) writes ───────────────────────────────────────

/** Write a post to the place matching its `published` flag, and remove any copy
 *  from the other place (handles publish ⇄ unpublish moves). */
export async function saveArticle(pat: string, article: Article): Promise<void> {
  const target = placeFor(article.published);
  const existing = await getFile(pat, target.owner, target.repo, articlePath(target, article.slug));
  await putFile(
    pat,
    target.owner,
    target.repo,
    articlePath(target, article.slug),
    JSON.stringify(article, null, 2),
    existing?.sha ?? null,
    `blog: enregistrement de « ${article.title} »`,
  );
  const idx = await readIndex(pat, target);
  const next = sortByDateDesc([...idx.list.filter((m) => m.slug !== article.slug), toMeta(article)]);
  await writeIndex(pat, target, next, idx.sha);
  await removeFromPlace(pat, otherPlace(article.published), article.slug);
}

/** Delete a post from wherever it lives (both places, idempotently). */
export async function deleteArticle(pat: string, slug: string): Promise<void> {
  await removeFromPlace(pat, PUBLISHED, slug);
  await removeFromPlace(pat, DRAFT, slug);
}

/** Regenerate both index manifests from the actual files (drift recovery). */
export async function rebuildIndexes(pat: string): Promise<void> {
  for (const place of [PUBLISHED, DRAFT]) {
    const entries = await listDir(pat, place.owner, place.repo, place.dir);
    const metas: ArticleMeta[] = [];
    for (const e of entries) {
      if (e.type !== "file" || !e.name.endsWith(".json") || e.name === "index.json") continue;
      const blob = await getFile(pat, place.owner, place.repo, e.path);
      if (!blob) continue;
      try {
        metas.push(toMeta(JSON.parse(blob.content) as Article));
      } catch {
        /* skip malformed file */
      }
    }
    const idx = await readIndex(pat, place);
    await writeIndex(pat, place, sortByDateDesc(metas), idx.sha);
  }
}
