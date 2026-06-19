# tuan-yuting

Site web de 段予婷 (cours particuliers) : **vitrine**, **agenda** et **blog**.
Application React déployée sur GitHub Pages, qui persiste ses données
gratuitement dans des dépôts GitHub via un *personal access token* chiffré —
aucun serveur. Modèle technique inspiré de `hanzi-ruby-lens` (sans la
réactivité temps réel webhooks/Cloudflare).

Live : https://pierre-claisse.github.io/tuan-yuting/

## Sections

- **Accueil** (`/`) — vitrine (placeholder neutre pour l'instant).
- **Blog** (`/blog`, `/blog/:slug`) — public en lecture ; la prof rédige/édite
  une fois connectée. Articles en **Markdown**.
- **Agenda** (`/agenda`) — **privé**, visible uniquement par la prof connectée
  (cours particuliers qu'elle saisit elle-même). Un visiteur anonyme ne voit pas
  le lien et l'URL directe redirige vers l'accueil.

## Architecture des données

Trois dépôts GitHub :

| Dépôt | Visibilité | Contenu | Accès |
|---|---|---|---|
| `tuan-yuting` | public | Code de l'app | — |
| `tuan-yuting-blog` | **public** | `articles/<slug>.json` + `articles/index.json` | lecture anonyme (raw), écriture via PAT |
| `tuan-yuting-agenda` | **privé** | `sessions.json` (tableau de cours) | lecture/écriture via PAT |

- Lecture publique du blog : `raw.githubusercontent.com` (anonyme, sans quota).
- Écriture (blog + agenda) et lecture de l'agenda : **GitHub Contents API** avec
  le PAT (lecture du SHA puis `PUT`). Une seule éditrice ⇒ pas d'IndexedDB ni
  d'orchestrateur de conflits.
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
`npm ci` → `node scripts/build-secrets.mjs` → `VITE_BASE=/tuan-yuting/ npm run build`
→ déploiement Pages.

Secrets CI requis sur le dépôt `tuan-yuting` : `SYNC_PAT`, `SYNC_PASSWORD`.
Les coordonnées des dépôts de données sont publiques et vivent dans
[`src/config.ts`](src/config.ts).

## Limite connue : brouillons

Le dépôt du blog est **public**. Un article en brouillon (`published: false`) est
**masqué** dans l'app (liste publique filtrée, lecture anonyme refusée), mais son
fichier `articles/<slug>.json` reste techniquement accessible par URL brute à qui
connaît le slug. Pour une vraie confidentialité des brouillons, il faudrait les
stocker dans le dépôt privé (évolution possible).
