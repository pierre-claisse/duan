/** Turn an article title into a URL-safe slug (accents stripped, lowercased).
 *  Returns "" when the title has no Latin alphanumerics (e.g. a Chinese title);
 *  uniqueSlug() then synthesizes a short unique slug. */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A slug not already present in `existing`. Falls back to a short unique
 *  "post-…" id for non-Latin titles, and suffixes -2, -3, … on collision. */
export function uniqueSlug(title: string, existing: Set<string>): string {
  const base = slugify(title);
  if (!base) {
    let s = `post-${Date.now().toString(36)}`;
    while (existing.has(s)) s = `post-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
    return s;
  }
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
