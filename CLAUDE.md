# duan-yuting — Guidelines

## Stack

- React 19 + Vite 8 + TypeScript 5 (strict) + Tailwind 3.4.
- Routing: `react-router-dom` **HashRouter** (robust on GitHub Pages).
- Markdown: `react-markdown` (no raw HTML).
- Crypto: `@noble/hashes` (Argon2id) + WebCrypto (AES-GCM) for the encrypted PAT.
- i18n: tiny in-house provider ([src/i18n/](src/i18n/)). Default **zh-TW**
  (Traditional Chinese), switchable to **en**; choice persisted in localStorage.
  Strings in `translations.ts` (`zhTW` is typed against `en`'s keys, so a missing
  key fails the build). Dates via `Intl` per locale ([src/lib/dates.ts](src/lib/dates.ts)).
- No IndexedDB, no service worker, no backend. Single editor (the professor).

## Data model & persistence

- **Blog** ([src/blog/articlesRepo.ts](src/blog/articlesRepo.ts)): a post lives in
  exactly ONE place by state — **published** → public repo `articles/<slug>.json`
  (+ `articles/index.json`); **draft** → private repo `drafts/<slug>.json`
  (+ `drafts/index.json`). Toggling `published` moves the file between repos
  (`saveArticle` writes the target, then `removeFromPlace` clears the other), so
  drafts are never in the public repo. Anonymous reads via `raw.githubusercontent`
  ([src/github/publicRead.ts](src/github/publicRead.ts)); authed read/write via
  the Contents API ([src/github/client.ts](src/github/client.ts)).
  `rebuildIndexes()` regenerates both manifests from files if they drift.
- **Calendar** (private repo `duan-yuting-calendar`): single `sessions.json` array
  of `Lesson`. Read-modify-write the whole file ([src/calendar/lessonsRepo.ts](src/calendar/lessonsRepo.ts)).
  (This private repo doubles as the blog drafts store.)
- Repo coordinates are non-secret → [src/config.ts](src/config.ts). Only the PAT
  is encrypted, in `public/secrets.json` (built by
  [scripts/build-secrets.mjs](scripts/build-secrets.mjs), gitignored).
- Times are stored as entered, in the professor's timezone (**Asia/Taipei**); no
  UTC conversion. "Today"/defaults computed in `Asia/Taipei` ([src/lib/dates.ts](src/lib/dates.ts)).

## Auth

- App is **public by default**. `AuthProvider` holds `{status:"locked"}` until the
  professor signs in via the non-blocking `LoginScreen` (one password → decrypts
  the PAT → `{status:"unlocked", pat}`). Nothing persisted; reload returns to
  locked. `/editor*` and `/calendar` routes redirect to `/` when locked.

## Conventions

- Mobile-first responsive (unlike hanzi-ruby-lens, which is desktop-only). NavBar
  collapses < md; the calendar is a month grid + day panel (stacked on mobile, side-by-side
  ≥ md); dialogs are bottom-sheet on mobile.
- Neutral wireframe palette: CSS vars `surface`/`content`/`accent`, dark mode via
  `<html class="dark">` (toggle in NavBar, synchronous boot script in index.html).
- UI strings come from i18n (`t("…")`); never hardcode user-facing text. Default
  locale zh-TW — write idiomatic Traditional Chinese + English, not literal
  translations. Code/comments in English.
- Conflicts (409/422) are rare (single editor): repos re-read the SHA and retry
  once (see `persistLessons`, `writeIndex`).

## Commands

```sh
npm run dev | npm run build | npm run typecheck
SYNC_PAT=… SYNC_PASSWORD=… node scripts/build-secrets.mjs   # local secrets bundle
```
