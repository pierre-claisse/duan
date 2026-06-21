// Non-secret configuration. Repo coordinates are public information (knowing a
// repo's name grants nothing without the PAT), so they live here in plain text.
// Only the PAT itself is encrypted (see src/crypto/envelope.ts).

/** Public repo holding blog articles — read anonymously via raw.githubusercontent,
 *  written with the PAT. The only data repo. */
export const BLOG = { owner: "pierre-claisse", repo: "duan-blog" } as const;

/** Default branch of the data repo. */
export const BRANCH = "main";

/** The professor lives in Taipei; dates default to her local time. */
export const TZ = "Asia/Taipei";
