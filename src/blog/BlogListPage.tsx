import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "../auth";
import {
  loadIndexAuthed,
  loadIndexPublic,
  rebuildIndex,
} from "./articlesRepo";
import type { ArticleMeta } from "../types";

export function BlogListPage() {
  const { state } = useAuth();
  const pat = state.status === "unlocked" ? state.pat : null;
  const [items, setItems] = useState<ArticleMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError(null);
    (async () => {
      try {
        const index = pat
          ? (await loadIndexAuthed(pat)).index
          : await loadIndexPublic();
        const visible = pat ? index : index.filter((m) => m.published);
        if (alive) setItems(visible);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Erreur de chargement.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [pat]);

  const handleRebuild = useCallback(async () => {
    if (!pat) return;
    setRebuilding(true);
    setError(null);
    try {
      const { sha } = await loadIndexAuthed(pat);
      const res = await rebuildIndex(pat, sha);
      setItems(res.index.filter((m) => pat || m.published));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la reconstruction.");
    } finally {
      setRebuilding(false);
    }
  }, [pat]);

  return (
    <section className="py-2">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-content">Blog</h1>
        {pat && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRebuild}
              disabled={rebuilding}
              title="Régénérer l'index à partir des fichiers d'articles"
              className="inline-flex items-center gap-1.5 rounded-lg border border-content/20 px-3 py-2 text-sm text-content/70 hover:bg-content/5 disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${rebuilding ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Reconstruire l'index</span>
            </button>
            <Link
              to="/editor"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </Link>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {items === null && !error && (
        <p className="py-8 text-center text-sm text-content/40">Chargement…</p>
      )}

      {items && items.length === 0 && (
        <p className="py-8 text-center text-sm text-content/40">
          Aucun article pour le moment.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((m) => (
            <li
              key={m.slug}
              className="rounded-lg border border-content/10 p-4 transition-colors hover:border-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/blog/${m.slug}`}
                    className="block truncate text-lg font-medium text-content hover:text-accent"
                  >
                    {m.title}
                  </Link>
                  <p className="mt-1 text-xs text-content/50">
                    {m.date}
                    {!m.published && (
                      <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-300">
                        brouillon
                      </span>
                    )}
                  </p>
                </div>
                {pat && (
                  <Link
                    to={`/editor/${m.slug}`}
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-content/60 hover:bg-content/5 hover:text-content"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Éditer
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
