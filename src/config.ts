// Non-secret configuration. Repo coordinates are public information (knowing a
// private repo's name grants nothing without the PAT), so they live here in
// plain text. Only the PAT itself is encrypted (see src/crypto/envelope.ts).

/** Public repo holding blog articles — read anonymously via raw.githubusercontent. */
export const BLOG = { owner: "pierre-claisse", repo: "tuan-yuting-blog" } as const;

/** Private repo holding the agenda — read/written only with the PAT. */
export const AGENDA = { owner: "pierre-claisse", repo: "tuan-yuting-agenda" } as const;

/** Default branch of the data repos. */
export const BRANCH = "main";

/** The professor lives in Taipei; the agenda is shown in her local time. */
export const TZ = "Asia/Taipei";

/** Placeholder site name (wording not finalised). */
export const SITE_NAME = "Tuan Yuting";
