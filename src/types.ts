// Domain types shared across the app.

/** A blog article. Stored as `articles/<slug>.json` in the public blog repo. */
export interface Article {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD" publication date
  body: string; // markdown
  createdAt: string;
  modifiedAt: string | null;
}

/** Lightweight entry in `articles/index.json` — renders the list without
 *  downloading every article body. */
export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
}
