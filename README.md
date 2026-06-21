# duan

Site web de 段 (cours particuliers) : **vitrine** et **blog**.
Application React déployée sur GitHub Pages, qui persiste ses données
gratuitement dans un dépôt GitHub via un *personal access token* chiffré —
aucun serveur. Modèle technique inspiré de `hanzi-ruby-lens` (sans la
réactivité temps réel webhooks/Cloudflare).

Live : https://pierre-claisse.github.io/duan/

## Langues

Interface en **mandarin de Taïwan (繁體中文)** par défaut, avec bascule
**中文 / English** via le sélecteur de la barre de navigation (choix mémorisé).
Les chaînes sont dans [`src/i18n/translations.ts`](src/i18n/translations.ts) ;
les dates sont formatées via `Intl` selon la locale.

## Sections

- **Accueil** (`/`) — vitrine (placeholder neutre pour l'instant).
- **Blog** (`/blog`, `/blog/:slug`) — public en lecture ; la prof, une fois
  connectée, rédige / édite / supprime les articles. Contenu en **Markdown**.

## Architecture des données

Deux dépôts GitHub :

| Dépôt | Visibilité | Contenu | Accès |
|---|---|---|---|
| `duan` | public | Code de l'app | — |
| `duan-blog` | **public** | `articles/<slug>.json` + `articles/index.json` | lecture anonyme (raw), écriture via PAT |

- Lecture publique du blog : `raw.githubusercontent.com` (anonyme, sans quota ;
  cache CDN ~5 min — un article tout juste publié peut n'apparaître qu'après ce
  court délai).
- Écriture et lecture authentifiée : **GitHub Contents API** avec le PAT (lecture
  du SHA puis `PUT`). Une seule éditrice ⇒ pas d'IndexedDB ni d'orchestrateur de
  conflits.
- **Authentification** : le PAT est chiffré (Argon2id + AES-GCM) dans
  `public/secrets.json`, généré au build par `scripts/build-secrets.mjs`. La prof
  saisit un mot de passe pour le déchiffrer ; le PAT reste en mémoire (jamais en
  localStorage, jamais en clair sur disque).

## Développement

```sh
npm install
npm run dev        # http://localhost:5173 — Accueil + Blog fonctionnent sans secrets
npm run typecheck  # tsc --noEmit
npm run build      # bundle de production dans dist/
```

Pour tester la **connexion prof** en local, générer le bundle de secrets
(gitignoré) :

```sh
SYNC_PAT='github_pat_…' SYNC_PASSWORD='…' node scripts/build-secrets.mjs
```

## Déploiement

Push sur `main` → GitHub Actions (`.github/workflows/deploy.yml`) :
`npm ci` → `node scripts/build-secrets.mjs` → `VITE_BASE=/duan/ npm run build`
→ déploiement Pages.

Secrets CI requis sur le dépôt `duan` : `SYNC_PAT`, `SYNC_PASSWORD`.
Les coordonnées du dépôt de données sont publiques et vivent dans
[`src/config.ts`](src/config.ts).
