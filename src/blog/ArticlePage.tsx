import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Pencil, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { loadArticleEither, loadArticlePublic } from "./articlesRepo";
import type { Article } from "../types";

type Status = "loading" | "ok" | "notfound" | "error";

export function ArticlePage() {
  const { slug = "" } = useParams();
  const { state } = useAuth();
  const { t } = useI18n();
  const pat = state.status === "unlocked" ? state.pat : null;
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setArticle(null);
    setError(null);
    (async () => {
      try {
        // Anonymous visitors only read the public repo, so drafts (which live
        // in the private repo) are simply not found for them.
        const a = pat ? await loadArticleEither(pat, slug) : await loadArticlePublic(slug);
        if (!alive) return;
        if (!a) {
          setStatus("notfound");
          return;
        }
        setArticle(a);
        setStatus("ok");
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : t("common.loadFailed"));
        setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, pat, t]);

  return (
    <article className="py-2">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content/60 hover:text-content"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("article.back")}
      </Link>

      {status === "loading" && (
        <p className="py-8 text-center text-sm text-content/40">{t("common.loading")}</p>
      )}
      {status === "notfound" && (
        <p className="py-8 text-center text-sm text-content/40">{t("article.notFound")}</p>
      )}
      {status === "error" && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      {status === "ok" && article && (
        <>
          <header className="mb-6 border-b border-content/10 pb-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold text-content sm:text-3xl">{article.title}</h1>
              {pat && (
                <Link
                  to={`/editor/${article.slug}`}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-content/60 hover:bg-content/5 hover:text-content"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("common.edit")}
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-content/50">
              {article.date}
              {!article.published && (
                <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-300">
                  {t("blog.draft")}
                </span>
              )}
            </p>
          </header>
          <div className="markdown text-content/90">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </>
      )}
    </article>
  );
}
