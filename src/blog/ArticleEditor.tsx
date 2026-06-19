import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
import { useAuth } from "../auth";
import {
  deleteArticle,
  loadArticleAuthed,
  loadIndexAuthed,
  saveArticle,
} from "./articlesRepo";
import { uniqueSlug } from "../lib/slug";
import { nowIso, todayInZone } from "../lib/dates";
import type { Article, ArticleMeta } from "../types";

export function ArticleEditor() {
  const { slug } = useParams();
  const editing = typeof slug === "string";
  const navigate = useNavigate();
  const { state } = useAuth();
  const pat = state.status === "unlocked" ? state.pat : null;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(() => todayInZone());
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);

  const [index, setIndex] = useState<ArticleMeta[]>([]);
  const [indexSha, setIndexSha] = useState<string | null>(null);
  const [articleSha, setArticleSha] = useState<string | null>(null);
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
        const idx = await loadIndexAuthed(pat);
        if (!alive) return;
        setIndex(idx.index);
        setIndexSha(idx.sha);
        if (editing && slug) {
          const loaded = await loadArticleAuthed(pat, slug);
          if (!alive) return;
          if (loaded) {
            setTitle(loaded.article.title);
            setDate(loaded.article.date);
            setBody(loaded.article.body);
            setPublished(loaded.article.published);
            setArticleSha(loaded.sha);
            setCreatedAt(loaded.article.createdAt);
          } else {
            setError("Article introuvable.");
          }
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pat, editing, slug]);

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const canSave = !saving && title.trim().length > 0 && validDate;

  const handleSave = useCallback(async () => {
    if (!pat || !canSave) return;
    setSaving(true);
    setError(null);
    try {
      const finalSlug =
        editing && slug ? slug : uniqueSlug(title, new Set(index.map((m) => m.slug)));
      const now = nowIso();
      const article: Article = {
        slug: finalSlug,
        title: title.trim(),
        date,
        body,
        published,
        createdAt: createdAt ?? now,
        modifiedAt: editing ? now : null,
      };
      await saveArticle(pat, article, articleSha, index, indexSha);
      navigate(`/blog/${finalSlug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'enregistrement.");
      setSaving(false);
    }
  }, [
    pat, canSave, editing, slug, title, date, body, published,
    createdAt, articleSha, index, indexSha, navigate,
  ]);

  const handleDelete = useCallback(async () => {
    if (!pat || !editing || !slug || !articleSha) return;
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteArticle(pat, slug, articleSha, index, indexSha);
      navigate("/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la suppression.");
      setSaving(false);
    }
  }, [pat, editing, slug, articleSha, index, indexSha, navigate]);

  if (!pat) return null; // route is guarded; defensive

  return (
    <section className="mx-auto max-w-2xl py-2">
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content/60 hover:text-content"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au blog
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-content">
        {editing ? "Éditer l'article" : "Nouvel article"}
      </h1>

      {loading ? (
        <p className="py-8 text-center text-sm text-content/40">Chargement…</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-content/60">Titre</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'article"
                className="w-full rounded border border-content/20 bg-content/5 px-3 py-2 text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-content/60">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-content/20 bg-content/5 px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm text-content">Publié (visible du public)</span>
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-content/60">
                Contenu <span className="text-content/40">(Markdown)</span>
              </span>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-content/60 hover:bg-content/5 hover:text-content"
              >
                {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {preview ? "Éditer" : "Aperçu"}
              </button>
            </div>
            {preview ? (
              <div className="markdown min-h-[16rem] rounded border border-content/20 bg-content/5 px-3 py-2 text-content/90">
                <ReactMarkdown>{body || "_(vide)_"}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                placeholder="Écrivez votre article en Markdown…"
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
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/blog"
                className="rounded-lg px-4 py-2 text-sm text-content/60 hover:text-content"
              >
                Annuler
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
