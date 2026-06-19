# tuan-yuting — Guidelines

## Stack

- React 19 + Vite 7 + TypeScript 5 (strict) + Tailwind 3.4.
- Routing: `react-router-dom` **HashRouter** (robust on GitHub Pages).
- Markdown: `react-markdown` (no raw HTML).
- Crypto: `@noble/hashes` (Argon2id) + WebCrypto (AES-GCM) for the encrypted PAT.
- No IndexedDB, no service worker, no backend. Single editor (the professor).

## Data model & persistence

- **Blog** (public repo `tuan-yuting-blog`): `articles/<slug>.json` (full
  `Article`) + `articles/index.json` (`ArticleMeta[]` manifest). Anonymous reads
  via `raw.githubusercontent` ([src/github/publicRead.ts](src/github/publicRead.ts));
  authenticated writes via the Contents API ([src/github/client.ts](src/github/client.ts)).
  A write updates the article file then the index; `rebuildIndex()` regenerates
  the manifest from files if they drift.
- **Agenda** (private repo `tuan-yuting-agenda`): single `sessions.json` array of
  `Lesson`. Read-modify-write the whole file ([src/agenda/lessonsRepo.ts](src/agenda/lessonsRepo.ts)).
- Repo coordinates are non-secret → [src/config.ts](src/config.ts). Only the PAT
  is encrypted, in `public/secrets.json` (built by
  [scripts/build-secrets.mjs](scripts/build-secrets.mjs), gitignored).
- Times are stored as entered, in the professor's timezone (**Asia/Taipei**); no
  UTC conversion. "Today"/defaults computed in `Asia/Taipei` ([src/lib/dates.ts](src/lib/dates.ts)).

## Auth

- App is **public by default**. `AuthProvider` holds `{status:"locked"}` until the
  professor signs in via the non-blocking `LoginScreen` (one password → decrypts
  the PAT → `{status:"unlocked", pat}`). Nothing persisted; reload returns to
  locked. `/editor*` and `/agenda` routes redirect to `/` when locked.

## Conventions

- Mobile-first responsive (unlike hanzi-ruby-lens, which is desktop-only). NavBar
  collapses < md; agenda is calendar + day panel (stacked on mobile, side-by-side
  ≥ md); dialogs are bottom-sheet on mobile.
- Neutral wireframe palette: CSS vars `surface`/`content`/`accent`, dark mode via
  `<html class="dark">` (toggle in NavBar, synchronous boot script in index.html).
- UI text in French; code/comments in English.
- Conflicts (409/422) are rare (single editor): repos re-read the SHA and retry
  once (see `persistLessons`, `putIndex`).

## Known limitation

Drafts live in the public blog repo: hidden in-app but reachable by raw URL if
the slug is known. True draft privacy would require storing them in a private
repo.

## Commands

```sh
npm run dev | npm run build | npm run typecheck
SYNC_PAT=… SYNC_PASSWORD=… node scripts/build-secrets.mjs   # local secrets bundle
```
