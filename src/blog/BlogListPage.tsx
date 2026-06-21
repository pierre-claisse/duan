import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { loadIndexPublic, loadIndexAuthed } from "./articlesRepo";
import type { ArticleMeta } from "../types";

export function BlogListPage() {
  const { state } = useAuth();
  const { t } = useI18n();
  const pat = state.status === "unlocked" ? state.pat : null;
  const [items, setItems] = useState<ArticleMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError(null);
    (async () => {
      try {
        const index = pat ? await loadIndexAuthed(pat) : await loadIndexPublic();
        if (alive) setItems(index);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : t("common.loadFailed"));
      }
    })();
    return () => {
      alive = false;
    };
  }, [pat, t]);

  return (
    <section className="py-2">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-content">{t("blog.title")}</h1>
        {pat && (
          <Link
            to="/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t("blog.newPost")}
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      {items === null && !error && (
        <p className="py-8 text-center text-sm text-content/40">{t("common.loading")}</p>
      )}

      {items && items.length === 0 && (
        <p className="py-8 text-center text-sm text-content/40">{t("blog.empty")}</p>
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
                  <p className="mt-1 text-xs text-content/50">{m.date}</p>
                </div>
                {pat && (
                  <Link
                    to={`/editor/${m.slug}`}
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-content/60 hover:bg-content/5 hover:text-content"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("common.edit")}
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
