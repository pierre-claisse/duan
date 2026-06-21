// Non-secret configuration. Repo coordinates are public information (knowing a
// private repo's name grants nothing without the PAT), so they live here in
// plain text. Only the PAT itself is encrypted (see src/crypto/envelope.ts).

/** Public repo holding blog articles — read anonymously via raw.githubusercontent. */
export const BLOG = { owner: "pierre-claisse", repo: "duan-blog" } as const;

/** Private repo holding the calendar — read/written only with the PAT. */
export const CALENDAR = { owner: "pierre-claisse", repo: "duan-calendar" } as const;

/** Default branch of the data repos. */
export const BRANCH = "main";

/** The professor lives in Taipei; the calendar is shown in her local time. */
export const TZ = "Asia/Taipei";
