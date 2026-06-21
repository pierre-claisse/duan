import { useState } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoginScreen, useAuth } from "./auth";
import { useI18n } from "./i18n";
import { NavBar } from "./components/NavBar";
import { HomePage } from "./pages/HomePage";
import { BlogListPage } from "./blog/BlogListPage";
import { ArticlePage } from "./blog/ArticlePage";
import { ArticleEditor } from "./blog/ArticleEditor";

// Inner pages (Blog, editor) keep the centered column; the Home landing page is
// full-bleed and brings its own footer, so it renders edge-to-edge. The top nav
// is fixed (out of flow), so inner pages add top padding to clear it — Home's
// hero supplies its own clearance.
function Contained({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-24">{children}</div>;
}

function Shell() {
  const { state } = useAuth();
  const { t } = useI18n();
  const unlocked = state.status === "unlocked";
  const [loginOpen, setLoginOpen] = useState(false);
  const isHome = useLocation().pathname === "/";

  return (
    <div className="flex min-h-full flex-col">
      <NavBar onLoginClick={() => setLoginOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<Contained><BlogListPage /></Contained>} />
          <Route path="/blog/:slug" element={<Contained><ArticlePage /></Contained>} />
          {/* The editor is professor-only; anonymous URLs redirect home. */}
          <Route
            path="/editor"
            element={unlocked ? <Contained><ArticleEditor /></Contained> : <Navigate to="/" replace />}
          />
          <Route
            path="/editor/:slug"
            element={unlocked ? <Contained><ArticleEditor /></Contained> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* Home brings its own footer; other pages get the minimal shared one. */}
      {!isHome && (
        <footer className="border-t border-content/10 py-6 text-center text-xs text-content/40">
          {t("brand")}
        </footer>
      )}
      {loginOpen && <LoginScreen onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

export default function App() {
  // `BASE_URL` is "/duan/" in the GitHub Pages build and "/" locally, so links
  // resolve correctly under the project subpath without the "#" hash prefix.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Shell />
    </BrowserRouter>
  );
}
