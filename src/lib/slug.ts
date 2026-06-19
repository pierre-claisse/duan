/** Turn an article title into a URL-safe slug (accents stripped, lowercased). */
export function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "article";
}

/** A slug not already present in `existing`, suffixing -2, -3, … on collision. */
export function uniqueSlug(title: string, existing: Set<string>): string {
  const base = slugify(title);
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
