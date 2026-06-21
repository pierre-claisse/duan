import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import {
  deleteArticle,
  loadArticleAuthed,
  loadIndexAuthed,
  saveArticle,
} from "./articlesRepo";
import { uniqueSlug } from "../lib/slug";
import { nowIso, todayInZone } from "../lib/dates";
import type { Article } from "../types";

export function ArticleEditor() {
  const { slug } = useParams();
  const editing = typeof slug === "string";
  const navigate = useNavigate();
  const { state } = useAuth();
  const { t } = useI18n();
  const pat = state.status === "unlocked" ? state.pat : null;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(() => todayInZone());
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  const [existingSlugs, setExistingSlugs] = useState<Set<string>>(new Set());
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pat) return;
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const index = await loadIndexAuthed(pat);
        if (!alive) return;
        setExistingSlugs(new Set(index.map((m) => m.slug)));
        if (editing && slug) {
          const article = await loadArticleAuthed(pat, slug);
          if (!alive) return;
          if (article) {
            setTitle(article.title);
            setDate(article.date);
            setBody(article.body);
            setCreatedAt(article.createdAt);
          } else {
            setError(t("editor.notFound"));
          }
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : t("common.loadFailed"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pat, editing, slug, t]);

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canSave = !saving && title.trim().length > 0 && validDate;

  const handleSave = useCallback(async () => {
    if (!pat || !canSave) return;
    setSaving(true);
    setError(null);
    try {
      const finalSlug = editing && slug ? slug : uniqueSlug(title, existingSlugs);
      const now = nowIso();
      const article: Article = {
        slug: finalSlug,
        title: title.trim(),
        date,
        body,
        createdAt: createdAt ?? now,
        modifiedAt: editing ? now : null,
      };
      await saveArticle(pat, article);
      navigate(`/blog/${finalSlug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.saveFailed"));
      setSaving(false);
    }
  }, [pat, canSave, editing, slug, title, date, body, createdAt, existingSlugs, navigate, t]);

  const handleDelete = useCallback(async () => {
    if (!pat || !editing || !slug) return;
    if (!window.confirm(t("editor.confirmDelete"))) return;
    setSaving(true);
    setError(null);
    try {
      await deleteArticle(pat, slug);
      navigate("/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.deleteFailed"));
      setSaving(false);
    }
  }, [pat, editing, slug, navigate, t]);

  if (!pat) return null; // route is guarded; defensive

  return (
    <section className="mx-auto max-w-2xl py-2">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content/60 hover:text-content"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("article.back")}
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-content">
        {editing ? t("editor.editTitle") : t("editor.newTitle")}
      </h1>

      {loading ? (
        <p className="py-8 text-center text-sm text-content/40">{t("common.loading")}</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-content/60">{t("editor.title")}</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("editor.titlePlaceholder")}
                className="w-full rounded border border-content/20 bg-content/5 px-3 py-2 text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-content/60">{t("editor.date")}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-content/20 bg-content/5 px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-content/60">{t("editor.content")}</span>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-content/60 hover:bg-content/5 hover:text-content"
              >
                {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {preview ? t("editor.editTab") : t("editor.preview")}
              </button>
            </div>
            {preview ? (
              <div className="markdown min-h-[16rem] rounded border border-content/20 bg-content/5 px-3 py-2 text-content/90">
                <ReactMarkdown>{body || `_${t("editor.empty")}_`}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                placeholder={t("editor.bodyPlaceholder")}
                className="w-full resize-y rounded border border-content/20 bg-content/5 px-3 py-2 font-mono text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
          )}

          <div className="flex items-center justify-between border-t border-content/10 pt-4">
            <div>
              {editing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/blog" className="rounded-lg px-4 py-2 text-sm text-content/60 hover:text-content">
                {t("common.cancel")}
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
